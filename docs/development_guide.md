# 🛠️ Guía de Desarrollo Rápido What2Play

Este documento es una de hoja de trucos para que recuerdes cómo iniciar, probar y mandar en tu proyecto en tu máquina local.

## 🏃 Inicialización de Servidores Locales

### 🖥️ Frontend (React)
Para echar a andar la web en vivo:
```bash
cd front/what2play
npm start
```
*Se levantará automáticamente el servidor en `localhost:3000` (el puerto está bindeado ahí normalmente).*

### 🔧 Backend (Node.js)
```bash
cd back
# Si tienes un script en package.json (ej. nodemon):
npm run dev
# O directamente:
node index.js  # o tu archivo principal del backend app.js/server.js
```

### 💽 MongoDB Local (si aplica)
No olvides asegurarte de que tu demonio local de MongoDB se encuentre encendido (si no usas directamente Mongoose contra un cluster en la nube como MongoAtlas):
`mongod --dbpath <tu_directorio>`

---

## 💾 Comandos para Bases de Datos e Inserción

Todos se realizan posicionándote primero en la terminal dentro de `/back`:

1. **Reiniciar las Piezas Top de Hardware**: 
Carga/Limpia a los 100 mejores por ranking con scores inamovibles.
```bash
node scripts/seedTopComponents.js
```

2. **Extraer de Steam de forma manual** (Puppeteer):
Ignora Github Actions y scrapea de forma forzada para debugear JSONs locales.
```bash
node services/gameScrap.js
```

3. **Subir y Actualizar Juegos** (Ejecuta automáticamente la adición híbrida para hardware que no tengas fichado):
```bash
node services/uploadGames.js
```

---

## 🎨 Recordatorios de Diseño Frontend
El diseño actual tiene una estética unificada de "Modo Oscuro / Glassmorphism". Al instalar componentes nuevos, ten en cuenta:
1. **Z-Index y Fondos Animados (`Navbar`, `MainPage`)**: Los efectos de estrellas / flotantes de fondo siempre deben tener `z-index: 0` y todo el contenido debe construirse con contenedores que usen colores translúcidos `rgba(XX, XX, XX, 0.4)` acompañados de atributos `backdrop-filter: blur(10px)` para poder dejar entrever los destellos detrás.
2. **Navegación Intrapágina (`#id` tags)**: La librería predeterminada en este proyecto usa ids para el viaje en Scroll suave como con `#how-it-works` del `Navbar`. Mantén los ids atados al Root parent del componente a seccionar.

---

## 🤖 Github Actions
Si realizas un Push grande, asegúrate de mantener a salvo los "secrets" cargados en tu rama principal de Github:
*  `MONGO_URI`: Necesaria para que el bot de inserción suba todo sin comprometer credenciales en los archivos.
*  `DISCORD_WEBHOOK`: Responsable de informarte de las cargas semanales en caso de exito o error.

Si falla la Github Action, el bot lo reportará asímismo por Discord en color rojo ❌, revisa el Action Tab de Github para ver el paso a paso fallido en crudo.
