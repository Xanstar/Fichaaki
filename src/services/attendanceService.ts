import { supabase } from "./supabase";

export async function getTodayAttendance(employeeId: string) {
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Argentina/Buenos_Aires",
}).format(new Date());

  const { data, error } = await supabase
    .from("attendance_records")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("fecha", today)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function getAttendanceHistory(employeeId: string) {
  const { data, error } = await supabase
    .from("attendance_records")
    .select("*")
    .eq("employee_id", employeeId)
    .order("fecha", { ascending: false });

  if (error) throw error;

  return data;
}

export async function checkIn(data: {
  lat: number;
  lng: number;
}) {
  const { data: result, error } = await supabase.functions.invoke(
    "check-in",
    {
      body: {
        lat: data.lat,
        lng: data.lng,
      },
    }
  );

  if (error) {
    console.error(error);

    try {
      const details = await error.context.json();
      console.error(details);
      throw new Error(details.error);
    } catch {
      throw error;
    }
  }

  return result.attendance;
}

export async function checkOut(data: {
  lat: number;
  lng: number;
}) {
  const { data: result, error } = await supabase.functions.invoke(
    "check-out",
    {
      body: {
        lat: data.lat,
        lng: data.lng,
      },
    }
  );

  if (error) {
    console.error(error);

    try {
      const details = await error.context.json();
      console.error(details);
      throw new Error(details.error);
    } catch {
      throw error;
    }
  }

console.log("RESULTADO EDGE:", result);

return result.attendance;
}