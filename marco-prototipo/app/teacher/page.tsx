'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, AlertTriangle, Users, TrendingUp, Clock,
  ChevronRight, Activity, Menu, Settings, Home, BarChart2, ArrowLeft,
  BookOpen, Plus, Trash2, X, Pencil, Check, FileText,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getFeed, getLastActivity, getLastSubjectKey, onUpdate, formatTime, clearStore } from '@/lib/demoStore';

/* ── Tokens ── */
const T = {
  bg: '#fafaf8', white: '#ffffff', black: '#0a0a0a',
  gray: '#6b6b6b', soft: '#9a9a96', border: '#e0dfd9',
  borderSoft: '#ebebe6', note: '#f7f6f2',
  deep: '#2c2e7a', accent: '#6366cc', violet: '#eeeefa', violet2: '#f5f5fc',
  success: '#2d6a4f', successSoft: '#e7f1ec',
  warn: '#b45309', warnSoft: '#fef3c7',
  danger: '#b91c1c', dangerSoft: '#fee2e2',
};

/* ── Datos de clases ── */
const TEACHER_SUBJECT = 'Ciencias Naturales';

interface ClassData {
  id: string; course: string; section: string;
  students: number; isLive: boolean;
  color: { text: string; border: string; hover: string; pill: string; progress: string };
}

const CLASSES: ClassData[] = [
  { id: '3eso-a', course: '3.º ESO', section: 'A', students: 24, isLive: true,
    color: { text: '#2c2e7a', border: '#c7c8f0', hover: '#eeeefa', pill: '#eeeefa', progress: '#6366cc' } },
  { id: '3eso-b', course: '3.º ESO', section: 'B', students: 22, isLive: false,
    color: { text: '#92400e', border: '#e9d598', hover: '#fef9e7', pill: '#fef3c7', progress: '#d97706' } },
  { id: '2eso-a', course: '2.º ESO', section: 'A', students: 26, isLive: false,
    color: { text: '#166534', border: '#a7f3c1', hover: '#f0fdf4', pill: '#dcfce7', progress: '#16a34a' } },
  { id: '4eso-b', course: '4.º ESO', section: 'B', students: 20, isLive: false,
    color: { text: '#9a3412', border: '#fed7aa', hover: '#fff7ed', pill: '#ffedd5', progress: '#ea580c' } },
  { id: '1bach-a', course: '1.º Bach', section: 'A', students: 18, isLive: false,
    color: { text: '#9d174d', border: '#f0abcc', hover: '#fdf2f8', pill: '#fce7f3', progress: '#db2777' } },
  { id: '2bach-b', course: '2.º Bach', section: 'B', students: 15, isLive: false,
    color: { text: '#1e3a8a', border: '#bfdbfe', hover: '#eff6ff', pill: '#dbeafe', progress: '#3b82f6' } },
];

type TeacherScreen = 'home' | 'dashboard' | 'content';

/* ── Tipos de contenido ── */
interface TeacherCuaderno { id: string; title: string; tipo: 'teoria' | 'practica'; studentAttempts: number; }
interface TeacherLeccion  { num: number; title: string; cuadernos: TeacherCuaderno[]; }
interface TeacherBloque   { num: number; title: string; lecciones: TeacherLeccion[]; }

/* ── Tipos para la creación de cuadernos ── */
interface CreationMessage { role: 'marco' | 'teacher'; text: string; }
interface LearningObjective { id: string; text: string; }

const INITIAL_CONTENT: TeacherBloque[] = [
  { num: 1, title: 'La célula y los seres vivos', lecciones: [
    { num: 1, title: 'Estructura celular', cuadernos: [
      { id: 'cn1', title: 'Procariota vs eucariota',    tipo: 'teoria',   studentAttempts: 18 },
      { id: 'cn2', title: 'Organelos celulares',         tipo: 'teoria',   studentAttempts: 12 },
      { id: 'cn3', title: 'Identifica las partes',       tipo: 'practica', studentAttempts: 9  },
    ]},
    { num: 2, title: 'División celular', cuadernos: [
      { id: 'cn4', title: 'Mitosis y meiosis',          tipo: 'teoria',   studentAttempts: 7 },
      { id: 'cn5', title: 'Fases de la mitosis',         tipo: 'practica', studentAttempts: 3 },
    ]},
  ]},
  { num: 2, title: 'Genética y herencia', lecciones: [
    { num: 3, title: 'Herencia mendeliana', cuadernos: [
      { id: 'cn6', title: 'Leyes de Mendel',            tipo: 'teoria',   studentAttempts: 5 },
      { id: 'cn7', title: 'Cuadros de Punnett',          tipo: 'practica', studentAttempts: 2 },
    ]},
    { num: 4, title: 'Mutaciones y enfermedades', cuadernos: [] },
  ]},
  { num: 3, title: 'Ecosistemas', lecciones: [
    { num: 5, title: 'Cadenas tróficas',   cuadernos: [] },
    { num: 6, title: 'Impacto humano',     cuadernos: [] },
  ]},
];

/* ── Browser chrome ── */
function BrowserChrome({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="bc-outer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(135deg, #d4d3d0 0%, #c8c7c4 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      <motion.div
        className="bc-inner"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%', maxWidth: '1080px',
          height: 'calc(100vh - 4rem)', maxHeight: '720px',
          background: T.white, borderRadius: '12px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.28)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        <div className="bc-bar" style={{
          background: '#ebebeb', borderBottom: '1px solid #d0d0d0',
          padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0,
        }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
          ))}
          <div style={{
            flex: 1, maxWidth: '420px', margin: '0 auto',
            background: '#ffffff', border: '1px solid #c8c8c8',
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

/* ── NavWordmark ── */
function NavWordmark({ clipId = 'tNavArco' }: { clipId?: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ zoom: 0.65, lineHeight: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`nav-brand${hovered ? ' nb-active' : ''}`} aria-label="Marco" style={{ color: T.black }}>
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
            <defs>
              <clipPath id={clipId}>
                <rect className="nb-arco-clip" x="190" y="78" width="64" height="54"/>
              </clipPath>
            </defs>
            <g clipPath={`url(#${clipId})`}>
              <text x="190" y="114" className="nb-arco">arco</text>
            </g>
            <text x="175" y="119" className="nb-mark nb-mark-sigma" textAnchor="middle">&#x03A3;</text>
          </svg>
        </span>
      </div>
    </div>
  );
}

/* ── Sidebar ── */
function TeacherSidebar({
  open, onClose, onLogout, onContent, onHome, activeItem = 'home',
}: {
  open: boolean; onClose: () => void; onLogout: () => void;
  onContent?: () => void; onHome?: () => void; activeItem?: 'home' | 'content';
}) {
  const navItems = [
    { label: 'Mis clases',         icon: Home,          key: 'home'    as const, onClick: () => { onHome?.(); onClose(); } },
    { label: 'Contenido',          icon: BookOpen,      key: 'content' as const, onClick: () => { onContent?.(); onClose(); } },
    { label: 'Alumnos',            icon: Users,         key: null,               onClick: onClose },
    { label: 'Errores frecuentes', icon: AlertTriangle, key: null,               onClick: onClose },
    { label: 'Estadísticas',       icon: BarChart2,     key: null,               onClick: onClose },
  ];
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="sb-bg"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.16)', zIndex: 100 }}
          />
          <motion.div key="sb-panel"
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 38, mass: 0.8 }}
            style={{
              position: 'absolute', top: 0, left: 0, bottom: 0, width: '220px', zIndex: 101,
              background: T.white, borderRight: `1px solid ${T.border}`,
              boxShadow: '4px 0 28px rgba(0,0,0,0.09)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 0.875rem', height: '50px', flexShrink: 0,
              borderBottom: `1px solid ${T.borderSoft}`,
            }}>
              <button onClick={onClose} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: T.soft, padding: '7px', borderRadius: '8px',
                display: 'flex', transition: 'background 0.12s, color 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = T.note; e.currentTarget.style.color = T.black; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = T.soft; }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              <NavWordmark clipId="sbTeacherArco" />
            </div>
            <nav style={{ flex: 1, padding: '0.5rem 0.625rem', overflowY: 'auto' }}>
              {navItems.map(({ label, icon: Icon, key, onClick }) => {
                const active = key !== null && key === activeItem;
                return (
                  <button key={label} onClick={onClick} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.5rem 0.75rem', borderRadius: '10px',
                    background: active ? T.violet : 'none', border: 'none', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem',
                    fontWeight: active ? 500 : 400,
                    color: active ? T.deep : T.gray,
                    textAlign: 'left', transition: 'background 0.12s, color 0.12s', marginBottom: '2px',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = T.note; e.currentTarget.style.color = T.black; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = T.gray; } }}
                  >
                    <Icon size={15} strokeWidth={1.75} />
                    {label}
                  </button>
                );
              })}
            </nav>
            <div style={{ padding: '0.875rem', borderTop: `1px solid ${T.borderSoft}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: T.violet, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: '0.875rem', color: T.deep }}>M</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 500, color: T.black, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Prof. M. González</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: T.soft, margin: 0 }}>{TEACHER_SUBJECT}</p>
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.soft, display: 'flex', padding: '4px', borderRadius: '6px', transition: 'background 0.12s, color 0.12s', flexShrink: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.note; e.currentTarget.style.color = T.gray; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = T.soft; }}
                >
                  <Settings size={14} strokeWidth={1.75} />
                </button>
              </div>
              <button onClick={onLogout} style={{
                width: '100%', padding: '0.4rem 0.75rem',
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: T.danger,
                background: 'none', border: 'none', cursor: 'pointer',
                borderRadius: '8px', textAlign: 'left', transition: 'background 0.12s',
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

/* ── HomeTeacher ── */
function HomeTeacher({
  onSelect, logout, onContent, onViewContent,
}: {
  onSelect: (cls: ClassData) => void;
  logout: () => void;
  onContent: () => void;
  onViewContent: (cls: ClassData) => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState<ClassData | null>(null);
  const SPRING = { type: 'spring' as const, stiffness: 500, damping: 32 };

  const liveStudents = studentsData.filter(s => s.status === 'active' || s.status === 'done').length;
  const stuckStudents = studentsData.filter(s => s.status === 'stuck').length;
  const avgPct = Math.round(studentsData.reduce((a, s) => a + (s.progress / s.total) * 100, 0) / studentsData.length);

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <TeacherSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={logout} onContent={onContent} activeItem="home" />

      <div style={{
        background: T.white, borderBottom: `1px solid ${T.border}`,
        padding: '0 1.25rem', display: 'flex', alignItems: 'center',
        height: '50px', flexShrink: 0, position: 'relative',
      }}>
        <button onClick={() => setSidebarOpen(s => !s)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '7px', borderRadius: '8px', display: 'flex',
          color: T.black, transition: 'background 0.12s', zIndex: 1,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = T.note)}
        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <Menu size={18} strokeWidth={1.75} />
        </button>
        <div style={{ marginLeft: 'auto', zIndex: 1 }}>
          <NavWordmark clipId="homeTeacherArco" />
        </div>
      </div>

      <div className="mobile-stack" style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

        {/* Izquierda: grid de grupos */}
        <div className="panel-left" style={{
          flex: '0 0 55%', overflowY: 'auto',
          padding: '1.125rem 1rem 1.25rem 1.25rem',
          borderRight: `1px solid ${T.borderSoft}`,
        }}>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
            <div style={{ marginBottom: '1rem' }}>
              <h1 style={{
                fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic',
                fontVariationSettings: '"opsz" 72',
                fontSize: '1.5rem', fontWeight: 500, color: T.black,
                letterSpacing: '-0.025em', margin: '0 0 0.2rem',
              }}>
                {TEACHER_SUBJECT}
              </h1>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: T.soft, margin: 0 }}>
                {CLASSES.length} grupos asignados
              </p>
            </div>

            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', fontWeight: 600,
              color: T.soft, textTransform: 'uppercase', letterSpacing: '0.07em',
              margin: '0 0 0.5rem',
            }}>
              Grupos
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {CLASSES.map((cls, idx) => {
                const isActive = active?.id === cls.id;
                return (
                  <motion.button
                    key={cls.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, ...SPRING }}
                    whileHover={{ y: -2, boxShadow: `0 4px 14px ${cls.color.progress}22` }}
                    whileTap={{ scale: 0.975 }}
                    onClick={() => setActive(isActive ? null : cls)}
                    style={{
                      background: isActive ? cls.color.hover : T.white,
                      border: `1.5px solid ${isActive ? cls.color.border : T.border}`,
                      borderRadius: '14px', padding: '0.875rem',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = cls.color.border; e.currentTarget.style.background = cls.color.hover; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.white; } }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontVariationSettings: '"opsz" 72', fontSize: '1.05rem', fontWeight: 500, color: T.black, margin: '0 0 0.1rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                          {cls.course}
                        </p>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: T.soft, margin: 0 }}>
                          Grupo {cls.section}
                        </p>
                      </div>
                      <div style={{
                        width: '26px', height: '26px', borderRadius: '7px',
                        background: cls.color.pill,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: '0.85rem', color: cls.color.text }}>
                          {cls.section}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: T.soft }}>
                        {cls.students} alumnos
                      </span>
                      {cls.isLive ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <motion.span
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ repeat: Infinity, duration: 1.4 }}
                            style={{ width: 5, height: 5, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}
                          />
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.66rem', fontWeight: 500, color: T.success }}>En sesión</span>
                        </div>
                      ) : (
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.66rem', color: T.soft }}>Sin actividad</span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Derecha: panel de resumen */}
        <div className="panel-right" style={{ flex: 1, overflowY: 'auto', padding: '1.125rem 1.25rem 1.25rem 1rem' }}>
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Header con botón Ver contenido */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h2 style={{
                        fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic',
                        fontVariationSettings: '"opsz" 72',
                        fontSize: '1.4rem', fontWeight: 500, color: T.black,
                        letterSpacing: '-0.025em', margin: 0,
                      }}>
                        {active.course} {active.section}
                      </h2>
                      {active.isLive && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: T.successSoft, borderRadius: '9999px', padding: '2px 8px', flexShrink: 0 }}>
                          <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}
                            style={{ width: 5, height: 5, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', fontWeight: 500, color: T.success }}>En sesión</span>
                        </div>
                      )}
                    </div>
                    {/* Ver contenido */}
                    <button
                      onClick={() => onViewContent(active)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0,
                        background: T.violet, border: 'none', borderRadius: '8px',
                        padding: '0.3rem 0.75rem', cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 500,
                        color: T.deep, transition: 'background 0.15s, color 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = T.deep; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = T.violet; e.currentTarget.style.color = T.deep; }}
                    >
                      <BookOpen size={12} strokeWidth={2} />
                      Ver contenido
                    </button>
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: T.soft, margin: 0 }}>
                    {active.students} alumnos · {TEACHER_SUBJECT}
                  </p>
                </div>

                {/* Stats */}
                {active.isLive ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                      {[
                        { label: 'Activos',    value: `${liveStudents}/${active.students}`, color: T.deep    },
                        { label: 'Progreso',   value: `${avgPct}%`,                         color: T.accent  },
                        { label: 'Atascados',  value: stuckStudents,                         color: T.danger  },
                        { label: 'Respuestas', value: studentsData.reduce((a,s)=>a+s.progress,0), color: T.success },
                      ].map(({ label, value, color }) => (
                        <div key={label} style={{ background: T.note, borderRadius: '12px', padding: '0.75rem' }}>
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: T.soft, margin: '0 0 0.25rem' }}>{label}</p>
                          <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontVariationSettings: '"opsz" 72', fontSize: '1.4rem', fontWeight: 500, color, margin: 0, letterSpacing: '-0.025em' }}>{value}</p>
                        </div>
                      ))}
                    </div>

                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', fontWeight: 600, color: T.soft, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 0.5rem' }}>
                      Alumnos
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1.25rem' }}>
                      {studentsData.slice(0, 5).map(s => {
                        const st = { done: { label: 'Completado', color: T.success, bg: T.successSoft }, active: { label: 'Activo', color: T.deep, bg: T.violet }, stuck: { label: 'Atascado', color: T.danger, bg: T.dangerSoft }, idle: { label: 'Inactivo', color: T.soft, bg: T.note } }[s.status];
                        return (
                          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.4rem 0.625rem', background: T.white, border: `1px solid ${T.borderSoft}`, borderRadius: '10px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: T.violet, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: '0.75rem', color: T.deep }}>{s.name.charAt(0)}</span>
                            </div>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 500, color: T.black, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.66rem', fontWeight: 500, color: st.color, background: st.bg, padding: '1px 7px', borderRadius: '9999px', flexShrink: 0 }}>{st.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: T.soft, margin: '0 0 0.25rem' }}>Sin sesión activa</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.775rem', color: T.soft, margin: 0, lineHeight: 1.6 }}>
                      Los alumnos de este grupo no están trabajando ahora mismo.
                    </p>
                  </div>
                )}

                <button
                  onClick={() => onSelect(active)}
                  style={{
                    width: '100%', padding: '0.625rem 1rem',
                    background: T.deep, border: 'none', borderRadius: '12px',
                    fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', fontWeight: 500,
                    color: T.white, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  {active.isLive ? 'Ver sesión completa' : 'Abrir vista de clase'}
                  <ChevronRight size={15} strokeWidth={2} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
              >
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: T.soft, textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
                  Selecciona un grupo para ver el resumen
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard data ── */
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
  idle:   { label: 'Inactivo',   bg: T.note,        color: T.soft    },
};

/* ── DashboardView ── */
function DashboardView({
  cls, onBack, logout, onContent,
  liveFeed, isAlexLive,
}: {
  cls: ClassData; onBack: () => void; logout: () => void; onContent: () => void;
  liveFeed: ReturnType<typeof getFeed>; isAlexLive: boolean;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const students = cls.isLive ? studentsData : [];
  const totalStudents = cls.students;
  const activeCount   = students.filter(s => s.status === 'active' || s.status === 'done').length;
  const stuckCount    = students.filter(s => s.status === 'stuck').length;
  const avgProgress   = students.length
    ? Math.round(students.reduce((a, s) => a + (s.progress / s.total) * 100, 0) / students.length)
    : 0;
  const totalAnswered = students.reduce((a, s) => a + s.progress, 0);

  const selectedStudent = students.find(s => s.id === selected) ?? null;

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <TeacherSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={logout} onContent={onContent} activeItem="home" />

      <div style={{
        background: T.white, borderBottom: `1px solid ${T.border}`,
        padding: '0 1.25rem', display: 'flex', alignItems: 'center',
        height: '50px', flexShrink: 0, position: 'relative',
      }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem',
          color: T.soft, padding: '4px 0', transition: 'color 0.12s', zIndex: 1,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = T.black)}
        onMouseLeave={e => (e.currentTarget.style.color = T.soft)}
        >
          <ArrowLeft size={14} />
          Mis clases
        </button>

        <p style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic',
          fontVariationSettings: '"opsz" 72',
          fontSize: '0.9375rem', fontWeight: 500, color: T.black,
          letterSpacing: '-0.02em', margin: 0, pointerEvents: 'none',
        }}>
          {cls.course} {cls.section}
        </p>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 1 }}>
          <button onClick={logout} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '6px', borderRadius: '8px',
            color: T.soft, display: 'flex', alignItems: 'center', transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = T.black)}
          onMouseLeave={e => (e.currentTarget.style.color = T.soft)}
          >
            <LogOut size={16} strokeWidth={1.75} />
          </button>
          <NavWordmark clipId="dashTeacherArco" />
        </div>
      </div>

      <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.25rem 2rem' }}>
        <div>
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.75rem' }}>
            <h1 style={{
              fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic',
              fontVariationSettings: '"opsz" 72',
              fontSize: '1.9rem', fontWeight: 500, color: T.black,
              letterSpacing: '-0.025em', margin: '0 0 0.25rem',
            }}>
              {cls.isLive ? 'Clase en directo' : 'Sin sesión activa'}
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', color: T.soft, margin: 0 }}>
              {cls.isLive
                ? `${TEACHER_SUBJECT} — preguntas socráticas de repaso`
                : `No hay ninguna sesión activa en ${cls.course} ${cls.section} ahora mismo`}
            </p>
          </motion.div>

          {cls.isLive ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem', marginBottom: '2rem' }}>
                {[
                  { Icon: Users,         label: 'Alumnos activos', value: `${activeCount}/${totalStudents}`, color: T.deep    },
                  { Icon: TrendingUp,    label: 'Progreso medio',  value: `${avgProgress}%`,                color: T.accent  },
                  { Icon: AlertTriangle, label: 'Atascados',       value: stuckCount,                       color: T.danger  },
                  { Icon: Clock,         label: 'Respuestas hoy',  value: totalAnswered,                    color: T.success },
                ].map(({ Icon, label, value, color }, i) => (
                  <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    style={{ background: T.white, border: `1.5px solid ${T.border}`, borderRadius: '16px', padding: '1.25rem' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                      <Icon size={15} color={color} strokeWidth={1.75} />
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: T.soft }}>{label}</span>
                    </div>
                    <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontVariationSettings: '"opsz" 72', fontSize: '1.75rem', fontWeight: 500, color, margin: 0, letterSpacing: '-0.025em' }}>
                      {value}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem' }}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                  style={{ background: T.white, border: `1.5px solid ${T.border}`, borderRadius: '20px', overflow: 'hidden' }}
                >
                  <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${T.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', fontWeight: 600, color: T.black, margin: 0 }}>Alumnos</h2>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: T.soft }}>{totalStudents} en clase</span>
                  </div>

                  {students.map((s, i) => {
                    const st = statusLabel[s.status];
                    const pct = Math.round((s.progress / s.total) * 100);
                    const isSel = selected === s.id;
                    return (
                      <motion.button key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                        onClick={() => setSelected(isSel ? null : s.id)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: '1rem',
                          padding: '0.875rem 1.25rem',
                          background: isSel ? T.violet2 : 'transparent', border: 'none',
                          borderBottom: i < students.length - 1 ? `1px solid ${T.borderSoft}` : 'none',
                          cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = T.note; }}
                        onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div style={{ width: '36px', height: '36px', background: T.violet, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: '1rem', color: T.deep }}>{s.name.charAt(0)}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', fontWeight: 500, color: T.black }}>{s.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                              {s.name === 'Alex García' && isAlexLive && (
                                <motion.span animate={{ opacity: [1, 0.25, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}
                                  style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                              )}
                              <span style={{
                                fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', fontWeight: 500,
                                background: s.name === 'Alex García' && isAlexLive ? T.successSoft : st.bg,
                                color: s.name === 'Alex García' && isAlexLive ? T.success : st.color,
                                padding: '2px 8px', borderRadius: '9999px',
                              }}>
                                {s.name === 'Alex García' && isAlexLive ? 'En sesión' : st.label}
                              </span>
                            </div>
                          </div>
                          <div style={{ width: '100%', height: '4px', background: T.borderSoft, borderRadius: '9999px', marginBottom: '0.25rem' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: s.status === 'done' ? T.success : T.accent, borderRadius: '9999px', transition: 'width 0.5s ease' }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: T.soft }}>{s.progress}/{s.total} preguntas</span>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: T.soft }}>{s.minutesActive} min activo</span>
                          </div>
                        </div>
                        <ChevronRight size={14} color={T.soft} style={{ transform: isSel ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
                      </motion.button>
                    );
                  })}
                </motion.div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {selectedStudent ? (
                    <motion.div key={selectedStudent.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      style={{ background: T.white, border: `1.5px solid ${T.border}`, borderRadius: '20px', padding: '1.25rem' }}
                    >
                      <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontVariationSettings: '"opsz" 72', fontSize: '1.2rem', fontWeight: 500, color: T.black, margin: '0 0 0.875rem', letterSpacing: '-0.025em' }}>
                        {selectedStudent.name}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {[
                          { label: 'Progreso',        value: `${selectedStudent.progress}/${selectedStudent.total} preguntas` },
                          { label: 'Tiempo activo',   value: `${selectedStudent.minutesActive} min` },
                          { label: 'En este momento', value: selectedStudent.lastQuestion },
                          { label: 'Estado',          value: statusLabel[selectedStudent.status].label },
                        ].map(({ label, value }) => (
                          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${T.borderSoft}` }}>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: T.soft }}>{label}</span>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 500, color: T.black }}>{value}</span>
                          </div>
                        ))}
                      </div>
                      {selectedStudent.status === 'stuck' && (
                        <div style={{ marginTop: '0.875rem', background: T.dangerSoft, borderRadius: '10px', padding: '0.625rem 0.875rem' }}>
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: T.danger, margin: 0, lineHeight: 1.5 }}>
                            Lleva más de 10 min en la misma pregunta. Puede necesitar ayuda.
                          </p>
                        </div>
                      )}
                      {selectedStudent.name === 'Alex García' && liveFeed.length > 0 && (
                        <div style={{ marginTop: '0.875rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Activity size={11} color={T.success} />
                              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: T.success }}>Actividad reciente</span>
                            </div>
                            <button onClick={() => { const k = getLastSubjectKey() ?? 'mates'; router.push(`/teacher/session?subject=${k}&student=Alex%20Garc%C3%ADa&initials=AG`); }}
                              style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: '8px', padding: '2px 8px', cursor: 'pointer', fontSize: '0.7rem', color: T.deep, fontFamily: "'DM Sans', sans-serif" }}>
                              Ver sesión →
                            </button>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            {liveFeed.slice(0, 3).map((item, i) => (
                              <div key={i} style={{ fontSize: '0.75rem', color: T.gray, lineHeight: 1.4, padding: '0.35rem 0.5rem', background: T.note, borderRadius: '6px', display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.action}</span>
                                <span style={{ color: T.soft, flexShrink: 0, fontSize: '0.68rem' }}>{formatTime(item.ts)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div style={{ background: T.note, border: `1.5px solid ${T.borderSoft}`, borderRadius: '20px', padding: '1.5rem', textAlign: 'center' }}>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: T.soft, margin: 0 }}>
                        Haz clic en un alumno para ver su detalle
                      </p>
                    </div>
                  )}

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
                    style={{ background: T.white, border: `1.5px solid ${T.border}`, borderRadius: '20px', overflow: 'hidden' }}
                  >
                    <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${T.borderSoft}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertTriangle size={14} color={T.warn} strokeWidth={1.75} />
                      <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', fontWeight: 600, color: T.black, margin: 0 }}>Errores frecuentes</h2>
                    </div>
                    {errorsData.map((e, i) => (
                      <div key={i} style={{ padding: '0.875rem 1.25rem', borderBottom: i < errorsData.length - 1 ? `1px solid ${T.borderSoft}` : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 500, color: T.deep, background: T.violet, padding: '2px 8px', borderRadius: '9999px' }}>{e.question}</span>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: T.soft }}>{e.count} alumnos</span>
                        </div>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', color: T.gray, lineHeight: 1.45, margin: '0 0 0.375rem' }}>{e.pattern}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ flex: 1, height: '3px', background: T.borderSoft, borderRadius: '9999px' }}>
                            <div style={{ height: '100%', width: `${e.pct}%`, background: T.warn, borderRadius: '9999px' }} />
                          </div>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: T.soft }}>{e.pct}%</span>
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
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: T.violet, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Clock size={22} color={T.deep} strokeWidth={1.5} />
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', fontWeight: 500, color: T.black, margin: '0 0 0.375rem' }}>
                Sin sesión activa
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', color: T.soft, margin: 0, maxWidth: '280px', lineHeight: 1.6 }}>
                Cuando los alumnos de {cls.course} {cls.section} abran una sesión de {TEACHER_SUBJECT}, verás su actividad aquí en tiempo real.
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ── CuadernoCreationPanel ── */
function CuadernoCreationPanel({
  leccion, bloque, activeCls, onClose, onCreate,
}: {
  leccion: TeacherLeccion;
  bloque: TeacherBloque;
  activeCls: ClassData;
  onClose: () => void;
  onCreate: (cuaderno: Omit<TeacherCuaderno, 'studentAttempts'>) => void;
}) {
  const [step, setStep] = useState<'material' | 'objetivos'>('material');
  const [title, setTitle] = useState('');
  const [tipo, setTipo] = useState<'teoria' | 'practica'>('teoria');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [messages, setMessages] = useState<CreationMessage[]>([]);
  const [objectives, setObjectives] = useState<LearningObjective[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [marcoPhase, setMarcoPhase] = useState(0);
  const [isMarcoTyping, setIsMarcoTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step !== 'objetivos') return;
    setIsMarcoTyping(true);
    const t = setTimeout(() => {
      setMessages([{
        role: 'marco',
        text: `¡Vamos allá! Para diseñar las preguntas de "${title}", necesito entender qué quieres que los alumnos asimilen. ¿Cuál es el concepto central de esta lección?`,
      }]);
      setMarcoPhase(1);
      setIsMarcoTyping(false);
    }, 500);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isMarcoTyping]);

  const handleFile = (file: File) => {
    if (file.type === 'application/pdf' || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      setFileName(file.name);
    }
  };

  const marcoScript: Array<(msg: string) => { text: string; objective?: string }> = [
    (msg) => ({
      text: `Bien anotado. ¿Cuáles son los errores más habituales que cometen tus alumnos con este tema? Así Marco evitará reforzar malentendidos y los cuestionará directamente.`,
      objective: msg.trim(),
    }),
    () => ({
      text: `Perfecto, lo tendré en cuenta. Última pregunta: ¿qué debería ser capaz de explicar o demostrar un alumno que haya comprendido bien este cuaderno?`,
    }),
    (msg) => ({
      text: `Listo. He definido los criterios de comprensión. Revísalos a la derecha; puedes ajustarlos antes de crear el cuaderno.`,
      objective: msg.trim(),
    }),
  ];

  const sendMessage = () => {
    if (!chatInput.trim() || isMarcoTyping || marcoPhase > 3) return;
    const userMsg = chatInput.trim();
    setMessages(prev => [...prev, { role: 'teacher', text: userMsg }]);
    setChatInput('');
    const idx = marcoPhase - 1;
    if (idx >= 0 && idx < marcoScript.length) {
      const { text, objective } = marcoScript[idx](userMsg);
      setIsMarcoTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'marco', text }]);
        if (objective) setObjectives(prev => [...prev, { id: `obj-${Date.now()}`, text: objective }]);
        setMarcoPhase(p => p + 1);
        setIsMarcoTyping(false);
      }, 800);
    }
  };

  const stepDone = marcoPhase > 3;
  const tipoMeta = {
    teoria:   { Icon: BookOpen, label: 'Teoría',   desc: 'Lectura, conceptos y definiciones', accent: T.accent,  bg: T.violet,  border: '#c7c8f0' },
    practica: { Icon: Pencil,   label: 'Práctica', desc: 'Ejercicios y aplicación práctica',  accent: '#c2410c', bg: '#fff7ed', border: '#fed7aa' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      {/* Step indicator bar */}
      <div style={{
        padding: '0 1.25rem', borderBottom: `1px solid ${T.borderSoft}`,
        display: 'flex', alignItems: 'center', gap: '0', height: '38px', flexShrink: 0,
        background: T.note,
      }}>
        {([
          { key: 'material', num: '1', label: 'Material' },
          { key: 'objetivos', num: '2', label: 'Objetivos' },
        ] as const).map((s, i) => {
          const active = step === s.key;
          const done = step === 'objetivos' && s.key === 'material';
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && <div style={{ width: 28, height: 1.5, background: done ? T.deep : T.borderSoft, transition: 'background 0.3s' }} />}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: active ? T.deep : done ? T.success : T.borderSoft,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {done
                    ? <Check size={10} color="#fff" strokeWidth={2.5} />
                    : <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.58rem', fontWeight: 700, color: active ? '#fff' : T.soft }}>{s.num}</span>
                  }
                </div>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', fontWeight: active ? 600 : 400, color: active ? T.black : T.soft, transition: 'color 0.2s' }}>
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === 'material' ? (
          /* ── Step 1: Material (two-column) ── */
          <motion.div key="step-material"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            style={{ flex: 1, overflow: 'hidden', display: 'flex' }}
          >
            {/* Left: form */}
            <div style={{ flex: '0 0 52%', overflowY: 'auto', padding: '1.75rem 1.5rem', borderRight: `1px solid ${T.border}` }}>

              <div style={{ marginBottom: '1.375rem' }}>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: T.gray, display: 'block', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Título
                </label>
                <input
                  value={title} onChange={e => setTitle(e.target.value)} autoFocus
                  placeholder="Ej. Procariota vs eucariota"
                  style={{
                    width: '100%', padding: '0.625rem 0.875rem',
                    fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: T.black,
                    background: T.white, border: `1.5px solid ${T.border}`,
                    borderRadius: '10px', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.violet}`; }}
                  onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
                  onKeyDown={e => e.key === 'Enter' && title.trim() && setStep('objetivos')}
                />
              </div>

              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: T.gray, display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Tipo de cuaderno
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                  {(['teoria', 'practica'] as const).map(t => {
                    const m = tipoMeta[t];
                    const sel = tipo === t;
                    return (
                      <button key={t} onClick={() => setTipo(t)} style={{
                        padding: '0.875rem', borderRadius: '14px',
                        border: `2px solid ${sel ? m.border : T.border}`,
                        background: sel ? m.bg : T.white,
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.15s', outline: 'none',
                      }}
                      onMouseEnter={e => { if (!sel) { e.currentTarget.style.borderColor = m.border; e.currentTarget.style.background = m.bg; } }}
                      onMouseLeave={e => { if (!sel) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.white; } }}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: '8px',
                          background: sel ? 'rgba(255,255,255,0.7)' : T.note,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginBottom: '0.625rem', transition: 'background 0.15s',
                        }}>
                          <m.Icon size={15} color={sel ? m.accent : T.soft} strokeWidth={1.75} />
                        </div>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', fontWeight: 600, color: sel ? T.black : T.gray, margin: '0 0 0.2rem', transition: 'color 0.15s' }}>
                          {m.label}
                        </p>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: T.soft, margin: 0, lineHeight: 1.4 }}>
                          {m.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => setStep('objetivos')}
                disabled={!title.trim()}
                style={{
                  width: '100%', padding: '0.6875rem',
                  background: title.trim() ? T.deep : T.note,
                  color: title.trim() ? '#fff' : T.soft,
                  border: 'none', borderRadius: '12px',
                  cursor: title.trim() ? 'pointer' : 'default',
                  fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', fontWeight: 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                  transition: 'background 0.15s, color 0.15s, opacity 0.15s',
                }}
                onMouseEnter={e => { if (title.trim()) e.currentTarget.style.opacity = '0.88'; }}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Continuar <ChevronRight size={15} strokeWidth={2} />
              </button>
            </div>

            {/* Right: file upload */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.75rem 1.5rem', background: T.bg }}>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: T.gray, display: 'block', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Material de referencia <span style={{ fontWeight: 400, color: T.soft, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
              </label>
              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

              {fileName ? (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                    padding: '1rem 1.125rem',
                    background: T.white, border: `1.5px solid ${T.border}`,
                    borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '9px', background: T.violet, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BookOpen size={17} color={T.deep} strokeWidth={1.75} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', fontWeight: 500, color: T.black, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: T.soft, margin: 0 }}>Listo para analizar</p>
                  </div>
                  <button onClick={() => setFileName(null)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: T.soft,
                    display: 'flex', padding: '4px', borderRadius: '6px', transition: 'color 0.12s, background 0.12s', flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = T.danger; e.currentTarget.style.background = T.dangerSoft; }}
                  onMouseLeave={e => { e.currentTarget.style.color = T.soft; e.currentTarget.style.background = 'none'; }}
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; f && handleFile(f); }}
                  style={{
                    flex: 1, border: `2px dashed ${isDragging ? T.accent : T.border}`,
                    borderRadius: '16px', cursor: 'pointer',
                    background: isDragging ? T.violet : T.white,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '2rem', textAlign: 'center', transition: 'all 0.15s',
                  }}
                >
                  {/* Document SVG */}
                  <div style={{ width: 52, height: 52, borderRadius: '14px', background: isDragging ? 'rgba(255,255,255,0.8)' : T.note, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', transition: 'background 0.15s' }}>
                    <svg width="24" height="28" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="1" y="1" width="16" height="22" rx="2.5" stroke={isDragging ? T.accent : T.soft} strokeWidth="1.5"/>
                      <line x1="5" y1="8" x2="13" y2="8" stroke={isDragging ? T.accent : T.soft} strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="5" y1="12" x2="13" y2="12" stroke={isDragging ? T.accent : T.soft} strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="5" y1="16" x2="10" y2="16" stroke={isDragging ? T.accent : T.soft} strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', fontWeight: 500, color: isDragging ? T.deep : T.black, margin: '0 0 0.375rem', transition: 'color 0.15s' }}>
                    Sube el material de clase
                  </p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.775rem', color: T.soft, margin: '0 0 1.25rem', lineHeight: 1.55, maxWidth: '200px' }}>
                    Marco lo analizará para generar preguntas más relevantes al contenido
                  </p>
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    {['PDF', 'DOCX'].map(ext => (
                      <span key={ext} style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', fontWeight: 600,
                        color: T.soft, background: T.note, padding: '2px 8px', borderRadius: '9999px',
                        letterSpacing: '0.04em',
                      }}>{ext}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* ── Step 2: Objetivos (chat + criterios) ── */
          <motion.div key="step-objetivos"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            style={{ flex: 1, overflow: 'hidden', display: 'flex' }}
          >
            {/* Chat */}
            <div style={{ flex: '0 0 56%', display: 'flex', flexDirection: 'column', borderRight: `1px solid ${T.border}`, background: T.bg }}>
              <div style={{ padding: '0.625rem 1rem 0.625rem 1.125rem', borderBottom: `1px solid ${T.borderSoft}`, flexShrink: 0, background: T.white }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', fontWeight: 600, color: T.soft, textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
                  Define los objetivos con Marco
                </p>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '1.125rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', flexDirection: m.role === 'marco' ? 'row' : 'row-reverse' }}>
                    {m.role === 'marco' && (
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: T.deep, border: `1.5px solid ${T.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px',
                        boxShadow: '0 2px 6px rgba(44,46,122,0.18)',
                      }}>
                        <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: '0.85rem', color: '#fff' }}>M</span>
                      </div>
                    )}
                    <div style={{
                      maxWidth: '80%', padding: '0.625rem 0.875rem',
                      borderRadius: m.role === 'marco' ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                      background: m.role === 'marco' ? T.white : T.deep,
                      border: m.role === 'marco' ? `1px solid ${T.borderSoft}` : 'none',
                      boxShadow: m.role === 'marco' ? '0 1px 4px rgba(0,0,0,0.06)' : '0 2px 8px rgba(44,46,122,0.2)',
                      fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem',
                      color: m.role === 'marco' ? T.black : '#fff',
                      lineHeight: 1.55,
                    }}>
                      {m.text}
                    </div>
                  </div>
                ))}

                {isMarcoTyping && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: T.deep, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 6px rgba(44,46,122,0.18)' }}>
                      <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: '0.85rem', color: '#fff' }}>M</span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', padding: '0.625rem 0.875rem', background: T.white, border: `1px solid ${T.borderSoft}`, borderRadius: '4px 14px 14px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                      {[0, 1, 2].map(i => (
                        <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                          style={{ width: 5, height: 5, borderRadius: '50%', background: T.soft, display: 'inline-block' }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div style={{ padding: '0.75rem', borderTop: `1px solid ${T.border}`, display: 'flex', gap: '0.5rem', flexShrink: 0, background: T.white }}>
                <input
                  value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder={stepDone ? 'Conversación completada' : 'Escribe tu respuesta...'}
                  disabled={isMarcoTyping || stepDone}
                  style={{
                    flex: 1, padding: '0.5rem 0.875rem',
                    fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', color: T.black,
                    background: T.white, border: `1.5px solid ${T.border}`,
                    borderRadius: '10px', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                    opacity: (isMarcoTyping || stepDone) ? 0.5 : 1,
                  }}
                  onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.violet}`; }}
                  onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
                />
                <button onClick={sendMessage} disabled={!chatInput.trim() || isMarcoTyping || stepDone}
                  style={{
                    padding: '0.5rem 0.875rem',
                    background: chatInput.trim() && !isMarcoTyping && !stepDone ? T.deep : T.note,
                    color: chatInput.trim() && !isMarcoTyping && !stepDone ? '#fff' : T.soft,
                    border: 'none', borderRadius: '10px',
                    cursor: chatInput.trim() && !isMarcoTyping && !stepDone ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', transition: 'all 0.12s',
                  }}
                >
                  <ChevronRight size={16} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Criterios */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '0.625rem 1rem', borderBottom: `1px solid ${T.borderSoft}`, flexShrink: 0 }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', fontWeight: 600, color: T.soft, textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
                  Criterios de comprensión
                </p>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <AnimatePresence>
                  {objectives.length === 0 ? (
                    <motion.div key="empty-obj" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ padding: '1.5rem 0', textAlign: 'center' }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: '10px', background: T.note, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                        <Check size={16} color={T.soft} strokeWidth={1.75} />
                      </div>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: T.soft, lineHeight: 1.6, margin: 0 }}>
                        Los criterios aparecerán aquí según respondas a Marco
                      </p>
                    </motion.div>
                  ) : (
                    objectives.map((obj, i) => (
                      <motion.div key={obj.id}
                        initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
                          padding: '0.75rem 0.875rem',
                          background: T.white, border: `1.5px solid ${T.border}`,
                          borderRadius: '12px', borderLeft: `3px solid ${T.success}`,
                          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        }}
                      >
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: T.successSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                          <Check size={10} color={T.success} strokeWidth={2.5} />
                        </div>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: T.black, margin: 0, flex: 1, lineHeight: 1.5 }}>
                          {obj.text}
                        </p>
                        <button onClick={() => setObjectives(prev => prev.filter(o => o.id !== obj.id))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.soft, padding: '2px', borderRadius: '4px', display: 'flex', flexShrink: 0, transition: 'color 0.12s' }}
                          onMouseEnter={e => (e.currentTarget.style.color = T.danger)}
                          onMouseLeave={e => (e.currentTarget.style.color = T.soft)}
                        >
                          <X size={12} />
                        </button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              <div style={{ padding: '0.875rem', borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
                <button
                  onClick={() => onCreate({ id: `new-${Date.now()}`, title, tipo })}
                  disabled={objectives.length === 0}
                  style={{
                    width: '100%', padding: '0.6875rem',
                    background: objectives.length > 0 ? T.deep : T.note,
                    color: objectives.length > 0 ? '#fff' : T.soft,
                    border: 'none', borderRadius: '12px',
                    cursor: objectives.length > 0 ? 'pointer' : 'default',
                    fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', fontWeight: 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (objectives.length > 0) e.currentTarget.style.opacity = '0.88'; }}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  {objectives.length > 0 && <Check size={15} strokeWidth={2} />}
                  Crear cuaderno
                </button>
                {objectives.length === 0 && (
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: T.soft, textAlign: 'center', margin: '0.5rem 0 0' }}>
                    Responde a Marco para definir al menos un criterio
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Analytics mock data ── */
const HEAT_SECTIONS = {
  teoria: [
    { title: 'Introducción y contexto', pct: 18, count: 4 },
    { title: 'Concepto central',        pct: 74, count: 17 },
    { title: 'Tipos y subtipos',        pct: 88, count: 21 },
    { title: 'Diferencias clave',       pct: 61, count: 14 },
    { title: 'Ejemplos prácticos',      pct: 39, count: 9  },
    { title: 'Síntesis',                pct: 23, count: 5  },
  ],
  practica: [
    { title: 'Ej. 1 — Reconocimiento', pct: 28, count: 6  },
    { title: 'Ej. 2 — Clasificación',  pct: 64, count: 15 },
    { title: 'Ej. 3 — Comparación',    pct: 91, count: 22 },
    { title: 'Ej. 4 — Análisis',       pct: 73, count: 17 },
    { title: 'Ej. 5 — Aplicación',     pct: 46, count: 11 },
  ],
};

const MARCO_INSIGHTS = {
  teoria: {
    dificultades: [
      'El 88% necesitó más de 2 intentos en "Tipos y subtipos" — es la principal barrera del cuaderno.',
      'El vocabulario de la sección 4 genera bloqueos en el 61% antes de que puedan avanzar.',
    ],
    fluido: [
      'La introducción se asimila sin problemas — solo el 18% requirió aclaración adicional.',
      'Una vez superada la parte central, el 77% completa la síntesis sin incidencias.',
    ],
    patrones: [
      'Los alumnos que se atascan en "Tipos y subtipos" tienden a tener dificultades también en las diferencias clave.',
      'Correlación detectada: velocidad alta en el concepto central → finalización fluida del cuaderno.',
    ],
  },
  practica: {
    dificultades: [
      'El ejercicio de comparación concentra el 91% de los intentos fallidos — la instrucción puede ser ambigua.',
      'El 73% abandona temporalmente en el ej. 4 antes de volver a intentarlo.',
    ],
    fluido: [
      'El reconocimiento (ej. 1) actúa como buen calentamiento — el 72% lo resuelve al primer intento.',
      'Los alumnos que superan el ej. 3 completan el resto sin ninguna incidencia posterior.',
    ],
    patrones: [
      'Patrón de bloqueo en ej. 3: intentan, fallan, y pausan en promedio 8 minutos antes de reintentar.',
      'El tiempo medio de finalización es 2.8× mayor que en cuadernos de teoría del mismo bloque.',
    ],
  },
};

const MOCK_STRUGGLING = [
  { name: 'María López', initial: 'M', progress: 3, total: 6, stuckAt: 'Tipos y subtipos', mins: 12 },
  { name: 'Ana Martín',  initial: 'A', progress: 1, total: 6, stuckAt: 'Concepto central', mins: 18 },
  { name: 'Lucía Pérez', initial: 'L', progress: 2, total: 6, stuckAt: 'Concepto central', mins: 9  },
];

const MOCK_EXCELLING = [
  { name: 'Carlos Ruiz',    initial: 'C', progress: 6, total: 6, time: '14 min' },
  { name: 'Sara Fernández', initial: 'S', progress: 5, total: 6, time: '18 min' },
];

function heatColor(pct: number) {
  if (pct < 36) return { bar: '#16a34a', label: '#15803d', soft: T.successSoft };
  if (pct < 62) return { bar: '#d97706', label: '#b45309', soft: T.warnSoft    };
  if (pct < 80) return { bar: '#f97316', label: '#c2410c', soft: '#fff7ed'     };
  return              { bar: '#dc2626', label: T.danger,  soft: T.dangerSoft  };
}

const PDF_CONTENT: Record<'teoria' | 'practica', string[][]> = {
  teoria: [
    [
      'Todos los seres vivos están formados por células. Desde la bacteria más sencilla hasta el organismo humano, la célula es la unidad estructural y funcional de la vida.',
      'A lo largo del siglo XIX, los científicos Schleiden, Schwann y Virchow sentaron las bases de la teoría celular: todo ser vivo está compuesto por células, y toda célula proviene de otra célula preexistente.',
      'No obstante, no todas las células son iguales. Existen dos grandes categorías que difieren radicalmente en su organización interna.',
    ],
    [
      'La distinción fundamental entre células procariotas y eucariotas radica en la organización del material genético.',
      'Las células eucariotas poseen un núcleo verdadero (eu = verdadero, karyon = núcleo), delimitado por una doble membrana denominada envoltura nuclear. Dentro de él, el ADN se organiza en cromosomas lineales asociados a proteínas histonas.',
      'Las células procariotas, en cambio, carecen de núcleo definido (pro = antes de, karyon = núcleo). Su material genético —generalmente un único cromosoma circular— se localiza en el citoplasma en una región denominada nucleoide, sin membrana que lo delimite.',
      'Esta diferencia no es solo estructural: tiene profundas implicaciones en los procesos de transcripción, traducción y replicación del ADN.',
    ],
    [
      'Las células procariotas comprenden dos dominios: Bacteria y Archaea. Aunque ambas carecen de núcleo, difieren en la composición de su membrana y pared celular.',
      'Las células eucariotas se dividen en dos grandes subtipos con diferencias estructurales importantes:',
      '· Eucariotas animales: sin pared celular, sin cloroplastos, con centrosomas que organizan el huso mitótico.',
      '· Eucariotas vegetales: pared celular de celulosa, cloroplastos para la fotosíntesis, vacuola central de gran tamaño.',
      'Los hongos y los protistas son también eucariotas, con características propias que los distinguen de animales y plantas.',
    ],
    [
      '· Tamaño: procariotas 1–10 μm; eucariotas 10–100 μm.',
      '· Núcleo: ausente en procariotas (nucleoide libre); presente en eucariotas (con envoltura nuclear).',
      '· Orgánulos membranosos: inexistentes en procariotas; presentes en eucariotas (mitocondrias, retículo endoplasmático, aparato de Golgi).',
      '· Ribosomas: 70S en procariotas; 80S en el citoplasma eucariota.',
      '· División celular: fisión binaria en procariotas; mitosis o meiosis en eucariotas.',
    ],
    [
      'Procariotas: Escherichia coli (flora intestinal, síntesis de vitamina K), Lactobacillus acidophilus (fermentación láctica), Streptococcus pneumoniae (patógeno respiratorio).',
      'Eucariotas animales: neuronas humanas, eritrocitos, células musculares esqueléticas.',
      'Eucariotas vegetales: células del mesófilo foliar (ricas en cloroplastos), células del floema, epidermis vegetal.',
      'Eucariotas fúngicos: Saccharomyces cerevisiae, empleada en la fermentación de pan y cerveza.',
    ],
    [
      'La separación entre procariotas y eucariotas es uno de los grandes saltos evolutivos de la historia de la vida, ocurrido hace aproximadamente 1.800 millones de años.',
      'Esta distinción tiene aplicaciones prácticas directas: los antibióticos que bloquean la síntesis de la pared bacteriana (penicilina) o los ribosomas 70S (estreptomicina) no afectan a las células humanas eucariotas.',
      'En síntesis: procariota = sin núcleo verdadero, sin orgánulos membranosos, menor tamaño. Eucariota = núcleo delimitado, orgánulos especializados, mayor complejidad.',
    ],
  ],
  practica: [
    [
      '"La célula observada al microscopio electrónico muestra una membrana plasmática bien definida, ausencia de membrana nuclear, ribosomas de 70S distribuidos en el citoplasma y pared celular de peptidoglicano. Diámetro: ≈ 3 μm."',
      '→ Indica si es procariota o eucariota. Justifica tu respuesta señalando al menos tres evidencias del texto.',
    ],
    [
      'Clasifica cada organismo como procariota o eucariota y explica brevemente tu criterio:',
      'a) Escherichia coli — bacteria intestinal humana.',
      'b) Amanita muscaria — hongo seta (matamoscas).',
      'c) Quercus robur — roble común europeo.',
      'd) Methanobacterium thermoautotrophicum — arquea productora de metano.',
      'e) Paramecium caudatum — protista ciliado unicelular.',
    ],
    [
      'Completa la tabla comparativa indicando el valor correcto para cada rasgo (presente/ausente, 70S/80S, etc.):',
      '  RASGO              | PROCARIOTA | EUCARIOTA',
      '  Núcleo definido    |            |          ',
      '  Tamaño medio       |            |          ',
      '  Orgánulos membr.   |            |          ',
      '  Ribosomas          |            |          ',
      '  División celular   |            |          ',
      '  Pared celular      |            |          ',
      'Tras completarla, redacta un párrafo (mín. 60 palabras) explicando las diferencias más relevantes.',
    ],
    [
      '"El antibiótico rifampicina inhibe la ARN polimerasa bacteriana, impidiendo la transcripción. Las células humanas poseen una ARN polimerasa diferente, no bloqueada por este fármaco."',
      '1. ¿Por qué la rifampicina es eficaz contra bacterias sin dañar células humanas?',
      '2. ¿Qué propiedad de las células procariotas explica esta selectividad?',
      '3. ¿Podría usarse para tratar una infección fúngica? Razona tu respuesta.',
    ],
    [
      'Un biólogo examina un tejido desconocido y anota: núcleo con envoltura nuclear visible, mitocondrias, retículo endoplasmático rugoso, ribosomas de 80S, ausencia de cloroplastos y pared celular.',
      '1. ¿Las células son procariotas o eucariotas? ¿De qué subtipo exactamente?',
      '2. ¿Podría tratarse de células vegetales? ¿Por qué?',
      '3. Propón dos tipos de tejido humano que coincidan con esta descripción.',
    ],
  ],
};

/* ── CuadernoAnalyticsPanel ── */
function CuadernoAnalyticsPanel({
  cuaderno, leccion, bloque, activeCls, onClose,
}: {
  cuaderno: TeacherCuaderno;
  leccion: TeacherLeccion;
  bloque: TeacherBloque;
  activeCls: ClassData;
  onClose: () => void;
}) {
  const hasData = cuaderno.studentAttempts > 0;
  const sections = HEAT_SECTIONS[cuaderno.tipo];
  const insights = MARCO_INSIGHTS[cuaderno.tipo];
  const isTeoria = cuaderno.tipo === 'teoria';
  const [showPdf, setShowPdf] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}
    >
      {!hasData ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center' }}
        >
          <div style={{ width: 48, height: 48, borderRadius: '14px', background: T.note, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <BarChart2 size={22} color={T.soft} strokeWidth={1.5} />
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', fontWeight: 500, color: T.black, margin: '0 0 0.375rem' }}>
            Sin datos todavía
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: T.soft, margin: 0, maxWidth: '280px', lineHeight: 1.6 }}>
            Los análisis aparecerán cuando los alumnos de {activeCls.course} {activeCls.section} empiecen a trabajar en este cuaderno.
          </p>
        </motion.div>
      ) : (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

          {/* ── Col 1: Mapa de calor ── */}
          <div style={{ flex: '0 0 34%', overflowY: 'auto', borderRight: `1px solid ${T.border}`, padding: '1.125rem', background: T.bg }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <div style={{ width: 26, height: 26, borderRadius: '7px', background: T.note, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart2 size={14} color={T.deep} strokeWidth={1.75} />
              </div>
              <div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', fontWeight: 700, color: T.black, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mapa de calor</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.62rem', color: T.soft, margin: 0 }}>Dónde se atascan</p>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {[{ l: 'Fluido', c: '#16a34a' }, { l: 'Moderado', c: '#d97706' }, { l: 'Difícil', c: '#f97316' }, { l: 'Crítico', c: '#dc2626' }].map(({ l, c }) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '2px', background: c }} />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', color: T.soft }}>{l}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {sections.map((s, idx) => {
                const c = heatColor(s.pct);
                return (
                  <motion.div key={s.title}
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06, duration: 0.3 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.76rem', fontWeight: 500, color: T.black, lineHeight: 1.3, flex: 1 }}>
                        {s.title}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0, marginLeft: '0.5rem' }}>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', fontWeight: 700, color: c.label }}>{s.pct}%</span>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', color: T.soft }}>{s.count} al.</span>
                      </div>
                    </div>
                    <div style={{ position: 'relative', height: '7px', background: T.borderSoft, borderRadius: '9999px', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.pct}%` }}
                        transition={{ delay: idx * 0.06 + 0.18, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          position: 'absolute', top: 0, left: 0, height: '100%',
                          background: `linear-gradient(90deg, ${c.bar}bb, ${c.bar})`,
                          borderRadius: '9999px',
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <button
              onClick={() => setShowPdf(true)}
              style={{
                width: '100%', marginTop: '1.125rem', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                padding: '0.5rem 0.75rem',
                background: T.deep, border: 'none', borderRadius: '10px', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', fontWeight: 500,
                color: '#fff', transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <FileText size={13} strokeWidth={1.75} /> Ver en el PDF
            </button>
          </div>

          {/* ── Col 2: Análisis Marco ── */}
          <div style={{ flex: '0 0 36%', overflowY: 'auto', borderRight: `1px solid ${T.border}`, padding: '1.125rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <div style={{ width: 26, height: 26, borderRadius: '7px', background: T.deep, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(44,46,122,0.22)' }}>
                <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: '0.8rem', color: '#fff' }}>M</span>
              </div>
              <div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', fontWeight: 700, color: T.black, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Análisis de Marco</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.62rem', color: T.soft, margin: 0 }}>IA · actualizado hoy</p>
              </div>
            </div>

            {([
              { key: 'dificultades' as const, label: 'Puntos de dificultad', Icon: AlertTriangle, color: T.danger,  bg: T.dangerSoft  },
              { key: 'fluido'       as const, label: 'Progresa con fluidez', Icon: TrendingUp,    color: T.success, bg: T.successSoft },
              { key: 'patrones'     as const, label: 'Patrones detectados',  Icon: Activity,      color: T.deep,    bg: T.violet      },
            ]).map(({ key, label, Icon, color, bg }, blockIdx) => (
              <motion.div key={key}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: blockIdx * 0.1, duration: 0.28 }}
                style={{ marginBottom: '1.125rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
                  <Icon size={12} color={color} strokeWidth={1.75} />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    {label}
                  </span>
                </div>
                {insights[key].map((text, i) => (
                  <div key={i} style={{
                    padding: '0.625rem 0.75rem',
                    background: bg, borderRadius: '10px', marginBottom: '0.3rem',
                    borderLeft: `3px solid ${color}`,
                  }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: T.black, margin: 0, lineHeight: 1.55 }}>
                      {text}
                    </p>
                  </div>
                ))}
              </motion.div>
            ))}
          </div>

          {/* ── Col 3: Casos a revisar ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.125rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <div style={{ width: 26, height: 26, borderRadius: '7px', background: T.note, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={13} color={T.deep} strokeWidth={1.75} />
              </div>
              <div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', fontWeight: 700, color: T.black, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Casos a revisar</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.62rem', color: T.soft, margin: 0 }}>Atención o rendimiento destacado</p>
              </div>
            </div>

            {/* Struggling */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
                <AlertTriangle size={11} color={T.danger} strokeWidth={1.75} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', fontWeight: 700, color: T.danger, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Requieren atención
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {MOCK_STRUGGLING.map((s, i) => (
                  <motion.div key={s.name}
                    initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.625rem',
                      padding: '0.625rem 0.75rem',
                      background: T.white, border: `1.5px solid ${T.border}`,
                      borderLeft: `3px solid ${T.danger}`, borderRadius: '10px',
                    }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: T.dangerSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: '0.85rem', color: T.danger }}>{s.initial}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', fontWeight: 500, color: T.black, margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.64rem', color: T.soft, margin: 0 }}>{s.mins} min en {s.stuckAt}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: T.danger }}>
                        {s.progress}/{s.total}
                      </span>
                      <button style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        fontFamily: "'DM Sans', sans-serif", fontSize: '0.62rem', fontWeight: 500,
                        color: T.soft, textDecoration: 'underline', textUnderlineOffset: '2px',
                        transition: 'color 0.12s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = T.black)}
                      onMouseLeave={e => (e.currentTarget.style.color = T.soft)}
                      >
                        Ver progreso
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Excelling */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
                <TrendingUp size={11} color={T.success} strokeWidth={1.75} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', fontWeight: 700, color: T.success, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Rendimiento destacado
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {MOCK_EXCELLING.map((s, i) => (
                  <motion.div key={s.name}
                    initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.21 + i * 0.07 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.625rem',
                      padding: '0.625rem 0.75rem',
                      background: T.white, border: `1.5px solid ${T.border}`,
                      borderLeft: `3px solid ${T.success}`, borderRadius: '10px',
                    }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: T.successSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: '0.85rem', color: T.success }}>{s.initial}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', fontWeight: 500, color: T.black, margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.64rem', color: T.soft, margin: 0 }}>Completado en {s.time}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Check size={11} color={T.success} strokeWidth={2.5} />
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: T.success }}>{s.progress}/{s.total}</span>
                      </div>
                      <button style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        fontFamily: "'DM Sans', sans-serif", fontSize: '0.62rem', fontWeight: 500,
                        color: T.soft, textDecoration: 'underline', textUnderlineOffset: '2px',
                        transition: 'color 0.12s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = T.black)}
                      onMouseLeave={e => (e.currentTarget.style.color = T.soft)}
                      >
                        Ver progreso
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── PDF heat map overlay ── */}
      <AnimatePresence>
        {showPdf && (
          <motion.div
            key="pdf-overlay"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute', inset: 0, zIndex: 20,
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              background: '#2a2a2a',
            }}
          >
            {/* PDF chrome toolbar */}
            <div style={{
              background: '#333', borderBottom: '1px solid #1a1a1a',
              padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.875rem',
              flexShrink: 0,
            }}>
              <button onClick={() => setShowPdf(false)} style={{
                display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0,
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '7px', padding: '4px 10px', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 500,
                color: 'rgba(255,255,255,0.8)', transition: 'background 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              >
                <X size={12} /> Cerrar
              </button>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>
                  {cuaderno.title} · mapa de calor
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', flexShrink: 0 }}>
                {[{ l: 'Fluido', c: '#16a34a' }, { l: 'Moderado', c: '#d97706' }, { l: 'Difícil', c: '#f97316' }, { l: 'Crítico', c: '#dc2626' }].map(({ l, c }) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '2px', background: c }} />
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', color: 'rgba(255,255,255,0.45)' }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PDF page */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  width: '100%', maxWidth: '500px',
                  background: '#fff',
                  boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
                  borderRadius: '2px',
                  padding: '2.25rem 2.25rem 3rem',
                }}
              >
                {/* Doc header */}
                <div style={{ marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: `2px solid ${T.borderSoft}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '9px', background: isTeoria ? T.violet : '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {isTeoria ? <BookOpen size={15} color={T.accent} strokeWidth={1.75} /> : <Pencil size={15} color="#c2410c" strokeWidth={1.75} />}
                    </div>
                    <div>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.62rem', fontWeight: 700, color: isTeoria ? T.accent : '#c2410c', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 1px' }}>
                        {isTeoria ? 'Teoría' : 'Práctica'}
                      </p>
                      <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontVariationSettings: '"opsz" 72', fontSize: '1.1rem', fontWeight: 500, color: T.black, margin: 0, letterSpacing: '-0.02em' }}>
                        {cuaderno.title}
                      </p>
                    </div>
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: T.soft, margin: 0 }}>
                    L{leccion.num} · {leccion.title} — {activeCls.course} {activeCls.section}
                  </p>
                </div>

                {/* Sections — real content with heat highlight */}
                {sections.map((s, idx) => {
                  const c = heatColor(s.pct);
                  const lvl = s.pct < 36 ? 'Fluido' : s.pct < 62 ? 'Moderado' : s.pct < 80 ? 'Difícil' : 'Crítico';
                  const paragraphs = (PDF_CONTENT[cuaderno.tipo][idx] ?? []);
                  const hlAlpha = s.pct < 36 ? '14' : s.pct < 62 ? '1e' : s.pct < 80 ? '28' : '30';
                  return (
                    <motion.div key={s.title}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.06, duration: 0.3 }}
                      style={{ display: 'flex', marginBottom: '3px' }}
                    >
                      {/* Content column */}
                      <div style={{
                        flex: 1,
                        background: `${c.bar}${hlAlpha}`,
                        borderLeft: `5px solid ${c.bar}`,
                        padding: '0.875rem 1rem 0.875rem 1.125rem',
                      }}>
                        <p style={{
                          fontFamily: "'DM Sans', sans-serif", fontSize: '0.63rem', fontWeight: 700,
                          color: c.label, textTransform: 'uppercase', letterSpacing: '0.07em',
                          margin: '0 0 0.5rem',
                        }}>
                          {idx + 1}. {s.title}
                        </p>
                        {paragraphs.map((p, i) => (
                          <p key={i} style={{
                            fontFamily: 'Georgia, "Times New Roman", serif',
                            fontSize: '0.78rem', color: '#1a1a1a',
                            margin: i < paragraphs.length - 1 ? '0 0 0.5rem' : 0,
                            lineHeight: 1.7,
                          }}>
                            {p}
                          </p>
                        ))}
                        {s.count > 0 && (
                          <p style={{
                            fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem',
                            color: c.label, margin: '0.625rem 0 0', fontWeight: 600,
                          }}>
                            ↑ {s.count} alumno{s.count !== 1 ? 's' : ''} necesitó ayuda en este punto
                          </p>
                        )}
                      </div>

                      {/* Heat thermometer column */}
                      <div style={{
                        width: '38px', flexShrink: 0,
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        padding: '0.75rem 0',
                        background: 'rgba(0,0,0,0.03)',
                        borderLeft: '1px solid rgba(0,0,0,0.06)',
                      }}>
                        <span style={{
                          fontFamily: "'DM Sans', sans-serif", fontSize: '0.62rem', fontWeight: 700,
                          color: c.label, marginBottom: '0.3rem',
                        }}>
                          {s.pct}%
                        </span>
                        <div style={{ flex: 1, width: '5px', background: `${c.bar}28`, borderRadius: '9999px', position: 'relative', overflow: 'hidden' }}>
                          <motion.div
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: idx * 0.06 + 0.2, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                              position: 'absolute', bottom: 0, left: 0, right: 0,
                              height: `${s.pct}%`,
                              background: c.bar,
                              borderRadius: '9999px',
                              transformOrigin: 'bottom',
                            }}
                          />
                        </div>
                        <span style={{
                          fontFamily: "'DM Sans', sans-serif", fontSize: '0.52rem',
                          color: c.label, marginTop: '0.3rem', fontWeight: 600,
                          writingMode: 'vertical-rl', transform: 'rotate(180deg)',
                          letterSpacing: '0.04em',
                        }}>
                          {lvl}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── ContentScreen ── */
function ContentScreen({
  logout, onContent, onHome, initialClass,
}: {
  logout: () => void;
  onContent: () => void;
  onHome?: () => void;
  initialClass?: ClassData | null;
}) {
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [activeCls, setActiveCls]       = useState<ClassData | null>(initialClass ?? null);
  const [content, setContent]           = useState<TeacherBloque[]>(INITIAL_CONTENT);
  const [selected, setSelected]         = useState<{ bi: number; li: number } | null>(null);
  const [showCreation, setShowCreation] = useState(false);
  const [analyticsFor, setAnalyticsFor] = useState<TeacherCuaderno | null>(null);
  const SPRING = { type: 'spring' as const, stiffness: 500, damping: 32 };

  const selBloque  = selected !== null ? content[selected.bi]                         : null;
  const selLeccion = selected !== null ? content[selected.bi]?.lecciones[selected.li] : null;

  const selectLeccion = (bi: number, li: number) => {
    setSelected({ bi, li }); setShowCreation(false); setAnalyticsFor(null);
  };

  const deleteCuaderno = (cId: string) => {
    if (!selected) return;
    const { bi, li } = selected;
    setContent(prev => prev.map((b, bIdx) => bIdx !== bi ? b : {
      ...b,
      lecciones: b.lecciones.map((l, lIdx) => lIdx !== li ? l : {
        ...l, cuadernos: l.cuadernos.filter(c => c.id !== cId),
      }),
    }));
  };

  const handleCreationComplete = (cuaderno: Omit<TeacherCuaderno, 'studentAttempts'>) => {
    if (!selected) return;
    const { bi, li } = selected;
    setContent(prev => prev.map((b, bIdx) => bIdx !== bi ? b : {
      ...b,
      lecciones: b.lecciones.map((l, lIdx) => lIdx !== li ? l : {
        ...l, cuadernos: [...l.cuadernos, { ...cuaderno, studentAttempts: 0 }],
      }),
    }));
    setShowCreation(false);
  };

  const backToClasses = () => { setActiveCls(null); setSelected(null); setShowCreation(false); setAnalyticsFor(null); };

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <TeacherSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={logout} onContent={onContent} onHome={onHome} activeItem="content" />

      {/* Navbar */}
      {activeCls && showCreation && selLeccion ? (
        /* Creation: single consolidated header */
        <div style={{
          background: T.white, borderBottom: `1px solid ${T.border}`,
          padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem',
          height: '62px', flexShrink: 0,
        }}>
          <button onClick={() => setShowCreation(false)} style={{
            display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0,
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem',
            color: T.soft, padding: '4px 0', transition: 'color 0.12s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = T.black)}
          onMouseLeave={e => (e.currentTarget.style.color = T.soft)}
          >
            <ArrowLeft size={14} /> Cancelar
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic',
              fontVariationSettings: '"opsz" 72',
              fontSize: '0.9375rem', fontWeight: 500, color: T.black,
              margin: '0 0 1px', letterSpacing: '-0.02em',
            }}>
              {activeCls.course} {activeCls.section}
            </p>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: T.soft,
              margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              Nuevo cuaderno · L{selLeccion.num} · {selLeccion.title}
            </p>
          </div>
          <NavWordmark clipId="contentArco" />
        </div>
      ) : activeCls && analyticsFor && selLeccion ? (
        /* Analytics: single consolidated header */
        <div style={{
          background: T.white, borderBottom: `1px solid ${T.border}`,
          padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem',
          height: '62px', flexShrink: 0,
        }}>
          <button onClick={() => setAnalyticsFor(null)} style={{
            display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0,
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem',
            color: T.soft, padding: '4px 0', transition: 'color 0.12s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = T.black)}
          onMouseLeave={e => (e.currentTarget.style.color = T.soft)}
          >
            <ArrowLeft size={14} /> Volver
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic',
              fontVariationSettings: '"opsz" 72',
              fontSize: '0.9375rem', fontWeight: 500, color: T.black,
              margin: '0 0 1px', letterSpacing: '-0.02em',
            }}>
              {activeCls.course} {activeCls.section}
            </p>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: T.soft,
              margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              L{selLeccion.num} · {selLeccion.title} — {analyticsFor.title}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
            {analyticsFor.studentAttempts > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: T.note, borderRadius: '8px', padding: '4px 10px' }}>
                <Users size={12} color={T.soft} strokeWidth={1.75} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 500, color: T.black }}>
                  {analyticsFor.studentAttempts} alumnos
                </span>
              </div>
            )}
            <NavWordmark clipId="contentArco" />
          </div>
        </div>
      ) : (
        /* Standard navbar */
        <div style={{
          background: T.white, borderBottom: `1px solid ${T.border}`,
          padding: '0 1.25rem', display: 'flex', alignItems: 'center',
          height: '50px', flexShrink: 0, position: 'relative',
        }}>
          {activeCls ? (
            <button onClick={backToClasses} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem',
              color: T.soft, padding: '4px 0', transition: 'color 0.12s', zIndex: 1,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = T.black)}
            onMouseLeave={e => (e.currentTarget.style.color = T.soft)}
            >
              <ArrowLeft size={14} /> Grupos
            </button>
          ) : (
            <button onClick={() => setSidebarOpen(s => !s)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '7px', borderRadius: '8px', display: 'flex',
              color: T.black, transition: 'background 0.12s', zIndex: 1,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = T.note)}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <Menu size={18} strokeWidth={1.75} />
            </button>
          )}
          <p style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic',
            fontVariationSettings: '"opsz" 72',
            fontSize: '0.9375rem', fontWeight: 500, color: T.black,
            letterSpacing: '-0.02em', margin: 0, pointerEvents: 'none',
          }}>
            {activeCls ? `${activeCls.course} ${activeCls.section}` : 'Contenido'}
          </p>
          <div style={{ marginLeft: 'auto', zIndex: 1 }}>
            <NavWordmark clipId="contentArco" />
          </div>
        </div>
      )}

      {/* Body */}
      <AnimatePresence mode="wait">

        {/* Phase 1: class picker */}
        {!activeCls && (
          <motion.div key="class-picker"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
            style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <h2 style={{
                fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic',
                fontVariationSettings: '"opsz" 72',
                fontSize: '1.4rem', fontWeight: 500, color: T.black,
                letterSpacing: '-0.025em', margin: '0 0 0.25rem',
              }}>{TEACHER_SUBJECT}</h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: T.soft, margin: 0 }}>
                Elige el grupo para gestionar sus cuadernos
              </p>
            </div>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', fontWeight: 600,
              color: T.soft, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 0.5rem',
            }}>Grupos</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', maxWidth: '560px' }}>
              {CLASSES.map((cls, idx) => (
                <motion.button key={cls.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, ...SPRING }}
                  whileHover={{ y: -2, boxShadow: `0 4px 14px ${cls.color.progress}22` }}
                  whileTap={{ scale: 0.975 }}
                  onClick={() => { setActiveCls(cls); setSelected(null); }}
                  style={{
                    background: T.white, border: `1.5px solid ${T.border}`,
                    borderRadius: '14px', padding: '0.875rem',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = cls.color.border; e.currentTarget.style.background = cls.color.hover; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.white; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <div>
                      <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontVariationSettings: '"opsz" 72', fontSize: '1.05rem', fontWeight: 500, color: T.black, margin: '0 0 0.1rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                        {cls.course}
                      </p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: T.soft, margin: 0 }}>Grupo {cls.section}</p>
                    </div>
                    <div style={{ width: 26, height: 26, borderRadius: '7px', background: cls.color.pill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: '0.85rem', color: cls.color.text }}>{cls.section}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: T.soft }}>{cls.students} alumnos</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: T.deep, fontWeight: 500 }}>
                      Ver contenido →
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Phase 2: curriculum + creation */}
        {activeCls && (
          <motion.div key={`content-${activeCls.id}`}
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            <AnimatePresence mode="wait">
              {showCreation && selLeccion ? (
                /* Creación de cuaderno */
                <motion.div key="creation"
                  initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  style={{ flex: 1, overflow: 'hidden', display: 'flex' }}
                >
                  <CuadernoCreationPanel
                    leccion={selLeccion}
                    bloque={selBloque!}
                    activeCls={activeCls}
                    onClose={() => setShowCreation(false)}
                    onCreate={handleCreationComplete}
                  />
                </motion.div>
              ) : analyticsFor && selLeccion ? (
                /* Estado / analytics */
                <motion.div key={`analytics-${analyticsFor.id}`}
                  initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  style={{ flex: 1, overflow: 'hidden', display: 'flex' }}
                >
                  <CuadernoAnalyticsPanel
                    cuaderno={analyticsFor}
                    leccion={selLeccion}
                    bloque={selBloque!}
                    activeCls={activeCls}
                    onClose={() => setAnalyticsFor(null)}
                  />
                </motion.div>
              ) : (
                /* Árbol + cuadernos */
                <motion.div key="curriculum"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ flex: 1, overflow: 'hidden', display: 'flex' }}
                >
                  {/* Izquierda: árbol */}
                  <div style={{ width: '240px', flexShrink: 0, borderRight: `1px solid ${T.border}`, overflowY: 'auto', background: T.bg }}>
                    {content.map((bloque, bi) => (
                      <div key={bi} style={{ borderBottom: bi < content.length - 1 ? `1px solid ${T.borderSoft}` : 'none', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
                        {/* Bloque header */}
                        <div style={{
                          padding: '0.75rem 1rem 0.5rem',
                          position: 'sticky', top: 0, zIndex: 1,
                          background: T.bg,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                              width: 20, height: 20, borderRadius: '6px', flexShrink: 0,
                              background: T.deep,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', fontWeight: 700, color: '#fff', letterSpacing: '0' }}>
                                {bloque.num}
                              </span>
                            </div>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: T.black, margin: 0, lineHeight: 1.3, flex: 1 }}>
                              {bloque.title}
                            </p>
                          </div>
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.63rem', color: T.soft, margin: '0.2rem 0 0 1.75rem' }}>
                            {bloque.lecciones.length} lección{bloque.lecciones.length !== 1 ? 'es' : ''}
                          </p>
                        </div>
                        {/* Lecciones */}
                        {bloque.lecciones.map((leccion, li) => {
                          const isActive = selected?.bi === bi && selected?.li === li;
                          return (
                            <button key={li} onClick={() => selectLeccion(bi, li)} style={{
                              width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                              padding: '0.4375rem 1rem 0.4375rem 1rem',
                              background: isActive ? T.violet : 'none',
                              borderLeft: `3px solid ${isActive ? T.deep : 'transparent'}`,
                              transition: 'background 0.12s, border-color 0.12s',
                            }}
                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = T.note; }}
                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'none'; }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem' }}>
                                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.79rem', fontWeight: isActive ? 500 : 400, color: isActive ? T.deep : T.gray, margin: 0, lineHeight: 1.35, flex: 1 }}>
                                  {leccion.title}
                                </p>
                                {leccion.cuadernos.length > 0 && (
                                  <span style={{
                                    fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', fontWeight: 600,
                                    color: isActive ? T.deep : T.soft,
                                    background: isActive ? 'rgba(255,255,255,0.6)' : T.borderSoft,
                                    padding: '1px 5px', borderRadius: '9999px', flexShrink: 0,
                                    transition: 'all 0.12s',
                                  }}>
                                    {leccion.cuadernos.length}
                                  </span>
                                )}
                              </div>
                              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.63rem', color: isActive ? T.accent : T.soft, margin: '1px 0 0' }}>
                                L{leccion.num}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Derecha: cuadernos */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
                    <AnimatePresence mode="wait">
                      {!selLeccion ? (
                        <motion.div key="no-sel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', color: T.soft, textAlign: 'center' }}>
                            Selecciona una lección para ver y gestionar sus cuadernos
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div key={`${selected!.bi}-${selected!.li}`}
                          initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div style={{ marginBottom: '1.25rem' }}>
                            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontVariationSettings: '"opsz" 72', fontSize: '1.4rem', fontWeight: 500, color: T.black, letterSpacing: '-0.025em', margin: '0 0 0.2rem' }}>
                              L{selLeccion.num} · {selLeccion.title}
                            </h2>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.775rem', color: T.soft, margin: 0 }}>
                              Bloque {selBloque!.num} · {selBloque!.title}
                            </p>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.5rem' }}>
                            {selLeccion.cuadernos.length === 0 ? (
                              <div style={{ background: T.note, borderRadius: '14px', padding: '2rem', textAlign: 'center' }}>
                                <div style={{ width: 36, height: 36, borderRadius: '10px', background: T.white, border: `1.5px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                                  <BookOpen size={16} color={T.soft} strokeWidth={1.5} />
                                </div>
                                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', fontWeight: 500, color: T.black, margin: '0 0 0.25rem' }}>
                                  Sin cuadernos todavía
                                </p>
                                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.775rem', color: T.soft, margin: 0, lineHeight: 1.55 }}>
                                  {activeCls.course} {activeCls.section} aún no tiene cuadernos en esta lección
                                </p>
                              </div>
                            ) : (
                              selLeccion.cuadernos.map(c => {
                                const isTeoria = c.tipo === 'teoria';
                                return (
                                  <motion.div key={c.id}
                                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                                      background: T.white, border: `1.5px solid ${T.border}`,
                                      borderLeft: `3px solid ${isTeoria ? T.accent : '#ea580c'}`,
                                      borderRadius: '12px', padding: '0.75rem 0.875rem',
                                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                    }}
                                  >
                                    <div style={{
                                      width: 30, height: 30, borderRadius: '8px', flexShrink: 0,
                                      background: isTeoria ? T.violet : '#fff7ed',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                      {isTeoria
                                        ? <BookOpen size={14} color={T.accent} strokeWidth={1.75} />
                                        : <Pencil size={14} color="#c2410c" strokeWidth={1.75} />
                                      }
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', fontWeight: 500, color: T.black, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</p>
                                      <span style={{
                                        fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', fontWeight: 600,
                                        color: isTeoria ? T.accent : '#c2410c',
                                        letterSpacing: '0.03em',
                                      }}>
                                        {isTeoria ? 'TEORÍA' : 'PRÁCTICA'}
                                      </span>
                                    </div>
                                    {c.studentAttempts > 0 && (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                        <Users size={11} color={T.soft} strokeWidth={1.75} />
                                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: T.soft }}>
                                          {c.studentAttempts}
                                        </span>
                                      </div>
                                    )}
                                    <button
                                      onClick={() => setAnalyticsFor(c)}
                                      style={{
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        background: T.note, border: `1px solid ${T.borderSoft}`,
                                        borderRadius: '7px', padding: '4px 8px', cursor: 'pointer',
                                        fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', fontWeight: 500,
                                        color: T.soft, transition: 'all 0.12s', flexShrink: 0,
                                      }}
                                      onMouseEnter={e => { e.currentTarget.style.background = T.violet; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.deep; }}
                                      onMouseLeave={e => { e.currentTarget.style.background = T.note; e.currentTarget.style.borderColor = T.borderSoft; e.currentTarget.style.color = T.soft; }}
                                    >
                                      <BarChart2 size={11} strokeWidth={1.75} /> Estado
                                    </button>
                                    <button onClick={() => deleteCuaderno(c.id)} title="Eliminar" style={{
                                      background: 'none', border: 'none', cursor: 'pointer', color: T.soft,
                                      padding: '5px', borderRadius: '7px', display: 'flex',
                                      transition: 'color 0.12s, background 0.12s', flexShrink: 0,
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.color = T.danger; e.currentTarget.style.background = T.dangerSoft; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = T.soft; e.currentTarget.style.background = 'none'; }}
                                    >
                                      <Trash2 size={13} strokeWidth={1.75} />
                                    </button>
                                  </motion.div>
                                );
                              })
                            )}
                          </div>

                          <button
                            onClick={() => setShowCreation(true)}
                            style={{
                              width: '100%', padding: '0.625rem',
                              border: `1.5px dashed ${T.border}`, background: 'none',
                              borderRadius: '12px', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                              fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem',
                              color: T.soft, transition: 'border-color 0.15s, color 0.15s, background 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = T.deep; e.currentTarget.style.color = T.deep; e.currentTarget.style.background = T.violet; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.soft; e.currentTarget.style.background = 'none'; }}
                          >
                            <Plus size={14} strokeWidth={2} /> Nuevo cuaderno
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── TeacherPage ── */
export default function TeacherPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<TeacherScreen>('home');
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [contentInitialClass, setContentInitialClass] = useState<ClassData | null>(null);
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

  const handleSelectClass = (cls: ClassData) => {
    setSelectedClass(cls);
    setScreen('dashboard');
  };

  const goContent = () => {
    setContentInitialClass(null);
    setScreen('content');
  };

  const goContentWithClass = (cls: ClassData) => {
    setContentInitialClass(cls);
    setScreen('content');
  };

  return (
    <BrowserChrome>
      <AnimatePresence mode="wait">
        {screen === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
          >
            <HomeTeacher
              onSelect={handleSelectClass}
              logout={logout}
              onContent={goContent}
              onViewContent={goContentWithClass}
            />
          </motion.div>
        )}
        {screen === 'dashboard' && selectedClass && (
          <motion.div key="dashboard" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
          >
            <DashboardView
              cls={selectedClass}
              onBack={() => setScreen('home')}
              logout={logout}
              onContent={goContent}
              liveFeed={liveFeed}
              isAlexLive={isAlexLive}
            />
          </motion.div>
        )}
        {screen === 'content' && (
          <motion.div key="content" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
          >
            <ContentScreen
              logout={logout}
              onContent={goContent}
              onHome={() => setScreen('home')}
              initialClass={contentInitialClass}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </BrowserChrome>
  );
}
