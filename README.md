# 💌 Una Carta para Valentina

Una experiencia web interactiva, sensible, con toques de humor y mucho cariño, diseñada especialmente para Valentina.

---

## 📁 Estructura del Proyecto

```text
carta-para-valentina/
├── index.html     # Estructura semántica, carta íntegra y pantallas interactivas
├── style.css      # Diseño visual, paleta nocturna/lavanda/rosa, animaciones y responsividad
├── script.js      # Animación cinemática, Canvas de estrellas, navegación SPA, botón esquivador y persistencia
└── README.md      # Instrucciones de uso, despliegue y checklist de pruebas
```

---

## 🚀 Cómo ejecutar la página localmente

Al estar desarrollada con tecnologías web estándar (**HTML5, CSS3 y JavaScript vanilla**), no necesitas instalar Node.js ni compilar dependencias.

### Opción 1: Apertura directa
1. Haz doble clic en el archivo `index.html` o arrástralo a cualquier navegador web moderno (Chrome, Edge, Firefox, Safari).

### Opción 2: Con servidor local (Recomendado para simular entorno real)
Si tienes **Python** instalado en tu computadora:
```bash
# Abre una terminal dentro de la carpeta del proyecto y ejecuta:
python -m http.server 8000
```
Luego abre tu navegador en `http://localhost:8000`.

O si utilizas **Visual Studio Code**, puedes usar la extensión **Live Server** haciendo clic derecho en `index.html` -> *Open with Live Server*.

---

## 🌐 Cómo publicar la página gratuitamente

### Opción A: GitHub Pages (Gratis y permanente)
1. Crea un nuevo repositorio en [GitHub](https://github.com/) (por ejemplo, `carta-para-valentina`).
2. Sube los archivos `index.html`, `style.css` y `script.js` a la rama principal (`main`).
3. En tu repositorio de GitHub, ve a **Settings** > pestaña **Pages** (en el menú lateral izquierdo).
4. En **Branch**, selecciona `main` y la carpeta `/ (root)`, luego haz clic en **Save**.
5. En 1 o 2 minutos, GitHub te dará un enlace público como:
   `https://tu-usuario.github.io/carta-para-valentina/`

### Opción B: Netlify (En menos de 1 minuto sin configurar Git)
1. Ve a [Netlify Drop](https://app.netlify.com/drop).
2. Arrastra la carpeta completa `carta-para-valentina` al círculo del navegador.
3. Netlify generará instantáneamente un enlace seguro (`https://nombre-aleatorio.netlify.app`) que puedes personalizar gratis.

---

## 🧪 Lista de Comprobación y Pruebas (Test Checklist)

| Característica / Ruta | Qué verificar | Resultado esperado |
|---|---|---|
| **1. Entrada Cinemática** | Recargar la página | Pantalla en negro durante ~1 seg. Luego aparece un destello luminoso suave, seguido de la frase *"Hice esto por si algún día necesitas recordar algo."*, y a los ~2 segundos se desvanece suavemente para revelar la carta. |
| **2. Contenido de la Carta** | Lectura completa | Se conserva el texto íntegro, sin recortes, incluyendo los modismos (`:V`, `ajajja`, Open English, Roblox 2026, South Park y la firma `Att: Jonh Pork`). |
| **3. Selector de Emociones** | Final de la carta | Se muestran las 4 opciones (`Bien`, `Mal`, `No sé`, `Soy un pan`) en cuadrícula responsiva (2x2 en móviles, 4 en desktop). |
| **4. Ruta «Bien»** | Hacer clic en "Bien" | Abre la pantalla con las 5 estrellas interactivas. Al tocar la 3ª o 5ª estrella, se iluminan en dorado todas las anteriores. Muestra la frase `(no, mentira, es broma)`. |
| **4.1. Contador Manual** | Abrir panel de registro | Permite introducir manualmente cuántas veces ha leído la carta (enteros >= 0). Al pulsar "Guardar", almacena el valor en `localStorage` y persiste si se recarga la página. Muestra también el conteo técnico independiente. |
| **5. Ruta «Mal» (Esquives)** | Intentar pulsar botón | El botón *"Sí, todavía me siento mal"* se desplaza ágilmente esquivando el cursor o el dedo. **Cuenta exactamente 3 esquivas** sin salirse de la pantalla. A la 3ª esquiva, se queda quieto, cambia de estilo y dice `(¡pulsar!)`. |
| **5.1. Mensaje y Monitor** | Pulsar el botón tras 3 esquivas | Se oculta el botón y se escribe el mensaje de apoyo poco a poco con efecto máquina de escribir. Debajo aparece el **monitor gigante animado** con carita tierna que parpadea. |
| **6. Ruta «No sé»** | Hacer clic en "No sé" | Abre tarjeta centrada con texto reflexivo y sarcástico, y una carita perpleja animada. |
| **7. Ruta «Soy un pan»** | Hacer clic en "Soy un pan" | Muestra un **pan gigante artesanal y sonriente** con animación de rebote y sombra dinámica, con el texto `"Hola, soy un pan."`. |
| **8. Botones de Regreso** | En cualquiera de las 4 rutas | El botón *"Volver a leer la carta"* regresa limpiamente al inicio de la carta con transición suave y scroll al inicio. |
| **9. Navegación e Historial** | Botones atrás/adelante del navegador | La URL se actualiza con hashes (`#bien`, `#mal`, etc.) y el botón atrás del navegador regresa a la pantalla anterior sin recargar ni romper la experiencia. |
| **10. Responsividad y Accesibilidad** | Probar en móvil / DevTools | No hay desplazamiento horizontal. Botones táctiles cómodos. Respeta `prefers-reduced-motion` desactivando animaciones bruscas. |
