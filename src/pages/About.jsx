import './About.css'

export default function About() {
  const timeline = [
    { year: '2019', title: 'El Inicio', desc: 'Todo comenzó con mi primera Venus Atrapamoscas. Una planta que me cambió la visión del mundo vegetal.' },
    { year: '2021', title: 'La Colección Crece', desc: 'Comencé a cultivar Droseras, Sarracenias y Nepenthes, profundizando cada vez más en el mundo de las carnívoras.' },
    { year: '2022', title: 'Comunidad', desc: 'Empecé a compartir mi experiencia y conectar con otros apasionados en toda Argentina.' },
    { year: '2023', title: 'Nicornívoras', desc: 'Nació la tienda oficial para compartir mis plantas con quienes sienten la misma pasión.' },
    { year: '2024', title: 'Crecimiento', desc: 'Más de 50 variedades disponibles y envíos a todo el país desde Mar del Plata.' },
  ]

  const values = [
    { icon: '🌱', title: 'Pasión', desc: 'Cada planta es cultivada con dedicación y amor por la naturaleza.' },
    { icon: '🔬', title: 'Conocimiento', desc: 'Estudiamos constantemente para ofrecer las mejores plantas y consejos.' },
    { icon: '🤝', title: 'Comunidad', desc: 'Creemos en compartir conocimiento y construir juntos.' },
    { icon: '🌍', title: 'Sustentabilidad', desc: 'Prácticas responsables de cultivo y empaque eco-friendly.' },
  ]

  return (
    <div className="about-page">
      <div className="about-header">
        <div className="container">
          <h1 className="page-title animate-fade-in-up">Sobre Nosotros</h1>
          <p className="page-subtitle animate-fade-in-up stagger-1">
            Conoce la historia detrás de Nicornívoras
          </p>
        </div>
      </div>

      <div className="container">
        {/* Story Section */}
        <section className="about-story section">
          <div className="story-grid">
            <div className="story-image animate-fade-in-up">
              <div className="story-image-frame">
                <img
                  src="https://i.postimg.cc/zvGRfBRq/Whats-App-Image-2026-04-28-at-10-44-24-PM.jpg"
                  alt="Nicolás con sus plantas carnívoras en Mar del Plata"
                  className="story-img"
                />
              </div>
            </div>
            <div className="story-content animate-fade-in-up stagger-1">
              <h2>Nuestra Historia</h2>
              <p>
                Nicornívoras nace de una pasión personal por las plantas carnívoras. Soy yo quien las cultiva 
                desde el año 2019 en Mar del Plata, dedicando tiempo, cuidado y conocimiento a cada especie.
              </p>
              <p>
                Lo que comenzó como una colección propia fue creciendo hasta convertirse en este proyecto, 
                donde comparto estas plantas únicas con otros apasionados. Cada planta que ofrezco está 
                cultivada de forma responsable, buscando siempre la mejor calidad.
              </p>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="about-timeline section">
          <h2 className="section-title">Nuestro Camino</h2>
          <div className="timeline">
            {timeline.map((item, i) => (
              <div key={i} className={`timeline-item ${i % 2 === 0 ? 'left' : 'right'} animate-fade-in-up stagger-${(i % 5) + 1}`}>
                <div className="timeline-content">
                  <span className="timeline-year">{item.year}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
                <div className="timeline-dot"></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
