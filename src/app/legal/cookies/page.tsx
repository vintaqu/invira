import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Cookies — Evochi',
  description: 'Información sobre las cookies y tecnologías similares que utiliza Evochi.',
}

export default function CookiesPage() {
  return (
    <article>
      <h1>Política de Cookies</h1>
      <p className="meta">Última actualización: 20 de abril de 2025</p>

      <section>
        <h2>1. ¿Qué son las cookies?</h2>
        <p>
          Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Permiten
          que el sitio recuerde tus acciones y preferencias durante un período de tiempo, para que no tengas que volver a introducirlas
          cada vez que visites el sitio o navegues de una página a otra.
        </p>
        <p>
          Además de cookies, utilizamos tecnologías similares como <em>localStorage</em> y <em>sessionStorage</em> del navegador.
          Esta política cubre todas estas tecnologías.
        </p>
      </section>

      <section>
        <h2>2. Cookies que utilizamos</h2>

        <h3>2.1 Cookies estrictamente necesarias</h3>
        <p>
          Son imprescindibles para el funcionamiento del Servicio. Sin ellas, no podrías iniciar sesión ni usar las
          funcionalidades básicas. No requieren tu consentimiento.
        </p>
        <table>
          <thead>
            <tr><th>Cookie</th><th>Proveedor</th><th>Finalidad</th><th>Duración</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>next-auth.session-token</td>
              <td>Evochi</td>
              <td>Autenticación de sesión del usuario</td>
              <td>30 días</td>
            </tr>
            <tr>
              <td>next-auth.csrf-token</td>
              <td>Evochi</td>
              <td>Protección contra ataques CSRF</td>
              <td>Sesión</td>
            </tr>
            <tr>
              <td>next-auth.callback-url</td>
              <td>Evochi</td>
              <td>Redirección tras el inicio de sesión</td>
              <td>Sesión</td>
            </tr>
            <tr>
              <td>evochi-cookie-consent</td>
              <td>Evochi</td>
              <td>Guardar tus preferencias de cookies</td>
              <td>12 meses</td>
            </tr>
          </tbody>
        </table>

        <h3>2.2 Cookies de rendimiento y analíticas</h3>
        <p>
          Nos ayudan a entender cómo se utiliza la Plataforma para mejorarla. Recogen datos de forma agregada y anónima.
          Requieren tu consentimiento.
        </p>
        <table>
          <thead>
            <tr><th>Cookie / Tecnología</th><th>Proveedor</th><th>Finalidad</th><th>Duración</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Analítica interna</td>
              <td>Evochi</td>
              <td>Tracking de visitas a invitaciones y tasas de RSVP</td>
              <td>Sesión / servidor</td>
            </tr>
          </tbody>
        </table>

        <h3>2.3 Cookies de funcionalidad</h3>
        <p>
          Permiten recordar tus preferencias y personalizar tu experiencia. Requieren tu consentimiento.
        </p>
        <table>
          <thead>
            <tr><th>Cookie</th><th>Proveedor</th><th>Finalidad</th><th>Duración</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>evochi-theme</td>
              <td>Evochi</td>
              <td>Preferencia de tema visual del editor</td>
              <td>12 meses</td>
            </tr>
          </tbody>
        </table>

        <h3>2.4 Cookies de terceros</h3>
        <p>
          Algunos proveedores que utilizamos pueden instalar sus propias cookies cuando interactúas con sus servicios
          integrados en Evochi.
        </p>
        <table>
          <thead>
            <tr><th>Proveedor</th><th>Finalidad</th><th>Política de privacidad</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Stripe</td>
              <td>Prevención de fraude durante el pago</td>
              <td><a href="https://stripe.com/es/privacy" target="_blank" rel="noopener">Ver política</a></td>
            </tr>
            <tr>
              <td>PayPal</td>
              <td>Gestión del proceso de pago</td>
              <td><a href="https://www.paypal.com/es/legalhub/privacy-full" target="_blank" rel="noopener">Ver política</a></td>
            </tr>
            <tr>
              <td>Google (OAuth)</td>
              <td>Inicio de sesión con Google (solo si lo utilizas)</td>
              <td><a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Ver política</a></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>3. Cómo gestionar las cookies</h2>
        <p>
          Cuando accedes a Evochi por primera vez, te mostramos un banner para que puedas aceptar o rechazar las cookies
          no esenciales. Puedes cambiar tu elección en cualquier momento haciendo clic en «Gestionar cookies» en el pie de página.
        </p>
        <p>
          También puedes controlar las cookies directamente desde la configuración de tu navegador:
        </p>
        <ul>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrean-preferencias" target="_blank" rel="noopener">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener">Safari</a></li>
          <li><a href="https://support.microsoft.com/es-es/windows/eliminar-y-administrar-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener">Microsoft Edge</a></li>
        </ul>
        <p>
          Ten en cuenta que bloquear todas las cookies puede afectar al funcionamiento de algunas partes del Servicio,
          en particular el inicio de sesión.
        </p>
      </section>

      <section>
        <h2>4. Actualizaciones de esta política</h2>
        <p>
          Podemos actualizar esta Política de Cookies cuando añadamos nuevas funcionalidades o proveedores. Te notificaremos
          los cambios relevantes mediante un aviso en la Plataforma.
        </p>
      </section>

      <section>
        <h2>5. Contacto</h2>
        <p>
          Si tienes dudas sobre nuestra política de cookies o sobre el tratamiento de tus datos:<br />
          <strong>Evochi</strong> · <a href="mailto:privacidad@evochi.app">privacidad@evochi.app</a>
        </p>
      </section>
    </article>
  )
}
