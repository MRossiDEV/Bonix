import { useCallback, useEffect, useState } from "react";

import { DAILY_CREDITS_CAP, DAILY_PROGRESS_STORAGE_KEY } from "../types";

type UseDailyProgressResult = {
  dailyCreditsUsed: number;
  incrementDailyCreditsUsed: () => void;
};

export function useDailyProgress(todayKey: string): UseDailyProgressResult {
  const [dailyCreditsUsed, setDailyCreditsUsed] = useState(0);
  const [progressDayKey, setProgressDayKey] = useState("");

  useEffect(() => {
    // Browser-only localStorage read keyed by todayKey; effect is the right
    // tool here because localStorage is unavailable during SSR.
    /* eslint-disable react-hooks/set-state-in-effect */
    const raw = window.localStorage.getItem(DAILY_PROGRESS_STORAGE_KEY);

    if (!raw) {
      setProgressDayKey(todayKey);
      setDailyCreditsUsed(0);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { date: string; used: number };
      if (parsed.date === todayKey) {
        setProgressDayKey(parsed.date);
        setDailyCreditsUsed(Math.min(DAILY_CREDITS_CAP, Math.max(0, parsed.used)));
      } else {
        setProgressDayKey(todayKey);
        setDailyCreditsUsed(0);
      }
    } catch {
      setProgressDayKey(todayKey);
      setDailyCreditsUsed(0);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [todayKey]);

  useEffect(() => {
    if (!progressDayKey) return;
    window.localStorage.setItem(
      DAILY_PROGRESS_STORAGE_KEY,
      JSON.stringify({ date: progressDayKey, used: dailyCreditsUsed }),
    );
  }, [progressDayKey, dailyCreditsUsed]);

  const incrementDailyCreditsUsed = useCallback(() => {
    setProgressDayKey(todayKey);
    setDailyCreditsUsed((current) => Math.min(DAILY_CREDITS_CAP, current + 1));
  }, [todayKey]);

  return { dailyCreditsUsed, incrementDailyCreditsUsed };
}
