"use client";

// This page uses browser-only APIs such as localStorage and serviceWorker.
// In Next.js App Router, that means the component must run on the client.
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CreditCard,
  House,
  List,
  Moon,
  Plus,
  Sparkles,
  Sun,
  Trash2,
  WalletCards,
} from "lucide-react";

type Expense = {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMethod: string;
};

type ExpenseForm = {
  amount: string;
  category: string;
  description: string;
  date: string;
  paymentMethod: string;
};

type Category = {
  label: string;
  emoji: string;
  tone: string;
};

const STORAGE_KEY = "gasti.expenses";

const categories: Category[] = [
  { label: "Comida", emoji: "🍔", tone: "bg-orange-100 text-orange-900" },
  { label: "Transporte", emoji: "🚕", tone: "bg-yellow-100 text-yellow-900" },
  { label: "Compras", emoji: "🛍️", tone: "bg-pink-100 text-pink-900" },
  {
    label: "Entretenimiento",
    emoji: "🎮",
    tone: "bg-violet-100 text-violet-900",
  },
  { label: "Salud", emoji: "🏥", tone: "bg-rose-100 text-rose-900" },
  { label: "Servicios", emoji: "💡", tone: "bg-sky-100 text-sky-900" },
  { label: "Hogar", emoji: "🏠", tone: "bg-emerald-100 text-emerald-900" },
  { label: "Otros", emoji: "✨", tone: "bg-slate-100 text-slate-800" },
];

const paymentMethods = [
  "Efectivo",
  "Tarjeta debito",
  "Tarjeta credito",
  "Transferencia",
  "Yape",
];

const currencyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function createEmptyForm(): ExpenseForm {
  return {
    amount: "",
    category: categories[0].label,
    description: "",
    date: getToday(),
    paymentMethod: paymentMethods[0],
  };
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return dateFormatter.format(date);
}

function parseAmount(value: string) {
  const normalizedValue = value.replace(",", ".");
  // Money should be rounded to cents before saving to avoid decimal surprises.
  const cents = Math.round(Number(normalizedValue) * 100);

  if (!Number.isFinite(cents) || cents <= 0) {
    return 0;
  }

  return cents / 100;
}

function isSameMonth(dateValue: string, currentDate: Date) {
  const expenseDate = new Date(`${dateValue}T00:00:00`);

  return (
    expenseDate.getMonth() === currentDate.getMonth() &&
    expenseDate.getFullYear() === currentDate.getFullYear()
  );
}

function getCategory(categoryLabel: string) {
  return categories.find((category) => category.label === categoryLabel);
}

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function AppCard({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-black/5 bg-white/90 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-900/80 dark:shadow-none",
        className,
      )}
      id={id}
    >
      {children}
    </section>
  );
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
      {children}
    </span>
  );
}

function BottomNav() {
  const items = [
    { href: "#inicio", icon: House, label: "Inicio" },
    { href: "#registro", icon: Plus, label: "Registrar" },
    { href: "#dashboard", icon: BarChart3, label: "Resumen" },
    { href: "#gastos", icon: List, label: "Gastos" },
  ];

  return (
    <nav className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-20 grid grid-cols-4 rounded-lg border border-black/5 bg-white/95 p-1 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur md:hidden dark:border-white/10 dark:bg-slate-950/95">
      {items.map((item) => (
        <a
          className="flex h-12 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          href={item.href}
          key={item.label}
        >
          <item.icon aria-hidden="true" size={18} strokeWidth={2} />
          {item.label}
        </a>
      ))}
    </nav>
  );
}

function FloatingAddButton() {
  return (
    <a
      aria-label="Registrar gasto rapido"
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+5rem)] right-4 z-30 grid h-14 w-14 place-items-center rounded-lg bg-emerald-500 text-white shadow-[0_18px_35px_rgba(16,185,129,0.35)] transition hover:-translate-y-1 hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-200 md:bottom-6 md:right-6 dark:bg-emerald-400 dark:text-slate-950 dark:focus:ring-emerald-400/20"
      href="#registro"
      title="Registrar gasto rapido"
    >
      <Plus aria-hidden="true" size={28} strokeWidth={2.4} />
    </a>
  );
}

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState<ExpenseForm>(() => createEmptyForm());
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      // localStorage exists only in the browser, so we read it after mount.
      const savedExpenses = window.localStorage.getItem(STORAGE_KEY);

      if (savedExpenses) {
        try {
          setExpenses(JSON.parse(savedExpenses));
        } catch {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }

      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // The service worker is what lets the browser treat Gasti as installable.
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    }
  }, [expenses, isLoaded]);

  const currentMonthExpenses = useMemo(() => {
    // useMemo keeps derived dashboard values separate from the source state.
    const today = new Date();
    return expenses.filter((expense) => isSameMonth(expense.date, today));
  }, [expenses]);

  const totalThisMonth = useMemo(() => {
    return currentMonthExpenses.reduce((total, expense) => {
      return total + expense.amount;
    }, 0);
  }, [currentMonthExpenses]);

  const totalsByCategory = useMemo(() => {
    return categories
      .map((category) => {
        const total = currentMonthExpenses
          .filter((expense) => expense.category === category.label)
          .reduce((sum, expense) => sum + expense.amount, 0);

        return { ...category, total };
      })
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [currentMonthExpenses]);

  const latestExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [expenses]);

  function updateForm(field: keyof ExpenseForm, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = parseAmount(form.amount);

    if (!amount || amount <= 0) {
      return;
    }

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      amount,
      category: form.category,
      description: form.description.trim() || "Sin descripcion",
      date: form.date,
      paymentMethod: form.paymentMethod,
    };

    setExpenses((currentExpenses) => [newExpense, ...currentExpenses]);
    setForm(createEmptyForm());
  }

  function deleteExpense(id: string) {
    setExpenses((currentExpenses) => {
      return currentExpenses.filter((expense) => expense.id !== id);
    });
  }

  return (
    <main
      className={cn(
        "min-h-dvh scroll-smooth bg-[#f7f2ea] text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-white",
        isDarkMode && "dark",
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pb-[calc(env(safe-area-inset-bottom)+7rem)] pt-4 sm:px-6 md:gap-6 md:pb-10 lg:px-8">
        <header
          className="flex items-center justify-between gap-4 py-2"
          id="inicio"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-slate-950 text-white shadow-lg shadow-slate-300/60 dark:bg-white dark:text-slate-950 dark:shadow-none">
              <WalletCards aria-hidden="true" size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-300">
                Gasti
              </p>
              <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">
                Tu dinero, claro
              </h1>
            </div>
          </div>

          <IconButton
            label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            onClick={() => setIsDarkMode((currentValue) => !currentValue)}
          >
            {isDarkMode ? (
              <Sun aria-hidden="true" size={18} />
            ) : (
              <Moon aria-hidden="true" size={18} />
            )}
          </IconButton>
        </header>

        <section
          className="grid gap-4 md:grid-cols-[1fr_1.1fr]"
          id="dashboard"
        >
          <section className="overflow-hidden rounded-lg border border-black/5 bg-slate-950 text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-white dark:text-slate-950">
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-emerald-200 dark:text-emerald-700">
                    Gastado este mes
                  </p>
                  <p className="mt-3 text-[clamp(2rem,11vw,3rem)] font-semibold tracking-normal sm:text-5xl">
                    {formatCurrency(totalThisMonth)}
                  </p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 dark:bg-slate-100">
                  <BarChart3 aria-hidden="true" size={20} />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white/10 p-3 dark:bg-slate-100">
                  <p className="text-xs text-slate-300 dark:text-slate-500">
                    Movimientos
                  </p>
                  <p className="mt-1 text-xl font-semibold">
                    {currentMonthExpenses.length}
                  </p>
                </div>
                <div className="rounded-lg bg-white/10 p-3 dark:bg-slate-100">
                  <p className="text-xs text-slate-300 dark:text-slate-500">
                    Categorias
                  </p>
                  <p className="mt-1 text-xl font-semibold">
                    {totalsByCategory.length}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <AppCard>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold">Por categoria</h2>
                <Sparkles
                  aria-hidden="true"
                  className="text-amber-500"
                  size={18}
                />
              </div>

              <div className="mt-4 grid gap-3">
                {totalsByCategory.length === 0 ? (
                  <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Registra tu primer gasto para ver el resumen.
                  </p>
                ) : (
                  totalsByCategory.map((item) => (
                    <div className="grid gap-2" key={item.label}>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex items-center gap-2 font-medium">
                          <span>{item.emoji}</span>
                          {item.label}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {formatCurrency(item.total)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-md bg-emerald-500 transition-all duration-500"
                          style={{
                            width: `${Math.max(
                              (item.total / totalThisMonth) * 100,
                              8,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </AppCard>

            <AppCard>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold">Ultimos gastos</h2>
                <CalendarDays
                  aria-hidden="true"
                  className="text-sky-500"
                  size={18}
                />
              </div>

              <div className="mt-4 grid gap-3">
                {latestExpenses.length === 0 ? (
                  <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Tus movimientos recientes apareceran aqui.
                  </p>
                ) : (
                  latestExpenses.map((expense) => {
                    const category = getCategory(expense.category);

                    return (
                      <div
                        className="flex items-center justify-between gap-3"
                        key={expense.id}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={cn(
                              "grid h-9 w-9 shrink-0 place-items-center rounded-lg text-base",
                              category?.tone,
                            )}
                          >
                            {category?.emoji ?? "✨"}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {expense.description}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {formatDate(expense.date)}
                            </p>
                          </div>
                        </div>
                        <p className="shrink-0 text-sm font-semibold">
                          {formatCurrency(expense.amount)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </AppCard>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
          <AppCard id="registro" className="md:sticky md:top-4 md:self-start">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-300">
                  Registrar
                </p>
                <h2 className="mt-1 text-xl font-semibold">Nuevo gasto</h2>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300">
                <Plus aria-hidden="true" size={20} />
              </div>
            </div>

            <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
              <label className="grid gap-2">
                <FieldLabel>Monto</FieldLabel>
                <div className="flex h-14 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 transition focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:focus-within:bg-slate-900 dark:focus-within:ring-emerald-500/10">
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    S/
                  </span>
                  <input
                    className="min-w-0 flex-1 bg-transparent text-[clamp(1.5rem,8vw,2rem)] font-semibold text-slate-950 outline-none placeholder:text-slate-300 dark:text-white dark:placeholder:text-slate-600"
                    inputMode="decimal"
                    onChange={(event) =>
                      updateForm("amount", event.target.value)
                    }
                    pattern="[0-9]+([.,][0-9]{1,2})?"
                    placeholder="34.50"
                    required
                    type="text"
                    value={form.amount}
                  />
                </div>
              </label>

              <div className="grid gap-2">
                <FieldLabel>Categoria</FieldLabel>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-2">
                  {categories.map((category) => {
                    const isSelected = form.category === category.label;

                    return (
                      <button
                        className={cn(
                          "flex min-h-16 items-center gap-2 rounded-lg border p-3 text-left text-sm font-semibold transition hover:-translate-y-0.5",
                          isSelected
                            ? "border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-300/50 dark:border-white dark:bg-white dark:text-slate-950 dark:shadow-none"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-500",
                        )}
                        key={category.label}
                        onClick={() => updateForm("category", category.label)}
                        type="button"
                      >
                        <span className="text-lg">{category.emoji}</span>
                        <span className="min-w-0 break-words">
                          {category.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="grid gap-2">
                <FieldLabel>Descripcion</FieldLabel>
                <input
                  className="h-12 rounded-lg border border-slate-200 bg-white px-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-emerald-500/10"
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  placeholder="Almuerzo, taxi, mercado..."
                  type="text"
                  value={form.description}
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2">
                  <FieldLabel>Fecha</FieldLabel>
                  <input
                    className="h-12 rounded-lg border border-slate-200 bg-white px-3 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-emerald-500/10"
                    onChange={(event) => updateForm("date", event.target.value)}
                    required
                    type="date"
                    value={form.date}
                  />
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Pago</FieldLabel>
                  <div className="relative">
                    <CreditCard
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <select
                      className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white px-10 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-emerald-500/10"
                      onChange={(event) =>
                        updateForm("paymentMethod", event.target.value)
                      }
                      value={form.paymentMethod}
                    >
                      {paymentMethods.map((paymentMethod) => (
                        <option key={paymentMethod}>{paymentMethod}</option>
                      ))}
                    </select>
                  </div>
                </label>
              </div>

              <button
                className="flex h-12 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-300/60 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-100 dark:bg-white dark:text-slate-950 dark:shadow-none dark:hover:bg-slate-200"
                type="submit"
              >
                <Plus aria-hidden="true" size={18} />
                Registrar gasto
              </button>
            </form>
          </AppCard>

          <AppCard id="gastos" className="p-0">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Historial
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  {expenses.length} movimiento
                  {expenses.length === 1 ? "" : "s"}
                </h2>
              </div>
              <List aria-hidden="true" className="text-slate-400" size={20} />
            </div>

            {expenses.length === 0 ? (
              <div className="grid min-h-52 place-items-center p-6 text-center">
                <div>
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    <WalletCards aria-hidden="true" size={22} />
                  </div>
                  <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                    Aun no hay gastos registrados.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {expenses.map((expense) => {
                  const category = getCategory(expense.category);

                  return (
                    <article
                      className="grid gap-3 p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      key={expense.id}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 gap-3">
                          <span
                            className={cn(
                              "grid h-11 w-11 shrink-0 place-items-center rounded-lg text-lg",
                              category?.tone,
                            )}
                          >
                            {category?.emoji ?? "✨"}
                          </span>
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold">
                              {expense.description}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              {expense.category} · {formatDate(expense.date)}
                            </p>
                          </div>
                        </div>

                        <p className="shrink-0 text-base font-semibold">
                          {formatCurrency(expense.amount)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3 pl-14">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {expense.paymentMethod}
                        </span>
                        <button
                          aria-label={`Eliminar ${expense.description}`}
                          className="grid h-9 w-9 place-items-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                          onClick={() => deleteExpense(expense.id)}
                          title="Eliminar gasto"
                          type="button"
                        >
                          <Trash2 aria-hidden="true" size={17} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </AppCard>
        </section>
      </div>

      <BottomNav />
      <FloatingAddButton />
    </main>
  );
}
