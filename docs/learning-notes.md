# Guia para estudiar Gasti

Esta guia esta pensada para leer el proyecto en capas. La idea es que puedas
entender primero el flujo de datos y luego la experiencia visual.

## 1. Punto de entrada

Empieza por `src/app/page.tsx`.

La primera linea importante es:

```tsx
"use client";
```

Next.js App Router renderiza componentes en el servidor por defecto. Gasti usa
APIs del navegador como `localStorage`, `crypto.randomUUID`,
`navigator.serviceWorker` y eventos de formulario. Por eso esta pantalla debe
ser un Client Component.

## 2. Modelo de datos

Busca los tipos `Expense`, `ExpenseForm` y `Category`.

- `Expense` representa un gasto ya guardado.
- `ExpenseForm` representa el estado temporal del formulario.
- `Category` agrega datos visuales a cada categoria: label, emoji y tono.

Separar el gasto guardado del formulario evita mezclar strings de inputs con
valores finales como `amount: number`.

## 3. Constantes de negocio y UI

Luego revisa:

- `categories`
- `paymentMethods`
- `currencyFormatter`
- `dateFormatter`

Aqui estan las decisiones faciles de cambiar sin tocar el render principal:
categorias, emojis, medios de pago y formato de moneda.

## 4. Funciones puras

Lee estas funciones antes del componente:

- `getToday`
- `createEmptyForm`
- `formatCurrency`
- `formatDate`
- `parseAmount`
- `isSameMonth`
- `getCategory`
- `cn`

Son funciones pequenas y testeables. Si mas adelante agregamos tests, estas son
las mejores candidatas para empezar.

La mas importante para dinero es `parseAmount`: convierte coma a punto y redondea
a centavos antes de guardar.

## 5. Estado principal

Dentro de `Home`, mira primero los `useState`:

```tsx
const [expenses, setExpenses] = useState<Expense[]>([]);
const [form, setForm] = useState<ExpenseForm>(() => createEmptyForm());
const [isLoaded, setIsLoaded] = useState(false);
const [isDarkMode, setIsDarkMode] = useState(false);
```

- `expenses`: fuente de verdad de los gastos.
- `form`: valores actuales del formulario.
- `isLoaded`: evita escribir LocalStorage antes de leerlo.
- `isDarkMode`: controla la clase `dark`.

## 6. LocalStorage

Hay dos efectos principales:

- uno lee `localStorage` al cargar la pantalla;
- otro guarda `expenses` cada vez que cambia.

Esto mantiene el MVP sin backend. La desventaja es que los datos viven solo en
ese navegador y dispositivo.

## 7. Valores derivados con useMemo

Despues aparecen:

- `currentMonthExpenses`
- `totalThisMonth`
- `totalsByCategory`
- `latestExpenses`

Estos valores no se guardan en estado porque se pueden calcular desde
`expenses`. Esa es una regla practica en React: si algo se deriva de otro estado,
normalmente no necesitas otro `useState`.

## 8. Acciones del usuario

Lee en este orden:

- `updateForm`
- `handleSubmit`
- `deleteExpense`

El flujo de registrar un gasto es:

1. el usuario escribe en inputs;
2. `updateForm` actualiza `form`;
3. submit llama `handleSubmit`;
4. se parsea el monto;
5. se crea un `Expense`;
6. se agrega al inicio de `expenses`;
7. el formulario se reinicia.

## 9. Componentes visuales

Antes del render principal estan:

- `AppCard`
- `IconButton`
- `FieldLabel`
- `BottomNav`
- `FloatingAddButton`

Son componentes pequenos para evitar repetir clases de Tailwind en todas partes.
No son abstracciones profundas; solo reducen ruido visual.

## 10. Layout de la pantalla

El JSX principal tiene cuatro zonas:

- header;
- dashboard;
- formulario;
- historial;
- navegacion inferior mobile.

La app esta pensada mobile-first: primero se ve bien en celular y luego se adapta
a pantallas grandes con clases como `sm:` y `md:`.

## 11. PWA

La parte PWA vive en:

- `public/manifest.json`
- `public/sw.js`
- `src/app/layout.tsx`
- `public/gasti-icon.svg`
- `public/gasti-icon-192.png`
- `public/gasti-icon-512.png`

`manifest.json` describe la app instalable. `sw.js` es el service worker basico.
`layout.tsx` conecta metadata, manifest, iconos y theme color con Next.js.

## 12. Orden recomendado para leer commits

Cuando revises la historia Git, leela de abajo hacia arriba:

1. configuracion base del proyecto;
2. MVP de gastos;
3. experiencia visual mobile-first;
4. PWA;
5. documentacion de aprendizaje y deploy.

Ese orden replica la forma natural de construir una app: base, comportamiento,
experiencia, instalacion y documentacion.
