import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import "https://deno.land/std@0.210.0/dotenv/load.ts";

// 🎨 CONFIGURACIÓN DE LOGOS
// URL base determinada automáticamente
const BASE_URL = "https://bsbcapital.io";

const LOGO_URLS = {
  // Logo dorado para emails premium
  gold: `${BASE_URL}/public/images/gold_logo.jpeg`,
  // Logo negro para emails estándar  
  black: `${BASE_URL}/public/images/black_logo.jpeg`,
  // Logo blanco para fondos oscuros
  white: `${BASE_URL}/public/images/white_logo.jpeg`,
  // Logo por defecto (usaremos el dorado)
  default: `${BASE_URL}/public/images/gold_logo.jpeg`
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-function-secret",
};

interface EmailRequest {
  type: string;
  to: string;
  subject?: string;
  html?: string;
  data?: Record<string, any>;
  email?: string;
}

// 📧 Templates de email HTML profesionales
const getEmailTemplates = () => {
  return {
    // Templates para CONSULTORIAS
    consultation_financial: {
      subject: "Tu consultoría en BSB Capital está confirmada 🗓️",
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Consultoría</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img
          src="${LOGO_URLS.default}"
          alt="BSB Capital"
          width="110"
          style="display:block; margin:auto;"
        />
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:10px 30px;">
        <h2 style="color:#0b1f14; font-weight:600; margin:0;">Tu consultoría está confirmada</h2>
        <p style="font-size:16px; color:#37493f; line-height:1.6; margin-top:18px; margin-bottom:28px;">
          Hola [Nombre],<br><br>
          Gracias por confiar en BSB Capital. Tu consultoría personalizada ha sido confirmada con éxito.<br><br>
          En esta sesión trabajaremos contigo para analizar tu situación financiera y diseñar una estrategia clara, realista y adaptada a tus objetivos.<br><br>
          Durante la reunión:<br>
          ● Revisaremos tu situación actual y tus prioridades.<br>
          ● Estableceremos una hoja de ruta personalizada.<br>
          ● Recibirás un resumen detallado con las conclusiones y próximos pasos.<br>
          📅 En breve recibirás un correo con los detalles de la cita y el enlace de acceso.<br><br>
          Gracias por permitirnos acompañarte en tu crecimiento financiero.<br>
          El equipo de BSB Capital
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>
    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · <a href="mailto:info@bsbcapital.io" style="color:#C5A019; text-decoration:none;">info@bsbcapital.io</a></p>
        <p style="margin:5px 0 0 0;">Este es un correo automático enviado desde no-reply@bsbcapital.io</p>
        <p style="margin:0;">No respondas a este mensaje. Para consultas, contacta: info@bsbcapital.io</p>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    consultation_crypto_advanced: {
      subject: "Tu consultoría avanzada de Crypto & Web3 ha sido confirmada 🚀",
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Consultoría Avanzada</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img
          src="${LOGO_URLS.default}"
          alt="BSB Capital"
          width="110"
          style="display:block; margin:auto;"
        />
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:10px 30px;">
        <h2 style="color:#0b1f14; font-weight:600; margin:0;">Tu consultoría avanzada está confirmada</h2>
        <p style="font-size:16px; color:#37493f; line-height:1.6; margin-top:18px; margin-bottom:28px;">
          Hola [Nombre],<br><br>
          Tu consultoría estratégica de Crypto & Web3 con BSB Capital está confirmada.<br><br>
          Durante la sesión, trabajaremos contigo para analizar tu exposición actual al ecosistema cripto, revisar tus estrategias y definir un plan de acción claro y alineado con tus objetivos.<br><br>
          Ya sea para optimizar tu cartera, integrar activos digitales o entender nuevas oportunidades de inversión, recibirás una visión técnica, práctica y profesional.<br><br>
          📅 Pronto te enviaremos los detalles de tu cita y un breve formulario previo para personalizar la sesión.<br><br>
          Gracias por apostar por el futuro de la inversión.<br>
          El equipo de BSB Capital
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>
    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · <a href="mailto:info@bsbcapital.io" style="color:#C5A019; text-decoration:none;">info@bsbcapital.io</a></p>
        <p style="margin:5px 0 0 0;">Este es un correo automático enviado desde no-reply@bsbcapital.io</p>
        <p style="margin:0;">No respondas a este mensaje. Para consultas, contacta: info@bsbcapital.io</p>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    consultation_confirmation: {
      subject: "Confirmación de tu consulta en BSB Capital",
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de tu consulta</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img
          src="${LOGO_URLS.default}"
          alt="BSB Capital"
          width="110"
          style="display:block; margin:auto;"
        />
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:10px 30px;">
        <h2 style="color:#0b1f14; font-weight:600; margin:0;">¡Planificación financiera en marcha! 📊</h2>
        <p style="font-size:16px; color:#37493f; line-height:1.6; margin-top:18px; margin-bottom:28px;">
          Hola [Nombre],<br><br>
          Gracias por confiar en BSB Capital. Tu consulta ha sido confirmada con éxito.<br><br>
          📅 En breve recibirás un correo con los detalles de la cita y el enlace de acceso.<br><br>
          Nos vemos pronto.<br>
          El equipo de BSB Capital
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>
    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · <a href="mailto:info@bsbcapital.io" style="color:#C5A019; text-decoration:none;">info@bsbcapital.io</a></p>
        <p style="margin:5px 0 0 0;">Este es un correo automático enviado desde no-reply@bsbcapital.io</p>
        <p style="margin:0;">No respondas a este mensaje. Para consultas, contacta: info@bsbcapital.io</p>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    onboarding_crypto: {
      subject: "Bienvenido al mundo cripto con BSB Capital 🌍",
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Onboarding Crypto Confirmado</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img
          src="${LOGO_URLS.default}"
          alt="BSB Capital"
          width="110"
          style="display:block; margin:auto;"
        />
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:10px 30px;">
        <h2 style="color:#0b1f14; font-weight:600; margin:0;">¡Bienvenido al mundo cripto! 🌍</h2>
        <p style="font-size:16px; color:#37493f; line-height:1.6; margin-top:18px; margin-bottom:28px;">
          Hola [Nombre],<br><br>
          Tu consultoría de Onboarding Crypto & Web3 está confirmada.<br><br>
          En esta sesión te guiaremos paso a paso para entender cómo funciona el ecosistema cripto, invertir con seguridad y comenzar con una estrategia sólida y sencilla.<br><br>
          Verás que no hace falta experiencia previa: te acompañaremos en todo momento para que empieces con confianza y claridad.<br><br>
          📅 En breve recibirás los detalles de tu cita y el acceso al formulario previo.<br><br>
          Bienvenido a una nueva forma de entender las finanzas.<br>
          El equipo de BSB Capital
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>
    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · <a href="mailto:info@bsbcapital.io" style="color:#C5A019; text-decoration:none;">info@bsbcapital.io</a></p>
        <p style="margin:5px 0 0 0;">Este es un correo automático enviado desde no-reply@bsbcapital.io</p>
        <p style="margin:0;">No respondas a este mensaje. Para consultas, contacta: info@bsbcapital.io</p>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    // Template para NOTIFICACIONES A ADMINISTRADORES
    admin_consultation_notification: {
      subject: "🔔 Nueva consultoría reservada - BSB Capital",
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Consultoría Reservada</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img
          src="${LOGO_URLS.default}"
          alt="BSB Capital"
          width="110"
          style="display:block; margin:auto;"
        />
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:10px 30px;">
        <h2 style="color:#0b1f14; font-weight:600; margin:0;">🔔 Nueva consultoría reservada</h2>
        <p style="font-size:16px; color:#37493f; line-height:1.6; margin-top:18px; margin-bottom:28px;">
          <strong style="color:#C5A019;">INFORMACIÓN DEL CLIENTE:</strong><br>
          • <strong>Nombre:</strong> {clientName}<br>
          • <strong>Email:</strong> {clientEmail}<br>
          • <strong>Teléfono:</strong> {phone}<br><br>
          
          <strong style="color:#C5A019;">DETALLES DE LA CONSULTA:</strong><br>
          • <strong>Tipo:</strong> {consultationType}<br>
          • <strong>Fecha preferida:</strong> {preferredDate}<br>
          • <strong>Hora preferida:</strong> {preferredTime}<br>
          • <strong>Duración:</strong> {duration}<br>
          • <strong>Precio pagado:</strong> {price}<br>
          • <strong>ID Pago:</strong> {paymentId}<br>
          • <strong>ID Consulta:</strong> {consultationId}<br><br>
          
          <div style="background:#fff3cd; padding:15px; border-radius:6px; border-left:4px solid #ffc107; margin:15px 0;">
            <strong style="color:#856404;">📋 RESPUESTAS DEL CLIENTE:</strong><br><br>
            
            <strong>🎯 ¿Qué espera conseguir con la consultoría?</strong><br>
            <em style="color:#495057;">{consultationGoals}</em><br><br>
            
            <strong>📊 Experiencia en inversiones:</strong><br>
            <em style="color:#495057;">{investmentExperience}</em><br><br>
            
            <strong>💰 Tamaño de cartera aproximado:</strong><br>
            <em style="color:#495057;">{portfolioSize}</em><br><br>
            
            <strong>📈 Inversiones actuales:</strong><br>
            <em style="color:#495057;">{currentInvestments}</em><br><br>
            
            <strong>❓ Preguntas específicas:</strong><br>
            <em style="color:#495057;">{specificQuestions}</em><br><br>
            
            <strong>📞 Comunicación preferida:</strong><br>
            <em style="color:#495057;">{preferredCommunication}</em><br><br>
            
            <strong>💭 Información adicional:</strong><br>
            <em style="color:#495057;">{additionalInfo}</em><br><br>
            
            <small style="color:#6c757d;">🕒 Formulario completado: {timestamp}</small>
          </div>

          <div style="background:#e8f4fd; padding:15px; border-radius:6px; border-left:4px solid #0984e3; margin:15px 0;">
            <strong style="color:#2d3436;">📋 DATOS COMPLETOS DEL FORMULARIO:</strong><br><br>
            <div style="font-family:monospace; background:#f8f9fa; padding:10px; border-radius:4px; font-size:12px; color:#495057; white-space:pre-wrap; max-height:300px; overflow-y:auto;">
{formDataJson}
            </div>
          </div>
          
          <div style="background:#f8f9fa; padding:15px; border-left:4px solid #C5A019; margin:20px 0;">
            <strong style="color:#0b1f14;">🎯 ESTADO ACTUAL:</strong><br>
            ✅ Pago confirmado ({price})<br>
            ✅ Formulario completado<br>
            ⏳ <strong>Acción requerida:</strong> Asignar consultor y confirmar reunión
          </div>
          
          <p style="text-align:center; margin-top:25px;">
            <a href="https://bsbcapital.io/admin/consultations" 
               style="background:#C5A019; color:white; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:600;">
              📋 Gestionar en Dashboard
            </a>
          </p>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>
    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · Sistema de notificaciones automáticas</p>
        <p style="margin:5px 0 0 0;">Dashboard: <a href="https://bsbcapital.io/admin" style="color:#C5A019; text-decoration:none;">bsbcapital.io/admin</a></p>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    // Templates para MEMBRESÍAS
    academia_bsb: {
      subject: "Tu acceso a la Academia BSB está activo 🎓",
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Academia BSB Activada</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img
          src="${LOGO_URLS.default}"
          alt="BSB Capital"
          width="110"
          style="display:block; margin:auto;"
        />
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:10px 30px;">
        <h2 style="color:#0b1f14; font-weight:600; margin:0;">¡Bienvenido a la Academia BSB! 🎓</h2>
        <p style="font-size:16px; color:#37493f; line-height:1.6; margin-top:18px; margin-bottom:28px;">
          Hola [Nombre],<br><br>
          Tu acceso a la Academia BSB Capital está activo.<br>
          Ya puedes comenzar tu formación en inversión, fiscalidad y crypto con nuestro método práctico y directo.<br><br>
          Con tu acceso obtienes:<br><br>
          ● Acceso completo al contenido de la academia<br>
          ● 4 módulos completos de formación<br>
          ● Plantillas y checklists descargables<br>
          ● Soporte prioritario por email<br>
          ● Actualizaciones gratuitas<br>
          ● Comunidad privada de alumnos<br><br>
          ✅ <a href="https://bsbcapital.io/academia" style="color:#C5A019; text-decoration:none;">Acceder a la Academia ahora</a><br><br>
          Gracias por invertir en tu formación financiera.<br>
          El equipo de BSB Capital
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>
    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · <a href="mailto:info@bsbcapital.io" style="color:#C5A019; text-decoration:none;">info@bsbcapital.io</a></p>
        <p style="margin:5px 0 0 0;">Este es un correo automático enviado desde no-reply@bsbcapital.io</p>
        <p style="margin:0;">No respondas a este mensaje. Para consultas, contacta: info@bsbcapital.io</p>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    trader_plan_pro: {
      subject: "Tu membresía Trader Plan Pro está activa 📈",
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trader Plan Pro Activo</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img
          src="${LOGO_URLS.default}"
          alt="BSB Capital"
          width="110"
          style="display:block; margin:auto;"
        />
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:10px 30px;">
        <h2 style="color:#0b1f14; font-weight:600; margin:0;">¡Tu membresía Trader Plan Pro está activa! 📈</h2>
        <p style="font-size:16px; color:#37493f; line-height:1.6; margin-top:18px; margin-bottom:28px;">
          Hola [Nombre],<br><br>
          Bienvenido a Trader Plan Pro.<br>
          Tu membresía ya está activa y con ella desbloqueas acceso a las herramientas y conocimientos que te ayudarán a llevar tu trading al siguiente nivel.<br><br>
          A partir de ahora podrás disfrutar de:<br><br>
          ● Acceso anticipado a BSB Maker, tu copiloto de trading con IA<br>
          ● Acceso completo a la formación (píldoras + masterclass)<br>
          ● 20% de descuento en consultorías personalizadas<br>
          ● 1 consultoría de 30 minutos incluida en tu plan anual<br><br>
          ✅ <a href="https://bsbcapital.io/bsb-maker" style="color:#C5A019; text-decoration:none;">Explorar BSB Maker</a><br>
          ✅ <a href="https://bsbcapital.io/academia" style="color:#C5A019; text-decoration:none;">Acceder a la formación</a><br><br>
          Prepárate para optimizar tus operaciones y entender los mercados con otra perspectiva.<br><br>
          Gracias por confiar en BSB Capital.<br>
          El equipo de BSB Capital
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>
    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · <a href="mailto:info@bsbcapital.io" style="color:#C5A019; text-decoration:none;">info@bsbcapital.io</a></p>
        <p style="margin:5px 0 0 0;">Este es un correo automático enviado desde no-reply@bsbcapital.io</p>
        <p style="margin:0;">No respondas a este mensaje. Para consultas, contacta: info@bsbcapital.io</p>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    premium_investor: {
      subject: "Tu membresía Premium Investor está activa 💎",
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Premium Investor Activo</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img
          src="${LOGO_URLS.default}"
          alt="BSB Capital"
          width="110"
          style="display:block; margin:auto;"
        />
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:10px 30px;">
        <h2 style="color:#0b1f14; font-weight:600; margin:0;">¡Tu membresía Premium Investor está activa! 💎</h2>
        <p style="font-size:16px; color:#37493f; line-height:1.6; margin-top:18px; margin-bottom:28px;">
          Hola [Nombre],<br><br>
          Tu suscripción a Premium Investor está confirmada.<br>
          A partir de hoy formas parte de una comunidad exclusiva de inversores que buscan claridad, estrategia y crecimiento sostenible.<br><br>
          Con tu membresía tienes acceso a:<br><br>
          ● Comunidad privada de inversores BSB<br>
          ● Acceso completo a la formación avanzada (cursos temáticos + masterclass)<br>
          ● 20% de descuento en consultorías<br>
          ● 1 consultoría personalizada de 30 minutos incluida en tu plan anual<br><br>
          ✅ <a href="https://bsbcapital.io/comunidad" style="color:#C5A019; text-decoration:none;">Acceder a la comunidad</a><br>
          ✅ <a href="https://bsbcapital.io/consultoria" style="color:#C5A019; text-decoration:none;">Reservar consultoría</a><br><br>
          Explora, aprende y crece junto a nosotros.<br>
          El equipo de BSB Capital está contigo en cada paso.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>
    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · <a href="mailto:info@bsbcapital.io" style="color:#C5A019; text-decoration:none;">info@bsbcapital.io</a></p>
        <p style="margin:5px 0 0 0;">Este es un correo automático enviado desde no-reply@bsbcapital.io</p>
        <p style="margin:0;">No respondas a este mensaje. Para consultas, contacta: info@bsbcapital.io</p>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    wealth_membership: {
      subject: "Bienvenido a Wealth Membership — Tu gestión patrimonial personalizada ya está activa 🏛️",
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wealth Membership Activo</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img
          src="${LOGO_URLS.default}"
          alt="BSB Capital"
          width="110"
          style="display:block; margin:auto;"
        />
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:10px 30px;">
        <h2 style="color:#0b1f14; font-weight:600; margin:0;">¡Bienvenido a Wealth Membership! 🏛️</h2>
        <p style="font-size:16px; color:#37493f; line-height:1.6; margin-top:18px; margin-bottom:28px;">
          Hola [Nombre],<br><br>
          Gracias por confiar en BSB Capital para acompañarte en la gestión de tu patrimonio.<br>
          Tu membresía Wealth Membership ha sido activada con éxito.<br><br>
          A partir de ahora contarás con un acompañamiento exclusivo y continuo que incluye:<br><br>
          ● 6 consultorías personalizadas de 1h/año (valoradas en 1.800 €)<br>
          ● Revisión completa de cartera semestral<br>
          ● Plan estratégico anual con propuestas de optimización<br>
          ● Acceso a un canal privado prioritario y comunidad élite con análisis exclusivos y oportunidades de networking<br><br>
          Este plan está diseñado para ofrecerte claridad, continuidad y control sobre tu estrategia patrimonial, sin ceder la gestión.<br><br>
          ✅ <a href="https://bsbcapital.io/consultoria" style="color:#C5A019; text-decoration:none;">Reservar primera consultoría</a><br><br>
          Tu consultor asignado se pondrá en contacto contigo en las próximas 24 h para programar la primera sesión.<br><br>
          El equipo de BSB Capital
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>
    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · <a href="mailto:info@bsbcapital.io" style="color:#C5A019; text-decoration:none;">info@bsbcapital.io</a></p>
        <p style="margin:5px 0 0 0;">Este es un correo automático enviado desde no-reply@bsbcapital.io</p>
        <p style="margin:0;">No respondas a este mensaje. Para consultas, contacta: info@bsbcapital.io</p>
      </td>
    </tr>
  </table>
</body>
</html>`
    }
  };
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405,
      },
    );
  }

  try {
    const { type, to, subject, html, data, email } = (await req.json()) as EmailRequest;

    // 🔐 Variables de entorno
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const defaultFrom =
      Deno.env.get("DEFAULT_FROM") || "BSB Capital <no-reply@bsbcapital.io>";
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "info@bsbcapital.io";

    console.log(`🔧 Config - Admin Email: ${adminEmail}, Default From: ${defaultFrom}`);

    if (!resendApiKey) {
      throw new Error("Missing RESEND_API_KEY in environment");
    }

    // 🛠️ FUNCIONES ESPECIALES DE GESTIÓN DE LISTA DE SUPRESIÓN
    
    // Obtener lista de emails suprimidos
    if (type === "get_suppressed_emails") {
      console.log("📋 Obteniendo lista de emails suprimidos...");
      
      const suppressionResponse = await fetch("https://api.resend.com/suppressions", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
      });

      const suppressionData = await suppressionResponse.json();

      if (!suppressionResponse.ok) {
        throw new Error(suppressionData.message || "Error fetching suppression list");
      }

      return new Response(
        JSON.stringify({
          success: true,
          emails: suppressionData.data || [],
          count: suppressionData.data?.length || 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // Verificar estado de un email específico
    if (type === "check_email_status") {
      if (!email) {
        throw new Error("Missing 'email' field for status check");
      }

      console.log(`🔍 Verificando estado del email: ${email}`);

      // Obtener lista de supresión
      const suppressionResponse = await fetch("https://api.resend.com/suppressions", {
        method: "GET", 
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
      });

      const suppressionData = await suppressionResponse.json();
      
      if (suppressionResponse.ok && suppressionData.data) {
        const suppressedEmail = suppressionData.data.find(
          (item: any) => item.email === email
        );

        if (suppressedEmail) {
          return new Response(
            JSON.stringify({
              success: true,
              status: "suppressed",
              isSuppressed: true,
              reason: suppressedEmail.reason || "Account suppression list",
              createdAt: suppressedEmail.created_at,
              details: "Este email está en la lista de supresión de Resend"
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            },
          );
        }
      }

      // Si no está en la lista de supresión, está OK
      return new Response(
        JSON.stringify({
          success: true,
          status: "active",
          isSuppressed: false,
          reason: "Email activo",
          details: "Este email no está en ninguna lista de supresión"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // Remover email de la lista de supresión
    if (type === "remove_from_suppression") {
      if (!email) {
        throw new Error("Missing 'email' field for suppression removal");
      }

      console.log(`🗑️ Removiendo email de lista de supresión: ${email}`);

      const removalResponse = await fetch(`https://api.resend.com/suppressions/${encodeURIComponent(email)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (removalResponse.status === 204 || removalResponse.status === 200) {
        console.log(`✅ Email ${email} removido exitosamente de la lista de supresión`);
        
        return new Response(
          JSON.stringify({
            success: true,
            message: `Email ${email} removido de la lista de supresión`,
            email,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      } else {
        const errorData = await removalResponse.json();
        throw new Error(errorData.message || `Error removing ${email} from suppression list`);
      }
    }

    // 📧 FUNCIONES NORMALES DE ENVÍO DE EMAIL

    if (!to) {
      throw new Error("Missing 'to' field in email request");
    }

    // � Validar formato del email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error(`Invalid email format: ${to}`);
    }

    // 📨 Lógica especial: notificación a administradores
    let recipient;
    if (type === "admin_consultation_notification") {
      // Forzar siempre el email correcto para administradores
      recipient = adminEmail.includes('.com') ? adminEmail.replace('.com', '.io') : adminEmail;
      console.log(`🎯 Email de admin detectado - Enviando a: ${recipient}`);
    } else {
      recipient = to;
    }

    // 🔍 Validar email del destinatario final
    if (!emailRegex.test(recipient)) {
      throw new Error(`Invalid recipient email format: ${recipient}`);
    }

    console.log(`📧 Enviando email de tipo '${type}' a: ${recipient}`);
    console.log(`🔧 Variables de entorno:`, {
      adminEmailOriginal: Deno.env.get("ADMIN_EMAIL"),
      adminEmailFinal: adminEmail,
      defaultFromOriginal: Deno.env.get("DEFAULT_FROM"),
      defaultFromFinal: defaultFrom,
      originalTo: to,
      finalRecipient: recipient,
      isAdminNotification: type === "admin_consultation_notification"
    });
    
    // ⚠️ Validación especial para detectar .com
    if (recipient.includes('.com')) {
      console.warn(`⚠️ ADVERTENCIA: Email con dominio .com detectado: ${recipient}`);
      console.warn(`⚠️ Esto puede causar problemas. Verifica tu configuración.`);
    }

    // 🎨 Obtener template HTML si existe para este tipo
    const templates = getEmailTemplates();
    const template = templates[type as keyof typeof templates];
    
    let htmlContent: string;
    let emailSubject: string;
    
    if (template) {
      // Usar template profesional y reemplazar placeholders
      htmlContent = template.html
        .replace(/\[Nombre\]/g, data?.name || data?.clientName || "Usuario")
        .replace(/\{clientName\}/g, data?.clientName || data?.name || "No especificado")
        .replace(/\{clientEmail\}/g, data?.clientEmail || data?.email || "No especificado") 
        .replace(/\{phone\}/g, data?.phone || "No especificado")
        .replace(/\{consultationType\}/g, data?.consultationType || data?.type || "No especificado")
        .replace(/\{consultationDate\}/g, data?.consultationDate || "Pendiente de programar")
        .replace(/\{preferredDate\}/g, data?.preferredDate || data?.date || "Por programar")
        .replace(/\{preferredTime\}/g, data?.preferredTime || data?.time || "Por confirmar")
        .replace(/\{duration\}/g, data?.duration || "60 minutos (estándar)")
        .replace(/\{price\}/g, data?.price || data?.amount || "No especificado")
        .replace(/\{paymentId\}/g, data?.paymentId || data?.stripePaymentId || "Pendiente")
        .replace(/\{consultationId\}/g, data?.consultationId || data?.id || "Generando...")
        .replace(/\{investmentExperience\}/g, data?.investmentExperience || "No especificado")
        .replace(/\{portfolioSize\}/g, data?.portfolioSize || "No especificado")
        .replace(/\{riskTolerance\}/g, data?.riskTolerance || "No especificado")
        .replace(/\{consultationGoals\}/g, data?.consultationGoals || data?.goals || "📝 Por definir durante la consulta")
        .replace(/\{currentInvestments\}/g, data?.currentInvestments || "📊 Por revisar en la consulta")
        .replace(/\{specificQuestions\}/g, data?.specificQuestions || data?.questions || "❓ Por definir durante la consulta")
        .replace(/\{preferredCommunication\}/g, data?.preferredCommunication || "📞 Videollamada (recomendado)")
        .replace(/\{availability\}/g, data?.availability || "⏰ Por coordinar")
        .replace(/\{timestamp\}/g, data?.timestamp || new Date().toISOString())
        .replace(/\{additionalInfo\}/g, data?.additionalInfo ? 
          `💭 ${data.additionalInfo}` : "Sin comentarios adicionales")
        .replace(/\{amount\}/g, data?.amount?.toString() || "0")
        .replace(/\{currency\}/g, data?.currency || "EUR");
      emailSubject = subject || template.subject;
      console.log("✨ Usando template profesional para tipo:", type);
    } else {
      // Fallback básico si no hay template específico
      htmlContent = html || 
        `<p>Hola ${data?.name || "usuario"},</p><p>Tu correo de tipo <b>${type}</b> ha sido procesado.</p>`;
      emailSubject = subject || `Mensaje de BSB Capital (${type})`;
      console.log("📄 Usando fallback básico para tipo:", type);
    }

    // 📦 Construcción del cuerpo de email
    const emailPayload = {
      from: defaultFrom,
      to: recipient,
      subject: emailSubject,
      html: htmlContent,
    };

    console.log("📨 Enviando correo con Resend...");
    console.log("→ Tipo:", type);
    console.log("→ Destinatario:", recipient);

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    const result = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("❌ Resend API error:", result);
      throw new Error(result.message || "Unknown Resend API error");
    }

    console.log("✅ Correo enviado correctamente:", result.id);

    return new Response(
      JSON.stringify({
        success: true,
        id: result.id,
        recipient,
        type,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown internal error";

    console.error("❌ Error al enviar correo:", message);

    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
