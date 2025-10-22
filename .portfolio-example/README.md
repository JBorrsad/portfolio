# 🚀 Configurar Auto-Sync para Proyectos del Portfolio

## ⚡ Prompt para IA (Copia y Pega)

Copia el siguiente prompt y pégalo en un chat con una IA (Cursor, Claude, ChatGPT, etc.) cuando estés en el repositorio del proyecto que quieres añadir a tu portfolio:

```
Necesito configurar este repositorio para que aparezca AUTOMÁTICAMENTE en mi portfolio web personal.

Debes crear la siguiente estructura:

1. Crear la carpeta `.portfolio` en la raíz del proyecto
2. Crear el archivo `.portfolio/meta.json` con esta estructura:

{
  "title": "[Nombre descriptivo del proyecto]",
  "description": "[Descripción detallada del proyecto, qué hace, para qué sirve]",
  "website": "[URL del proyecto desplegado, si aplica, sino la URL del repo]",
  "coverImage": "cover.webp",
  "tags": ["TAG1", "TAG2", "TAG3"]
}

3. Crear el archivo `.github/workflows/notify-portfolio.yml` con este contenido EXACTO:

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

4. Si no existe una imagen de portada, sugiéreme qué tipo de imagen debería usar

TAGS DISPONIBLES (elige solo los que apliquen):
- "JAVA"
- "SPRING"
- "ANGULAR"
- "REACT"
- "NEXTJS"
- "KOTLIN"
- "FIREBASE"
- "MAPS"
- "ANDROID"
- "ROOM"
- "TAILWIND"
- "ASTRO"

IMPORTANTE:
- Analiza el código del repositorio actual para determinar qué tags usar
- Escribe una descripción profesional y técnica
- El título debe ser claro y descriptivo
- Si el proyecto tiene un README, úsalo como referencia
- La coverImage debe ser "cover.webp", "cover.png" o "cover.jpg" (el archivo debe estar en .portfolio/)
- Crea la carpeta .github/workflows/ si no existe
- El workflow DEBE tener exactamente ese formato con las tabulaciones correctas

Genera TODOS los archivos necesarios para este proyecto.
```

---

## 📋 Configuración Manual

Si prefieres hacerlo manualmente, sigue estos pasos:

### 1. Crear la estructura

```
tu-proyecto/
├── .github/
│   └── workflows/
│       └── notify-portfolio.yml
├── .portfolio/
│   ├── meta.json
│   └── cover.webp
├── README.md
└── src/
```

### 2. Archivo `meta.json`

```json
{
  "title": "Nombre descriptivo del proyecto",
  "description": "Descripción completa del proyecto, qué hace y para qué sirve",
  "website": "https://tu-proyecto.com",
  "coverImage": "cover.webp",
  "tags": ["KOTLIN", "ANDROID", "FIREBASE"]
}
```

### 3. Workflow de notificación

Crea `.github/workflows/notify-portfolio.yml`:

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

### 4. Tags disponibles

```
JAVA, SPRING, ANGULAR, REACT, NEXTJS, KOTLIN,
FIREBASE, MAPS, ANDROID, ROOM, TAILWIND, ASTRO
```

### 5. Imagen de portada

- **Formatos:** WebP, PNG o JPG
- **Tamaño recomendado:** 1200x630px (16:9)
- **Ubicación:** `.portfolio/cover.webp`

---

## 🔑 Configuración del Token (Solo una vez)

Para que los proyectos puedan notificar al portfolio automáticamente, necesitas configurar un token:

### 1. Crear un Personal Access Token en GitHub

1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click en "Generate new token (classic)"
3. Nombre: `Portfolio Dispatch Token`
4. Scopes necesarios: Marca **solo** `repo` (acceso completo a repositorios)
5. Genera el token y **cópialo** (no podrás verlo de nuevo)

### 2. Añadir el token a cada proyecto

En **cada repositorio** que quieras añadir al portfolio:

1. Ve a Settings → Secrets and variables → Actions
2. Click en "New repository secret"
3. Name: `PORTFOLIO_DISPATCH_TOKEN`
4. Secret: Pega el token que copiaste
5. Click en "Add secret"

**⚠️ Importante:** Debes hacer esto en cada repositorio que quieras que se sincronice automáticamente.

---

## 🔄 Cómo Funciona

Una vez configurado:

1. ✅ Añades `.portfolio/` y el workflow a tu proyecto
2. ✅ Haces commit y push
3. ✅ El workflow se ejecuta automáticamente
4. ✅ Dispara un rebuild del portfolio
5. ✅ Tu proyecto aparece en https://juan-borras.es

**No necesitas:**

- ❌ Editar `repositories.json`
- ❌ Hacer push al repositorio del portfolio
- ❌ Ejecutar nada manualmente

---

## 📖 Ejemplo Completo

Ver el archivo `meta.json` en esta misma carpeta para un ejemplo funcional.
