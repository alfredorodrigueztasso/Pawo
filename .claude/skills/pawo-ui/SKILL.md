---
trigger: ["pawo-ui", "frontend pawo", "componente pawo", "ui pawo", "diseño ui pawo", "orion pawo"]
description: "Frontend Developer de Pawo. Construye UI usando Orion DS siguiendo patrones canónicos del proyecto."
model: haiku
context: fork
---

# /pawo-ui — Frontend + Design System

> Especialista en construir UI con Orion DS siguiendo los patrones canónicos de Pawo.

## Qué hace

Implementa interfaces de usuario usando Orion DS (`@orion-ds/react`), respetando los patrones visuales y de interacción que hacen a Pawo coherente y delightful.

---

## Componentes de Orion DS disponibles

### Contenedores y layouts
- **Card** — contenedor universal, usado en listas y grillas
- **Modal** + **Modal.Header** + **Modal.Body** — diálogos, con hook `useDisclosure`
- **Sidebar** (si está disponible en 4.2.10) — navegación lateral

### Formularios
- **Field** — input text, email, number (con validación inline opcional)
- **Select** — dropdown de opciones
- **Textarea** — multi-line text
- **ToggleGroup** + **ToggleGroup.Item** — selector de múltiples opciones (no exclusivas)

### Feedback
- **Alert** — variantes: error, warning, success, info (con ícono y color)
- **Badge** — etiquetas para estado/categoría (variantes: warning, success, info)
- **useToast + toast()** — notificaciones efímeras post-acción

### Navegación y usuario
- **Button** — primario/secundario, con `disabled`, `onClick`, variant cargando
- **UserMenu** — menú del usuario con secciones e items
- **Tabs** (si disponible) — navegación horizontal

---

## Patrones canónicos de Pawo

### Patrón: Modal con formulario
```tsx
'use client'
import { useDisclosure } from '@orion-ds/react'
import { useTransition } from 'react'
import { createExpense } from './actions'

export function AddExpenseModal() {
  const { isOpen, open, close } = useDisclosure()
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e) => {
    e.preventDefault()
    startTransition(async () => {
      await createExpense(formData)
      close()
      router.refresh()
    })
  }

  return (
    <>
      <Button onClick={open}>Add Expense</Button>
      <Modal open={isOpen} onClose={close}>
        <Modal.Header>Agregar gasto</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Field label="Monto" name="amount" type="number" />
            <Button type="submit" disabled={isPending}>
              {isPending ? "Agregando..." : "Agregar"}
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </>
  )
}
```

### Patrón: Empty state
```tsx
<Card className="p-8 text-center">
  <p className="text-primary font-semibold">No hay gastos</p>
  <p className="text-sm text-tertiary mt-1">
    Comienza agregando tu primer gasto
  </p>
  <Button className="mt-6" onClick={openModal}>
    Agregar gasto
  </Button>
</Card>
```

### Patrón: Grilla de stats
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <Card className="p-6">
    <p className="text-sm text-tertiary">Total del ciclo</p>
    <p className="text-3xl font-bold text-brand">$450.000</p>
  </Card>
  {/* Más stats */}
</div>
```

### Patrón: Filtro con ToggleGroup
```tsx
<ToggleGroup value={selectedMember} onValueChange={setSelectedMember}>
  <ToggleGroup.Item value="all">Todos</ToggleGroup.Item>
  <ToggleGroup.Item value="alfredo">Alfredo</ToggleGroup.Item>
  <ToggleGroup.Item value="partner">Partner</ToggleGroup.Item>
</ToggleGroup>
```

### Patrón: Avatar custom (sin Orion, patrón de Pawo)
```tsx
export function MemberAvatar({ member }) {
  const color = AVATAR_COLORS[member.name.charCodeAt(0) % 5]
  return member.avatar_url ? (
    <img src={member.avatar_url} className="w-10 h-10 rounded-full" />
  ) : (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
      <span className="text-xs font-bold text-white">
        {member.name.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}
```

---

## Tipografía y tokens

Usar consistentemente los tokens de Orion DS:

| Clase | Uso |
|-------|-----|
| `text-primary` | Texto principal, importante |
| `text-secondary` | Texto de soporte, descripción |
| `text-tertiary` | Labels, metadata, hints |
| `text-brand` | Valores monetarios destacados, énfasis |
| `font-bold text-4xl` | Títulos de página (h1) |
| `font-semibold text-base` | Subtítulos de sección (h2) |
| `font-semibold text-sm` | Labels de field |

Dark mode:
- Usar clases con prefijo `dark:` cuando sea necesario
- Orion DS maneja `data-theme="dark"` automáticamente
- Logos especiales: `.logo-dark` oculto, `.logo-light` visible en dark mode

---

## Spacing y layout

Usar Tailwind classes:
- `space-y-6` en lugar de `style={{ gap: '...' }}`
- `stack stack-gap-6` para layouts flex (ya presente en el proyecto)
- `p-6`, `p-8` para padding interno
- `gap-4` en grillas

---

## Checklist para implementar un componente

- [ ] Usar `'use client'` si es interactivo
- [ ] Importar de `@orion-ds/react/client` para componentes interactivos
- [ ] Usar `useTransition + isPending` para loading states
- [ ] Usar `useDisclosure` para modales
- [ ] Usar `useToast()` para feedback post-acción
- [ ] Respetar la tipografía (text-primary, text-secondary, etc.)
- [ ] Usar `space-y-{n}` para spacing entre elementos, no inline styles
- [ ] Validar que dark mode funciona (si hay logos/colores custom)
- [ ] Idioma consistente (español para UI)
- [ ] Accesible: labels en Fields, ARIA si necesario, navegación keyboard en Modales

---

## Anti-patrones a evitar

❌ `style={{ display: 'flex', gap: '...' }}` → ✅ Usar `space-y-6` o clases Tailwind
❌ `useState` para loading → ✅ Usar `useTransition`
❌ `window.location.reload()` → ✅ Usar `router.refresh()`
❌ Texto en inglés en UI → ✅ Español natural
❌ Colores hardcoded → ✅ Usar tokens de Orion (`text-brand`, etc.)
❌ Modales con lógica compleja → ✅ Extraer a Client Component separado

---

## Orion DS 4.2.10 en Pawo

La upgrade a 4.2.10 trajo 60+ componentes nuevos. Pawo está en Fase 3 del roadmap: **Pulir UI con Orion DS, dark mode, mobile-first.**

Prioridad:
1. Reemplazar componentes custom con Orion (si existen)
2. Implementar Alert, Badge, Modal, Select correctamente
3. Validación inline en Fields
4. Dark mode en todos los componentes
5. Responsive mobile-first: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

---

**Pawo Project:** Shared expense tracker para parejas
**Repo:** `/Users/alfredo/Documents/pawo`
**Design System:** Orion DS 4.2.10 (@orion-ds/react)
**Styling:** Tailwind CSS v4 + custom tokens en globals.css
