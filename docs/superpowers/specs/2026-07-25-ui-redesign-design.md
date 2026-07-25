# Rediseño visual del cliente (TranslateAI) — Spec

**Fecha:** 2026-07-25
**Alcance:** Solo estilos/animaciones del cliente React (`client/src`). No se toca lógica, API, ni estructura de datos.

## Objetivo

La interfaz actual es funcional pero plana: fondo sólido `#242424`/`#0b1220`, bordes grises uniformes, sin jerarquía tipográfica ni movimiento. El objetivo es un rediseño visual "minimal elegante" (tema oscuro refinado, un acento de color, tipografía cuidada, mucho espacio) con animaciones notorias mostrando pulido, sin cambiar el layout ni el comportamiento funcional existente.

## Enfoque técnico

CSS puro con design tokens (variables CSS) y `@keyframes` — sin dependencias nuevas (se descartó Framer Motion y una librería de componentes por ser sobre-ingeniería para el alcance). Todo el movimiento se logra con transiciones/animaciones CSS y clases React que se activan según estado (ya existente: `loading`, `result`, `autoTranslating`, etc).

## Layout

Se mantiene la estructura actual sin cambios: dos columnas (`pane-left`/`pane-right`) arriba + panel de análisis (`pane-bottom`) debajo, colapsando a una columna en `max-width: 900px`. Solo cambia la piel visual de cada pieza.

## Paleta y tipografía (design tokens)

Definir como variables CSS en `:root` (probablemente en `index.css` o un nuevo `theme.css`):

- `--bg-base`: `#0a0e17` con gradiente radial sutil superpuesto (no plano) hacia `#0d1220`.
- `--accent`: `#4f6bf6` (índigo refinado); `--accent-light`: `#8ba3ff` (usado en glow/focus/hover).
- `--text-primary`: `#e8ecf5`; `--text-secondary`: `#8b96ab`.
- `--surface`: tono ligeramente más claro que `--bg-base` para tarjetas/paneles, con sombra suave hacia abajo y borde de 1px casi invisible (`rgba(255,255,255,0.06)`) que se ilumina en índigo al hover/focus.
- Tipografía: `Inter` (Google Fonts con fallback a `system-ui`), pesos 400/500/600/700. Header en 600-700 con `letter-spacing` ligeramente negativo.

## Componentes

**Header** — Título 28-32px/600 con degradado de texto sutil (blanco → azul claro, `background-clip: text`). Subtítulo en `--text-secondary` con `letter-spacing` ampliado. Fondo con gradiente radial fijo detrás de `#root`.

**Panes de texto (original/traducción)** — Tarjetas con radio 12-14px, borde casi invisible que se ilumina en índigo (`box-shadow` glow, transición 200ms) al hacer foco en el textarea. Label con indicador de color por idioma. Padding generoso en el textarea, `line-height` cómodo, placeholder en itálica sutil.

**Botón Intercambiar** — El ícono rota 180° al hacer clic con un pequeño "bounce" al terminar (animación vía `@keyframes` + clase temporal en React, o `:active`/transform). Fondo con tinte índigo sutil en hover.

**Botón "Analizar y corregir"** — Fondo con gradiente índigo (no color plano). Elevación en hover (`translateY` + sombra). Estado de carga con spinner/pulso sutil en vez de solo texto "Analizando…".

**Panel de análisis** — Al aparecer un resultado, el contenedor se expande con transición de alto usando el truco `grid-template-rows: 0fr → 1fr` (en vez de aparecer de golpe). Las tarjetas `.explanation` entran con fade + slide-up escalonado (`animation-delay` incremental ~60ms por índice, usando `style={{ animationDelay: ... }}` inline o `nth-child`). Los `.tag` usan `--accent` en vez del azul plano actual. El `.tip` tiene fondo verde muy sutil (no solo texto verde).

**Estado vacío / errores** — Mensaje vacío se mantiene discreto, puede sumar un ícono sutil. Los mensajes de error tienen una micro-animación de "shake" leve al aparecer (`@keyframes shake`, duración corta, sin repetición).

## Animación — resumen técnico

Todas vía CSS (`@keyframes` + `transition`), disparadas por clases que React ya puede aplicar según estado existente (no se requiere nuevo estado más allá de, como mucho, una clase temporal para el bounce del botón swap):

- Rotación + bounce del ícono de intercambio.
- Expansión de alto del panel de análisis (grid-rows trick).
- Fade + slide-up escalonado de las tarjetas de explicación.
- Shake sutil en mensajes de error.
- Transiciones de 150-250ms en hover/focus (bordes, sombras, elevación de botón).

## Fuera de alcance

- No se cambia el layout/estructura de secciones.
- No se cambia lógica de negocio, llamadas a API, ni el componente `App.tsx` más allá de clases/atributos necesarios para disparar animaciones.
- No se agrega toggle de tema claro/oscuro (se mantiene solo oscuro).
- No se agregan dependencias nuevas (sin Framer Motion, sin librerías de componentes).

## Responsive

Sin cambios: se mantiene el breakpoint `900px` a una columna. Las animaciones y estilos se preservan en ese modo.
