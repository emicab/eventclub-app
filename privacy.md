# Política de Privacidad (Resumen para la web)

Última actualización: 15 de noviembre de 2025

Bienvenido a ElBarrio. Esta página explica de forma clara y concisa qué datos recogemos, por qué los necesitamos, cómo los usamos y cómo puedes gestionarlos. Está pensada para mostrarse en `/privacy` en el sitio web.

---

## Resumen rápido
- Recogemos datos mínimos para permitir la creación de cuenta, autenticación, interacción y disfrute de las funciones (eventos, chat, beneficios, tickets).
- Enviamos códigos de verificación por correo para activar cuentas; los códigos son temporales y se almacenan de forma segura (hashed).
- Pedimos permisos de ubicación, cámara, acceso a fotos y notificaciones cuando su uso es necesario; siempre explicamos por qué antes de solicitar.
- No compartimos tus datos personales con terceros sin tu consentimiento, salvo servicios necesarios para operar la app (proveedores de correo, hosting, analytics, push notifications).

---

## Datos que recogemos y por qué

1. Datos de cuenta
- Qué: nombre, apellido, email, contraseña (hashed), foto de perfil (opcional).
- Por qué: crear y autenticar tu cuenta, mostrar perfil y permitir interacción con la comunidad.

2. Verificación de email
- Qué: código de verificación enviado al email (almacenado en servidor como hash + expiración).
- Por qué: validar propietarios de direcciones de correo y proteger la integridad de la comunidad.

3. Contenido generado por el usuario
- Qué: posts, comentarios, imágenes subidas, mensajes de chat.
- Por qué: permitir la funcionalidad social de la app.

4. Ubicación
- Qué: ubicación cuando la autorizas (en primer plano) para mostrar eventos cercanos y cálculos de distancia.
- Por qué: mejorar la relevancia de eventos y mostrar rutas.

5. Imágenes y multimedia
- Qué: fotos que subes desde la galería o la cámara.
- Por qué: permitir que publiques imágenes en posts, eventos o tu perfil.

6. Notificaciones
- Qué: token de dispositivo para push notifications.
- Por qué: enviarte alertas sobre mensajes, eventos y recordatorios.

7. Datos técnicos y de uso
- Qué: logs, IPs, información del dispositivo, datos de uso y errores.
- Por qué: diagnosticar problemas, mejorar la app y protegerla frente al abuso.

---

## Permisos solicitados en la app (y cómo se usan)
- Cámara: escanear QR y tomar fotos para perfil/posts.
- Fotos/Almacenamiento: seleccionar imágenes desde la galería y guardar imágenes descargadas.
- Ubicación: mostrar eventos cercanos y rutas.
- Notificaciones: enviar alertas y recordatorios.

Solicitamos estos permisos *on-demand* y siempre mostramos una explicación previa en la UI.

---

## Cómo usamos y compartimos los datos
- Uso interno: para proporcionar y mejorar el servicio, moderación, y enviar notificaciones relevantes.
- Proveedores de servicios: podemos compartir datos con proveedores que nos ayudan a operar (p. ej. servicios de correo electrónico, almacenamiento de archivos, proveedores de push notifications, y analítica). Todos bajo contratos que exigen tratamientos seguros.
- No vendemos tus datos a terceros.

---

## Retención de datos
- Datos de cuenta y contenido: se mantienen hasta que elimines tu cuenta, salvo obligaciones legales.
- Códigos de verificación: se almacenan únicamente durante su validez (ej. 15 minutos) y se guardan como hash.
- Logs: retención limitada según políticas internas (ej. 30–90 días) para soporte y seguridad.

---

## Seguridad
- Contraseñas y códigos sensibles se almacenan hashed (bcrypt/argon2).
- Comunicaciones viajan cifradas (HTTPS/TLS).
- Acceso restringido y registro/auditoría de operaciones sensibles.

---

## Tus derechos y opciones
- Acceso: puedes solicitar una copia de los datos relacionados con tu cuenta.
- Rectificación: puedes actualizar tu perfil y corregir datos.
- Eliminación: puedes solicitar la eliminación de tu cuenta (se borrarán tus datos personales y contenido según política de retención).
- Revocar permisos: puedes desactivar permisos desde la configuración del dispositivo.
- Para ejercer estos derechos contáctanos en: soporte@elbarrio.example.com

---

## Cómo eliminamos o desactivamos una cuenta
- Desde la app: sección de configuración -> eliminar cuenta.
- Al eliminar, tu perfil y datos personales serán borrados o anonimizados. Algunos contenidos (p. ej. mensajes en chats, logs) podrían conservarse de forma agregada o anónima por razones legales o de seguridad.

---

## Cambios en la política
- Podemos actualizar esta política con el tiempo; notificaremos cambios significativos por email y mediante la app.

---

## Contacto
Si tienes preguntas, solicitudes de datos o quejas sobre privacidad, escríbenos a: soporte@elbarrio.example.com

---

## Información adicional para desarrolladores (puede mostrarse en detalle técnico)
- Endpoints y datos utilizados para verificación por código:
  - `POST /api/auth/verify` : `{ email, code }` -> valida y marca `emailVerified`.
  - `POST /api/auth/resend-verification` : `{ email }` -> reenvía código.
- Hashing: recomendamos `bcrypt` con salt rounds >= 10 o `argon2`.
- Recomendación de expiración: 10–15 minutos para códigos.

---

_El texto anterior está pensado para usarse directamente en la página `/privacy` del sitio. Si quieres, puedo generar una versión corta para un popup de aceptación y una versión traducida a otro idioma._
