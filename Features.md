**Resumen de Funcionalidades**

- **Autenticación**: Pantallas de `login`, `register` y `verification-success` para registro e inicio de sesión de usuarios.
- **Eventos (Eventos)**: Listado de eventos, vista por detalle (`/app/event/[id].tsx`), crear/editar eventos (`/app/event/create.tsx` y `/app/event/edit/[id].tsx`), y agrupación por día en la lista.
- **Filtrado por fecha (Calendario)**: Selector de fecha con `react-native-calendars` (`src/components/events/CalendarModal.tsx`), selección/limpieza de fecha y filtrado de eventos por día (filtrado en cliente en `app/(tabs)/events.tsx`).
- **Checkout / Tickets**: Página de checkout por evento (`/app/checkout/[eventId].tsx`) y gestión de tickets (`/app/ticket/[id].tsx`, perfil -> `tickets.tsx`).
- **Beneficios**: Listado de beneficios, detalle (`/app/benefits/[id].tsx`), creación y edición de beneficios (`/app/benefits/create.tsx`, `/app/benefits/edit/[id].tsx`), y uso de beneficios desde el perfil.
- **Chat en tiempo real**: Conversaciones y mensajes (carpeta `app/chat` y `src/components/chat`), uso de `socket.io-client` y `src/context/SocketContext.tsx` / `src/lib/socket.ts` para conexión.
- **Comunidad / Posts**: Componentes y vistas para publicar y mostrar posts (`src/components/community/*`, `app/post/[id].tsx`).
- **Amigos / Relaciones**: Solicitudes y lista de amigos (`src/api/friends.ts`, `src/components/friends/*`, y `app/profile/friends.tsx`).
- **Favoritos**: Marcar eventos como favoritos y obtener los favoritos del usuario (`src/api/events.ts` y `useFavorites` hook).
- **Perfil de usuario**: Páginas para ver/editar perfil, historial de beneficios, beneficios reclamados, favoritos, amigos, QR propio y escaneo (`app/profile/*`, `src/components/profile/*`).
- **QR y escaneo**: Generación de QR (`react-native-qrcode-svg`) y vistas para mostrar/escáner (`my-qr.tsx`, `scan-qr.tsx`).
- **Administración**: Rutas para administradores, por ejemplo `app/admin/create-company.tsx` y botón flotante para crear eventos si el usuario es ADMIN.
- **Búsqueda de lugares**: Autocompletado/selección de lugar para eventos con `react-native-google-places-autocomplete` (`src/components/events/PlaceSearch.tsx`).
- **Imágenes y galería**: Soporte visual para imágenes en posts/eventos con `expo-image` y `react-native-image-viewing`.
- **Notificaciones y permisos**: Uso de `expo-notifications` y hooks relacionados (`usePushNotifications.ts`) para gestionar notificaciones push.
- **Geolocalización y mapas**: Integración con `expo-location` y `react-native-maps` para funcionalidades basadas en localización.
- **Conversión de moneda**: Selector y gestión de monedas (`src/store/useCurrencyStore.ts`, `useInitializeCurrency.ts`) y conversión de montos en componentes de perfil/eventos.
- **Formularios y validación**: Uso de `react-hook-form` y `zod` para validaciones y formularios en pantallas de creación/edición.

**Arquitectura / Utilidades**

- **API cliente centralizado**: `src/lib/axios.ts` para llamadas a la API.
- **React Query**: Manejo de datos en caché y fetch con `@tanstack/react-query` (`src/lib/queryClient.ts`).
- **State global**: `zustand` para `useAuthStore` y `useCurrencyStore`.
- **Socket**: `socket.io-client` y contexto `SocketContext` para comunicación en tiempo real.
- **Hooks reutilizables**: `src/hooks/*` incluyen `useAuth`, `useFavorites`, `useFriends`, `useInitializeCurrency`, `usePushNotifications`, `useSocketListener`.
- **Componentes UI reutilizables**: `src/components/shared/*` y `src/components/ui/*` (cards, botones, iconos de verificación, etc.).

**Stack & Dependencias relevantes**

- **Framework**: Expo + React Native (`expo`, `react-native`).
- **Routing**: `expo-router`.
- **Estilos**: `nativewind` / Tailwind CSS para RN.
- **Red**: `axios`, `socket.io-client`, `@tanstack/react-query`.
- **Utilidades de fecha**: `date-fns`, `date-fns-tz`.
- **Almacenamiento**: `@react-native-async-storage/async-storage` (presente en deps).
- **Otros**: `react-native-calendars`, `react-native-qrcode-svg`, `react-native-maps`, `expo-image`, `expo-notifications`.

**Archivos y rutas clave**

- Páginas principales: `app/(tabs)/events.tsx`, `app/login.tsx`, `app/register.tsx`, `app/(tabs)/community.tsx`, `app/(tabs)/profile.tsx`, `app/(tabs)/chat/index.tsx`.
- Componentes de eventos: `src/components/events/CalendarModal.tsx`, `EventListItem.tsx`, `PlaceSearch.tsx`.
- APIs: `src/api/events.ts`, `src/api/chat.ts`, `src/api/community.ts`, `src/api/friends.ts`.