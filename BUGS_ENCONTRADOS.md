# Bugs Encontrados en Auditoría QA — Pawo

**Fecha de auditoría:** 2026-03-18
**Estado:** Documentado para resolución futura

---

## ✅ Bugs Resueltos (Sprint actual)

### P1: Timezone bug en ciclos de facturación
- **Estado:** RESUELTO (commit 0a1b4e6)
- **Impacto:** Crítico — confusión del usuario, fechas off-by-one
- **Causa:** `new Date("YYYY-MM-DD")` parsea como UTC en vez de local
- **Solución:** Helper `parseLocalDate()` + 10 reemplazos

### P1: requestReviewAction bloquea si payer no tiene email
- **Estado:** RESUELTO (commit 0a1b4e6)
- **Impacto:** Crítico — review nunca se crea
- **Causa:** Check de email antes de `createReview()`
- **Solución:** Email es best-effort, no bloquea creación

### P2: CloseCycleModal Cancel button sin onClick
- **Estado:** RESUELTO (commit 0a1b4e6)
- **Impacto:** Botón no funciona
- **Causa:** Falta handler
- **Solución:** `onClick={() => router.back()}`

### P2: updateIncomeAction descarta income=0
- **Estado:** RESUELTO (commit 0a1b4e6)
- **Impacto:** Medio — usuario no puede setear income a 0 explícitamente
- **Causa:** `monthlyIncome || undefined` es falsy para 0
- **Solución:** `monthlyIncome ?? undefined`

### P2: Double render de review en ExpenseDetailPage
- **Estado:** RESUELTO (commit 0a1b4e6)
- **Impacto:** UX duplicada
- **Causa:** ReviewPanel + Card duplicado mostraban la misma info
- **Solución:** Eliminado bloque Card duplicado

### P3: Email amounts con $ hardcodeado
- **Estado:** RESUELTO (commit 0a1b4e6)
- **Impacto:** Incorrecto para CLP/ARS (mostraba `$10000.00` en vez de `$10.000`)
- **Causa:** `$${amount.toFixed(2)}` en plantillas
- **Solución:** Agregado `currency` param, usé `formatCurrency()`

---

## ⏳ Bugs Pendientes (Próximos sprints)

### ALTA SEVERIDAD

#### Bug: updateIncomeAction mantiene 50/50 si solo un miembro tiene ingreso
- **Archivo:** `app/(app)/settings/actions.ts` líneas 61-72
- **Severidad:** ALTA
- **Descripción:** Cuando el usuario es el primero en registrar ingreso, el split proporcional no se calcula hasta que el partner también registre su ingreso. Queda en 50/50 indefinidamente si el partner no lo hace.
- **Comportamiento actual:**
  ```ts
  if (monthlyIncome && partnerIncome) {
    // solo recalcula si AMBOS tienen ingreso
    const { percentA, percentB } = suggestSplit(...)
  }
  ```
- **Impacto:** Split incorrecto si solo uno de los dos miembros registra ingreso
- **Recomendación:** Evaluar si debería recalcular parcialmente o mostrar UI indicando "pendiente que el partner registre su ingreso"

#### Bug: updateSpaceAction sin verificación de ownership
- **Archivo:** `app/(app)/spaces/[id]/actions.ts` líneas 32-39
- **Severidad:** ALTA (violation of defense-in-depth)
- **Descripción:** El Server Action actualiza un space sin verificar que `user.id === created_by`. La protección depende enteramente de RLS.
- **Impacto:** Condicional — si la política RLS se desactiva o migra incorrectamente, cualquier usuario autenticado puede modificar cualquier space.
- **Recomendación:** Agregar check `if (user.id !== space.created_by) return { error: "..." }` antes de `.update()`

---

### MEDIA SEVERIDAD

#### Bug: Doble renderizado de review en ExpenseDetailPage (PARCIALMENTE RESUELTO)
- **Archivo:** `app/(app)/expenses/[id]/page.tsx` líneas 142-182
- **Status:** ✅ RESUELTO en este sprint
- **Nota:** La lógica de ReviewPanel vs Card duplicada fue eliminada. Pero hay que verificar que ReviewPanel internamente maneja ambos casos (`canRequestReview` Y `canRespond`).

#### Bug: Email format incorrecto para monto en sendReviewRequestEmail
- **Archivo:** `lib/email.ts` líneas 134-135
- **Severidad:** MEDIA
- **Status:** ✅ RESUELTO en este sprint (agregado currency param)

#### Bug: getNextCycleEndDate puede overflow con meses cortos
- **Archivo:** `lib/cycle.ts` línea 28
- **Severidad:** MEDIA (edge case)
- **Descripción:** `new Date(year, month + 1, startDay - 1)` cuando startDay=31 puede producir fechas inválidas en febrero.
- **Contexto:** Esto NO es un problema en práctica porque el form tiene `max="28"`, pero es matemáticamente frágil.
- **Impacto:** Potencial si alguien hace refactoring y permite días 29-31
- **Recomendación:** Agregar validación o documentar el constraint de max=28

#### Bug: closeCycleAction no verifica ownership del ciclo
- **Archivo:** `app/(app)/cycle/actions.ts` líneas 7-59
- **Severidad:** MEDIA
- **Descripción:** El action recibe `cycleId` y `spaceId` del cliente sin verificar que el ciclo pertenece al space del usuario.
- **Impacto:** Explotable si RLS falla
- **Recomendación:** Agregar validación: `if (user.id no está en space_members) return { error: "..." }`

#### Bug: deleteSpaceAction sin check de ownership
- **Archivo:** `app/(app)/spaces/[id]/actions.ts` líneas 55-82
- **Severidad:** MEDIA
- **Descripción:** Sin validación defensiva antes de `.delete()`. Depende enteramente de RLS.
- **Recomendación:** Agregar `if (user.id !== space.created_by) return { error: "..." }`

#### Bug: sendReviewResponseEmail no formatea amount
- **Archivo:** `lib/email.ts` líneas 155-196
- **Severidad:** BAJA-MEDIA
- **Descripción:** La plantilla de respuesta a review no incluye el monto original del expense. Si se agrega en el futuro, usar `formatCurrency()`.

#### Bug: suggestSplit no valida ingresos negativos
- **Archivo:** `lib/balance.ts` líneas 94-102
- **Severidad:** MEDIA
- **Descripción:** `suggestSplit` calcula porcentajes sin validar que los ingresos sean >= 0.
- **Código:**
  ```ts
  const total = incomeA + incomeB;
  if (total === 0) return { percentA: 50, percentB: 50 };
  // Si incomeA es negativo, percentA será negativo
  ```
- **Impacto:** UI debe prevenir ingresos negativos, pero la función pura no valida
- **Recomendación:** Agregar `if (incomeA < 0 || incomeB < 0) throw new Error(...)`

---

### BAJA SEVERIDAD (UX/Deuda técnica)

#### Issue: cycle/page.tsx solo muestra el primer space del usuario
- **Archivo:** `app/(app)/cycle/page.tsx` líneas 23-29
- **Severidad:** BAJA
- **Descripción:** `.limit(1).maybeSingle()` sin orden definido. Si el usuario tiene múltiples spaces, siempre muestra el mismo.
- **Impacto:** Degrada cuando user tiene >1 space
- **Recomendación:** Agregar selector de space activo o mostrar dropdown con opciones

#### Issue: Avatar duplicado entre páginas
- **Archivos:** `spaces/page.tsx` líneas 158-202, `spaces/[id]/page.tsx` líneas 17-46
- **Severidad:** BAJA
- **Descripción:** `AvatarGroup` e `MemberAvatar` duplicados con lógica similar
- **Recomendación:** Extraer a componente reutilizable en `components/MemberAvatar.tsx`

#### Issue: Labels en inglés en screens de ciclos
- **Archivos:** `CreateSpaceModal.tsx` líneas 186-193, `cycle/page.tsx` líneas 83-100
- **Severidad:** BAJA (consistencia)
- **Descripción:** "Cycle starts on day", "Current Cycle", "Period", "Progress" en inglés. App es en español.
- **Labels encontrados:**
  - `CreateSpaceModal`: "Cycle starts on day (1-28)", "Your expense cycles will run from this day each month"
  - `cycle/page.tsx`: "Current Cycle", "Period", "Progress"
- **Recomendación:** Traducir al español consistentemente

#### Issue: Lenguaje mixto español/inglés en spaces/page.tsx
- **Archivo:** `spaces/page.tsx`
- **Severidad:** BAJA
- **Descripción:** "Ciclo actual", "Próximo pago" junto a labels en inglés
- **Recomendación:** Auditoría completa de i18n

#### Issue: get_my_space_ids() no incluye placeholders
- **Archivo:** `supabase/migrations/004_rename_household_to_space.sql` líneas 48-55
- **Severidad:** BAJA
- **Descripción:** La función excluye filas con `user_id = null`. Esto es correcto en la práctica pero difícil de razonar.
- **Impacto:** Los policies confían en este behavior implícito
- **Recomendación:** Documentar el constraint explícitamente

---

## Próximos Pasos para QA

### Verificación de fixes en este sprint
1. ✅ Timezone — crear space con `cycleStartDay=1`, verificar que muestra `"1 abr → 30 abr"`
2. ✅ Email blocks — enviar review sin email del payer, verificar que la review se crea
3. ✅ Cancel button — abrir CloseCycleModal, verificar que Cancel funciona
4. ✅ Income=0 — ingresar 0 en settings, verificar que se guarda
5. ✅ Double render — abrir expense con review pending, verificar que no hay duplicación
6. ✅ Email currency — verificar email recibido con space en CLP muestra monto correcto

### Plan de resolución de bugs pendientes

**Sprint siguiente:**
- [ ] updateIncomeAction split (ALTA)
- [ ] updateSpaceAction ownership (ALTA)
- [ ] closeCycleAction ownership (MEDIA)
- [ ] deleteSpaceAction ownership (MEDIA)

**Deuda técnica (cuando sea):**
- [ ] cycle/page multi-space selector (BAJA)
- [ ] Avatar component extraction (BAJA)
- [ ] Traducir labels de ciclos (BAJA)
- [ ] Documentar get_my_space_ids behavior (BAJA)

---

## Referencia: Archivos con bugs

```
ALTA:
- app/(app)/settings/actions.ts          (split conditional)
- app/(app)/spaces/[id]/actions.ts       (updateSpace ownership)

MEDIA:
- lib/cycle.ts                            (month overflow, edge case)
- app/(app)/cycle/actions.ts              (closeCycle ownership)
- app/(app)/spaces/[id]/actions.ts        (deleteSpace ownership)
- lib/balance.ts                          (negative income validation)
- lib/email.ts                            (review response amount format)

BAJA:
- app/(app)/cycle/page.tsx                (multi-space, labels)
- app/(app)/spaces/page.tsx               (labels, avatar duplicate)
- app/(app)/spaces/[id]/page.tsx          (avatar duplicate)
- supabase/migrations/004_...             (documentation)
```
