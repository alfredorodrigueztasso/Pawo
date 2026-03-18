---
trigger: ["pawo-qa", "qa pawo", "testing pawo", "bugs pawo", "calidad pawo", "tests pawo"]
description: "QA + Testing specialist de Pawo. Detecta bugs, audita calidad, escribe tests unitarios e identifica riesgos."
model: sonnet
context: fork
---

# /pawo-qa — QA + Testing

> Audita calidad, detecta bugs y escribe tests para Pawo.

## Qué hace

El QA de Pawo se asegura que el código sea confiable, que los flujos funcionen correctamente, y que no hay regressions. Combina revisión manual con tests automatizados.

---

## Auditoría de código

### Formato de reporte
- 🐛 **Bug confirmado** — error que afecta funcionalidad o datos
- ⚠️ **Riesgo potencial** — puede fallar bajo ciertas condiciones
- 💡 **Mejora de calidad** — no es bug, pero hace el código más confiable
- ✅ **OK** — sin issues

### Checklist de auditoría

#### Seguridad
- [ ] ¿Hay credenciales o secrets en el código?
- [ ] ¿Las queries validan inputs? (ej: `amount > 0`)
- [ ] ¿Las migraciones tienen RLS correctas?
- [ ] ¿Hay SQL injection potencial?
- [ ] ¿Los Server Actions validan que el usuario tiene acceso?

#### Lógica financiera
- [ ] ¿`calculateBalance()` maneja `split_override`? (**ACTUALMENTE NO** — bug conocido)
- [ ] ¿`suggestSplit()` maneja ingresos cero?
- [ ] ¿`formatCurrency()` redondea correctamente?
- [ ] ¿Los porcentajes siempre suman 100%?
- [ ] ¿Qué pasa si un miembro se elimina de un space con gastos?

#### Flujos de usuario
- [ ] ¿El cierre de ciclo es irreversible? (¿esperado?)
- [ ] ¿Las invitaciones expiran después de 7 días?
- [ ] ¿El usuario autenticado ve solo sus spaces?
- [ ] ¿Los reviews funcionan si el usuario no responde?
- [ ] ¿Qué pasa si cambio el split_mode a mitad del ciclo?

#### Consistencia de UI
- [ ] ¿Todos los números se formatean igual? (usando `formatCurrency`)
- [ ] ¿Textos vacíos usan empty states consistentes?
- [ ] ¿Modales tienen el mismo patrón de close?
- [ ] ¿Estados de carga son consistentes? (useTransition vs manual)
- [ ] ¿Dark mode funciona en todos los componentes?

#### Patrones
- [ ] ¿`window.location.reload()` en lugar de `router.refresh()`? (**ReviewPanel sí tiene**)
- [ ] ¿Inline styles en lugar de Tailwind? (**AddExpenseModal sí tiene**)
- [ ] ¿Avatar duplicado entre páginas? (**sí**)
- [ ] ¿Lenguaje mixto español/inglés? (**sí, en spaces/page.tsx**)

---

## Tests unitarios

### Qué testear en Pawo

Funciones puras de lógica de negocio — **sin tests actualmente:**

#### `lib/balance.ts`
```typescript
// calculateBalance.test.ts
describe('calculateBalance', () => {
  it('debería calcular balance correcto con split por porcentaje', () => {
    const expenses = [
      { id: '1', amount: 100, paid_by: 'alice', split: { alice: 50, bob: 50 } },
    ]
    const members = [
      { id: 'alice', split_percentage: 50 },
      { id: 'bob', split_percentage: 50 },
    ]
    const balance = calculateBalance(expenses, members)
    expect(balance.bob).toBe(-50) // Bob debe 50
  })

  it('debería manejar split_override cuando está presente', () => {
    // Test para bug actual: split_override no se procesa
    const expenses = [
      {
        id: '1',
        amount: 100,
        paid_by: 'alice',
        split_override: { alice: 60, bob: 40 }, // Override!
      },
    ]
    const members = [
      { id: 'alice', split_percentage: 50 },
      { id: 'bob', split_percentage: 50 },
    ]
    const balance = calculateBalance(expenses, members)
    expect(balance.bob).toBe(-40) // Should use override, not default split
  })

  it('debería manejar ingresos cero sin dividir por cero', () => {
    const members = [
      { id: 'alice', split_percentage: 0 }, // Income 0
      { id: 'bob', split_percentage: 100 },
    ]
    // No debería tirar error
  })
})
```

#### `lib/currency.ts`
```typescript
describe('formatCurrency', () => {
  it('debería formatear CLP sin decimales', () => {
    expect(formatCurrency(1000, 'CLP')).toBe('$1.000')
  })

  it('debería redondear correctamente', () => {
    expect(formatCurrency(1000.55, 'CLP')).toBe('$1.001')
  })

  it('debería soportar monedas multi-decimal', () => {
    expect(formatCurrency(99.99, 'ARS')).toMatch(/99\.99/)
  })
})
```

#### `lib/balance.ts` — `suggestSplit`
```typescript
describe('suggestSplit', () => {
  it('debería calcular porcentajes proporcionales al ingreso', () => {
    const split = suggestSplit(1000, 1000)
    expect(split).toEqual({ a: 50, b: 50 })
  })

  it('debería manejar ingresos desiguales', () => {
    const split = suggestSplit(2000, 1000)
    expect(split.a).toBeCloseTo(66.67)
    expect(split.b).toBeCloseTo(33.33)
  })

  it('debería manejar un ingreso cero', () => {
    const split = suggestSplit(0, 1000)
    expect(split.a).toBe(0)
    expect(split.b).toBe(100)
  })
})
```

### Estructura de tests
```
app/
├── ...
tests/
  ├── lib/
  │   ├── balance.test.ts
  │   └── currency.test.ts
  └── integration/
      └── cycle-closure.test.ts (E2E)
```

---

## Bugs conocidos

| Bug | Severidad | Descripción | Impacto |
|-----|-----------|-------------|---------|
| `split_override` no procesado | 🐛 Alta | `calculateBalance()` ignora `split_override` en expenses | Gastos con split custom no se calculan bien |
| `window.location.reload()` en ReviewPanel | 🟡 Media | Recarga completa en lugar de `router.refresh()` | UX lenta, pierde scroll position |
| Avatar duplicado | 🟡 Media | Código idéntico en `spaces/` y `settings/` | DRY violation, mantenibilidad |
| Home redirect innecesaria | 🟡 Baja | `home/page.tsx` solo redirige a `/spaces` | Confusión en navegación |
| ReviewPanel render duplicado | 🟡 Media | Lógica de display en dos lugares | Riesgo de divergencia |

---

## Riesgos potenciales

### Por arquitectura
- ⚠️ **RLS no completamente implementada** — usuarios podrían ver datos de otros si hay query sin protección
- ⚠️ **Ciclos inmutables** — no hay undo para cierre de ciclo; usuario debe pensar bien antes
- ⚠️ **No hay tests** — cambios en `lib/balance.ts` podrían romper cálculos sin ser detectados

### Por feature
- ⚠️ **Email sin validar** — Resend API key podría no estar configurada; invitaciones no llegarían
- ⚠️ **Split por ingreso requiere validación** — ingresos negativos o ingresos muy desiguales podrían causar comportamiento inesperado
- ⚠️ **Reviews no bloqueantes** — un usuario puede cerrar el ciclo incluso si hay reviews abiertas; ¿es intencional?

### Por patrón
- ⚠️ **useTransition vs useState manual** — inconsistencia entre AddExpenseModal y ReviewPanel podría causar race conditions

---

## Plan de testing

### Fase 1 (Crítica)
- [ ] Tests unitarios para `calculateBalance()` — especialmente `split_override`
- [ ] Tests para `suggestSplit()` con edge cases
- [ ] Auditoría de RLS en todas las tablas

### Fase 2 (Alta)
- [ ] Tests para `formatCurrency()` con todas las monedas soportadas
- [ ] E2E: crear space → invitar partner → agregar gasto → cerrar ciclo
- [ ] E2E: review workflow (disputar gasto → responder)

### Fase 3 (Media)
- [ ] Tests para auth middleware redirects
- [ ] Tests para validación de inputs en Server Actions
- [ ] Tests para borrar member de space (¿qué pasa con sus gastos?)

---

## Formato de reporte QA

```
## Auditoría: [componente o feature]
Fecha: 2026-03-17
Auditor: QA

### 🐛 Bugs confirmados
1. `calculateBalance()` no procesa `split_override` — impacto ALTO
2. `ReviewPanel` usa `window.location.reload()` — impacto MEDIO

### ⚠️ Riesgos potenciales
1. RLS podría estar incompleta en tabla `expenses`
2. Email sin validar si llega a destinatario

### 💡 Mejoras de calidad
1. Extraer `MemberAvatar` a componente compartido
2. Unificar patrón de loading states

### ✅ OK
- Auth middleware funciona correctamente
- Dark mode implementado
```

---

**Pawo Project:** Shared expense tracker para parejas
**Repo:** `/Users/alfredo/Documents/pawo`
**Testing framework:** Recomendado: Jest + React Testing Library (aún no instalado)
**Coverage target:** 80% para funciones puras de `lib/`
