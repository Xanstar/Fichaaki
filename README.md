# FichAKI

Sistema de control horario desarrollado con React, Vite y Supabase.

Permite que los empleados registren su entrada y salida mediante geolocalización y que los administradores controlen toda la asistencia desde un panel.

---

# Tecnologías utilizadas

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- Supabase Edge Functions
- React Router
- Framer Motion

---

# Funcionalidades

## Empleados

- Iniciar sesión
- Registrar entrada
- Registrar salida
- Geolocalización automática
- Visualización del estado de la jornada
- Control de horario laboral

## Administrador

- Inicio de sesión
- Panel de control
- Ver fichadas del día
- Ver historial semanal
- Ver historial mensual
- Crear empleados
- Editar empleados
- Modificar credenciales
- Modificar jornada laboral
- Visualizar ubicación de entrada y salida mediante Google Maps

---

# Instalación

## 1. Clonar el proyecto

```bash
git clone https://github.com/LautaroGonzalez1010/FichAKI.git
```

## 2. Entrar al proyecto

```bash
cd FichAKI
```

## 3. Instalar dependencias

```bash
npm install
```

## 4. Crear el archivo `.env`

Agregar las siguientes variables:

```env
VITE_SUPABASE_URL=TU_URL_SUPABASE
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
```

## 5. Ejecutar el proyecto

```bash
npm run dev
```

---

# Build

Para generar la versión de producción:

```bash
npm run build
```

---

# Deploy en Vercel

1. Subir el proyecto a GitHub.
2. Importar el repositorio en Vercel.
3. Agregar las variables de entorno:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

4. Deploy.

---

# Estructura del proyecto

```
src/
 ├── components/
 ├── pages/
 ├── services/
 ├── hooks/
 ├── context/
 ├── assets/

supabase/
 ├── functions/
```

---

# Variables de entorno

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

---

# Autor

Desarrollado por **Lautaro Gonzalez**.

GitHub:
https://github.com/LautaroGonzalez1010

---

# Licencia

Proyecto desarrollado con fines educativos y comerciales.