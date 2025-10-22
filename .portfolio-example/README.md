# 🚀 Configurar Auto-Sync para Proyectos del Portfolio

## ⚡ Prompt para IA (Copia y Pega)

Copia el siguiente prompt y pégalo en un chat con una IA (Cursor, Claude, ChatGPT, etc.) cuando estés en el repositorio del proyecto que quieres añadir a tu portfolio:

```
Necesito configurar este repositorio para que aparezca en mi portfolio web personal que usa un sistema de auto-sync.

Debes crear la estructura necesaria:

1. Crear la carpeta `.portfolio` en la raíz del proyecto
2. Crear el archivo `.portfolio/meta.json` con esta estructura:

{
  "title": "[Nombre descriptivo del proyecto]",
  "description": "[Descripción detallada del proyecto, qué hace, para qué sirve]",
  "website": "[URL del proyecto desplegado, si aplica, sino la URL del repo]",
  "coverImage": "cover.webp",
  "tags": ["TAG1", "TAG2", "TAG3"]
}

3. Si no existe una imagen de portada, sugiéreme qué tipo de imagen debería usar para este proyecto

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

Genera los archivos necesarios para este proyecto.
```

---

## 📋 Configuración Manual

Si prefieres hacerlo manualmente, sigue estos pasos:

### 1. Crear la estructura

```
tu-proyecto/
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

### 3. Tags disponibles

```
JAVA, SPRING, ANGULAR, REACT, NEXTJS, KOTLIN,
FIREBASE, MAPS, ANDROID, ROOM, TAILWIND, ASTRO
```

### 4. Imagen de portada

- **Formatos:** WebP, PNG o JPG
- **Tamaño recomendado:** 1200x630px (16:9)
- **Ubicación:** `.portfolio/cover.webp`

---

## 🔄 Actualización Automática

El portfolio se actualiza automáticamente cuando:

- Haces push al repositorio del portfolio
- Los proyectos se ordenan por fecha del último commit
- Solo se muestran repos con carpeta `.portfolio/`

---

## 📖 Ejemplo Completo

Ver el archivo `meta.json` en esta misma carpeta para un ejemplo funcional.
