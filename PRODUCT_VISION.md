# Pawo — Visión de Producto y Roadmap

## Resumen Ejecutivo

**Pawo** es una aplicación web diseñada para parejas que conviven y necesitan dividir gastos de forma justa, personalizada y sin fricción emocional.

**Diferenciador clave:** No es una app contable más. El foco es en la **sensibilidad de producto**: flexible en proporciones, clara en el balance, liviana en la experiencia.

**Stack:** Next.js 15 + Supabase + Orion DS 4.2.9

---

## MVP Implementado (Fases 1-2.5) ✅

### Fase 1: Fundación y Auth
- ✅ Setup Next.js + Supabase + Orion DS
- ✅ Autenticación: signup, login, password validation
- ✅ Creación de hogar (nombre, moneda, día de ciclo)
- ✅ Invitación por email con token temporal
- ✅ Aceptación de invitación y onboarding del partner

### Fase 2: Configuración de Proporción
- ✅ Modo de split: por ingresos o manual
- ✅ Cálculo automático de % cuando ambos ingresan ingresos
- ✅ Ajuste manual con slider si se requiere
- ✅ Confirmación y guardado de proporción

### Fase 3: Gastos
- ✅ Agregar gasto: monto, quién pagó, fecha, descripción
- ✅ División automática según regla del hogar
- ✅ Editar y eliminar gastos (ciclo activo solo)
- ✅ Lista de gastos con visualización de estado
- ✅ Balance en tiempo real (Supabase Realtime)

### Fase 4: Revisión y Transparencia
- ✅ Sistema de reviews (no-bloqueante): solicitar revisión de un gasto
- ✅ Pregunta abierta + monto sugerido opcional
- ✅ Respuestas sin bloquear confirmación del gasto
- ✅ Notificaciones por email de reviews

### Fase 5: Ciclos y Cierre
- ✅ Visualización del progreso del ciclo actual
- ✅ Modal de cierre: resumen final + cálculo de ajuste
- ✅ Confirmación bilateral de cierre
- ✅ Historial de ciclos cerrados (inmutable)

### Features Adicionales Implementados
- ✅ Notificaciones en tiempo real (ActivityFeed)
- ✅ Settings: actualización de ingresos
- ✅ Miembros del hogar: visualización de split %
- ✅ Email notifications: invitaciones, expense alerts, reviews
- ✅ Realtime subscriptions a expenses y reviews tables
- ✅ Server-side rendering por defecto (sin spinners)
- ✅ Middleware de auth protection
- ✅ Repository pattern para queries (lib/supabase/queries.ts)

---

## Arquitectura Actual

### Estructura del Proyecto
```
pawo/
├── app/
│   ├── (auth)/                 ← Login/Signup
│   ├── (app)/                  ← Protected routes
│   │   ├── home/               ← Balance + quick actions
│   │   ├── expenses/           ← Lista + formulario
│   │   ├── expenses/[id]/      ← Detalle + reviews
│   │   ├── cycle/              ← Progreso + cierre
│   │   ├── settings/           ← Config hogar + ingresos
│   │   └── notifications/      ← Activity feed
│   ├── onboarding/             ← 3-step wizard
│   └── invite/[token]/         ← Landing de invitación
├── lib/
│   ├── supabase/               ← Client, server, queries, middleware
│   ├── balance.ts              ← Lógica de cálculo puro
│   ├── cycle.ts                ← Lógica de fechas
│   └── email.ts                ← Resend integration
├── components/
│   ├── balance/                ← BalanceDisplay (realtime)
│   ├── expenses/               ← ExpensesList, ReviewPanel
│   ├── cycle/                  ← CycleSummary, CloseCycleModal
│   └── household/              ← Invite cards
└── supabase/
    └── migrations/             ← Schema + reviews tables
```

### Patrones de Arquitectura
- **Feature-based pages:** Organización por dominio (expenses, cycle, balance)
- **Server Components default:** Todas las páginas fetchean datos server-side
- **Client Components selective:** Solo BalanceDisplay (realtime) y formularios
- **Repository pattern:** Todas las queries en `lib/supabase/queries.ts`
- **Pure business logic:** Funciones testables en `lib/balance.ts`, `lib/cycle.ts`
- **Server Actions:** Todas las mutations son Next.js Server Actions
- **Realtime subscriptions:** BalanceDisplay se suscribe a cambios en tiempo real

### Base de Datos (Supabase PostgreSQL)
```sql
households          → Hogar, config, división
household_members   → Miembros, ingresos, split %
cycles              → Períodos abiertos/cerrados
expenses            → Gastos del ciclo
reviews             → Solicitudes de revisión
invitations         → Tokens de invitación
```

---

## Lógica de Negocio Core

### Balance Calculation
```typescript
// Para cada ciclo:
totalPaidByA = sum(expenses donde paid_by = A)
totalPaidByB = sum(expenses donde paid_by = B)
totalExpenses = totalPaidByA + totalPaidByB

shouldPayA = totalExpenses * (splitPercentage_A / 100)
shouldPayB = totalExpenses * (splitPercentage_B / 100)

adjustmentA = shouldPayA - totalPaidByA  // positivo = A debe pagar más
adjustmentB = shouldPayB - totalPaidByB
```

### Income-Based Split
```typescript
// Si ambos tienen ingresos:
suggestSplit(incomeA, incomeB) {
  total = incomeA + incomeB
  percentA = (incomeA / total) * 100
  percentB = (incomeB / total) * 100
  return { percentA, percentB }
}
```

### Ciclos
- `start_date` = próxima ocurrencia del `cycle_start_day` configurado
- Al cerrar: `status = 'closed'`, se snapshota `summary` en JSONB
- Se abre automáticamente el siguiente ciclo
- Ciclos cerrados son inmutables (no se pueden editar gastos)

---

## Visión de Producto

### Valores Fundamentales
1. **Claridad sobre fricción:** El balance debe ser entendible al primer vistazo
2. **Flexibilidad sin complejidad:** Múltiples modos de split sin overwhelm UI
3. **Cooperación, no confrontación:** Las reviews son preguntas, no acusaciones
4. **Automatización invisible:** El balance se recalcula sin que el usuario lo pida
5. **Ligereza:** Cada interacción debe ser < 3 clics

### Propuesta de Valor
- Para parejas que comparten gastos pero tienen ingresos distintos
- Alternativa a: split 50/50 (injusto), separar cuentas (molesto), apps contables (frías)
- Propone: split proporcional al ingreso, con transparencia total, sin drama emocional

### Posicionamiento
- **No es:** App de presupuesto, gestor de deuda, herramienta contable
- **Es:** Aplicación de equilibrio y justicia para parejas que conviven

---

## Roadmap Futuro

### Fase 3 — Refinamiento Visual & UX (Próximas 2 semanas)
**Objetivo:** MVP visualmente pulido, sin bugs, listo para beta cerrada

- [ ] Mejorar componentes Orion DS (reemplazar divs custom con componentes)
  - [ ] Componente Alert para errores/éxito
  - [ ] Componente Badge para estados
  - [ ] Sidebar con integración router
  - [ ] Modal real para CloseCycleModal (con overlay)
- [ ] Refinar tipografía, espaciado, colores (usar tokens Orion)
- [ ] Mobile-first responsive (Sidebar colapsable en móvil)
- [ ] Mejorar loading states (skeletons en lugar de spinners)
- [ ] Validación de formularios mejorada (feedback inline)
- [ ] Dark mode (usar ThemeProvider de Orion)

### Fase 4 — Email Real & Notificaciones (Semanas 3-4)
**Objetivo:** Notificaciones funcionales end-to-end

- [ ] Configurar Resend API key (si no está)
- [ ] Email templates en Resend
  - [ ] Invitación con link mágico alternativa a token
  - [ ] Expense notification (con balance preview)
  - [ ] Review request (con pregunta/monto sugerido)
  - [ ] Digest semanal de actividad
- [ ] In-app notification center (mejora a ActivityFeed)
- [ ] Preferencias de notificación (frecuencia, canales)

### Fase 5 — Categorías & Reportes (Semanas 5-6)
**Objetivo:** Insights sobre gastos

- [ ] Categorizar gastos (comida, servicios, ocio, etc.)
- [ ] Dashboard de reportes
  - [ ] Gasto por categoría (pie chart)
  - [ ] Tendencia temporal (line chart)
  - [ ] Top expenses
- [ ] Exportar reporte (PDF/CSV)
- [ ] Filtros de búsqueda avanzada (por fecha, categoría, monto)

### Fase 6 — Características Colaborativas (Semanas 7-8)
**Objetivo:** Conversación sin fricción

- [ ] Comentarios en gastos ("¿Esto incluye propina?")
- [ ] Notas compartidas del ciclo
- [ ] Modo presupuesto: "Este mes queremos gastar < $X"
- [ ] Alertas de límite de gasto

### Fase 7 — Hogares Múltiples & Grupos (Semanas 9-10)
**Objetivo:** Expandir del modelo pareja a otros casos

- [ ] Soporte para 3+ personas en hogar
- [ ] Dividir ciertos gastos de forma selectiva (ej: solo A y B, no C)
- [ ] Grupos para vacaciones de amigos, eventos, etc.
- [ ] Estadísticas de equidad a lo largo del tiempo

### Fase 8 — Seguridad & Compliance (Semanas 11-12)
**Objetivo:** Enterprise-ready

- [ ] Row-Level Security (RLS) en Supabase
- [ ] Autenticación multi-factor (MFA)
- [ ] Auditoría de cambios (quién editó qué, cuándo)
- [ ] GDPR compliance (export/delete de datos personales)
- [ ] Encriptación de datos sensibles

---

## Métrica de Éxito MVP

| Métrica | Meta |
|---|---|
| Flujo completo (signup → ciclo cerrado) | 0 errores |
| Tiempo de onboarding | < 3 min |
| Real-time sync latency | < 1 seg |
| Mobile usability (viewport 375px) | Funcional sin scroll horizontal |
| Email delivery (si Resend activo) | 100% |

---

## Riesgos Identificados

### Técnicos
- **Supabase realtime:** Si hay muchos eventos por segundo, puede haber lag
  - Mitigación: Implementar debouncing/throttling en subscriptions
- **RLS (Row-Level Security) no implementado aún**
  - Mitigación: User_id en queries, pero sin SQL enforcement
  - Acción: Implementar RLS en Fase 8

### Producto
- **Modo income-based es nuevo:** Usuarios pueden no entender cómo se calcula
  - Mitigación: Tutorial/tooltip en onboarding
- **Reviews no son bloqueantes:** Un gasto puede quedar "pendiente" indefinidamente
  - Mitigación: Notificaciones repetidas después de 7 días
- **Ciclos cerrados son inmutables:** Si se cierra con error, no se puede deshacer
  - Mitigación: Confirmación bilateral antes de cerrar, resumen claro

### Operacionales
- **Resend API key:** Sin API key, emails no se envían (graceful degradation activa)
- **Supabase project limits:** Con muchos usuarios, puede haber costos inesperados
  - Mitigación: Monitorear usage, alertas configuradas

---

## Decisiones Arquitectónicas Clave

### Por qué Next.js App Router + Server Components
- ✅ RSC: Datos fetched server-side, no spinners
- ✅ Server Actions: Mutations sin API routes
- ✅ Middleware: Auth protection limpio
- ✅ Incremental Static Regeneration posible para reportes

### Por qué Supabase (no Firebase)
- ✅ PostgreSQL: Relaciones complejas (cycles, reviews, household_members)
- ✅ Realtime: Suscripción nativa a tabla (expenses)
- ✅ Auth: JWT, session handling, email confirmación
- ✅ Costo: Gratuito hasta cierto uso

### Por qué Orion DS
- ✅ Design system consistente (colores, tipografía, componentes)
- ✅ Accesibilidad built-in (ARIA, keyboard nav)
- ✅ Next.js ready (sin conflictos con SSR)
- ⚠️ Componentes complejos requieren more investigation (mitigated con Tailwind fallback)

---

## Próximos Pasos Inmediatos

1. **Test completo del flujo MVP** (hoy)
   - Signup → Onboarding → Invite → Agregar gasto → Cerrar ciclo
   - Reportar cualquier error o visual issue

2. **Arreglar bugs encontrados** (esta semana)
   - Prioridad: Bloqueantes (errores de auth, balance incorrecto)
   - Secundaria: Visual/UX (espaciado, colores, responsive)

3. **Mejorar UI con Orion DS** (semana próxima)
   - Reemplazar divs custom con componentes de Orion
   - Agregar dark mode
   - Responsive mobile-first

4. **Beta cerrada** (2 semanas)
   - Invitar 5-10 parejas a probar
   - Recopilar feedback
   - Iterar según feedback

---

## Documento Generado

Este documento sirve como:
- 📋 **Guía de desarrollo:** Qué se ha hecho, qué falta
- 🗺️ **Roadmap:** Prioridades para los próximos 3 meses
- 💡 **Visión compartida:** Alineación con el equipo
- 📊 **Métrica de éxito:** Qué significa "listo para beta"

**Última actualización:** 13 de Marzo, 2026
**Versión:** MVP 0.1.0
