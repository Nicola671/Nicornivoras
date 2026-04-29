import './Contact.css'

const WA_NUM = '5492236160926'
const EMAIL  = 'nicolasmedinae06@gmail.com'

const buildWALink = () => {
  const msg = `Hola, me comunico desde el sitio web de Nicornívoras. Me interesa hacer una consulta mayorista.`
  return `https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`
}

export default function Contact() {
  return (
    <div className="contact-page">

      {/* Header */}
      <div className="contact-header">
        <div className="container">
          <p className="contact-overline animate-fade-in-up">Consultas Mayoristas</p>
          <h1 className="page-title animate-fade-in-up">Contacto</h1>
          <p className="page-subtitle animate-fade-in-up stagger-1">
            Para pedidos al por mayor, consultas de stock o propuestas comerciales,
            comunicate directamente con nosotros.
          </p>
        </div>
      </div>

      <div className="container">

        {/* Intro strip */}
        <div className="contact-intro-strip animate-fade-in-up">
          <div className="strip-line"></div>
          <p>
            Trabajamos con revendedores, viveros y tiendas de todo el país.
            Respondemos en menos de 24 horas hábiles.
          </p>
          <div className="strip-line"></div>
        </div>

        {/* Cards */}
        <div className="contact-cards animate-fade-in-up stagger-1">

          {/* WhatsApp */}
          <div className="contact-card">
            <div className="contact-card-top">
              <div className="contact-card-icon contact-card-icon--wa">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <span className="contact-card-label">WhatsApp</span>
                <span className="contact-card-value">+54 9 223 616 0926</span>
              </div>
            </div>
            <p className="contact-card-desc">
              La forma mas rapida de comunicarse. Escribinos directamente con tu consulta
              y te respondemos a la brevedad.
            </p>
            <a href={buildWALink()} target="_blank" rel="noopener noreferrer"
              className="contact-btn contact-btn--wa" id="contact-wa-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Abrir WhatsApp
            </a>
          </div>

          {/* Email */}
          <div className="contact-card">
            <div className="contact-card-top">
              <div className="contact-card-icon contact-card-icon--email">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div>
                <span className="contact-card-label">Correo electronico</span>
                <span className="contact-card-value">{EMAIL}</span>
              </div>
            </div>
            <p className="contact-card-desc">
              Para consultas detalladas, listas de precios o propuestas comerciales.
              Incluir razon social o nombre del negocio si corresponde.
            </p>
            <a href={`mailto:${EMAIL}?subject=Consulta%20Mayorista%20-%20Nicornívoras`}
              className="contact-btn contact-btn--email" id="contact-email-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Enviar correo
            </a>
          </div>

        </div>

        {/* FAQ / Info section */}
        <div className="contact-faq animate-fade-in-up stagger-2">
          <h2 className="contact-faq-title">Informacion para mayoristas</h2>
          <div className="contact-faq-grid">
            <div className="faq-item">
              <h3>Pedido minimo</h3>
              <p>Trabajamos con pedidos mayoristas desde 5 plantas por especie. Consultanos disponibilidad de stock.</p>
            </div>
            <div className="faq-item">
              <h3>Envios a todo el pais</h3>
              <p>Despachamos por correo privado a cualquier punto de Argentina. El costo de envio se cotiza segun destino y volumen.</p>
            </div>
            <div className="faq-item">
              <h3>Formas de pago</h3>
              <p>Transferencia bancaria, Mercado Pago. Para cuentas recurrentes se puede acordar pago a cuenta corriente.</p>
            </div>
            <div className="faq-item">
              <h3>Tiempo de respuesta</h3>
              <p>Respondemos todas las consultas en menos de 24 horas habiles, de lunes a sabado.</p>
            </div>
          </div>
        </div>

        {/* Location strip */}
        <div className="contact-location animate-fade-in-up stagger-3">
          <div className="location-line"></div>
          <div className="location-content">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>Mar del Plata, Buenos Aires — Argentina</span>
          </div>
          <div className="location-line"></div>
        </div>

      </div>
    </div>
  )
}
