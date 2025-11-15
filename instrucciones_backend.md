# Instrucciones para implementar verificación por código (backend)

Estas instrucciones describen los cambios necesarios en el backend para soportar verificación de email por código (ej. 6 dígitos) que la app móvil pueda consumir directamente. Incluye: cambios en Prisma, endpoints HTTP, servicios/controladores de ejemplo, seguridad, y tests.

---

## Objetivo

Permitir que, después del registro, el backend genere un código de verificación enviado por correo y exponga endpoints JSON para:

- Verificar el código desde la app: `POST /api/auth/verify`
- Reenviar código: `POST /api/auth/resend-verification`

Mantener la ruta `GET /verify-email?token=...` (link) es opcional; el foco aquí es un flujo manejado desde la app móvil.

---

## 1) Cambios de esquema (Prisma)

Agregar campos al modelo `User` para soportar códigos y expiración. Ejemplo (fragmento de `prisma/schema.prisma`):

```prisma
model User {
  id                         String   @id @default(cuid())
  email                      String   @unique
  firstName                  String?
  lastName                   String?
  passwordHash               String
  emailVerified              DateTime?
  verificationToken          String?   // existente (opcional para enlaces)
  verificationCodeHash       String?   // hash del código numérico
  verificationCodeExpiresAt  DateTime?
  // ...otros campos...
}
```

Notas:
- Guardar `verificationCodeHash` (no el código en texto claro). Usar `bcrypt` o `argon2` para hashear.
- Ejecutar migración: `npx prisma migrate dev --name add-email-verification-code`.

---

## 2) Lógica de generación y envío de código

- Longitud: 6 dígitos numéricos (000000–999999) por simplicidad.
- Expiración: 10–15 minutos por defecto.
- Reenvío: limitar reenvíos (ej. 3 por hora).
- Guardar `hash(code)` y `expiresAt` en la fila del usuario.

Pseudocódigo:

```ts
const code = Math.floor(100000 + Math.random() * 900000).toString();
const hash = await bcrypt.hash(code, 10);
const expiresAt = addMinutes(new Date(), 15);
await prisma.user.update({ where: { email }, data: { verificationCodeHash: hash, verificationCodeExpiresAt: expiresAt } });
await mailer.sendVerificationCode(email, code);
```

---

## 3) Endpoints API (spec)

Base: `/api/auth` (ajustar según convención del proyecto)

### A) POST /api/auth/request-verification (opcional)
- Payload: `{ "email": "user@example.com" }`
- Respuesta: `200 { success: true, message: 'Código enviado' }`
- Comportamiento: genera código y lo envía. No revelar si el email existe (o devolver 200 genérico).
- Rate-limit: 1/min, 3/h por email/IP.

### B) POST /api/auth/resend-verification
- Payload: `{ "email": "user@example.com" }`
- Respuesta: `200 { success: true, message: 'Código reenviado' }`
- Comportamiento: reenvía código, respetando límites de reenvío.

### C) POST /api/auth/verify
- Payload: `{ "email": "user@example.com", "code": "123456" }`
- Respuesta: `200 { success: true, message: 'Email verificado' }` si OK; `400 { success: false, message: 'Código inválido o expirado' }` si inválido.
- Comportamiento:
  - Buscar usuario por email.
  - Verificar que `verificationCodeExpiresAt` > now.
  - `bcrypt.compare(code, verificationCodeHash)`.
  - Si válido: setear `emailVerified = now`, limpiar `verificationCodeHash` y `verificationCodeExpiresAt`, opcionalmente `verificationToken = null`.
  - Aplicar rate-limiting sobre intentos (ej. máximo 5 fallos por hora).

### D) POST /api/auth/verify-token (opcional)
- Payload: `{ "token": "..." }`
- Comportamiento: validar token y devolver JSON (útil para clientes móviles que no siguen redirecciones HTML).

### E) GET /verify-email?token=... (existente)
- Mantener si quieres soporte para enlaces web.
- Mejorar redirect: `res.redirect(`${process.env.FRONTEND_URL}/verification-success`);` (asegurar la `/`).

---

## 4) Servicios y controladores (ejemplos TypeScript/Express)

### Servicio (ejemplos simplificados)

```ts
// src/services/auth.service.ts
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import { addMinutes } from 'date-fns';

export const generateAndSendVerificationCode = async (email: string, mailer: Mailer) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = await bcrypt.hash(code, 10);
  const expiresAt = addMinutes(new Date(), 15);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // política: no indicar existencia

  await prisma.user.update({ where: { email }, data: { verificationCodeHash: hash, verificationCodeExpiresAt: expiresAt } });
  await mailer.sendVerificationCode(email, code);
};

export const verifyCode = async (email: string, code: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.verificationCodeHash || !user.verificationCodeExpiresAt) throw new Error('Código inválido o expirado');
  if (user.verificationCodeExpiresAt < new Date()) throw new Error('Código expirado');
  const valid = await bcrypt.compare(code, user.verificationCodeHash);
  if (!valid) throw new Error('Código inválido');
  return prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date(), verificationCodeHash: null, verificationCodeExpiresAt: null, verificationToken: null } });
};
```

### Controladores (Express)

```ts
// src/controllers/auth.controller.ts
export const resendVerificationController = async (req, res, next) => {
  try {
    const { email } = req.body;
    await generateAndSendVerificationCode(email, mailer);
    res.json({ success: true, message: 'Código reenviado' });
  } catch (error) { next(error); }
};

export const verifyController = async (req, res) => {
  try {
    const { email, code } = req.body;
    await verifyCode(email, code);
    res.json({ success: true, message: 'Email verificado' });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Código inválido o expirado' });
  }
};
```

---

## 5) Plantilla de email

Asunto: `Verifica tu cuenta en ElBarrio`

Cuerpo (texto):

```
Hola {firstName},

Tu código de verificación es: 123456
Expira en 15 minutos.

Si no solicitaste esto, ignora este correo.

Saludos,
ElBarrio Team
```

Incluir instrucciones para abrir la app y pegar el código.

---

## 6) Seguridad y rate-limiting

- No revelar existencia de emails en respuestas públicas (devolver 200 genérico cuando corresponda).
- Limitar reenvíos (ej. 3/h) y limitar intentos de verificación (ej. 5 intentos/30 min).
- No almacenar el código en texto plano.
- Loguear eventos relevantes (envío, reenvío, verificación exitosa) con timestamps.

---

## 7) Tests

- Unit tests: `generateAndSendVerificationCode`, `verifyCode` (mock mailer y Prisma).
- Integration tests: endpoints `POST /api/auth/verify` y `POST /api/auth/resend-verification`.
- Casos: código válido, código expirado, código inválido, límites de reenvío.

---

## 8) Variables de entorno recomendadas

- `FRONTEND_URL` (ya presente)
- Mailer: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` o credenciales de proveedor.
- `VERIFICATION_CODE_EXPIRY_MINUTES` (ej. 15)
- `VERIFICATION_RESEND_LIMIT_PER_HOUR` (ej. 3)
- `VERIFICATION_MAX_ATTEMPTS` (ej. 5)

---

## 9) Ejemplos `curl`

Verificar código:

```bash
curl -X POST https://api.example.com/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","code":"123456"}'
```

Reenviar código:

```bash
curl -X POST https://api.example.com/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

---

## 10) Checklist paso a paso para el desarrollador

1. Añadir campos en Prisma y ejecutar migración.
2. Implementar utilitario para generar y hashear códigos (bcrypt).
3. Implementar `generateAndSendVerificationCode(email)` y conectar con el mailer.
4. Implementar `POST /api/auth/resend-verification` con rate-limits.
5. Implementar `verifyCode(email, code)` y `POST /api/auth/verify`.
6. Añadir tests unitarios y de integración (mock mailer).
7. Documentar endpoints (OpenAPI o README).
8. Probar flujo completo con la app: registro → `/verify?email=...` → enviar código → verificar.

---

## Notas finales

- El flujo móvil que ya existe espera `POST /api/auth/verify` y `POST /api/auth/resend-verification`; si el backend los implementa tal cual la app funcionará sin redirecciones.
- Si prefieres que la app también soporte el enlace `GET /verify-email?token=...`, añade un endpoint JSON `POST /api/auth/verify-token` o `GET /api/auth/verify?token=...` que devuelva JSON en lugar de redirigir.

---

Si quieres, puedo generar los archivos de ejemplo (servicio + controlador + rutas) en TypeScript/Express con pruebas y plantillas de correo para que otra IA los use como referencia. Indica si el backend usa Express (u otro framework) y el estilo de import/export (ESM vs CommonJS).
