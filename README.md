# TecStore — Sitio de ejemplo

Pequeña tienda estática de venta de teléfonos inspirada en el diseño de natacoton.com.

Contenido:
- `index.html` — página principal.
- `styles.css` — estilos.
- `script.js` — datos y lógica del carrito simple (localStorage).

Cómo probar localmente (Windows PowerShell):

```powershell
# Abrir index.html en el navegador predeterminado
Start-Process .\index.html
```

Notas y siguientes pasos:
- Las imágenes son placeholders (picsum.photos). Cambia por tus imágenes en `assets/` si prefieres.
- Mejoras sugeridas: páginas de producto individuales, pago real (Stripe), filtros, búsqueda y un backend.
- Para desplegar: subir a Netlify, Vercel o GitHub Pages.

Localización para Perú
- La web está adaptada para Perú: precios en PEN (S/.), aviso de envío y contacto con teléfono +51.
- WhatsApp de contacto: +51 948 228 919 (enlace directo desde la interfaz).

Probar con Live Server (VS Code)

```powershell
# Abre la carpeta del proyecto en VS Code y, sobre index.html, seleccionar "Open with Live Server"
# O ejecuta un servidor estático simple con Python desde la carpeta raíz:
python -m http.server 5500
# Abrir en el navegador: http://localhost:5500
```
