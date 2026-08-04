import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  const json = (status: number, body: Record<string, unknown>) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return json(401, { success: false, error: "Unauthorized" });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return json(401, { success: false, error: "Usuario no autenticado" });
    }

    const { lat, lng, direccion, observacion, codigoSucursal, pin } = await req.json();

    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Argentina/Buenos_Aires",
    }).format(new Date());

    const { data: attendance, error: attendanceError } = await supabase
      .from("attendance_records")
      .select("*")
      .eq("employee_id", user.id)
      .eq("fecha", today)
      .eq("estado", "trabajando")
      .single();

    if (attendanceError || !attendance) {
      return json(400, { success: false, error: "No existe una jornada abierta." });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, nombre, jornada_fin, sucursal_id, pin")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return json(400, { success: false, error: "Perfil no encontrado." });
    }

    // Resolución de ubicación: modo QR/PIN (codigoSucursal) o modo GPS.
    let effectiveLat = lat;
    let effectiveLng = lng;
    let geofence = "gps";

    if (codigoSucursal) {
      const { data: sucursal } = await supabase
        .from("sucursales")
        .select("id, nombre, lat, lng, radio_m")
        .eq("codigo", codigoSucursal)
        .eq("activo", true)
        .maybeSingle();

      if (!sucursal) {
        return json(400, { success: false, error: "Código de sucursal no válido." });
      }

      if (profile.sucursal_id && profile.sucursal_id !== sucursal.id) {
        return json(400, { success: false, error: "No estás asignado a esa sucursal." });
      }

      if (!sucursal.lat || !sucursal.lng) {
        return json(400, { success: false, error: "Esa sucursal no tiene ubicación configurada." });
      }

      if (pin) {
        if (!profile.pin) {
          return json(400, { success: false, error: "Tu usuario no tiene PIN asignado." });
        }
        if (pin !== profile.pin) {
          return json(400, { success: false, error: "PIN incorrecto." });
        }
      }

      effectiveLat = Number(sucursal.lat);
      effectiveLng = Number(sucursal.lng);
      geofence = "sucursal";
    } else {
      if (lat === undefined || lng === undefined || lat === null || lng === null) {
        return json(400, {
          success: false,
          error: "No se pudo obtener tu ubicación. Activa el GPS o usa el código de tu sucursal.",
        });
      }

      if (profile.sucursal_id) {
        const { data: sucursal } = await supabase
          .from("sucursales")
          .select("lat, lng, radio_m")
          .eq("id", profile.sucursal_id)
          .maybeSingle();

        if (sucursal && sucursal.lat && sucursal.lng) {
          const distance = haversineMeters(
            Number(lat),
            Number(lng),
            Number(sucursal.lat),
            Number(sucursal.lng)
          );
          const radio = sucursal.radio_m ?? 200;
          if (distance > radio) {
            return json(400, {
              success: false,
              error: `Estás fuera del radio permitido (${Math.round(distance)}m / ${radio}m).`,
            });
          }
        }
      }
    }

    const now = new Date();
    const nowISO = now.toISOString();

    const horasTrabajadas =
      (now.getTime() - new Date(attendance.entrada_at).getTime()) / 1000 / 60 / 60;

    // Horas extra: salida posterior al fin de jornada.
    let horasExtra = 0;
    if (profile.jornada_fin) {
      const [finHour, finMinute] = profile.jornada_fin.split(":").map(Number);
      const finMinutes = finHour * 60 + finMinute;

      const argentinaNow = new Intl.DateTimeFormat("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now);
      const [currHour, currMinute] = argentinaNow.split(":").map(Number);
      const currMinutes = currHour * 60 + currMinute;

      if (currMinutes > finMinutes) {
        horasExtra = Number(((currMinutes - finMinutes) / 60).toFixed(2));
        if (horasExtra > 12) horasExtra = 0;
      }
    }

    const { data, error } = await supabase
      .from("attendance_records")
      .update({
        salida_at: nowISO,
        salida_lat: effectiveLat,
        salida_lng: effectiveLng,
        salida_direccion: direccion ?? null,
        horas_trabajadas: Number(horasTrabajadas.toFixed(2)),
        horas_extra: horasExtra || null,
        observacion: attendance.observacion || observacion || null,
        estado: "finalizada",
      })
      .eq("id", attendance.id)
      .select()
      .single();

    if (error) {
      return json(400, { success: false, error: error.message });
    }

    if (horasExtra > 0) {
      await supabase.from("notificaciones").insert({
        employee_id: user.id,
        tipo: "extra",
        mensaje: `${profile.nombre} hizo ${horasExtra} h extras.`,
      });
    }

    return json(200, {
      success: true,
      attendance: data,
      geofence,
    });
  } catch (err) {
    return json(500, {
      success: false,
      error: err instanceof Error ? err.message : "Internal error",
    });
  }
});
