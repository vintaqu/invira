import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones — Evochi',
  description: 'Condiciones generales de uso de la plataforma Evochi.',
}

export default function TerminosPage() {
  return (
    <article>
      <h1>Términos y Condiciones</h1>
      <p className="meta">Última actualización: 20 de abril de 2025</p>

      <section>
        <h2>1. Aceptación de los términos</h2>
        <p>
          Al acceder o utilizar Evochi («el Servicio», «la Plataforma»), aceptas quedar vinculado por estos Términos y Condiciones
          («Términos»). Si no estás de acuerdo con alguna parte de ellos, no debes utilizar el Servicio.
        </p>
        <p>
          Estos Términos constituyen el acuerdo completo entre tú y Evochi en relación con el uso del Servicio y prevalecen
          sobre cualquier acuerdo anterior.
        </p>
      </section>

      <section>
        <h2>2. Descripción del Servicio</h2>
        <p>
          Evochi es una plataforma de creación, personalización y gestión de invitaciones digitales para eventos. Permite a los
          usuarios («Organizadores») crear páginas web de invitación personalizadas, gestionar listas de invitados, recibir
          confirmaciones de asistencia (RSVP) y acceder a analíticas de sus eventos.
        </p>
        <p>
          El Servicio se ofrece bajo un modelo <strong>freemium</strong>: la creación y previsualización de invitaciones es gratuita;
          la publicación y activación del enlace público requiere el pago de la tarifa correspondiente al plan seleccionado.
        </p>
      </section>

      <section>
        <h2>3. Registro y cuenta</h2>
        <p>
          Para utilizar el Servicio debes crear una cuenta proporcionando un nombre, dirección de correo electrónico válida y contraseña.
          Eres responsable de mantener la confidencialidad de tus credenciales y de todas las actividades que se realicen bajo tu cuenta.
        </p>
        <p>
          Debes tener al menos 14 años para registrarte. Al crear una cuenta declaras que la información que facilitas es veraz,
          exacta y completa.
        </p>
        <p>
          Evochi se reserva el derecho de suspender o cancelar cuentas que incumplan estos Términos, sin previo aviso en casos
          de infracción grave.
        </p>
      </section>

      <section>
        <h2>4. Tarifas y pagos</h2>
        <h3>4.1 Planes disponibles</h3>
        <p>Los planes de pago vigentes se muestran en la página de precios de la Plataforma y pueden modificarse con previo aviso.</p>
        <ul>
          <li><strong>Preview (gratuito):</strong> creación y edición de invitaciones sin límite; sin enlace público activo.</li>
          <li><strong>Esencial (pago único por evento):</strong> publicación del evento, RSVP ilimitado y funcionalidades básicas.</li>
          <li><strong>Premium (pago único por evento):</strong> todas las funcionalidades, dominio personalizado, analytics avanzados y acceso prioritario.</li>
        </ul>

        <h3>4.2 Proceso de pago</h3>
        <p>
          Los pagos se procesan a través de <strong>Stripe</strong> o <strong>PayPal</strong>. Al completar un pago aceptas también
          los términos de servicio del proveedor de pagos correspondiente. Evochi no almacena datos de tarjetas bancarias.
        </p>

        <h3>4.3 Política de reembolsos</h3>
        <p>
          Dado que el Servicio se activa de forma inmediata tras el pago, <strong>no se realizan reembolsos</strong> salvo en los
          casos previstos por la legislación de consumidores aplicable (principalmente, cuando el servicio no funcione correctamente
          por causas imputables a Evochi). Si tienes un problema, contáctanos en <a href="mailto:soporte@evochi.app">soporte@evochi.app</a>
          y lo resolveremos.
        </p>

        <h3>4.4 Impuestos</h3>
        <p>
          Los precios mostrados pueden no incluir el IVA u otros impuestos aplicables según tu país de residencia.
          El importe final se mostrará antes de confirmar el pago.
        </p>
      </section>

      <section>
        <h2>5. Contenido del usuario</h2>
        <h3>5.1 Propiedad</h3>
        <p>
          Conservas todos los derechos sobre el contenido que subas o crees en Evochi (textos, imágenes, fotografías, etc.).
          Al subir contenido a la Plataforma, nos concedes una licencia mundial, no exclusiva, libre de regalías y sublicenciable
          para alojarlo, mostrarlo y entregarlo a los destinatarios de tus invitaciones, únicamente a los efectos de prestar el Servicio.
        </p>

        <h3>5.2 Contenido prohibido</h3>
        <p>No puedes publicar en Evochi contenido que:</p>
        <ul>
          <li>Sea ilegal, difamatorio, fraudulento, obsceno o que incite al odio.</li>
          <li>Infrinja derechos de propiedad intelectual o industrial de terceros.</li>
          <li>Contenga malware, virus u otro código dañino.</li>
          <li>Vulnere la privacidad o los datos personales de terceros sin su consentimiento.</li>
          <li>Sea spam o comunicación comercial no solicitada.</li>
          <li>Se refiera a actividades ilegales o que puedan causar daño a personas o animales.</li>
        </ul>
        <p>
          Evochi se reserva el derecho de eliminar cualquier contenido que infrinja estas normas, sin perjuicio de otras acciones legales.
        </p>

        <h3>5.3 Responsabilidad sobre el contenido</h3>
        <p>
          Eres el único responsable del contenido de tus invitaciones y de la veracidad de la información que publicas.
          Evochi actúa como mero intermediario técnico y no revisa el contenido de las invitaciones de forma proactiva.
        </p>
      </section>

      <section>
        <h2>6. Propiedad intelectual de Evochi</h2>
        <p>
          La Plataforma, su código fuente, diseño, logotipos, marcas, plantillas y demás elementos son propiedad exclusiva de Evochi
          o de sus licenciantes, y están protegidos por la legislación de propiedad intelectual e industrial.
        </p>
        <p>
          No se te concede ningún derecho sobre la Plataforma salvo el uso personal y no comercial descrito en estos Términos.
          Queda expresamente prohibida la reproducción, copia, distribución, transformación o comunicación pública de cualquier
          elemento de la Plataforma sin autorización escrita previa.
        </p>
      </section>

      <section>
        <h2>7. Disponibilidad y modificaciones del Servicio</h2>
        <p>
          Nos esforzamos por ofrecer una disponibilidad del 99,5 %, pero no garantizamos que el Servicio sea ininterrumpido o libre
          de errores. Podemos realizar tareas de mantenimiento que impliquen interrupciones temporales, que notificaremos con
          antelación cuando sea posible.
        </p>
        <p>
          Evochi puede modificar, suspender o discontinuar cualquier funcionalidad del Servicio en cualquier momento. Para cambios
          materiales que afecten a funcionalidades de pago, notificaremos con al menos 30 días de antelación.
        </p>
      </section>

      <section>
        <h2>8. Limitación de responsabilidad</h2>
        <p>
          En la máxima medida permitida por la ley, Evochi no será responsable de daños indirectos, incidentales, especiales,
          consecuentes o punitivos, ni de pérdidas de beneficios o datos, que se deriven del uso o la imposibilidad de uso del Servicio.
        </p>
        <p>
          La responsabilidad total de Evochi frente a ti por cualquier reclamación derivada del uso del Servicio no excederá
          el importe pagado por ti a Evochi en los 12 meses anteriores a la reclamación.
        </p>
      </section>

      <section>
        <h2>9. Indemnización</h2>
        <p>
          Aceptas indemnizar y mantener indemne a Evochi y a sus directivos, empleados y colaboradores frente a cualquier
          reclamación, pérdida, daño o gasto (incluidos honorarios razonables de abogados) que se derive de:
          (a) tu uso del Servicio; (b) el contenido de tus invitaciones; o (c) el incumplimiento de estos Términos.
        </p>
      </section>

      <section>
        <h2>10. Suspensión y cancelación de cuentas</h2>
        <p>
          Puedes cancelar tu cuenta en cualquier momento desde la configuración de tu perfil o escribiendo a
          <a href="mailto:soporte@evochi.app">soporte@evochi.app</a>. La cancelación no da derecho a reembolso de pagos ya realizados.
        </p>
        <p>
          Evochi puede suspender o cancelar tu cuenta si: incumples estos Términos de forma reiterada o grave; no pagas las tarifas
          debidas; tu cuenta está siendo utilizada de forma fraudulenta; o así lo exige la ley.
        </p>
      </section>

      <section>
        <h2>11. Ley aplicable y jurisdicción</h2>
        <p>
          Estos Términos se rigen por la legislación española. Para cualquier controversia, las partes se someten a los Juzgados y
          Tribunales de España, sin perjuicio de los derechos que la normativa de consumidores reconoce a los usuarios particulares
          para acudir a los tribunales de su lugar de residencia.
        </p>
      </section>

      <section>
        <h2>12. Cambios en los Términos</h2>
        <p>
          Podemos actualizar estos Términos periódicamente. Te notificaremos los cambios materiales por correo electrónico con
          al menos 15 días de antelación. Si continúas usando el Servicio tras la entrada en vigor de los nuevos Términos,
          se entenderá que los aceptas.
        </p>
      </section>

      <section>
        <h2>13. Contacto</h2>
        <p>
          Para cualquier consulta sobre estos Términos:<br />
          <strong>Evochi</strong> · <a href="mailto:legal@evochi.app">legal@evochi.app</a>
        </p>
      </section>
    </article>
  )
}
