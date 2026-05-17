# Gasti

Gasti es una aplicacion web local para registrar gastos personales. El MVP esta
construido con Next.js, TypeScript, Tailwind CSS y LocalStorage.

No tiene backend, base de datos ni login todavia. Los datos se guardan en el
navegador donde se usa la app.

## Caracteristicas

- Registro manual de gastos con monto, categoria, descripcion, fecha y medio de
  pago.
- Dashboard con total del mes, total por categoria y ultimos gastos.
- Lista de gastos registrados con opcion de eliminar.
- Moneda en soles peruanos.
- UI mobile-first con dark mode opcional.
- PWA instalable con manifest, service worker e iconos.
- Persistencia local usando LocalStorage.

## Requisitos

- Node.js 20 o superior.
- npm.

## Instalacion

Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/gasti.git
cd gasti
```

Instala dependencias:

```bash
npm install
```

## Ejecucion local

Levanta el servidor de desarrollo:

```bash
npm run dev
```

Abre la app en:

```text
http://localhost:3000
```

Para probarla desde un celular en la misma red WiFi:

```bash
npm run dev -- --hostname 0.0.0.0
```

Luego abre en el celular la IP local de tu computador, por ejemplo:

```text
http://192.168.0.146:3000
```

## Scripts disponibles

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run icons
```

- `npm run dev`: ejecuta Next.js en modo desarrollo.
- `npm run lint`: valida el codigo con ESLint.
- `npm run build`: compila la app para produccion.
- `npm run start`: ejecuta la build de produccion.
- `npm run icons`: regenera los iconos PNG de la PWA desde el SVG.

## Build de produccion

Antes de desplegar, valida que compile:

```bash
npm run build
```

## Deploy gratis en Vercel

1. Crea un repositorio en GitHub.
2. Sube este proyecto al repositorio.
3. Entra a [Vercel](https://vercel.com).
4. Elige `Add New Project`.
5. Importa el repositorio de GitHub.
6. Vercel detectara Next.js automaticamente.
7. Usa la configuracion por defecto:
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Install Command: `npm install`
   - Output Directory: dejar vacio
8. Haz click en `Deploy`.

No necesitas configurar variables de entorno para este MVP.

## PWA

La configuracion PWA vive en:

- `public/manifest.json`
- `public/sw.js`
- `public/gasti-icon.svg`
- `public/gasti-icon-192.png`
- `public/gasti-icon-512.png`

En produccion, el navegador puede ofrecer instalar Gasti como app. La
persistencia sigue siendo LocalStorage, asi que los gastos quedan guardados en
cada dispositivo/navegador por separado.

## Estructura principal

```text
src/app/page.tsx              Pantalla principal del MVP
src/app/layout.tsx            Layout raiz y metadata PWA
src/app/globals.css           Tailwind y estilos globales
docs/learning-notes.md        Guia para estudiar el codigo por capas
public/manifest.json          Manifest PWA
public/sw.js                  Service worker basico
public/gasti-icon.svg         Icono fuente de la app
scripts/generate-pwa-icons.mjs Generador de iconos PNG
```

## Como estudiar el codigo

Lee primero [docs/learning-notes.md](docs/learning-notes.md). La guia explica el
flujo de datos, los hooks usados, el uso de LocalStorage, la UI mobile-first y la
parte PWA.

## Roadmap

- Mantener LocalStorage para el MVP.
- Agregar filtros y edicion de gastos.
- Agregar reportes mensuales.
- Agregar backend y autenticacion mas adelante.
