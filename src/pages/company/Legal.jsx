import React from 'react';
import { Helmet } from 'react-helmet';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const legalContent = {
  'aviso-legal': {
    title: 'Aviso Legal',
    content: (
      <>
        <h2 className="text-2xl font-bold mt-6 mb-4">1. Titularidad del sitio web</h2>
        <p>
          En cumplimiento con la normativa vigente, se informa que la titularidad del sitio web
          www.bsbcapital.io corresponde a:
        </p>
        <ul className="list-disc list-inside my-4 space-y-2">
          <li>
            <strong>Entidad:</strong> BSB CAPITAL FZ-LLC
          </li>
          <li>
            <strong>Número de registro:</strong> 2430464.01
          </li>
          <li>
            <strong>Domicilio social:</strong> Sharjah Media City (SHAMS), Emiratos Árabes Unidos
          </li>
          <li>
            <strong>Correo electrónico de contacto:</strong> info@bsbcapital.io
          </li>
          <li>
            <strong>Teléfono de contacto:</strong> +971 58 513 2673
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-6 mb-4">2. Objeto del sitio web</h2>
        <p>
          El presente portal tiene como finalidad facilitar a los usuarios información corporativa
          sobre los servicios prestados por BSB Capital, incluyendo asesoría financiera, servicios
          de inversión, consultoría en materia fiscal y gestión de criptoactivos.
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-4">3. Uso del sitio web</h2>
        <p>
          El acceso y uso de este sitio atribuye la condición de usuario, quien acepta las presentes
          condiciones. El usuario se compromete a utilizar la web conforme a la ley, la buena fe y
          el orden público, absteniéndose de realizar usos ilícitos, fraudulentos o que puedan dañar
          la imagen y los intereses de BSB Capital.
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-4">4. Propiedad intelectual e industrial</h2>
        <p>
          Todos los contenidos del sitio web (textos, imágenes, logotipos, marcas, software, código
          fuente, diseño gráfico, etc.) son propiedad exclusiva de BSB Capital o de terceros con
          autorización expresa. Queda prohibida la reproducción, distribución, transformación o
          comunicación pública sin el consentimiento previo por escrito.
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-4">5. Limitación de responsabilidad</h2>
        <p>BSB Capital no se hace responsable de:</p>
        <ul className="list-disc list-inside my-4 space-y-2">
          <li>Los daños o perjuicios derivados del mal uso del sitio web.</li>
          <li>
            La veracidad, exactitud o actualización de la información publicada en páginas externas
            enlazadas desde este portal.
          </li>
          <li>La imposibilidad temporal de acceso al sitio web por causas ajenas a la empresa.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-6 mb-4">6. Legislación y jurisdicción aplicable</h2>
        <p>
          Este aviso legal se rige por la legislación de los Emiratos Árabes Unidos. Ante cualquier
          controversia, las partes se someten a la jurisdicción de los tribunales competentes en la
          Free Zone de SHAMS, sin perjuicio de que el usuario pueda beneficiarse de la normativa de
          protección de consumidores de su país de residencia si opera en la Unión Europea.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">📌 Disclaimer Financiero</h2>
        <p>
          La información contenida en este sitio web y en los materiales proporcionados por BSB
          CAPITAL FZ-LLC tiene carácter meramente informativo y educativo. En ningún caso constituye
          una garantía de resultados ni una obligación de obtener rendimientos determinados.
        </p>
        <p>
          Los servicios de BSB Capital se centran en el análisis, acompañamiento y asesoramiento
          especializado, pero las decisiones finales de inversión o gestión patrimonial corresponden
          exclusivamente al cliente, quien reconoce y acepta que toda inversión conlleva riesgos
          significativos, incluyendo la pérdida total o parcial del capital invertido. Los
          resultados pasados no son indicativos de rendimientos futuros.
        </p>
        <h3 className="text-xl font-bold mt-6 mb-4">Limitación de responsabilidad:</h3>
        <p>
          BSB Capital no será responsable de pérdidas, daños o reclamaciones derivados de la
          utilización de la información, de la contratación de los servicios o de la ejecución de
          decisiones de inversión adoptadas por el cliente, salvo en los casos en que se acredite
          negligencia grave, dolo o incumplimiento contractual por parte de la empresa.
        </p>
        <h3 className="text-xl font-bold mt-6 mb-4">Renuncia a acciones legales:</h3>
        <p>
          Al contratar los servicios de BSB Capital, el cliente reconoce expresamente los riesgos
          inherentes a las inversiones financieras y renuncia a ejercitar acciones legales contra la
          empresa por pérdidas o resultados adversos, salvo que se derive de una actuación dolosa,
          de negligencia grave o del incumplimiento de obligaciones contractuales esenciales
          atribuibles directamente a BSB Capital.
        </p>
      </>
    ),
  },
  privacidad: {
    title: 'Política de Privacidad',
    content: (
      <>
        <h2 className="text-2xl font-bold mt-6 mb-4">1. Responsable del tratamiento</h2>
        <ul className="list-disc list-inside my-4 space-y-2">
          <li>
            <strong>Responsable:</strong> BSB CAPITAL FZ-LLC
          </li>
          <li>
            <strong>Contacto:</strong> info@bsbcapital.io
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-6 mb-4">2. Datos que se recogen</h2>
        <p>A través de formularios, suscripciones y medios de contacto se pueden recopilar:</p>
        <ul className="list-disc list-inside my-4 space-y-2">
          <li>Datos identificativos: nombre, apellidos, email, teléfono.</li>
          <li>Datos financieros o de inversión (solo si son voluntariamente proporcionados).</li>
          <li>
            Datos de navegación: dirección IP, geolocalización, cookies y tecnologías similares.
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-6 mb-4">3. Finalidad del tratamiento</h2>
        <ul className="list-disc list-inside my-4 space-y-2">
          <li>Responder a consultas y solicitudes de información.</li>
          <li>Formalizar, gestionar y ejecutar la prestación de los servicios contratados.</li>
          <li>
            Enviar comunicaciones comerciales relacionadas con nuestros servicios (previo
            consentimiento).
          </li>
          <li>
            Cumplimiento de obligaciones legales y regulatorias (fiscales, anti-blanqueo, etc.).
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-6 mb-4">4. Legitimación</h2>
        <p>El tratamiento de los datos se basa en:</p>
        <ul className="list-disc list-inside my-4 space-y-2">
          <li>El consentimiento expreso del usuario.</li>
          <li>La ejecución de un contrato o precontrato.</li>
          <li>El cumplimiento de obligaciones legales aplicables.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-6 mb-4">
          5. Cesiones y transferencias internacionales
        </h2>
        <p>
          Los datos no se cederán a terceros salvo obligación legal. En caso de colaboración con
          partners (ej. CLCRIPTO para fiscalidad), se formalizarán contratos de encargo de
          tratamiento garantizando la confidencialidad. Podrán producirse transferencias
          internacionales de datos, dado que la entidad está domiciliada en Emiratos Árabes Unidos,
          siempre con las garantías adecuadas de seguridad.
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-4">6. Derechos del usuario</h2>
        <p>
          Los usuarios pueden ejercitar en cualquier momento sus derechos de acceso, rectificación,
          supresión, oposición, limitación y portabilidad, enviando un correo a info@bsbcapital.io.
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-4">7. Conservación de los datos</h2>
        <p>
          Los datos se conservarán mientras exista relación contractual o consentimiento válido, y
          posteriormente durante los plazos legales de prescripción aplicables en materia fiscal,
          contable o de prevención de blanqueo de capitales.
        </p>
      </>
    ),
  },
  cookies: {
    title: 'Política de Cookies',
    content: (
      <>
        <p>
          BSB CAPITAL FZ-LLC informa acerca del uso de cookies en su página web: www.bsbcapital.io.
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-4">¿Qué son las cookies?</h2>
        <p>
          Las cookies son archivos que se descargan en su equipo al acceder a determinadas páginas
          web. Permiten almacenar y recuperar información sobre los hábitos de navegación de un
          usuario o de su equipo y, en función de la información contenida y de la forma en que se
          utilice su equipo, pueden servir para reconocer al usuario y mejorar el servicio ofrecido.
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-4">Tipos de cookies utilizadas</h2>
        <ul className="list-disc list-inside my-4 space-y-2">
          <li>
            <strong>Cookies propias:</strong> enviadas desde nuestro dominio y necesarias para el
            correcto funcionamiento del sitio.
          </li>
          <li>
            <strong>Cookies de terceros:</strong> enviadas por servicios externos (ej. Google
            Analytics, redes sociales) que procesan datos en nuestro nombre.
          </li>
          <li>
            <strong>Cookies de sesión:</strong> temporales, expiran al cerrar el navegador.
          </li>
          <li>
            <strong>Cookies persistentes:</strong> se almacenan en el dispositivo durante un tiempo
            definido.
          </li>
          <li>
            <strong>Cookies técnicas:</strong> permiten la navegación y el uso de funcionalidades
            básicas.
          </li>
          <li>
            <strong>Cookies de personalización:</strong> recuerdan preferencias como idioma o
            región.
          </li>
          <li>
            <strong>Cookies de análisis:</strong> permiten medir y analizar el uso del sitio web.
          </li>
          <li>
            <strong>Cookies publicitarias y de comportamiento:</strong> permiten mostrar publicidad
            personalizada.
          </li>
          <li>
            <strong>Cookies de redes sociales externas:</strong> facilitan la interacción con
            plataformas como Facebook, Twitter, LinkedIn, etc.
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-6 mb-4">Desactivación o eliminación de cookies</h2>
        <p>
          Puede configurar su navegador para permitir, bloquear o eliminar las cookies. A
          continuación, se facilitan enlaces a las instrucciones de los principales navegadores:
        </p>
        <ul className="list-disc list-inside my-4 space-y-2">
          <li>
            <a
              href="https://support.google.com/chrome/answer/95647?hl=es"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Chrome
            </a>
          </li>
          <li>
            <a
              href="https://support.microsoft.com/es-es/windows/eliminar-y-administrar-cookies-168dab11-0753-043d-7c16-ede5947fc64d"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Internet Explorer
            </a>
          </li>
          <li>
            <a
              href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Firefox
            </a>
          </li>
          <li>
            <a
              href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Safari
            </a>
          </li>
          <li>
            <a
              href="https://help.opera.com/en/latest/web-preferences/#cookies"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Opera
            </a>
          </li>
        </ul>
        <p className="mt-4">
          El usuario debe tener en cuenta que, al deshabilitar cookies, algunos servicios pueden
          dejar de estar disponibles o funcionar incorrectamente.
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-4">Cookies utilizadas en este sitio web</h2>
        <ul className="list-disc list-inside my-4 space-y-2">
          <li>
            <strong>Cookies estrictamente necesarias:</strong> aseguran el funcionamiento básico del
            sitio.
          </li>
          <li>
            <strong>Cookies de análisis y rendimiento:</strong> nos ayudan a mejorar la experiencia
            de navegación y optimizar nuestros servicios.
          </li>
          <li>
            <strong>Cookies de publicidad:</strong> permiten personalizar la experiencia y mostrar
            anuncios relevantes.
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-6 mb-4">Aceptación de la política de cookies</h2>
        <p>
          Al navegar por este sitio web, el usuario acepta expresamente el tratamiento de la
          información recabada en la forma y con los fines mencionados.
        </p>
      </>
    ),
  },
  'terminos-de-uso': {
    title: 'Términos de Uso',
    content: (
      <>
        <h2 className="text-2xl font-bold mt-6 mb-4">1. Objeto</h2>
        <p>Los presentes Términos regulan el acceso y uso del sitio web de BSB Capital.</p>

        <h2 className="text-2xl font-bold mt-6 mb-4">2. Obligaciones del usuario</h2>
        <ul className="list-disc list-inside my-4 space-y-2">
          <li>No utilizar el sitio con fines ilícitos o contrarios a las buenas prácticas.</li>
          <li>
            No introducir virus ni realizar actividades que alteren el normal funcionamiento del
            portal.
          </li>
          <li>Aportar información veraz y actualizada en los formularios de contacto.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-6 mb-4">3. Responsabilidades</h2>
        <ul className="list-disc list-inside my-4 space-y-2">
          <li>
            El usuario es responsable del uso correcto del sitio y de los daños derivados de un uso
            indebido.
          </li>
          <li>
            BSB Capital se reserva el derecho de suspender temporalmente el acceso para labores de
            mantenimiento o seguridad.
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-6 mb-4">4. Servicios de terceros</h2>
        <p>
          El sitio puede contener enlaces a webs de terceros. BSB Capital no responde del contenido
          ni de las políticas de privacidad de dichas páginas.
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-4">5. Modificación de condiciones</h2>
        <p>
          BSB Capital podrá modificar en cualquier momento las presentes condiciones, siendo
          publicadas en la web con la fecha de actualización.
        </p>
      </>
    ),
  },
  'condiciones-generales': {
    title: 'Condiciones Generales de Contratación',
    content: (
      <>
        <h2 className="text-2xl font-bold mt-6 mb-4">1. Objeto</h2>
        <p>
          Las presentes condiciones regulan la contratación de servicios de asesoría financiera,
          inversión y fiscalidad prestados por BSB CAPITAL FZ-LLC.
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-4">2. Proceso de contratación</h2>
        <ul className="list-disc list-inside my-4 space-y-2">
          <li>El usuario contacta a través de la web o email.</li>
          <li>Se remite una propuesta de servicios y presupuesto detallado.</li>
          <li>La contratación se formaliza mediante aceptación escrita o pago del servicio.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-6 mb-4">3. Precio y forma de pago</h2>
        <p>
          Los precios serán comunicados de forma previa y podrán abonarse mediante transferencia
          bancaria, Stripe u otros medios autorizados.
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-4">4. Derecho de desistimiento</h2>
        <p>
          El cliente consumidor tendrá derecho a desistir en un plazo de 14 días naturales, salvo
          que se trate de servicios personalizados o ya ejecutados, en cuyo caso no procederá el
          desistimiento.
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-4">5. Obligaciones de las partes</h2>
        <ul className="list-disc list-inside my-4 space-y-2">
          <li>BSB Capital se compromete a prestar los servicios en los términos acordados.</li>
          <li>
            El cliente deberá facilitar información veraz, colaborar activamente y abonar los
            importes en los plazos acordados.
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-6 mb-4">6. Responsabilidad</h2>
        <p>
          BSB Capital no garantiza resultados financieros concretos, ya que los mismos dependen de
          factores externos al servicio (mercados, regulaciones, riesgos de inversión).
        </p>
        <div className="mt-4 p-4 border-l-4 border-primary bg-muted/50 rounded-r-lg">
          <h3 className="text-xl font-bold mb-2">📌 Disclaimer Financiero</h3>
          <p>
            La información contenida en este sitio web y en los materiales proporcionados por BSB
            CAPITAL FZ-LLC tiene carácter meramente informativo y educativo. En ningún caso
            constituye una garantía de resultados ni una obligación de obtener rendimientos
            determinados.
          </p>
          <p className="mt-2">
            Los servicios de BSB Capital se centran en el análisis, acompañamiento y asesoramiento
            especializado, pero las decisiones finales de inversión o gestión patrimonial
            corresponden exclusivamente al cliente, quien reconoce y acepta que toda inversión
            conlleva riesgos significativos, incluyendo la pérdida total o parcial del capital
            invertido. Los resultados pasados no son indicativos de rendimientos futuros.
          </p>
          <h4 className="font-bold mt-4">Limitación de responsabilidad:</h4>
          <p>
            BSB Capital no será responsable de pérdidas, daños o reclamaciones derivados de la
            utilización de la información, de la contratación de los servicios o de la ejecución de
            decisiones de inversión adoptadas por el cliente, salvo en los casos en que se acredite
            negligencia grave, dolo o incumplimiento contractual por parte de la empresa.
          </p>
          <h4 className="font-bold mt-4">Renuncia a acciones legales:</h4>
          <p>
            Al contratar los servicios de BSB Capital, el cliente reconoce expresamente los riesgos
            inherentes a las inversiones financieras y renuncia a ejercitar acciones legales contra
            la empresa por pérdidas o resultados adversos, salvo que se derive de una actuación
            dolosa, de negligencia grave o del incumplimiento de obligaciones contractuales
            esenciales atribuibles directamente a BSB Capital.
          </p>
        </div>

        <h2 className="text-2xl font-bold mt-6 mb-4">7. Legislación y jurisdicción</h2>
        <p>
          El contrato se rige por la legislación de Emiratos Árabes Unidos. En caso de conflicto,
          las partes se someten a los tribunales de SHAMS Free Zone, sin perjuicio de normas
          imperativas de consumidores en otras jurisdicciones.
        </p>
      </>
    ),
  },
};

const Legal = () => {
  const { page } = useParams();
  const { title, content } = legalContent[page] || {
    title: 'Página no encontrada',
    content: <p>El contenido legal que buscas no está disponible.</p>,
  };

  return (
    <>
      <Helmet>
        <title>{title} - BSB Capital</title>
        <meta name="description" content={`Página legal: ${title} de BSB Capital.`} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Inicio',
                item: 'https://bsbcapital.io/',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: title,
                item: `https://bsbcapital.io/legal/${page}`,
              },
            ],
          })}
        </script>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 pt-10 pb-16"
      >
        <div className="max-w-4xl mx-auto mb-8">
          <Breadcrumbs items={[{ label: title }]} />
        </div>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-brand-text-primary">{title}</h1>
          <div className="prose lg:prose-xl mt-8 text-brand-text-secondary max-w-none prose-headings:text-text-primary prose-strong:text-text-primary">
            {content}
          </div>
          <Button asChild className="mt-8">
            <Link to="/">Volver al Inicio</Link>
          </Button>
        </div>
      </motion.div>
    </>
  );
};

export default Legal;
