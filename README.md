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
2. Clickea en "Analizar mi PC", dirigiéndose a la ruta `/reco`.
3. A través de entradas de "Autocompletar" (alimentadas por las CPUs/GPUs ya trackeadas en la BD), elige sus componentes.
4. El Frontend empaqueta este Query en `SpecForm` y solicita la recomendación al engine.
5. El algoritmo pondera los `benchmarkScore` de sus componentes contra los `benchmarkScore` exigidos por las docenas de juegos cacheados.
6. Presenta los "Juegos Más Compatibles" agrupados iterativamente por porcentajes de probabilidad de juego.

---

**Tecnologías:** React, Node.js, Express, MongoDB, Mongoose, UserBenchmarks, Steam Puppeteer, GitHub Actions.
