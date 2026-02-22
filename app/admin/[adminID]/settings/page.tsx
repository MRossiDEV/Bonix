"use client";

import { useEffect, useState } from "react";

type AdminSettings = {
  defaultCashbackPercent: number;
  maxPromosPerMerchant: number;
  defaultPromoImageUrl: string;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>({
    defaultCashbackPercent: 2,
    maxPromosPerMerchant: 10,
    defaultPromoImageUrl: "/promo-placeholder.svg",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await fetch("/api/admin/settings");
        const json = (await response.json()) as {
          error?: string;
          settings?: AdminSettings;
        };
        if (!response.ok) {
          throw new Error(json.error ?? "Failed to load settings");
        }
        if (json.settings) {
          setSettings(json.settings);
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    loadSettings().catch(() => {
      setLoading(false);
    });
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = (await response.json()) as { error?: string; settings?: AdminSettings };
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to save settings");
      }
      if (json.settings) {
        setSettings(json.settings);
      }
      setSuccessMessage("Settings updated");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-[#94A3B8]">Configure platform-level values used across promos.</p>
      </section>

      {errorMessage ? (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="rounded-xl border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-300">
          {successMessage}
        </p>
      ) : null}

      <section className="space-y-4 rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5">
        {loading ? <p className="text-sm text-[#94A3B8]">Loading settings...</p> : null}

        <label className="block text-sm">
          <span className="text-[#94A3B8]">Default cashback percent</span>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={settings.defaultCashbackPercent}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                defaultCashbackPercent: Number(event.target.value),
              }))
            }
            className="mt-1 w-full rounded-xl border border-[#1F2937] bg-[#020617] px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="text-[#94A3B8]">Max promos per merchant</span>
          <input
            type="number"
            min="1"
            step="1"
            value={settings.maxPromosPerMerchant}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                maxPromosPerMerchant: Number(event.target.value),
              }))
            }
            className="mt-1 w-full rounded-xl border border-[#1F2937] bg-[#020617] px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="text-[#94A3B8]">Default promo image URL</span>
          <input
            type="text"
            value={settings.defaultPromoImageUrl}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                defaultPromoImageUrl: event.target.value,
              }))
            }
            className="mt-1 w-full rounded-xl border border-[#1F2937] bg-[#020617] px-3 py-2"
          />
          <p className="mt-1 text-xs text-[#94A3B8]">
            Used whenever a promo has no image.
          </p>
        </label>

        <button
          type="button"
          onClick={() => {
            saveSettings().catch(() => {});
          }}
          disabled={saving}
          className="rounded-xl bg-[#22C55E] px-4 py-2 text-sm font-semibold text-[#0B0F14] disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save settings"}
        </button>
      </section>
    </div>
  );
}