# Fichaqui

Sistema de control horario para empresas. Desarrollado con React, Vite y Supabase.

Permite que los empleados registren su entrada y salida mediante geolocalización y que los administradores controlen toda la asistencia desde un panel.

---

## Tecnologías

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- Supabase Edge Functions
- React Router
- Framer Motion

---

## Funcionalidades

### Empleados

- Iniciar sesión
- Registrar entrada y salida
- Geolocalización automática
- Visualización del estado de la jornada
- Historial de fichadas

### Administrador

- Panel de control con métricas del día
- Fichadas del día, semana y mes
- Crear y editar empleados
- Modificar credenciales
- Configurar jornada laboral
- Ver ubicación de entrada y salida en Google Maps

---

## Instalación

```bash
git clone https://github.com/LautaroGonzalez1010/FichAKI.git
cd FichAKI
npm install
```

### Variables de entorno

Crear un archivo `.env` en la raíz:

```
VITE_SUPABASE_URL=TU_URL_SUPABASE
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
```

### Ejecutar

```bash
npm run dev
```

### Build de producción

```bash
npm run build
```

---

## Supabase

### Base de datos

Aplicar la migración inicial (`supabase/migrations/0001_init.sql`):

```bash
supabase db push
```

O copiar el contenido de `supabase/migrations/0001_init.sql` en Supabase Studio > SQL Editor y ejecutarlo.

### Edge Functions

```bash
supabase functions deploy check-in check-out create-employee update-employee
```

> Importante: las funciones `create-employee` y `update-employee` solo aceptan llamadas de un usuario con rol `admin`. Todas las funciones tienen `verify_jwt = true`.

### RLS y seguridad

- Los empleados solo leen sus propios datos.
- Los administradores acceden a todo.
- El registro público de usuarios está desactivado; los empleados se crean desde el panel de administración.

---



