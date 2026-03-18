---
trigger: ["pawo-commit", "commit pawo", "push pawo", "pawo push"]
description: "Revisa ramas, crea commit de los cambios actuales y hace push a main en el repo de Pawo"
model: haiku
context: fork
---

# /pawo-commit Skill

> Automatiza el flujo git de Pawo: revisa estado, commitea y hace push a main.

## Qué hace

El skill opera siempre en `/Users/alfredo/Documents/pawo`.

1. **Revisa el estado del repo**
   - `git branch` para ver rama actual
   - `git status` para ver archivos modificados y sin trackear
   - `git diff` para ver cambios staged y unstaged

2. **Revisa el historial reciente**
   - `git log --oneline -5` para mantener el estilo de mensajes del proyecto

3. **Construye y ejecuta el commit**
   - Hace `git add` de los archivos relevantes (NUNCA `.env.local`, `node_modules/`, `.next/`)
   - Genera un mensaje de commit descriptivo del "por qué", no del "qué"
   - Usa heredoc para el mensaje: `git commit -m "$(cat <<'EOF'... EOF)"`
   - Agrega `Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>`

4. **Push a main**
   - `git push origin main`
   - Confirma con el hash del commit y un resumen de archivos incluidos

## Casos especiales

- Si no hay cambios → informa al usuario y no crea commit vacío
- Si hay archivos sensibles detectados (`.env*`) → los excluye y avisa
- Si el push falla → muestra el error completo sin reintentar

## Cómo usarlo

```
/pawo-commit
```

Commitea todos los cambios actuales con un mensaje generado automáticamente.

```
/pawo-commit "mensaje personalizado"
```

Usa el mensaje provisto en lugar de generarlo.

---

Repo: `/Users/alfredo/Documents/pawo`
Remote: `https://github.com/alfredorodrigueztasso/Pawo.git`
Branch principal: `main`
