# What2Play 🎮

What2Play es una plataforma de recomendación de videojuegos y hardware inteligente. Su objetivo es permitir a los usuarios descubrir a qué juegos pueden jugar basándose en los componentes reales de su computadora (CPU, GPU, RAM, etc.), utilizando un sistema automatizado de puntuación de hardware basado en benchmarks comprobados.

## 🏗️ Arquitectura de la Aplicación

El proyecto está dividido en dos partes principales: un **Frontend** moderno en React que proporciona una experiencia de usuario interactiva y fluida, y un **Backend** robusto en Node.js que maneja la extracción constante de datos, cruce de componentes difusos y comunicación con la base de datos MongoDB.

La arquitectura se compone de los siguientes módulos clave:

### 1. Frontend (React)
Diseñado con un enfoque estético *Glassmorphism* oscuro, priorizando animaciones fluidas y microinteracciones para una experiencia *premium*.
- **MainPage**: La página de aterrizaje con un Hero Section espectacular, seguido de secciones explicativas como `Features` y `HowItWorks`. Todo renderizado sobre un fondo dinámico de estrellas y auroras.
- **RecoPage**: La página principal de utilidad donde el usuario ingresa las especificaciones exactas de su PC a través del componente modular `SpecForm`.
- **Custom Hooks**: Como `useRecommendations`, que manejan los estados locales de sugerencias y la comunicación con las API correspondientes.

### 2. Backend (Node.js & Express)
El núcleo inteligente de procesamiento de la aplicación. Actúa como el puente entre la base de datos y la recolección masiva de requisitos.
- **MongoDB & Mongoose**: La base de datos principal, donde se guardan los modelos de `cpus`, `gpus`, `games` y `users`.
- **Sistema Híbrido de Componentes**:
  - `seedTopComponents.js`: Inicializa la base de datos limpiando y cruzando la información estática del scraper con las 100 mejores piezas base de los archivos CSV maestros de *UserBenchmarks*. Agregando el `benchmarkScore` vital para calcular el rendimiento.
  - `componentResolver.js`: Un módulo que resuelve dinámicamente cualquier componente "desconocido" encontrado en el futuro. Búsqueda *on-demand* que hace matching difuso con el CSV y añade las nuevas CPU/GPU automáticamente a Mongo.

### 3. Pipeline de Datos y Automatización Continua (CI/CD)
Toda extracción de datos es autónoma y se procesa semana a semana sin intervención del desarrollador vía **GitHub Actions** (`steam-scrape.yml` y `pipeline-juegos.yml`).
1. **Cron Job (Domingos)**: Inicializan las máquinas virtuales en Ubuntu.
2. Funciona con Puppeteer para extraer de forma silenciosa miles de juegos directamente desde la tienda de Steam (`gameScrap.js`).
3. El scraper entrega el JSON con descripciones y requisitos.
4. Ejecuta dinámicamente `seedTopComponents.js` seguido de `uploadGames.js` insertando, actualizando (Upsert) cada juego y forzando la creación dinámica de todo el hardware que demande la aplicación.
5. Notifica todos los resultados a Discord vía Webhooks.

## 🚀 Flujo de Funcionamiento del Usuario
1. El usuario accede a la web y navega en *Inicio* leyendo *Cómo funciona*.
2. Clickea en "Analizar mi PC", dirigiéndose a la ruta `/recommendations`.
3. A través de entradas de Autocompletado (alimentadas por las CPUs/GPUs rastreadas en la BD), elige sus componentes.
4. El Frontend empaqueta el formulario y realiza un `POST /api/recommendations/recommendations`.
5. El algoritmo pondera los `benchmarkScore` de sus componentes contra los scores exigidos por cada juego almacenado en la BD.
6. Presenta los juegos compatibles ordenados por relevancia.

---

## 🧠 Algoritmo de Recomendación — Documentación Técnica Detallada

El motor de recomendación de What2Play funciona en **dos fases bien diferenciadas**: una fase **offline** de pre-procesamiento (ejecutada semanalmente por el pipeline CI/CD) y una fase **online** de consulta en tiempo real (ejecutada en cada petición del usuario).

---

### Fase 1 — Pre-procesamiento Offline: Conversión de Texto a Scores (`uploadGames.js` + `requirementParser.js`)

El scraper de Steam extrae los requisitos mínimos de cada juego en formato de **texto libre y muy sucio**, por ejemplo:

```
"Intel Core i5-4430 / AMD FX-6300, 3.3 GHz Intel Core i3-3220 (2 cores)"
"DirectX 11+ capable Graphics Card"
"Nvidia GeForce GTX 1060 (3 GB) or AMD Radeon RX 580 (8 GB)"
```

Estos textos son imposibles de comparar matemáticamente tal como están. La solución es convertirlos a un único número entero: su **benchmark score mínimo requerido**.

#### 1.1 — Pipeline de `requirementParser.js`

Este módulo es el corazón del pre-procesamiento. Implementa una tubería (pipeline) de 5 pasos:

**Paso 1 — Limpieza del texto (`cleanRequirementText`):**
Se aplican expresiones regulares para estandarizar el texto:
- Conversión a minúsculas.
- Eliminación de marcas registradas (`®`, `™`, `©`).
- Eliminación de todo el contenido entre paréntesis (ej. `(SSE 4.2 support)` → eliminado).
- Eliminación de conectores engañosos como ` or ` (con espacios), que podrían unir dos modelos distintos.
- Limpieza de espacios en blanco redundantes.

**Paso 2 — Búsqueda exhaustiva en el diccionario maestro (`masterList`):**
El parser recibe como parámetro la lista maestra completa del CSV de *UserBenchmarks* (más de 1.400 CPUs y 1.192 GPUs cargados en memoria). Itera sobre cada entrada del CSV verificando si el `Model` de ese componente está contenido dentro del texto limpio del requisito.

**Paso 3 — Extracción del score mínimo (múltiples coincidencias):**
Si el texto menciona múltiples modelos (ej. `"i7 860, i5 750, FX-4100"`), el parser puede encontrar coincidencias con más de un componente. En ese caso, extrae los scores de **todos** los encontrados y retorna el **más bajo** (`Math.min()`).  
**Razón:** Si un juego acepta un FX-4100 (score 30) o un i7 860 (score 40), el requisito mínimo real es 30 — el hardware más débil que puede correrlo.

**Paso 4 — Fallback por palabras clave genéricas:**
Si no se encontró ningún modelo específico en el CSV, el parser busca palabras clave en un diccionario de respaldo interno:

| Palabra clave | Score asignado |
|---|---|
| `"directx 12"` | 45 |
| `"directx 11"` | 15 |
| `"4gb vram"` | 35 |
| `"2gb vram"` | 25 |
| `"integrated"` | 5 |

**Paso 5 — Último recurso:**
Si el texto es completamente indescifrable (ej. `"Any compatible video card"`), se retorna `0`. Los juegos con score `0` son marcados como "sin datos de requisito" y **excluidos de las recomendaciones** para evitar falsos positivos.

#### 1.2 — Almacenamiento en MongoDB (`uploadGames.js`)

Tras el parseo, cada documento `Game` en MongoDB almacena dos campos numéricos clave:
- `cpuScore` → el score mínimo de CPU que el juego requiere.
- `gpuScore` → el score mínimo de GPU que el juego requiere.

Estos campos se calculan **en tiempo de ingestión** (no en tiempo de consulta), lo que hace que las consultas posteriores sean extremadamente rápidas al ser simples comparaciones numéricas en la base de datos.

---

### Fase 2 — Consulta Online en Tiempo Real (`POST /api/recommendations/recommendations`)

Cuando el usuario envía su formulario de hardware, el backend ejecuta la siguiente lógica:

#### 2.1 — Resolución del hardware del usuario

El endpoint recibe `{ cpu, gpu, ram }` como strings (por ejemplo, `"AMD Radeon-VII"`). No confía ciegamente en estos strings — los valida contra la colección de componentes en MongoDB usando una **búsqueda regex insensible a mayúsculas y caracteres especiales** (con escape de caracteres):

```js
const gpuRegex = new RegExp('^' + escapeRegex(gpu.trim()) + '$', 'i');
const userGpu = await Gpu.findOne({ nombre: { $regex: gpuRegex } });
```

Si algún componente no existe en la BD, se rechaza la petición con un error `400`. Esto garantiza que solo se procesen componentes previamente validados con benchmarks reales.

Una vez encontrado, se extraen los `benchmarkScore` del documento:
```js
const cpuPower = userCpu.benchmarkScore;  // ej. 85.9
const gpuPower = userGpu.benchmarkScore;  // ej. 42.7
```

#### 2.2 — Consulta matemática a MongoDB

Con los scores del usuario en mano, se construye una query de MongoDB que usa **operadores de comparación numérica**:

```js
const query = {
    cpuScore: { $gt: 0, $lte: cpuPower },
    gpuScore: { $gt: 0, $lte: gpuPower }
};
```

Esta query hace dos cosas simultáneamente por campo:
- `$gt: 0` — Excluye juegos donde el parser no pudo determinar el requisito (score = 0). Evita falsos positivos.
- `$lte: cpuPower` — Incluye solo juegos cuyo requisito mínimo de CPU es **menor o igual** al poder de la CPU del usuario. En otras palabras: juegos que la PC del usuario **sí puede correr**.

Si el usuario además seleccionó géneros, se añade un filtro:
```js
if (genres.length > 0) {
    query.generos = { $in: genres };
}
```

#### 2.3 — Filtro de RAM en memoria

La RAM no tiene un score numérico de benchmark (su comparación es directamente en gigabytes). Por eso se filtra **después** de la consulta a MongoDB, en el código Node.js:

```js
const userRam = parseInt(ram, 10);  // ej. "16 GB" → 16
const recommendedGames = gamesFromDB.filter(game => {
    const requiredRam = parseRam(game.requisitos_minimos?.Memory);  // ej. "8 GB RAM" → 8
    return userRam >= requiredRam;
});
```

#### 2.4 — Respuesta final

```json
{
  "success": true,
  "data": [ /* array de juegos compatibles */ ],
  "count": 12
}
```

---

### Resumen Visual del Flujo Completo

```
[Steam Scraper] → texto sucio de requisitos
       ↓
[requirementParser.js] → Pipeline de limpieza + matching CSV
       ↓
[uploadGames.js] → { cpuScore: 55.2, gpuScore: 9.1 } guardado en MongoDB
       ↓
═══════════════════════════════════════ (barrera offline/online)
       ↓
[Usuario selecciona hardware] → "AMD Ryzen 5 1600X" + "GTX 1060"
       ↓
[recommendationRoutes.js] → busca benchmarkScore en colección de componentes
       ↓
MongoDB query: { cpuScore: { $gt:0, $lte: 85.9 }, gpuScore: { $gt:0, $lte: 54.2 } }
       ↓
Filtro RAM en Node.js
       ↓
[Respuesta] → Lista de juegos que la PC puede correr
```

---

**Tecnologías:** React, Node.js, Express, MongoDB, Mongoose, UserBenchmarks CSV, Steam Puppeteer, GitHub Actions.

