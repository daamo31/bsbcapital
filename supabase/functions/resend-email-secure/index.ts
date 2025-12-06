import { serve } from 'https://deno.land/std@0.210.0/http/server.ts';
import 'https://deno.land/std@0.210.0/dotenv/load.ts';

// 🎨 CONFIGURACIÓN DE LOGOS
// URL base determinada automáticamente
const BASE_URL = 'https://bsbcapital.io';

const LOGO_URLS = {
  // Logo dorado para emails premium
  gold: `${BASE_URL}/images/gold_logo.jpeg`,
  // Logo negro para emails estándar
  black: `${BASE_URL}/images/black_logo.jpeg`,
  // Logo blanco para fondos oscuros
  white: `${BASE_URL}/images/white_logo.jpeg`,
  // Logo por defecto (usaremos el dorado)
  default: `${BASE_URL}/images/gold_logo.jpeg`,
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-function-secret',
};

interface EmailRequest {
  type: string;
  to: string;
  subject?: string;
  html?: string;
  data?: Record<string, any>;
  email?: string;
}

// 🎨 Función para formatear JSON de forma legible para administradores
function formatFormDataForAdmin(formDataJson: string | object): string {
  try {
    let data: any;

    if (typeof formDataJson === 'string') {
      data = JSON.parse(formDataJson);
    } else {
      data = formDataJson;
    }

    if (!data || typeof data !== 'object') {
      return '<em>No hay datos adicionales disponibles</em>';
    }

    let formattedHtml = '';

    // Información de la consulta
    if (data.consultation_id) {
      formattedHtml += `<div style="margin-bottom: 15px; padding: 10px; background: #e3f2fd; border-radius: 5px;">
        <strong style="color: #1565c0;">📋 INFORMACIÓN DE LA CONSULTA</strong><br>
        <strong>ID:</strong> ${data.consultation_id}<br>
        <strong>Tipo:</strong> ${data.consultation_type || 'No especificado'}<br>
        <strong>Fecha:</strong> ${new Date(data.timestamp || '').toLocaleString('es-ES') || 'No especificado'}
      </div>`;
    }

    // Datos del cliente (client_responses es más legible)
    if (data.client_responses && typeof data.client_responses === 'object') {
      formattedHtml += `<div style="margin-bottom: 15px; padding: 10px; background: #f3e5f5; border-radius: 5px;">
        <strong style="color: #7b1fa2;">👤 RESPUESTAS DEL CLIENTE</strong><br><br>`;

      for (const [key, value] of Object.entries(data.client_responses)) {
        if (value && value !== '' && value !== 'No especificado') {
          formattedHtml += `<strong>${key}:</strong> ${value}<br>`;
        }
      }
      formattedHtml += `</div>`;
    }

    // Datos técnicos del formulario (solo campos relevantes)
    if (data.form_data && typeof data.form_data === 'object') {
      const relevantFields = [
        'investment_experience',
        'portfolio_size',
        'consultation_goals',
        'current_investments',
        'specific_questions',
        'preferred_communication',
        'telephone',
        'country',
        'age_range',
        'risk_tolerance',
        'time_horizon',
      ];

      const hasRelevantData = relevantFields.some(
        (field) =>
          data.form_data[field] &&
          data.form_data[field] !== '' &&
          data.form_data[field] !== 'No especificado'
      );

      if (hasRelevantData) {
        formattedHtml += `<div style="margin-bottom: 15px; padding: 10px; background: #fff3e0; border-radius: 5px;">
          <strong style="color: #ef6c00;">🔧 DATOS TÉCNICOS ADICIONALES</strong><br><br>`;

        relevantFields.forEach((field) => {
          if (
            data.form_data[field] &&
            data.form_data[field] !== '' &&
            data.form_data[field] !== 'No especificado'
          ) {
            const friendlyName = field.replace(/_/g, ' ').replace(/\b\w/g, function (l) {
              return l.toUpperCase();
            });
            formattedHtml += `<strong>${friendlyName}:</strong> ${data.form_data[field]}<br>`;
          }
        });
        formattedHtml += `</div>`;
      }
    }

    return formattedHtml || '<em>No hay datos adicionales disponibles</em>';
  } catch (error: any) {
    console.error('Error formateando datos del formulario:', error);
    return `<em>Error al formatear los datos: ${error?.message || 'Error desconocido'}</em>`;
  }
}

// 📧 Templates de email HTML profesionales
const getEmailTemplates = () => {
  return {
    // Template para BIENVENIDA (nuevos usuarios)
    welcome: {
      subject: '¡Bienvenido a BSB Capital! 🚀 Tu viaje hacia la libertad financiera comienza aquí',
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a BSB Capital</title>
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
        <h2 style="color:#0b1f14; font-weight:600; margin:0;">¡Bienvenido a BSB Capital! 🚀</h2>
        <p style="font-size:16px; color:#37493f; line-height:1.6; margin-top:18px; margin-bottom:28px;">
          Hola [Nombre],<br><br>
          ¡Es genial tenerte en nuestra comunidad!<br><br>
          En BSB Capital creemos que todos merecen tener claridad y control sobre su futuro financiero. Por eso estamos aquí: para acompañarte con estrategias prácticas, herramientas reales y el conocimiento que necesitas para tomar decisiones inteligentes.<br><br>
          <strong>¿Qué puedes hacer ahora?</strong><br><br>
          🎓 <strong>Explora la Academia BSB</strong><br>
          Accede a formación práctica en inversión, fiscalidad y criptomonedas.<br>
          <a href="https://bsbcapital.io/academia" style="color:#C5A019; text-decoration:none;">→ Ir a la Academia</a><br><br>
          
          🤖 <strong>Prueba BSB Maker</strong><br>
          Tu copiloto de trading e inversión con inteligencia artificial.<br>
          <a href="https://bsbcapital.io/bsb-maker" style="color:#C5A019; text-decoration:none;">→ Explorar BSB Maker</a><br><br>
          
          💼 <strong>Agenda una consultoría personalizada</strong><br>
          Recibe estrategias adaptadas a tu situación y objetivos únicos.<br>
          <a href="https://bsbcapital.io/consultoria" style="color:#C5A019; text-decoration:none;">→ Reservar consultoría</a><br><br>
          
          📚 <strong>Únete a la comunidad</strong><br>
          Conecta con otros inversores y accede a contenido exclusivo.<br>
          <a href="https://bsbcapital.io/comunidad" style="color:#C5A019; text-decoration:none;">→ Acceder a la comunidad</a><br><br>
          
          Estamos emocionados de acompañarte en este viaje. Si tienes preguntas, no dudes en contactarnos.<br><br>
          <strong>Bienvenido a tu nueva forma de entender las finanzas.</strong><br><br>
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
        <p style="margin:5px 0 0 0;">¡Gracias por unirte a nuestra comunidad! Este correo ha sido enviado desde no-reply@bsbcapital.io</p>
        <p style="margin:0;">Para consultas o soporte, contacta: info@bsbcapital.io</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
    },
    // Templates para CONSULTORIAS - ACTUALIZADOS
    consultation_portfolio_optimization: {
      subject: 'Tu consultoría de Optimización de cartera en BSB Capital está confirmada 🗓',
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consultoría Optimización Cartera</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img src="${LOGO_URLS.default}" alt="BSB Capital" width="110" style="display:block; margin:auto;" />
      </td>
    </tr>
    <tr>
      <td style="padding:20px 30px 40px;">
        <div style="font-size:16px; color:#37493f; line-height:1.6;">
          <p>Tu consultoría personalizada ha sido confirmada con éxito.</p>
          <p>En esta sesión trabajaremos contigo para analizar tu situación financiera y diseñar una estrategia clara, realista y adaptada a tus objetivos.</p>
          
          <p><strong>Durante la reunión:</strong></p>
          <ul style="margin: 16px 0; padding-left: 20px;">
            <li>Revisaremos tu situación actual y tus prioridades.</li>
            <li>Estableceremos una hoja de ruta personalizada.</li>
            <li>Recibirás un resumen detallado con las conclusiones y próximos pasos.</li>
          </ul>
          
          <p>📅 El mismo día de la consulta recibirás el enlace de acceso a la reunión a través de Google Meet.</p>
          
          <p>Si tienes cualquier duda, puedes contactar con nosotros en info@bsbcapital.io</p>
          
          <p>Gracias por confiar en BSB Capital y permitirnos acompañarte en tu crecimiento financiero.</p>
          <p><strong>El equipo de BSB Capital</strong></p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>
    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · <a href="mailto:info@bsbcapital.io" style="color:#C5A019; text-decoration:none;">info@bsbcapital.io</a></p>
        <p style="margin:5px 0 0 0;">Este es un correo automático de confirmación.</p>
        <p style="margin:0;">No respondas a este mensaje.</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
    },

    consultation_crypto_web3: {
      subject: 'Tu consultoría de Crypto & Web3 ha sido confirmada 🗓',
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consultoría Crypto & Web3</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img src="${LOGO_URLS.default}" alt="BSB Capital" width="110" style="display:block; margin:auto;" />
      </td>
    </tr>
    <tr>
      <td style="padding:20px 30px 40px;">
        <div style="font-size:16px; color:#37493f; line-height:1.6;">
          <p>Tu consultoría estratégica de Crypto & Web3 con BSB Capital está confirmada.</p>
          
          <p>Durante la sesión, trabajaremos contigo para analizar tu exposición actual al ecosistema crypto, revisar tus estrategias y definir un plan de acción claro y alineado con tus objetivos.</p>
          
          <p>Ya sea para optimizar tu cartera, integrar activos digitales o entender nuevas oportunidades de inversión, recibirás una visión técnica y profesional.</p>
          
          <p>El mismo día de la consulta recibirás el enlace de acceso a la reunión a través de Google Meet.</p>
          
          <p>Si tienes cualquier duda, puedes contactar con nosotros en info@bsbcapital.io</p>
          
          <p>Gracias por apostar por el futuro de la inversión.</p>
          <p><strong>El equipo de BSB Capital</strong></p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>
    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · <a href="mailto:info@bsbcapital.io" style="color:#C5A019; text-decoration:none;">info@bsbcapital.io</a></p>
        <p style="margin:5px 0 0 0;">Este es un correo automático de confirmación.</p>
        <p style="margin:0;">No respondas a este mensaje.</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
    },

    consultation_crypto_onboarding: {
      subject: 'Tu consultoría de Crypto & Web3 ha sido confirmada 🗓',
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consultoría Onboarding Crypto</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img src="${LOGO_URLS.default}" alt="BSB Capital" width="110" style="display:block; margin:auto;" />
      </td>
    </tr>
    <tr>
      <td style="padding:20px 30px 40px;">
        <div style="font-size:16px; color:#37493f; line-height:1.6;">
          <p>Tu consultoría de Onboarding Crypto está confirmada.</p>
          
          <p>Esta sesión está diseñada para ayudarte a dar tus primeros pasos en el ecosistema cripto de forma clara y segura. Te explicaremos lo esencial, resolveremos tus dudas y te guiaremos para que puedas comenzar con una estrategia básica pero bien estructurada.</p>
          
          <p>No necesitas experiencia previa: estaremos contigo para que empieces con confianza, claridad y una base bien estructurada.</p>
          
          <p>El mismo día de la consulta recibirás el enlace de acceso a la reunión a través de Google Meet.</p>
          
          <p>Si tienes cualquier duda, puedes contactar con nosotros en info@bsbcapital.io.</p>
          
          <p>Gracias por confiar en BSB Capital para iniciar tu camino en el mundo crypto.</p>
          <p><strong>El equipo de BSB Capital</strong></p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>
    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · <a href="mailto:info@bsbcapital.io" style="color:#C5A019; text-decoration:none;">info@bsbcapital.io</a></p>
        <p style="margin:5px 0 0 0;">Este es un correo automático de confirmación.</p>
        <p style="margin:0;">No respondas a este mensaje.</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
    },

    consultation_treasury_crypto: {
      subject: 'Tu consultoría de Gestión de Tesorería Crypto para empresas ha sido confirmada 🗓',
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consultoría Tesorería Crypto</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img src="${LOGO_URLS.default}" alt="BSB Capital" width="110" style="display:block; margin:auto;" />
      </td>
    </tr>
    <tr>
      <td style="padding:20px 30px 40px;">
        <div style="font-size:16px; color:#37493f; line-height:1.6;">
          <p>Tu consultoría en Gestión de Tesorería Crypto para empresas ha sido confirmada.</p>
          
          <p>Esta consultoría está diseñada para ayudarte a comprender cómo integrar, ordenar o estructurar la exposición a activos digitales dentro de la tesorería corporativa. Nuestro objetivo es que puedas tomar decisiones con una visión profesional y alineada con la estrategia de la compañía.</p>
          
          <p><strong>Durante la sesión:</strong></p>
          <ul style="margin: 16px 0; padding-left: 20px;">
            <li>Obtendrás una visión general del marco estratégico para gestionar activos digitales en una empresa.</li>
            <li>Te guiaremos en cómo establecer una estructura de tesorería coherente con vuestro perfil de riesgo, liquidez y necesidades operativas.</li>
            <li>Resolveremos dudas y marcaremos los primeros pasos para avanzar con seguridad y criterio.</li>
          </ul>
          
          <p>El mismo día de la consulta recibirás el enlace de acceso a la reunión a través de Google Meet.</p>
          
          <p>Si tienes cualquier duda, puedes contactar con nosotros en info@bsbcapital.io</p>
          
          <p>Gracias por confiar en BSB Capital.</p>
          <p><strong>El equipo de BSB Capital</strong></p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>
    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · <a href="mailto:info@bsbcapital.io" style="color:#C5A019; text-decoration:none;">info@bsbcapital.io</a></p>
        <p style="margin:5px 0 0 0;">Este es un correo automático de confirmación.</p>
        <p style="margin:0;">No respondas a este mensaje.</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
    },

    // Templates para PAQUETES
    package_crypto_onboarding: {
      subject: 'Tu paquete Onboarding Crypto con BSB Capital está confirmado 🚀',
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Paquete Onboarding Crypto</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img src="${LOGO_URLS.default}" alt="BSB Capital" width="110" style="display:block; margin:auto;" />
      </td>
    </tr>
    <tr>
      <td style="padding:20px 30px 40px;">
        <div style="font-size:16px; color:#37493f; line-height:1.6;">
          <p><strong>Enhorabuena,</strong></p>
          
          <p>Has tomado una decisión que marca la diferencia: en lugar de improvisar con tu dinero has elegido empezar por el principio, con orden, criterio y acompañamiento profesional.</p>
          
          <p>Mientras la mayoría entra en el mundo crypto atraído por las rentabilidades rápidas y la inmediatez de la inversión, tú has elegido invertir en construir una base sólida para que esas rentabilidades lleguen con conocimiento y seguridad.</p>
          
          <p>Y sí: eso te coloca un paso por delante del mercado.</p>
          
          <p>Tu onboarding crypto con BSB Capital está confirmado y, a partir de hoy, empezamos a trabajar contigo para que:</p>
          <ul style="margin: 16px 0; padding-left: 20px;">
            <li>Tengas una visión clara y estructurada del ecosistema crypto.</li>
            <li>Evites errores habituales de quien entra sin marco ni estrategia.</li>
            <li>Puedas tomar decisiones alineadas con tus objetivos.</li>
          </ul>
          
          <p>En breves recibirás instrucciones detalladas sobre cómo acceder a cada uno de los servicios incluidos en tu paquete.</p>
          
          <p>Si tienes cualquier duda, puedes contactar con nosotros en info@bsbcapital.io</p>
          
          <p>Gracias por confiar en BSB Capital.</p>
          
          <p>Un saludo,</p>
          <p><strong>Juan Salgado</strong><br>CEO BSB Capital</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>
    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · <a href="mailto:info@bsbcapital.io" style="color:#C5A019; text-decoration:none;">info@bsbcapital.io</a></p>
        <p style="margin:5px 0 0 0;">Este es un correo automático de confirmación.</p>
        <p style="margin:0;">No respondas a este mensaje.</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
    },

    package_treasury_crypto: {
      subject: 'Tu paquete Gestión de Tesorería Crypto para empresas está confirmado 🚀',
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Paquete Gestión Tesorería Crypto</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img src="${LOGO_URLS.default}" alt="BSB Capital" width="110" style="display:block; margin:auto;" />
      </td>
    </tr>
    <tr>
      <td style="padding:20px 30px 40px;">
        <div style="font-size:16px; color:#37493f; line-height:1.6;">
          <p>Gracias por confiar en BSB Capital.</p>
          
          <p>Te confirmamos la contratación del paquete Gestión de Tesorería Crypto para empresas.</p>
          
          <p>La incorporación de activos digitales a la tesorería corporativa sigue siendo poco habitual en la mayoría de compañías. Dar este paso, o decidir ordenar una exposición que ya existe, supone avanzar hacia una gestión más profesional, estructurada y alineada con la realidad del mercado.</p>
          
          <p>A partir de ahora, nuestro trabajo se centrará en:</p>
          <ul style="margin: 16px 0; padding-left: 20px;">
            <li>Obtener una visión clara y consolidada de vuestra posición en activos digitales.</li>
            <li>Definir una estructura de tesorería cripto coherente con vuestro perfil de riesgo, necesidades de liquidez y estrategia corporativa.</li>
            <li>Establecer un marco de seguimiento y control que facilite la toma de decisiones y la comunicación con dirección, socios, asesores y departamento financiero.</li>
          </ul>
          
          <p>En breves recibirás instrucciones detalladas sobre cómo acceder a cada uno de los servicios incluidos en tu paquete.</p>
          
          <p>Si tienes cualquier duda relacionada con el servicio o los próximos pasos, puedes contactar con nosotros en info@bsbcapital.io</p>
          
          <p>Un saludo,</p>
          <p><strong>Juan Salgado</strong><br>CEO de BSB Capital</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>
    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · <a href="mailto:info@bsbcapital.io" style="color:#C5A019; text-decoration:none;">info@bsbcapital.io</a></p>
        <p style="margin:5px 0 0 0;">Este es un correo automático de confirmación.</p>
        <p style="margin:0;">No respondas a este mensaje.</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
    },

    package_investor_premium: {
      subject: 'Tu paquete Inversor Premium de BSB Capital está confirmado 🚀',
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Paquete Investor Premium</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img src="${LOGO_URLS.default}" alt="BSB Capital" width="110" style="display:block; margin:auto;" />
      </td>
    </tr>
    <tr>
      <td style="padding:20px 30px 40px;">
        <div style="font-size:16px; color:#37493f; line-height:1.6;">
          <p>Gracias por confiar en BSB Capital y enhorabuena por la decisión que acabas de tomar.</p>
          
          <p>Tu acceso a Inversor Premium está oficialmente confirmado. Con este paso, te conviertes en una absoluta prioridad dentro de BSB capital y abres una nueva etapa en la forma de gestionar tu patrimonio.</p>
          
          <p>Te acompañaré personalmente, combinando mi experiencia de más de 8 años en mercados y activos digitales con un enfoque estratégico y personalizado. Cada recomendación y decisión estará diseñada para maximizar oportunidades y minimizar riesgos, con la discreción y profesionalidad que tu patrimonio merece.</p>
          
          <p>Con Inversor Premium, nuestro trabajo contigo se centrará en:</p>
          <ul style="margin: 16px 0; padding-left: 20px;">
            <li>Comprender tu punto de partida, tu perfil y tus objetivos.</li>
            <li>Acompañarte en la definición de una estrategia de inversión estructurada y alineada con tu situación real.</li>
            <li>Poner a tu disposición nuestra experiencia y marco de análisis para ayudarte a tomar decisiones mejor informadas.</li>
          </ul>
          
          <p>En breves recibirás instrucciones detalladas sobre cómo acceder a cada uno de los servicios incluidos en tu paquete.</p>
          
          <p>Si tienes cualquier duda, puedes contactar con nosotros en info@bsbcapital.io</p>
          
          <p>Gracias de nuevo por confiar en BSB Capital.</p>
          
          <p>Un saludo,</p>
          <p><strong>Juan Salgado</strong><br>CEO de BSB Capital</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>
    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · <a href="mailto:info@bsbcapital.io" style="color:#C5A019; text-decoration:none;">info@bsbcapital.io</a></p>
        <p style="margin:5px 0 0 0;">Este es un correo automático de confirmación.</p>
        <p style="margin:0;">No respondas a este mensaje.</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
    },

    // Templates para MEMBRESÍAS
    membership_annual: {
      subject: 'Tu Membresía Anual BSB Capital ya está activa ✅',
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Membresía Anual BSB Capital</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img src="${LOGO_URLS.default}" alt="BSB Capital" width="110" style="display:block; margin:auto;" />
      </td>
    </tr>
    <tr>
      <td style="padding:20px 30px 40px;">
        <div style="font-size:16px; color:#37493f; line-height:1.6;">
          <p>Gracias por unirte a la Membresía Anual de BSB Capital. Tu acceso está activado.</p>
          
          <p>Con esta decisión, te conviertes en parte del grupo pionero que está construyendo BSB Capital desde el inicio. No es solo una suscripción: te conviertes en una de las piezas clave sobre las que queremos seguir desarrollando nuestro proyecto de formación e inversión en crypto y activos digitales.</p>
          
          <p>A partir de ahora tendrás acceso a:</p>
          <ul style="margin: 16px 0; padding-left: 20px;">
            <li>BSB Academy, nuestro entorno formativo especializado en el nuevo sistema financiero.</li>
            <li>20% de descuento en BSB Consulting, para nuestros servicios de análisis, planificación y acompañamiento financiero.</li>
            <li>Acceso prioritario a BSB maker, nuestra herramienta de IA que cambiará las reglas del juego de la inversión.</li>
            <li>Información prioritaria sobre eventos y encuentros exclusivos.</li>
          </ul>
          
          <p>En breve recibirás más información con los próximos pasos para empezar a aprovechar tu membresía al máximo.</p>
          
          <p>Si tienes cualquier duda, puedes contactar con nosotros en info@bsbcapital.io</p>
          
          <p>Gracias por confiar en BSB Capital.</p>
          
          <p>Un saludo,</p>
          <p><strong>Juan Salgado</strong><br>CEO de BSB Capital</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>
    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · <a href="mailto:info@bsbcapital.io" style="color:#C5A019; text-decoration:none;">info@bsbcapital.io</a></p>
        <p style="margin:5px 0 0 0;">Este es un correo automático de confirmación.</p>
        <p style="margin:0;">No respondas a este mensaje.</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
    },

    // Templates para CONSULTORIAS - LEGACY (mantenidos para compatibilidad)
    consultation_financial: {
      subject: 'Tu consultoría en BSB Capital está confirmada 🗓️',
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
</html>`,
    },
    consultation_crypto_advanced: {
      subject: 'Tu consultoría avanzada de Crypto & Web3 ha sido confirmada 🚀',
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
</html>`,
    },
    consultation_confirmation: {
      subject: 'Confirmación de tu consulta en BSB Capital',
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
</html>`,
    },
    onboarding_crypto: {
      subject: 'Bienvenido al mundo cripto con BSB Capital 🌍',
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
          Tu consultoría de Onboarding cripto está confirmada.<br><br>
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
</html>`,
    },
    // Template para NOTIFICACIONES A ADMINISTRADORES - OPTIMIZACIÓN DE CARTERA
    admin_consultation_financial_planning: {
      subject: '🔔 Nueva consultoría de Optimización de Cartera - BSB Capital',
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Consultoría - Optimización de Cartera</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img src="${LOGO_URLS.default}" alt="BSB Capital" width="110" style="display:block; margin:auto;" />
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:10px 30px;">
        <h2 style="color:#0b1f14; font-weight:600; margin:0;">📊 Optimización de Cartera</h2>
        <p style="font-size:16px; color:#37493f; line-height:1.6; margin-top:18px; margin-bottom:28px;">
          <strong style="color:#C5A019;">INFORMACIÓN DEL CLIENTE:</strong><br>
          • <strong>Nombre:</strong> {clientName}<br>
          • <strong>Email:</strong> {clientEmail}<br>
          • <strong>Teléfono:</strong> {phone}<br><br>
          
          <strong style="color:#C5A019;">DETALLES DE LA CONSULTA:</strong><br>
          • <strong>Tipo:</strong> Optimización de cartera<br>
          • <strong>Fecha preferida:</strong> {preferredDate}<br>
          • <strong>Hora preferida:</strong> {preferredTime}<br>
          • <strong>Duración:</strong> {duration}<br>
          • <strong>Precio pagado:</strong> {price}<br>
          • <strong>ID Pago:</strong> {paymentId}<br>
          • <strong>ID Consulta:</strong> {consultationId}<br><br>
          
          <div style="background:#fff3cd; padding:15px; border-radius:6px; border-left:4px solid #ffc107; margin:15px 0;">
            <strong style="color:#856404;">📋 PERFIL FINANCIERO DEL CLIENTE:</strong><br><br>
            
            <strong>🎯 Objetivo principal:</strong><br>
            <em style="color:#495057;">{consultationGoals}</em><br><br>
            
            <strong>📊 Experiencia en inversiones:</strong><br>
            <em style="color:#495057;">{investmentExperience}</em><br><br>
            
            <strong>💰 Tamaño de cartera:</strong><br>
            <em style="color:#495057;">{portfolioSize}</em><br><br>
            
            <strong>📈 Inversiones actuales:</strong><br>
            <em style="color:#495057;">{currentInvestments}</em><br><br>
            
            <strong>⚖️ Tolerancia al riesgo:</strong><br>
            <em style="color:#495057;">{riskTolerance}</em><br><br>
            
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
            ⏳ <strong>Acción requerida:</strong> Revisar perfil de riesgo y preparar análisis de cartera
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
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · Sistema de notificaciones automáticas</p>
        <p style="margin:5px 0 0 0;">Dashboard: <a href="https://bsbcapital.io/admin" style="color:#C5A019; text-decoration:none;">bsbcapital.io/admin</a></p>
      </td>
    </tr>
  </table>
</body>
</html>`,
    },
    // Template para NOTIFICACIONES A ADMINISTRADORES - ONBOARDING CRIPTO
    admin_consultation_onboarding_crypto: {
      subject: '🔔 Nueva consultoría de Onboarding Cripto - BSB Capital',
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Consultoría - Onboarding Cripto</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img src="${LOGO_URLS.default}" alt="BSB Capital" width="110" style="display:block; margin:auto;" />
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:10px 30px;">
        <h2 style="color:#0b1f14; font-weight:600; margin:0;">🚀 Onboarding Cripto</h2>
        <p style="font-size:16px; color:#37493f; line-height:1.6; margin-top:18px; margin-bottom:28px;">
          <strong style="color:#C5A019;">INFORMACIÓN DEL CLIENTE:</strong><br>
          • <strong>Nombre:</strong> {clientName}<br>
          • <strong>Email:</strong> {clientEmail}<br>
          • <strong>Teléfono:</strong> {phone}<br><br>
          
          <strong style="color:#C5A019;">DETALLES DE LA CONSULTA:</strong><br>
          • <strong>Tipo:</strong> Onboarding cripto<br>
          • <strong>Fecha preferida:</strong> {preferredDate}<br>
          • <strong>Hora preferida:</strong> {preferredTime}<br>
          • <strong>Duración:</strong> {duration}<br>
          • <strong>Precio pagado:</strong> {price}<br>
          • <strong>ID Pago:</strong> {paymentId}<br>
          • <strong>ID Consulta:</strong> {consultationId}<br><br>
          
          <div style="background:#e8f5e8; padding:15px; border-radius:6px; border-left:4px solid #28a745; margin:15px 0;">
            <strong style="color:#155724;">📋 PERFIL CRIPTO DEL CLIENTE:</strong><br><br>
            
            <strong>🎯 Objetivo con cripto:</strong><br>
            <em style="color:#495057;">{consultationGoals}</em><br><br>
            
            <strong>📊 Experiencia en cripto:</strong><br>
            <em style="color:#495057;">{investmentExperience}</em><br><br>
            
            <strong>💰 Capital inicial estimado:</strong><br>
            <em style="color:#495057;">{portfolioSize}</em><br><br>
            
            <strong>💡 Motivación por cripto:</strong><br>
            <em style="color:#495057;">{currentInvestments}</em><br><br>
            
            <strong>❓ Preguntas específicas:</strong><br>
            <em style="color:#495057;">{specificQuestions}</em><br><br>
            
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
            ⏳ <strong>Acción requerida:</strong> Preparar plan de onboarding personalizado
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
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · Sistema de notificaciones automáticas</p>
        <p style="margin:5px 0 0 0;">Dashboard: <a href="https://bsbcapital.io/admin" style="color:#C5A019; text-decoration:none;">bsbcapital.io/admin</a></p>
      </td>
    </tr>
  </table>
</body>
</html>`,
    },
    // Template para NOTIFICACIONES A ADMINISTRADORES - TESORERÍA EMPRESARIAL
    admin_consultation_crypto_advanced: {
      subject: '🔔 Nueva consultoría de Tesorería Cripto Empresarial - BSB Capital',
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Consultoría - Tesorería Cripto Empresarial</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img src="${LOGO_URLS.default}" alt="BSB Capital" width="110" style="display:block; margin:auto;" />
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:10px 30px;">
        <h2 style="color:#0b1f14; font-weight:600; margin:0;">🏢 Tesorería Cripto Empresarial</h2>
        <p style="font-size:16px; color:#37493f; line-height:1.6; margin-top:18px; margin-bottom:28px;">
          <strong style="color:#C5A019;">INFORMACIÓN DEL CLIENTE:</strong><br>
          • <strong>Nombre:</strong> {clientName}<br>
          • <strong>Email:</strong> {clientEmail}<br>
          • <strong>Teléfono:</strong> {phone}<br><br>
          
          <strong style="color:#C5A019;">DETALLES DE LA CONSULTA:</strong><br>
          • <strong>Tipo:</strong> Gestión de tesorería cripto para empresas<br>
          • <strong>Fecha preferida:</strong> {preferredDate}<br>
          • <strong>Hora preferida:</strong> {preferredTime}<br>
          • <strong>Duración:</strong> {duration}<br>
          • <strong>Precio pagado:</strong> {price}<br>
          • <strong>ID Pago:</strong> {paymentId}<br>
          • <strong>ID Consulta:</strong> {consultationId}<br><br>
          
          <div style="background:#fff3cd; padding:15px; border-radius:6px; border-left:4px solid #ffc107; margin:15px 0;">
            <strong style="color:#856404;">📋 PERFIL EMPRESARIAL:</strong><br><br>
            
            <strong>🏢 Información corporativa:</strong><br>
            <em style="color:#495057;">{additionalInfo}</em><br><br>
            
            <strong>🎯 Objetivo tesorería (12 meses):</strong><br>
            <em style="color:#495057;">{consultationGoals}</em><br><br>
            
            <strong>💰 Volumen criptoactivos:</strong><br>
            <em style="color:#495057;">{portfolioSize}</em><br><br>
            
            <strong>🔒 Estado actual cripto:</strong><br>
            <em style="color:#495057;">{investmentExperience}</em><br><br>
            
            <strong>📊 Activos y almacenamiento:</strong><br>
            <em style="color:#495057;">{currentInvestments}</em><br><br>
            
            <strong>📈 Expectativas consultoría:</strong><br>
            <em style="color:#495057;">{specificQuestions}</em><br><br>
            
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
            ⏳ <strong>Acción requerida:</strong> Revisar estructura empresarial y preparar estrategia de tesorería
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
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · Sistema de notificaciones automáticas</p>
        <p style="margin:5px 0 0 0;">Dashboard: <a href="https://bsbcapital.io/admin" style="color:#C5A019; text-decoration:none;">bsbcapital.io/admin</a></p>
      </td>
    </tr>
  </table>
</body>
</html>`,
    },
    // Template para NOTIFICACIONES A ADMINISTRADORES - GENÉRICO (fallback)
    admin_consultation_notification: {
      subject: '🔔 Nueva consultoría reservada - BSB Capital',
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
</html>`,
    },
    // Templates para MEMBRESÍAS
    academia_bsb: {
      subject: 'Tu acceso a la Academia BSB está activo 🎓',
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
</html>`,
    },
    // Template para MEMBRESÍA EXCLUSIVA MENSUAL
    membership_exclusive_monthly: {
      subject: 'Tu Membresía Exclusiva BSB Capital está activa ✅',
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Membresía Exclusiva Mensual Activa</title>
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
      <td style="padding:20px 30px 40px;">
        <div style="font-size:16px; color:#37493f; line-height:1.6;">
          <p>¡Enhorabuena!</p>
          
          <p>Tu Membresía Exclusiva BSB Capital ya está activa. A partir de ahora formas parte de nuestra comunidad de inversores comprometidos con su crecimiento financiero.</p>
          
          <p><strong>Con tu membresía mensual tienes acceso a:</strong></p>
          <ul style="margin: 16px 0; padding-left: 20px;">
            <li>BSB Academy, nuestro entorno formativo especializado en el nuevo sistema financiero.</li>
            <li>20% de descuento en BSB Consulting, para nuestros servicios de análisis, planificación y acompañamiento financiero.</li>
            <li>Acceso prioritario a BSB Maker, nuestra herramienta de IA que cambiará las reglas del juego de la inversión.</li>
            <li>Información prioritaria sobre eventos y encuentros exclusivos.</li>
          </ul>
          
          <p>Tu membresía se renovará automáticamente cada mes. Puedes cancelar en cualquier momento desde tu área de usuario.</p>
          
          <p style="text-align:center; margin:25px 0;">
            <a href="https://bsbcapital.io/academia" 
               style="background:#C5A019; color:white; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:600; display:inline-block;">
              Acceder a la Academia
            </a>
          </p>
          
          <p>Si tienes cualquier duda, puedes contactar con nosotros en info@bsbcapital.io</p>
          
          <p>Gracias por confiar en BSB Capital.</p>
          
          <p>Un saludo,</p>
          <p><strong>Juan Salgado</strong><br>CEO de BSB Capital</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>
    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · <a href="mailto:info@bsbcapital.io" style="color:#C5A019; text-decoration:none;">info@bsbcapital.io</a></p>
        <p style="margin:5px 0 0 0;">Este es un correo automático de confirmación.</p>
        <p style="margin:0;">No respondas a este mensaje.</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
    },
  };
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    const { type, to, subject, html, data, email } = (await req.json()) as EmailRequest;

    // 🔐 Variables de entorno
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const defaultFrom = Deno.env.get('DEFAULT_FROM') || 'BSB Capital <no-reply@bsbcapital.io>';
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'info@bsbcapital.io';

    console.log(`🔧 Config - Admin Email: ${adminEmail}, Default From: ${defaultFrom}`);

    if (!resendApiKey) {
      throw new Error('Missing RESEND_API_KEY in environment');
    }

    // 🛠️ FUNCIONES ESPECIALES DE GESTIÓN DE LISTA DE SUPRESIÓN

    // Obtener lista de emails suprimidos
    if (type === 'get_suppressed_emails') {
      console.log('📋 Obteniendo lista de emails suprimidos...');

      const suppressionResponse = await fetch('https://api.resend.com/suppressions', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const suppressionData = await suppressionResponse.json();

      if (!suppressionResponse.ok) {
        throw new Error(suppressionData.message || 'Error fetching suppression list');
      }

      return new Response(
        JSON.stringify({
          success: true,
          emails: suppressionData.data || [],
          count: suppressionData.data?.length || 0,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Verificar estado de un email específico
    if (type === 'check_email_status') {
      if (!email) {
        throw new Error("Missing 'email' field for status check");
      }

      console.log(`🔍 Verificando estado del email: ${email}`);

      // Obtener lista de supresión
      const suppressionResponse = await fetch('https://api.resend.com/suppressions', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const suppressionData = await suppressionResponse.json();

      if (suppressionResponse.ok && suppressionData.data) {
        const suppressedEmail = suppressionData.data.find((item: any) => item.email === email);

        if (suppressedEmail) {
          return new Response(
            JSON.stringify({
              success: true,
              status: 'suppressed',
              isSuppressed: true,
              reason: suppressedEmail.reason || 'Account suppression list',
              createdAt: suppressedEmail.created_at,
              details: 'Este email está en la lista de supresión de Resend',
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          );
        }
      }

      // Si no está en la lista de supresión, está OK
      return new Response(
        JSON.stringify({
          success: true,
          status: 'active',
          isSuppressed: false,
          reason: 'Email activo',
          details: 'Este email no está en ninguna lista de supresión',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Remover email de la lista de supresión
    if (type === 'remove_from_suppression') {
      if (!email) {
        throw new Error("Missing 'email' field for suppression removal");
      }

      console.log(`🗑️ Removiendo email de lista de supresión: ${email}`);

      const removalResponse = await fetch(
        `https://api.resend.com/suppressions/${encodeURIComponent(email)}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (removalResponse.status === 204 || removalResponse.status === 200) {
        console.log(`✅ Email ${email} removido exitosamente de la lista de supresión`);

        return new Response(
          JSON.stringify({
            success: true,
            message: `Email ${email} removido de la lista de supresión`,
            email,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
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
    if (type === 'admin_consultation_notification') {
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
      adminEmailOriginal: Deno.env.get('ADMIN_EMAIL'),
      adminEmailFinal: adminEmail,
      defaultFromOriginal: Deno.env.get('DEFAULT_FROM'),
      defaultFromFinal: defaultFrom,
      originalTo: to,
      finalRecipient: recipient,
      isAdminNotification: type === 'admin_consultation_notification',
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
        .replace(/\[Nombre\]/g, data?.name || data?.clientName || 'Usuario')
        .replace(/\{clientName\}/g, data?.clientName || data?.name || 'No especificado')
        .replace(/\{clientEmail\}/g, data?.clientEmail || data?.email || 'No especificado')
        .replace(/\{phone\}/g, data?.phone || 'No especificado')
        .replace(/\{consultationType\}/g, data?.consultationType || data?.type || 'No especificado')
        .replace(/\{consultationDate\}/g, data?.consultationDate || 'Pendiente de programar')
        .replace(/\{preferredDate\}/g, data?.preferredDate || data?.date || 'Por programar')
        .replace(/\{preferredTime\}/g, data?.preferredTime || data?.time || 'Por confirmar')
        .replace(/\{duration\}/g, data?.duration || '60 minutos (estándar)')
        .replace(/\{price\}/g, data?.price || data?.amount || 'No especificado')
        .replace(/\{paymentId\}/g, data?.paymentId || data?.stripePaymentId || 'Pendiente')
        .replace(/\{consultationId\}/g, data?.consultationId || data?.id || 'Generando...')
        .replace(/\{investmentExperience\}/g, data?.investmentExperience || 'No especificado')
        .replace(/\{portfolioSize\}/g, data?.portfolioSize || 'No especificado')
        .replace(/\{riskTolerance\}/g, data?.riskTolerance || 'No especificado')
        .replace(
          /\{consultationGoals\}/g,
          data?.consultationGoals || data?.goals || '📝 Por definir durante la consulta'
        )
        .replace(
          /\{currentInvestments\}/g,
          data?.currentInvestments || '📊 Por revisar en la consulta'
        )
        .replace(
          /\{specificQuestions\}/g,
          data?.specificQuestions || data?.questions || '❓ Por definir durante la consulta'
        )
        .replace(
          /\{preferredCommunication\}/g,
          data?.preferredCommunication || '📞 Videollamada (recomendado)'
        )
        .replace(/\{availability\}/g, data?.availability || '⏰ Por coordinar')
        .replace(/\{timestamp\}/g, data?.timestamp || new Date().toISOString())
        .replace(
          /\{additionalInfo\}/g,
          data?.additionalInfo ? `💭 ${data.additionalInfo}` : 'Sin comentarios adicionales'
        )
        .replace(/\{formDataJson\}/g, formatFormDataForAdmin(data?.formDataJson || '{}'))
        .replace(/\{amount\}/g, data?.amount?.toString() || '0')
        .replace(/\{currency\}/g, data?.currency || 'EUR');
      emailSubject = subject || template.subject;
      console.log('✨ Usando template profesional para tipo:', type);
    } else {
      // Fallback básico si no hay template específico
      htmlContent =
        html ||
        `<p>Hola ${data?.name || 'usuario'},</p><p>Tu correo de tipo <b>${type}</b> ha sido procesado.</p>`;
      emailSubject = subject || `Mensaje de BSB Capital (${type})`;
      console.log('📄 Usando fallback básico para tipo:', type);
    }

    // 📦 Construcción del cuerpo de email
    const emailPayload = {
      from: defaultFrom,
      to: recipient,
      subject: emailSubject,
      html: htmlContent,
    };

    console.log('📨 Enviando correo con Resend...');
    console.log('→ Tipo:', type);
    console.log('→ Destinatario:', recipient);

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const result = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('❌ Resend API error:', result);
      throw new Error(result.message || 'Unknown Resend API error');
    }

    console.log('✅ Correo enviado correctamente:', result.id);

    return new Response(
      JSON.stringify({
        success: true,
        id: result.id,
        recipient,
        type,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown internal error';

    console.error('❌ Error al enviar correo:', message);

    return new Response(JSON.stringify({ success: false, error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
