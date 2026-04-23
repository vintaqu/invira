import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cumplimiento RGPD — Invira',
  description: 'Información sobre cómo Invira cumple con el Reglamento General de Protección de Datos.',
}

export default function RgpdPage() {
  return (
    <article>
      <h1>Cumplimiento RGPD</h1>
      <p className="meta">Última actualización: 20 de abril de 2025</p>

      <p>
        Este documento resume cómo Invira cumple con el <strong>Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo</strong>
        (Reglamento General de Protección de Datos, RGPD) y su transposición en España a través de la
        <strong>Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD)</strong>.
      </p>

      <section>
        <h2>1. Principios que guían nuestro tratamiento de datos</h2>
        <p>Tratamos los datos personales respetando los siguientes principios del RGPD:</p>
        <ul>
          <li>
            <strong>Licitud, lealtad y transparencia:</strong> siempre informamos sobre qué datos recogemos y con qué finalidad,
            tal como se detalla en nuestra <a href="/legal/privacidad">Política de Privacidad</a>.
          </li>
          <li>
            <strong>Limitación de la finalidad:</strong> los datos se recogen para finalidades determinadas y no se utilizan
            de forma incompatible con ellas.
          </li>
          <li>
            <strong>Minimización de datos:</strong> solo recogemos los datos estrictamente necesarios para prestar el Servicio.
          </li>
          <li>
            <strong>Exactitud:</strong> facilitamos mecanismos para que los usuarios puedan corregir o actualizar sus datos.
          </li>
          <li>
            <strong>Limitación del plazo de conservación:</strong> los datos se conservan solo durante el tiempo necesario,
            según los plazos detallados en nuestra Política de Privacidad.
          </li>
          <li>
            <strong>Integridad y confidencialidad:</strong> aplicamos medidas técnicas y organizativas adecuadas para proteger
            los datos frente a accesos no autorizados, pérdida o destrucción.
          </li>
          <li>
            <strong>Responsabilidad proactiva:</strong> documentamos nuestras actividades de tratamiento y adoptamos medidas
            para demostrar el cumplimiento.
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Roles en el tratamiento de datos</h2>
        <h3>Invira como responsable del tratamiento</h3>
        <p>
          Invira actúa como <strong>responsable del tratamiento</strong> de los datos de sus usuarios registrados
          (Organizadores): nombre, correo electrónico, datos de facturación y datos de uso de la Plataforma.
        </p>

        <h3>Invira como encargado del tratamiento</h3>
        <p>
          Cuando el Organizador introduce datos de sus invitados (nombre, email, teléfono, preferencias alimentarias),
          Invira actúa como <strong>encargado del tratamiento</strong> por cuenta del Organizador, quien es el responsable
          de haber obtenido la base jurídica apropiada para facilitar esos datos a Invira.
        </p>
        <p>
          A tal efecto, nuestros <a href="/legal/terminos">Términos y Condiciones</a> incluyen las cláusulas de encargo
          del tratamiento exigidas por el artículo 28 del RGPD.
        </p>
      </section>

      <section>
        <h2>3. Base jurídica del tratamiento</h2>
        <p>
          Cada tratamiento que realizamos tiene una base jurídica clara, detallada en nuestra Política de Privacidad:
        </p>
        <ul>
          <li><strong>Ejecución de contrato</strong> (art. 6.1.b): para prestar el Servicio contratado.</li>
          <li><strong>Interés legítimo</strong> (art. 6.1.f): para mejorar el Servicio y prevenir el fraude.</li>
          <li><strong>Consentimiento</strong> (art. 6.1.a): para comunicaciones comerciales y cookies analíticas.</li>
          <li><strong>Obligación legal</strong> (art. 6.1.c): para conservar registros de facturación.</li>
        </ul>
      </section>

      <section>
        <h2>4. Derechos de los interesados</h2>
        <p>
          Facilitamos el ejercicio de todos los derechos reconocidos por el RGPD (acceso, rectificación, supresión, limitación,
          portabilidad y oposición), como se describe en nuestra <a href="/legal/privacidad">Política de Privacidad</a>.
        </p>
        <p>
          Respondemos a todas las solicitudes en el plazo máximo de <strong>30 días</strong> y contamos con procedimientos
          internos documentados para su gestión.
        </p>
      </section>

      <section>
        <h2>5. Encargados del tratamiento y subencargados</h2>
        <p>
          Todos nuestros proveedores de servicios que acceden a datos personales están vinculados con nosotros mediante
          <strong>acuerdos de encargo del tratamiento (DPA)</strong> conformes al artículo 28 del RGPD. Estos son los
          principales encargados:
        </p>
        <table>
          <thead>
            <tr><th>Proveedor</th><th>Rol</th><th>País/Región</th><th>Garantías</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Vercel</td>
              <td>Infraestructura / hosting</td>
              <td>EE. UU. / UE</td>
              <td>DPA + SCCs</td>
            </tr>
            <tr>
              <td>Neon / Supabase (PostgreSQL)</td>
              <td>Base de datos</td>
              <td>UE</td>
              <td>DPA</td>
            </tr>
            <tr>
              <td>Upstash</td>
              <td>Caché Redis</td>
              <td>UE</td>
              <td>DPA</td>
            </tr>
            <tr>
              <td>Cloudinary</td>
              <td>Almacenamiento de medios</td>
              <td>EE. UU.</td>
              <td>DPA + SCCs</td>
            </tr>
            <tr>
              <td>Resend</td>
              <td>Envío de emails</td>
              <td>EE. UU.</td>
              <td>DPA + SCCs</td>
            </tr>
            <tr>
              <td>Stripe</td>
              <td>Procesamiento de pagos</td>
              <td>EE. UU. / UE</td>
              <td>DPA + SCCs</td>
            </tr>
            <tr>
              <td>PayPal</td>
              <td>Procesamiento de pagos</td>
              <td>Luxemburgo</td>
              <td>DPA</td>
            </tr>
          </tbody>
        </table>
        <p>
          <em>SCCs = Cláusulas Contractuales Tipo de la Comisión Europea para transferencias internacionales.</em>
        </p>
      </section>

      <section>
        <h2>6. Transferencias internacionales</h2>
        <p>
          Cuando se transfieren datos a países fuera del Espacio Económico Europeo (principalmente EE. UU.),
          nos aseguramos de que existan garantías adecuadas conforme al artículo 46 del RGPD, principalmente
          mediante Cláusulas Contractuales Tipo adoptadas por la Comisión Europea.
        </p>
      </section>

      <section>
        <h2>7. Privacidad desde el diseño y por defecto</h2>
        <p>
          Invira incorpora principios de <em>privacy by design</em> y <em>privacy by default</em> en el desarrollo
          de sus funcionalidades:
        </p>
        <ul>
          <li>Las invitaciones son privadas por defecto hasta que el Organizador las publica activamente.</li>
          <li>Los datos de invitados solo son accesibles por el Organizador del evento, no por otros usuarios.</li>
          <li>Las contraseñas se almacenan cifradas con bcrypt (factor de coste ≥ 12).</li>
          <li>Todas las comunicaciones se realizan sobre HTTPS/TLS.</li>
          <li>Se aplica el principio de mínimo privilegio en el acceso a la base de datos.</li>
          <li>Los tokens de acceso de invitados son únicos, aleatorios y de un solo uso.</li>
        </ul>
      </section>

      <section>
        <h2>8. Registro de actividades de tratamiento</h2>
        <p>
          De conformidad con el artículo 30 del RGPD, mantenemos un registro interno de las actividades de tratamiento
          que documentamos y actualizamos periódicamente. Este registro no es público, pero está disponible para las
          autoridades supervisoras cuando así lo requieran.
        </p>
      </section>

      <section>
        <h2>9. Notificación de brechas de seguridad</h2>
        <p>
          En caso de brecha de seguridad que suponga un riesgo para los derechos y libertades de las personas:
        </p>
        <ul>
          <li>Notificaremos a la <strong>AEPD en un máximo de 72 horas</strong> desde que tengamos conocimiento.</li>
          <li>Informaremos a los afectados sin dilación indebida si la brecha entraña un alto riesgo para sus derechos.</li>
          <li>Documentaremos todas las brechas en nuestro registro interno, independientemente de si requieren notificación.</li>
        </ul>
      </section>

      <section>
        <h2>10. Delegado de Protección de Datos (DPD)</h2>
        <p>
          Actualmente, el tamaño y naturaleza de las actividades de tratamiento de Invira no requieren la designación
          obligatoria de un DPD conforme al artículo 37 del RGPD. No obstante, cualquier cuestión relativa a la
          protección de datos puede dirigirse a:
        </p>
        <p>
          <strong>Contacto de privacidad de Invira</strong><br />
          <a href="mailto:privacidad@invira.app">privacidad@invira.app</a>
        </p>
      </section>

      <section>
        <h2>11. Autoridad de control</h2>
        <p>
          La autoridad de control competente en España es la
          <strong>Agencia Española de Protección de Datos (AEPD)</strong>:
        </p>
        <ul>
          <li>Web: <a href="https://www.aepd.es" target="_blank" rel="noopener">www.aepd.es</a></li>
          <li>Teléfono: 901 100 099</li>
          <li>Dirección: C/ Jorge Juan, 6 · 28001 Madrid</li>
        </ul>
        <p>
          Tienes derecho a presentar una reclamación ante la AEPD si consideras que el tratamiento de tus datos
          no es conforme con el RGPD.
        </p>
      </section>
    </article>
  )
}
