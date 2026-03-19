# 🛡️ PROTOCOLO DE SEGURIDAD GOD-TIER (V1.0)

Este protocolo es de cumplimiento obligatorio para los 18 agentes y cualquier subproceso de desarrollo en este proyecto.

## 1. GESTIÓN DE SECRETOS (MANDATO ABSOLUTO)
- **Cero Hardcoding**: Ninguna API Key, Token, Password o URL sensible debe figurar en el código fuente (`.ts`, `.tsx`, `.js`, etc.).
- **Varianza de Entorno**: Usar `.env` para el backend y `.env.local` con prefijo `VITE_` para el frontend.
- **Whitelist de Seguridad**: Solo se permite subir archivos `.env.example` al repositorio.

## 2. SEGURIDAD DEL FRONTEND
- **Santización de Output**: Uso obligatorio de librerías para prevenir XSS.
- **Validación de Input**: Toda entrada del usuario debe ser validada con `zod` o equivalente antes de procesarse.
- **Headers de Seguridad**: CSP (Content Security Policy) estricta implementada en producción.

## 3. SEGURIDAD DEL BACKEND
- **Autenticación JWT**: Expiración corta (max 1h) con rotación de Refresh Tokens.
- **Hashing**: Uso de `bcrypt` o `argon2` con salt robusto.
- **Rate Limiting**: Protección contra fuerza bruta en todos los endpoints de Auth y Admin.

## 4. AUDITORÍA RECURSIVA (10x10x10)
- Cada nueva función debe ser auditada por el **Agente 12 (Security Engineer)** antes de considerarse completa.
- Se realizarán escaneos de vulnerabilidades en cada push al repositorio.

---
*Si no es seguro, no es God-Tier.*
