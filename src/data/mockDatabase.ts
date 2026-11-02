import { ZoneAccount, ZoneMonthlySubmission, VitalRecord, RegionalOfficeInfo, CitizenFeedback, AuditLog, ServiceType, ZoneMessageRequest } from '../types';

// Ethiopian Calendar Months (13 months)
export const ETHIOPIAN_MONTHS = [
  'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'
];

export const ETHIOPIAN_YEARS = [2019, 2018, 2017, 2016];

export const SERVICE_NAMES_AM: Record<ServiceType, string> = {
  birth: 'የልደት ምዝገባ',
  death: 'የሞት ምዝገባ',
  marriage: 'የጋብቻ ምዝገባ',
  divorce: 'የፍቺ ምዝገባ',
  adoption: 'የጉዲፈቻ ምዝገባ'
};

// Detailed Timeline Criteria for all 5 Vital Events:
// ልደት (በ90 ቀን | ከ90 ቀን እስከ 1 ዓመት | ከ1 ዓመት በኋላ)
// ጋብቻ (በ30 ቀን | ከ31 ቀን እስከ 1 ዓመት | ከ1 ዓመት በኋላ)
// ፍቺ (በ30 ቀን | ከ31 ቀን እስከ 1 ዓመት | ከ1 ዓመት በኋላ)
// ሞት (እስከ 50 ቀን | ከ50 ቀን እስከ 1 ዓመት | ከ1 ዓመት በኋላ)
// ጉዲፈቻ (በ30 ቀን | ከ31 ቀን እስከ 1 ዓመት | ከ1 ዓመት በኋላ)

export interface StatutoryLimitDetail {
  days: number;
  feeCurrent: number;
  feeLate: number;
  currentWindowAm: string;
  lateWindowAm: string;
  backlogWindowAm: string;
  description: string;
  graceNote: string;
}

export const STATUTORY_LIMITS_AM: Record<ServiceType, StatutoryLimitDetail> = {
  birth: {
    days: 90,
    feeCurrent: 0,
    feeLate: 500,
    currentWindowAm: 'በተወለደ በ90 ቀናት ውስጥ',
    lateWindowAm: 'በተወለደ ከ90 ቀን እስከ 1 ዓመት',
    backlogWindowAm: 'ከተወለደ ከ1 ዓመት በኋላ',
    description: 'በህጉ መሠረት ልደት በተከሰተ በ90 ቀናት ውስጥ ወቅታዊ ምዝገባ ሲሆን ነፃ (0 ብር) ነው፤ ከ90 ቀን እስከ 1 ዓመት የዘገየ ምዝገባ (500 ETB ቅጣት) ሲሆን፤ ከ1 ዓመት በኋላ ነባር ልደት ተብሎ ይመዘገባል።',
    graceNote: 'የ90 ቀናት ወቅታዊ የጊዜ ገደብ'
  },
  death: {
    days: 50,
    feeCurrent: 0,
    feeLate: 500,
    currentWindowAm: 'ከሞተ እስከ 50 ቀናት ባለው ጊዜ',
    lateWindowAm: 'ከ50 ቀን እስከ 1 ዓመት ባለው ጊዜ',
    backlogWindowAm: 'ከሞተ ከ1 ዓመት በኋላ',
    description: 'ሞት በተከሰተ እስከ 50 ቀናት ባለው ጊዜ ወቅታዊ ምዝገባ (ነፃ)፤ ከ50 ቀን እስከ 1 ዓመት የዘገየ ምዝገባ (500 ETB ቅጣት)፤ ከ1 ዓመት በኋላ ነባር የሞት ምዝገባ ተብሎ ይመዘገባል።',
    graceNote: 'የ50 ቀናት ወቅታዊ የጊዜ ገደብ'
  },
  marriage: {
    days: 30,
    feeCurrent: 0,
    feeLate: 500,
    currentWindowAm: 'በተጋቡ በ30 ቀናት ውስጥ',
    lateWindowAm: 'ከተጋቡ ከ31 ቀናት እስከ 1 ዓመት',
    backlogWindowAm: 'ከተጋቡ ከ1 ዓመት በኋላ',
    description: 'ጋብቻ ከተፈጸመ በ30 ቀናት ውስጥ ወቅታዊ ምዝገባ (ነፃ)፤ ከ31 ቀናት እስከ 1 ዓመት የዘገየ ምዝገባ (500 ETB ቅጣት)፤ ከ1 ዓመት በኋላ ነባር ጋብቻ ምዝገባ ተብሎ ይመዘገባል።',
    graceNote: 'የ30 ቀናት ወቅታዊ የጊዜ ገደብ'
  },
  divorce: {
    days: 30,
    feeCurrent: 0,
    feeLate: 500,
    currentWindowAm: 'በፍቺ ውሳኔ በ30 ቀናት ውስጥ',
    lateWindowAm: 'ከ31 ቀናት እስከ 1 ዓመት ባለው ጊዜ',
    backlogWindowAm: 'ከፍቺ ውሳኔ ከ1 ዓመት በኋላ',
    description: 'የፍርድ ቤት ይፋዊ የፍቺ ውሳኔ ከተሰጠበት ቀን ጀምሮ በ30 ቀናት ውስጥ ወቅታዊ ምዝገባ (ነፃ)፤ ከ31 ቀናት እስከ 1 ዓመት የዘገየ ምዝገባ (500 ETB ቅጣት)፤ ከ1 ዓመት በኋላ ነባር ፍቺ ምዝገባ ተብሎ ይመዘገባል።',
    graceNote: 'የ30 ቀናት ወቅታዊ የጊዜ ገደብ'
  },
  adoption: {
    days: 30,
    feeCurrent: 0,
    feeLate: 500,
    currentWindowAm: 'በጉዲፈቻ ውሳኔ በ30 ቀናት ውስጥ',
    lateWindowAm: 'ከ31 ቀናት እስከ 1 ዓመት ባለው ጊዜ',
    backlogWindowAm: 'ከጉዲፈቻ ውሳኔ ከ1 ዓመት በኋላ',
    description: 'የህጋዊ ፍርድ ቤት ጉዲፈቻ ውሳኔ በ30 ቀናት ውስጥ ወቅታዊ ምዝገባ (ነፃ)፤ ከ31 ቀናት እስከ 1 ዓመት የዘገየ ምዝገባ (500 ETB ቅጣት)፤ ከ1 ዓመት በኋላ ነባር ጉዲፈቻ ምዝገባ ተብሎ ይመዘገባል።',
    graceNote: 'የ30 ቀናት ወቅታዊ የጊዜ ገደብ'
  }
};

// 10 Central Ethiopia Zones and Special Woredas (including Halaba Zone)
export const CENTRAL_ETHIOPIA_ZONES: ZoneAccount[] = [
  {
    id: 'hadiya',
    name: 'ሀዲያ ዞን',
    capital: 'ሆሳዕና',
    username: 'hadiya_zone',
    password: 'hadiya@2026',
    officerName: 'አቶ አበበ ኃይሌ',
    officerPhone: '0916-123456',
    woredasCount: 13,
    kebelesCount: 329
  },
  {
    id: 'gurage',
    name: 'ጉራጌ ዞን',
    capital: 'ወልቂጤ',
    username: 'gurage_zone',
    password: 'gurage@2026',
    officerName: 'ወ/ሮ ዘውዲቱ ተስፋዬ',
    officerPhone: '0911-889900',
    woredasCount: 16,
    kebelesCount: 412
  },
  {
    id: 'east_gurage',
    name: 'ምሥራቅ ጉራጌ ዞን',
    capital: 'ቡታጅራ',
    username: 'east_gurage',
    password: 'egurage@2026',
    officerName: 'አቶ ከድር ሸምሱ',
    officerPhone: '0922-334455',
    woredasCount: 6,
    kebelesCount: 148
  },
  {
    id: 'silte',
    name: 'ስልጤ ዞን',
    capital: 'ወራቤ',
    username: 'silte_zone',
    password: 'silte@2026',
    officerName: 'አቶ ጀማል ሁሴን',
    officerPhone: '0913-778899',
    woredasCount: 10,
    kebelesCount: 218
  },
  {
    id: 'kembata',
    name: 'ከምባታ ዞን',
    capital: 'ዱራሜ',
    username: 'kembata_zone',
    password: 'kembata@2026',
    officerName: 'አቶ ዮሐንስ በርሄ',
    officerPhone: '0916-556677',
    woredasCount: 8,
    kebelesCount: 176
  },
  {
    id: 'halaba',
    name: 'ሀላባ ዞን',
    capital: 'ሀላባ ቁሊቶ',
    username: 'halaba_zone',
    password: 'halaba@2026',
    officerName: 'አቶ አብዱረህማን ዑመር',
    officerPhone: '0916-778811',
    woredasCount: 4,
    kebelesCount: 86
  },
  {
    id: 'yem',
    name: 'የም ልዩ ዞን',
    capital: 'ሳጃ',
    username: 'yem_zone',
    password: 'yem@2026',
    officerName: 'አቶ ደረጀ ታደሰ',
    officerPhone: '0917-223344',
    woredasCount: 4,
    kebelesCount: 84
  },
  {
    id: 'mareko',
    name: 'ማረቆ ልዩ ወረዳ/ዞን',
    capital: 'ኮስሄ',
    username: 'mareko_zone',
    password: 'mareko@2026',
    officerName: 'ወ/ሮ ረድኤት አሰፋ',
    officerPhone: '0920-112233',
    woredasCount: 2,
    kebelesCount: 46
  },
  {
    id: 'tembaro',
    name: 'ጠምባሮ ልዩ ወረዳ/ዞን',
    capital: 'ሙዱላ',
    username: 'tembaro_zone',
    password: 'tembaro@2026',
    officerName: 'አቶ ማርቆስ ማቴዎስ',
    officerPhone: '0916-990011',
    woredasCount: 2,
    kebelesCount: 52
  },
  {
    id: 'kebena',
    name: 'ቀቤና ልዩ ወረዳ/ዞን',
    capital: 'ወልቂጤ ዙሪያ',
    username: 'kebena_zone',
    password: 'kebena@2026',
    officerName: 'አቶ ሙስጠፋ ኑር',
    officerPhone: '0912-445566',
    woredasCount: 2,
    kebelesCount: 38
  }
];

export const REGIONAL_OFFICE_DIRECTORY: RegionalOfficeInfo[] = CENTRAL_ETHIOPIA_ZONES.map(z => ({
  id: `off-${z.id}`,
  name: `የማዕከላዊ ኢትዮጵያ ክልል የወሳኝ ኩነቶች መምሪያ - ${z.name}`,
  zone: z.name,
  capital: z.capital,
  address: `${z.capital} ከተማ፣ የ${z.name} አስተዳደር ህንፃ ቢሮ ቁጥር 14`,
  phone: z.officerPhone,
  email: `${z.username}@centralethiopia.gov.et`,
  headRegistrar: z.officerName,
  operatingHours: 'ከሰኞ እስከ አርብ፡ ከጧቱ 2:30 - 11:30'
}));

// Production: Initial Submissions start empty for real data input from zones
export function generateInitialZoneSubmissions(): ZoneMonthlySubmission[] {
  return [];
}

// Production: Initial Records start empty for real data input
export function generateInitialVitalRecords(): VitalRecord[] {
  return [];
}

export const INITIAL_AUDIT_LOGS_AM: AuditLog[] = [
  {
    id: 'log-prod-init',
    timestamp: '30/01/2019 ዓ.ም 01:00 ሰዓት',
    actor: 'የስርዓቱ ማዕከላዊ ደህንነት (System Security)',
    role: 'regional_admin',
    action: 'PRODUCTION_SYSTEM_READY',
    details: 'የማዕከላዊ ኢትዮጵያ ክልል ሲቪልና ቤተሰብ ምዝገባ ኤጀንሲ ይፋዊ ድረ-ገጽ ለህዝብ አገልግሎት ዝግጁ ሆኖ ተጀምሯል።',
    ipAddress: '10.20.0.1',
    status: 'የተሳካ'
  }
];

export const INITIAL_CITIZEN_FEEDBACK_AM: CitizenFeedback[] = [];

export const INITIAL_ZONE_MESSAGES: ZoneMessageRequest[] = [];


