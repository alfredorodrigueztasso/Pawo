# Pawo Skills — Tu equipo de builders expertos

Aquí viven los 7 agentes especializados que aceleran el desarrollo de Pawo.

---

## 👑 El equipo

### ⭐ `/pawo-design-lead` — Design Lead
**El cerebro del producto.** Define cómo debe *sentirse* cada feature. Visión, experiencia, coherencia.

Úsalo cuando:
- Quieras revisar si una feature está alineada con la visión de Pawo
- Necesites evaluar un cambio de UI desde la perspectiva del usuario
- Dudes entre dos enfoques de diseño
- Quieras definir cómo debe verse una feature ANTES de construirla

```
/pawo-design-lead
Propuesta: Agregar un botón de "copiar gasto" para duplicarlo.
¿Resuelve un dolor real o es feature creep?
```

---

### 🏗️ `/pawo-pm` — Product Manager
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

### 🚀 `/pawo-lead` — Tech Lead
**Árbitro técnico.** Revisa código, detecta anti-patrones, toma decisiones de arquitectura.

Úsalo cuando:
- Termines un feature y quieras que alguien revise el código
- Dudes sobre cómo estructurar algo arquitectónicamente
- Necesites validar que seguiste los patrones del proyecto

```
/pawo-lead
Acabo de implementar una feature nueva. ¿Está lista para main?
```

---

### 🎨 `/pawo-ui` — Frontend Specialist
**Construye UI hermosa con Orion DS.** Sabe cada componente, patrón y token.

Úsalo cuando:
- Necesites implementar un componente nuevo
- Dudes sobre qué componente de Orion usar
- Quieras refactorizar UI existente

```
/pawo-ui
Necesito un modal para agregar un nuevo miembro al space.
¿Cómo debería verse con Orion DS?
```

---

### 🗄️ `/pawo-backend` — Backend Specialist
**Implementa lógica de servidor, queries y RLS.** Knows Supabase deeply.

Úsalo cuando:
- Necesites escribir una query nueva
- Quieras agregar una columna a la DB
- Dudes cómo estructurar un Server Action

```
/pawo-backend
Necesito agregar un campo "categoría" a los gastos.
¿Cómo debería hacerse?
```

---

### 🧪 `/pawo-qa` — QA Specialist
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

### 📦 `/pawo-commit` — Git Workflow
**Automatiza commit y push a GitHub.** Revisa cambios, genera mensaje, pushea a main.

Úsalo cuando:
- Termines una tarea y quieras commitear automáticamente

```
/pawo-commit
"Implementar página de perfil del usuario"
```

---

## 🎯 Flujo de trabajo recomendado

```
IDEA
  ↓
/pawo-design-lead (¿alineado con visión?)
  ↓
/pawo-pm (¿qué es exactamente lo que vamos a hacer?)
  ↓
/pawo-ui + /pawo-backend (implementar)
  ↓
/pawo-lead (¿código está bien?)
  ↓
/pawo-qa (¿hay bugs?)
  ↓
/pawo-commit (push a GitHub)
```

No siempre necesitas todos. Una feature de UI pura: Design Lead → PM → UI → Lead → QA → Commit.

---

## 💡 Ejemplos reales

### Feature: Editar gastos pasados
```
/pawo-design-lead
¿Es seguro permitir que los usuarios editen gastos? ¿Cómo afecta el balance?
→ Output: Permitir editar dentro de 24h, después de cerrar ciclo es locked

/pawo-pm
Escribir spec completo de "edit expenses within 24h, locked after"

/pawo-backend
Agregar trigger en DB que previene edición después de 24h

/pawo-ui
Build edit modal usando Orion Modal pattern

/pawo-lead
¿El código sigue los patrones?

/pawo-qa
Auditar: ¿qué pasa si intento editar un gasto de 25h atrás?

/pawo-commit
Push a GitHub
```

### Feature: Dark mode
```
/pawo-design-lead
¿Cómo debería verse Pawo en dark mode? ¿Debería ser automático o manual?

/pawo-pm
Spec: Manual toggle en settings, persistir preferencia

/pawo-ui
Implementar toggle + asegurar que TODOS los componentes funcionen en dark

/pawo-qa
Auditar dark mode en cada página

/pawo-commit
Push
```

---

## 📚 Stack de referencia

| Área | Tecnología |
|------|-----------|
| Frontend | Next.js 16 + React 19 |
| Styling | Tailwind CSS v4 + Orion DS 4.2.10 |
| Backend | Supabase (PostgreSQL) |
| Auth | @supabase/ssr |
| Language | TypeScript 5 |
| Email | Resend 6.9.3 |
| State | Zustand 5 |
| Icons | lucide-react |

---

## 🚨 Bugs conocidos

- `split_override` en gastos no se procesa en cálculos
- `ReviewPanel` usa `window.location.reload()` en lugar de `router.refresh()`
- Avatar component duplicado en `spaces/` y `settings/`
- RLS aún no completamente implementada (riesgo de seguridad)

---

## 📍 Ubicación del equipo

Todos los skills viven en `pawo/.claude/skills/` — viajan con el proyecto en git.

```
pawo/.claude/skills/
├── pawo-design-lead/
├── pawo-pm/
├── pawo-lead/
├── pawo-ui/
├── pawo-backend/
├── pawo-qa/
└── pawo-commit/
```

---

**Made with ❤️ for Pawo builders**
