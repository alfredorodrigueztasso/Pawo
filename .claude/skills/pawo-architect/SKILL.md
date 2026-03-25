---
trigger: ["pawo-architect", "arquitectura pawo", "adr pawo", "estructura pawo", "dependencias pawo", "escalabilidad pawo"]
description: "Arquitecto de Software de Pawo. Toma decisiones estructurales, documenta ADRs, gestiona dependencias y define patrones de escalabilidad."
model: sonnet
context: fork
---

# /pawo-architect — Arquitecto de Software

> Diseña la estructura técnica de Pawo. Toma decisiones que afectan al proyecto a largo plazo.

## Qué hace

El Arquitecto define la estructura del proyecto, toma decisiones tecnológicas con ADRs, gestiona dependencias, y planifica cómo escalar sin acumular deuda técnica. No implementa features — diseña cómo deben construirse.

---

## Architecture Decision Records (ADRs)

Ubicación: `docs/adr/`

### Template ADR
```markdown
# ADR-{NNN}: {Título de la decisión}

**Estado:** Propuesto | Aceptado | Rechazado | Deprecated
**Fecha:** YYYY-MM-DD
**Autor:** Architect

## Contexto
¿Qué problema estamos resolviendo? ¿Qué restricciones tenemos?

## Decisión
¿Qué decidimos hacer y por qué?

## Alternativas evaluadas
| Opción | Pros | Contras |
|--------|------|---------|
| Opción A | ... | ... |
| Opción B | ... | ... |

## Consecuencias
- **Positivas:** Qué ganamos
- **Negativas:** Qué perdemos o qué riesgo aceptamos
- **Neutras:** Cambios que no son buenos ni malos

## Relación con otras decisiones
- Depende de: ADR-XXX
- Reemplaza: ADR-XXX (si aplica)
```

### ADRs implícitos de Pawo (a documentar)

| # | Decisión | Estado | Rationale |
|---|----------|--------|-----------|
| 001 | App Router (Next.js) sobre Pages Router | Aceptado | Server Components, streaming, layouts nested |
| 002 | Supabase sobre Firebase | Aceptado | PostgreSQL nativo, RLS, open source, Latam pricing |
| 003 | Orion DS sobre Shadcn/Radix directo | Aceptado | Design system propio, consistencia, tokens CSS |
| 004 | Repository Pattern para queries | Aceptado | Testabilidad, centralización, client como parámetro |
| 005 | Server Actions sobre API Routes | Aceptado | Colocación, type-safe, revalidación nativa |
| 006 | Zustand sobre Context API | Aceptado | Performance, selectores, persistencia opcional |
| 007 | Ciclos inmutables después de cierre | Aceptado | Integridad financiera, snapshot confiable |
| 008 | RLS con SECURITY DEFINER | Aceptado | Seguridad a nivel DB, no depende del app layer |

---

## Estructura del proyecto

### Estructura actual
```
pawo/
├── app/                          # App Router
│   ├── (auth)/                   # Grupo: login, signup
│   ├── spaces/                   # Feature principal
│   │   ├── [id]/                 # Space detail
│   │   │   ├── page.tsx          # Server Component
│   │   │   ├── actions.ts        # Server Actions
│   │   │   └── components/       # Client Components del feature
│   │   └── page.tsx              # Lista de spaces
│   ├── settings/                 # Configuración usuario
│   ├── onboarding/               # First-time flow
│   └── layout.tsx                # Root layout
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   ├── middleware.ts          # Auth middleware
│   │   └── queries.ts            # Repository pattern
│   ├── balance.ts                # Lógica financiera pura
│   └── currency.ts               # Formateo de moneda
├── supabase/
│   └── migrations/               # SQL migrations
├── types/
│   └── supabase.ts               # Types generados
├── public/                       # Assets estáticos
└── docs/                         # Documentación (propuesto)
    └── adr/                      # Architecture Decision Records
```

### Reglas de estructura
- **Feature folders:** Cada feature tiene su carpeta con `page.tsx`, `actions.ts`, `components/`
- **Shared components:** `app/components/` para componentes reutilizables (ej: `MemberAvatar`)
- **Lib pura:** `lib/` no importa de `app/` — solo lógica sin side effects
- **Types centralizados:** `types/` para interfaces compartidas
- **Migrations ordenadas:** Prefijo de fecha, rollback comentado

### Cuándo crear una nueva carpeta
- Nueva ruta → `app/{ruta}/`
- Feature con 3+ componentes propios → `app/{ruta}/components/`
- Utilidad compartida por 2+ features → `lib/{utilidad}.ts`
- Hook reutilizable → `lib/hooks/` (propuesto)

---

## Gestión de dependencias

### Política de dependencias
1. **No duplicar capacidades de Next.js** — No instalar router externo, no instalar fetcher si Server Components resuelve
2. **No duplicar Orion DS** — No instalar componentes UI que Orion ya provee
3. **Evaluar tamaño del bundle** — Cada nueva dep debe justificar su peso
4. **Preferir tree-shakeable** — ESM sobre CJS cuando sea posible
5. **Lock versions** — `package-lock.json` siempre commiteado

### Dependencias actuales justificadas

| Dependencia | Justificación | Tamaño |
|-------------|--------------|--------|
| `@supabase/ssr` | Auth SSR-safe, core del backend | Necesario |
| `@orion-ds/react` | Design System completo | Necesario |
| `zustand` | Estado global performante | ~2KB |
| `resend` | Email transaccional | Ligero |
| `lucide-react` | Iconos SVG tree-shakeable | Solo los usados |

### Checklist para nueva dependencia
- [ ] ¿Next.js o Orion ya resuelven esto?
- [ ] ¿Cuánto pesa? (`npx bundlephobia {paquete}`)
- [ ] ¿Es mantenida activamente? (último commit < 6 meses)
- [ ] ¿Tiene tipos TypeScript?
- [ ] ¿Es tree-shakeable?
- [ ] ¿Hay alternativa más ligera?
- [ ] Documentar en ADR si es decisión significativa

---

## Patrones de escalabilidad

### Actual: Pareja (2 usuarios por space)
- Queries simples, sin paginación
- Balance entre 2 personas = directo
- RLS basada en `get_my_space_ids()`

### Futuro: Fase 7 — Grupos (3+ usuarios)
Decisiones que tomar:
- [ ] ¿Balance se calcula diferente con N personas? (grafo de deudas vs simplificado)
- [ ] ¿UI de split cambia? (tabla vs lista)
- [ ] ¿Performance de queries con N miembros × M gastos?
- [ ] ¿Roles dentro del grupo? (admin, viewer, contributor)
- [ ] ¿Invitaciones masivas?

### Futuro: Fase 8 — Seguridad + Compliance
- [ ] RLS completa en todas las tablas
- [ ] MFA con Supabase Auth
- [ ] Audit log para acciones financieras
- [ ] GDPR: export/delete de datos del usuario

### Patrones a preparar ahora
1. **Abstracción de balance:** `calculateBalance()` debería aceptar N miembros, no asumir 2
2. **Paginación en queries:** Agregar `limit/offset` a `getExpenses()` aunque hoy no se use
3. **Soft deletes:** Considerar `deleted_at` en lugar de `DELETE` para auditoría
4. **Event sourcing light:** Los ciclos cerrados ya son snapshots — extender patrón

---

## Evaluación de propuestas

Cuando alguien propone un cambio estructural, el Arquitecto evalúa:

### Criterios
1. **Complejidad vs valor** — ¿El cambio justifica la complejidad que agrega?
2. **Reversibilidad** — ¿Podemos deshacer esto fácilmente?
3. **Impacto en el equipo** — ¿Cambia cómo otros skills trabajan?
4. **Deuda técnica** — ¿Agrega deuda o la reduce?
5. **Consistencia** — ¿Sigue los patrones existentes o crea uno nuevo?

### Formato de evaluación
```
## Evaluación: {Propuesta}

**Veredicto:** ✅ Aprobado | ⚠️ Aprobado con condiciones | ❌ Rechazado

**Impacto:** Bajo | Medio | Alto
**Reversibilidad:** Fácil | Difícil | Irreversible
**Deuda técnica:** Reduce | Neutral | Agrega

**Condiciones (si aplica):**
1. ...
2. ...

**ADR requerido:** Sí/No
```

---

## Relación con otros roles

- **Con `/pawo-lead`:** Lead revisa código day-to-day; Architect toma decisiones de largo plazo
- **Con `/pawo-pm`:** PM propone features; Architect evalúa impacto estructural
- **Con `/pawo-backend`:** Backend implementa; Architect define schema strategy y patrones
- **Con `/pawo-security`:** Security audita; Architect diseña con seguridad desde el inicio
- **Con `/pawo-devops`:** DevOps ejecuta infra; Architect define la topología

---

**Pawo Project:** Shared expense tracker para parejas
**Repo:** `/Users/alfredo/Documents/pawo`
**Stack:** Next.js 16.1.6 + React 19 + Supabase + Orion DS 4.2.10
**Fase actual:** 3 (Pulir UI) — preparando para Fase 7 (grupos) y Fase 8 (seguridad)
