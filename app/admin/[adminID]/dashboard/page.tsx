
"use client";

import { useState } from "react";

type ActivityType =
  | "reservation"
  | "promo"
  | "business"
  | "user";

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  time: string;
  icon: string;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "reservation",
    title: "Nueva reserva",
    description: "María González reservó 2x1 en Hamburguesas",
    time: "Hace 4 min",
    icon: "▣",
  },
  {
    id: "2",
    type: "promo",
    title: "Promo publicada",
    description: "Golden Lunch fue publicada por Tokyo Kitchen",
    time: "Hace 18 min",
    icon: "✦",
  },
  {
    id: "3",
    type: "business",
    title: "Nuevo negocio",
    description: "Bistro 88 completó su registro",
    time: "Hace 32 min",
    icon: "◉",
  },
  {
    id: "4",
    type: "user",
    title: "Nuevo usuario",
    description: "Lucas Martínez creó una cuenta",
    time: "Hace 46 min",
    icon: "♙",
  },
  {
    id: "5",
    type: "reservation",
    title: "Reserva completada",
    description: "Juan Pérez utilizó su promo en Sushi Zen",
    time: "Hace 1 h",
    icon: "✓",
  },
  {
    id: "6",
    type: "promo",
    title: "Promo actualizada",
    description: "Burger House modificó su promoción",
    time: "Hace 1 h",
    icon: "✎",
  },
];

const topPromos = [
  {
    rank: 1,
    name: "2x1 en Hamburguesas",
    business: "Burger House",
    type: "standard",
    reservations: 284,
    conversion: "22.8%",
    icon: "🍔",
  },
  {
    rank: 2,
    name: "Golden Lunch",
    business: "Tokyo Kitchen",
    type: "loyalty",
    reservations: 421,
    conversion: "20.0%",
    icon: "⭐",
  },
  {
    rank: 3,
    name: "Mystery Box — Cena para 2",
    business: "La Cantina",
    type: "mystery",
    reservations: 156,
    conversion: "16.7%",
    icon: "🎁",
  },
  {
    rank: 4,
    name: "Coffee + Croissant",
    business: "Café Central",
    type: "standard",
    reservations: 173,
    conversion: "20.4%",
    icon: "☕",
  },
];

const chartData = [
  42, 55, 48, 72, 66, 81, 74, 93, 87, 104, 96, 118,
  110, 126, 119, 137, 128, 148, 141, 157, 152, 169,
  163, 181, 175, 193, 188, 207, 198, 221,
];

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState("30");

  return (
    <>
      <style jsx global>{`
        :root {
          --bg: #06070a;
          --sidebar: #090b10;
          --surface: #0e1117;
          --surface-2: #151922;
          --surface-3: #1b202b;

          --border: rgba(255, 255, 255, 0.08);
          --border-hover: rgba(255, 255, 255, 0.16);

          --text: #f5f7fa;
          --text-secondary: #a4acb9;
          --muted: #687080;

          --lime: #dfff00;
          --purple: #a855f7;
          --orange: #ff7a18;
          --blue: #38bdf8;
          --red: #ff5252;
          --gold: #ffc21a;

          --success: #55e38a;

          --sidebar-width: 260px;
          --topbar-height: 76px;

          --radius-xl: 24px;
          --radius-lg: 18px;
          --radius-md: 12px;
        }

        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: var(--bg);
          color: var(--text);
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        body {
          background:
            radial-gradient(
              circle at 80% -10%,
              rgba(223, 255, 0, 0.04),
              transparent 25%
            ),
            var(--bg);
        }

        button,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .app {
          min-height: 100vh;
          display: flex;
        }

        /* =========================
           MAIN
        ========================= */

        .main {
          width: 100%;          
        }

        .topbar {
          height: var(--topbar-height);

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 34px;

          border-bottom: 1px solid var(--border);

          background: rgba(6, 7, 10, 0.7);

          backdrop-filter: blur(20px);
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;

          color: var(--muted);
          font-size: 13px;
        }

        .breadcrumb strong {
          color: var(--text);
        }

        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .top-icon-button {
          width: 42px;
          height: 42px;

          display: grid;
          place-items: center;

          border: 1px solid var(--border);
          border-radius: 12px;

          background: rgba(255, 255, 255, 0.025);

          color: var(--text-secondary);

          transition: 0.2s ease;
        }

        .top-icon-button:hover {
          color: white;
          border-color: var(--border-hover);
        }

        .content {
          max-width: 1600px;
          margin: auto;

          padding: 38px 34px 70px;
        }

        /* =========================
           PAGE HEADER
        ========================= */

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;

          gap: 24px;

          margin-bottom: 30px;
        }

        .eyebrow {
          color: var(--lime);

          font-size: 11px;
          font-weight: 800;

          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .page-title {
          margin: 8px 0 0;

          font-size: 38px;
          line-height: 1;

          letter-spacing: -2px;
        }

        .page-description {
          margin: 10px 0 0;

          color: var(--muted);
          font-size: 14px;
        }

        .period-select {
          height: 44px;

          padding: 0 14px;

          border: 1px solid var(--border);
          border-radius: 12px;

          background: var(--surface);

          color: var(--text-secondary);
          outline: none;
        }

        /* =========================
           KPI CARDS
        ========================= */

        .stats-grid {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 16px;

          margin-bottom: 24px;
        }

        .stat-card {
          position: relative;

          overflow: hidden;

          padding: 20px;

          border: 1px solid var(--border);
          border-radius: var(--radius-lg);

          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.035),
              rgba(255, 255, 255, 0.01)
            );
        }

        .stat-card.highlight {
          border-color: rgba(223, 255, 0, 0.2);

          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(223, 255, 0, 0.09),
              transparent 55%
            ),
            var(--surface);
        }

        .stat-card::after {
          content: "";

          position: absolute;

          width: 100px;
          height: 100px;

          right: -40px;
          top: -40px;

          border-radius: 50%;

          background: rgba(255, 255, 255, 0.025);
        }

        .stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-label {
          color: var(--muted);

          font-size: 11px;
          font-weight: 700;

          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .stat-icon {
          width: 32px;
          height: 32px;

          display: grid;
          place-items: center;

          border-radius: 9px;

          background: rgba(255, 255, 255, 0.04);

          color: var(--text-secondary);
        }

        .stat-value {
          margin-top: 14px;

          font-size: 30px;
          font-weight: 900;

          letter-spacing: -1px;
        }

        .stat-footer {
          display: flex;
          align-items: center;
          gap: 8px;

          margin-top: 9px;

          font-size: 12px;
        }

        .stat-change {
          color: var(--success);
          font-weight: 800;
        }

        .stat-period {
          color: var(--muted);
        }

        /* =========================
           MAIN GRID
        ========================= */

        .dashboard-grid {
          display: grid;

          grid-template-columns:
            minmax(0, 2fr)
            minmax(320px, 1fr);

          gap: 20px;

          margin-bottom: 20px;
        }

        .panel {
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);

          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.02),
              rgba(255, 255, 255, 0.005)
            );

          overflow: hidden;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 20px 22px;

          border-bottom: 1px solid var(--border);
        }

        .panel-title {
          font-size: 15px;
          font-weight: 850;
        }

        .panel-subtitle {
          margin-top: 4px;

          color: var(--muted);
          font-size: 11px;
        }

        .panel-action {
          border: 0;
          background: transparent;

          color: var(--lime);

          font-size: 11px;
          font-weight: 800;
        }

        /* =========================
           CHART
        ========================= */

        .chart-panel {
          min-height: 370px;
        }

        .chart-container {
          padding: 20px 22px 24px;
        }

        .chart-summary {
          display: flex;
          align-items: flex-end;
          gap: 12px;

          margin-bottom: 18px;
        }

        .chart-total {
          font-size: 30px;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .chart-growth {
          padding-bottom: 5px;

          color: var(--success);

          font-size: 12px;
          font-weight: 800;
        }

        .chart {
          position: relative;

          height: 230px;

          border-bottom: 1px solid var(--border);
        }

        .chart-grid {
          position: absolute;

          inset: 0;

          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .grid-line {
          width: 100%;
          border-top: 1px dashed rgba(255, 255, 255, 0.06);
        }

        .chart-bars {
          position: absolute;

          inset: 10px 0 0;

          display: flex;
          align-items: flex-end;
          gap: 7px;
        }

        .bar {
          flex: 1;

          min-width: 4px;

          border-radius: 5px 5px 0 0;

          background:
            linear-gradient(
              180deg,
              var(--lime),
              rgba(223, 255, 0, 0.2)
            );

          opacity: 0.8;

          transition: 0.2s ease;
        }

        .bar:hover {
          opacity: 1;

          box-shadow:
            0 0 18px rgba(223, 255, 0, 0.25);
        }

        .chart-labels {
          display: flex;
          justify-content: space-between;

          margin-top: 10px;

          color: var(--muted);

          font-size: 10px;
        }

        /* =========================
           ACTIVITY
        ========================= */

        .activity-list {
          padding: 4px 20px 10px;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;

          padding: 15px 2px;

          border-bottom: 1px solid var(--border);
        }

        .activity-item:last-child {
          border-bottom: 0;
        }

        .activity-icon {
          width: 34px;
          height: 34px;

          flex-shrink: 0;

          display: grid;
          place-items: center;

          border-radius: 10px;

          background: rgba(223, 255, 0, 0.08);

          color: var(--lime);

          font-size: 13px;
        }

        .activity-content {
          min-width: 0;
          flex: 1;
        }

        .activity-title {
          font-size: 12px;
          font-weight: 800;
        }

        .activity-description {
          margin-top: 4px;

          color: var(--text-secondary);

          font-size: 11px;
          line-height: 1.4;
        }

        .activity-time {
          margin-top: 5px;

          color: var(--muted);

          font-size: 10px;
        }

        /* =========================
           SECOND ROW
        ========================= */

        .bottom-grid {
          display: grid;

          grid-template-columns:
            minmax(0, 1.45fr)
            minmax(300px, 0.8fr);

          gap: 20px;
        }

        /* =========================
           TOP PROMOS
        ========================= */

        .promo-list {
          padding: 5px 20px 12px;
        }

        .promo-item {
          display: flex;
          align-items: center;

          gap: 13px;

          padding: 13px 2px;

          border-bottom: 1px solid var(--border);
        }

        .promo-item:last-child {
          border-bottom: 0;
        }

        .promo-rank {
          width: 24px;

          color: var(--muted);

          font-size: 11px;
          font-weight: 900;

          text-align: center;
        }

        .promo-image {
          width: 46px;
          height: 46px;

          display: grid;
          place-items: center;

          flex-shrink: 0;

          border-radius: 12px;

          border: 1px solid var(--border);

          font-size: 20px;
        }

        .promo-image.standard {
          background:
            radial-gradient(
              circle,
              rgba(223, 255, 0, 0.2),
              transparent 65%
            ),
            #13180d;
        }

        .promo-image.loyalty {
          background:
            radial-gradient(
              circle,
              rgba(255, 194, 26, 0.2),
              transparent 65%
            ),
            #211a06;
        }

        .promo-image.mystery {
          background:
            radial-gradient(
              circle,
              rgba(168, 85, 247, 0.22),
              transparent 65%
            ),
            #180d24;
        }

        .promo-main {
          flex: 1;
          min-width: 0;
        }

        .promo-name {
          overflow: hidden;

          white-space: nowrap;
          text-overflow: ellipsis;

          font-size: 12px;
          font-weight: 800;
        }

        .promo-business {
          margin-top: 4px;

          color: var(--muted);

          font-size: 10px;
        }

        .promo-stats {
          display: flex;
          align-items: center;
          gap: 18px;

          text-align: right;
        }

        .promo-stat-value {
          font-size: 12px;
          font-weight: 900;
        }

        .promo-stat-label {
          margin-top: 3px;

          color: var(--muted);

          font-size: 9px;
        }

        .conversion {
          color: var(--success);
        }

        /* =========================
           QUICK ACTIONS
        ========================= */

        .quick-actions {
          display: grid;

          grid-template-columns: 1fr 1fr;

          gap: 10px;

          padding: 20px;
        }

        .quick-action {
          min-height: 92px;

          display: flex;
          flex-direction: column;
          justify-content: space-between;

          padding: 14px;

          border: 1px solid var(--border);
          border-radius: 14px;

          background: rgba(255, 255, 255, 0.02);

          color: var(--text);

          text-align: left;

          transition: 0.2s ease;
        }

        .quick-action:hover {
          border-color: rgba(223, 255, 0, 0.25);

          background: rgba(223, 255, 0, 0.04);

          transform: translateY(-2px);
        }

        .quick-action-icon {
          width: 30px;
          height: 30px;

          display: grid;
          place-items: center;

          border-radius: 9px;

          background: rgba(223, 255, 0, 0.08);

          color: var(--lime);
        }

        .quick-action-title {
          margin-top: 10px;

          font-size: 11px;
          font-weight: 800;
        }

        .quick-action-description {
          margin-top: 3px;

          color: var(--muted);

          font-size: 9px;
        }

        /* =========================
           MOBILE NAV
        ========================= */

        .mobile-nav {
          display: none;
        }

        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 850px) {
          body {
            padding-bottom: 80px;
          }

          .sidebar {
            display: none;
          }

          .main {
            margin-left: 0;
          }

          .topbar {
            padding: 0 18px;
          }

          .content {
            padding: 28px 16px 100px;
          }

          .page-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .page-title {
            font-size: 32px;
          }

          .period-select {
            width: 100%;
          }

          .stats-grid {
            gap: 10px;
          }

          .stat-card {
            padding: 16px;
          }

          .stat-value {
            font-size: 25px;
          }

          .chart-container {
            padding: 18px;
          }

          .chart-bars {
            gap: 4px;
          }

          .promo-stats {
            gap: 10px;
          }

          .mobile-nav {
            position: fixed;

            display: flex;
            align-items: center;
            justify-content: space-around;

            left: 0;
            right: 0;
            bottom: 0;

            height: 74px;

            z-index: 500;

            background: rgba(10, 12, 17, 0.95);

            border-top: 1px solid var(--border);

            backdrop-filter: blur(20px);
          }

          .mobile-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;

            gap: 5px;

            border: 0;
            background: transparent;

            color: var(--muted);

            font-size: 10px;
          }

          .mobile-nav-item.active {
            color: var(--lime);
          }
        }

        @media (max-width: 560px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }

          .stat-label {
            font-size: 9px;
          }

          .stat-value {
            font-size: 23px;
          }

          .stat-footer {
            display: block;
          }

          .stat-period {
            display: block;
            margin-top: 3px;
          }

          .panel-header {
            padding: 17px;
          }

          .activity-list {
            padding: 4px 15px 10px;
          }

          .activity-item {
            gap: 10px;
          }

          .promo-list {
            padding: 5px 15px 10px;
          }

          .promo-stats {
            display: none;
          }

          .quick-actions {
            padding: 15px;
          }
        }
      `}</style>

      <div className="app">


        {/* =========================================
            MAIN
        ========================================= */}

        <main className="main">

          {/* CONTENT */}

          <div className="content">

            {/* HEADER */}

            <div className="page-header">

              <div>

                <div className="eyebrow">
                  Overview
                </div>

                <h1 className="page-title">
                  Dashboard
                </h1>

                <p className="page-description">
                  Una visión general de lo que está pasando en Bonix.
                </p>

              </div>

              <select
                className="period-select"
                value={period}
                onChange={(event) =>
                  setPeriod(event.target.value)
                }
              >
                <option value="7">
                  Últimos 7 días
                </option>

                <option value="30">
                  Últimos 30 días
                </option>

                <option value="90">
                  Últimos 90 días
                </option>

                <option value="365">
                  Último año
                </option>
              </select>

            </div>

            {/* =========================================
                KPI CARDS
            ========================================= */}

            <section className="stats-grid">

              <div className="stat-card highlight">

                <div className="stat-top">

                  <div className="stat-label">
                    Reservas
                  </div>

                  <div className="stat-icon">
                    ▣
                  </div>

                </div>

                <div className="stat-value">
                  3,842
                </div>

                <div className="stat-footer">

                  <span className="stat-change">
                    ↑ 18.4%
                  </span>

                  <span className="stat-period">
                    vs. período anterior
                  </span>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-top">

                  <div className="stat-label">
                    Usuarios
                  </div>

                  <div className="stat-icon">
                    ♙
                  </div>

                </div>

                <div className="stat-value">
                  12,482
                </div>

                <div className="stat-footer">

                  <span className="stat-change">
                    ↑ 12.8%
                  </span>

                  <span className="stat-period">
                    vs. período anterior
                  </span>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-top">

                  <div className="stat-label">
                    Negocios
                  </div>

                  <div className="stat-icon">
                    ◉
                  </div>

                </div>

                <div className="stat-value">
                  386
                </div>

                <div className="stat-footer">

                  <span className="stat-change">
                    ↑ 9.6%
                  </span>

                  <span className="stat-period">
                    34 nuevos este mes
                  </span>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-top">

                  <div className="stat-label">
                    Promos activas
                  </div>

                  <div className="stat-icon">
                    ✦
                  </div>

                </div>

                <div className="stat-value">
                  42
                </div>

                <div className="stat-footer">

                  <span className="stat-change">
                    ↑ 8
                  </span>

                  <span className="stat-period">
                    nuevas este mes
                  </span>

                </div>

              </div>

            </section>

            {/* =========================================
                CHART + ACTIVITY
            ========================================= */}

            <section className="dashboard-grid">

              {/* RESERVATIONS CHART */}

              <div className="panel chart-panel">

                <div className="panel-header">

                  <div>

                    <div className="panel-title">
                      Reservas
                    </div>

                    <div className="panel-subtitle">
                      Evolución de reservas durante el período seleccionado
                    </div>

                  </div>

                  <button className="panel-action">
                    Ver reportes →
                  </button>

                </div>

                <div className="chart-container">

                  <div className="chart-summary">

                    <div className="chart-total">
                      3,842
                    </div>

                    <div className="chart-growth">
                      +18.4%
                    </div>

                  </div>

                  <div className="chart">

                    <div className="chart-grid">

                      <div className="grid-line" />
                      <div className="grid-line" />
                      <div className="grid-line" />
                      <div className="grid-line" />
                      <div className="grid-line" />

                    </div>

                    <div className="chart-bars">

                      {chartData.map(
                        (value, index) => (
                          <div
                            key={index}
                            className="bar"
                            style={{
                              height: `${(value / 230) * 100}%`,
                            }}
                            title={`${value} reservas`}
                          />
                        ),
                      )}

                    </div>

                  </div>

                  <div className="chart-labels">

                    <span>
                      1 Sep
                    </span>

                    <span>
                      8 Sep
                    </span>

                    <span>
                      15 Sep
                    </span>

                    <span>
                      22 Sep
                    </span>

                    <span>
                      30 Sep
                    </span>

                  </div>

                </div>

              </div>

              {/* ACTIVITY */}

              <div className="panel">

                <div className="panel-header">

                  <div>

                    <div className="panel-title">
                      Actividad reciente
                    </div>

                    <div className="panel-subtitle">
                      Últimos eventos de la plataforma
                    </div>

                  </div>

                  <button className="panel-action">
                    Ver todo →
                  </button>

                </div>

                <div className="activity-list">

                  {activities.map(
                    (activity) => (
                      <div
                        className="activity-item"
                        key={activity.id}
                      >

                        <div className="activity-icon">
                          {activity.icon}
                        </div>

                        <div className="activity-content">

                          <div className="activity-title">
                            {activity.title}
                          </div>

                          <div className="activity-description">
                            {activity.description}
                          </div>

                          <div className="activity-time">
                            {activity.time}
                          </div>

                        </div>

                      </div>
                    ),
                  )}

                </div>

              </div>

            </section>

            {/* =========================================
                TOP PROMOS + QUICK ACTIONS
            ========================================= */}

            <section className="bottom-grid">

              {/* TOP PROMOS */}

              <div className="panel">

                <div className="panel-header">

                  <div>

                    <div className="panel-title">
                      Promos con mejor rendimiento
                    </div>

                    <div className="panel-subtitle">
                      Promociones que están generando más reservas
                    </div>

                  </div>

                  <button className="panel-action">
                    Ver promos →
                  </button>

                </div>

                <div className="promo-list">

                  {topPromos.map(
                    (promo) => (
                      <div
                        className="promo-item"
                        key={promo.rank}
                      >

                        <div className="promo-rank">
                          #{promo.rank}
                        </div>

                        <div
                          className={`promo-image ${promo.type}`}
                        >
                          {promo.icon}
                        </div>

                        <div className="promo-main">

                          <div className="promo-name">
                            {promo.name}
                          </div>

                          <div className="promo-business">
                            {promo.business}
                          </div>

                        </div>

                        <div className="promo-stats">

                          <div>

                            <div className="promo-stat-value">
                              {promo.reservations}
                            </div>

                            <div className="promo-stat-label">
                              reservas
                            </div>

                          </div>

                          <div>

                            <div className="promo-stat-value conversion">
                              {promo.conversion}
                            </div>

                            <div className="promo-stat-label">
                              conversión
                            </div>

                          </div>

                        </div>

                      </div>
                    ),
                  )}

                </div>

              </div>

              {/* QUICK ACTIONS */}

              <div className="panel">

                <div className="panel-header">

                  <div>

                    <div className="panel-title">
                      Acciones rápidas
                    </div>

                    <div className="panel-subtitle">
                      Accesos frecuentes
                    </div>

                  </div>

                </div>

                <div className="quick-actions">

                  <button
                    className="quick-action"
                    onClick={() => {
                      window.location.href =
                        "/admin/promos/new";
                    }}
                  >

                    <div className="quick-action-icon">
                      ＋
                    </div>

                    <div>

                      <div className="quick-action-title">
                        Nueva promo
                      </div>

                      <div className="quick-action-description">
                        Crear una promoción
                      </div>

                    </div>

                  </button>

                  <button className="quick-action">

                    <div className="quick-action-icon">
                      ◉
                    </div>

                    <div>

                      <div className="quick-action-title">
                        Nuevo negocio
                      </div>

                      <div className="quick-action-description">
                        Registrar un negocio
                      </div>

                    </div>

                  </button>

                  <button className="quick-action">

                    <div className="quick-action-icon">
                      ▣
                    </div>

                    <div>

                      <div className="quick-action-title">
                        Reservas
                      </div>

                      <div className="quick-action-description">
                        Ver todas las reservas
                      </div>

                    </div>

                  </button>

                  <button className="quick-action">

                    <div className="quick-action-icon">
                      ♙
                    </div>

                    <div>

                      <div className="quick-action-title">
                        Usuarios
                      </div>

                      <div className="quick-action-description">
                        Gestionar usuarios
                      </div>

                    </div>

                  </button>

                </div>

              </div>

            </section>

          </div>

        </main>

        {/* =========================================
            MOBILE NAV
        ========================================= */}

        <nav className="mobile-nav">

          <button className="mobile-nav-item active">
            <span>⌂</span>
            Inicio
          </button>

          <button className="mobile-nav-item">
            <span>✦</span>
            Promos
          </button>

          <button className="mobile-nav-item">
            <span>▣</span>
            Reservas
          </button>

          <button className="mobile-nav-item">
            <span>⚙</span>
            Más
          </button>

        </nav>

      </div>
    </>
  );
}

