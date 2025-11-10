import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import "https://deno.land/std@0.210.0/dotenv/load.ts";

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
          src="https://srv1511-files.hstgr.io/55400bd7ca2acb6b/files/public_html/Logo_negro.png"
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
        <p style="margin:5px 0 0 0;">Este es un correo automático de confirmación de consultoría.</p>
        <p style="margin:0;">No respondas a este mensaje.</p>
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
          src="https://srv1511-files.hstgr.io/55400bd7ca2acb6b/files/public_html/Logo_negro.png"
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
        <p style="margin:5px 0 0 0;">Este es un correo automático de confirmación de consultoría avanzada.</p>
        <p style="margin:0;">No respondas a este mensaje.</p>
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
          src="https://srv1511-files.hstgr.io/55400bd7ca2acb6b/files/public_html/Logo_negro.png"
          alt="BSB Capital"
          width="110"
          style="display:block; margin:auto;"
        />
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:10px 30px;">
        <h2 style="color:#0b1f14; font-weight:600; margin:0;">Confirmación de tu consulta</h2>
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
        <p style="margin:5px 0 0 0;">Este es un correo automático de confirmación de consulta.</p>
        <p style="margin:0;">No respondas a este mensaje.</p>
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
          src="https://srv1511-files.hstgr.io/55400bd7ca2acb6b/files/public_html/Logo_negro.png"
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
        <p style="margin:5px 0 0 0;">Tu onboarding crypto está confirmado.</p>
        <p style="margin:0;">No respondas a este mensaje.</p>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    // Template para NOTIFICACIONES A ADMINISTRADORES
    admin_consultation_notification: {
      subject: "🔔 Nueva consultoría reservada con formulario completado - BSB Capital",
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
          src="https://srv1511-files.hstgr.io/55400bd7ca2acb6b/files/public_html/Logo_negro.png"
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
          <strong>INFORMACIÓN DEL CLIENTE:</strong><br>
          • <strong>Nombre:</strong> {clientName}<br>
          • <strong>Email:</strong> {clientEmail}<br><br>
          
          <strong>DETALLES DE LA CONSULTA:</strong><br>
          • <strong>Tipo:</strong> {consultationType}<br>
          • <strong>Fecha:</strong> {preferredDate}<br>
          • <strong>Hora:</strong> {preferredTime}<br>
          • <strong>Duración:</strong> {duration}<br>
          • <strong>Precio:</strong> {price}<br>
          • <strong>ID Consulta:</strong> {consultationId}<br><br>
          
          <strong>PERFIL FINANCIERO:</strong><br>
          • <strong>Experiencia:</strong> {investmentExperience}<br>
          • <strong>Tamaño cartera:</strong> {portfolioSize}<br><br>
          
          <strong>OBJETIVOS:</strong><br>
          {consultationGoals}<br><br>
          
          <strong>INVERSIONES ACTUALES:</strong><br>
          {currentInvestments}<br><br>
          
          <strong>PREGUNTAS ESPECÍFICAS:</strong><br>
          {specificQuestions}<br><br>
          
          <strong>COMUNICACIÓN PREFERIDA:</strong> {preferredCommunication}<br><br>
          
          {additionalInfo}<br><br>
          
          <strong>Estado:</strong> ✅ Pago confirmado y formulario completado<br>
          <strong>Acción requerida:</strong> Asignar administrador y confirmar reunión<br><br>
          
          <em>Gestiona esta consultoría desde el panel de administración.</em>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>
    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · Sistema de notificaciones automáticas</p>
        <p style="margin:5px 0 0 0;">Panel: <a href="https://bsbcapital.io/admin" style="color:#C5A019; text-decoration:none;">Dashboard Admin</a></p>
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
          src="https://srv1511-files.hstgr.io/55400bd7ca2acb6b/files/public_html/Logo_negro.png"
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
        <p style="margin:5px 0 0 0;">Tu acceso a la Academia BSB está confirmado.</p>
        <p style="margin:0;">No respondas a este mensaje.</p>
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
          src="https://srv1511-files.hstgr.io/55400bd7ca2acb6b/files/public_html/Logo_negro.png"
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
        <p style="margin:5px 0 0 0;">Tu membresía Trader Plan Pro está confirmada.</p>
        <p style="margin:0;">No respondas a este mensaje.</p>
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
          src="https://srv1511-files.hstgr.io/55400bd7ca2acb6b/files/public_html/Logo_negro.png"
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
        <p style="margin:5px 0 0 0;">Tu membresía Premium Investor está confirmada.</p>
        <p style="margin:0;">No respondas a este mensaje.</p>
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
          src="https://srv1511-files.hstgr.io/55400bd7ca2acb6b/files/public_html/Logo_negro.png"
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
        <p style="margin:5px 0 0 0;">Tu membresía Wealth Membership está confirmada.</p>
        <p style="margin:0;">No respondas a este mensaje.</p>
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
    const { type, to, subject, html, data } = (await req.json()) as EmailRequest;

    // 🔐 Variables de entorno
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const defaultFrom =
      Deno.env.get("DEFAULT_FROM") || "BSB Capital <info@bsbcapital.io>";
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "info@bsbcapital.io";

    console.log(`🔧 Config - Admin Email: ${adminEmail}, Default From: ${defaultFrom}`);

    if (!resendApiKey) {
      throw new Error("Missing RESEND_API_KEY in environment");
    }

    if (!to) {
      throw new Error("Missing 'to' field in email request");
    }

    // � Validar formato del email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error(`Invalid email format: ${to}`);
    }

    // �📨 Lógica especial: notificación a administradores
    const recipient =
      type === "admin_consultation_notification" ? adminEmail : to;

    // 🔍 Validar email del destinatario final
    if (!emailRegex.test(recipient)) {
      throw new Error(`Invalid recipient email format: ${recipient}`);
    }

    console.log(`📧 Enviando email de tipo '${type}' a: ${recipient}`);

    // 🎨 Obtener template HTML si existe para este tipo
    const templates = getEmailTemplates();
    const template = templates[type as keyof typeof templates];
    
    let htmlContent: string;
    let emailSubject: string;
    
    if (template) {
      // Usar template profesional y reemplazar placeholders
      htmlContent = template.html
        .replace(/\[Nombre\]/g, data?.name || data?.clientName || "Usuario")
        .replace(/\{clientName\}/g, data?.clientName || "No especificado")
        .replace(/\{clientEmail\}/g, data?.clientEmail || "No especificado") 
        .replace(/\{consultationType\}/g, data?.consultationType || "No especificado")
        .replace(/\{consultationDate\}/g, data?.consultationDate || "Pendiente de programar")
        .replace(/\{preferredDate\}/g, data?.preferredDate || "Pendiente de programar")
        .replace(/\{preferredTime\}/g, data?.preferredTime || "Por confirmar")
        .replace(/\{duration\}/g, data?.duration || "No especificado")
        .replace(/\{price\}/g, data?.price || "No especificado")
        .replace(/\{consultationId\}/g, data?.consultationId || "No especificado")
        .replace(/\{investmentExperience\}/g, data?.investmentExperience || "No especificado")
        .replace(/\{portfolioSize\}/g, data?.portfolioSize || "No especificado")
        .replace(/\{consultationGoals\}/g, data?.consultationGoals || "No especificado")
        .replace(/\{currentInvestments\}/g, data?.currentInvestments || "No especificado")
        .replace(/\{specificQuestions\}/g, data?.specificQuestions || "No especificado")
        .replace(/\{preferredCommunication\}/g, data?.preferredCommunication || "No especificado")
        .replace(/\{additionalInfo\}/g, data?.additionalInfo ? `<strong>COMENTARIOS ADICIONALES:</strong><br>${data.additionalInfo}` : "")
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
