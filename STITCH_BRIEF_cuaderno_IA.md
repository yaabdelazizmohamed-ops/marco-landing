# Brief Stitch — Pantalla "Cuaderno con IA"

Pantalla a editar: **vista_de_estudio_revoluci_n_francesa** (la de "Capítulo 3: La Crisis del Antiguo Régimen").

Objetivo: alinearla con la landing monocromo. Misma identidad editorial — sin terracotta, sin paper-cream, todo blanco / negro / gris con tipografía editorial italica como acento.

Aplícalo en este orden: primero los tokens globales (un cambio que se propaga a todo), luego ajustes finos de esta pantalla.

---

## 1. Tokens globales — cambiar en el Design System de Stitch

Estos cambios se aplican una vez y se propagan a todas las pantallas. Empieza por aquí.

### Color

| Token actual | Valor antiguo | Valor nuevo | Notas |
|---|---|---|---|
| `paper-cream` | `#F7F4EC` | `#fafaf8` | Casi blanco, con un toque cálido mínimo |
| `warm-white` | `#FBFAF6` | `#ffffff` | Blanco puro para superficies elevadas |
| `soft-parchment` | `#EFEBE0` | `#f0efeb` | Gris muy claro, neutro |
| `pure-white` | `#FFFFFF` | `#ffffff` | Igual — solo para el lienzo del PDF |
| `deep-ink` | `#1C1917` | `#0a0a0a` | Casi negro, sin tono cálido |
| `muted-ink` | `#57534E` | `#6b6b6b` | Gris medio neutro |
| `faded-ink` | `#A8A29E` | `#a0a0a0` | Gris claro neutro |
| `hairline` | `#E7E2D5` | `#e0dfd9` | Borde sutil, casi gris |
| `terracotta` | `#C85A3F` | `#0a0a0a` | El acento es negro ahora |
| `terracotta-deep` | `#A8472F` | `#222222` | Hover/pressed |
| `terracotta-tint` | `#F4E2DC` | `#f0efeb` | Wash de selección — gris claro |
| `study-green` | `#5F7A5E` | `#0a0a0a` | Sin verde — texto negro + tick |
| `caution-amber` | `#C48B2C` | `#6b6b6b` | Sin ámbar — gris + icono |
| `correction-red` | `#B23A3A` | `#c0392b` | Mantén un rojo solo para errores reales |
| `focus-blue` | `#3B5C8C` | `#0a0a0a` | Foco accesibilidad → negro |

Regla nueva: **el negro es el "acento". Como antes con terracotta, úsalo con escasez** — un solo elemento negro pleno por pantalla (CTA principal o la selección activa). El resto: gris.

### Tipografía

| Token | Antes | Ahora |
|---|---|---|
| `display-hero`, `h1`, `h2` | Fraunces | **Instrument Serif** |
| `h3`, body, label, caption | Inter | **DM Sans** |
| `mono-technical` | JetBrains Mono | (mantén o usa **DM Mono** si está disponible) |

Importa las fuentes desde Google Fonts en el `<head>` del export:

```
https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap
```

Regla clave: **la jerarquía la marca el contraste de familia (serif itálico vs. sans), no el color**. Cuando antes resaltabas algo en terracotta, ahora lo resaltas en *Instrument Serif italic*.

---

## 2. Cambios específicos en la pantalla "Cuaderno con IA"

Vamos por zonas, de izquierda a derecha y arriba a abajo.

### Sidebar izquierda (lista de cursos)

- **Logo "Marco Companion"** arriba: pasa el "Marco" de terracotta a negro `#0a0a0a`. Mantén "Companion" en gris medio. Tipografía: Instrument Serif italic 22px para "Marco", DM Sans 11px tracking 0.12em uppercase para "University Library Edition".
- **Botón "+ New Research Session"**: ahora es negro pleno (`#0a0a0a`) con texto blanco. Border-radius 100px (pill), padding 10/18, peso 500. En hover oscurece a `#222`.
- **Item activo "Course List"**: borde izquierdo de 3px en negro (era terracotta). Fondo `#f0efeb`. Texto en negro. Resto de items: texto gris `#6b6b6b`, sin fondo.
- **Iconos**: stroke 1.6, color `currentColor`. No uses Phosphor filled — usa la versión "regular" o un line-art simple.

### Top bar de la pantalla

- Título "Marco" centrado arriba: cámbialo a Instrument Serif italic, color negro. Quita cualquier acento terracotta que tenga.
- Iconos de la derecha (opciones, perfil): gris `#6b6b6b`, hover negro.
- Borde inferior: 1px `#e0dfd9` (no shadow).

### Pane de chat (centro)

- **Burbuja del asistente** (la primera, con el texto de la Revolución Francesa): fondo `#ffffff`, **sin borde**, radio 12px con esquina inferior-izquierda a 4px. Padding 16px. La separación del lienzo viene del contraste de fondo (lienzo es `#fafaf8`, burbuja es `#ffffff`).
- **Burbuja del alumno** (la segunda, "Entonces, Y en el texto..."): fondo `#f0efeb`, mismo radio pero con esquina inferior-derecha a 4px.
- **Avatar circular del asistente** (la "M"): círculo negro `#0a0a0a` 28px, letra "M" en Instrument Serif italic blanco.
- **Bloque de math** (las fórmulas LaTeX dentro de la burbuja del asistente): fondo `#fafaf8`, padding 12px, fuente DM Mono o JetBrains Mono. Sin borde de color.
- **Composer abajo** (donde escribes a Marco): contenedor pill 24px de radio, fondo blanco, borde 1px `#e0dfd9`. En foco: borde 1.5px negro (era terracotta) y un *outer glow* sutil de 3px `rgba(10,10,10,0.06)`.
- **Chip "Sobre la selección en pág. 42"**: fondo `#f0efeb`, borde 1px `#e0dfd9`, texto negro DM Sans 12px, "×" para quitar en gris hover negro. Quita el tono terracotta tint.
- **Botón de enviar** (icono dentro del composer): círculo negro 36px con flecha blanca. Hover: oscurece a `#222`.

### Pane del PDF (derecha)

- **Lienzo del PDF**: fondo `#ffffff` puro (esto se mantiene — el PDF debe verse fiel).
- **Inset shadow del documento**: cámbialo a `inset 0 0 0 1px #e0dfd9`. Sin shadow exterior.
- **Selección rectangular** (la del párrafo "El Estado estaba en bancarrota..."): borde 1.5px **negro** `#0a0a0a` (era terracotta), relleno con `rgba(10,10,10,0.06)` (era terracotta tint). Manijas de esquina: círculos negros de 8px.
- **Marker persistente** (el círculo numerado en la esquina del párrafo seleccionado): círculo negro `#0a0a0a` con número en blanco DM Sans 11px peso 600.
- **Subrayado de "Jacques Necker"**: línea de 1.5px negra (era terracotta).
- **Botón flotante "Pregunta a Marco"** abajo derecha: pill negro con texto blanco DM Sans 13px peso 500. Sin sombra colorida; opcional sombra suave `0 4px 16px rgba(0,0,0,0.08)`.
- **Page navigator** (strip vertical de páginas, si aparece): activa en negro 2px borde izquierdo (era terracotta).

### Footer de sidebar

- Items "Help" y "Archive": gris `#6b6b6b`, iconos del mismo color, hover negro. Sin acento terracotta.

---

## 3. Reglas de uso del negro (para no romper la regla de escasez)

Antes el sistema decía "máximo un elemento terracotta por pantalla". La regla sigue, pero ahora el negro es el acento. En esta pantalla, los elementos en **negro pleno** deben ser solamente:

1. El logo "Marco" (constante de marca)
2. El botón "+ New Research Session" (CTA principal)
3. El borde activo del item de sidebar seleccionado
4. La selección rectangular del PDF + su marker numerado
5. El botón flotante "Pregunta a Marco" del PDF

Todo lo demás vive en grises (`#6b6b6b` para UI activa, `#a0a0a0` para placeholder, `#e0dfd9` para bordes). Si te encuentras con más de 5–6 manchas negras pequeñas distribuidas por la pantalla, es señal de que algún elemento debería bajar a gris.

---

## 4. Tipografía itálica como acento (sustituye al terracotta)

Donde antes "Marco habla" o "esto es importante" se marcaba con terracotta, ahora se marca con **Instrument Serif italic en negro**. Aplicaciones en esta pantalla:

- La primera frase de cada respuesta larga del asistente puede arrancar con una palabra clave en Instrument Serif italic. Ej: en lugar de subrayar "Jacques Necker" en terracotta, italízalo: *Jacques Necker*.
- Títulos de sección dentro del PDF (si los hay sintetizados por Marco): Instrument Serif italic 16–18px.
- En vacíos / empty states: el copy principal en Instrument Serif italic, el subtexto en DM Sans gris.

---

## 5. Checklist rápido antes de exportar

- [ ] Cero terracotta en pantalla (busca `#C85A3F`, `#A8472F`, `#F4E2DC` y reemplázalos).
- [ ] Cero Fraunces (busca `font-family: Fraunces` y cámbialo).
- [ ] Cero emojis en UI (Stitch a veces los mete en estados vacíos — quítalos).
- [ ] Selección del PDF en negro con marker negro.
- [ ] CTA principal en negro, secundarios con borde gris y fondo transparente.
- [ ] Avatar "M" del asistente en círculo negro con letra blanca italic.
- [ ] Lienzo del fondo en `#fafaf8` (no en `#F7F4EC`).
- [ ] Tipografía de cuerpo en DM Sans 14px peso 400.

---

## 6. Si quieres que te lo migre yo a HTML después

Cuando hayas validado los cambios visuales en Stitch y quieras una versión interactiva navegable que se pueda subir a `marco.tudominio.com/app`, dime y lo construyo en HTML monocromo siguiendo este mismo brief — quedaría coherente al 100% con la landing. Es ~1 día de trabajo limpio.
