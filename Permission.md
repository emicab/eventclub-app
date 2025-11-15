# Permisos requeridos por la app ElBarrio

Este documento lista y describe todos los permisos que utiliza la aplicación móvil (Android / iOS), por qué se solicitan, dónde configurarlos (Info.plist / AndroidManifest / app.json) y ejemplos de texto para la página `/privacy` del sitio web.

Usar este archivo como referencia para: añadir las keys en los manifiestos, preparar el texto legal de privacidad, y guiar el flujo de solicitudes en la app (pedirlos bajo demanda y explicar por qué se necesitan).

---

## Resumen (rápido)
- Localización: para mostrar mapas, eventos cercanos y sugerir ubicaciones.
- Cámara: para escanear QR y subir fotos (perfil, posts, eventos).
- Acceso a fotos/almacenamiento: seleccionar imágenes de la galería y guardar imágenes.
- Notificaciones push: recibir notificaciones sobre eventos, mensajes y actividad.
- Conexión a Internet: comunicación con la API (implícito, permiso `INTERNET` en Android).

---

## Permisos y uso detallado

1) Localización (ubicación)
- Propósito: mostrar eventos cercanos en el mapa, obtener la ubicación del usuario para cálculos y mostrar rutas, búsqueda por proximidad.
- Android (manifest):
  - `android.permission.ACCESS_FINE_LOCATION`
  - `android.permission.ACCESS_COARSE_LOCATION` (opcional si no se requiere precisión)
  - Si se necesita ubicación en segundo plano (background): `android.permission.ACCESS_BACKGROUND_LOCATION` (usar solo si es necesario y documentarlo claramente).
- Android 13+: manejar permisos de ubicación como antes, más políticas específicas.
- iOS (Info.plist keys):
  - `NSLocationWhenInUseUsageDescription` — texto para explicar el uso cuando la app está en primer plano.
  - `NSLocationAlwaysAndWhenInUseUsageDescription` — solo si se solicita ubicación en background.
- Implementación: solicitar permiso *on-demand* antes de usar la funcionalidad y mostrar una explicación previa si el flujo lo requiere.

2) Cámara
- Propósito: escanear QR (tickets, check-ins) y tomar fotos para posts/eventos/perfil.
- Android (manifest): `android.permission.CAMERA`
- iOS (Info.plist): `NSCameraUsageDescription`
- Nota: si la app solo necesita abrir la cámara mediante un módulo que maneja permisos por sí mismo (ej. `expo-image-picker`), igualmente debes declarar las keys en Info.plist y en AndroidManifest.

3) Acceso a fotos / almacenamiento
- Propósito: seleccionar imágenes desde la galería y/o guardar imágenes descargadas.
- Android (manifest):
  - Antes de Android 13: `android.permission.READ_EXTERNAL_STORAGE` y `android.permission.WRITE_EXTERNAL_STORAGE` (WRITE ya no recomendado/obligatorio en versiones recientes)
  - Android 13 (API 33+): usar `android.permission.READ_MEDIA_IMAGES` en lugar de `READ_EXTERNAL_STORAGE` para acceder a imágenes.
- iOS (Info.plist):
  - `NSPhotoLibraryUsageDescription` (leer la galería)
  - `NSPhotoLibraryAddUsageDescription` (si vas a guardar/añadir fotos)
- Implementación: solicitar permiso justo antes de abrir la galería.

4) Notificaciones push
- Propósito: enviar notificaciones sobre mensajes, eventos, recordatorios, y alertas del sistema.
- Android (manifest): `POST_NOTIFICATIONS` (Android 13+) y la configuración de Firebase/servicio push.
- iOS (Info.plist): no requiere una key específica, pero la app debe solicitar permisos de notificación en tiempo de ejecución y configurar push certificates / keys (APNs/Expo Notifications).
- Implementación: pedir permiso cuando la app necesita enviar notificaciones (mostrar diálogo contextual explicando por qué).

5) Geolocalización de preciso (ej. `react-native-geolocation-service`)
- Requiere las mismas claves de ubicación. Documentar que la librería puede necesitar configuración adicional en Android (Google Play Services, permiso de localización en manifest y requests en tiempo de ejecución).

6) Internet (conexiones de red)
- Propósito: acceder a la API y recursos externos.
- Android (manifest): `android.permission.INTERNET` (generalmente ya incluido por defecto en la mayoría de plantillas). iOS no requiere permiso explícito en Info.plist para Internet.

7) Otros permisos (no usados o situacionales)
- Micrófono: solo si se añaden funciones de grabación de audio (no presente actualmente).
- Contactos: solo si se añade compartición con contactos o invitaciones por SMS/email (no presente actualmente).

---

## Ejemplos de configuración

### iOS — Info.plist (ejemplo para proyectos Expo o React Native)
En `Info.plist` (o en `app.json` / `app.config.js` con `expo`):

```json
"ios": {
  "infoPlist": {
    "NSCameraUsageDescription": "La app necesita acceder a la cámara para escanear códigos QR y tomar fotos para tu perfil y publicaciones.",
    "NSPhotoLibraryUsageDescription": "La app necesita acceder a tu galería para que puedas seleccionar imágenes.",
    "NSPhotoLibraryAddUsageDescription": "La app necesita permiso para guardar imágenes descargadas.",
    "NSLocationWhenInUseUsageDescription": "Usamos tu ubicación para mostrar eventos cercanos y mejorar resultados de búsqueda.",
    "NSLocationAlwaysAndWhenInUseUsageDescription": "Usamos la ubicación para funciones opcionales en segundo plano (solo si está habilitado explícitamente)."
  }
}
```

### Android — AndroidManifest.xml (ejemplos)

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<!-- Android 13 -->
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<!-- Si target < 33 y necesitas escritura: -->
<!-- <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" /> -->
<!-- Notificaciones (Android 13+) -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

En `app.json` (Expo) también puedes declarar `android.permissions`.

---

## Ejemplos de textos para la página `/privacy` (por permiso)

A continuación hay ejemplos cortos y claros para incorporar en la sección "Permisos" de la página de privacidad:

- Localización (ubicación):
  - "Solicitamos permiso para acceder a tu ubicación cuando uses funciones que requieren localización (por ejemplo: mostrar eventos cercanos o indicar cómo llegar a un lugar). La ubicación se usa solo para mejorar la experiencia y no se comparte con terceros sin tu consentimiento explícito."

- Cámara y fotos:
  - "Solicitamos acceso a la cámara para que puedas escanear códigos QR y tomar fotos para tu perfil o publicaciones. Solicitamos acceso a la galería para que puedas seleccionar imágenes existentes."

- Notificaciones:
  - "Solicitamos permiso para enviarte notificaciones push con información relevante sobre eventos, mensajes y avisos administrativos. Puedes desactivar estas notificaciones en cualquier momento desde la configuración de tu dispositivo."

- Datos de red / uso de la red:
  - "La app necesita acceso a Internet para comunicarse con nuestros servidores, cargar contenido, y sincronizar datos."

- Retención y uso de datos:
  - "Los códigos de verificación son temporales y se almacenan de forma segura (hashed) durante un periodo limitado para validar tu correo. No guardamos códigos en texto plano."

- Contacto y revocación:
  - "Si deseas eliminar tu cuenta o revocar permisos, puedes hacerlo desde la sección de configuración dentro de la app o contactándonos en: soporte@elbarrio.example.com."

---

## Buenas prácticas de implementación en la app
- Pedir permisos *on-demand*: mostrar una explicación UI antes del diálogo del sistema para reducir rechazos.
- Registrar (audit) eventos de permiso (cuando el usuario concede o niega) para métricas y debugging.
- Manejar estados "denegado" y "denegado permanentemente" (abrir ajustes del sistema si es necesario).
- No pedir permisos innecesarios en el primer lanzamiento; introducir gradualmente según flujo.

---

## Checklist técnica para el equipo de desarrollo
- [ ] Añadir keys a `Info.plist` con textos claros para iOS.
- [ ] Añadir permisos requeridos a `AndroidManifest.xml` (y `app.json` si es Expo).
- [ ] Implementar solicitudes en tiempo de ejecución y manejar rechazos.
- [ ] Preparar mensajes UI que expliquen por qué se solicita el permiso.
- [ ] Actualizar la página `/privacy` con los textos sugeridos arriba.
- [ ] Probar en dispositivos reales (iOS y Android) y validar flujos: cámara, gallery, ubicación, notificaciones.

---

## Notas adicionales
- Android 13 (API 33) cambió permisos de almacenamiento (usar `READ_MEDIA_IMAGES`), comprobar el `targetSdkVersion`.
- Si la app usa servicios de terceros (p.ej. Google Maps, Firebase), documentar en la página de privacidad qué datos se comparten con dichos proveedores y enlazar sus políticas.

---

Si quieres, puedo:
- Generar un `privacy.md` a partir de estas secciones ya listo para montar en `/privacy` en la web.
- Añadir snippets concretos para `app.json` (Expo) y `AndroidManifest.xml` según la configuración actual del proyecto.
- Preparar una versión corta y una versión extendida del texto para la política de privacidad.

