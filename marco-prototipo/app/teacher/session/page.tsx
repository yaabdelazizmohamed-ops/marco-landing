'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { getSession, onUpdate, formatTime } from '@/lib/demoStore';

const SUBJECT_LABELS: Record<string, string> = {
  mates:   'Matemáticas',
  fisica:  'Física',
  historia:'Historia',
};

const S = {
  bg: '#fafaf8', white: '#ffffff', black: '#0a0a0a',
  gray: '#6b6b6b', graySoft: '#9a9a96', border: '#e0dfd9',
  borderSoft: '#ebebe6', noteBg: '#f7f6f2',
  deep: '#2c2e7a', accent: '#6366cc', soft: '#eeeefa',
  danger: '#b91c1c', dangerSoft: '#fee2e2',
  success: '#2d6a4f', successSoft: '#e7f1ec',
};

function BrowserChrome({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #d4d3d0 0%, #c8c7c4 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1.5rem',
    }}>
      <div style={{
        width: '100%', maxWidth: '840px',
        height: 'calc(100vh - 4rem)',
        maxHeight: '780px',
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.28)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{
          background: '#ebebeb', borderBottom: '1px solid #d0d0d0',
          padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: '8px',
          flexShrink: 0,
        }}>
          {['#ff5f57','#febc2e','#28c840'].map((c, i) => (
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
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: S.bg }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function SessionContent() {
  const params = useSearchParams();
  const router = useRouter();
  const subjectKey = params.get('subject') ?? 'mates';
  const studentName = params.get('student') ?? 'Alex García';
  const studentInitials = (params.get('initials') ?? 'AG').toUpperCase();

  const [messages, setMessages] = useState(() => getSession(subjectKey));
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const cleanup = onUpdate(() => setMessages(getSession(subjectKey)));
    return cleanup;
  }, [subjectKey]);

  const subjectLabel = SUBJECT_LABELS[subjectKey] ?? subjectKey;

  return (
    <BrowserChrome>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

        {/* Header */}
        <header style={{
          background: S.white,
          borderBottom: `1px solid ${S.border}`,
          padding: '0 1.25rem',
          flexShrink: 0,
        }}>
          <div style={{
            height: '50px',
            display: 'flex', alignItems: 'center', gap: '1rem',
          }}>
            <button
              onClick={() => router.push('/teacher')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.8125rem', color: S.graySoft, padding: 0,
                display: 'flex', alignItems: 'center', gap: '0.25rem',
              }}
            >
              ← Volver al panel
            </button>

            <div style={{ width: 1, height: 18, background: S.border }} />

            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: S.dangerSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontStyle: 'italic', fontSize: '0.85rem',
                color: S.danger,
              }}>
                {studentInitials.charAt(0)}
              </span>
            </div>

            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '0.875rem', color: S.black }}>
                {studentName}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: S.graySoft }}>
                {subjectLabel}
              </div>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {messages.length > 0 ? (
                <>
                  <motion.span
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.4 }}
                    style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}
                  />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: '#2d6a4f' }}>
                    Sesión en vivo
                  </span>
                </>
              ) : (
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: S.graySoft }}>
                  Sin actividad aún
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '1.25rem',
          display: 'flex', flexDirection: 'column', gap: '0.75rem',
        }}>
          {messages.length === 0 ? (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '0.5rem', padding: '4rem 0',
            }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', color: S.graySoft, margin: 0 }}>
                Sin actividad todavía en esta sesión
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: S.border, margin: 0 }}>
                Los mensajes aparecerán aquí en tiempo real cuando {studentName} use la app
              </p>
            </div>
          ) : (
            <div style={{ maxWidth: 580, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <div style={{
                    fontSize: '0.65rem',
                    fontFamily: "'DM Sans', sans-serif",
                    color: msg.role === 'student' || msg.role === 'user' ? S.graySoft : S.accent,
                    marginBottom: '0.2rem',
                    textAlign: msg.role === 'student' || msg.role === 'user' ? 'right' : 'left',
                    fontWeight: msg.role === 'marco' || msg.role === 'ai' ? 600 : 400,
                  }}>
                    {msg.role === 'student' || msg.role === 'user' ? studentName : 'Marco'}{' '}
                    · {formatTime(msg.ts)}
                  </div>
                  <div style={{
                    maxWidth: '72%',
                    marginLeft: msg.role === 'student' || msg.role === 'user' ? 'auto' : 0,
                    padding: '0.7rem 0.9rem',
                    borderRadius: msg.role === 'student' || msg.role === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                    background: msg.role === 'student' || msg.role === 'user' ? S.black : S.white,
                    color: msg.role === 'student' || msg.role === 'user' ? S.white : S.black,
                    border: msg.role === 'marco' || msg.role === 'ai' ? `1px solid ${S.border}` : 'none',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.84rem',
                    lineHeight: 1.6,
                  }}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Footer */}
        {messages.length > 0 && (
          <div style={{
            padding: '0.625rem 1.25rem',
            borderTop: `1px solid ${S.border}`,
            background: S.white,
            flexShrink: 0,
          }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: S.graySoft, margin: 0 }}>
              Vista de solo lectura · {messages.length} mensaje{messages.length !== 1 ? 's' : ''} en esta sesión
            </p>
          </div>
        )}
      </div>
    </BrowserChrome>
  );
}

export default function TeacherSessionPage() {
  return (
    <Suspense fallback={<div style={{ height: '100vh', background: '#d4d3d0' }} />}>
      <SessionContent />
    </Suspense>
  );
}
