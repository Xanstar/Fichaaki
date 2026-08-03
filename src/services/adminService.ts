import { supabase } from "./supabase";

function argentinaToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());
}

export async function getAdminAttendance() {
  return getAttendanceByPeriod(
    argentinaToday(),
    argentinaToday()
  );
}

export async function getAttendanceByPeriod(
  start: string,
  end: string
) {
  const { data: employees, error: employeesError } = await supabase
    .from("profiles")
    .select("*")
    .eq("rol", "employee")
    .order("nombre");

  if (employeesError) throw employeesError;

  const { data: attendance, error: attendanceError } = await supabase
    .from("attendance_records")
    .select("*")
    .gte("fecha", start)
    .lte("fecha", end)
    .order("fecha", { ascending: false });

  if (attendanceError) throw attendanceError;

  const result = employees.map((employee) => {
    const records = attendance.filter(
      (r) => r.employee_id === employee.id
    );

    return {
      employee,

      // Última fichada del período (sirve para el dashboard)
      attendance:
        records.length > 0 ? records[0] : null,

      // Todas las fichadas del período (servirá para semana/mes)
      history: records,
    };
  });

  return result;
}