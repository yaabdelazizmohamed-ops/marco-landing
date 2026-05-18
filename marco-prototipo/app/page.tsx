'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen, BarChart2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

/* ── Wordmark SVG — reutilizable ── */
function WordmarkSVG({ active, heroScale }: { active: boolean; heroScale?: boolean }) {
  return (
    <a
      className={[
        'nav-brand',
        heroScale ? 'wordmark-hero' : '',
        active ? 'nb-active' : '',
      ].join(' ')}
      aria-label="Marco"
    >
      <span className="nb-frame">
        <svg className="nb-svg" viewBox="140 70 140 70" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <line className="nb-l-v"     x1="148" y1="80"  x2="148" y2="130" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line className="nb-tl-stub" x1="148" y1="80"  x2="207" y2="80"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line className="nb-bl-stub" x1="148" y1="130" x2="207" y2="130" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <g className="nb-right-group">
            <line className="nb-r-v"     x1="202" y1="80"  x2="202" y2="130" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line className="nb-tr-stub" x1="202" y1="80"  x2="143" y2="80"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line className="nb-br-stub" x1="202" y1="130" x2="143" y2="130" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          <defs>
            <clipPath id={`clip-${heroScale ? 'hero' : 'overlay'}`}>
              <rect className="nb-arco-clip" x="190" y="78" width="64" height="54" />
            </clipPath>
          </defs>
          <g clipPath={`url(#clip-${heroScale ? 'hero' : 'overlay'})`}>
            <text x="190" y="114" className="nb-arco">arco</text>
          </g>
          <text x="175" y="119" className="nb-mark nb-mark-sigma" textAnchor="middle">&#x03A3;</text>
        </svg>
      </span>
    </a>
  );
}

/* ── Card → Browser expand animation ── */
function BrowserExpand({ startRect, role }: { startRect: DOMRect; role: string }) {
  const vw = typeof window !== 'undefined' ? window.innerWidth  : 1024;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768;

  const maxW  = role === 'teacher' ? 1160 : 1080;
  const targetW = Math.min(vw - 48, maxW);
  const targetH = Math.min(vh - 64, 720);
  const targetL = (vw - targetW) / 2;
  const targetT = (vh - targetH) / 2;

  return (
    <>
      {/* Gray desktop backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.14 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 90,
          background: 'linear-gradient(135deg, #d4d3d0 0%, #c8c7c4 100%)',
        }}
      />

      {/* Window morphing from card — width expands before height for "pull" effect */}
      <motion.div
        initial={{
          top: startRect.top, left: startRect.left,
          width: startRect.width, height: startRect.height,
          borderRadius: 24,
        }}
        animate={{
          top: targetT, left: targetL,
          width: targetW, height: targetH,
          borderRadius: 12,
        }}
        transition={{
          width:        { type: 'spring', stiffness: 440, damping: 36 },
          left:         { type: 'spring', stiffness: 440, damping: 36 },
          height:       { type: 'spring', stiffness: 320, damping: 30, delay: 0.05 },
          top:          { type: 'spring', stiffness: 320, damping: 30, delay: 0.05 },
          borderRadius: { type: 'spring', stiffness: 380, damping: 32 },
        }}
        style={{
          position: 'fixed', zIndex: 100,
          background: '#ffffff',
          boxShadow: '0 32px 80px rgba(0,0,0,0.28)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Browser top bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.2 }}
          style={{
            background: '#ebebeb', borderBottom: '1px solid #d0d0d0',
            padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: '8px',
            flexShrink: 0,
          }}
        >
          {['#ff5f57','#febc2e','#28c840'].map((c, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
          ))}
          <div style={{
            flex: 1, maxWidth: '420px', margin: '0 auto',
            background: '#fff', border: '1px solid #c8c8c8',
            borderRadius: '6px', padding: '4px 12px',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
              <rect x="1" y="5" width="8" height="7" rx="1.5" fill="#6b6b6b"/>
              <path d="M2.5 5V3.5a2.5 2.5 0 015 0V5" stroke="#6b6b6b" strokeWidth="1.2" fill="none"/>
            </svg>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#3c3c3c' }}>
              app.marcoaprende.com
            </span>
          </div>
        </motion.div>

        {/* Loading area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.2 }}
          style={{
            flex: 1, background: '#fafaf8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div className="spinner" />
        </motion.div>
      </motion.div>
    </>
  );
}

/* ── Hover variants — propagated to children via whileHover="hovered" ── */
const CARD_V = {
  rest:    { y: 0,  scale: 1,     boxShadow: '0 0px 0px rgba(44,46,122,0)' },
  hovered: { y: -9, scale: 1.018, boxShadow: '0 22px 52px rgba(44,46,122,0.18)',
             transition: { type: 'spring' as const, stiffness: 340, damping: 22 } },
  tapped:  { y: -3, scale: 0.99,  boxShadow: '0 6px 16px rgba(44,46,122,0.1)',
             transition: { duration: 0.08 } },
};

const ICON_V = {
  rest:    { scale: 1,    rotate: 0 },
  hovered: { scale: 1.18, rotate: -6,
             transition: { type: 'spring' as const, stiffness: 500, damping: 20 } },
  tapped:  { scale: 0.92, rotate: 0 },
};

const ARROW_V = {
  rest:    { x: 0,  opacity: 0.7 },
  hovered: { x: 6,  opacity: 1,
             transition: { type: 'spring' as const, stiffness: 500, damping: 22 } },
  tapped:  { x: 2,  opacity: 1 },
};

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [cardRect, setCardRect] = useState<DOMRect | null>(null);
  const [wordmarkActive, setWordmarkActive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setWordmarkActive(true), 350);
    return () => clearTimeout(t);
  }, []);

  const handleEnter = (role: string, el: HTMLElement) => {
    if (transitioning) return;
    setCardRect(el.getBoundingClientRect());
    setSelectedRole(role);
    setTransitioning(true);
    setTimeout(() => {
      localStorage.setItem('marco_role', role);
      router.push(role === 'student' ? '/student' : '/teacher');
    }, 1100);
  };

  const roles = [
    {
      id: 'student',
      title: 'Soy estudiante',
      description: 'Aprendo respondiendo preguntas que me hacen pensar',
      Icon: BookOpen,
      features: ['Chat socrático', 'Pistas inteligentes', 'Progreso en tiempo real'],
      label: 'estudiante',
    },
    {
      id: 'teacher',
      title: 'Soy profesor',
      description: 'Veo dónde se atascan mis alumnos, en tiempo real',
      Icon: BarChart2,
      features: ['Dashboard de clase', 'Errores frecuentes', 'Actividad por alumno'],
      label: 'profesor',
    },
  ];

  return (
    <>
      {/* ── Card → browser expand ── */}
      <AnimatePresence>
        {transitioning && selectedRole && cardRect && (
          <BrowserExpand key="expand" startRect={cardRect} role={selectedRole} />
        )}
      </AnimatePresence>

      {/* ── Login page ── */}
      <div
        style={{
          minHeight: '100vh',
          background: '#fafaf8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 1.25rem',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: '580px' }}
        >
          {/* ── Header ── */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>

            {/* Wordmark — auto-expands on mount, same animation as landing navbar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.4 }}
              style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                height: '120px', marginBottom: '1.25rem',
              }}
            >
              <div style={{ width: '240px', display: 'flex', justifyContent: 'center' }}>
                <WordmarkSVG active={wordmarkActive} heroScale />
              </div>
            </motion.div>

            {/* Tagline — DM Sans 300, igual que .hero-sub de la landing */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '1.05rem',
                fontWeight: 300,
                color: '#6b6b6b',
                lineHeight: 1.7,
                letterSpacing: '-0.01em',
              }}
            >
              IA socrática que{' '}
              <em style={{ fontStyle: 'italic', color: '#9a9a96' }}>enseña a pensar.</em>
            </motion.p>
          </div>

          {/* ── Role cards ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              marginBottom: '2.5rem',
            }}
          >
            {roles.map((role, idx) => (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + idx * 0.1, ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
                variants={CARD_V}
                whileHover={!transitioning ? 'hovered' : undefined}
                whileTap={!transitioning ? 'tapped' : undefined}
                onClick={(e) => handleEnter(role.id, e.currentTarget as HTMLElement)}
                disabled={transitioning}
                className="role-card"
                style={{
                  position: 'relative',
                  padding: '1.75rem',
                  borderRadius: '24px',
                  border: `1.5px solid ${selectedRole === role.id ? '#2c2e7a' : '#e0dfd9'}`,
                  background: selectedRole === role.id ? '#eeeefa' : '#ffffff',
                  cursor: transitioning ? 'not-allowed' : 'pointer',
                  opacity: transitioning && selectedRole !== role.id ? 0.4 : 1,
                  textAlign: 'left',
                  width: '100%',
                  transition: 'opacity 0.3s ease',
                }}
              >
                {/* Icon pill */}
                <motion.div
                  variants={ICON_V}
                  style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: '#eeeefa',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1.25rem',
                    transformOrigin: 'center center',
                  }}
                >
                  <role.Icon size={19} color="#2c2e7a" strokeWidth={1.75} />
                </motion.div>

                {/* Title — Fraunces italic, igual que .profile-btn:active de la landing */}
                <h2 style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontStyle: 'italic',
                  fontVariationSettings: '"opsz" 72',
                  fontSize: '1.45rem',
                  fontWeight: 500,
                  color: '#0a0a0a',
                  marginBottom: '0.45rem',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.08,
                }}>
                  {role.title}
                </h2>

                {/* Description — DM Sans 300 como .hero-sub */}
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.9rem',
                  fontWeight: 300,
                  color: '#6b6b6b',
                  lineHeight: 1.65,
                  marginBottom: '1.25rem',
                  letterSpacing: '-0.01em',
                }}>
                  {role.description}
                </p>

                {/* Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.5rem' }}>
                  {role.features.map((feature, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#6366cc', flexShrink: 0 }} />
                      <span style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '0.8125rem',
                        fontWeight: 400,
                        color: '#9a9a96',
                      }}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#2c2e7a',
                  }}>
                    Entrar como {role.label}
                  </span>
                  <motion.span variants={ARROW_V} style={{ display: 'inline-flex' }}>
                    <ArrowRight size={14} color="#2c2e7a" strokeWidth={2} />
                  </motion.span>
                </div>

                {/* Selected pulse */}
                {selectedRole === role.id && transitioning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      position: 'absolute', inset: 0,
                      borderRadius: '23px',
                      border: '2px solid #2c2e7a',
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* ── Footer ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            style={{ textAlign: 'center' }}
          >
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.75rem',
              fontWeight: 300,
              color: '#9a9a96',
              lineHeight: 1.7,
            }}>
              Prototipo interactivo de Marco
              <br />
              Versión de demostración para reunión educativa
            </p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
