"use client";
// app/hooks/useReadingProgress.js
// This hook manages reading progress with activity dates, including
// checking completion and toggling readings, and persists data to localStorage,
// as well as logging activity to a backend API.

import { useEffect, useState } from "react";
import { ensureUserSession } from "@/lib/supabaseClient";

const IS_TEST = process.env.NEXT_PUBLIC_ENV !== "production";

export function getDeviceId() {
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("device_id", id);
  }
  return id;
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function cleanOldActivityData(data) {
  const today = new Date();
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const cutoffDate = ninetyDaysAgo.toISOString().slice(0, 10);
  const cleaned = {};

  for (const activityDate in data) {
    if (activityDate >= cutoffDate) {
      cleaned[activityDate] = data[activityDate];
    }
  }

  return cleaned;
}

async function logReadingActivity({
  lectionary_date,
  session,
  type,
  reference,
  translation,
  action,
}) {
  const user = await ensureUserSession();
  const device_id = getDeviceId();
  const finalTranslation = translation ?? "ESV";
  const activity_date = getTodayDate();

  try {
    const response = await fetch("/api/reading/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        user_id: user?.id ?? null,
        device_id,
        activity_date,
        lectionary_date,
        session,
        reading_type: type === "psalms" ? "psalm" : "lesson",
        reference,
        translation: finalTranslation,
        action,
        is_test: IS_TEST,
      }),
    });

    if (!response.ok) {
      let errorBody;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }
      console.error("API error response body:", errorBody);
    }
  } catch (err) {
    console.error("Network error logging reading:", err);
  }
}

// Lectionary corrections that split one reference into several.
// If the old reference was marked complete, carry that over to the new ones.
const SPLIT_READINGS = {
  "1 Timothy 5:17-6:2": ["1 Timothy 5:17-25", "1 Timothy 6:1-2"],
};

function applySplitReadings(data) {
  let changed = false;
  for (const activityDate in data) {
    for (const lectionaryDate in data[activityDate]) {
      for (const session in data[activityDate][lectionaryDate]) {
        const types = data[activityDate][lectionaryDate][session];
        for (const type in types) {
          const refs = types[type];
          if (!Array.isArray(refs)) continue;
          for (const oldRef in SPLIT_READINGS) {
            if (refs.includes(oldRef)) {
              types[type] = refs
                .filter((r) => r !== oldRef)
                .concat(SPLIT_READINGS[oldRef]);
              changed = true;
            }
          }
        }
      }
    }
  }
  return changed;
}

export default function useReadingProgress(translation) {
  const [completedReadings, setCompletedReadings] = useState({});
  const [explanations, setExplanations] = useState({});

  // Load data on mount
  useEffect(() => {
    const saved = localStorage.getItem("readingProgress");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const cleaned = cleanOldActivityData(parsed);
        const split = applySplitReadings(cleaned);
        setCompletedReadings(cleaned);

        if (split || Object.keys(cleaned).length !== Object.keys(parsed).length) {
          localStorage.setItem("readingProgress", JSON.stringify(cleaned));
        }
      } catch (err) {
        console.error("Error loading reading progress:", err);
      }
    }

    // Load explanations
    const savedExplanations = localStorage.getItem("readingExplanations");
    if (savedExplanations) {
      try {
        setExplanations(JSON.parse(savedExplanations));
      } catch (err) {
        console.error("Error loading explanations:", err);
      }
    }
  }, []);

  // Save completedReadings to localStorage
  useEffect(() => {
    if (Object.keys(completedReadings).length > 0) {
      localStorage.setItem(
        "readingProgress",
        JSON.stringify(completedReadings)
      );
    }
  }, [completedReadings]);

  // Save explanations to localStorage
  useEffect(() => {
    if (Object.keys(explanations).length > 0) {
      localStorage.setItem("readingExplanations", JSON.stringify(explanations));
    }
  }, [explanations]);

  const isComplete = (
    lectionary_date,
    session,
    type,
    ref,
    viewingYear = null
  ) => {
    const yearToCheck = viewingYear ?? new Date().getFullYear();

    for (const activityDate in completedReadings) {
      if (activityDate.startsWith(String(yearToCheck))) {
        const readings =
          completedReadings[activityDate]?.[lectionary_date]?.[session]?.[type];
        if (readings?.includes(ref)) {
          return true;
        }
      }
    }

    return false;
  };

  const toggleComplete = async (lectionary_date, session, type, ref) => {
    const alreadyComplete = isComplete(lectionary_date, session, type, ref);
    const today = getTodayDate();

    setCompletedReadings((prev) => {
      const updated = structuredClone(prev);

      if (alreadyComplete) {
        for (const activityDate in updated) {
          const readings =
            updated[activityDate]?.[lectionary_date]?.[session]?.[type];
          if (readings) {
            const idx = readings.indexOf(ref);
            if (idx >= 0) {
              readings.splice(idx, 1);

              if (readings.length === 0) {
                delete updated[activityDate][lectionary_date][session][type];
              }
              if (
                Object.keys(
                  updated[activityDate][lectionary_date]?.[session] || {}
                ).length === 0
              ) {
                delete updated[activityDate][lectionary_date][session];
              }
              if (
                Object.keys(updated[activityDate]?.[lectionary_date] || {})
                  .length === 0
              ) {
                delete updated[activityDate][lectionary_date];
              }
              if (Object.keys(updated[activityDate] || {}).length === 0) {
                delete updated[activityDate];
              }
            }
          }
        }
      } else {
        updated[today] ||= {};
        updated[today][lectionary_date] ||= {};
        updated[today][lectionary_date][session] ||= {};
        updated[today][lectionary_date][session][type] ||= [];
        updated[today][lectionary_date][session][type].push(ref);
      }

      return updated;
    });

    const action = alreadyComplete ? "incomplete" : "complete";

    await logReadingActivity({
      lectionary_date,
      session,
      type,
      reference: ref,
      translation,
      action,
    });
  };

  // Get cached explanation for a reference
  const getExplanation = (reference) => {
    return explanations[reference] || null;
  };

  // Save explanation to cache
  const saveExplanation = (reference, explanation) => {
    setExplanations((prev) => ({
      ...prev,
      [reference]: explanation,
    }));
  };

  return {
    isComplete,
    toggleComplete,
    getExplanation,
    saveExplanation,
  };
}