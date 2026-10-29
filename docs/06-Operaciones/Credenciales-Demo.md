# Credenciales de demostración del B2C

> Solo para la **demostración sin backend** del B2C (`apps/web`). No son credenciales reales: el acceso es
> simulado en el navegador (`apps/web/src/lib/fig/auth.ts`, `DEMO_ACCOUNT`). Ya no se muestran en la
> pantalla de inicio de sesión.
>
> Aviso: como el login es simulado, estos valores van dentro del JavaScript publicado y cualquiera puede
> leerlos. Cuando exista el backend con autenticación real (Spec-F), esta cuenta desaparece y este archivo
> se elimina. Nunca pongas aquí credenciales reales, de AWS ni de terceros.

| Cuenta | Correo | Contraseña | Uso |
|---|---|---|---|
| Viajero demo | `demo@borondotours.com` | `Borondo2026` | Iniciar sesión con correo y contraseña |
| Viajero Google (simulado) | `viajero.google@gmail.com` | — | Botón "Continuar con Google" (entra sin contraseña) |

## Código de verificación (OTP)
En la demostración no se envían correos. Al registrarse o recuperar la contraseña, el código de 6 dígitos
se muestra en la misma pantalla con el aviso "Modo demostración: tu código es …".

## Cuentas creadas en la demo
Las cuentas que se registran en la demo se guardan solo en el navegador (`localStorage`). Para borrarlas,
limpia los datos del sitio en el navegador.
