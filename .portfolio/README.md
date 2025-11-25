# 🚀 Añadir Proyecto al Portfolio

Guía rápida para configurar un nuevo repositorio y que se sincronice automáticamente con el portfolio.

## 📁 Archivos a Crear

Crea la siguiente estructura en tu repositorio:

```
tu-proyecto/
├── .github/
│   └── workflows/
│       └── notify-portfolio.yml
└── .portfolio/
    ├── meta.json
    └── cover.webp (o cover.png/jpg)
```

---

## 1️⃣ Archivo `.portfolio/meta.json`

Crea el archivo con esta estructura:

```json
{
  "title": "Nombre descriptivo del proyecto",
  "description": "Descripción completa del proyecto, qué hace y para qué sirve",
  "website": "https://tu-proyecto.com",
  "coverImage": "cover.webp",
  "tags": ["TAG1", "TAG2", "TAG3"]
}
```

**Campos:**
- `title`: Nombre del proyecto
- `description`: Descripción detallada
- `website`: URL del proyecto desplegado (o URL del repo si no está desplegado)
- `coverImage`: Nombre del archivo de imagen (debe estar en `.portfolio/`)
- `tags`: Array de tags (ver tags disponibles abajo)

---

## 2️⃣ Archivo `.github/workflows/notify-portfolio.yml`

Crea el workflow con este contenido exacto:

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

**⚠️ Importante:** Usa tabulaciones (tabs) para la indentación, no espacios.

---

## 3️⃣ Imagen de Portada

- **Ubicación:** `.portfolio/cover.webp` (o `.portfolio/cover.png` / `.portfolio/cover.jpg`)
- **Tamaño recomendado:** 1200x630px (ratio 16:9)
- **Formato:** WebP (recomendado), PNG o JPG

---

## 🏷️ Tags Disponibles

**✨ Sistema Automatizado de Iconos**

El sistema ahora descarga automáticamente los iconos desde [Simple Icons](https://simpleicons.org/) para cualquier tag que uses. **No necesitas mantener una lista de tags permitidos** - simplemente usa el nombre de la tecnología en tu `meta.json` y el sistema encontrará el icono automáticamente.

**Ejemplos de tags que funcionan:**
- `HTML`, `CSS`, `JavaScript`, `TypeScript`
- `Bootstrap`, `Tailwind CSS`, `jQuery`
- `React`, `Angular`, `Vue`, `Next.js`
- `Java`, `Spring Boot`, `Node.js`
- `Python`, `Django`, `Flask`
- `Docker`, `Kubernetes`, `Git`
- Y cualquier otra tecnología que esté en Simple Icons

**Ejemplo en `meta.json`:**
```json
{
  "tags": ["HTML", "CSS", "Bootstrap", "jQuery"]
}
```

El sistema automáticamente:
1. Buscará el icono en Simple Icons
2. Lo descargará en `public/icons/`
3. Lo mostrará en el portfolio

Si un tag no tiene icono disponible, se mostrará sin icono pero con el nombre del tag.

---

## 🔑 Configurar Token (Solo una vez por proyecto)

Para que el workflow funcione, necesitas añadir un secret en tu repositorio:

1. Ve a **Settings → Secrets and variables → Actions**
2. Click en **"New repository secret"**
3. **Name:** `PORTFOLIO_DISPATCH_TOKEN`
4. **Secret:** Pega tu token de GitHub (Personal Access Token con scope `repo`)
5. Click en **"Add secret"**

---

## ✅ Listo

Una vez creados los archivos y configurado el token:

1. Haz commit y push a `main`
2. El workflow se ejecutará automáticamente
3. El portfolio se actualizará automáticamente
4. Tu proyecto aparecerá en el portfolio

**No necesitas:**
- ❌ Editar ningún archivo en el repositorio del portfolio
- ❌ Hacer push manual al portfolio
- ❌ Ejecutar ningún script

---

## 📝 Ejemplo Completo

Ver `meta.json` en esta misma carpeta para un ejemplo funcional.

