// hooks/useDateNavigation.js
import { startTransition } from 'react';

export default function useDateNavigation(selectedDate, setSelectedDate, getLocalDate) {
  const goPrev = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    startTransition(() => setSelectedDate(d));
  };

  const goNext = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    startTransition(() => setSelectedDate(d));
  };

  const resetToToday = () =>
    startTransition(() => setSelectedDate(getLocalDate()));

  return { goPrev, goNext, resetToToday };
}