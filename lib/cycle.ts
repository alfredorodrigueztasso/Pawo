export type CycleType = 'weekly' | 'biweekly' | 'monthly' | 'custom';

/**
 * Convierte una cadena YYYY-MM-DD a Date (medianoche local)
 */
function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Convierte una Date a cadena YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Suma N días a una Date
 */
function addDaysToDate(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calcula las fechas de inicio y fin del siguiente ciclo.
 * Reemplaza getNextCycleStartDate y getNextCycleEndDate.
 *
 * @param cycleType - Tipo de ciclo: 'weekly' (7 días), 'biweekly' (14 días), 'monthly', 'custom'
 * @param fromDate - Fecha de inicio del nuevo ciclo (formato YYYY-MM-DD o Date)
 * @param options - { cycleDurationDays?: number, cycleStartDay?: number }
 *   - cycleDurationDays: para 'custom' (mínimo 2 días)
 *   - cycleStartDay: para 'monthly' (1-28)
 * @returns { start: string, end: string } en formato YYYY-MM-DD
 */
export function getNextCycleDates(
  cycleType: CycleType,
  fromDate: string | Date,
  options?: {
    cycleDurationDays?: number;
    cycleStartDay?: number;
  }
): { start: string; end: string } {
  const startDate = typeof fromDate === 'string' ? parseDate(fromDate) : fromDate;

  let endDate: Date;

  switch (cycleType) {
    case 'weekly':
      // 7 días: start + 6 (inclusive)
      endDate = addDaysToDate(startDate, 6);
      break;

    case 'biweekly':
      // 14 días: start + 13 (inclusive)
      endDate = addDaysToDate(startDate, 13);
      break;

    case 'monthly': {
      // Comportamiento actual: cycleStartDay → un día antes del siguiente cycleStartDay
      const cycleStartDay = options?.cycleStartDay ?? 1;
      const year = startDate.getFullYear();
      const month = startDate.getMonth();

      // Próximo ciclo comienza el cycleStartDay del mes siguiente
      const nextCycleStart = new Date(year, month + 1, cycleStartDay);

      // El fin del ciclo actual es un día antes
      endDate = addDaysToDate(nextCycleStart, -1);
      break;
    }

    case 'custom': {
      // Duración personalizada: startDate + (duration - 1)
      const duration = options?.cycleDurationDays ?? 7;
      endDate = addDaysToDate(startDate, duration - 1);
      break;
    }

    default:
      throw new Error(`Unknown cycle type: ${cycleType}`);
  }

  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
  };
}

/**
 * @deprecated Use getNextCycleDates instead
 */
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

/**
 * @deprecated Use getNextCycleDates instead
 */
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
