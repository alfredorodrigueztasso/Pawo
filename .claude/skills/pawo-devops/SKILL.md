---
trigger: ["pawo-devops", "devops pawo", "deploy pawo", "ci pawo", "vercel pawo", "infra pawo", "monitoreo pawo"]
description: "DevOps de Pawo. Gestiona CI/CD, deploys en Vercel, configuración de Supabase, environments y monitoreo."
model: haiku
context: fork
---

# /pawo-devops — DevOps / Infraestructura

> Gestiona la infraestructura, deploys y monitoreo de Pawo.

## Qué hace

El DevOps asegura que Pawo se despliega de forma confiable, que los environments están configurados correctamente, y que hay visibilidad sobre errores y performance en producción.

---

## Infraestructura de Pawo

### Stack de infra
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Vercel     │────▶│   Supabase   │     │   Resend    │
│  (Frontend)  │     │  (Backend)   │     │  (Email)    │
│  Next.js 16  │     │  PostgreSQL  │     │  Transacc.  │
│  Edge/Node   │     │  Auth        │     └─────────────┘
└─────────────┘     │  Storage     │
                    │  Realtime    │
                    └──────────────┘
```

### Environments

| Environment | URL | Supabase | Branch |
|------------|-----|----------|--------|
| **Production** | `pawo.vercel.app` (o custom domain) | Proyecto principal | `main` |
| **Preview** | `pawo-{branch}.vercel.app` | Mismo proyecto (cuidado) | Feature branches |
| **Local** | `localhost:3000` | Local o remoto con `.env.local` | Cualquier branch |

---

## Vercel — Configuración

### Settings recomendadas
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "nodeVersion": "20.x"
}
```

### Environment variables en Vercel
| Variable | Tipo | Environments |
|----------|------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Plain text | Todos |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Plain text | Todos |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Prod + Preview |
| `RESEND_API_KEY` | Secret | Prod only |

### Checklist de deploy
- [ ] Build exitoso localmente (`npm run build`)
- [ ] No hay errores de TypeScript
- [ ] No hay warnings críticos de ESLint
- [ ] Environment variables configuradas en Vercel
- [ ] Migraciones SQL aplicadas en Supabase antes del deploy
- [ ] `.env.local` NO está en el commit
- [ ] Funcionalidad verificada en preview deploy

---

## Supabase — Configuración

### Migraciones
```bash
# Generar nueva migración
npx supabase migration new {descripcion}

# Aplicar migraciones locales
npx supabase db push

# Ver estado de migraciones
npx supabase migration list

# Reset local (destructivo)
npx supabase db reset
```

### Orden de operaciones para cambios de schema
1. Escribir migración SQL en `supabase/migrations/`
2. Testear localmente con `npx supabase db push`
3. Verificar que la app funciona con el nuevo schema
4. Deploy: aplicar migración en Supabase Dashboard o CLI
5. Deploy: push código a `main` → Vercel rebuild
6. Verificar en producción

### Supabase Dashboard — Checklist
- [ ] Auth providers configurados (email, OAuth si aplica)
- [ ] Email templates personalizadas (confirmación, reset, invitación)
- [ ] Storage buckets con policies (si se usa para avatars)
- [ ] Database: indexes creados para queries frecuentes
- [ ] Database: RLS habilitado en todas las tablas
- [ ] Backups automáticos habilitados

---

## CI/CD Pipeline (propuesto)

### GitHub Actions — Build + Lint
```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
    env:
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

### GitHub Actions — Tests (cuando existan)
```yaml
  test:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test
```

### Deploy pipeline
```
Push a main
    ↓
GitHub Actions: lint + build + test
    ↓ (si pasa)
Vercel: auto-deploy desde main
    ↓
Preview URL generada (si es PR)
    ↓
Production deploy (si es main)
```

---

## Monitoreo

### Qué monitorear

| Métrica | Herramienta | Umbral |
|---------|------------|--------|
| Build errors | Vercel Dashboard | 0 errores |
| Runtime errors | Vercel Logs / Sentry | < 1% de requests |
| Response time | Vercel Analytics | p95 < 2s |
| DB connections | Supabase Dashboard | < 80% del pool |
| Email delivery | Resend Dashboard | > 95% delivered |
| Bundle size | `next build` output | < 300KB first load |

### Errores comunes y cómo debuggear

| Error | Causa probable | Fix |
|-------|---------------|-----|
| `NEXT_PUBLIC_SUPABASE_URL is undefined` | Env var no configurada | Agregar en Vercel Dashboard |
| `relation "X" does not exist` | Migración no aplicada | `npx supabase db push` |
| `new row violates row-level security` | RLS policy incorrecta | Revisar policy en Supabase |
| `fetch failed` en Server Component | Supabase URL incorrecta o timeout | Verificar URL y network |
| Build timeout en Vercel | Bundle demasiado grande o import pesado | Analizar con `@next/bundle-analyzer` |

---

## Scripts útiles

### `package.json` scripts recomendados
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "db:push": "npx supabase db push",
    "db:reset": "npx supabase db reset",
    "db:types": "npx supabase gen types typescript --local > types/supabase.ts",
    "analyze": "ANALYZE=true next build"
  }
}
```

### Comandos de emergencia
```bash
# Rollback Vercel a deploy anterior
# → Vercel Dashboard → Deployments → Redeploy anterior

# Ver logs de producción
npx vercel logs pawo --follow

# Verificar estado de Supabase
npx supabase status

# Regenerar types después de cambio de schema
npx supabase gen types typescript --local > types/supabase.ts
```

---

## Performance

### Next.js optimizaciones
- [ ] `force-dynamic` solo donde es necesario (datos en tiempo real)
- [ ] Images optimizadas con `next/image` (si hay avatars)
- [ ] Lazy load de componentes pesados con `dynamic()`
- [ ] Preconnect a Supabase en `<head>`
- [ ] Bundle analysis periódico

### Supabase optimizaciones
- [ ] Índices en columnas filtradas (`space_id`, `cycle_id`, `paid_by`)
- [ ] Select solo columnas necesarias (no `select('*')` si no se necesita todo)
- [ ] Connection pooling habilitado
- [ ] Queries con `.limit()` para listas largas

---

## Backup y recovery

### Supabase backups
- Backups automáticos diarios (plan Pro)
- Point-in-time recovery (plan Pro)
- Export manual: `pg_dump` desde connection string

### Código
- Git es el backup del código
- `.env.local` debe tener backup seguro (password manager)
- Supabase service role key: guardar en lugar seguro fuera del repo

### Plan de recovery
1. **Código corrupto:** `git revert` o redeploy desde commit anterior
2. **DB corrupta:** Restore de backup + re-apply migraciones faltantes
3. **Vercel down:** Esperar (o deploy en otro servicio como fallback)
4. **Supabase down:** Esperar (sin fallback actual — considerar backup strategy)

---

## Checklist para nuevo environment

- [ ] Crear proyecto en Supabase (o usar existente)
- [ ] Configurar auth providers
- [ ] Aplicar todas las migraciones
- [ ] Configurar env vars en Vercel
- [ ] Verificar build exitoso
- [ ] Verificar auth flow completo (signup → login → protected route)
- [ ] Verificar RLS (usuario no ve datos de otro)
- [ ] Configurar Resend (si email es necesario)
- [ ] Configurar custom domain (si producción)

---

## Relación con otros roles

- **Con `/pawo-architect`:** Architect define topología; DevOps la implementa
- **Con `/pawo-security`:** Security define requisitos; DevOps los aplica en infra
- **Con `/pawo-backend`:** Backend escribe migraciones; DevOps las despliega
- **Con `/pawo-lead`:** Lead aprueba código; DevOps lo lleva a producción
- **Con `/pawo-commit`:** Commit pushea a GitHub; DevOps maneja lo que sigue (CI/CD)

---

**Pawo Project:** Shared expense tracker para parejas
**Repo:** `/Users/alfredo/Documents/pawo`
**Hosting:** Vercel (Next.js)
**Backend:** Supabase (PostgreSQL + Auth + Storage)
**Email:** Resend
**CI/CD:** GitHub Actions (propuesto) + Vercel auto-deploy
