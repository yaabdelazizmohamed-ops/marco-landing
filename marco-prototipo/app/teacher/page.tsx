'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, AlertTriangle, Users, TrendingUp, Clock,
  ChevronRight, Activity, Menu, Settings, Home, BarChart2, ArrowLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getFeed, getLastActivity, getLastSubjectKey, onUpdate, formatTime, clearStore } from '@/lib/demoStore';

/* ── Tokens — sistema "cuaderno editorial" ── */
const T = {
  /* superficies */
  bg:          '#f0ece0',   // papel cálido
  surface:     '#faf7ef',   // tarjetas sobre papel
  surfaceDeep: '#e8e4d8',   // fondo deprimido / note
  /* tinta */
  ink:         '#1a1816',   // negro rico
  gray:        '#5c5650',   // gris cálido
  soft:        '#8a8278',   // gris suave
  /* estructura */
  border:      '#c8c2b4',   // borde tostado
  borderSoft:  '#ddd8cc',
  /* navbar violeta */
  navBg:       '#2c2e7a',
  navText:     '#eeeefa',
  navSoft:     'rgba(238,238,250,0.55)',
  navHover:    'rgba(238,238,250,0.12)',
  /* producto */
  deep:        '#2c2e7a',
  accent:      '#6366cc',
  violet:      '#eeeefa',
  violet2:     '#f5f5fc',
  /* semántico */
  success:     '#2d6a4f',   successSoft: '#e7f1ec',
  warn:        '#b45309',   warnSoft:    '#fef3c7',
  danger:      '#b91c1c',   dangerSoft:  '#fee2e2',
  /* atajos para compat */
  white:       '#faf7ef',
  black:       '#1a1816',
  note:        '#e8e4d8',
  soft2:       '#f5f5fc',
};

const CARD_SHADOW = '3px 3px 0 rgba(0,0,0,0.10)';
const CARD_R = '8px';

const TEACHER_SUBJECT = 'Ciencias Naturales';

interface ClassData {
  id: string; course: string; section: string;
  students: number; isLive: boolean;
  color: { strip: string; text: string; pill: string };
}

const CLASSES: ClassData[] = [
  { id: '3eso-a',  course: '3.º ESO',  section: 'A', students: 24, isLive: true,  color: { strip: '#6366cc', text: '#2c2e7a', pill: '#eeeefa' } },
  { id: '3eso-b',  course: '3.º ESO',  section: 'B', students: 22, isLive: false, color: { strip: '#d97706', text: '#92400e', pill: '#fef3c7' } },
  { id: '2eso-a',  course: '2.º ESO',  section: 'A', students: 26, isLive: false, color: { strip: '#16a34a', text: '#166534', pill: '#dcfce7' } },
  { id: '4eso-b',  course: '4.º ESO',  section: 'B', students: 20, isLive: false, color: { strip: '#ea580c', text: '#9a3412', pill: '#ffedd5' } },
  { id: '1bach-a', course: '1.º Bach', section: 'A', students: 18, isLive: false, color: { strip: '#db2777', text: '#9d174d', pill: '#fce7f3' } },
  { id: '2bach-b', course: '2.º Bach', section: 'B', students: 15, isLive: false, color: { strip: '#3b82f6', text: '#1e3a8a', pill: '#dbeafe' } },
];

type TeacherScreen = 'home' | 'dashboard';

/* ── Browser chrome ── */
function BrowserChrome({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
      style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(135deg, #d4d3d0 0%, #c8c7c4 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      <motion.div
        initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%', maxWidth: '1080px',
          height: 'calc(100vh - 4rem)', maxHeight: '720px',
          background: T.surface, borderRadius: '12px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.28)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {/* Chrome bar */}
        <div style={{
          background: '#ebebeb', borderBottom: '1px solid #d0d0d0',
          padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0,
        }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
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
        </div>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: T.bg }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── NavWordmark (hover expand) ── */
function NavWordmark({ clipId = 'tNavArco', light = false }: { clipId?: string; light?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ zoom: 0.65, lineHeight: 0 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <div className={`nav-brand${hovered ? ' nb-active' : ''}`} aria-label="Marco"
        style={{ color: light ? T.navText : T.ink }}
      >
        <span className="nb-frame">
          <svg className="nb-svg" viewBox="140 70 140 70" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <line className="nb-l-v"     x1="148" y1="80"  x2="148" y2="130" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line className="nb-tl-stub" x1="148" y1="80"  x2="207" y2="80"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line className="nb-bl-stub" x1="148" y1="130" x2="207" y2="130" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <g className="nb-right-group">
              <line className="nb-r-v"     x1="202" y1="80"  x2="202" y2="130" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line className="nb-tr-stub" x1="202" y1="80"  x2="143" y2="80"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line className="nb-br-stub" x1="202" y1="130" x2="143" y2="130" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </g>
            <defs><clipPath id={clipId}><rect className="nb-arco-clip" x="190" y="78" width="64" height="54"/></clipPath></defs>
            <g clipPath={`url(#${clipId})`}><text x="190" y="114" className="nb-arco">arco</text></g>
            <text x="175" y="119" className="nb-mark nb-mark-sigma" textAnchor="middle">&#x03A3;</text>
          </svg>
        </span>
      </div>
    </div>
  );
}

/* ── Sidebar ── */
function TeacherSidebar({ open, onClose, onLogout }: { open: boolean; onClose: () => void; onLogout: () => void }) {
  const navItems = [
    { label: 'Mis clases',         icon: Home,          active: true  },
    { label: 'Alumnos',            icon: Users,         active: false },
    { label: 'Errores frecuentes', icon: AlertTriangle, active: false },
    { label: 'Estadísticas',       icon: BarChart2,     active: false },
  ];
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="sb-bg"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }} onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.22)', zIndex: 100 }}
          />
          <motion.div key="sb-panel"
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 38, mass: 0.8 }}
            style={{
              position: 'absolute', top: 0, left: 0, bottom: 0, width: '220px', zIndex: 101,
              background: T.surface, borderRight: `2px solid ${T.border}`,
              boxShadow: '4px 0 28px rgba(0,0,0,0.12)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header violet */}
            <div style={{
              background: T.navBg,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 0.875rem', height: '50px', flexShrink: 0,
            }}>
              <button onClick={onClose} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: T.navText, padding: '7px', borderRadius: '6px',
                display: 'flex', transition: 'background 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = T.navHover)}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              <NavWordmark clipId="sbTeacherArco" light />
            </div>

            <nav style={{ flex: 1, padding: '0.75rem 0.625rem', overflowY: 'auto' }}>
              {navItems.map(({ label, icon: Icon, active }) => (
                <button key={label} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.5rem 0.75rem', borderRadius: '6px',
                  background: active ? T.violet : 'none', border: 'none', cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem',
                  fontWeight: active ? 600 : 400,
                  color: active ? T.deep : T.gray,
                  textAlign: 'left', transition: 'background 0.12s', marginBottom: '2px',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = T.surfaceDeep; e.currentTarget.style.color = T.ink; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = T.gray; } }}
                >
                  <Icon size={15} strokeWidth={1.75} /> {label}
                </button>
              ))}
            </nav>

            <div style={{ padding: '0.875rem', borderTop: `2px solid ${T.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ width: 30, height: 30, borderRadius: '6px', background: T.violet, border: `2px solid ${T.deep}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: '0.875rem', color: T.deep }}>M</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 600, color: T.ink, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Prof. M. González</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: T.soft, margin: 0 }}>{TEACHER_SUBJECT}</p>
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.soft, display: 'flex', padding: '4px', borderRadius: '4px', transition: 'background 0.12s, color 0.12s', flexShrink: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.surfaceDeep; e.currentTarget.style.color = T.gray; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = T.soft; }}
                >
                  <Settings size={14} strokeWidth={1.75} />
                </button>
              </div>
              <button onClick={onLogout} style={{
                width: '100%', padding: '0.4rem 0.75rem',
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: T.danger,
                background: 'none', border: 'none', cursor: 'pointer',
                borderRadius: '6px', textAlign: 'left', transition: 'background 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = T.dangerSoft)}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                Cerrar sesión
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Navbar violeta — compartido ── */
function VioletNavbar({
  left, center, right,
}: {
  left: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div style={{
      background: T.navBg,
      padding: '0 1.25rem', display: 'flex', alignItems: 'center',
      height: '50px', flexShrink: 0, position: 'relative',
    }}>
      <div style={{ zIndex: 1 }}>{left}</div>
      {center && (
        <div style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic',
          fontVariationSettings: '"opsz" 72',
          fontSize: '0.9375rem', fontWeight: 500, color: T.navText,
          letterSpacing: '-0.02em', pointerEvents: 'none',
        }}>
          {center}
        </div>
      )}
      <div style={{ marginLeft: 'auto', zIndex: 1, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>{right}</div>
    </div>
  );
}

function NavIconBtn({ onClick, title, children }: { onClick?: () => void; title?: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title} style={{
      background: 'none', border: 'none', cursor: 'pointer',
      padding: '7px', borderRadius: '6px', display: 'flex',
      color: T.navText, transition: 'background 0.12s',
    }}
    onMouseEnter={e => (e.currentTarget.style.background = T.navHover)}
    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
    >
      {children}
    </button>
  );
}

function NavBackBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '4px',
      background: 'none', border: 'none', cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem',
      color: T.navSoft, padding: '4px 0', transition: 'color 0.12s',
    }}
    onMouseEnter={e => (e.currentTarget.style.color = T.navText)}
    onMouseLeave={e => (e.currentTarget.style.color = T.navSoft)}
    >
      <ArrowLeft size={14} /> {label}
    </button>
  );
}

/* ── Datos ── */
const studentsData: {
  id: number; name: string; progress: number; total: number;
  minutesActive: number; status: 'done' | 'active' | 'stuck' | 'idle'; lastQuestion: string;
}[] = [
  { id: 1, name: 'Alex García',    progress: 5, total: 6, minutesActive: 23, status: 'active', lastQuestion: 'Pensamiento Crítico' },
  { id: 2, name: 'María López',    progress: 3, total: 6, minutesActive: 14, status: 'stuck',  lastQuestion: 'Química Orgánica' },
  { id: 3, name: 'Carlos Ruiz',    progress: 6, total: 6, minutesActive: 31, status: 'done',   lastQuestion: 'Completado' },
  { id: 4, name: 'Ana Martín',     progress: 2, total: 6, minutesActive: 8,  status: 'stuck',  lastQuestion: 'Biología Celular' },
  { id: 5, name: 'Pablo Sanz',     progress: 4, total: 6, minutesActive: 19, status: 'active', lastQuestion: 'Geografía' },
  { id: 6, name: 'Lucía Pérez',    progress: 1, total: 6, minutesActive: 5,  status: 'idle',   lastQuestion: 'Termodinámica' },
  { id: 7, name: 'Diego Molina',   progress: 3, total: 6, minutesActive: 17, status: 'active', lastQuestion: 'Historia' },
  { id: 8, name: 'Sara Fernández', progress: 5, total: 6, minutesActive: 28, status: 'active', lastQuestion: 'Geografía' },
];

const errorsData = [
  { question: 'Biología Celular', pattern: 'No distinguen células reproductivas de somáticas',      count: 11, pct: 68 },
  { question: 'Termodinámica',    pattern: 'Confunden presión con volumen al aumentar temperatura',  count: 8,  pct: 50 },
  { question: 'Historia',         pattern: 'Solo mencionan libros, no el impacto social o político', count: 5,  pct: 31 },
];

type Status = 'done' | 'active' | 'stuck' | 'idle';
const statusLabel: Record<Status, { label: string; bg: string; color: string }> = {
  done:   { label: 'Completado', bg: T.successSoft, color: T.success },
  active: { label: 'Activo',     bg: T.violet,      color: T.deep    },
  stuck:  { label: 'Atascado',   bg: T.dangerSoft,  color: T.danger  },
  idle:   { label: 'Inactivo',   bg: T.surfaceDeep, color: T.soft    },
};

/* ── Home: selección de clase ── */
function HomeTeacher({ onSelect, logout }: { onSelect: (cls: ClassData) => void; logout: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState<ClassData | null>(null);
  const SPRING = { type: 'spring' as const, stiffness: 500, damping: 32 };

  const liveStudents  = studentsData.filter(s => s.status === 'active' || s.status === 'done').length;
  const stuckStudents = studentsData.filter(s => s.status === 'stuck').length;
  const avgPct        = Math.round(studentsData.reduce((a, s) => a + (s.progress / s.total) * 100, 0) / studentsData.length);

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <TeacherSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={logout} />

      <VioletNavbar
        left={<NavIconBtn onClick={() => setSidebarOpen(s => !s)}><Menu size={18} strokeWidth={1.75} /></NavIconBtn>}
        right={<NavWordmark clipId="homeTeacherArco" light />}
      />

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

        {/* Izquierda */}
        <div style={{
          flex: '0 0 55%', overflowY: 'auto',
          padding: '1.25rem 1rem 1.25rem 1.25rem',
          borderRight: `2px solid ${T.border}`,
        }}>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>

            {/* Título asignatura */}
            <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: `2px solid ${T.border}` }}>
              <h1 style={{
                fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic',
                fontVariationSettings: '"opsz" 72',
                fontSize: '2rem', fontWeight: 500, color: T.ink,
                letterSpacing: '-0.03em', margin: '0 0 0.2rem', lineHeight: 1,
              }}>
                {TEACHER_SUBJECT}
              </h1>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.775rem', color: T.soft, margin: 0, letterSpacing: '0.01em' }}>
                {CLASSES.length} grupos asignados
              </p>
            </div>

            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.62rem', fontWeight: 700,
              color: T.soft, textTransform: 'uppercase', letterSpacing: '0.12em',
              margin: '0 0 0.625rem',
            }}>
              Grupos
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem' }}>
              {CLASSES.map((cls, idx) => {
                const isActive = active?.id === cls.id;
                return (
                  <motion.button
                    key={cls.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, ...SPRING }}
                    whileTap={{ scale: 0.975 }}
                    onClick={() => setActive(isActive ? null : cls)}
                    style={{
                      background: isActive ? T.violet2 : T.surface,
                      border: `2px solid ${isActive ? T.deep : T.border}`,
                      borderRadius: CARD_R, padding: 0,
                      cursor: 'pointer', textAlign: 'left',
                      boxShadow: isActive ? `3px 3px 0 ${T.deep}` : CARD_SHADOW,
                      transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = T.soft;
                        e.currentTarget.style.boxShadow = '4px 4px 0 rgba(0,0,0,0.14)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = T.border;
                        e.currentTarget.style.boxShadow = CARD_SHADOW;
                      }
                    }}
                  >
                    {/* Franja de color */}
                    <div style={{ height: '5px', background: cls.color.strip }} />
                    <div style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontVariationSettings: '"opsz" 72', fontSize: '1.05rem', fontWeight: 500, color: T.ink, margin: '0 0 0.1rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                            {cls.course}
                          </p>
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', fontWeight: 600, color: T.soft, margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            Grupo {cls.section}
                          </p>
                        </div>
                        <div style={{
                          width: '26px', height: '26px', borderRadius: '4px',
                          background: cls.color.pill, border: `1.5px solid ${cls.color.strip}40`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: '0.85rem', color: cls.color.text }}>{cls.section}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: T.soft }}>{cls.students} alumnos</span>
                        {cls.isLive ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}
                              style={{ width: 5, height: 5, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.66rem', fontWeight: 600, color: T.success }}>En sesión</span>
                          </div>
                        ) : (
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.66rem', color: T.soft }}>Sin actividad</span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Derecha: panel de resumen */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.25rem 1.25rem 1rem' }}>
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Header del panel */}
                <div style={{ marginBottom: '1.125rem' }}>
                  {/* Franja color en el header */}
                  <div style={{ height: '4px', background: active.color.strip, borderRadius: '2px', marginBottom: '0.75rem' }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div>
                      <h2 style={{
                        fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic',
                        fontVariationSettings: '"opsz" 72',
                        fontSize: '1.75rem', fontWeight: 500, color: T.ink,
                        letterSpacing: '-0.03em', margin: '0 0 0.2rem', lineHeight: 1,
                      }}>
                        {active.course} <span style={{ color: T.deep }}>{active.section}</span>
                      </h2>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.775rem', color: T.soft, margin: 0 }}>
                        {active.students} alumnos · {TEACHER_SUBJECT}
                      </p>
                    </div>
                    {active.isLive && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: T.success, borderRadius: '4px', padding: '3px 8px', flexShrink: 0, marginTop: '2px' }}>
                        <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}
                          style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', fontWeight: 700, color: '#fff', letterSpacing: '0.06em', textTransform: 'uppercase' }}>En sesión</span>
                      </div>
                    )}
                  </div>
                </div>

                {active.isLive ? (
                  <>
                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.125rem' }}>
                      {[
                        { label: 'Activos',    value: `${liveStudents}/${active.students}`, numColor: T.deep    },
                        { label: 'Progreso',   value: `${avgPct}%`,                          numColor: T.accent  },
                        { label: 'Atascados',  value: `${stuckStudents}`,                    numColor: T.danger  },
                        { label: 'Respuestas', value: `${studentsData.reduce((a,s)=>a+s.progress,0)}`, numColor: T.success },
                      ].map(({ label, value, numColor }) => (
                        <div key={label} style={{
                          background: T.surface, border: `2px solid ${T.border}`,
                          borderRadius: CARD_R, padding: '0.75rem 0.875rem',
                          boxShadow: CARD_SHADOW,
                        }}>
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.62rem', fontWeight: 700, color: T.soft, margin: '0 0 0.2rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</p>
                          <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontVariationSettings: '"opsz" 72', fontSize: '2rem', fontWeight: 500, color: numColor, margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Lista alumnos */}
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.62rem', fontWeight: 700, color: T.soft, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 0.5rem' }}>
                      Alumnos
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '1.25rem', border: `2px solid ${T.border}`, borderRadius: CARD_R, overflow: 'hidden', boxShadow: CARD_SHADOW }}>
                      {studentsData.slice(0, 5).map((s, i) => {
                        const st = statusLabel[s.status];
                        return (
                          <div key={s.id} style={{
                            display: 'flex', alignItems: 'center', gap: '0.625rem',
                            padding: '0.5rem 0.75rem',
                            background: T.surface,
                            borderBottom: i < 4 ? `1px solid ${T.borderSoft}` : 'none',
                          }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: T.violet, border: `1.5px solid ${T.deep}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: '0.75rem', color: T.deep }}>{s.name.charAt(0)}</span>
                            </div>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 500, color: T.ink, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.66rem', fontWeight: 600, color: st.color, background: st.bg, padding: '2px 7px', borderRadius: '4px', flexShrink: 0 }}>{st.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '2rem 0', textAlign: 'center' }}>
                    <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontVariationSettings: '"opsz" 72', fontSize: '1.25rem', color: T.soft, margin: '0 0 0.375rem' }}>Sin sesión activa</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: T.soft, margin: 0, lineHeight: 1.6 }}>
                      Los alumnos de este grupo no están trabajando ahora mismo.
                    </p>
                  </div>
                )}

                {/* CTA */}
                <button onClick={() => onSelect(active)} style={{
                  width: '100%', padding: '0.7rem 1rem',
                  background: T.navBg, border: `2px solid ${T.navBg}`,
                  borderRadius: CARD_R,
                  fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', fontWeight: 600,
                  color: T.navText, cursor: 'pointer', letterSpacing: '0.01em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                  boxShadow: `3px 3px 0 rgba(44,46,122,0.35)`,
                  transition: 'transform 0.1s, box-shadow 0.1s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px,-1px)'; e.currentTarget.style.boxShadow = `4px 4px 0 rgba(44,46,122,0.4)`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `3px 3px 0 rgba(44,46,122,0.35)`; }}
                >
                  {active.isLive ? 'Ver sesión completa' : 'Abrir vista de clase'}
                  <ChevronRight size={15} strokeWidth={2.5} />
                </button>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontVariationSettings: '"opsz" 72', fontSize: '1.1rem', color: T.soft, margin: 0 }}>
                  Selecciona un grupo
                </p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.775rem', color: T.soft, margin: 0, opacity: 0.7 }}>
                  para ver el resumen de la clase
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard: vista en directo ── */
function DashboardView({
  cls, onBack, logout, liveFeed, isAlexLive,
}: {
  cls: ClassData; onBack: () => void; logout: () => void;
  liveFeed: ReturnType<typeof getFeed>; isAlexLive: boolean;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const students    = cls.isLive ? studentsData : [];
  const totalStudents = cls.students;
  const activeCount = students.filter(s => s.status === 'active' || s.status === 'done').length;
  const stuckCount  = students.filter(s => s.status === 'stuck').length;
  const avgProgress = students.length ? Math.round(students.reduce((a, s) => a + (s.progress / s.total) * 100, 0) / students.length) : 0;
  const totalAnswered = students.reduce((a, s) => a + s.progress, 0);
  const selectedStudent = students.find(s => s.id === selected) ?? null;

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <TeacherSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={logout} />

      <VioletNavbar
        left={<NavBackBtn onClick={onBack} label="Mis clases" />}
        center={`${cls.course} ${cls.section}`}
        right={<><NavIconBtn onClick={logout} title="Salir"><LogOut size={16} strokeWidth={1.75} /></NavIconBtn><NavWordmark clipId="dashTeacherArco" light /></>}
      />

      <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.25rem 2rem', background: T.bg }}>

        {/* Cabecera con franja de color */}
        <div style={{ borderLeft: `4px solid ${cls.color.strip}`, paddingLeft: '0.875rem', marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontVariationSettings: '"opsz" 72', fontSize: '2rem', fontWeight: 500, color: T.ink, letterSpacing: '-0.03em', margin: '0 0 0.2rem', lineHeight: 1 }}>
            {cls.isLive ? 'Clase en directo' : 'Sin sesión activa'}
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', color: T.soft, margin: 0 }}>
            {cls.isLive ? `${TEACHER_SUBJECT} — preguntas socráticas de repaso` : `No hay ninguna sesión activa en ${cls.course} ${cls.section} ahora mismo`}
          </p>
        </div>

        {cls.isLive ? (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                { Icon: Users,         label: 'Activos',    value: `${activeCount}/${totalStudents}`, numColor: T.deep    },
                { Icon: TrendingUp,    label: 'Progreso',   value: `${avgProgress}%`,                numColor: T.accent  },
                { Icon: AlertTriangle, label: 'Atascados',  value: `${stuckCount}`,                  numColor: T.danger  },
                { Icon: Clock,         label: 'Respuestas', value: `${totalAnswered}`,                numColor: T.success },
              ].map(({ Icon, label, value, numColor }, i) => (
                <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  style={{ background: T.surface, border: `2px solid ${T.border}`, borderRadius: CARD_R, padding: '1rem 1.125rem', boxShadow: CARD_SHADOW }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <Icon size={13} color={T.soft} strokeWidth={2} />
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.62rem', fontWeight: 700, color: T.soft, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
                  </div>
                  <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontVariationSettings: '"opsz" 72', fontSize: '2rem', fontWeight: 500, color: numColor, margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Two-column */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1rem' }}>

              {/* Lista */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                style={{ background: T.surface, border: `2px solid ${T.border}`, borderRadius: CARD_R, overflow: 'hidden', boxShadow: CARD_SHADOW }}
              >
                <div style={{ padding: '0.875rem 1.125rem', borderBottom: `2px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.surfaceDeep }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.62rem', fontWeight: 700, color: T.soft, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Alumnos</p>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: T.soft }}>{totalStudents} en clase</span>
                </div>
                {students.map((s, i) => {
                  const st = statusLabel[s.status];
                  const pct = Math.round((s.progress / s.total) * 100);
                  const isSel = selected === s.id;
                  return (
                    <motion.button key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.04 }}
                      onClick={() => setSelected(isSel ? null : s.id)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '0.875rem',
                        padding: '0.75rem 1.125rem',
                        background: isSel ? T.violet2 : 'transparent', border: 'none',
                        borderBottom: i < students.length - 1 ? `1px solid ${T.borderSoft}` : 'none',
                        cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = T.surfaceDeep; }}
                      onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ width: '32px', height: '32px', background: T.violet, border: `2px solid ${T.deep}30`, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: '0.9rem', color: T.deep }}>{s.name.charAt(0)}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', fontWeight: 600, color: T.ink }}>{s.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                            {s.name === 'Alex García' && isAlexLive && (
                              <motion.span animate={{ opacity: [1, 0.25, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}
                                style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                            )}
                            <span style={{
                              fontFamily: "'DM Sans', sans-serif", fontSize: '0.66rem', fontWeight: 700,
                              background: s.name === 'Alex García' && isAlexLive ? T.successSoft : st.bg,
                              color: s.name === 'Alex García' && isAlexLive ? T.success : st.color,
                              padding: '2px 7px', borderRadius: '4px',
                            }}>
                              {s.name === 'Alex García' && isAlexLive ? 'En sesión' : st.label}
                            </span>
                          </div>
                        </div>
                        <div style={{ width: '100%', height: '5px', background: T.surfaceDeep, borderRadius: '2px', marginBottom: '0.2rem' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: s.status === 'done' ? T.success : T.accent, borderRadius: '2px', transition: 'width 0.5s ease' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: T.soft }}>{s.progress}/{s.total} preguntas</span>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: T.soft }}>{s.minutesActive} min</span>
                        </div>
                      </div>
                      <ChevronRight size={13} color={T.soft} style={{ transform: isSel ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }} />
                    </motion.button>
                  );
                })}
              </motion.div>

              {/* Columna derecha */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {selectedStudent ? (
                  <motion.div key={selectedStudent.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: T.surface, border: `2px solid ${T.border}`, borderRadius: CARD_R, overflow: 'hidden', boxShadow: CARD_SHADOW }}
                  >
                    <div style={{ background: T.navBg, padding: '0.75rem 1rem' }}>
                      <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontVariationSettings: '"opsz" 72', fontSize: '1.1rem', fontWeight: 500, color: T.navText, margin: 0, letterSpacing: '-0.02em' }}>
                        {selectedStudent.name}
                      </p>
                    </div>
                    <div style={{ padding: '0.75rem 1rem' }}>
                      {[
                        { label: 'Progreso',        value: `${selectedStudent.progress}/${selectedStudent.total} preguntas` },
                        { label: 'Tiempo activo',   value: `${selectedStudent.minutesActive} min` },
                        { label: 'En este momento', value: selectedStudent.lastQuestion },
                        { label: 'Estado',          value: statusLabel[selectedStudent.status].label },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: `1px solid ${T.borderSoft}` }}>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: T.soft }}>{label}</span>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: T.ink }}>{value}</span>
                        </div>
                      ))}
                      {selectedStudent.status === 'stuck' && (
                        <div style={{ marginTop: '0.75rem', background: T.dangerSoft, borderRadius: '6px', padding: '0.5rem 0.75rem', border: `1.5px solid ${T.danger}30` }}>
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.775rem', color: T.danger, margin: 0, lineHeight: 1.5 }}>
                            Lleva más de 10 min en la misma pregunta.
                          </p>
                        </div>
                      )}
                      {selectedStudent.name === 'Alex García' && liveFeed.length > 0 && (
                        <div style={{ marginTop: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Activity size={11} color={T.success} />
                              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', fontWeight: 700, color: T.success, textTransform: 'uppercase', letterSpacing: '0.08em' }}>En directo</span>
                            </div>
                            <button onClick={() => { const k = getLastSubjectKey() ?? 'mates'; router.push(`/teacher/session?subject=${k}&student=Alex%20Garc%C3%ADa&initials=AG`); }}
                              style={{ background: 'none', border: `1.5px solid ${T.border}`, borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', fontSize: '0.68rem', color: T.deep, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                              Ver sesión →
                            </button>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {liveFeed.slice(0, 3).map((item, i) => (
                              <div key={i} style={{ fontSize: '0.72rem', color: T.gray, padding: '0.3rem 0.5rem', background: T.surfaceDeep, borderRadius: '4px', display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.action}</span>
                                <span style={{ color: T.soft, flexShrink: 0, fontSize: '0.66rem' }}>{formatTime(item.ts)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div style={{ background: T.surfaceDeep, border: `2px solid ${T.border}`, borderRadius: CARD_R, padding: '1.25rem', textAlign: 'center', boxShadow: CARD_SHADOW }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: T.soft, margin: 0 }}>Haz clic en un alumno para ver su detalle</p>
                  </div>
                )}

                {/* Errores frecuentes */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
                  style={{ background: T.surface, border: `2px solid ${T.border}`, borderRadius: CARD_R, overflow: 'hidden', boxShadow: CARD_SHADOW }}
                >
                  <div style={{ padding: '0.75rem 1rem', borderBottom: `2px solid ${T.border}`, background: T.surfaceDeep, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={13} color={T.warn} strokeWidth={2} />
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.62rem', fontWeight: 700, color: T.soft, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Errores frecuentes</p>
                  </div>
                  {errorsData.map((e, i) => (
                    <div key={i} style={{ padding: '0.75rem 1rem', borderBottom: i < errorsData.length - 1 ? `1px solid ${T.borderSoft}` : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', fontWeight: 700, color: T.deep, background: T.violet, padding: '2px 7px', borderRadius: '4px' }}>{e.question}</span>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: T.soft }}>{e.count} alumnos</span>
                      </div>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.775rem', color: T.gray, lineHeight: 1.4, margin: '0 0 0.375rem' }}>{e.pattern}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: '5px', background: T.surfaceDeep, borderRadius: '2px' }}>
                          <div style={{ height: '100%', width: `${e.pct}%`, background: T.warn, borderRadius: '2px' }} />
                        </div>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', fontWeight: 700, color: T.warn }}>{e.pct}%</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: CARD_R, background: T.navBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: `3px 3px 0 rgba(44,46,122,0.3)` }}>
              <Clock size={22} color={T.navText} strokeWidth={1.5} />
            </div>
            <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontVariationSettings: '"opsz" 72', fontSize: '1.25rem', color: T.ink, margin: '0 0 0.375rem' }}>Sin sesión activa</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', color: T.soft, margin: 0, maxWidth: '280px', lineHeight: 1.6 }}>
              Cuando los alumnos de {cls.course} {cls.section} abran una sesión de {TEACHER_SUBJECT}, verás su actividad aquí en tiempo real.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}

/* ── Página principal ── */
export default function TeacherPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<TeacherScreen>('home');
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [liveFeed, setLiveFeed] = useState(() => getFeed());
  const [isAlexLive, setIsAlexLive] = useState(false);

  useEffect(() => {
    const cleanup = onUpdate(() => {
      setLiveFeed(getFeed());
      const last = getLastActivity();
      setIsAlexLive(!!last && Date.now() - last < 90000);
    });
    const liveCheck = setInterval(() => {
      const last = getLastActivity();
      setIsAlexLive(!!last && Date.now() - last < 90000);
    }, 15000);
    return () => { cleanup(); clearInterval(liveCheck); };
  }, []);

  const logout = () => {
    clearStore();
    localStorage.removeItem('marco_role');
    router.push('/');
  };

  return (
    <BrowserChrome>
      <AnimatePresence mode="wait">
        {screen === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}
            style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
          >
            <HomeTeacher onSelect={(cls) => { setSelectedClass(cls); setScreen('dashboard'); }} logout={logout} />
          </motion.div>
        )}
        {screen === 'dashboard' && selectedClass && (
          <motion.div key="dashboard" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
          >
            <DashboardView cls={selectedClass} onBack={() => setScreen('home')} logout={logout} liveFeed={liveFeed} isAlexLive={isAlexLive} />
          </motion.div>
        )}
      </AnimatePresence>
    </BrowserChrome>
  );
}
