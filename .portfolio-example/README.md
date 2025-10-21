# Cómo configurar tus proyectos para que aparezcan automáticamente en tu portfolio

## 📋 Pasos para añadir un proyecto nuevo

Para que un proyecto de GitHub aparezca automáticamente en tu portfolio web, sigue estos pasos:

### 1. Crear la carpeta `.portfolio` en la raíz de tu proyecto

En cualquier repositorio que quieras mostrar en tu portfolio, crea una carpeta llamada `.portfolio` en la raíz del proyecto.

### 2. Añadir el archivo `meta.json`

Dentro de `.portfolio`, crea un archivo `meta.json` con la siguiente estructura:

```json
{
  "publish": true,
  "title": "Nombre de tu Proyecto",
  "short": "Descripción corta del proyecto que aparecerá en la tarjeta",
  "cover": "cover.jpg",
  "order": 10,
  "tags": ["KOTLIN", "ANDROID", "FIREBASE"],
  "readmePath": "README.md"
}
```

**Campos disponibles:**

- `publish` (boolean): Si es `true`, el proyecto se mostrará en el portfolio. Si es `false`, se ignorará.
- `title` (string): El título que aparecerá en la tarjeta del proyecto.
- `short` (string): Descripción corta que se mostrará en la tarjeta.
- `cover` (string): Nombre del archivo de imagen dentro de la carpeta `.portfolio`.
- `order` (number): Orden en el que aparecerá el proyecto (menor número = más arriba).
- `tags` (array): Array de strings con las tecnologías usadas. Valores disponibles:
  - `"JAVA"`
  - `"SPRING"`
  - `"ANGULAR"`
  - `"REACT"`
  - `"KOTLIN"`
  - `"FIREBASE"`
  - `"MAPS"`
  - `"ANDROID"`
  - `"ROOM"`
  - `"TAILWIND"`
  - `"ASTRO"`
- `readmePath` (string, opcional): Ruta al archivo README. Por defecto es `"README.md"`.

### 3. Añadir la imagen de portada

Coloca tu imagen de portada dentro de `.portfolio/` con el nombre que especificaste en `cover` (por ejemplo, `cover.jpg` o `cover.png`).

La imagen debe ser:

- Formato: JPG, PNG o WebP
- Tamaño recomendado: 1200x630px (aspect ratio 16:9)
- Peso máximo recomendado: 500KB

### 4. Estructura final

Tu repositorio debería verse así:

```
tu-proyecto/
├── .portfolio/
│   ├── meta.json
│   └── cover.jpg
├── README.md
├── src/
└── ...
```

### 5. Hacer push a GitHub

Una vez que hayas añadido estos archivos a tu repositorio y hagas push a GitHub, el proyecto aparecerá automáticamente en tu portfolio web en la próxima actualización (se actualiza automáticamente cada vez que haces push al repositorio del portfolio).

## 🔄 Actualización automática

El portfolio se actualiza automáticamente cuando:

- Haces push a la rama `main` del repositorio del portfolio
- El script busca todos tus repositorios públicos
- Solo muestra los que tienen la carpeta `.portfolio` con `publish: true`

## 📝 Notas importantes

1. **Repositorios privados**: Solo funcionará con repositorios públicos de GitHub.
2. **Orden de aparición**: Los proyectos se ordenan por el campo `order` (de menor a mayor).
3. **Tags disponibles**: Solo usa los tags que están definidos en la lista. Si usas un tag no definido, no se mostrará.
4. **Imágenes**: Las imágenes se cargan directamente desde GitHub usando `raw.githubusercontent.com`.

## 🎨 Ejemplo completo

Un ejemplo de `meta.json` para un proyecto de Android:

```json
{
  "publish": true,
  "title": "DogTracker - Monitor de Mascotas",
  "short": "Aplicación Android completa para el monitoreo en tiempo real de mascotas con GPS y notificaciones.",
  "cover": "cover.jpg",
  "order": 2,
  "tags": ["KOTLIN", "ANDROID", "FIREBASE", "MAPS"],
  "readmePath": "README.md"
}
```

## ❓ Solución de problemas

**Mi proyecto no aparece en el portfolio:**

1. Verifica que la carpeta se llame exactamente `.portfolio` (con el punto al inicio)
2. Verifica que `meta.json` esté bien formado (JSON válido)
3. Verifica que `publish` esté en `true`
4. Verifica que el repositorio sea público
5. Espera a que se ejecute el workflow de GitHub Actions

**La imagen no se muestra:**

1. Verifica que el nombre del archivo en `cover` coincida exactamente con el archivo
2. Verifica que la imagen esté dentro de `.portfolio/`
3. Verifica que la imagen sea JPG, PNG o WebP

**Los tags no aparecen:**

1. Verifica que los nombres de los tags coincidan exactamente con los disponibles
2. Recuerda que van en mayúsculas: `"KOTLIN"` no `"kotlin"`
