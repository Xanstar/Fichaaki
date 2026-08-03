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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Crear usuario en Authentication
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      console.log("========== CREATE USER ==========");
console.log(authData);
console.log(authError);
console.log("USER:", authData?.user);
console.log("USER ID:", authData?.user?.id);
console.log("EMAIL:", authData?.user?.email);
console.log("===============================");

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

    console.log("INSERTANDO PROFILE CON ID:", authData.user.id);

    // Crear perfil
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