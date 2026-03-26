# Pawo Skills — Tu equipo de builders expertos

Aquí viven los 11 agentes especializados que aceleran el desarrollo de Pawo.

---

## El equipo

### Estrategia y visión (Sonnet)

#### `/pawo-design-lead` — Design Lead
**El cerebro del producto.** Define cómo debe *sentirse* cada feature. Visión, experiencia, coherencia.

Úsalo cuando:
- Quieras revisar si una feature está alineada con la visión de Pawo
- Necesites evaluar un cambio de UI desde la perspectiva del usuario
- Quieras definir cómo debe verse una feature ANTES de construirla

```
/pawo-design-lead
Propuesta: Agregar un botón de "copiar gasto" para duplicarlo.
¿Resuelve un dolor real o es feature creep?
```

---

#### `/pawo-pm` — Product Manager
**Convierte ideas en specs ejecutables.** Describe el qué, el por qué, y los criterios de éxito.

Úsalo cuando:
- Tengas una idea y necesites un spec para implementar
- Quieras estimar esfuerzo de una feature
- Necesites priorizar contra el roadmap

```
/pawo-pm
Feature: Usuarios quieren ver cuánto gastaron por mes en los últimos 6 meses.
```

---

#### `/pawo-architect` — Arquitecto de Software
**Diseña la estructura técnica a largo plazo.** ADRs, dependencias, escalabilidad, patrones.

Úsalo cuando:
- Necesites tomar una decisión tecnológica importante
- Quieras evaluar si agregar una nueva dependencia
- Planifiques cómo escalar una feature (ej: de parejas a grupos)
- Necesites documentar un ADR

```
/pawo-architect
¿Deberíamos usar Redis para cache de balances o es prematuro?
```

---

#### `/pawo-security` — Security Specialist
**Protege los datos financieros de los usuarios.** RLS, auth, validación, secrets, vulnerabilidades.

Úsalo cuando:
- Quieras auditar la seguridad de una feature o tabla
- Necesites escribir o revisar policies RLS
- Dudes si un input está correctamente validado
- Quieras un reporte de vulnerabilidades

```
/pawo-security
Audita las policies RLS de la tabla expenses.
¿Un usuario puede ver gastos de otro space?
```

---

### Revisión y calidad (Sonnet)

#### `/pawo-lead` — Tech Lead
**Árbitro técnico.** Revisa código, detecta anti-patrones, toma decisiones de arquitectura day-to-day.

Úsalo cuando:
- Termines un feature y quieras que alguien revise el código
- Dudes sobre cómo estructurar algo
- Necesites validar que seguiste los patrones del proyecto

```
/pawo-lead
Acabo de implementar una feature nueva. ¿Está lista para main?
```

---

#### `/pawo-qa` — QA Specialist
**Audita calidad, escribe tests, detecta bugs.** Guardián de confiabilidad.

Úsalo cuando:
- Termines una feature y quieras que se audite
- Necesites escribir tests unitarios
- Dudes si hay un bug o es expected behavior

```
/pawo-qa
Audita lib/balance.ts y detecta problemas potenciales.
```

---

### Ejecución (Haiku)

#### `/pawo-ui` — Frontend Specialist
**Construye UI con Orion DS.** Sabe cada componente, patrón y token.

Úsalo cuando:
- Necesites implementar un componente nuevo
- Dudes sobre qué componente de Orion usar
- Quieras refactorizar UI existente

```
/pawo-ui
Necesito un modal para agregar un nuevo miembro al space.
```

---

#### `/pawo-backend` — Backend Specialist
**Implementa lógica de servidor, queries y RLS.** Knows Supabase deeply.

Úsalo cuando:
- Necesites escribir una query nueva
- Quieras agregar una columna a la DB
- Dudes cómo estructurar un Server Action

```
/pawo-backend
Necesito agregar un campo "categoría" a los gastos.
```

---

#### `/pawo-docs` — Documentador y Organizador
**Mantiene la documentación técnica y la estructura de archivos.** READMEs, convenciones, changelogs.

Úsalo cuando:
- Necesites documentar una feature o decisión
- Quieras reorganizar archivos o carpetas
- La documentación esté desactualizada

```
/pawo-docs
Documenta el data model actual de Pawo en docs/DATA_MODEL.md
```

---

#### `/pawo-devops` — DevOps / Infraestructura
**Gestiona deploys, CI/CD y monitoreo.** Vercel, Supabase, GitHub Actions.

Úsalo cuando:
- Necesites configurar un pipeline de CI/CD
- Tengas problemas con un deploy
- Quieras optimizar performance o bundle size

```
/pawo-devops
Configura GitHub Actions para lint + build en cada PR.
```

---

#### `/pawo-commit` — Git Workflow
**Automatiza commit y push a GitHub.** Revisa cambios, genera mensaje, pushea a main.

Úsalo cuando:
- Termines una tarea y quieras commitear automáticamente

```
/pawo-commit
```

---

## Flujo de trabajo recomendado

```
IDEA
  ↓
/pawo-design-lead (¿alineado con visión?)
  ↓
/pawo-pm (spec ejecutable)
  ↓
/pawo-architect (¿impacto estructural? ¿ADR necesario?)
  ↓
/pawo-ui + /pawo-backend (implementar)
  ↓
/pawo-security (¿seguro? ¿RLS correcta?)
  ↓
/pawo-lead (¿código sigue patrones?)
  ↓
/pawo-qa (¿hay bugs?)
  ↓
/pawo-docs (documentar cambios)
  ↓
/pawo-devops (deploy checklist)
  ↓
/pawo-commit (push a GitHub)
```

No siempre necesitas todos. Adapta según el tipo de cambio:
- **Feature nueva completa:** Todos los pasos
- **Bug fix:** Security → Backend/UI → Lead → QA → Commit
- **Refactor:** Architect → Lead → QA → Docs → Commit
- **UI polish:** Design Lead → UI → Lead → Commit
- **Security fix:** Security → Backend → Lead → QA → Commit

---

## Stack de referencia

| Área | Tecnología |
|------|-----------|
| Frontend | Next.js 16.1.6 + React 19 |
| Styling | Tailwind CSS v4 + Orion DS 4.2.10 |
| Backend | Supabase (PostgreSQL) |
| Auth | @supabase/ssr |
| Language | TypeScript 5 |
| Email | Resend 6.9.3 |
| State | Zustand 5 |
| Icons | lucide-react |
| Hosting | Vercel |
| CI/CD | GitHub Actions (propuesto) |

---

## Bugs conocidos

- `split_override` en gastos no se procesa en cálculos
- `ReviewPanel` usa `window.location.reload()` en lugar de `router.refresh()`
- Avatar component duplicado en `spaces/` y `settings/`
- RLS aún no completamente implementada (riesgo de seguridad)

---

## Ubicación del equipo

Todos los skills viven en `pawo/.claude/skills/` — viajan con el proyecto en git.

```
pawo/.claude/skills/
├── pawo-design-lead/   (sonnet)
├── pawo-pm/            (sonnet)
├── pawo-architect/     (sonnet)  ← NUEVO
├── pawo-security/      (sonnet)  ← NUEVO
├── pawo-lead/          (sonnet)
├── pawo-qa/            (sonnet)
├── pawo-ui/            (haiku)
├── pawo-backend/       (haiku)
├── pawo-docs/          (haiku)   ← NUEVO
├── pawo-devops/        (haiku)   ← NUEVO
└── pawo-commit/        (haiku)
```

---

**Made with care for Pawo builders**
