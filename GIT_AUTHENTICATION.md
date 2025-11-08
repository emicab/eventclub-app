# Solución de Problemas de Autenticación de Git en Firebase Studio

Este documento resume los pasos para solucionar problemas de autenticación al realizar operaciones Git (especialmente `git push`) desde el terminal de Firebase Studio, cuando GitHub rechaza la autenticación por contraseña.

## Síntomas del Problema

Cuando intentas hacer `git push`, recibes un error similar a:
```
remote: Invalid username or token. Password authentication is not supported for Git operations.
fatal: Authentication failed for 'https://github.com/{usuario}/{repositorio}/'
```
A menudo, Git no te solicita el nombre de usuario y la contraseña (o el Token de Acceso Personal - PAT) cuando debería.

## Solución Paso a Paso

### Paso 1: Generar un Token de Acceso Personal (PAT) en GitHub

GitHub ya no permite usar tu contraseña de cuenta directamente para operaciones Git a través de HTTPS. Debes usar un **Token de Acceso Personal (Personal Access Token - PAT)**.

1.  **Navega a GitHub:** Abre tu navegador y ve a [https://github.com/](https://github.com/).
2.  **Inicia sesión:** Asegúrate de haber iniciado sesión en tu cuenta de GitHub.
3.  **Accede a la configuración:**
    *   Haz clic en tu foto de perfil en la esquina superior derecha.
    *   Selecciona "Settings" (Configuración).
4.  **Ve a "Developer settings":** En la barra lateral izquierda, desplázate hacia abajo y haz clic en "Developer settings".
5.  **Selecciona "Personal access tokens":**
    *   En la barra lateral izquierda, haz clic en "Personal access tokens".
    *   Luego, haz clic en "Tokens (classic)".
6.  **Genera un nuevo token:**
    *   Haz clic en el botón "Generate new token (classic)".
    *   **Nombre descriptivo:** Dale un nombre fácil de recordar, por ejemplo, "Firebase Studio Git Token".
    *   **Expiración:** Define la duración del token (ej., 90 días, 1 año).
    *   **Scopes (permisos):** Para `git push`, es fundamental seleccionar el scope `repo` (control total sobre repositorios privados).
    *   Haz clic en "Generate token".
7.  **¡COPIA EL TOKEN INMEDIATAMENTE!** GitHub solo mostrará el token una vez. Guárdalo en un lugar seguro.

### Paso 2: Preparar tu Repositorio Local en Firebase Studio

A veces, Git se aferra a credenciales antiguas o configuraciones que impiden que te pida las nuevas. Sigue estos pasos en el terminal de Firebase Studio, en la raíz de tu proyecto Git:

1.  **Eliminar el remoto `origin`:**
    ```bash
    git remote remove origin
    ```
    *(Esto "desconecta" tu repositorio local del remoto por un momento, limpiando posibles configuraciones conflictivas para esa URL).*

2.  **Volver a añadir el remoto `origin` incluyendo tu nombre de usuario:**
    ```bash
    git remote add origin https://{usuario}@github.com/{usuario}/{repositorio}.git
    ```
    *(Incluir tu nombre de usuario en la URL ayuda a Git a identificar el usuario y a forzar la solicitud de la contraseña/PAT).*

3.  **Limpiar las credenciales de GitHub específicas (paso de seguridad):**
    ```bash
    printf 'protocol=https
host=github.com' | git credential reject
    ```
    *(Este comando intenta forzar a Git a "olvidar" cualquier credencial HTTPS almacenada para `github.com` en tu entorno, para que te las pida de nuevo).*

4.  **Descargar la información de las ramas remotas:**
    ```bash
    git fetch origin
    ```
    *(Esto es crucial para que tu repositorio local sepa qué ramas existen en el remoto, como `origin/master` o `origin/main`).*

5.  **Establecer la rama local para seguir a la rama remota:**
    *   Si tu rama principal es `master`:
        ```bash
        git branch --set-upstream-to=origin/master master
        ```
    *   Si tu rama principal en GitHub es `main` (más común en repositorios recientes):
        ```bash
        git branch --set-upstream-to=origin/main main
        ```
    *(Esto resuelve el error de "no upstream branch" si aparece y vincula tu rama local con la remota).*

### Paso 3: Realizar `git push` y Autenticarte con el PAT

Ahora que el repositorio está preparado, Git debería solicitar las credenciales:

1.  Intenta tu operación normal de push:
    ```bash
    git push
    ```
2.  Git te pedirá:
    *   **`Username for 'https://{usuario}@github.com/{usuario}/{repositorio}.git':`**: Ingresa tu nombre de usuario de GitHub (en tu caso, `{usuario}`).
    *   **`Password for 'https://{usuario}@github.com/{usuario}/{repositorio}.git':`**: **PEGA aquí tu Token de Acceso Personal (PAT)** que generaste en el Paso 1.

Una vez que ingreses el PAT correctamente, tu `git push` debería completarse exitosamente. Git recordará este PAT para futuras operaciones en ese repositorio (hasta que caduque o lo borres manualmente).

---
