import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
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
      return new Response(
        JSON.stringify({
          success: false,
          error: "Usuario no autenticado",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { lat, lng, direccion } = await req.json();

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
      return new Response(
        JSON.stringify({
          success: false,
          error: "Ya registraste tu entrada hoy.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("jornada_inicio")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Perfil no encontrado.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

const now = new Date();

const argentinaNow = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
}).format(now);

const [currentHour, currentMinute] = argentinaNow
  .split(":")
  .map(Number);

const currentMinutes = currentHour * 60 + currentMinute;

const [hour, minute] = profile.jornada_inicio
  .split(":")
  .map(Number);

const scheduleMinutes = hour * 60 + minute;

const minutesLate = Math.max(
  0,
  currentMinutes - scheduleMinutes
);

const isLate = minutesLate > 0;

const { data: inserted, error } = await supabase
  .from("attendance_records")
  .insert({
    employee_id: user.id,
    fecha: today,
    entrada_at: now.toISOString(),
    entrada_lat: lat,
    entrada_lng: lng,
    entrada_direccion: direccion ?? null,
    estado: "trabajando",
    llegada_tarde: isLate,
    minutos_tarde: minutesLate,
  })
  .select("id")
  .single();

if (error) {
  return new Response(
    JSON.stringify({
      success: false,
      error: error.message,
    }),
    {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}

const { data, error: selectError } = await supabase
  .from("attendance_records")
  .select("*")
  .eq("id", inserted.id)
  .single();

if (selectError) {
  return new Response(
    JSON.stringify({
      success: false,
      error: selectError.message,
    }),
    {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}

return new Response(
  JSON.stringify({
    success: true,
    attendance: data,
    server_now: now.toISOString(),
  }),
  {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  }
);
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Internal error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});