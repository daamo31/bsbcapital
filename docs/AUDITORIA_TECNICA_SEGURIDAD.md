# Auditoría técnica y de seguridad

**Proyecto:** BSB Capital  
**Fecha de revisión:** 17 de octubre de 2026  
**Alcance:** revisión estática del repositorio y verificaciones locales de frontend, tests y dependencias. No se accedió al proyecto Supabase desplegado, Stripe Dashboard ni a sus políticas y secretos remotos.

## Resumen ejecutivo

Aplicación React 18 con Vite, Supabase (Auth, PostgreSQL y Edge Functions), Stripe, Tailwind CSS y generación de PDF con jsPDF. El producto reúne consultoría financiera, membresías, pagos y una Academia de contenidos.

Se retiró la integración Hotmart, se reforzó el límite de confianza del checkout Stripe, se añadió idempotencia al webhook y se redujo el patrón de consultas N+1 en la Academia. El build de producción pasó y la suite reportó 63 tests aprobados. La auditoría de dependencias todavía registra 10 avisos (5 altos, 5 moderados y ningún crítico); su corrección completa requiere migraciones mayores de Tailwind y React Router.

## 1. Estructura y arquitectura

La organización por páginas, componentes, hooks, servicios y funciones Edge es reconocible y apropiada para React/Vite. La carga diferida de páginas y la separación de lógica en `src/lib` son buenas bases.

Durante la auditoría se encontró que Hotmart tenía componentes, páginas demo, rutas, servicios y funciones Edge propios, mezclados con el acceso de la Academia. Se eliminaron esas integraciones y se conservaron Stripe, Supabase y las URLs directas de contenido.

Persisten dos rutas de autorización para contenido: `useUserAccess` consulta roles y `user_subscriptions`, mientras `contentService.checkUserAccess` consulta `users.subscription_status` y niveles de acceso. Deben unificarse para que las pantallas y el reproductor no discrepen sobre los permisos.

## 2. Calidad y buenas prácticas

- Se retiraron las páginas y utilidades de prueba relacionadas con Hotmart, credenciales de test mostradas al usuario y enlaces a funciones de prueba.
- Se retiró un endpoint `create-subscription` sin consumidores locales que aceptaba importes e identidad desde el cliente y simulaba un webhook Hotmart con `service_role`.
- El checkout Stripe ahora valida la sesión del usuario en el servidor y deriva el ID/email de la identidad autenticada. El precio y el modo de compra se resuelven con un catálogo permitido del servidor; ya no se acepta un email alternativo del cuerpo para identificar al comprador.
- El catálogo frontend ya no ofrece el precio de prueba de consultoría de 1 €. Se corrigió el atributo `highlight` de Inversor Premium que hacía fallar un test.
- Se retiraron logs de checkout que imprimían el cuerpo/metadatos completos, y se corrigieron diagnósticos de lint en el slice modificado.
- El acceso a todos los módulos ahora agrupa el contenido en memoria y consulta la membresía una sola vez, en lugar de efectuar consultas por módulo y elemento. El acceso de un módulo también consulta la membresía una vez.

Quedan archivos de dominio extensos, particularmente el webhook Stripe y el flujo postpago de consultas. Conviene separar responsabilidades y añadir pruebas de integración que ejerciten la lógica real, no solo fixtures descriptivos.

## 3. Seguridad e higiene

### Cambios aplicados

- Se eliminó Hotmart del código, rutas, Edge Functions, configuración y documentación. También se eliminó `supabase/.env`, que contenía exclusivamente credenciales Hotmart.
- El checkout Stripe exige bearer token válido, no permite elegir un usuario distinto al autenticado y solo acepta precios del catálogo server-side.
- El webhook Stripe valida la firma del proveedor y ahora reclama cada `event.id` en `processed_stripe_events` antes de procesarlo. Los duplicados completados reciben respuesta idempotente; los eventos en curso generan respuesta reintentable.
- Se actualizó `jspdf` a `4.2.1`, que está fuera del rango de la alerta crítica identificada.
- Se añadió una migración para crear `processed_stripe_events`, habilitar RLS, revocar acceso a `anon`/`authenticated` y concederlo a `service_role`.

### Pendientes de despliegue y verificación

1. **Aplicar la migración** `supabase/migrations/20261014180000_create_processed_stripe_events.sql` en Supabase antes de desplegar el webhook actualizado. Sin la tabla, el webhook responderá con error al intentar reclamar el evento.
2. Desplegar las funciones Edge actualizadas y retirar las funciones Hotmart ya publicadas; borrar archivos locales no elimina funciones desplegadas ni secretos almacenados en Supabase.
3. Rotar `HOTMART_CLIENT_ID`, `HOTMART_CLIENT_SECRET` y cualquier secreto asociado si siguen activos, ya que estuvieron guardados en el entorno local. Confirmar también la eliminación de esos valores en hosting, CI y Supabase Secrets.
4. Probar un webhook Stripe real o de staging dos veces con el mismo evento y comprobar que se crea un único registro. Revisar además reintentos tras fallos de base de datos: algunas ramas del webhook registran el error y continúan, por lo que la estrategia de ACK/reintento debe probarse con las políticas y tablas reales.
5. La auditoría de código no verificó las políticas RLS efectivas de producción. Revisar RLS en `course_content`, `users`, `user_subscriptions`, `user_progress`, `consultations` y las funciones que usan `service_role`.

## 4. Rendimiento y optimización

Se eliminó el patrón de consultas por cada módulo/contenido en `getAllModules` y `getModuleContent`: ahora se obtiene contenido en lote, se agrupa en memoria y se consulta el nivel del usuario una sola vez por operación. El cálculo de `getAllModules` ya es síncrono después de la consulta y no usa `Promise.all` innecesario.

En el build observado, el bundle principal quedó alrededor de 604 kB sin gzip y el chunk de administración alrededor de 484 kB. Son oportunidades de mejora posteriores mediante análisis de dependencias y división del dashboard.

Las funciones cliente que generan URLs cachean enlaces durante cinco minutos. Si los recursos pasan a usar URLs firmadas de corta duración, ajustar ese TTL y evitar persistir URLs vencidas.

## 5. Recomendaciones priorizadas

1. **Alta: aplicar y desplegar la idempotencia de Stripe.** Ejecutar la migración, desplegar la Edge Function y validar deduplicación y recuperación ante fallos en staging.
2. **Alta: retirar secretos y servicios Hotmart remotos.** Rotar las credenciales expuestas localmente y comprobar que no queden Edge Functions, secrets o webhooks publicados.
3. **Alta: reconciliar autorización y RLS.** Elegir una fuente de verdad para membresías/roles y contrastarla con las políticas RLS de producción; hoy `useUserAccess` y `contentService` consultan modelos distintos.
4. **Media: planificar actualización mayor de dependencias.** `npm audit` detectó 10 avisos: 5 altos y 5 moderados, sin críticos tras actualizar jsPDF. Los fixes restantes indican Tailwind CSS 4 y React Router 7; migrar en una rama separada con pruebas de regresión, sin usar `npm audit fix --force` a ciegas.
5. **Media: ampliar pruebas de integración.** Añadir pruebas del checkout autenticado, catálogo de precios, deduplicación de webhook y permisos de contenido con respuestas de Supabase controladas.

## Verificación realizada

- `npm run build`: correcto; Vite generó `dist` y el hook `postbuild` regeneró el sitemap.
- `CI=1 npm test -- --run --silent`: cinco archivos aprobados, **63 tests aprobados**. Vitest emite una advertencia de `--localstorage-file` sin ruta, sin bloquear la suite.
- `npm audit --omit=dev`: **10 vulnerabilidades** informadas (5 altas, 5 moderadas, 0 críticas). Las correcciones restantes propuestas por npm requieren cambios mayores.
- Diagnósticos de los archivos modificados de contenido, checkout y webhook: sin errores reportados.
- Búsqueda global en código, funciones, documentación y configuración: sin referencias Hotmart.
- `git diff --check`: correcto.

El build actualiza automáticamente los `lastmod` del sitemap; el cambio observado solo modifica esas fechas y se conserva sin alterar las URLs existentes.
