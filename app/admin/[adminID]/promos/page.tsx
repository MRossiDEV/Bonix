"use client";

import { useMemo, useState } from "react";

type PromoType = "standard" | "mystery" | "limited" | "loyalty";
type PromoStatus = "active" | "draft" | "scheduled" | "expired";

interface Promo {
  id: string;
  name: string;
  business: string;
  type: PromoType;
  startDate: string;
  endDate: string;
  redemptions: number;
  views: number;
  status: PromoStatus;
  icon: string;
  imageTheme: "lime" | "purple" | "orange" | "gold";
}

const promos: Promo[] = [
  {
    id: "PROMO-001",
    name: "2x1 en Hamburguesas",
    business: "Burger House",
    type: "standard",
    startDate: "01 Sep 2026",
    endDate: "15 Sep 2026",
    redemptions: 284,
    views: 1248,
    status: "active",
    icon: "🍔",
    imageTheme: "lime",
  },
  {
    id: "PROMO-002",
    name: "Mystery Box — Cena para 2",
    business: "La Cantina",
    type: "mystery",
    startDate: "03 Sep 2026",
    endDate: "30 Sep 2026",
    redemptions: 156,
    views: 934,
    status: "active",
    icon: "🎁",
    imageTheme: "purple",
  },
  {
    id: "PROMO-003",
    name: "50% OFF Sushi",
    business: "Sushi Zen",
    type: "limited",
    startDate: "05 Sep 2026",
    endDate: "10 Sep 2026",
    redemptions: 92,
    views: 682,
    status: "scheduled",
    icon: "🍣",
    imageTheme: "orange",
  },
  {
    id: "PROMO-004",
    name: "Golden Lunch",
    business: "Tokyo Kitchen",
    type: "loyalty",
    startDate: "01 Sep 2026",
    endDate: "01 Oct 2026",
    redemptions: 421,
    views: 2104,
    status: "active",
    icon: "⭐",
    imageTheme: "gold",
  },
  {
    id: "PROMO-005",
    name: "Pizza Familiar",
    business: "Pizza Napoli",
    type: "standard",
    startDate: "10 Aug 2026",
    endDate: "25 Aug 2026",
    redemptions: 198,
    views: 1102,
    status: "expired",
    icon: "🍕",
    imageTheme: "lime",
  },
  {
    id: "PROMO-006",
    name: "Happy Hour 2x1",
    business: "Downtown Bar",
    type: "standard",
    startDate: "15 Sep 2026",
    endDate: "30 Sep 2026",
    redemptions: 0,
    views: 0,
    status: "draft",
    icon: "🍹",
    imageTheme: "purple",
  },
  {
    id: "PROMO-007",
    name: "Coffee + Croissant",
    business: "Café Central",
    type: "standard",
    startDate: "01 Sep 2026",
    endDate: "20 Sep 2026",
    redemptions: 173,
    views: 846,
    status: "active",
    icon: "☕",
    imageTheme: "gold",
  },
  {
    id: "PROMO-008",
    name: "Chef's Special",
    business: "Bistro 88",
    type: "limited",
    startDate: "20 Sep 2026",
    endDate: "22 Sep 2026",
    redemptions: 0,
    views: 0,
    status: "scheduled",
    icon: "👨‍🍳",
    imageTheme: "orange",
  },
];

const typeLabels: Record<PromoType, string> = {
  standard: "Standard",
  mystery: "Mystery",
  limited: "Limited",
  loyalty: "Loyalty",
};

const statusLabels: Record<PromoStatus, string> = {
  active: "Activa",
  draft: "Borrador",
  scheduled: "Programada",
  expired: "Expirada",
};

export default function PromosAdminPage() {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  const [typeFilter, setTypeFilter] = useState<PromoType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<PromoStatus | "all">(
    "all",
  );
  const [businessFilter, setBusinessFilter] = useState("all");

  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const itemsPerPage = 6;

  const businesses = useMemo(() => {
    return Array.from(new Set(promos.map((promo) => promo.business)));
  }, []);

  const filteredPromos = useMemo(() => {
    return promos.filter((promo) => {
      const matchesSearch =
        promo.name.toLowerCase().includes(search.toLowerCase()) ||
        promo.business.toLowerCase().includes(search.toLowerCase()) ||
        promo.id.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        typeFilter === "all" || promo.type === typeFilter;

      const matchesStatus =
        statusFilter === "all" || promo.status === statusFilter;

      const matchesBusiness =
        businessFilter === "all" || promo.business === businessFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesBusiness
      );
    });
  }, [search, typeFilter, statusFilter, businessFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPromos.length / itemsPerPage),
  );

  const paginatedPromos = filteredPromos.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const activeFilterCount = [
    typeFilter !== "all",
    statusFilter !== "all",
    businessFilter !== "all",
  ].filter(Boolean).length;

  const togglePromo = (id: string) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const toggleAll = () => {
    const pageIds = paginatedPromos.map((promo) => promo.id);

    const allSelected = pageIds.every((id) => selected.includes(id));

    if (allSelected) {
      setSelected((current) =>
        current.filter((id) => !pageIds.includes(id)),
      );
    } else {
      setSelected((current) => [
        ...new Set([...current, ...pageIds]),
      ]);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
    setBusinessFilter("all");
    setPage(1);
  };

  const goToEdit = (id: string) => {
    window.location.href = `/admin/promos/${id}/edit`;
  };

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

        button,
        select,
        input {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .app {
          min-height: 100vh;
          display: flex;
        }



        /* MAIN */

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
          padding: 38px 34px 60px;
        }

        /* HEADER */

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 32px;
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

        .primary-button {
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 0 20px;
          border: 0;
          border-radius: 14px;
          background: var(--lime);
          color: #101300;
          font-weight: 900;
          box-shadow: 0 0 30px rgba(223, 255, 0, 0.12);
          transition: 0.2s ease;
        }

        .primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 35px rgba(223, 255, 0, 0.2);
        }

        /* STATS */

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 28px;
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
              rgba(223, 255, 0, 0.08),
              transparent 50%
            ),
            var(--surface);
        }

        .stat-label {
          color: var(--muted);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .stat-value {
          margin-top: 10px;
          font-size: 30px;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .stat-change {
          margin-top: 8px;
          font-size: 12px;
          color: var(--success);
        }

        .stat-change.muted {
          color: var(--muted);
        }

        /* PANEL */

        .management-panel {
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

        .toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px;
          border-bottom: 1px solid var(--border);
        }

        .search-box {
          position: relative;
          flex: 1;
        }

        .search-box input {
          width: 100%;
          height: 48px;
          padding: 0 16px 0 45px;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: rgba(0, 0, 0, 0.18);
          color: white;
          outline: none;
        }

        .search-box input:focus {
          border-color: rgba(223, 255, 0, 0.45);
          box-shadow: 0 0 0 3px rgba(223, 255, 0, 0.05);
        }

        .search-box::before {
          content: "⌕";
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-53%);
          color: var(--muted);
          font-size: 22px;
        }

        .filter-button {
          height: 48px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 16px;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.025);
          color: var(--text-secondary);
        }

        .filter-count {
          width: 20px;
          height: 20px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: var(--lime);
          color: #111400;
          font-size: 10px;
          font-weight: 900;
        }

        /* FILTERS */

        .filters {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.012);
        }

        .filter-label {
          display: block;
          margin-bottom: 7px;
          color: var(--muted);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .filter-select {
          width: 100%;
          height: 42px;
          padding: 0 12px;
          border: 1px solid var(--border);
          border-radius: 11px;
          background: var(--surface);
          color: var(--text-secondary);
          outline: none;
        }

        /* ACTIVE FILTERS */

        .active-filters {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
        }

        .active-filter-label {
          margin-right: 4px;
          color: var(--muted);
          font-size: 12px;
        }

        .filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 10px;
          border-radius: 20px;
          background: rgba(223, 255, 0, 0.08);
          border: 1px solid rgba(223, 255, 0, 0.12);
          color: var(--lime);
          font-size: 11px;
          font-weight: 700;
        }

        .clear-filters {
          margin-left: auto;
          border: 0;
          background: transparent;
          color: var(--muted);
          font-size: 12px;
        }

        /* TABLE */

        .table-header,
        .promo-row {
          display: grid;
          grid-template-columns:
            44px
            minmax(280px, 2.2fr)
            1fr
            1fr
            1fr
            120px
            80px;
          gap: 16px;
          align-items: center;
        }

        .table-header {
          padding: 14px 20px;
          color: var(--muted);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.012);
        }

        .promo-row {
          padding: 16px 20px;
          border-top: 1px solid var(--border);
          transition: 0.2s ease;
        }

        .promo-row:hover {
          background: rgba(255, 255, 255, 0.025);
        }

        .checkbox {
          width: 18px;
          height: 18px;
          accent-color: var(--lime);
        }

        .promo-info {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .promo-image {
          width: 70px;
          height: 70px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 16px;
          border: 1px solid var(--border);
          font-size: 30px;
        }

        .promo-image.lime {
          background:
            radial-gradient(
              circle,
              rgba(223, 255, 0, 0.2),
              transparent 65%
            ),
            #13180d;
        }

        .promo-image.purple {
          background:
            radial-gradient(
              circle,
              rgba(168, 85, 247, 0.22),
              transparent 65%
            ),
            #180d24;
        }

        .promo-image.orange {
          background:
            radial-gradient(
              circle,
              rgba(255, 122, 24, 0.2),
              transparent 65%
            ),
            #211006;
        }

        .promo-image.gold {
          background:
            radial-gradient(
              circle,
              rgba(255, 194, 26, 0.2),
              transparent 65%
            ),
            #211a06;
        }

        .promo-main {
          min-width: 0;
        }

        .promo-name {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: 14px;
          font-weight: 800;
        }

        .promo-business {
          margin-top: 5px;
          color: var(--muted);
          font-size: 12px;
        }

        .promo-id {
          margin-top: 5px;
          color: #515866;
          font-size: 10px;
          font-family: monospace;
        }

        .promo-type {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: var(--text-secondary);
          font-size: 12px;
        }

        .type-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .type-standard {
          background: var(--lime);
        }

        .type-mystery {
          background: var(--purple);
        }

        .type-limited {
          background: var(--orange);
        }

        .type-loyalty {
          background: var(--gold);
        }

        .date-value {
          font-size: 12px;
          font-weight: 600;
        }

        .date-subtitle {
          margin-top: 5px;
          color: var(--muted);
          font-size: 11px;
        }

        .performance {
          font-size: 13px;
          font-weight: 800;
        }

        .performance-label {
          margin-top: 4px;
          color: var(--muted);
          font-size: 11px;
        }

        /* STATUS */

        .status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          width: fit-content;
          padding: 7px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 800;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .status.active {
          background: rgba(85, 227, 138, 0.08);
          color: var(--success);
        }

        .status.active .status-dot {
          background: var(--success);
          box-shadow: 0 0 8px var(--success);
        }

        .status.draft {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-secondary);
        }

        .status.draft .status-dot {
          background: var(--muted);
        }

        .status.scheduled {
          background: rgba(56, 189, 248, 0.08);
          color: var(--blue);
        }

        .status.scheduled .status-dot {
          background: var(--blue);
        }

        .status.expired {
          background: rgba(255, 82, 82, 0.08);
          color: var(--red);
        }

        .status.expired .status-dot {
          background: var(--red);
        }

        /* ACTIONS */

        .row-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
        }

        .edit-button {
          height: 38px;
          padding: 0 13px;
          display: flex;
          align-items: center;
          gap: 7px;
          border: 1px solid rgba(223, 255, 0, 0.22);
          border-radius: 10px;
          background: rgba(223, 255, 0, 0.08);
          color: var(--lime);
          font-size: 11px;
          font-weight: 800;
          transition: 0.2s ease;
        }

        .edit-button:hover {
          background: var(--lime);
          color: #111400;
        }

        .more-button {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: transparent;
          color: var(--text-secondary);
        }

        /* BULK */

        .bulk-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          background: rgba(223, 255, 0, 0.06);
          border-bottom: 1px solid rgba(223, 255, 0, 0.12);
        }

        .selected-count {
          color: var(--lime);
          font-size: 12px;
          font-weight: 800;
          margin-right: auto;
        }

        .bulk-button {
          padding: 8px 12px;
          border: 1px solid var(--border);
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-secondary);
          font-size: 11px;
        }

        /* PAGINATION */

        .pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          border-top: 1px solid var(--border);
        }

        .pagination-info {
          color: var(--muted);
          font-size: 12px;
        }

        .pagination-controls {
          display: flex;
          gap: 6px;
        }

        .page-button {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border: 1px solid var(--border);
          border-radius: 9px;
          background: transparent;
          color: var(--text-secondary);
          font-size: 12px;
        }

        .page-button.active {
          border-color: var(--lime);
          background: rgba(223, 255, 0, 0.1);
          color: var(--lime);
        }

        /* MOBILE NAV */

        .mobile-nav {
          display: none;
        }

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .table-header,
          .promo-row {
            grid-template-columns:
              40px
              minmax(260px, 2fr)
              1fr
              1fr
              110px;
          }

          .table-header > :nth-child(4),
          .promo-row > :nth-child(4),
          .table-header > :nth-child(5),
          .promo-row > :nth-child(5) {
            display: none;
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

          .page-header .primary-button {
            width: 100%;
          }

          .filters {
            grid-template-columns: repeat(2, 1fr);
          }

          .table-header {
            display: none;
          }

          .promo-row {
            position: relative;
            display: flex;
            flex-wrap: wrap;
            padding: 16px;
            gap: 14px;
          }

          .promo-row > .checkbox {
            position: absolute;
            top: 18px;
            right: 18px;
          }

          .promo-info {
            width: 100%;
            padding-right: 30px;
          }

          .promo-row > :nth-child(3),
          .promo-row > :nth-child(4),
          .promo-row > :nth-child(5),
          .promo-row > :nth-child(6) {
            padding-left: 84px;
          }

          .row-actions {
            width: 100%;
            justify-content: flex-end;
            padding-top: 8px;
            border-top: 1px solid var(--border);
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
            gap: 10px;
          }

          .stat-card {
            padding: 16px;
          }

          .stat-value {
            font-size: 25px;
          }

          .toolbar {
            flex-wrap: wrap;
          }

          .search-box {
            width: 100%;
            flex-basis: 100%;
          }

          .filter-button {
            flex: 1;
            justify-content: center;
          }

          .filters {
            grid-template-columns: 1fr 1fr;
            padding: 14px;
          }

          .active-filters {
            padding: 12px 14px;
          }

          .clear-filters {
            width: 100%;
            margin-left: 0;
            text-align: left;
          }

          .promo-image {
            width: 62px;
            height: 62px;
          }

          .promo-name {
            font-size: 13px;
          }

          .pagination {
            flex-direction: column;
            gap: 14px;
          }
        }
      `}</style>

      <div className="app">

        {/* MAIN */}
        <main className="main w-full">

          {/* CONTENT */}
          <div className="w-full">

            {/* PAGE HEADER */}
            <div className="page-header">

              <div>
                <div className="eyebrow">
                  Gestión de promociones
                </div>

                <h1 className="page-title">
                  Promos
                </h1>

                <p className="page-description">
                  Crea, administra y monitorea todas las promociones de Bonix.
                </p>
              </div>

              <button
                className="primary-button"
                onClick={() => {
                  window.location.href = "/admin/promos/new";
                }}
              >
                <span>＋</span>
                Nueva promo
              </button>

            </div>

            {/* STATS */}
            <section className="stats-grid">

              <div className="stat-card highlight">
                <div className="stat-label">
                  Total promos
                </div>

                <div className="stat-value">
                  128
                </div>

                <div className="stat-change">
                  ↑ 12% este mes
                </div>
              </div>

              <div className="stat-card">

                <div className="stat-label">
                  Activas
                </div>

                <div className="stat-value">
                  42
                </div>

                <div className="stat-change">
                  ↑ 8 nuevas
                </div>

              </div>

              <div className="stat-card">

                <div className="stat-label">
                  Reservas
                </div>

                <div className="stat-value">
                  3,842
                </div>

                <div className="stat-change">
                  ↑ 18.4%
                </div>

              </div>

              <div className="stat-card">

                <div className="stat-label">
                  Tasa conversión
                </div>

                <div className="stat-value">
                  14.8%
                </div>

                <div className="stat-change muted">
                  Últimos 30 días
                </div>

              </div>

            </section>

            {/* MANAGEMENT */}
            <section className="management-panel">

              {/* TOOLBAR */}
              <div className="toolbar">

                <div className="search-box">

                  <input
                    type="text"
                    placeholder="Buscar promo, negocio o ID..."
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                  />

                </div>

                <button
                  className="filter-button"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <span>☷</span>
                  Filtros

                  {activeFilterCount > 0 && (
                    <span className="filter-count">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

              </div>

              {/* FILTERS */}
              {showFilters && (
                <div className="filters">

                  <div>
                    <label className="filter-label">
                      Tipo
                    </label>

                    <select
                      className="filter-select"
                      value={typeFilter}
                      onChange={(event) => {
                        setTypeFilter(
                          event.target.value as PromoType | "all",
                        );
                        setPage(1);
                      }}
                    >
                      <option value="all">
                        Todos los tipos
                      </option>

                      <option value="standard">
                        Standard
                      </option>

                      <option value="mystery">
                        Mystery
                      </option>

                      <option value="limited">
                        Limited
                      </option>

                      <option value="loyalty">
                        Loyalty
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="filter-label">
                      Estado
                    </label>

                    <select
                      className="filter-select"
                      value={statusFilter}
                      onChange={(event) => {
                        setStatusFilter(
                          event.target.value as PromoStatus | "all",
                        );
                        setPage(1);
                      }}
                    >
                      <option value="all">
                        Todos los estados
                      </option>

                      <option value="active">
                        Activa
                      </option>

                      <option value="draft">
                        Borrador
                      </option>

                      <option value="scheduled">
                        Programada
                      </option>

                      <option value="expired">
                        Expirada
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="filter-label">
                      Negocio
                    </label>

                    <select
                      className="filter-select"
                      value={businessFilter}
                      onChange={(event) => {
                        setBusinessFilter(event.target.value);
                        setPage(1);
                      }}
                    >
                      <option value="all">
                        Todos los negocios
                      </option>

                      {businesses.map((business) => (
                        <option
                          key={business}
                          value={business}
                        >
                          {business}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>
              )}

              {/* ACTIVE FILTERS */}
              {(search ||
                activeFilterCount > 0) && (

                <div className="active-filters">

                  <span className="active-filter-label">
                    Filtros activos:
                  </span>

                  {search && (
                    <span className="filter-chip">
                      Buscar: {search}
                    </span>
                  )}

                  {typeFilter !== "all" && (
                    <span className="filter-chip">
                      Tipo: {typeLabels[typeFilter]}
                    </span>
                  )}

                  {statusFilter !== "all" && (
                    <span className="filter-chip">
                      Estado: {statusLabels[statusFilter]}
                    </span>
                  )}

                  {businessFilter !== "all" && (
                    <span className="filter-chip">
                      {businessFilter}
                    </span>
                  )}

                  <button
                    className="clear-filters"
                    onClick={clearFilters}
                  >
                    Limpiar filtros
                  </button>

                </div>

              )}

              {/* BULK ACTIONS */}
              {selected.length > 0 && (
                <div className="bulk-actions">

                  <span className="selected-count">
                    {selected.length} seleccionada
                    {selected.length !== 1 ? "s" : ""}
                  </span>

                  <button className="bulk-button">
                    Activar
                  </button>

                  <button className="bulk-button">
                    Desactivar
                  </button>

                  <button className="bulk-button">
                    Eliminar
                  </button>

                </div>
              )}

              {/* TABLE HEADER */}
              <div className="table-header">

                <div>
                  <input
                    className="checkbox"
                    type="checkbox"
                    checked={
                      paginatedPromos.length > 0 &&
                      paginatedPromos.every((promo) =>
                        selected.includes(promo.id),
                      )
                    }
                    onChange={toggleAll}
                  />
                </div>

                <div>Promo</div>
                <div>Tipo</div>
                <div>Vigencia</div>
                <div>Performance</div>
                <div>Estado</div>
                <div></div>

              </div>

              {/* ROWS */}
              {paginatedPromos.length > 0 ? (
                paginatedPromos.map((promo) => (
                  <div
                    className="promo-row"
                    key={promo.id}
                  >

                    <div>
                      <input
                        className="checkbox"
                        type="checkbox"
                        checked={selected.includes(promo.id)}
                        onChange={() =>
                          togglePromo(promo.id)
                        }
                      />
                    </div>

                    {/* PROMO */}
                    <div className="promo-info">

                      <div
                        className={`promo-image ${promo.imageTheme}`}
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

                        <div className="promo-id">
                          {promo.id}
                        </div>

                      </div>

                    </div>

                    {/* TYPE */}
                    <div className="promo-type">

                      <span
                        className={`type-dot type-${promo.type}`}
                      />

                      {typeLabels[promo.type]}

                    </div>

                    {/* DATE */}
                    <div>

                      <div className="date-value">
                        {promo.startDate}
                      </div>

                      <div className="date-subtitle">
                        hasta {promo.endDate}
                      </div>

                    </div>

                    {/* PERFORMANCE */}
                    <div>

                      <div className="performance">
                        {promo.redemptions}
                      </div>

                      <div className="performance-label">
                        {promo.views.toLocaleString("es-UY")} views
                      </div>

                    </div>

                    {/* STATUS */}
                    <div>

                      <div
                        className={`status ${promo.status}`}
                      >

                        <span className="status-dot" />

                        {statusLabels[promo.status]}

                      </div>

                    </div>

                    {/* ACTIONS */}
                    <div className="row-actions">

                      <button
                        className="edit-button"
                        onClick={() =>
                          goToEdit(promo.id)
                        }
                      >
                        ✎
                        Editar
                      </button>

                      <button
                        className="more-button"
                        aria-label="Más opciones"
                      >
                        ⋮
                      </button>

                    </div>

                  </div>
                ))
              ) : (
                <div
                  style={{
                    padding: "60px 20px",
                    textAlign: "center",
                    color: "var(--muted)",
                  }}
                >
                  No se encontraron promociones.
                </div>
              )}

              {/* PAGINATION */}
              <div className="pagination">

                <div className="pagination-info">
                  Mostrando{" "}
                  {filteredPromos.length === 0
                    ? 0
                    : (page - 1) * itemsPerPage + 1}
                  {" – "}
                  {Math.min(
                    page * itemsPerPage,
                    filteredPromos.length,
                  )}{" "}
                  de {filteredPromos.length} promos
                </div>

                <div className="pagination-controls">

                  <button
                    className="page-button"
                    disabled={page === 1}
                    onClick={() =>
                      setPage((current) =>
                        Math.max(1, current - 1),
                      )
                    }
                  >
                    ‹
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      className={`page-button ${
                        page === pageNumber
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setPage(pageNumber)
                      }
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button
                    className="page-button"
                    disabled={page === totalPages}
                    onClick={() =>
                      setPage((current) =>
                        Math.min(
                          totalPages,
                          current + 1,
                        ),
                      )
                    }
                  >
                    ›
                  </button>

                </div>

              </div>

            </section>

          </div>

        </main>

        {/* MOBILE NAV */}
        <nav className="mobile-nav">

          <button className="mobile-nav-item">
            <span>⌂</span>
            Inicio
          </button>

          <button className="mobile-nav-item active">
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