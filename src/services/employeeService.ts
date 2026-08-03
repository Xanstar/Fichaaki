import { supabase } from "./supabase";

export async function getEmployees() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("rol", "employee")
    .order("nombre", { ascending: true });

  if (error) throw error;

  return data;
}

export async function createEmployee(data: {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  cargo: string;
  rubro: string;
  jornada_inicio: string;
  jornada_fin: string;
}) {
  const { data: result, error } = await supabase.functions.invoke(
    "create-employee",
    {
      body: data,
    }
  );

  if (error) {
    console.error(error);

    try {
      const details = await error.context.json();
      throw new Error(details.error);
    } catch {
      throw error;
    }
  }

  return result;
}

export async function updateEmployee(data: {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  cargo: string;
  rubro: string;
  jornada_inicio: string;
  jornada_fin: string;
}) {
  const { data: result, error } = await supabase.functions.invoke(
    "update-employee",
    {
      body: data,
    }
  );

  if (error) {
    console.error(error);

    try {
      const details = await error.context.json();
      throw new Error(details.error);
    } catch {
      throw error;
    }
  }

  return result;
}

export async function deleteEmployee(id: string) {
  const { data: result, error } = await supabase.functions.invoke(
    "delete-employee",
    {
      body: {
        id,
      },
    }
  );

  if (error) {
    console.error(error);

    try {
      const details = await error.context.json();
      throw new Error(details.error);
    } catch {
      throw error;
    }
  }

  return result;
}