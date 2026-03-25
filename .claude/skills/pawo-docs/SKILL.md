---
trigger: ["pawo-docs", "documentar pawo", "readme pawo", "organizar pawo", "docs pawo", "documentación pawo"]
description: "Documentador y organizador de Pawo. Mantiene docs técnicos, READMEs, convenciones de nombres y estructura de archivos."
model: haiku
context: fork
---

# /pawo-docs — Documentación y Organización

> Mantiene la documentación técnica actualizada y la estructura de archivos organizada.

## Qué hace

El Documentador asegura que cualquier developer (o agente) pueda entender y contribuir a Pawo sin preguntar. Escribe docs, mantiene READMEs, define convenciones, y organiza archivos.

---

## Tipos de documentación

### 1. README del proyecto (`README.md`)
```markdown
# Pawo — Shared expense tracker para parejas

## Quick Start
1. `npm install`
2. Copiar `.env.example` a `.env.local`
3. `npm run dev`

## Stack
- Next.js 16.1.6 + React 19 (App Router)
- Supabase (PostgreSQL, Auth, Storage)
- Orion DS 4.2.10
- Tailwind CSS v4
- TypeScript 5

## Estructura del proyecto
[Ver docs/ARCHITECTURE.md]

## Scripts
- `npm run dev` — Development server
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npx supabase db push` — Aplicar migraciones

## Documentación
- `docs/ARCHITECTURE.md` — Estructura y decisiones
- `docs/adr/` — Architecture Decision Records
- `docs/DATA_MODEL.md` — Schema de la BD
- `docs/CONVENTIONS.md` — Convenciones de código
- `PRODUCT_VISION.md` — Visión del producto
- `NEXT_STEPS.md` — Backlog y roadmap
```

### 2. Documentación técnica (`docs/`)

| Archivo | Contenido |
|---------|-----------|
| `ARCHITECTURE.md` | Estructura de carpetas, patrones, flujo de datos |
| `DATA_MODEL.md` | Schema SQL, relaciones, índices, RLS policies |
| `CONVENTIONS.md` | Naming, imports, commits, branches |
| `SETUP.md` | Setup local completo (Supabase, env vars, etc.) |
| `API.md` | Server Actions: inputs, outputs, errores |
| `COMPONENTS.md` | Componentes Orion usados, patrones UI |
| `adr/` | Architecture Decision Records |

### 3. Inline docs (en código)

#### Cuándo comentar
- **Sí:** Lógica financiera compleja (`calculateBalance`)
- **Sí:** Workarounds o hacks temporales
- **Sí:** Decisiones no obvias ("usamos X porque Y")
- **No:** Código obvio (`// Incrementa el contador`)
- **No:** Replicar el nombre de la función

#### Formato de comentarios
```typescript
// ✅ Bueno: explica el POR QUÉ
// Usamos SECURITY DEFINER porque las policies necesitan
// acceder a space_members sin que el usuario tenga SELECT directo
CREATE FUNCTION get_my_space_ids() ...

// ✅ Bueno: marca deuda técnica
// TODO(pawo-architect): Refactorizar cuando migremos a grupos de 3+
// Actualmente asume exactamente 2 miembros por space
function calculateBalance(expenses, members) { ... }

// ❌ Malo: repite lo que el código ya dice
// Crea un nuevo gasto
export async function createExpense(data) { ... }
```

---

## Convenciones de nombres

### Archivos y carpetas
| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Páginas | `page.tsx` (Next.js convención) | `spaces/[id]/page.tsx` |
| Server Actions | `actions.ts` | `spaces/[id]/actions.ts` |
| Componentes | PascalCase | `AddExpenseModal.tsx` |
| Hooks | camelCase con `use` | `useSpaceMembers.ts` |
| Utilidades | camelCase | `balance.ts`, `currency.ts` |
| Migraciones | `YYYYMMDD_HHMMSS_descripcion.sql` | `20260314_120000_add_categories.sql` |
| Tests | `{nombre}.test.ts` | `balance.test.ts` |
| Types | PascalCase | `Space`, `Expense`, `CycleStatus` |
| Enums DB | snake_case | `split_mode`, `cycle_status` |

### Variables y funciones
| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Funciones | camelCase, verbo primero | `createExpense`, `getSpaceMembers` |
| Variables | camelCase | `currentCycle`, `totalAmount` |
| Constantes | UPPER_SNAKE | `MAX_MEMBERS`, `AVATAR_COLORS` |
| Props | PascalCase interface | `interface ExpenseCardProps` |
| Server Actions | camelCase, verbo primero | `createExpense`, `closeCycle` |
| Query functions | `get/create/update/delete` + sustantivo | `getExpenses`, `createReview` |

### Idioma
- **Código:** Inglés (variables, funciones, types, commits)
- **UI/Copy:** Español (textos visibles al usuario)
- **Docs técnicos:** Español (porque el equipo habla español)
- **Comentarios:** Español para explicaciones, inglés para TODOs técnicos

---

## Organización de archivos

### Regla de colocación
1. **Feature-first:** Código vive junto a la feature que lo usa
2. **Shared solo si se usa 2+ veces:** No abstraer prematuramente
3. **Lib es pura:** Sin imports de `app/`, sin side effects
4. **Types junto al código:** Excepto types de Supabase (generados)

### Checklist de organización
- [ ] ¿Cada feature tiene `page.tsx` + `actions.ts`?
- [ ] ¿Componentes compartidos están en `app/components/`?
- [ ] ¿Hay archivos huérfanos (no importados por nadie)?
- [ ] ¿Hay imports circulares?
- [ ] ¿Las migraciones están en orden cronológico?
- [ ] ¿El `types/supabase.ts` está actualizado con el schema?

### Detección de desorden
Señales de que hay que reorganizar:
- Un archivo tiene 300+ líneas → dividir
- Un componente se copia en 2+ lugares → extraer a `app/components/`
- Un import tiene 4+ `../` → mover archivo o usar alias `@/`
- Una feature tiene 10+ archivos → crear subcarpetas

---

## Mantenimiento de docs

### Cuándo actualizar docs
| Evento | Docs a actualizar |
|--------|-------------------|
| Nueva feature | `NEXT_STEPS.md`, `API.md` (si tiene actions) |
| Cambio de schema | `DATA_MODEL.md`, types |
| Nueva dependencia | `README.md`, ADR si es significativa |
| Cambio de patrón | `CONVENTIONS.md`, `ARCHITECTURE.md` |
| Bug resuelto | `NEXT_STEPS.md` (remover de known bugs) |
| Nueva migración | `DATA_MODEL.md` |

### Formato de changelog
```markdown
## [Fecha] — Descripción breve

### Agregado
- Feature X: descripción

### Cambiado
- Refactorizado Y por Z

### Corregido
- Bug: split_override no procesado

### Removido
- Página home/page.tsx (redirect innecesario)
```

---

## Templates

### Template para feature doc
```markdown
# Feature: {Nombre}

## Descripción
Qué hace y para quién.

## Ubicación
- Page: `app/{ruta}/page.tsx`
- Actions: `app/{ruta}/actions.ts`
- Components: `app/{ruta}/components/`

## Data model
Tablas involucradas y campos relevantes.

## Server Actions
| Action | Input | Output | Errores |
|--------|-------|--------|---------|
| `createX` | `{ ... }` | `X` | `Error: ...` |

## UI Components
| Componente | Orion base | Props |
|-----------|-----------|-------|
| `XModal` | `Modal` | `isOpen, onClose` |

## Edge cases
- ¿Qué pasa si ...?
```

---

## Relación con otros roles

- **Con `/pawo-architect`:** Architect toma decisiones; Docs las documenta en ADRs
- **Con `/pawo-pm`:** PM escribe specs; Docs los archiva y mantiene el backlog
- **Con `/pawo-lead`:** Lead define patrones; Docs los documenta en `CONVENTIONS.md`
- **Con `/pawo-backend`:** Backend cambia schema; Docs actualiza `DATA_MODEL.md`
- **Con `/pawo-qa`:** QA encuentra bugs; Docs los registra en known issues

---

**Pawo Project:** Shared expense tracker para parejas
**Repo:** `/Users/alfredo/Documents/pawo`
**Docs location:** `docs/` (propuesto) + `PRODUCT_VISION.md` + `NEXT_STEPS.md` (existentes)
