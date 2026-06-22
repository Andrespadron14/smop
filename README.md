# SMOP - Sistema de Monitoreo de Obras Publicas

**Alcaldia del Municipio Plaza**

Sistema web para monitorear proyectos de obras publicas, con roles de administrador, contratista y visitante.

## Inicio rapido (local)

```bash
npm start
```

Abrir http://localhost:3000

## Despliegue en produccion

Ver [DEPLOY.md](DEPLOY.md) para instrucciones detalladas de como desplegar en Supabase + Railway (gratis).

## Tecnologias

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Base de datos:** SQLite (local) / PostgreSQL (produccion via Supabase)
- **Almacenamiento:** Local (desarrollo) / Supabase Storage (produccion)
- **Autenticacion:** JWT
