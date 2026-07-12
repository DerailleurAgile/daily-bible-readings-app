"use client";
// app/hooks/useShareReferral.js
// Captures ?ref=<device_id> from shared QR links and records the
// referrer -> recipient edge, then stamps installed_at on the first
// standalone (home screen) launch.

import { useEffect } from "react";
import { getDeviceId } from "./useReadingProgress";

const IS_TEST = process.env.NEXT_PUBLIC_ENV !== "production";

function post(body) {
  fetch("/api/referral", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, is_test: IS_TEST }),
  }).catch(() => {}); // ponytail: fire-and-forget, analytics must never break the app
}

export default function useShareReferral() {
  useEffect(() => {
    const myId = getDeviceId();
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");

    // Record the edge on first open via a shared link (flag set before the
    // request so StrictMode double-mount can't fire twice)
    if (ref && ref !== myId && !localStorage.getItem("referral_recorded")) {
      localStorage.setItem("referral_recorded", "true");
      post({ referrer_device_id: ref, recipient_device_id: myId });
    }

    // Point the manifest at the ref-carrying version so an iOS "Add to Home
    // Screen" (separate localStorage from Safari) still launches with ?ref
    // and can record its own edge
    if (ref && ref !== myId) {
      document
        .querySelector('link[rel="manifest"]')
        ?.setAttribute("href", `/api/manifest?ref=${encodeURIComponent(ref)}`);
    }

    // Strip ?ref so it doesn't linger in the address bar or get re-shared
    if (ref) {
      params.delete("ref");
      const qs = params.toString();
      window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : ""));
    }

    // Stamp install time on first standalone launch; no-op server-side
    // for organic (unreferred) installs
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (isStandalone && !localStorage.getItem("referral_install_recorded")) {
      localStorage.setItem("referral_install_recorded", "true");
      post({ recipient_device_id: myId, installed: true });
    }
  }, []);
}
