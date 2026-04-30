# Marco — Contexto del proyecto

> Este archivo se carga automáticamente cuando Claude Code abre el repo. Mantenlo actualizado cuando tomemos decisiones que deban sobrevivir entre sesiones.

## Qué es Marco

EdTech AI dirigido a primaria/secundaria (8-16 años). El usuario final es el alumno; el comprador es el centro educativo o el profesor. Posicionamiento: "IA socrática que enseña a pensar — no da respuestas, hace las preguntas correctas". Visibilidad para profesores/dirección de dónde se atascan los alumnos.

Equipo: Yassim (founder, hace producto/marca/ops) + Nassr (co-founder técnico, va a desarrollar el app en `app.marcoaprende.com`).

## Estado actual (2026-04-30)

- ✅ Dominio: `marcoaprende.com` registrado en Cloudflare (registrar at-cost).
- ✅ DNS, SSL, DNSSEC, 2FA configurados.
- ✅ Hosting: Cloudflare Pages, deploy automático desde GitHub `main`.
- ✅ Email: Zoho Mail con `yassim@`, `nassr@`, `hola@`, `centros@`, `privacidad@`.
- ✅ Landing en producción (`/index.html`).
- ✅ Páginas legales: `/privacidad`, `/cookies`, `/terminos`, `/aviso-legal` (RGPD + LOPDGDD + LSSI-CE compliant). Quedan placeholders `[POR COMPLETAR]` con NIF/dirección del titular hasta que se constituya la S.L.
- ✅ Form del landing conectado a Airtable vía Cloudflare Worker (`marcoaprende-landing-form.yaabdelaziz-mohamed.workers.dev`). Campos en Airtable: Email, Nombre, Rol, Centro, Interés piloto, Mensaje, Datos completos (JSON), Estado, IP, User agent, URL origen, Created. Honeypot anti-bot incluido.
- ✅ Sistema de tokens dual creado (`/styles/tokens.css`).
- ✅ Primera pantalla del producto reskinneada (`/brand-examples/cuaderno-mate.html`).

## Pendiente

1. **Decidir variante del avatar de Marco** (M en corchetes): A/B/C. Mi recomendación: A para el avatar grande del chat header, B para inline pequeños.
2. **Reskinear el resto de pantallas Stitch** al sistema dual:
   - Home alumno (¡Hola Alex!)
   - Asignatura (Matemáticas — completados/pendientes)
   - Dashboard director (Colegio San Rafael) ← más importante para B2B
   - Cuaderno historia + chat IA (variante del de matemáticas)
   - Cuaderno inglés + voz
   - Mobile progreso de Alex
3. **Subdominio `app.marcoaprende.com`** cuando Nassr tenga deployable algo. Cuando llegue: añadir CNAME en Cloudflare apuntando a su target.
4. **Pack comercial** (planificar, no ejecutar todavía):
   - PDF one-pager para centros (B2B email attachment)
   - Deck completo para reuniones (8-12 slides)
   - Dossier técnico para profesores
   - Pitch deck para inversores
5. **Datos legales**: rellenar `[POR COMPLETAR]` en `/privacidad` y `/aviso-legal` (NIF, domicilio fiscal del titular Yassim Abdelaziz Mohamed). Cuando la S.L. esté constituida: actualizar todas las páginas legales con datos de la sociedad y datos registrales.

## Decisiones de marca

### Sistema dual coherente

- **Superficies editoriales** (landing, marketing, header/footer del producto, auth, onboarding, comunicaciones): monocromo estricto cálido. Cream `#fafaf8` + black `#0a0a0a` + grays. Tipografía: Instrument Serif italic (display) + DM Sans (body).
- **Superficies del producto** (cuadernos, dashboards, IA chat, progreso): hereda toda la base editorial. Añade un único acento funcional — ink-violet sofisticado:
  - `--product-deep` `#2c2e7a` (CTAs primarios producto)
  - `--product-accent` `#6366cc` (chips, progress, badges)
  - `--product-soft` `#eeeefa` (backgrounds tenuemente teñidos)

NO se usa lavender brillante / candy. NO se introducen nuevos colores ad-hoc. Cualquier color nuevo debe definirse primero como token.

### Wordmark

Siempre el SVG con frame: rectángulo + "Marco" en Instrument Serif italic dentro + "aprende" en DM Sans italic 400 abajo-derecha asomando por la esquina inferior-derecha del frame. Geometría exacta: viewBox `100 75 175 80`, frame `rect x=108 y=80 width=122 height=50`.

NUNCA "Marcoaprende" como una sola palabra. NUNCA con icono de gorro de graduación ni cualquier otro símbolo decorativo.

En el navbar de la landing: comportamiento hover-to-expand (los corchetes se separan, marco aparece, aprende se escribe). Implementado en JS con rAF en `index.html`.

### Avatar de Marco AI

"M" italic Instrument Serif **entre corchetes** (mismas líneas+stubs que el wordmark) dentro de círculo. Variantes pendientes de elección final (A/B/C).

### Radii y espaciado

- Radii: `--radius-sm: 8px`, `--radius-md: 16px`, `--radius-lg: 24px`, `--radius-xl: 32px`, `--radius-pill: 9999px`. Se prefiere generoso (lg/xl) para que el lenguaje sea redondeado y "respirable", coherente con la audiencia 8-16.
- Spacing: grid de 8px. Variables `--space-1` … `--space-24`.

### Tipografía

- Display / hero / títulos editoriales: `Instrument Serif` italic regular, letter-spacing -0.02em.
- Body / UI: `DM Sans` (300/400/500/600).
- Mono (cuando aplique): `JetBrains Mono`.
- Cargados desde Google Fonts. Pesos italic 500 y 600 también necesarios para el "aprende" del wordmark.

## Estructura del repo

```
/
├── index.html                  # Landing principal (~3500 líneas, single-file)
├── CLAUDE.md                   # Este archivo
├── styles/
│   ├── legal.css               # Estilos compartidos páginas legales
│   └── tokens.css              # Sistema de tokens completo (USAR ESTO PARA TODO LO NUEVO)
├── privacidad/index.html
├── cookies/index.html
├── terminos/index.html
├── aviso-legal/index.html
├── brand-examples/
│   └── cuaderno-mate.html      # Primer reskin del producto (referencia visual)
└── (próximamente)
    └── brand-examples/         # más reskins según se hagan
```

Cloudflare Worker (separado, no en este repo): código en el dashboard de Cloudflare, proyecto `marcoaprende-landing-form`. Variables de entorno: `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID` (ambos como Secrets).

## Convenciones de código

- **Single-file HTML** para piezas auto-contenidas (landing, páginas legales, brand examples). No usar build steps.
- **Tokens primero**: cualquier color, fuente, espaciado, radius nuevo debe ir en `/styles/tokens.css` antes de usarse en otra parte. Si necesitas algo que no existe, lo defines como variable y luego lo usas.
- **Spanish copy** en TODA la UI visible al usuario. Comentarios en código y nombres de variables en inglés (`function submitForm()`, no `function enviarFormulario()`).
- **No emojis** en el producto/landing salvo decisión explícita. La marca es sobria.
- **No bullet points** en el HTML del landing salvo cuando sea contenido propiamente listable. Prosa siempre que se pueda.
- **Mobile-first responsive**: probar siempre en viewport ≤420px antes de dar por terminado.
- **Accesibilidad**: alt en todas las imágenes/SVGs decorativos (`aria-hidden="true"` o `aria-label="…"`), labels en todos los inputs, contraste suficiente.

## Audiencia y tono

- Usuario alumno (8-16): el producto puede ser un poco más cálido/cercano sin perder seriedad. NO infantilizar. NO emojis abusivos. NO gamificación tipo Duolingo (rachas SÍ, badges SÍ, niveles/xp/coins NO).
- Usuario profesor: confianza profesional, datos accionables, ahorro de tiempo.
- Usuario director: gravitas institucional, métricas de adopción, compliance/privacidad como pilares.
- Usuario padre: tranquilidad, control, transparencia sobre cómo aprende su hijo.

El landing está construido para hablar a los 3 primeros con un toggle de perfil. El producto interno (Stitch) tiene 3 entradas: alumno, profesor, dirección.

## Privacy / IA

- Proveedor actual: Google Vertex AI / Gemini Flash.
- Plan: migrar a modelo propio en infraestructura europea para reducir transferencias internacionales y maximizar privacidad. Importante porque centros lo van a preguntar.
- Sin cookies de tracking en el sitio web. Métricas vía Cloudflare Web Analytics (sin cookies, sin fingerprinting).
- DPO de contacto: `privacidad@marcoaprende.com`.

## Infra de un vistazo

| Capa | Servicio | Cuenta |
|---|---|---|
| Dominio + DNS | Cloudflare Registrar | yassim |
| Hosting landing | Cloudflare Pages (auto-deploy desde GitHub) | yassim |
| Hosting producto | Pendiente (Nassr decide) | nassr |
| Email | Zoho Mail | yassim |
| CRM/Leads | Airtable (base "Marco — Leads") | yassim |
| Form backend | Cloudflare Worker `marcoaprende-landing-form` | yassim |
| Repo | github.com/yaabdelazizmohamed-ops/marco-landing | yassim |

## Cómo trabajar en este repo

1. `git pull` antes de empezar.
2. Cambios pequeños y commits descriptivos. Cloudflare Pages redeploya en cada push a `main`.
3. Cuando toques tokens (colores/spacing/etc.), actualiza primero `/styles/tokens.css` y luego usa las variables.
4. Cuando añadas una pantalla nueva del producto, crearla en `/brand-examples/<nombre>.html` como auto-contenida, validar visualmente, y solo entonces pasarla a Nassr para implementar en el stack real.
5. Al terminar una sesión que cambia decisiones de marca, actualizar este `CLAUDE.md`.
