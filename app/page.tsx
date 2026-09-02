"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const promoTypes = [
  {
    icon: "🍔",
    title: "Ofertas diarias",
    description: "Recompensas visibles que te esperan para la próxima vez que salgas a comer.",
    accent: "lime",
  },
  {
    icon: "🎁",
    title: "Recompensas sorpresa",
    description: "Abre una sorpresa y descubre algo que te haga volver.",
    accent: "purple",
  },
  {
    icon: "🔥",
    title: "Lanzamientos limitados",
    description: "Ventanas exclusivas que generan urgencia y emoción real.",
    accent: "orange",
  },
  {
    icon: "⭐",
    title: "Desbloqueos de fidelidad",
    description: "Sigue explorando y acumula más valor en tus lugares favoritos.",
    accent: "gold",
  },
];

const discoverySteps = [
  { step: "01", label: "Entrar", detail: "Explora un restaurante o vecindario." },
  { step: "02", label: "Descubrir", detail: "Encuentra una recompensa que valga la pena explorar." },
  { step: "03", label: "Desbloquear", detail: "Revela lo que hace especial a ese lugar." },
  { step: "04", label: "Disfrutar", detail: "Úsalo en la vida real y prolonga el momento." },
];

const howItWorks = [
  { id: "01", title: "Explora", detail: "Encuentra restaurantes cerca de ti" },
  { id: "02", title: "Descubre", detail: "Abre el Promo World de ese lugar" },
  { id: "03", title: "Canjea", detail: "Desbloquea tu recompensa en segundos" },
  { id: "04", title: "Disfruta", detail: "Escanea el QR, canjea y ahorra" },
];

const liveActivity = [
  { name: "Sofía", action: "descubrió", reward: "POSTRE GRATIS", time: "hace 2 min" },
  { name: "Marcos", action: "canjeó", reward: "20% OFF", time: "hace 5 min" },
  { name: "Coffee Lab", action: "abrió", reward: "Recompensa sorpresa", time: "Justo ahora" },
];

const merchantBenefits = [
  "Genera atención, no solo descuentos",
  "Haz que las promociones sean memorables",
  "Entiende con qué interactúan tus clientes",
  "Paga solo por canjes reales",
];

const trustPoints = [
  "Sin suscripciones",
  "Sin números falsos",
  "Paga solo por promociones canjeadas",
];

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.6 },
};

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#070707] text-[#f5f5f5]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora aurora--orange" />
        <div className="aurora aurora--violet" />
        <div className="aurora aurora--lime" />
        <div className="aurora-grid" />
      </div>

      <header className="relative z-10 mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between rounded-full border border-white/10 bg-white/3 px-4 py-2.5 shadow-[0_0_40px_rgba(17,17,17,0.7)] backdrop-blur-sm">
          <Link href="/" className="text-lg font-black tracking-[-0.08em] text-[#f5f5f5]">
            bonix
          </Link>

          <div className="hidden items-center gap-6 text-sm text-[#d1d1d1] md:flex">
            <Link href="#promo-worlds" className="transition hover:text-white">
              Promo Worlds
            </Link>
            <Link href="#how-it-works" className="transition hover:text-white">
              Cómo funciona
            </Link>
            <Link href="#merchants" className="transition hover:text-white">
              Para negocios
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-full border border-white/10 px-3 py-2 text-xs font-medium text-[#f5f5f5] transition hover:border-white/20 hover:bg-white/5 sm:px-4"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/install"
              className="rounded-full bg-[#d7ff00] px-3 py-2 text-xs font-bold text-[#111111] transition hover:brightness-110 sm:px-4"
            >
              Explorar Bonix
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <motion.div {...fadeInUp} className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d7ff00]/30 bg-[#d7ff00]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d7ff00]">
              Descubrimiento gastronómico × recompensas interactivas
            </div>

            <h1 className="mt-6 text-[2.8rem] font-black leading-[0.9] tracking-[-0.08em] text-white sm:text-[4.5rem] lg:text-[6rem]">
              TU PRÓXIMA
              <span className="block text-[#d7ff00]">COMIDA</span>
              <span className="block">ESTÁ</span>
              <span className="block text-[#ff7a00]">OCULTA.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg text-[#d1d1d1] sm:text-xl">
              Descubre restaurantes. Explora sus mundos. Desbloquea recompensas exclusivas.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/install"
                className="rounded-full bg-[#d7ff00] px-6 py-3.5 text-center text-sm font-bold text-[#111111] transition hover:brightness-110"
              >
                Explorar Bonix
              </Link>
              <Link
                href="/install"
                className="rounded-full border border-white/15 bg-white/2 px-6 py-3.5 text-center text-sm font-medium text-white transition hover:border-white/25 hover:bg-white/5"
              >
                Soy un restaurante
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-xs uppercase tracking-[0.18em] text-[#9ca3af]">
              <span>1.5k+ promos en vivo</span>
              <span>•</span>
              <span>Descubrimiento local</span>
              <span>•</span>
              <span>Recompensas instantáneas</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <div className="orb-card">
              <div className="orb-card__glow" />

              <div className="world-badge world-badge--top">🍔 Burger House</div>
              <div className="world-badge world-badge--mid">🎁 Drop sorpresa</div>
              <div className="world-badge world-badge--bottom">☕ Coffee Lab</div>

              <div className="world-scene">
                <div className="world-card world-card--eat">
                  <span className="world-card__label">20% OFF</span>
                  <span className="world-card__emoji">🍔</span>
                </div>

                <div className="world-card world-card--gift">
                  <span className="world-card__label">Sorpresa</span>
                  <span className="world-card__emoji">🎁</span>
                </div>

                <div className="world-card world-card--drink">
                  <span className="world-card__label">Bebida gratis</span>
                  <span className="world-card__emoji">🥤</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <motion.section {...fadeInUp} className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-[#9ca3af]">
          <span className="h-px w-10 bg-white/15" />
          La diferencia
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="compare-panel compare-panel--old">
            <p className="text-xs uppercase tracking-[0.24em] text-[#9ca3af]">Viejo sistema</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.06em] text-white">Plano. Estático. Olvidable.</h2>
            <div className="mt-6 space-y-3">
              {[
                "[ 20% OFF ]",
                "[ BEBIDA GRATIS ]",
                "[ HAPPY HOUR ]",
                "[ LLEVA 1 Y LLEVA 2 ]",
              ].map((item) => (
                <div key={item} className="compare-pill compare-pill--muted">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="compare-panel compare-panel--new">
            <p className="text-xs uppercase tracking-[0.24em] text-[#d7ff00]">Bonix</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.06em] text-white">Interactivo. Descubrible. Recompensante.</h2>
            <div className="mt-6 space-y-4">
              <div className="compare-journey">
                <span>🍔</span>
                <span>Explora el restaurante</span>
              </div>
              <div className="compare-journey">
                <span>🎁</span>
                <span>Descubre la recompensa</span>
              </div>
              <div className="compare-journey">
                <span>✨</span>
                <span>Cámbiala</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        id="promo-worlds"
        {...fadeInUp}
        className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="mb-10 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.24em] text-[#d7ff00]">Promo Worlds</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.07em] text-white sm:text-5xl">
            Cada restaurante tiene un mundo para explorar.
          </h2>
        </div>

        <div className="promo-world-demo">
          <div className="promo-world-demo__content">
            <div className="promo-world-demo__header">
              <div>
                <span className="text-[10px] uppercase tracking-[0.26em] text-[#9ca3af]">Burger House</span>
                <h3 className="mt-2 text-3xl font-black tracking-[-0.06em] text-white">Skyline Grill</h3>
              </div>
              <div className="rounded-full border border-[#d7ff00]/40 bg-[#d7ff00]/10 px-3 py-1 text-xs font-semibold uppercase text-[#d7ff00]">
                En vivo
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="promo-world-card promo-world-card--burger">
                <span className="promo-world-card__emoji">🍔</span>
                <span className="promo-world-card__title">20% OFF</span>
              </div>
              <div className="promo-world-card promo-world-card--gift">
                <span className="promo-world-card__emoji">🎁</span>
                <span className="promo-world-card__title">Recompensa sorpresa</span>
              </div>
              <div className="promo-world-card promo-world-card--drink">
                <span className="promo-world-card__emoji">🥤</span>
                <span className="promo-world-card__title">Bebida gratis</span>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between rounded-full border border-white/10 bg-[#0f0f0f] px-4 py-3 text-sm text-[#d1d1d1]">
              <span>Arrastra para explorar</span>
              <span className="text-[#d7ff00]">→</span>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section {...fadeInUp} className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-8 max-w-xl">
          <p className="text-xs uppercase tracking-[0.24em] text-[#d7ff00]">Descubre, no busques</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.07em] text-white sm:text-5xl">
            No necesitas saber lo que estás buscando.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {discoverySteps.map((item) => (
            <div key={item.step} className="discovery-step">
              <span className="text-[10px] uppercase tracking-[0.28em] text-[#9ca3af]">{item.step}</span>
              <h3 className="mt-4 text-2xl font-black tracking-[-0.06em] text-white">{item.label}</h3>
              <p className="mt-3 text-sm text-[#d1d1d1]">{item.detail}</p>
              <div className="mt-6 h-24 rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%),linear-gradient(135deg,#121212,#171717)]" />
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section {...fadeInUp} className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 max-w-xl">
          <p className="text-xs uppercase tracking-[0.24em] text-[#d7ff00]">¿Qué encontrarás?</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.07em] text-white sm:text-5xl">
            Recompensas que se sienten más como una colección.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {promoTypes.map((promo) => (
            <div key={promo.title} className={`promo-card promo-card--${promo.accent}`}>
              <div className="promo-card__icon">{promo.icon}</div>
              <h3 className="mt-5 text-2xl font-black tracking-[-0.05em] text-white">{promo.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#d1d1d1]">{promo.description}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#f5f5f5]">
                Explorar <span aria-hidden="true">→</span>
              </span>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section id="how-it-works" {...fadeInUp} className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-[#d7ff00]">De la exploración a la cena</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.07em] text-white sm:text-5xl">
            Bonix hace que el recorrido se sienta sencillo.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {howItWorks.map((item) => (
            <div key={item.id} className="how-step">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.28em] text-[#9ca3af]">{item.id}</span>
                <div className="h-px w-10 bg-white/15" />
              </div>
              <div className="mt-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#d7ff00]/25 bg-[#d7ff00]/10 text-2xl">
                {item.id === "01" ? "🗺️" : item.id === "02" ? "🎁" : item.id === "03" ? "📱" : "🍽️"}
              </div>
              <h3 className="mt-6 text-2xl font-black tracking-[-0.05em] text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-[#d1d1d1]">{item.detail}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section {...fadeInUp} className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="phone-showcase">
            <div className="phone-shell">
              <div className="phone-screen">
                <div className="screen-topbar">
                  <span>9:41</span>
                  <span>Bonix</span>
                </div>
                <div className="screen-card screen-card--primary">
                  <span className="screen-card__badge">Live promo</span>
                  <div className="screen-card__icon">🍔</div>
                  <p className="screen-card__title">Burger House</p>
                  <p className="screen-card__meta">20% off • today</p>
                </div>
                <div className="screen-grid">
                  <div className="mini-tile">🎁</div>
                  <div className="mini-tile">☕</div>
                  <div className="mini-tile">🔥</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#d7ff00]">Experiencia móvil</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.07em] text-white sm:text-5xl">
              El descubrimiento encaja de forma natural en el mundo real.
            </h2>
            <p className="mt-5 max-w-lg text-lg text-[#d1d1d1]">
              Explora restaurantes cercanos, descubre ofertas en mundos interactivos y canjéalas con un QR rápido.
            </p>
            <div className="mt-8 space-y-3">
              <div className="feature-chip">Explora Promo Worlds</div>
              <div className="feature-chip">Desbloquea recompensas al instante</div>
              <div className="feature-chip">Ahorra donde ya comes</div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section {...fadeInUp} className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="wallet-panel">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#9ca3af]">Billetera Bonix</p>
              <h2 className="mt-2 text-4xl font-black tracking-[-0.07em] text-white sm:text-5xl">
                Cada descubrimiento puede llevarte a algo más.
              </h2>
            </div>
            <div className="rounded-full border border-[#ff7a00]/25 bg-[#ff7a00]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#ffb066]">
              + $42.80
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-white/10 bg-[#111111] p-6 shadow-[0_30px_70px_rgba(0,0,0,0.45)]">
              <div className="flex items-center justify-between text-[#d1d1d1]">
                <span className="text-sm uppercase tracking-[0.24em]">Recompensas</span>
                <span className="text-sm">12 acumuladas</span>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  ["🍔", "20% OFF", "Pocitos Grill"],
                  ["☕", "Café gratis", "Cafe Centro"],
                  ["🎁", "Recompensa sorpresa", "Abre la caja"],
                ].map(([emoji, title, detail]) => (
                  <div key={title} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#171717] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d7ff00]/10 text-lg">{emoji}</span>
                      <div>
                        <p className="font-semibold text-white">{title}</p>
                        <p className="text-xs text-[#9ca3af]">{detail}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-[#d7ff00]">Listo</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#d7ff00]/20 bg-[radial-gradient(circle_at_top,_rgba(215,255,0,0.18),_transparent_55%),#0f0f0f] p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-[#d7ff00]">Impacto total</p>
              <div className="mt-4 text-5xl font-black tracking-[-0.08em] text-white">$1,480</div>
              <p className="mt-3 text-sm text-[#d1d1d1]">valor acumulado en establecimientos asociados</p>
              <div className="mt-6 space-y-3 text-sm text-[#d1d1d1]">
                <div className="flex items-center justify-between rounded-full border border-white/10 bg-[#171717] px-3 py-2">
                  <span>Recompensas de comida</span>
                  <span className="font-semibold text-white">$820</span>
                </div>
                <div className="flex items-center justify-between rounded-full border border-white/10 bg-[#171717] px-3 py-2">
                  <span>Cashback</span>
                  <span className="font-semibold text-white">$460</span>
                </div>
                <div className="flex items-center justify-between rounded-full border border-white/10 bg-[#171717] px-3 py-2">
                  <span>Bonos extra</span>
                  <span className="font-semibold text-white">$200</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section id="merchants" {...fadeInUp} className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#d7ff00]">Para negocios</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.07em] text-white sm:text-5xl">
              Tu restaurante merece algo más que otra lista de descuentos.
            </h2>
            <p className="mt-5 max-w-md text-lg text-[#d1d1d1]">
              Convierte promociones en experiencias, mantén a tus clientes enganchados y paga solo cuando canjean.
            </p>
          </div>

          <div className="space-y-4">
            <div className="merchant-flow">
              <span>Crea oferta</span>
              <span>→</span>
              <span>Colócala en tu mundo</span>
              <span>→</span>
              <span>Los clientes la descubren</span>
              <span>→</span>
              <span>Paga solo por resultados</span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {merchantBenefits.map((benefit) => (
                <div key={benefit} className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-4 text-sm text-[#f5f5f5]">
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section {...fadeInUp} className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.24em] text-[#d7ff00]">Actividad en vivo</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.07em] text-white sm:text-5xl">
            Bonix está pasando ahora mismo.
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {liveActivity.map((entry) => (
            <div key={`${entry.name}-${entry.reward}`} className="activity-card">
              <div className="mb-5 flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d7ff00]/15 text-lg font-bold text-[#d7ff00]">
                  {entry.name.slice(0, 1)}
                </span>
                <span className="text-[10px] uppercase tracking-[0.22em] text-[#9ca3af]">En vivo</span>
              </div>

              <p className="text-white">
                <span className="font-semibold">{entry.name}</span> {entry.action}
              </p>
              <p className="mt-3 text-2xl font-black tracking-[-0.06em] text-[#d7ff00]">{entry.reward}</p>
              <p className="mt-4 text-sm text-[#9ca3af]">{entry.time}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-28 pt-14 sm:px-6 lg:px-8 lg:pb-32 lg:pt-20">
        <div className="cta-panel">
          <div className="cta-panel__content">
            <p className="text-xs uppercase tracking-[0.24em] text-[#d7ff00]">Bonix</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.07em] text-white sm:text-5xl">
              Hay mucho más esperando en tu próximo restaurante.
            </h2>
            <p className="mt-4 text-lg text-[#d1d1d1]">Ve a descubrirlo.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/install"
                className="rounded-full bg-[#d7ff00] px-6 py-3.5 text-center text-sm font-bold text-[#111111] transition hover:brightness-110"
              >
                Explorar Bonix
              </Link>
              <Link
                href="/register"
                className="rounded-full border border-white/15 bg-[#111111]/60 px-6 py-3.5 text-center text-sm font-medium text-white transition hover:border-white/25 hover:bg-white/5"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-[#070707]/90 p-4 backdrop-blur-md sm:hidden">
        <Link
          href="/install"
          className="block w-full rounded-full bg-[#d7ff00] py-3.5 text-center text-sm font-bold text-[#111111]"
        >
          Instalar Bonix
        </Link>
      </section>
    </main>
  );
}
