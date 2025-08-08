# Ábaco Interactivo

Guía y recursos para el proyecto de ábaco con imágenes y audio.  
Actividad pensada para uso offline y online, fácil de desplegar en GitHub Pages o Netlify.

## 📁 Estructura de carpetas

abaco-interactivo/  
├─ imágenes/              ← Todas las imágenes usadas  
├─ Sonidos/               ← Archivos de audio (mp3, wav…)  
├─ index.html             ← Punto de entrada  
├─ style.css              ← Estilos  
├─ Script.js              ← Lógica de interacción  
└─ README.md              ← Este archivo

## 🚀 Uso local

1. Clona o descarga este repo en tu carpeta de trabajo.  
2. Asegúrate de mantener las carpetas `imágenes/` y `Sonidos/` con sus archivos.  
3. Abre `index.html` en tu navegador (doble clic).  
4. Verifica que las imágenes y audios carguen correctamente.

## ☁️ Despliegue en GitHub Pages

1. Sube todo a un repositorio público en GitHub con nombre `abaco-interactivo`.  
2. Ve a **Settings > Pages** y selecciona la rama `main` (o `master`) y la carpeta `/ (root)`.  
3. Guarda cambios. Tu ábaco estará en `https://TU_USUARIO.github.io/abaco-interactivo/`.

## ☁️ Despliegue en Netlify

1. Conecta tu cuenta de GitHub en netlify.com.  
2. Elige este repositorio.  
3. Para “build command” déjalo vacío y “publish directory” pon `/` (la raíz).  
4. Haz deploy y obtendrás una URL tipo `https://something.netlify.app`.

## 🛠️ Personalización

- Si renombras las carpetas, actualiza las rutas en `index.html` y `Script.js`.  
- Para añadir nuevos sonidos, cópialos a `Sonidos/` y registra su ruta en el script.

## 📄 Licencia

Licencia MIT. Puedes usar y adaptar libremente este proyecto.

