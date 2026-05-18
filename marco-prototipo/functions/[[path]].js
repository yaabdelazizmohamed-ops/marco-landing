/**
 * Cloudflare Pages Function — password gate for marco-prototipo.
 *
 * Intercepts every request. If the visitor has a valid auth cookie, passes
 * through to the static Next.js build. Otherwise, serves an inline login page.
 *
 * Set the env var PROTO_PASSWORD in the Cloudflare Pages dashboard.
 * Default: marco2026
 */

async function makeToken(password) {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function getCookieValue(header, name) {
  const match = (header || '').match(
    new RegExp(`(?:^|;\\s*)${name}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function loginPage(error) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Marco — Prototipo</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,500&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --black: #0a0a0a;
      --white: #fafaf8;
      --gray:  #6b6b6b;
      --soft:  #9a9a96;
      --border: #e0dfd9;
      --deep:  #2c2e7a;
      --ease-soft: cubic-bezier(0.5, 0, 0.2, 1);
      --ease-out:  cubic-bezier(0.16, 1, 0.3, 1);
    }

    body {
      min-height: 100vh;
      background: var(--white);
      color: var(--black);
      font-family: 'DM Sans', system-ui, sans-serif;
      -webkit-font-smoothing: antialiased;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 1.25rem;
    }

    .container {
      width: 100%;
      max-width: 420px;
      opacity: 0;
      transform: translateY(18px);
      animation: fadeUp 0.7s var(--ease-out) 0.08s forwards;
    }
    @keyframes fadeUp {
      to { opacity: 1; transform: translateY(0); }
    }

    /* ── Wordmark ─────────────────────────────── */
    .nav-brand {
      display: inline-block;
      color: var(--black);
      text-decoration: none;
      cursor: default;
      line-height: 0;
    }

    .nb-frame {
      display: block;
      overflow: hidden;
      width: 108px;
      height: 120px;
      transition: width 0.75s var(--ease-soft);
    }
    .nav-brand.nb-active .nb-frame { width: 240px; }

    .nb-svg {
      display: block;
      width: 240px;
      height: 120px;
      overflow: visible;
    }

    .nb-mark {
      font-family: 'Fraunces', Georgia, serif;
      font-style: normal;
      font-variation-settings: "opsz" 96;
      font-weight: 500;
      font-size: 38px;
      fill: currentColor;
    }
    .nb-mark-sigma {
      transform-origin: 175px 106px;
      transform: rotate(0deg);
      transition: transform 0.65s var(--ease-soft);
    }
    .nav-brand.nb-active .nb-mark-sigma {
      transform: rotate(90deg) translateX(-2px);
    }

    .nb-arco {
      font-family: 'Fraunces', Georgia, serif;
      font-style: normal;
      font-variation-settings: "opsz" 96;
      font-weight: 500;
      font-size: 38px;
      letter-spacing: -0.01em;
      fill: currentColor;
    }
    .nb-arco-clip {
      transform-box: fill-box;
      transform-origin: left center;
      transform: scaleX(0);
      transition: transform 0.45s var(--ease-soft);
    }
    .nav-brand.nb-active .nb-arco-clip {
      transform: scaleX(1);
      transition: transform 0.55s var(--ease-soft) 200ms;
    }

    .nb-tl-stub, .nb-bl-stub {
      stroke-dasharray: 59;
      stroke-dashoffset: 47;
      transition: stroke-dashoffset 0.75s var(--ease-soft);
    }
    .nav-brand.nb-active .nb-tl-stub,
    .nav-brand.nb-active .nb-bl-stub { stroke-dashoffset: 0; }

    .nb-right-group {
      transform: translateX(0);
      transition: transform 0.75s var(--ease-soft);
    }
    .nav-brand.nb-active .nb-right-group { transform: translateX(64px); }

    .nb-tr-stub, .nb-br-stub {
      stroke-dasharray: 59;
      stroke-dashoffset: 47;
      transition: stroke-dashoffset 0.75s var(--ease-soft);
    }
    .nav-brand.nb-active .nb-tr-stub,
    .nav-brand.nb-active .nb-br-stub { stroke-dashoffset: 0; }

    @media (prefers-reduced-motion: reduce) {
      .nb-frame, .nb-mark-sigma, .nb-arco-clip,
      .nb-tl-stub, .nb-bl-stub, .nb-tr-stub, .nb-br-stub,
      .nb-right-group {
        transition-duration: 0.01ms !important;
        transition-delay: 0ms !important;
      }
    }

    /* ── Layout ───────────────────────────────── */
    .wordmark-wrap {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 136px;
      margin-bottom: 1.25rem;
    }

    .tagline {
      text-align: center;
      font-size: 1.05rem;
      font-weight: 300;
      color: var(--gray);
      line-height: 1.7;
      letter-spacing: -0.01em;
      margin-bottom: 2.5rem;
      opacity: 0;
      animation: fadeUp 0.5s var(--ease-out) 0.45s forwards;
    }
    .tagline em { font-style: italic; color: var(--soft); }

    /* ── Form ─────────────────────────────────── */
    .form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 2.5rem;
      opacity: 0;
      animation: fadeUp 0.5s var(--ease-out) 0.55s forwards;
    }

    .input {
      width: 100%;
      padding: 0.9rem 1.125rem;
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: 0.9375rem;
      font-weight: 400;
      color: var(--black);
      background: #ffffff;
      border: 1.5px solid var(--border);
      border-radius: 16px;
      outline: none;
      transition: border-color 0.15s;
    }
    .input:focus { border-color: var(--deep); }
    .input::placeholder { color: var(--soft); }

    .btn {
      width: 100%;
      padding: 0.9rem;
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: 0.9375rem;
      font-weight: 500;
      color: #fafaf8;
      background: var(--deep);
      border: none;
      border-radius: 16px;
      cursor: pointer;
      letter-spacing: -0.01em;
      transition: opacity 0.15s, transform 0.1s;
    }
    .btn:hover { opacity: 0.88; }
    .btn:active { transform: scale(0.985); }

    .error-msg {
      font-size: 0.8125rem;
      color: #b91c1c;
      background: #fee2e2;
      padding: 0.5rem 0.875rem;
      border-radius: 10px;
      text-align: center;
    }

    /* ── Footer ───────────────────────────────── */
    .footer {
      text-align: center;
      font-size: 0.72rem;
      font-weight: 300;
      color: var(--soft);
      line-height: 1.7;
      opacity: 0;
      animation: fadeUp 0.4s var(--ease-out) 0.9s forwards;
    }
  </style>
</head>
<body>
  <div class="container">

    <div class="wordmark-wrap">
      <div class="nav-brand" id="wm">
        <span class="nb-frame">
          <svg class="nb-svg" viewBox="140 70 140 70" xmlns="http://www.w3.org/2000/svg"
               aria-label="Marco" role="img">
            <line class="nb-l-v"     x1="148" y1="80"  x2="148" y2="130"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <line class="nb-tl-stub" x1="148" y1="80"  x2="207" y2="80"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <line class="nb-bl-stub" x1="148" y1="130" x2="207" y2="130"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <g class="nb-right-group">
              <line class="nb-r-v"     x1="202" y1="80"  x2="202" y2="130"
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <line class="nb-tr-stub" x1="202" y1="80"  x2="143" y2="80"
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <line class="nb-br-stub" x1="202" y1="130" x2="143" y2="130"
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </g>
            <defs>
              <clipPath id="clip-login">
                <rect class="nb-arco-clip" x="190" y="78" width="64" height="54" />
              </clipPath>
            </defs>
            <g clip-path="url(#clip-login)">
              <text x="190" y="114" class="nb-arco">arco</text>
            </g>
            <text x="175" y="119" class="nb-mark nb-mark-sigma"
                  text-anchor="middle">&#x03A3;</text>
          </svg>
        </span>
      </div>
    </div>

    <p class="tagline">IA socrática que <em>enseña a pensar.</em></p>

    <form class="form" method="POST" action="/__auth">
      <input
        class="input"
        type="password"
        name="password"
        placeholder="Contraseña de acceso"
        autofocus
        autocomplete="current-password"
        aria-label="Contraseña de acceso"
      />
      ${error ? '<p class="error-msg">Contraseña incorrecta. Inténtalo de nuevo.</p>' : ''}
      <button class="btn" type="submit">Acceder al prototipo</button>
    </form>

    <p class="footer">
      Prototipo interactivo de Marco<br />
      Versión de demostración — acceso restringido
    </p>
  </div>

  <script>
    setTimeout(function () {
      var wm = document.getElementById('wm');
      if (wm) wm.classList.add('nb-active');
    }, 350);
  </script>
</body>
</html>`;
}

export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  const expectedPassword = env.PROTO_PASSWORD || 'marco2026';

  // Handle the auth form submission
  if (request.method === 'POST' && url.pathname === '/__auth') {
    const form = await request.formData();
    const submitted = (form.get('password') || '').toString();

    if (submitted === expectedPassword) {
      const token = await makeToken(expectedPassword);
      return new Response(null, {
        status: 302,
        headers: {
          Location: url.origin + '/',
          'Set-Cookie': [
            `marco_auth=${token}`,
            'Path=/',
            'HttpOnly',
            'Secure',
            'SameSite=Strict',
            'Max-Age=604800', // 7 days
          ].join('; '),
        },
      });
    }

    return new Response(loginPage(true), {
      status: 401,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Check auth cookie on every other request
  const cookieHeader = request.headers.get('Cookie') || '';
  const savedToken = getCookieValue(cookieHeader, 'marco_auth');

  if (savedToken) {
    const expectedToken = await makeToken(expectedPassword);
    if (savedToken === expectedToken) {
      return next();
    }
  }

  return new Response(loginPage(false), {
    status: 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
