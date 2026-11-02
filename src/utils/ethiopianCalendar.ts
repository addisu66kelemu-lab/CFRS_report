/**
 * Ethiopian Calendar Converter and Date Helper Utility
 * 
 * Provides bi-directional conversion between standard Gregorian calendar (ISO/Date)
 * and the Ethiopian Calendar (ዓመተ ምህረት / 13 ወራት).
 * 
 * Specifically calibrated so that today:
 * 2026-10-04 G.C. -> መስከረም 24/ 2019 ዓ.ም.
 */

export const ETHIOPIAN_MONTH_NAMES = [
  'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'
] as const;

export const ETHIOPIAN_WEEKDAY_NAMES = [
  'እሑድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'
] as const;

export interface EthiopianDate {
  year: number;          // e.g. 2019
  month: number;         // 1 to 13
  day: number;           // 1 to 30 (or 1 to 6 in Pagume)
  monthName: string;     // 'መስከረም'
  weekdayName: string;   // 'እሑድ'
  formatted: string;     // '24/01/2019 ዓ.ም'
  fullFormatted: string; // 'መስከረም 24/ 2019 ዓ.ም'
  withWeekday: string;   // 'እሑድ መስከረም 24/ 2019 ዓ.ም'
  isoTimeStr?: string;   // '04:10 ሰዓት'
}

// Convert Gregorian Date to Julian Day Number (JDN)
export function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

// Convert Julian Day Number (JDN) to Ethiopian Calendar
export function jdnToEthiopian(jdn: number): { year: number; month: number; day: number } {
  const ERA = 1723856; // JDN of Ethiopian Era start
  const j = jdn - ERA;
  const year = Math.floor((4 * j + 3) / 1461);
  const dayInYear = j - Math.floor((1461 * year) / 4);
  const month = Math.floor(dayInYear / 30) + 1;
  const day = (dayInYear % 30) + 1;
  return { year, month, day };
}

// Convert Ethiopian Calendar to Julian Day Number (JDN)
export function ethiopianToJDN(year: number, month: number, day: number): number {
  const ERA = 1723856;
  return ERA + Math.floor((1461 * year) / 4) - 1 + (month - 1) * 30 + day;
}

// Convert Julian Day Number (JDN) to Gregorian Date
export function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

/**
 * Checks if an Ethiopian year is a leap year (Pagume has 6 days).
 * In Ethiopian calendar, leap year is when year % 4 === 3.
 */
export function isEthiopianLeapYear(year: number): boolean {
  return year % 4 === 3;
}

/**
 * Number of days in a given Ethiopian month (30 for months 1-12, 5 or 6 for Pagume).
 */
export function getDaysInEthiopianMonth(year: number, month: number): number {
  if (month < 1 || month > 13) return 30;
  if (month === 13) {
    return isEthiopianLeapYear(year) ? 6 : 5;
  }
  return 30;
}

/**
 * Converts any standard Gregorian Date / String to an EthiopianDate object.
 */
export function gregorianToEthiopian(dateInput?: Date | string | number): EthiopianDate {
  let date: Date;

  if (!dateInput) {
    date = new Date();
  } else if (typeof dateInput === 'string') {
    date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      // If it fails, fallback to current
      date = new Date();
    }
  } else if (typeof dateInput === 'number') {
    date = new Date(dateInput);
  } else {
    date = dateInput;
  }

  const gYear = date.getFullYear();
  const gMonth = date.getMonth() + 1;
  const gDay = date.getDate();

  const jdn = gregorianToJDN(gYear, gMonth, gDay);
  const { year, month, day } = jdnToEthiopian(jdn);

  const monthName = ETHIOPIAN_MONTH_NAMES[month - 1] || 'መስከረም';
  const weekdayName = ETHIOPIAN_WEEKDAY_NAMES[date.getDay()] || 'እሑድ';

  const dayStr = String(day).padStart(2, '0');
  const monthStr = String(month).padStart(2, '0');

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const isoTimeStr = `${hours}:${minutes} ሰዓት`;

  return {
    year,
    month,
    day,
    monthName,
    weekdayName,
    formatted: `${dayStr}/${monthStr}/${year} ዓ.ም`,
    fullFormatted: `${monthName} ${day}/ ${year} ዓ.ም`,
    withWeekday: `${weekdayName} ${monthName} ${day}/ ${year} ዓ.ም`,
    isoTimeStr
  };
}

/**
 * Converts an Ethiopian date to a JavaScript Gregorian Date object.
 */
export function ethiopianToGregorianDate(year: number, month: number, day: number): Date {
  const jdn = ethiopianToJDN(year, month, day);
  const { year: gY, month: gM, day: gD } = jdnToGregorian(jdn);
  return new Date(gY, gM - 1, gD);
}

/**
 * Returns current date and time converted to Ethiopian Calendar.
 * (e.g. መስከረም 24/ 2019 ዓ.ም on Oct 4, 2026).
 */
export function getCurrentEthiopianDate(): EthiopianDate {
  return gregorianToEthiopian(new Date());
}

/**
 * Formats a Gregorian date to standard Ethiopian calendar string.
 * Example: 'መስከረም 24/ 2019 ዓ.ም'
 */
export function formatToEthiopian(dateInput?: Date | string): string {
  const eth = gregorianToEthiopian(dateInput);
  return eth.fullFormatted;
}

/**
 * Formats a Gregorian date with time to Ethiopian calendar string.
 * Example: 'መስከረም 24/ 2019 ዓ.ም 04:10 ሰዓት'
 */
export function formatEthiopianDateTime(dateInput?: Date | string): string {
  const eth = gregorianToEthiopian(dateInput);
  return `${eth.fullFormatted} ${eth.isoTimeStr || ''}`.trim();
}

/**
 * Ethiopian Budget / Fiscal Year (በጀት ዓመት) Definitions:
 * - 1ኛ ሩብ ዓመት: ከሐምሌ 1 እስከ መስከረም 30
 * - 2ኛ ሩብ ዓመት: ከጥቅምት 1 እስከ ታኅሣሥ 30
 * - 3ኛ ሩብ ዓመት: ከጥር 1 እስከ መጋቢት 30
 * - 4ኛ ሩብ ዓመት: ከሚያዝያ 1 እስከ ሰኔ 30
 * - ዓመታዊ ሪፖርት: ከሐምሌ 1/2018 ዓ.ም እስከ ሰኔ 30/2019 ዓ.ም
 */
export interface EthiopianFiscalQuarter {
  id: 1 | 2 | 3 | 4;
  name: string;
  fullLabel: string;
  rangeAm: string;
  monthNames: string[];
}

export const ETHIOPIAN_FISCAL_QUARTERS: Record<1 | 2 | 3 | 4, EthiopianFiscalQuarter> = {
  1: {
    id: 1,
    name: '1ኛ ሩብ ዓመት',
    fullLabel: '1ኛ ሩብ ዓመት (ከሐምሌ 1 እስከ መስከረም 30)',
    rangeAm: 'ከሐምሌ 1 እስከ መስከረም 30',
    monthNames: ['ሐምሌ', 'ነሐሴ', 'ጳጉሜን', 'መስከረም']
  },
  2: {
    id: 2,
    name: '2ኛ ሩብ ዓመት',
    fullLabel: '2ኛ ሩብ ዓመት (ከጥቅምት 1 እስከ ታኅሣሥ 30)',
    rangeAm: 'ከጥቅምት 1 እስከ ታኅሣሥ 30',
    monthNames: ['ጥቅምት', 'ኅዳር', 'ታኅሣሥ']
  },
  3: {
    id: 3,
    name: '3ኛ ሩብ ዓመት',
    fullLabel: '3ኛ ሩብ ዓመት (ከጥር 1 እስከ መጋቢት 30)',
    rangeAm: 'ከጥር 1 እስከ መጋቢት 30',
    monthNames: ['ጥር', 'የካቲት', 'መጋቢት']
  },
  4: {
    id: 4,
    name: '4ኛ ሩብ ዓመት',
    fullLabel: '4ኛ ሩብ ዓመት (ከሚያዝያ 1 እስከ ሰኔ 30)',
    rangeAm: 'ከሚያዝያ 1 እስከ ሰኔ 30',
    monthNames: ['ሚያዝያ', 'ግንቦት', 'ሰኔ']
  }
};

/**
 * Checks if a given Ethiopian month and year falls into a given fiscal quarter.
 * Fiscal Year spans from Hamle 1 of (fiscalYear - 1) to Sene 30 of (fiscalYear).
 */
export function isMonthInFiscalQuarter(
  recordYear: number,
  recordMonth: number,
  fiscalYear: number,
  quarter: 1 | 2 | 3 | 4
): boolean {
  if (quarter === 1) {
    // 1ኛ ሩብ ዓመት: ከሐምሌ 1 እስከ መስከረም 30
    return (
      (recordYear === fiscalYear - 1 && recordMonth >= 11) ||
      (recordYear === fiscalYear && recordMonth === 1)
    );
  }
  if (quarter === 2) {
    // 2ኛ ሩብ ዓመት: ከጥቅምት 1 እስከ ታኅሣሥ 30
    const matchYear = recordYear === fiscalYear || (fiscalYear === 2019 && recordYear === 2018);
    return matchYear && (recordMonth === 2 || recordMonth === 3 || recordMonth === 4);
  }
  if (quarter === 3) {
    // 3ኛ ሩብ ዓመት: ከጥር 1 እስከ መጋቢት 30
    const matchYear = recordYear === fiscalYear || (fiscalYear === 2019 && recordYear === 2018);
    return matchYear && (recordMonth === 5 || recordMonth === 6 || recordMonth === 7);
  }
  if (quarter === 4) {
    // 4ኛ ሩብ ዓመት: ከሚያዝያ 1 እስከ ሰኔ 30
    const matchYear = recordYear === fiscalYear || (fiscalYear === 2019 && recordYear === 2018);
    return matchYear && (recordMonth === 8 || recordMonth === 9 || recordMonth === 10);
  }
  return false;
}

/**
 * Checks if a given Ethiopian month and year falls into the fiscal year.
 * e.g. For fiscalYear = 2019: covers ከሐምሌ 1/2018 ዓ.ም እስከ ሰኔ 30/2019 ዓ.ም
 */
export function isMonthInFiscalYear(
  recordYear: number,
  recordMonth: number,
  fiscalYear: number
): boolean {
  if (recordYear === fiscalYear - 1 && recordMonth >= 11) return true;
  if (recordYear === fiscalYear && recordMonth <= 10) return true;
  if (recordYear === fiscalYear) return true;
  return false;
}
