import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Respuesta al preflight (CORS)
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
          error: "No autorizado",
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
      data: { user: caller },
      error: callerError,
    } = await supabase.auth.getUser(token);

    if (callerError || !caller) {
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

    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("rol")
      .eq("id", caller.id)
      .single();

    if (callerProfile?.rol !== "admin") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No tenés permisos de administrador.",
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const {
      nombre,
      apellido,
      email,
      password,
      cargo,
      rubro,
      jornada_inicio,
      jornada_fin,
    } = await req.json();

    if (!nombre || !apellido || !email || !password || !cargo || !jornada_inicio || !jornada_fin) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Faltan campos obligatorios.",
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

    // Crear usuario en Authentication
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: authError.message,
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

    // El trigger handle_new_user ya creó el perfil; completamos sus datos
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        nombre,
        apellido,
        email,
        rol: "employee",
        cargo,
        rubro,
        jornada_inicio,
        jornada_fin,
        activo: true,
      })
      .eq("id", authData.user.id);

    if (profileError) {
      // Si falla el perfil, eliminar el usuario
      await supabase.auth.admin.deleteUser(authData.user.id);

      return new Response(
        JSON.stringify({
          success: false,
          error: profileError.message,
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
        user: authData.user,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error(err);

    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Error interno",
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