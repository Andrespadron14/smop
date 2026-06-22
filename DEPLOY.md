# SMOP - Guia de despliegue a la nube (gratuito)

## Requisitos previos
- Tener una cuenta en **GitHub** (gratis)
- Navegador web (Chrome/Edge)

---

## Paso 1: Subir el codigo a GitHub

1. Ve a https://github.com/new y crea un repositorio llamado `smop`
2. NO marques "Initialize with README"
3. En tu PC, abre una terminal en `C:\Users\User\Desktop\SMOP` y ejecuta:

```bash
git init
git add .
git commit -m "SMOP - Sistema de Monitoreo de Obras Publicas"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/smop.git
git push -u origin main
```

> Reemplaza `TU-USUARIO` por tu nombre de usuario de GitHub.

---

## Paso 2: Crear base de datos en Supabase (gratis)

1. Ve a **https://supabase.com** y registrate (o inicia sesion con GitHub)
2. Crea un nuevo proyecto:
   - **Name:** `smop`
   - **Database Password:** Anotala, la necesitaras
   - **Region:** Elige la mas cercana (US East o South America)
   - **Pricing Plan:** Free
3. Espera 1-2 minutos mientras se crea la base de datos
4. En el panel izquierdo, ve a **Project Settings > Database**
5. Busca **Connection string** y copia la URL que dice `URI`
   - Se ve asi: `postgresql://postgres:XXXXXX@db.xxxxx.supabase.co:5432/postgres`
   - Guardala, la necesitaras en el siguiente paso
6. En el panel izquierdo, ve a **SQL Editor**
7. Abre el archivo `server/migrate.sql` de este proyecto (en la carpeta SMOP)
8. Copia TODO el contenido y pegalo en el SQL Editor de Supabase
9. Haz clic en **RUN** para crear las tablas

---

## Paso 3: Desplegar el backend en Railway (gratis)

1. Ve a **https://railway.app** y registrate con GitHub
2. Haz clic en **New Project > Deploy from GitHub repo**
3. Selecciona el repositorio `smop` que creaste en el Paso 1
4. Railway detectara automaticamente Node.js
5. Ve a la pestaña **Variables** y agrega:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | La URL de Supabase del Paso 2 |
| `JWT_SECRET` | `smop-municipio-plaza-secret-key-2024` (o la que quieras) |
| `PORT` | `3000` |
| `SUPABASE_URL` | Tu URL de Supabase (Settings > API > Project URL) |
| `SUPABASE_ANON_KEY` | Tu anon key (Settings > API > anon public) |

6. Ve a la pestaña **Settings** y en **Root Directory** escribe `server`
7. En **Build Command** escribe: `npm install`
8. En **Start Command** escribe: `node index.js`
9. Espera a que se despliegue (1-2 minutos)
10. Railway te dara una URL como `https://smop.up.railway.app`
11. **Abre esa URL** en tu navegador -- veras el login

---

## Paso 4: (Opcional) Frontend en Vercel

Si prefieres el frontend en Vercel (mas rapido):

1. Ve a **https://vercel.com** y registrate con GitHub
2. Haz clic en **Add New > Project**
3. Selecciona el repositorio `smop`
4. En **Root Directory** selecciona `client`
5. En **Environment Variables** agrega:

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://smop.up.railway.app/api` (la URL de Railway + `/api`) |

6. Haz clic en **Deploy**
7. Vercel te dara una URL como `https://smop.vercel.app`

---

## Credenciales de acceso

| Rol | Email | Contrasena |
|-----|-------|-----------|
| Admin (Alcalde) | admin@municipioplaza.gob.ve | admin123 |
| Admin (Directora) | obras@municipioplaza.gob.ve | admin123 |
| Contratista Bolivar | contratista1@email.com | contrato123 |
| Contratista Vialca | contratista2@email.com | contrato123 |
| Visitante | visitante@email.com | visitante123 |

---

## Mantenimiento

- **Supabase**: Los datos persisten automaticamente
- **Railway**: El servidor se reinicia solo si falla
- **Fotos**: Se suben a Supabase Storage (bucket `smop-fotos`)

## Soporte local (desarrollo)

El sistema sigue funcionando en local si ejecutas:
```bash
npm start
```
(Sin configurar DATABASE_URL, usara SQLite automaticamente)
