import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad — Invira',
  description: 'Cómo recogemos, usamos y protegemos tus datos personales en Invira.',
}

export default function PrivacidadPage() {
  return (
    <article>
      <h1>Política de Privacidad</h1>
      <p className="meta">Última actualización: 20 de abril de 2025</p>

      <section>
        <h2>1. Responsable del tratamiento</h2>
        <p>
          El responsable del tratamiento de tus datos personales es <strong>Invira</strong> (en adelante, «nosotros» o «Invira»),
          con dirección de contacto en <a href="mailto:privacidad@invira.app">privacidad@invira.app</a>.
        </p>
        <p>
          Invira es una plataforma de creación y gestión de invitaciones digitales para eventos. Nos tomamos muy en serio
          la privacidad de nuestros usuarios y de los invitados que interactúan con las invitaciones creadas en nuestra plataforma.
        </p>
      </section>

      <section>
        <h2>2. Datos que recogemos</h2>
        <h3>2.1 Datos que nos proporcionas directamente</h3>
        <ul>
          <li><strong>Cuenta de usuario:</strong> nombre completo, dirección de correo electrónico y contraseña cifrada.</li>
          <li><strong>Perfil del evento:</strong> nombre del evento, fecha, lugar, descripción, imágenes y demás contenido que añadas al editor.</li>
          <li><strong>Lista de invitados:</strong> nombres, correos electrónicos y números de teléfono de las personas que tú mismo introduces.</li>
          <li><strong>Pagos:</strong> procesamos los pagos a través de Stripe y PayPal. Invira no almacena datos de tarjetas bancarias; estos son gestionados directamente por el proveedor de pagos.</li>
        </ul>

        <h3>2.2 Datos que recogemos automáticamente</h3>
        <ul>
          <li><strong>Datos de uso:</strong> páginas visitadas, clics, tiempo en página y navegación dentro de la plataforma.</li>
          <li><strong>Datos técnicos:</strong> dirección IP, tipo de dispositivo, navegador y sistema operativo.</li>
          <li><strong>Analytics de invitaciones:</strong> aperturas de enlace, canal de acceso (WhatsApp, email, directo) y confirmaciones de asistencia.</li>
          <li><strong>Cookies y tecnologías similares:</strong> según se detalla en nuestra <a href="/legal/cookies">Política de Cookies</a>.</li>
        </ul>

        <h3>2.3 Datos de invitados</h3>
        <p>
          Cuando un invitado accede a una invitación y confirma su asistencia (RSVP), recogemos su respuesta, número de acompañantes
          y restricciones alimentarias si las facilita voluntariamente. Estos datos son accesibles exclusivamente por el organizador del evento.
        </p>
      </section>

      <section>
        <h2>3. Base jurídica y finalidades del tratamiento</h2>
        <table>
          <thead>
            <tr><th>Finalidad</th><th>Base jurídica</th></tr>
          </thead>
          <tbody>
            <tr><td>Prestación del servicio y gestión de la cuenta</td><td>Ejecución de contrato (art. 6.1.b RGPD)</td></tr>
            <tr><td>Procesamiento de pagos</td><td>Ejecución de contrato (art. 6.1.b RGPD)</td></tr>
            <tr><td>Comunicaciones transaccionales (confirmaciones, recordatorios)</td><td>Ejecución de contrato (art. 6.1.b RGPD)</td></tr>
            <tr><td>Mejora del servicio y análisis de uso</td><td>Interés legítimo (art. 6.1.f RGPD)</td></tr>
            <tr><td>Comunicaciones comerciales y novedades</td><td>Consentimiento (art. 6.1.a RGPD)</td></tr>
            <tr><td>Cumplimiento de obligaciones legales</td><td>Obligación legal (art. 6.1.c RGPD)</td></tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>4. Con quién compartimos tus datos</h2>
        <p>Invira no vende tus datos personales a terceros. Podemos compartirlos con los siguientes encargados del tratamiento:</p>
        <ul>
          <li><strong>Stripe y PayPal</strong> — procesamiento de pagos.</li>
          <li><strong>Resend</strong> — envío de correos electrónicos transaccionales.</li>
          <li><strong>Cloudinary</strong> — almacenamiento y entrega de imágenes y archivos multimedia.</li>
          <li><strong>Vercel / infraestructura cloud</strong> — alojamiento de la aplicación.</li>
          <li><strong>Upstash (Redis)</strong> — caché y cola de trabajos en segundo plano.</li>
        </ul>
        <p>
          Todos nuestros proveedores están sujetos a acuerdos de encargo del tratamiento conforme al RGPD y ofrecen garantías adecuadas
          para el tratamiento de datos personales.
        </p>
        <p>
          Podemos divulgar datos cuando así lo exija la ley, una resolución judicial o una autoridad competente.
        </p>
      </section>

      <section>
        <h2>5. Transferencias internacionales</h2>
        <p>
          Algunos de nuestros proveedores (Stripe, Cloudinary, Vercel) pueden procesar datos fuera del Espacio Económico Europeo.
          En todos los casos nos aseguramos de que existan garantías adecuadas: cláusulas contractuales tipo aprobadas por la Comisión Europea
          u otros mecanismos equivalentes.
        </p>
      </section>

      <section>
        <h2>6. Plazos de conservación</h2>
        <ul>
          <li><strong>Datos de cuenta:</strong> mientras la cuenta esté activa. Tras la eliminación, se conservan 30 días por si deseas reactivarla, y posteriormente se borran de forma definitiva.</li>
          <li><strong>Datos de eventos e invitados:</strong> se conservan mientras el organizador no los elimine y, en todo caso, 12 meses desde la fecha del evento.</li>
          <li><strong>Datos de facturación:</strong> 7 años conforme a la legislación fiscal española.</li>
          <li><strong>Logs de seguridad:</strong> 90 días.</li>
        </ul>
      </section>

      <section>
        <h2>7. Tus derechos</h2>
        <p>En virtud del RGPD y la LOPDGDD tienes los siguientes derechos:</p>
        <ul>
          <li><strong>Acceso:</strong> obtener confirmación de si tratamos tus datos y una copia de ellos.</li>
          <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
          <li><strong>Supresión («derecho al olvido»):</strong> solicitar el borrado cuando ya no sean necesarios o retires el consentimiento.</li>
          <li><strong>Limitación del tratamiento:</strong> solicitar la suspensión del tratamiento en determinadas circunstancias.</li>
          <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado y de uso común.</li>
          <li><strong>Oposición:</strong> oponerte al tratamiento basado en interés legítimo.</li>
          <li><strong>Retirada del consentimiento:</strong> en cualquier momento, sin que afecte a la licitud del tratamiento previo.</li>
        </ul>
        <p>
          Para ejercer cualquiera de estos derechos, escríbenos a <a href="mailto:privacidad@invira.app">privacidad@invira.app</a> indicando
          tu nombre, dirección de correo y el derecho que deseas ejercer. Responderemos en el plazo máximo de 30 días.
        </p>
        <p>
          Si consideras que el tratamiento de tus datos vulnera la normativa, puedes presentar una reclamación ante la
          <a href="https://www.aepd.es" target="_blank" rel="noopener">Agencia Española de Protección de Datos (AEPD)</a>.
        </p>
      </section>

      <section>
        <h2>8. Seguridad</h2>
        <p>
          Aplicamos medidas técnicas y organizativas apropiadas para proteger tus datos: cifrado en tránsito (TLS/HTTPS),
          cifrado de contraseñas con bcrypt, control de acceso por roles, auditoría de accesos y copias de seguridad periódicas.
          Aun así, ningún sistema es infalible; en caso de brecha de seguridad que pueda afectarte, te notificaremos conforme a la normativa.
        </p>
      </section>

      <section>
        <h2>9. Menores de edad</h2>
        <p>
          Invira no está dirigido a menores de 14 años. Si tenemos conocimiento de que hemos recogido datos de un menor sin el
          consentimiento de sus tutores, procederemos a eliminarlos inmediatamente.
          Si eres padre, madre o tutor y crees que tu hijo ha facilitado datos personales, contáctanos en <a href="mailto:privacidad@invira.app">privacidad@invira.app</a>.
        </p>
      </section>

      <section>
        <h2>10. Cambios en esta política</h2>
        <p>
          Podemos actualizar esta política periódicamente. Cuando realicemos cambios materiales te lo notificaremos por correo electrónico
          o mediante un aviso destacado en la plataforma. La versión vigente estará siempre disponible en esta página con la fecha de la última actualización.
        </p>
      </section>

      <section>
        <h2>11. Contacto</h2>
        <p>
          Para cualquier consulta sobre esta política o sobre el tratamiento de tus datos:<br />
          <strong>Invira</strong> · <a href="mailto:privacidad@invira.app">privacidad@invira.app</a>
        </p>
      </section>
    </article>
  )
}
