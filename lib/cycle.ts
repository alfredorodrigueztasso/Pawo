export function getNextCycleStartDate(
  startDay: number,
  fromDate: Date = new Date()
): Date {
  const year = fromDate.getFullYear();
  const month = fromDate.getMonth();

  // Create a date for the start day of the current month
  let cycleStart = new Date(year, month, startDay);

  // If that date is in the past, use next month
  if (cycleStart < fromDate) {
    cycleStart = new Date(year, month + 1, startDay);
  }

  return cycleStart;
}

export function getNextCycleEndDate(
  startDay: number,
  fromDate: Date = new Date()
): Date {
  const nextStart = getNextCycleStartDate(startDay, fromDate);
  const year = nextStart.getFullYear();
  const month = nextStart.getMonth();

  // End date is one day before the next cycle's start
  return new Date(year, month + 1, startDay - 1);
}

export function getCurrentCycleProgress(
  cycleStartDate: Date,
  cycleEndDate: Date,
  today: Date = new Date()
): number {
  const totalDays =
    (cycleEndDate.getTime() - cycleStartDate.getTime()) / (1000 * 60 * 60 * 24);
  const elapsedDays =
    (today.getTime() - cycleStartDate.getTime()) / (1000 * 60 * 60 * 24);

  return Math.round((elapsedDays / totalDays) * 100);
}

export function formatCyclePeriod(startDate: Date, endDate: Date): string {
  const startStr = startDate.toLocaleDateString("es-AR", {
    month: "short",
    day: "numeric",
  });
  const endStr = endDate.toLocaleDateString("es-AR", {
    month: "short",
    day: "numeric",
  });

  return `${startStr} — ${endStr}`;
}

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Calcula días restantes y duración total del ciclo.
 * daysRemaining está garantizado <= totalCycleDays.
 *
 * @param cycleStartDate - Fecha de inicio del ciclo (medianoche local)
 * @param cycleEndDate - Fecha de fin del ciclo (medianoche local)
 * @param today - Fecha actual normalizada a medianoche local
 * @returns { daysRemaining, totalCycleDays }
 */
export function getCycleDaysStats(
  cycleStartDate: Date,
  cycleEndDate: Date,
  today: Date = new Date()
): { daysRemaining: number; totalCycleDays: number } {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  // Normalizar today a medianoche local (elimina asimetría sub-día)
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Conteo inclusivo: Mar 20 → Apr 19 = 31 días (ambos extremos incluidos)
  const totalCycleDays = Math.round(
    (cycleEndDate.getTime() - cycleStartDate.getTime()) / MS_PER_DAY
  ) + 1;

  const daysFromTodayToEnd = Math.round(
    (cycleEndDate.getTime() - todayMidnight.getTime()) / MS_PER_DAY
  );

  // Clamp: garantía estructural que remaining <= total siempre
  const daysRemaining = Math.min(
    totalCycleDays,
    Math.max(0, daysFromTodayToEnd)
  );

  return { daysRemaining, totalCycleDays };
}
