---
trigger: ["pawo-backend", "backend pawo", "supabase pawo", "query pawo", "migration pawo", "server action pawo"]
description: "Backend Developer de Pawo. Implementa Server Actions, queries, migraciones SQL y RLS en Supabase."
model: haiku
context: fork
---

# /pawo-backend — Backend + Supabase

> Especialista en lógica de servidor, queries y persistencia en Supabase para Pawo.

## Qué hace

Implementa la lógica de negocio del servidor: Server Actions, consultas a la BD, migraciones SQL, y Row Level Security (RLS).

---

## Server Actions

Ubicación: `actions.ts` en cada feature folder

### Patrón canónico
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createExpense as dbCreateExpense } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'

export async function createExpense(formData: CreateExpenseInput) {
  // 1. Validar inputs
  if (!formData.amount || formData.amount <= 0) {
    throw new Error('Monto debe ser mayor a 0')
  }

  // 2. Obtener sesión (middleware ya validó usuario)
  const client = await createClient()

  // 3. Ejecutar lógica
  const expense = await dbCreateExpense(client, {
    space_id: formData.space_id,
    amount: formData.amount,
    description: formData.description,
    // ... otros campos
  })

  // 4. Revalidar UI
  revalidatePath(`/spaces/${formData.space_id}`)

  return expense
}
```

### Checklist Server Action
- [ ] Marcado con `'use server'`
- [ ] Valida inputs antes de tocar DB
- [ ] Usa cliente de Supabase obtenido con `createClient()`
- [ ] Llama a query centralizada de `lib/supabase/queries.ts`
- [ ] Revalida path relevante con `revalidatePath()` o `router.refresh()`
- [ ] Maneja errores: no expone detalles de BD al cliente
- [ ] No usa `window` o APIs del navegador

---

## Queries — Repository Pattern

Ubicación: `lib/supabase/queries.ts`

### Patrón: Función que recibe client
```typescript
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

export async function createExpense(
  client: SupabaseClient<Database>,
  data: {
    space_id: string
    amount: number
    description: string
    paid_by: string
    split_percentage?: Record<string, number>
  }
) {
  const { data: expense, error } = await client
    .from('expenses')
    .insert({
      space_id: data.space_id,
      amount: data.amount,
      description: data.description,
      paid_by: data.paid_by,
      split_override: data.split_percentage || null,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return expense
}

export async function getExpenses(
  client: SupabaseClient<Database>,
  spaceId: string
) {
  const { data, error } = await client
    .from('expenses')
    .select('*, reviews(*)')
    .eq('space_id', spaceId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
```

### Ventajas del patrón
- Fácil de testear (mockear el client)
- Reutilizable en Server Actions y Server Components
- Centraliza acceso a datos
- RLS se aplica automáticamente (confía en sesión del client)

---

## Data Model de Pawo

```sql
spaces
  ├── id (uuid, pk)
  ├── name, currency, split_mode ('income'|'manual')
  ├── cycle_start_day, owner_id
  ├── created_at

space_members
  ├── space_id, user_id (fk)
  ├── role, income, split_percentage
  └── joined_at

cycles
  ├── id, space_id (fk)
  ├── status ('open'|'closed')
  ├── summary (JSONB snapshot)
  ├── started_at, closed_at

expenses
  ├── id, space_id (fk), cycle_id (fk)
  ├── amount, description, currency
  ├── paid_by (user_id)
  ├── split_override (JSONB, opcional)
  ├── current_review_id (fk → reviews)
  └── created_at

reviews
  ├── id, expense_id (fk)
  ├── initiated_by, response_from
  ├── question, answer
  ├── status ('open'|'resolved')
  └── created_at, resolved_at

invitations
  ├── token (uuid, pk)
  ├── space_id (fk)
  ├── invited_email
  ├── expires_at (TTL 7 días)

profiles
  ├── user_id (fk → auth.users)
  ├── avatar_url
  └── updated_at
```

---

## RLS (Row Level Security)

Patrón de Pawo: `SECURITY DEFINER` con función helper

### Función base (ya existe)
```sql
CREATE FUNCTION get_my_space_ids()
RETURNS TABLE(space_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT sm.space_id
  FROM space_members sm
  WHERE sm.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Policy para SELECT
```sql
CREATE POLICY "Users can see their spaces"
ON spaces
FOR SELECT
USING (id IN (SELECT get_my_space_ids()));
```

### Policy para INSERT/UPDATE/DELETE
```sql
CREATE POLICY "Users can modify their spaces"
ON spaces
FOR UPDATE
USING (id IN (SELECT get_my_space_ids()))
WITH CHECK (id IN (SELECT get_my_space_ids()));
```

### Checklist para nueva tabla
- [ ] Crear policies SELECT (lectura)
- [ ] Crear policies INSERT (creación)
- [ ] Crear policies UPDATE (si aplica)
- [ ] Crear policies DELETE (si aplica)
- [ ] Usar `get_my_space_ids()` para espacios privados
- [ ] Usar `auth.uid()` para datos de usuario
- [ ] Testear que un usuario NO ve datos de otro space

---

## Migraciones SQL

Ubicación: `supabase/migrations/`

### Patrón de nombre
```
YYYYMMDD_HHMMSS_descripcion_breve.sql
```

### Template
```sql
-- Add new column to expenses for split override
ALTER TABLE expenses
ADD COLUMN split_override JSONB DEFAULT NULL;

-- Index para queries rápidas
CREATE INDEX idx_expenses_split_override ON expenses USING GIN (split_override);

-- RLS: Users can see split_override in their expenses
-- (políticas ya existen para expenses, no hay que agregar)

-- Rollback:
-- ALTER TABLE expenses DROP COLUMN split_override;
-- DROP INDEX idx_expenses_split_override;
```

### Checklist para migración
- [ ] Nombre descriptivo y fecha
- [ ] Comentarios explicativos
- [ ] Crear índices si es columna que se filtra
- [ ] Actualizar RLS si es nueva tabla
- [ ] Incluir rollback al final como comentario
- [ ] No rompe políticas RLS existentes
- [ ] Compatible con schema actual

---

## Auth middleware y callback

### Middleware (`lib/supabase/middleware.ts`)
- Refresca la sesión en cada request
- Redirige usuarios sin sesión a `/login`
- Redirige usuarios autenticados que intentan ir a `/login` a `/spaces`
- Excluye rutas públicas: `/auth/*`, `/invite/*`, `/onboarding`

### Callback route (`app/auth/callback/route.ts`)
- Maneja OAuth redirect y magic link de Supabase
- Crea sesión segura
- Redirige a `/onboarding` si es first-time signup o a `/spaces` si ya existe

---

## Lógica de negocio — lib/balance.ts

Funciones puras para cálculo financiero:
- `calculateBalance(expenses, members)` — retorna quién debe cuánto
- `suggestSplit(incomeA, incomeB)` — porcentajes proporcionales
- `calculateSoloBalance(expenses, userId)` — para usuario solo

**Bug conocido:** `split_override` está definido en tipos pero NO se procesa en `calculateBalance()`. Pendiente implementación.

---

## Checklist para feature nueva con backend

- [ ] Crear/actualizar tabla con migración SQL
- [ ] Escribir políticas RLS
- [ ] Agregar queries a `lib/supabase/queries.ts`
- [ ] Crear Server Actions en `actions.ts`
- [ ] Validar inputs en Server Action antes de DB
- [ ] Testear RLS: usuario A NO ve datos de usuario B
- [ ] Documentar querystring: qué campos, qué retorna

---

**Pawo Project:** Shared expense tracker para parejas
**Repo:** `/Users/alfredo/Documents/pawo`
**DB:** Supabase (PostgreSQL 15+)
**Auth:** Supabase Auth + @supabase/ssr
**RLS:** Implementada con pattern SECURITY DEFINER
