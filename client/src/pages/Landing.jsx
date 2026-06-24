import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function AccordionItem({ question, answer, open, onClick }) {
  return (
    <div className="border-b border-gray-200">
      <button onClick={onClick} className="w-full flex items-center justify-between py-5 text-left">
        <span className="text-base font-medium text-gray-900 pr-4">{question}</span>
        <svg className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-gray-500 text-sm leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export default function Landing() {
  const [faqOpen, setFaqOpen] = useState(null);
  const [stats, setStats] = useState({ projects: 0, contractors: 0, users: 0, updates: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/projects');
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setStats({
            projects: data.length,
            contractors: new Set(data.filter(p => p.contractor_name).map(p => p.contractor_name)).size,
            users: 5,
            updates: data.reduce((s, p) => s + (p.progress || 0), 0),
          });
        }
      } catch {}
    };
    fetchStats();
  }, []);

  const faqs = [
    { q: '¿Qué es SMOP?', a: 'SMOP (Sistema de Monitoreo de Obras Públicas) es una plataforma digital de la Alcaldía del Municipio Plaza para gestionar, dar seguimiento y transparentar las obras públicas en Guarenas y Guatire.' },
    { q: '¿Quién puede usar SMOP?', a: 'Funcionarios municipales (administradores), contratistas registrados, y ciudadanos interesados en dar seguimiento a las obras públicas de su comunidad.' },
    { q: '¿Cómo accedo al sistema?', a: 'Si eres funcionario o contratista, recibirás tus credenciales de acceso del Departamento de Obras Públicas. Los ciudadanos pueden solicitar una cuenta de visitante para explorar los proyectos.' },
    { q: '¿Pueden los ciudadanos ver el progreso de las obras?', a: 'Sí. Los ciudadanos con cuenta de visitante pueden consultar todos los proyectos, ver fotos de los avances y dar seguimiento al uso de los recursos públicos.' },
    { q: '¿Cómo se reportan los avances?', a: 'Los contratistas registran avances directamente desde su panel, incluyendo fotos, descripciones y porcentaje de progreso. Los administradores municipales verifican y aprueban cada actualización.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">SM</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">SMOP</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2">Iniciar Sesión</Link>
            <Link to="/login" className="btn btn-primary text-sm">Solicitar Acceso</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 mb-6">
                <span className="w-1.5 h-1.5 bg-gray-900 rounded-full" />
                Alcaldía del Municipio Plaza
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                Monitoreo Inteligente de
                <span className="text-gray-400 block mt-1">Obras Públicas</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-gray-500 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Gestiona, da seguimiento y transparenta todas las obras del municipio desde una sola plataforma. 
                En tiempo real, con fotos, reportes y participación ciudadana.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link to="/login" className="btn bg-gray-900 text-white border-gray-900 hover:bg-gray-800 px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 inline-flex items-center justify-center gap-2">
                  Iniciar Sesión
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <a href="#features" className="btn bg-white text-gray-700 border-gray-300 hover:bg-gray-50 px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 inline-flex items-center justify-center gap-2">
                  Conocer más
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/5 to-transparent rounded-2xl" />
              <div className="relative bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden shadow-xl shadow-gray-900/10">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-200 bg-white">
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                  <span className="text-xs text-gray-400 ml-2">smop.municipioplaza.gob.ve</span>
                </div>
                <div className="p-4 sm:p-6 bg-gray-50">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'En Progreso', value: '2', color: 'bg-gray-800' },
                      { label: 'Pendientes', value: '4', color: 'bg-gray-300' },
                      { label: 'Completadas', value: '0', color: 'bg-gray-900' },
                    ].map(s => (
                      <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-3">
                        <div className={`w-2 h-2 rounded-full ${s.color} mb-2`} />
                        <div className="text-xl font-bold text-gray-900">{s.value}</div>
                        <div className="text-xs text-gray-400">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Pavimentación Av. Bolívar', status: '68%', color: 'bg-gray-800' },
                      { name: 'Sistema de Aguas Lluvias', status: '32%', color: 'bg-gray-500' },
                      { name: 'Recuperación Plaza Bolívar', status: '12%', color: 'bg-gray-300' },
                    ].map(p => (
                      <div key={p.name} className="bg-white rounded-lg border border-gray-200 px-3 py-2.5 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 truncate mr-2">{p.name}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${p.color} rounded-full transition-all`} style={{ width: p.status }} />
                          </div>
                          <span className="text-xs font-medium text-gray-500 w-7 text-right">{p.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
            {[
              { value: stats.projects || '—', label: 'Proyectos Registrados' },
              { value: stats.contractors || '—', label: 'Contratistas Activos' },
              { value: stats.users || '—', label: 'Usuarios del Sistema' },
              { value: stats.updates || '—', label: 'Avances Reportados' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Todo lo que necesitas en un solo lugar</h2>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">Una plataforma integrada para la gestión completa de obras públicas municipales.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[
            { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Seguimiento en Tiempo Real', desc: 'Monitorea el progreso de cada obra con actualizaciones periódicas, fotos y reportes de los contratistas.' },
            { icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', title: 'Reportes Automáticos', desc: 'Genera reportes detallados por proyecto, contratista o período para la toma de decisiones informadas.' },
            { icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', title: 'Galería de Fotos', desc: 'Cada avance incluye evidencia fotográfica. Consulta el antes y después de cada obra en un solo lugar.' },
            { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', title: 'Gestión de Contratistas', desc: 'Administra contratistas, asigna proyectos y da seguimiento al desempeño de cada empresa.' },
            { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Control de Presupuestos', desc: 'Lleva el control detallado del presupuesto asignado a cada obra con total transparencia.' },
            { icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Transparencia Ciudadana', desc: 'Los ciudadanos pueden consultar el estado de las obras y verificar el uso de los recursos públicos.' },
          ].map(f => (
            <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Cómo funciona</h2>
            <p className="mt-4 text-gray-400 max-w-2xl mx-auto">Cuatro pasos simples para gestionar cualquier obra pública municipal.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
            {[
              { step: '01', title: 'Crear Proyecto', desc: 'El administrador registra la obra con presupuesto, fechas y contratista asignado.' },
              { step: '02', title: 'Asignar Contratista', desc: 'La obra se asigna a una empresa contratista responsable de la ejecución.' },
              { step: '03', title: 'Reportar Avances', desc: 'El contratista registra avances con fotos, descripciones y porcentaje de progreso.' },
              { step: '04', title: 'Dar Seguimiento', desc: 'Administradores y ciudadanos monitorean el progreso en tiempo real.' },
            ].map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5 text-lg font-bold text-white/60">{s.step}</div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                {i < 3 && <div className="hidden lg:block absolute top-8 left-[60%] w-[40%] h-px border-t border-dashed border-white/10" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Lo que dicen nuestros usuarios</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'María Rodríguez', role: 'Directora de Obras', text: 'SMOP nos permitió centralizar la gestión de obras. Ahora tenemos visibilidad total del progreso de cada proyecto en tiempo real.' },
            { name: 'Carlos Mendoza', role: 'Contratista', text: 'Reportar avances desde mi panel es muy sencillo. Las fotos y actualizaciones llegan directamente a la alcaldía sin papeleo.' },
            { name: 'Ana Pereira', role: 'Arquitecto', text: 'La transparencia que aporta SMOP es invaluable. Los ciudadanos pueden ver exactamente en qué se invierte cada recurso.' },
          ].map(t => (
            <div key={t.name} className="bg-white border border-gray-200 rounded-xl p-6">
              <svg className="w-6 h-6 text-gray-300 mb-3" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{t.text}</p>
              <div>
                <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                <div className="text-xs text-gray-400">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">Preguntas Frecuentes</h2>
          <div className="bg-white border border-gray-200 rounded-xl px-6">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                question={faq.q}
                answer={faq.a}
                open={faqOpen === i}
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">¿Listo para comenzar?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">Solicita tu acceso y únete a la transformación digital del Municipio Plaza.</p>
          <Link to="/login" className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-3.5 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200">
            Solicitar Acceso
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">SM</span>
                </div>
                <span className="text-sm font-semibold text-white">SMOP</span>
              </div>
              <p className="text-xs leading-relaxed">Sistema de Monitoreo de Obras Públicas de la Alcaldía del Municipio Plaza.</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Plataforma</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#features" className="hover:text-white transition-colors">Características</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Iniciar Sesión</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Solicitar Acceso</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Municipio</h4>
              <ul className="space-y-2 text-xs">
                <li>Alcaldía del Municipio Plaza</li>
                <li>Guarenas - Guatire</li>
                <li>Estado Miranda, Venezuela</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">Términos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Política de Privacidad</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-white/10 text-center text-xs">
            &copy; {new Date().getFullYear()} Alcaldía del Municipio Plaza. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
