import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      throw new Error("No autorizado");
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
      id,
      nombre,
      apellido,
      email,
      password,
      cargo,
      rubro,
      jornada_inicio,
      jornada_fin,
    } = await req.json();

    const authUpdate: {
      email: string;
      password?: string;
    } = {
      email,
    };

    if (password && password.trim() !== "") {
      authUpdate.password = password;
    }

    const { error: authError } =
      await supabase.auth.admin.updateUserById(
        id,
        authUpdate
      );

    if (authError) throw authError;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        nombre,
        apellido,
        email,
        rubro,
        cargo,
        jornada_inicio,
        jornada_fin,
      })
      .eq("id", id);

    if (profileError) throw profileError;

    return new Response(
      JSON.stringify({
        success: true,
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
        error: err instanceof Error ? err.message : "Error interno",
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
});