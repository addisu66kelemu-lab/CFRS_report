export type ServiceType = 'birth' | 'death' | 'marriage' | 'divorce' | 'adoption';

export type RegistrationType = 'current' | 'late' | 'backlog';

export type UserRole = 'citizen' | 'zone_officer' | 'regional_admin' | 'super_admin';

// ==========================================
// MODULE CONTENT MANAGEMENT SYSTEM (CMS) TYPES
// ==========================================

export interface HomeModuleContent {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  announcementText: string;
  announcementDate: string;
  statsSectionTitle: string;
  statsSectionSubtitle: string;
  emergencyHotline: string;
}

export interface ServiceModuleItem {
  id: ServiceType;
  title: string;
  subtitle: string;
  statutoryDays: number;
  feeCurrent: string;
  feeLate: string;
  informant: string;
  requiredDocs: string[];
  lateRequirements: string[];
  steps: { title: string; desc: string }[];
  faqs: { q: string; a: string }[];
}

export type ServicesModuleContent = Record<ServiceType, ServiceModuleItem>;

export interface AboutLeaderItem {
  name: string;
  title: string;
  bio: string;
  tenure: string;
  image?: string;
}

export interface AboutMilestoneItem {
  year: string;
  title: string;
  desc: string;
}

export interface AboutModuleContent {
  vision: string;
  mission: string;
  values: string[];
  agencyOverview: string;
  leaders: AboutLeaderItem[];
  milestones: AboutMilestoneItem[];
}

export interface PolicyDocumentItem {
  id: string;
  title: string;
  category: string;
  fileSize: string;
  description: string;
  date: string;
  fileName?: string;
  fileType?: string;
  fileData?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  isCustomUploaded?: boolean;
}

export interface FaqItem {
  q: string;
  a: string;
  category: string;
}

export interface ResourcesModuleContent {
  documents: PolicyDocumentItem[];
  faqs: FaqItem[];
}

export interface ContactModuleContent {
  hqName: string;
  hqAddress: string;
  hqPhone: string;
  hqEmail: string;
  workingHours: string;
  emergencyHotline: string;
  officialTelegram: string;
  supportNotice: string;
  regionalOffices: RegionalOfficeInfo[];
}

export interface ZonesFeesModuleContent {
  latePenaltyFeeETB: number;
  penaltyDescription: string;
  zones: ZoneAccount[];
}

export interface SiteModulesContent {
  home: HomeModuleContent;
  services: ServicesModuleContent;
  about: AboutModuleContent;
  resources: ResourcesModuleContent;
  contact: ContactModuleContent;
  zonesFees: ZonesFeesModuleContent;
}

export interface ZoneAccount {
  id: string; // e.g. 'hadiya'
  name: string; // 'ሀዲያ ዞን'
  capital: string; // 'ሆሳዕና'
  username: string; // 'hadiya_zone'
  password: string; // 'hadiya@2026'
  officerName: string; // 'አቶ አብርሃም በቀለ'
  officerPhone: string;
  woredasCount: number; // ወረዳዎች ብዛት
  kebelesCount: number; // ቀበሌዎች ብዛት
}

export interface VitalCountCategory {
  current: number; // ወቅታዊ (በወቅቱ የተመዘገበ)
  late: number;    // የዘገየ (ከወቅቱ በኋላ እስከ 1 ዓመት የተመዘገበ)
  backlog: number; // ነባር (ከ1 ዓመት በኋላ የተመዘገበ)
}

export interface EventTimelineRule {
  eventType: ServiceType;
  titleAm: string;
  currentDays: number;
  currentWindowAm: string;
  lateWindowAm: string;
  backlogWindowAm: string;
  fullRuleAm: string;
}

export interface ZoneMonthlySubmission {
  id: string;
  zoneId: string;
  zoneName: string;
  year: number;
  month: number; // 1-12
  monthNameAm: string; // 'መስከረም', 'ጥቅምት', etc.
  submittedBy: string;
  submittedAt: string;
  reportingWoredasCount: number;
  reportingKebelesCount: number;
  status: 'የተረጋገጠ' | 'በመገምገም ላይ' | 'የፀደቀ';
  birth: VitalCountCategory;
  death: VitalCountCategory;
  marriage: VitalCountCategory;
  divorce: VitalCountCategory;
  adoption: VitalCountCategory;
  notes?: string;
}

export interface VitalRecord {
  id: string; // CR-2026-B-04812
  eventType: ServiceType;
  eventDate: string; // YYYY-MM-DD
  registrationDate: string; // YYYY-MM-DD
  registrationType: RegistrationType;
  lateDays: number;
  zone: string; // e.g. 'ሀዲያ ዞን'
  woreda: string; // e.g. 'ሌሞ ወረዳ'
  kebele: string; // e.g. 'ቀበሌ 01'
  primarySubject: string; // የተመዝጋቢው ስም
  secondarySubject?: string; // አባት/እናት/የትዳር አጋር
  gender: 'ወንድ' | 'ሴት';
  ageGroup: string;
  status: 'የተረጋገጠ' | 'በማጣራት ላይ';
  officerId: string;
  lateReason?: string;
  feePaid: number;
}

export interface ReportFilter {
  timeRange: 'monthly' | 'quarterly' | 'yearly';
  selectedYear: number;
  selectedMonth: number;
  selectedQuarter: number;
  serviceType: 'all' | ServiceType;
  zone: 'all' | string;
  registrationType: 'all' | RegistrationType;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  details: string;
  ipAddress: string;
  status: 'የተሳካ' | 'ማስጠንቀቂያ' | 'የተከለከለ';
}

export interface CitizenFeedback {
  id: string;
  ticketNumber: string;
  citizenName: string;
  phone: string;
  zone: string;
  serviceCategory: ServiceType | 'general';
  rating: number; // 1-5
  comments: string;
  createdAt: string;
  status: 'አዲስ' | 'በማጣራት ላይ' | 'ምላሽ የተሰጠው';
}

export interface RegionalOfficeInfo {
  id: string;
  name: string;
  zone: string;
  capital: string;
  address: string;
  phone: string;
  email: string;
  headRegistrar: string;
  operatingHours: string;
}

export interface ZoneMessageReply {
  id: string;
  senderRole: 'regional_admin' | 'super_admin' | 'zone_officer';
  senderName: string;
  message: string;
  sentAt: string;
}

export type ZoneMessageCategory = 'supplies' | 'system_support' | 'legal_inquiry' | 'urgent_request' | 'general';
export type ZoneMessagePriority = 'urgent' | 'high' | 'normal';
export type ZoneMessageStatus = 'pending' | 'replied' | 'resolved';

export interface ZoneMessageRequest {
  id: string;
  zoneId: string;
  zoneName: string;
  officerName: string;
  officerPhone: string;
  subject: string;
  category: ZoneMessageCategory;
  categoryAm: string;
  priority: ZoneMessagePriority;
  priorityAm: string;
  message: string;
  woredaAffected?: string;
  createdAt: string;
  status: ZoneMessageStatus;
  statusAm: string;
  replies: ZoneMessageReply[];
}

