# 🔄 Migración a Sistema Automático

## ✅ Cambios Realizados

El portfolio ahora es **100% automático**. Ya no necesitas editar `repositories.json` ni hacer push al portfolio.

### Qué cambió:

1. ❌ **Eliminado:** `src/data/repositories.json`
2. ✅ **Nuevo:** Búsqueda automática de todos los repos con `.portfolio/`
3. ✅ **Nuevo:** Sistema de notificación desde cada proyecto

---

## 📋 Qué Hacer Ahora

### Para proyectos EXISTENTES (haion, portfolio):

Necesitas añadir el workflow de notificación a cada uno:

1. Crea `.github/workflows/notify-portfolio.yml` en cada proyecto:

```yaml
name: Notify Portfolio on Update

on:
  push:
    branches: ["main"]
  workflow_dispatch:

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger portfolio rebuild
        run: |
          curl -X POST \
            -H "Accept: application/vnd.github.v3+json" \
            -H "Authorization: token ${{ secrets.PORTFOLIO_DISPATCH_TOKEN }}" \
            https://api.github.com/repos/JBorrsad/portfolio/dispatches \
            -d '{"event_type":"project-updated"}'
```

2. Añade el secret `PORTFOLIO_DISPATCH_TOKEN` en Settings → Secrets and variables → Actions de cada proyecto

### Para proyectos NUEVOS (como clinica-sada-borras):

Simplemente usa el prompt del README que ya incluye todo automáticamente.

---

## 🔑 Configurar el Token

### 1. Crear el token (solo una vez):

1. Ve a https://github.com/settings/tokens
2. Generate new token (classic)
3. Nombre: `Portfolio Dispatch Token`
4. Scopes: Solo marca `repo`
5. Copia el token

### 2. Añadirlo a cada proyecto:

Para cada repositorio (haion, clinica-sada-borras, futuros):

1. Settings → Secrets and variables → Actions
2. New repository secret
3. Name: `PORTFOLIO_DISPATCH_TOKEN`
4. Value: [pega el token]
5. Add secret

---

## 🎉 Resultado

Después de esto:

- ✅ Haces push a cualquier proyecto con `.portfolio/`
- ✅ Se dispara automáticamente el rebuild del portfolio
- ✅ Los cambios aparecen en https://juan-borras.es
- ✅ **No tienes que tocar nada más**
