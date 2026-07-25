# TranslateAI (Aprendiz de Inglés)

Aplicación web educativa enfocada en traducir, corregir y explicar textos de manera didáctica. Interfaz con dos textareas (original y traducción) y un panel inferior de análisis con explicaciones.

## Requisitos
- Node.js >= 18
- pnpm
- Clave de Groq (`GROQ_API_KEY`) — https://console.groq.com

## Configuración rápida
1. Copia `.env.example` a `.env` en el raíz y coloca tu clave:
```
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.1-8b-instant
SERVER_PORT=3000
CORS_ORIGIN=http://localhost:5173
```
2. Instala dependencias:
```bash
pnpm install
```
3. (Primera vez) Genera el cliente con Vite si aún no existe (lo hará el setup inicial).
4. Ejecuta en desarrollo (servidor + cliente):
```bash
pnpm dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

Funciones clave
- Intercambio de idiomas (es ↔ en) con un botón.
- Autotraducción en tiempo real mientras escribes (solo traducción; la IA completa se ejecuta al pulsar “Analizar y corregir”).
- Panel inferior con corrección del texto original, corrección de traducción y explicaciones didácticas en español.

## Arquitectura
- Monorepo pnpm workspaces: `server` (Express + Groq, vía SDK de OpenAI apuntando a `api.groq.com`) y `client` (Vite + React + TS).
- El backend expone `POST /api/analyze` que devuelve JSON estructurado con:
  - `translation`
  - `originalCorrection`
  - `translationCorrection`
  - `explanations[]` (qué, por qué, cómo)
  - `languageLevel`

## Seguridad
- La clave de Groq va solo en el backend (.env). No la expongas en el cliente.
- CORS restringido a `http://localhost:5173` por defecto.
- Rate limiting habilitado para evitar abuso.

## Personalización
- Cambia el modelo en `.env` (`GROQ_MODEL`).
- Ajusta CORS en `.env` (`CORS_ORIGIN`).

## Roadmap
- Niveles (A1–C2) y feedback adaptativo
- Otros idiomas y direcciones de traducción
- Audio (text-to-speech y pronunciación)
