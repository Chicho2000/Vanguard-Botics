# Instrucciones para agentes de código

Antes de modificar, ejecutar o desplegar este proyecto:

1. Leer `CONTEXTO_PROYECTO.md` para conocer el estado funcional actual.
2. Leer `.agents/PROJECT_LESSONS.md` para no repetir errores ya diagnosticados.
3. Leer `GUIA_DEPLOY_DETALLADA.md` antes de sugerir o realizar un despliegue.

Reglas importantes:

- No actualizar dependencias ni ejecutar `npm audit fix` o `npm audit fix --force` sin autorización expresa.
- No borrar datos operativos, usuarios ni el administrador salvo una petición explícita.
- Mantener sincronizados frontend, backend, esquema Prisma y configuración de despliegue.
- El esquema Prisma es modular y vive en `prisma/schema/`; no recrear `prisma/schema.prisma` en la raíz.
- No incluir `.env`, credenciales, tokens ni secretos en commits, documentación o salidas.
- Preservar cambios ajenos existentes en el árbol de trabajo.

