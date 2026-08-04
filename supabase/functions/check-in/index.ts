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

    const { data: existing } = await supabase
      .from("attendance_records")
      .select("id")
      .eq("employee_id", user.id)
      .eq("fecha", today)
      .maybeSingle();

    if (existing) {
      return json(400, { success: false, error: "Ya registraste tu entrada hoy." });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, nombre, jornada_inicio, sucursal_id, pin")
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

    const argentinaNow = new Intl.DateTimeFormat("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);

    const [currentHour, currentMinute] = argentinaNow.split(":").map(Number);
    const currentMinutes = currentHour * 60 + currentMinute;
    const [hour, minute] = profile.jornada_inicio.split(":").map(Number);
    const scheduleMinutes = hour * 60 + minute;
    const minutesLate = Math.max(0, currentMinutes - scheduleMinutes);
    const isLate = minutesLate > 0;

    const { data: inserted, error } = await supabase
      .from("attendance_records")
      .insert({
        employee_id: user.id,
        fecha: today,
        entrada_at: now.toISOString(),
        entrada_lat: effectiveLat,
        entrada_lng: effectiveLng,
        entrada_direccion: direccion ?? null,
        observacion: observacion || null,
        estado: "trabajando",
        llegada_tarde: isLate,
        minutos_tarde: minutesLate,
      })
      .select("id")
      .single();

    if (error) {
      return json(400, { success: false, error: error.message });
    }

    if (isLate) {
      await supabase.from("notificaciones").insert({
        employee_id: user.id,
        tipo: "tardanza",
        mensaje: `${profile.nombre} llegó tarde (${minutesLate} min).`,
      });
    }

    const { data, error: selectError } = await supabase
      .from("attendance_records")
      .select("*")
      .eq("id", inserted.id)
      .single();

    if (selectError) {
      return json(400, { success: false, error: selectError.message });
    }

    return json(200, {
      success: true,
      attendance: data,
      server_now: now.toISOString(),
      geofence,
    });
  } catch (err) {
    return json(500, {
      success: false,
      error: err instanceof Error ? err.message : "Internal error",
    });
  }
});
