"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let updateInterval: number | undefined;

    const onControllerChange = () => {
      window.location.reload();
    };

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          updateViaCache: "none",
        });

        if (registration.waiting && navigator.serviceWorker.controller) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;

          installing.addEventListener("statechange", () => {
            if (
              installing.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              registration.waiting?.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });

        updateInterval = window.setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      } catch {
        // Ignore registration errors; install UI will fall back to manual steps.
      }
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange
    );

    register();

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange
      );

      if (updateInterval) {
        window.clearInterval(updateInterval);
      }
    };
  }, []);

  return null;
}
