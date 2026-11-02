import React, { useState, useMemo, useEffect } from 'react';
import { 
  ZoneMonthlySubmission, 
  VitalRecord, 
  AuditLog, 
  ZoneAccount, 
  UserRole, 
  SiteModulesContent,
  ZoneMessageRequest,
  ZoneMessageReply,
  ZoneMessageCategory,
  ZoneMessagePriority,
  ZoneMessageStatus
} from '../../types';
import { CENTRAL_ETHIOPIA_ZONES, ETHIOPIAN_MONTHS, STATUTORY_LIMITS_AM, INITIAL_ZONE_MESSAGES } from '../../data/mockDatabase';
import { createEncryptedDatabaseBackup } from '../../utils/backupEncryption';
import { 
  getCurrentEthiopianDate, 
  formatEthiopianDateTime, 
  ETHIOPIAN_MONTH_NAMES,
  ETHIOPIAN_FISCAL_QUARTERS,
  isMonthInFiscalQuarter,
  isMonthInFiscalYear
} from '../../utils/ethiopianCalendar';
import { EthiopianCalendarConverterWidget } from '../EthiopianCalendarConverterWidget';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { 
  Sliders, 
  Send, 
  ShieldCheck, 
  Mail, 
  Database, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Download, 
  Users, 
  Building,
  Calendar,
  Check,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  ArrowUpRight,
  Filter,
  Layers,
  Sparkles,
  Edit3,
  RotateCcw,
  Home,
  Info,
  FileText,
  Phone,
  Settings,
  HelpCircle,
  Search,
  X,
  Clock,
  MapPin,
  CalendarRange,
  SlidersHorizontal,
  Hash,
  FileSpreadsheet,
  MessageSquare,
  Reply,
  CornerDownRight,
  Inbox,
  MessageCircle,
  Tag,
  Plus,
  UploadCloud,
  FileUp,
  FolderUp,
  Trash2,
  BookOpen,
  EyeOff,
  KeyRound
} from 'lucide-react';
import { PolicyDocumentItem } from '../../types';
import { triggerDocumentDownload } from '../../utils/documentStorage';
import { UploadDocumentModal } from '../admin/UploadDocumentModal';
import { DocumentViewerModal } from '../admin/DocumentViewerModal';
import { 
  getZonePassword, 
  updateZonePassword, 
  updateAdminPassword, 
  loadCredentials 
} from '../../utils/authCredentials';

interface AdminPortalViewProps {
  submissions: ZoneMonthlySubmission[];
  records: VitalRecord[];
  onApproveSubmission: (subId: string) => void;
  auditLogs: AuditLog[];
  onAddAuditLog: (action: string, details: string) => void;
  userRole?: UserRole;
  siteContent?: SiteModulesContent;
  onOpenContentEditor?: (moduleName?: any) => void;
  onResetContentToDefault?: () => void;
  zoneMessages?: ZoneMessageRequest[];
  onReplyToZoneMessage?: (messageId: string, replyText: string, updatedStatus?: 'replied' | 'resolved') => void;
  onUploadDocument?: (doc: PolicyDocumentItem) => void;
  onDeleteDocument?: (docId: string) => void;
}

// Chart color palettes
const EVENT_COLORS = {
  birth: '#10b981',    // Emerald
  death: '#f43f5e',    // Rose
  marriage: '#06b6d4', // Cyan
  divorce: '#f59e0b',  // Amber
  adoption: '#8b5cf6', // Violet
};

const COMPLIANCE_COLORS = {
  current: '#10b981', // Emerald for Free On-time
  late: '#f59e0b',    // Amber for 500 ETB Late
  backlog: '#8b5cf6', // Violet/Purple for >1 Year Backlog
};

const ZONE_PALETTE = [
  '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
  '#3b82f6', '#14b8a6', '#f97316', '#a855f7', '#6366f1'
];

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  submissions,
  records,
  onApproveSubmission,
  auditLogs,
  onAddAuditLog,
  userRole,
  siteContent,
  onOpenContentEditor,
  onResetContentToDefault,
  zoneMessages,
  onReplyToZoneMessage,
  onUploadDocument,
  onDeleteDocument,
}) => {
  const ethToday = getCurrentEthiopianDate();
  const [activeTab, setActiveTab] = useState<'submissions' | 'charts' | 'cms' | 'documents' | 'zoneCredentials' | 'zoneMessages' | 'converter' | 'notifications' | 'backup' | 'auditLogs'>('charts');
  const [selectedMonth, setSelectedMonth] = useState<number>(1); // መስከረም
  const [selectedYear, setSelectedYear] = useState<number>(2019); // 2019 ዓ.ም የኢትዮጵያ ዘመን አቆጣጠር
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');
  const [barChartMode, setBarChartMode] = useState<'byEvent' | 'byCompliance'>('byEvent');
  const [backupJson, setBackupJson] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Document Upload & Management State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<PolicyDocumentItem | null>(null);
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [docCategoryFilter, setDocCategoryFilter] = useState('all');

  // Ethiopian Fiscal Quarters Bar Chart state
  const [quarterlyFiscalYear, setQuarterlyFiscalYear] = useState<number>(2019);
  const [quarterlyZoneFilter, setQuarterlyZoneFilter] = useState<string>('all');
  const [quarterlyChartMode, setQuarterlyChartMode] = useState<'byEvent' | 'byCompliance' | 'total'>('byEvent');
  const [quarterlyLayout, setQuarterlyLayout] = useState<'grouped' | 'stacked'>('grouped');
  const [chartsActiveSection, setChartsActiveSection] = useState<'all' | 'quarterly' | 'zones' | 'progression'>('all');

  // Zone Message Requests & Direct Reply State
  const [localZoneMessages, setLocalZoneMessages] = useState<ZoneMessageRequest[]>(() => {
    return zoneMessages && zoneMessages.length > 0 ? zoneMessages : INITIAL_ZONE_MESSAGES;
  });

  useEffect(() => {
    if (zoneMessages && zoneMessages.length > 0) {
      setLocalZoneMessages(zoneMessages);
    }
  }, [zoneMessages]);

  const currentZoneMessages = zoneMessages || localZoneMessages;

  const [msgSearchQuery, setMsgSearchQuery] = useState<string>('');
  const [msgZoneFilter, setMsgZoneFilter] = useState<string>('all');
  const [msgStatusFilter, setMsgStatusFilter] = useState<string>('all');
  const [msgPriorityFilter, setMsgPriorityFilter] = useState<string>('all');
  const [msgCategoryFilter, setMsgCategoryFilter] = useState<string>('all');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyInputText, setReplyInputText] = useState<string>('');
  const [replyStatusChoice, setReplyStatusChoice] = useState<'replied' | 'resolved'>('replied');
  const [messageSuccessNotice, setMessageSuccessNotice] = useState<string | null>(null);

  // Submissions search & advanced filtering state
  const [submissionSearchQuery, setSubmissionSearchQuery] = useState<string>('');
  const [submissionZoneFilter, setSubmissionZoneFilter] = useState<string>('all');
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<string>('all');
  const [submissionDateRange, setSubmissionDateRange] = useState<string>('all');
  const [customYear, setCustomYear] = useState<number>(2019);
  const [customMonth, setCustomMonth] = useState<number>(0);
  const [submissionViewMode, setSubmissionViewMode] = useState<'all_records' | 'period_matrix'>('all_records');
  const [submissionSortBy, setSubmissionSortBy] = useState<'newest' | 'oldest' | 'zone' | 'most_events' | 'most_late'>('newest');
  const [selectedSubmissionModal, setSelectedSubmissionModal] = useState<ZoneMonthlySubmission | null>(null);

  // Credentials & Passwords Privacy/Security State
  const [credentialsConfig, setCredentialsConfig] = useState(() => loadCredentials());
  const [revealedZonePasswords, setRevealedZonePasswords] = useState<Record<string, boolean>>({});
  const [revealedAdminPasswords, setRevealedAdminPasswords] = useState<Record<string, boolean>>({});
  const [editingZonePassword, setEditingZonePassword] = useState<{ id: string; name: string; username: string } | null>(null);
  const [newZonePasswordInput, setNewZonePasswordInput] = useState<string>('');
  const [editingAdminRole, setEditingAdminRole] = useState<'regional_admin' | 'super_admin' | null>(null);
  const [newAdminPasswordInput, setNewAdminPasswordInput] = useState<string>('');
  const [passwordNotice, setPasswordNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleUpdateZonePassword = (zoneId: string, zoneName: string) => {
    if (!newZonePasswordInput || newZonePasswordInput.trim().length < 6) {
      setPasswordNotice({ type: 'error', message: 'የይለፍ ቃል ቢያንስ 6 ፊደላት ወይም ቁጥሮች መያዝ አለበት።' });
      return;
    }
    const success = updateZonePassword(zoneId, newZonePasswordInput.trim());
    if (success) {
      setCredentialsConfig(loadCredentials());
      onAddAuditLog('SECURITY_PASSWORD_UPDATED', `ለ${zoneName} አዲስ የይለፍ ቃል በተሳካ ሁኔታ ተቀይሯል።`);
      setPasswordNotice({ type: 'success', message: `የ${zoneName} የይለፍ ቃል በተሳካ ሁኔታ ተቀይሯል!` });
      setTimeout(() => {
        setEditingZonePassword(null);
        setNewZonePasswordInput('');
        setPasswordNotice(null);
      }, 1500);
    }
  };

  const handleUpdateAdminPassword = (role: 'regional_admin' | 'super_admin') => {
    if (!newAdminPasswordInput || newAdminPasswordInput.trim().length < 6) {
      setPasswordNotice({ type: 'error', message: 'የይለፍ ቃል ቢያንስ 6 ፊደላት ወይም ቁጥሮች መያዝ አለበት።' });
      return;
    }
    const success = updateAdminPassword(role, newAdminPasswordInput.trim());
    if (success) {
      setCredentialsConfig(loadCredentials());
      const roleLabel = role === 'super_admin' ? 'የበላይ አስተዳዳሪ (Super Admin)' : 'የክልሉ ማዕከላዊ አስተዳዳሪ (Regional Admin)';
      onAddAuditLog('SECURITY_ADMIN_PASSWORD_UPDATED', `የ${roleLabel} የይለፍ ቃል በተሳካ ሁኔታ ተቀይሯል።`);
      setPasswordNotice({ type: 'success', message: `የ${roleLabel} የይለፍ ቃል በተሳካ ሁኔታ ተቀይሯል!` });
      setTimeout(() => {
        setEditingAdminRole(null);
        setNewAdminPasswordInput('');
        setPasswordNotice(null);
      }, 1500);
    }
  };

  // Submissions filtered by year and month
  const currentMonthSubs = useMemo(() => {
    return submissions.filter(s => s.year === selectedYear && (selectedMonth === 0 || s.month === selectedMonth));
  }, [submissions, selectedYear, selectedMonth]);

  // Filtered submissions based on search query, zone, status, and date range
  const filteredSubmissions = useMemo(() => {
    const query = submissionSearchQuery.toLowerCase().trim();

    const list = submissions.filter(sub => {
      // 1. Zone Filter
      if (submissionZoneFilter !== 'all' && sub.zoneId !== submissionZoneFilter) {
        return false;
      }

      // 2. Status Filter
      if (submissionStatusFilter !== 'all' && sub.status !== submissionStatusFilter) {
        return false;
      }

      // 3. Date Range Filter
      if (submissionDateRange === 'current_month') {
        if (!(sub.year === 2019 && sub.month === 1)) return false;
      } else if (submissionDateRange === 'fiscal_2018_2019' || submissionDateRange === 'fiscal_year') {
        // የ2018/2019 በጀት ዓመት፡ ከሐምሌ 1/2018 ዓ.ም እስከ ሰኔ 30/2019 ዓ.ም
        const isFY = (sub.year === 2018 && sub.month >= 11) || (sub.year === 2019 && sub.month <= 10) || (sub.year === 2018);
        if (!isFY) return false;
      } else if (submissionDateRange === 'fiscal_q1') {
        // 1ኛ ሩብ ዓመት፡ ከሐምሌ 1 እስከ መስከረም 30
        const isQ1 = (sub.year === 2018 && sub.month >= 11) || (sub.year === 2019 && sub.month === 1);
        if (!isQ1) return false;
      } else if (submissionDateRange === 'fiscal_q2') {
        // 2ኛ ሩብ ዓመት፡ ከጥቅምት 1 እስከ ታኅሣሥ 30
        const isQ2 = sub.month === 2 || sub.month === 3 || sub.month === 4;
        if (!isQ2) return false;
      } else if (submissionDateRange === 'fiscal_q3') {
        // 3ኛ ሩብ ዓመት፡ ከጥር 1 እስከ መጋቢት 30
        const isQ3 = sub.month === 5 || sub.month === 6 || sub.month === 7;
        if (!isQ3) return false;
      } else if (submissionDateRange === 'fiscal_q4') {
        // 4ኛ ሩብ ዓመት፡ ከሚያዝያ 1 እስከ ሰኔ 30
        const isQ4 = sub.month === 8 || sub.month === 9 || sub.month === 10;
        if (!isQ4) return false;
      } else if (submissionDateRange === '2019') {
        if (sub.year !== 2019) return false;
      } else if (submissionDateRange === '2018') {
        if (sub.year !== 2018) return false;
      } else if (submissionDateRange === 'last_3_months') {
        const isMatch = (sub.year === 2019 && sub.month === 1) || (sub.year === 2018 && (sub.month === 9 || sub.month === 8));
        if (!isMatch) return false;
      } else if (submissionDateRange === 'last_6_months') {
        const isMatch = (sub.year === 2019 && sub.month === 1) || (sub.year === 2018 && sub.month >= 5);
        if (!isMatch) return false;
      } else if (submissionDateRange === 'custom') {
        if (sub.year !== customYear) return false;
        if (customMonth !== 0 && sub.month !== customMonth) return false;
      }

      // 4. Search Bar Query
      if (query) {
        const matchZone = sub.zoneName.toLowerCase().includes(query);
        const matchOfficer = sub.submittedBy.toLowerCase().includes(query);
        const matchId = sub.id.toLowerCase().includes(query);
        const matchMonth = sub.monthNameAm.toLowerCase().includes(query);
        const matchNotes = (sub.notes || '').toLowerCase().includes(query);
        const matchStatus = sub.status.toLowerCase().includes(query);
        const matchYear = String(sub.year).includes(query);
        if (!matchZone && !matchOfficer && !matchId && !matchMonth && !matchNotes && !matchStatus && !matchYear) {
          return false;
        }
      }

      return true;
    });

    return [...list].sort((a, b) => {
      if (submissionSortBy === 'newest') {
        if (b.year !== a.year) return b.year - a.year;
        return b.month - a.month;
      }
      if (submissionSortBy === 'oldest') {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      }
      if (submissionSortBy === 'zone') {
        return a.zoneName.localeCompare(b.zoneName);
      }
      if (submissionSortBy === 'most_events') {
        const totA = a.birth.current + a.birth.late + a.death.current + a.death.late + a.marriage.current + a.marriage.late + a.divorce.current + a.divorce.late + a.adoption.current + a.adoption.late;
        const totB = b.birth.current + b.birth.late + b.death.current + b.death.late + b.marriage.current + b.marriage.late + b.divorce.current + b.divorce.late + b.adoption.current + b.adoption.late;
        return totB - totA;
      }
      if (submissionSortBy === 'most_late') {
        const lateA = a.birth.late + a.death.late + a.marriage.late + a.divorce.late + a.adoption.late;
        const lateB = b.birth.late + b.death.late + b.marriage.late + b.divorce.late + b.adoption.late;
        return lateB - lateA;
      }
      return 0;
    });
  }, [submissions, submissionZoneFilter, submissionStatusFilter, submissionDateRange, customYear, customMonth, submissionSearchQuery, submissionSortBy]);

  const filteredMetrics = useMemo(() => {
    let events = 0;
    let onTime = 0;
    let late = 0;
    let approved = 0;
    let verified = 0;
    let underReview = 0;

    filteredSubmissions.forEach(s => {
      const cur = s.birth.current + s.death.current + s.marriage.current + s.divorce.current + s.adoption.current;
      const lt = s.birth.late + s.death.late + s.marriage.late + s.divorce.late + s.adoption.late;
      events += (cur + lt);
      onTime += cur;
      late += lt;
      if (s.status === 'የፀደቀ') approved++;
      else if (s.status === 'የተረጋገጠ') verified++;
      else underReview++;
    });

    const lateRevenueETB = late * 500;
    const onTimeRate = events > 0 ? Math.round((onTime / events) * 100) : 0;

    return {
      totalSubmissions: filteredSubmissions.length,
      totalEvents: events,
      totalOnTime: onTime,
      totalLate: late,
      lateRevenueETB,
      onTimeRate,
      approvedCount: approved,
      verifiedCount: verified,
      underReviewCount: underReview,
    };
  }, [filteredSubmissions]);

  const isAnySubmissionFilterActive = 
    submissionSearchQuery.trim() !== '' || 
    submissionZoneFilter !== 'all' || 
    submissionStatusFilter !== 'all' || 
    submissionDateRange !== 'all';

  const handleResetSubmissionFilters = () => {
    setSubmissionSearchQuery('');
    setSubmissionZoneFilter('all');
    setSubmissionStatusFilter('all');
    setSubmissionDateRange('all');
    setCustomYear(2019);
    setCustomMonth(0);
  };

  // Status matrix: check which of the 10 zones submitted
  const zoneSubmissionMatrix = useMemo(() => {
    return CENTRAL_ETHIOPIA_ZONES.map(z => {
      const sub = currentMonthSubs.find(s => s.zoneId === z.id);
      return {
        zone: z,
        submission: sub || null,
        hasSubmitted: !!sub,
      };
    });
  }, [currentMonthSubs]);

  const submittedCount = zoneSubmissionMatrix.filter(z => z.hasSubmitted).length;
  const pendingCount = zoneSubmissionMatrix.length - submittedCount;

  // Memoized calculations for Zone Message Requests
  const pendingMessagesCount = useMemo(() => {
    return currentZoneMessages.filter(m => m.status === 'pending').length;
  }, [currentZoneMessages]);

  const urgentMessagesCount = useMemo(() => {
    return currentZoneMessages.filter(m => m.priority === 'urgent').length;
  }, [currentZoneMessages]);

  const repliedMessagesCount = useMemo(() => {
    return currentZoneMessages.filter(m => m.status === 'replied' || m.status === 'resolved').length;
  }, [currentZoneMessages]);

  const filteredZoneMessages = useMemo(() => {
    const q = msgSearchQuery.toLowerCase().trim();
    return currentZoneMessages.filter(msg => {
      // Zone filter
      if (msgZoneFilter !== 'all' && msg.zoneId !== msgZoneFilter) return false;
      // Status filter
      if (msgStatusFilter !== 'all' && msg.status !== msgStatusFilter) return false;
      // Priority filter
      if (msgPriorityFilter !== 'all' && msg.priority !== msgPriorityFilter) return false;
      // Category filter
      if (msgCategoryFilter !== 'all' && msg.category !== msgCategoryFilter) return false;
      // Search query
      if (q) {
        const inZone = msg.zoneName.toLowerCase().includes(q);
        const inOfficer = msg.officerName.toLowerCase().includes(q);
        const inSubject = msg.subject.toLowerCase().includes(q);
        const inMsg = msg.message.toLowerCase().includes(q);
        const inWoreda = (msg.woredaAffected || '').toLowerCase().includes(q);
        if (!inZone && !inOfficer && !inSubject && !inMsg && !inWoreda) return false;
      }
      return true;
    });
  }, [currentZoneMessages, msgSearchQuery, msgZoneFilter, msgStatusFilter, msgPriorityFilter, msgCategoryFilter]);

  // Handler for sending a reply to a zone's message request
  const handleSendReply = (messageId: string) => {
    if (!replyInputText.trim()) return;

    if (onReplyToZoneMessage) {
      onReplyToZoneMessage(messageId, replyInputText.trim(), replyStatusChoice);
    } else {
      const newReply: ZoneMessageReply = {
        id: `rep-${Date.now()}`,
        senderRole: userRole === 'super_admin' ? 'super_admin' : 'regional_admin',
        senderName: userRole === 'super_admin' ? 'የበላይ አስተዳዳሪ (Super Admin)' : 'የማዕከላዊ ኢትዮጵያ ክልል ዋና አስተዳዳሪ',
        message: replyInputText.trim(),
        sentAt: formatEthiopianDateTime(new Date()),
      };
      setLocalZoneMessages(prev => prev.map(m => {
        if (m.id === messageId) {
          return {
            ...m,
            status: replyStatusChoice,
            statusAm: replyStatusChoice === 'resolved' ? 'የተፈታ' : 'ምላሽ የተሰጠው',
            replies: [...m.replies, newReply]
          };
        }
        return m;
      }));
    }

    const targetMsg = currentZoneMessages.find(m => m.id === messageId);
    onAddAuditLog('ZONE_MESSAGE_REPLIED', `ለ${targetMsg?.zoneName || 'ዞን'} የጥያቄ መልእክት ("${targetMsg?.subject || ''}") ምላሽ ተሰጥቷል`);

    setMessageSuccessNotice(`ለ${targetMsg?.zoneName || 'ዞኑ'} ምላሹ (Reply) በተሳካ ሁኔታ ተልኳል!`);
    setTimeout(() => setMessageSuccessNotice(null), 4000);
    setReplyInputText('');
    setActiveReplyId(null);
  };

  const handleResetMsgFilters = () => {
    setMsgSearchQuery('');
    setMsgZoneFilter('all');
    setMsgStatusFilter('all');
    setMsgPriorityFilter('all');
    setMsgCategoryFilter('all');
  };

  // 0. Data for Ethiopian Fiscal Quarters Bar Chart (Visualizing distribution across the 4 Ethiopian Fiscal Quarters)
  // User Fiscal Specification:
  // - 1ኛ ሩብ ዓመት: ከሐምሌ 1 እስከ መስከረም 30
  // - 2ኛ ሩብ ዓመት: ከጥቅምት 1 እስከ ታኅሣሥ 30
  // - 3ኛ ሩብ ዓመት: ከጥር 1 እስከ መጋቢት 30
  // - 4ኛ ሩብ ዓመት: ከሚያዝያ 1 እስከ ሰኔ 30
  // - ዓመታዊ ሪፖርት: ከሐምሌ 1/2018 ዓ.ም እስከ ሰኔ 30/2019 ዓ.ም
  const quarterlyBarChartData = useMemo(() => {
    const quarters: Array<1 | 2 | 3 | 4> = [1, 2, 3, 4];

    return quarters.map(qId => {
      const qMeta = ETHIOPIAN_FISCAL_QUARTERS[qId];

      const qSubs = submissions.filter(s => {
        if (quarterlyZoneFilter !== 'all' && s.zoneId !== quarterlyZoneFilter) {
          return false;
        }
        return isMonthInFiscalQuarter(s.year, s.month, quarterlyFiscalYear, qId);
      });

      let birthCur = 0, birthLate = 0, birthBacklog = 0;
      let deathCur = 0, deathLate = 0, deathBacklog = 0;
      let marriageCur = 0, marriageLate = 0, marriageBacklog = 0;
      let divorceCur = 0, divorceLate = 0, divorceBacklog = 0;
      let adoptionCur = 0, adoptionLate = 0, adoptionBacklog = 0;

      qSubs.forEach(s => {
        birthCur += s.birth.current;
        birthLate += s.birth.late;
        birthBacklog += s.birth.backlog || 0;

        deathCur += s.death.current;
        deathLate += s.death.late;
        deathBacklog += s.death.backlog || 0;

        marriageCur += s.marriage.current;
        marriageLate += s.marriage.late;
        marriageBacklog += s.marriage.backlog || 0;

        divorceCur += s.divorce.current;
        divorceLate += s.divorce.late;
        divorceBacklog += s.divorce.backlog || 0;

        adoptionCur += s.adoption.current;
        adoptionLate += s.adoption.late;
        adoptionBacklog += s.adoption.backlog || 0;
      });

      const totalBirth = birthCur + birthLate + birthBacklog;
      const totalDeath = deathCur + deathLate + deathBacklog;
      const totalMarriage = marriageCur + marriageLate + marriageBacklog;
      const totalDivorce = divorceCur + divorceLate + divorceBacklog;
      const totalAdoption = adoptionCur + adoptionLate + adoptionBacklog;

      const totalCurrent = birthCur + deathCur + marriageCur + divorceCur + adoptionCur;
      const totalLate = birthLate + deathLate + marriageLate + divorceLate + adoptionLate;
      const totalBacklog = birthBacklog + deathBacklog + marriageBacklog + divorceBacklog + adoptionBacklog;
      const grandTotal = totalCurrent + totalLate + totalBacklog;
      const lateRevenue = totalLate * 500;
      const onTimeRate = grandTotal > 0 ? Math.round((totalCurrent / grandTotal) * 100) : 100;

      return {
        quarterId: qId,
        quarterName: qMeta.name,
        rangeAm: qMeta.rangeAm,
        fullLabel: qMeta.fullLabel,
        shortLabel: `${qId}ኛ ሩብ (${qMeta.rangeAm.replace('ከ', '').replace('እስከ ', '- ')})`,
        monthNames: qMeta.monthNames,
        monthsString: qMeta.monthNames.join('፣ '),
        ልደት: totalBirth,
        ሞት: totalDeath,
        ጋብቻ: totalMarriage,
        ፍቺ: totalDivorce,
        ጉዲፈቻ: totalAdoption,
        መደበኛ: totalCurrent,
        ዘግይቶ: totalLate,
        ነባር: totalBacklog,
        ጠቅላላ: grandTotal,
        lateRevenueETB: lateRevenue,
        onTimeRate,
        submissionsCount: qSubs.length,
      };
    });
  }, [submissions, quarterlyFiscalYear, quarterlyZoneFilter]);

  // Aggregate metrics across all 4 Ethiopian Fiscal Quarters
  const quarterlyFiscalMetrics = useMemo(() => {
    let totalAll = 0;
    let currentAll = 0;
    let lateAll = 0;
    let backlogAll = 0;
    let birthsAll = 0;
    let deathsAll = 0;
    let marriagesAll = 0;
    let divorcesAll = 0;
    let adoptionsAll = 0;

    quarterlyBarChartData.forEach(q => {
      totalAll += q.ጠቅላላ;
      currentAll += q.መደበኛ;
      lateAll += q.ዘግይቶ;
      backlogAll += (q.ነባር || 0);
      birthsAll += q.ልደት;
      deathsAll += q.ሞት;
      marriagesAll += q.ጋብቻ;
      divorcesAll += q.ፍቺ;
      adoptionsAll += q.ጉዲፈቻ;
    });

    const lateRevenueAll = lateAll * 500;
    const onTimeRateAll = totalAll > 0 ? Math.round((currentAll / totalAll) * 100) : 100;
    const sorted = [...quarterlyBarChartData].sort((a, b) => b.ጠቅላላ - a.ጠቅላላ);
    const topQuarter = sorted[0];

    return {
      totalAll,
      currentAll,
      lateAll,
      backlogAll,
      lateRevenueAll,
      onTimeRateAll,
      birthsAll,
      deathsAll,
      marriagesAll,
      divorcesAll,
      adoptionsAll,
      topQuarter,
    };
  }, [quarterlyBarChartData]);

  // 1. Data for Zone Bar Chart (Monthly Registration Trends Across Zones)
  const zoneBarChartData = useMemo(() => {
    return CENTRAL_ETHIOPIA_ZONES.map(z => {
      const sub = currentMonthSubs.find(s => s.zoneId === z.id);
      if (!sub) {
        return {
          zoneName: z.name.replace(' ዞን', '').replace(' ልዩ ወረዳ/ዞን', '').replace(' ልዩ ዞን', ''),
          fullName: z.name,
          ልደት: 0,
          ሞት: 0,
          ጋብቻ: 0,
          ፍቺ: 0,
          ጉዲፈቻ: 0,
          መደበኛ: 0,
          ዘግይቶ: 0,
          ነባር: 0,
          ጠቅላላ: 0,
        };
      }

      const birthTot = sub.birth.current + sub.birth.late + (sub.birth.backlog || 0);
      const deathTot = sub.death.current + sub.death.late + (sub.death.backlog || 0);
      const marriageTot = sub.marriage.current + sub.marriage.late + (sub.marriage.backlog || 0);
      const divorceTot = sub.divorce.current + sub.divorce.late + (sub.divorce.backlog || 0);
      const adoptionTot = sub.adoption.current + sub.adoption.late + (sub.adoption.backlog || 0);

      const currentTot = sub.birth.current + sub.death.current + sub.marriage.current + sub.divorce.current + sub.adoption.current;
      const lateTot = sub.birth.late + sub.death.late + sub.marriage.late + sub.divorce.late + sub.adoption.late;
      const backlogTot = (sub.birth.backlog || 0) + (sub.death.backlog || 0) + (sub.marriage.backlog || 0) + (sub.divorce.backlog || 0) + (sub.adoption.backlog || 0);

      return {
        zoneName: z.name.replace(' ዞን', '').replace(' ልዩ ወረዳ/ዞን', '').replace(' ልዩ ዞን', ''),
        fullName: z.name,
        ልደት: birthTot,
        ሞት: deathTot,
        ጋብቻ: marriageTot,
        ፍቺ: divorceTot,
        ጉዲፈቻ: adoptionTot,
        መደበኛ: currentTot,
        ዘግይቶ: lateTot,
        ነባር: backlogTot,
        ጠቅላላ: currentTot + lateTot + backlogTot,
      };
    });
  }, [currentMonthSubs]);

  // 2. Data for Monthly Progression Bar Chart (Trends over months in selected year)
  const monthlyTimelineData = useMemo(() => {
    const yearSubs = submissions.filter(s => s.year === selectedYear);
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    
    return months.map(m => {
      const mSubs = yearSubs.filter(s => s.month === m && (selectedZoneFilter === 'all' || s.zoneId === selectedZoneFilter));
      
      let birth = 0;
      let death = 0;
      let marriage = 0;
      let divorce = 0;
      let adoption = 0;
      let current = 0;
      let late = 0;
      let backlog = 0;

      mSubs.forEach(s => {
        birth += s.birth.current + s.birth.late + (s.birth.backlog || 0);
        death += s.death.current + s.death.late + (s.death.backlog || 0);
        marriage += s.marriage.current + s.marriage.late + (s.marriage.backlog || 0);
        divorce += s.divorce.current + s.divorce.late + (s.divorce.backlog || 0);
        adoption += s.adoption.current + s.adoption.late + (s.adoption.backlog || 0);

        current += s.birth.current + s.death.current + s.marriage.current + s.divorce.current + s.adoption.current;
        late += s.birth.late + s.death.late + s.marriage.late + s.divorce.late + s.adoption.late;
        backlog += (s.birth.backlog || 0) + (s.death.backlog || 0) + (s.marriage.backlog || 0) + (s.divorce.backlog || 0) + (s.adoption.backlog || 0);
      });

      return {
        monthName: ETHIOPIAN_MONTHS[m - 1],
        ልደት: birth,
        ሞት: death,
        ጋብቻ: marriage,
        ፍቺ: divorce,
        ጉዲፈቻ: adoption,
        መደበኛ: current,
        ዘግይቶ: late,
        ነባር: backlog,
        ጠቅላላ: current + late + backlog,
      };
    }).filter(d => d.ጠቅላላ > 0 || selectedYear === 2019);
  }, [submissions, selectedYear, selectedZoneFilter]);

  // 3. Data for Vital Event Distribution Pie Chart
  const eventPieData = useMemo(() => {
    let birth = 0;
    let death = 0;
    let marriage = 0;
    let divorce = 0;
    let adoption = 0;

    const filteredSubs = currentMonthSubs.filter(s => selectedZoneFilter === 'all' || s.zoneId === selectedZoneFilter);

    filteredSubs.forEach(s => {
      birth += s.birth.current + s.birth.late + (s.birth.backlog || 0);
      death += s.death.current + s.death.late + (s.death.backlog || 0);
      marriage += s.marriage.current + s.marriage.late + (s.marriage.backlog || 0);
      divorce += s.divorce.current + s.divorce.late + (s.divorce.backlog || 0);
      adoption += s.adoption.current + s.adoption.late + (s.adoption.backlog || 0);
    });

    const total = birth + death + marriage + divorce + adoption;

    return [
      { name: 'ልደት (Birth)', value: birth, color: EVENT_COLORS.birth, percent: total ? Math.round((birth / total) * 100) : 0 },
      { name: 'ሞት (Death)', value: death, color: EVENT_COLORS.death, percent: total ? Math.round((death / total) * 100) : 0 },
      { name: 'ጋብቻ (Marriage)', value: marriage, color: EVENT_COLORS.marriage, percent: total ? Math.round((marriage / total) * 100) : 0 },
      { name: 'ፍቺ (Divorce)', value: divorce, color: EVENT_COLORS.divorce, percent: total ? Math.round((divorce / total) * 100) : 0 },
      { name: 'ጉዲፈቻ (Adoption)', value: adoption, color: EVENT_COLORS.adoption, percent: total ? Math.round((adoption / total) * 100) : 0 },
    ].filter(item => item.value > 0);
  }, [currentMonthSubs, selectedZoneFilter]);

  // 4. Data for Compliance (On-time 0 ETB vs Late 500 ETB vs Backlog >1yr) Pie Chart
  const compliancePieData = useMemo(() => {
    let onTime = 0;
    let late = 0;
    let backlog = 0;

    const filteredSubs = currentMonthSubs.filter(s => selectedZoneFilter === 'all' || s.zoneId === selectedZoneFilter);

    filteredSubs.forEach(s => {
      onTime += s.birth.current + s.death.current + s.marriage.current + s.divorce.current + s.adoption.current;
      late += s.birth.late + s.death.late + s.marriage.late + s.divorce.late + s.adoption.late;
      backlog += (s.birth.backlog || 0) + (s.death.backlog || 0) + (s.marriage.backlog || 0) + (s.divorce.backlog || 0) + (s.adoption.backlog || 0);
    });

    const total = onTime + late + backlog;

    return [
      { 
        name: 'ወቅታዊ ምዝገባ (በህጋዊ ጊዜ - 0 ብር)', 
        value: onTime, 
        color: COMPLIANCE_COLORS.current, 
        percent: total ? Math.round((onTime / total) * 100) : 0 
      },
      { 
        name: 'የዘገየ ምዝገባ (እስከ 1 ዓመት - 500 ETB)', 
        value: late, 
        color: COMPLIANCE_COLORS.late, 
        percent: total ? Math.round((late / total) * 100) : 0 
      },
      { 
        name: 'ነባር ምዝገባ (>1 ዓመት - በማስረጃ)', 
        value: backlog, 
        color: COMPLIANCE_COLORS.backlog, 
        percent: total ? Math.round((backlog / total) * 100) : 0 
      },
    ].filter(i => i.value > 0);
  }, [currentMonthSubs, selectedZoneFilter]);

  // 5. Zone Share Pie Data (Share of registrations by zone)
  const zoneSharePieData = useMemo(() => {
    return zoneBarChartData
      .filter(z => z.ጠቅላላ > 0)
      .map((z, idx) => ({
        name: z.fullName,
        value: z.ጠቅላላ,
        color: ZONE_PALETTE[idx % ZONE_PALETTE.length]
      }));
  }, [zoneBarChartData]);

  // Aggregate Metrics
  const totalVitalEvents = useMemo(() => {
    return eventPieData.reduce((acc, curr) => acc + curr.value, 0);
  }, [eventPieData]);

  const totalLateCount = useMemo(() => {
    const lateItem = compliancePieData.find(i => i.name.includes('የዘገየ'));
    return lateItem ? lateItem.value : 0;
  }, [compliancePieData]);

  const totalLateRevenueETB = totalLateCount * 500;

  const onTimePercentage = useMemo(() => {
    const onTimeItem = compliancePieData.find(i => i.name.includes('መደበኛ'));
    return onTimeItem ? onTimeItem.percent : 0;
  }, [compliancePieData]);

  const topPerformingZone = useMemo(() => {
    if (!zoneBarChartData.length) return null;
    const sorted = [...zoneBarChartData].sort((a, b) => b.ጠቅላላ - a.ጠቅላላ);
    return sorted[0] && sorted[0].ጠቅላላ > 0 ? sorted[0] : null;
  }, [zoneBarChartData]);

  const handleDownloadEncryptedBackup = async () => {
    const backup = await createEncryptedDatabaseBackup(records, auditLogs, 'የማዕከላዊ ኢትዮጵያ ክልል ዋና ዳይሬክተር');
    setBackupJson(JSON.stringify(backup, null, 2));

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `የማዕከላዊ_ኢትዮጵያ_ወሳኝ_ኩነቶች_ምስጠራዊ_ቅጂ_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onAddAuditLog('BACKUP_EXPORT', 'የክልሉ 10ሩም ዞኖች መረጃዎች በምስጠራ ተቀምጠው ወረዱ');
  };

  const handleSendZoneDigest = () => {
    const monthText = selectedMonth === 0 ? 'የዓመቱ' : `የ${ETHIOPIAN_MONTHS[selectedMonth - 1]} ወር`;
    setNotificationMsg(`ለ10ሩም ዞኖች አስተባባሪዎች እና ለክልሉ ጤና ቢሮ ${monthText} የማጠቃለያ ሪፖርትና ማሳሰቢያ በኢሜይል/ኤስኤምኤስ ተላከ።`);
    onAddAuditLog('NOTIFICATION_DISPATCH', `${monthText} ማሳሰቢያ ለዞኖች ተላከ`);
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  // Custom Light Civic Tooltip for Recharts
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-200 bg-white/95 p-3.5 shadow-xl backdrop-blur-md text-xs text-slate-900">
          <div className="font-bold text-slate-900 mb-2 border-b border-slate-200 pb-1 flex items-center justify-between gap-3">
            <span>{label}</span>
            <span className="text-[10px] text-cyan-700 font-mono font-bold">የተጠናከረ ውሂብ</span>
          </div>
          <div className="space-y-1 font-mono">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}:
                </span>
                <span className="font-bold text-slate-900">
                  {entry.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Analytical Tooltip for Ethiopian Fiscal Quarters Bar Chart
  const CustomQuarterlyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const qItem = quarterlyBarChartData.find(q => q.quarterName === label || q.shortLabel === label);
      const totalInQ = qItem?.ጠቅላላ || 0;

      return (
        <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur-md text-xs text-slate-900 max-w-sm">
          {/* Header */}
          <div className="border-b border-slate-200 pb-2 mb-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-extrabold text-sm text-emerald-800">{qItem?.quarterName || label}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {quarterlyFiscalYear === 2019 ? '2018/2019' : '2017/2018'} በጀት ዓመት
              </span>
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5 font-medium">
              📅 {qItem?.rangeAm || ''}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              የተካተቱ ወራት፦ {qItem?.monthsString}
            </div>
          </div>

          {/* Breakdown based on mode */}
          <div className="space-y-1.5 font-mono">
            {quarterlyChartMode === 'byEvent' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600 font-sans font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
                    ልደት (Birth):
                  </span>
                  <span className="font-bold text-slate-900">
                    {qItem?.ልደት.toLocaleString()} ({totalInQ ? Math.round(((qItem?.ልደት || 0) / totalInQ) * 100) : 0}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600 font-sans font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#f43f5e]" />
                    ሞት (Death):
                  </span>
                  <span className="font-bold text-slate-900">
                    {qItem?.ሞት.toLocaleString()} ({totalInQ ? Math.round(((qItem?.ሞት || 0) / totalInQ) * 100) : 0}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600 font-sans font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#06b6d4]" />
                    ጋብቻ (Marriage):
                  </span>
                  <span className="font-bold text-slate-900">
                    {qItem?.ጋብቻ.toLocaleString()} ({totalInQ ? Math.round(((qItem?.ጋብቻ || 0) / totalInQ) * 100) : 0}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600 font-sans font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
                    ፍቺ (Divorce):
                  </span>
                  <span className="font-bold text-slate-900">
                    {qItem?.ፍቺ.toLocaleString()} ({totalInQ ? Math.round(((qItem?.ፍቺ || 0) / totalInQ) * 100) : 0}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600 font-sans font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#8b5cf6]" />
                    ጉዲፈቻ (Adoption):
                  </span>
                  <span className="font-bold text-slate-900">
                    {qItem?.ጉዲፈቻ.toLocaleString()} ({totalInQ ? Math.round(((qItem?.ጉዲፈቻ || 0) / totalInQ) * 100) : 0}%)
                  </span>
                </div>
              </>
            )}

            {quarterlyChartMode === 'byCompliance' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600 font-sans font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#059669]" />
                    መደበኛ ነፃ (0 ETB):
                  </span>
                  <span className="font-bold text-emerald-800">
                    {qItem?.መደበኛ.toLocaleString()} ({qItem?.onTimeRate}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600 font-sans font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#d97706]" />
                    የዘገየ ቅጣት (500 ETB):
                  </span>
                  <span className="font-bold text-amber-800">
                    {qItem?.ዘግይቶ.toLocaleString()} ({qItem?.lateRevenueETB.toLocaleString()} ETB)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600 font-sans font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#8b5cf6]" />
                    ነባር (ከ1 ዓመት በኋላ):
                  </span>
                  <span className="font-bold text-purple-800">
                    {(qItem?.ነባር || 0).toLocaleString()}
                  </span>
                </div>
              </>
            )}

            {quarterlyChartMode === 'total' && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600 font-sans font-medium">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#0284c7]" />
                  ጠቅላላ ኩነቶች፦
                </span>
                <span className="font-bold text-cyan-800 text-sm">
                  {totalInQ.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Footer Total */}
          <div className="border-t border-slate-200 mt-2.5 pt-2 flex items-center justify-between font-mono">
            <span className="text-[11px] text-slate-700 font-bold font-sans">የሩብ ዓመቱ ድምር፦</span>
            <span className="font-black text-slate-900 text-sm">{totalInQ.toLocaleString()} ኩነቶች</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-bold mt-1">
            ✓ የመደበኛ ምዝገባ ምጣኔ፦ {qItem?.onTimeRate}% | የተሰበሰበ ቅጣት፦ {qItem?.lateRevenueETB.toLocaleString()} ETB
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl text-xs backdrop-blur-md text-slate-900">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: data.payload.color || data.color }} />
            <span>{data.name}</span>
          </div>
          <div className="font-mono text-slate-700">
            ብዛት፦ <strong className="text-slate-900">{data.value.toLocaleString()}</strong> ({data.payload.percent || Math.round((data.value / (totalVitalEvents || 1)) * 100)}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-800 mb-2 shadow-xs">
            <Sliders className="h-3.5 w-3.5 text-cyan-600" />
            <span>የማዕከላዊ ኢትዮጵያ ክልል ማዕከላዊ አስተዳዳሪ ፖርታል</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            የዞኖች ወርሃዊ ሪፖርትና የስታቲስቲክስ መቆጣጠሪያ
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-4xl">
            ከ10ሩም ዞኖች (ሀላባ፣ ሀዲያ፣ ጉራጌ፣ ስልጤ፣ ከምባታ፣ የም፣ ማረቆ፣ ጠምባሮ፣ ቀቤና እና ምሥራቅ ጉራጌ) የሚላኩ የወሳኝ ኩነቶች መረጃዎችን በባር (Bar) እና በፓይ (Pie) ግራፎች የመተንተን፣ የመገምገም እና የማጽደቅ ማዕከል
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono text-xs font-bold shadow-xs">
            <Calendar className="h-3.5 w-3.5 text-emerald-600" />
            <span>ዛሬ፡ {ethToday.fullFormatted}</span>
          </div>
          {userRole === 'super_admin' ? (
            <span className="px-3 py-1.5 rounded-lg bg-amber-500 text-amber-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 border border-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-950 animate-ping" />
              <span>👑 የበላይ አስተዳዳሪ (Super Admin)</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-lg bg-cyan-50 border border-cyan-300 text-cyan-800 font-bold text-xs shadow-xs">
              👤 የክልሉ ዋና አስተዳዳሪ
            </span>
          )}
          {onOpenContentEditor && (
            <button
              onClick={() => onOpenContentEditor()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              title="የሁሉንም ሞጁሎች ይዘት አርትዕ (Edit Content of All Modules)"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>ይዘት አርትዕ (CMS)</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/90 pb-3">
        {[
          { id: 'charts', label: 'የምዝገባ ስታቲስቲክስና ግራፎች (Charts)', icon: BarChart3 },
          { id: 'documents', label: '📁 የሰነዶች መጫኛ (Document Upload)', icon: FileUp },
          { id: 'cms', label: '👑 የሞጁሎች ይዘት (CMS)', icon: Sparkles },
          { id: 'submissions', label: 'የዞኖች ወርሃዊ ሪፖርት መቀበያ', icon: Send },
          { id: 'zoneMessages', label: 'የዞኖች የመልእክት ጥያቄዎች (Requests & Replay)', icon: MessageSquare },
          { id: 'converter', label: 'የኢትዮጵያ ካላንደር መለወጫ', icon: Calendar },
          { id: 'zoneCredentials', label: 'የ10ሩ ዞኖች መለያዎች', icon: Key },
          { id: 'notifications', label: 'ለዞኖች ማሳሰቢያ መላኪያ', icon: Mail },
          { id: 'backup', label: 'ምስጠራዊ የውሂብ ቅጂ', icon: Database },
          { id: 'auditLogs', label: 'የደህንነት ኦዲት መዝገብ', icon: ShieldCheck },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                isActive
                  ? tab.id === 'cms'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-md shadow-amber-500/30'
                    : tab.id === 'documents'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-500'
                    : tab.id === 'zoneMessages'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 border border-amber-400'
                    : 'bg-cyan-50 text-cyan-800 border border-cyan-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {tab.id === 'documents' && (
                <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 font-mono">
                  {siteContent?.resources?.documents?.length || 4}
                </span>
              )}
              {tab.id === 'charts' && (
                <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] bg-cyan-600 text-white font-mono">
                  Recharts
                </span>
              )}
              {tab.id === 'submissions' && (
                <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 font-mono">
                  {submissions.length}
                </span>
              )}
              {tab.id === 'zoneMessages' && (
                <span className={`ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold border font-mono flex items-center gap-1 ${
                  isActive ? 'bg-amber-950 text-amber-200 border-amber-800' : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}>
                  {pendingMessagesCount > 0 && <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />}
                  <span>{pendingMessagesCount} አዲስ</span>
                </span>
              )}
              {tab.id === 'cms' && (
                <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] bg-amber-100 text-amber-900 font-bold border border-amber-300">
                  6 ሞጁሎች
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* CONTROLS FOR PERIOD & ZONE FILTERING (Used by Charts Tab) */}
      {activeTab === 'charts' && (
        <div className="rounded-2xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-4 sm:p-5 space-y-4 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Year Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">ዓመተ ምህረት (የኢትዮጵያ ካላንደር)</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none font-mono shadow-xs"
                >
                  <option value={2019}>2019 ዓ.ም (የአሁኑ ዓመት - መስከረም 24)</option>
                  <option value={2018}>2018 ዓ.ም (ሙሉ ዓመታዊ መረጃ)</option>
                  <option value={2017}>2017 ዓ.ም</option>
                  <option value={2016}>2016 ዓ.ም</option>
                </select>
              </div>

              {/* Month Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">የሪፖርት ወር</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none shadow-xs"
                >
                  <option value={0}>ሁሉም ወራት (ዓመታዊ ድምር)</option>
                  {ETHIOPIAN_MONTHS.slice(0, selectedYear === 2019 ? 1 : 12).map((m, idx) => (
                    <option key={idx} value={idx + 1}>{m} ወር ({idx + 1})</option>
                  ))}
                </select>
              </div>

              {/* Zone Filter Drilldown */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">የዞን ምርጫ</label>
                <select
                  value={selectedZoneFilter}
                  onChange={(e) => setSelectedZoneFilter(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none shadow-xs"
                >
                  <option value="all">ሁሉም 10ሩ ዞኖች (ሀላባን ጨምሮ)</option>
                  {CENTRAL_ETHIOPIA_ZONES.map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick KPI stats in header */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="rounded-xl bg-emerald-50 border border-emerald-300 px-3 py-1.5 text-emerald-800 font-mono shadow-xs">
                መደበኛ (0 ብር)፡ <strong>{onTimePercentage}%</strong>
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-300 px-3 py-1.5 text-amber-800 font-mono shadow-xs">
                የዘገዩ ቅጣት፡ <strong>{totalLateRevenueETB.toLocaleString()} ETB</strong>
              </div>
              <div className="rounded-xl bg-cyan-50 border border-cyan-300 px-3 py-1.5 text-cyan-800 font-mono shadow-xs">
                ጠቅላላ ኩነቶች፡ <strong>{totalVitalEvents.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CHARTS & VISUALIZATIONS (RECHARTS) */}
      {activeTab === 'charts' && (
        <div className="space-y-8">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-5 space-y-1 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">ጠቅላላ የተመዘገቡ ኩነቶች</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                {totalVitalEvents.toLocaleString()}
              </div>
              <p className="text-[11px] text-cyan-700 font-bold flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>በ{selectedYear} ዓ.ም {selectedMonth === 0 ? 'በሁሉም ወራት' : `በ${ETHIOPIAN_MONTHS[selectedMonth - 1]}`}</span>
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 backdrop-blur-md p-5 space-y-1 shadow-sm">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">የመደበኛ ምዝገባ ምጣኔ</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
                {onTimePercentage}%
              </div>
              <p className="text-[11px] text-emerald-800 font-medium">
                በህጋዊ የጊዜ ገደብ የተከናወኑ ነፃ (0 ብር) ምዝገባዎች
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/90 backdrop-blur-md p-5 space-y-1 shadow-sm">
              <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">የተሰበሰበ የዘገየ ምዝገባ ቅጣት</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 font-mono">
                {totalLateRevenueETB.toLocaleString()} <span className="text-xs text-amber-800 font-sans font-bold">ETB</span>
              </div>
              <p className="text-[11px] text-amber-800 font-medium">
                ከ{totalLateCount.toLocaleString()} የዘገዩ ምዝገባዎች (በ500 ብር ህጋዊ ቅጣት)
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-5 space-y-1 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">ከፍተኛ ምዝገባ ያስመዘገበ ዞን</span>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 truncate">
                {topPerformingZone ? topPerformingZone.fullName : 'መረጃ የለም'}
              </div>
              <p className="text-[11px] text-cyan-700 font-mono font-bold">
                {topPerformingZone ? `${topPerformingZone.ጠቅላላ.toLocaleString()} ወሳኝ ኩነቶች` : '-'}
              </p>
            </div>
          </div>

          {/* SECTION NAVIGATOR FOR CHARTS */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white/85 backdrop-blur-md p-2.5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2">የግራፎች እይታ፦</span>
              {[
                { id: 'all', label: '📊 ሁሉንም ግራፎች አሳይ (All Analytics)' },
                { id: 'quarterly', label: '🏛️ የበጀት ዓመት 4ቱ ሩብ ዓመታት (Fiscal Quarters)' },
                { id: 'zones', label: '🏢 የ10ሩ ዞኖች ንፅፅር (10 Zones)' },
                { id: 'progression', label: '📈 የወራት አዝማሚያ (Monthly Timeline)' },
              ].map(sec => (
                <button
                  key={sec.id}
                  onClick={() => setChartsActiveSection(sec.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                    chartsActiveSection === sec.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            <div className="text-[11px] text-emerald-800 font-mono font-bold px-2 hidden sm:block">
              {quarterlyFiscalYear === 2019 ? 'የ2018/2019 በጀት ዓመት (ሐምሌ 1/2018 - ሰኔ 30/2019)' : 'የ2017/2018 በጀት ዓመት'}
            </div>
          </div>

          {/* ============================================================== */}
          {/* FEATURED: ETHIOPIAN FISCAL QUARTERS RECHARTS BAR CHART          */}
          {/* ============================================================== */}
          {(chartsActiveSection === 'all' || chartsActiveSection === 'quarterly') && (
            <div className="rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-b from-emerald-50/40 via-white/95 to-white/95 backdrop-blur-md p-5 sm:p-7 space-y-6 shadow-md">
              {/* Header & Controls Bar */}
              <div className="space-y-3 border-b border-emerald-100 pb-5">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-xs">
                      <BarChart3 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>የማዕከላዊ ኢትዮጵያ ክልል ዓመታዊና ሩብ ዓመት ትንተና • Recharts Bar Chart</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      <span>የበጀት ዓመት አራቱ ሩብ ዓመታት የወሳኝ ኩነቶች ስርጭት</span>
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        4 Quarters Bar Chart
                      </span>
                    </h2>
                    <p className="text-xs text-slate-600 max-w-4xl leading-relaxed">
                      በኢትዮጵያ በጀት ዓመት መሠረት የተመዘገቡ ወሳኝ ኩነቶች (ልደት፣ ሞት፣ ጋብቻ፣ ፍቺ እና ጉዲፈቻ) በየሩብ ዓመቱ እና በየዞኑ ያለው ስርጭት ትንተና
                    </p>
                  </div>

                  {/* Interactive Chart Controls */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Fiscal Year Picker */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">የበጀት ዓመት</label>
                      <select
                        value={quarterlyFiscalYear}
                        onChange={(e) => setQuarterlyFiscalYear(Number(e.target.value))}
                        className="rounded-xl border border-emerald-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none shadow-xs font-sans font-bold"
                      >
                        <option value={2019}>2018/2019 በጀት ዓመት (ከሐምሌ 1/2018 - ሰኔ 30/2019)</option>
                        <option value={2018}>2017/2018 በጀት ዓመት (ከሐምሌ 1/2017 - ሰኔ 30/2018)</option>
                      </select>
                    </div>

                    {/* Zone Filter */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">የዞን ማጣሪያ</label>
                      <select
                        value={quarterlyZoneFilter}
                        onChange={(e) => setQuarterlyZoneFilter(e.target.value)}
                        className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none shadow-xs"
                      >
                        <option value="all">🏢 ሁሉም 10ሩ ዞኖች (የክልሉ ድምር)</option>
                        {CENTRAL_ETHIOPIA_ZONES.map(z => (
                          <option key={z.id} value={z.id}>{z.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Metric Mode Toggle */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">የግራፉ አቀራረብ</label>
                      <div className="flex items-center rounded-xl bg-slate-100 border border-slate-200 p-0.5 text-xs">
                        <button
                          onClick={() => setQuarterlyChartMode('byEvent')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                            quarterlyChartMode === 'byEvent' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="በ5ቱ ወሳኝ ኩነቶች ዓይነት (ልደት፣ ሞት፣ ጋብቻ፣ ፍቺ፣ ጉዲፈቻ)"
                        >
                          በኩነቶች ዓይነት
                        </button>
                        <button
                          onClick={() => setQuarterlyChartMode('byCompliance')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                            quarterlyChartMode === 'byCompliance' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="በህጋዊ ተገዢነት (መደበኛ 0 ETB እና የዘገየ 500 ETB)"
                        >
                          በተገዢነት
                        </button>
                        <button
                          onClick={() => setQuarterlyChartMode('total')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                            quarterlyChartMode === 'total' ? 'bg-cyan-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="የሩብ ዓመቱ ጠቅላላ ድምር ብቻ"
                        >
                          ጠቅላላ ድምር
                        </button>
                      </div>
                    </div>

                    {/* Stack vs Grouped Toggle */}
                    {quarterlyChartMode !== 'total' && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">የአቀማመጥ ስልት</label>
                        <button
                          onClick={() => setQuarterlyLayout(prev => prev === 'grouped' ? 'stacked' : 'grouped')}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer shadow-xs"
                          title="የባር ግራፉን ጎን ለጎን ወይም የተደራረበ አድርግ"
                        >
                          <Layers className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{quarterlyLayout === 'stacked' ? 'የተደራረበ' : 'ጎን ለጎን'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statutory Fiscal Year Definition Ribbon */}
                <div className="rounded-xl bg-emerald-50/90 border border-emerald-200/90 p-3 text-xs text-emerald-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">
                      በጀት ዓመት ህጋዊ ክፍፍል፦
                    </span>
                    <span className="text-[11px] text-emerald-900">
                      <strong>1ኛ ሩብ፡</strong> ከሐምሌ 1 እስከ መስከረም 30 • 
                      <strong> 2ኛ ሩብ፡</strong> ከጥቅምት 1 እስከ ታኅሣሥ 30 • 
                      <strong> 3ኛ ሩብ፡</strong> ከጥር 1 እስከ መጋቢት 30 • 
                      <strong> 4ኛ ሩብ፡</strong> ከሚያዝያ 1 እስከ ሰኔ 30
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-800 font-bold bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-300 shrink-0">
                    የአመት ሪፖርት ፡ ከሐምሌ 1/{quarterlyFiscalYear === 2019 ? '2018' : '2017'} እስከ ሰኔ 30/{quarterlyFiscalYear} ዓ.ም
                  </div>
                </div>
              </div>

              {/* 4 Ethiopian Fiscal Quarters KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quarterlyBarChartData.map((q) => {
                  const shareOfAnnual = quarterlyFiscalMetrics.totalAll > 0
                    ? Math.round((q.ጠቅላላ / quarterlyFiscalMetrics.totalAll) * 100)
                    : 0;
                  const isTop = quarterlyFiscalMetrics.topQuarter?.quarterId === q.quarterId;

                  return (
                    <div
                      key={q.quarterId}
                      className={`rounded-2xl border p-4.5 space-y-2.5 transition-all shadow-xs ${
                        isTop 
                          ? 'border-emerald-400 bg-emerald-50/60 ring-2 ring-emerald-400/20' 
                          : 'border-slate-200/90 bg-white/90'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-600" />
                          <span>{q.quarterName}</span>
                        </span>
                        {isTop && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white font-mono shadow-xs">
                            ከፍተኛ ምዝገባ 👑
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 font-medium">
                        📅 {q.rangeAm}
                      </div>

                      <div className="pt-1 flex items-baseline justify-between">
                        <div className="text-2xl font-black text-slate-900 font-mono">
                          {q.ጠቅላላ.toLocaleString()}
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                          {shareOfAnnual}% የዓመቱ ድርሻ
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] font-mono">
                        <div className="text-slate-600">
                          መደበኛ፦ <strong className="text-emerald-700">{q.onTimeRate}%</strong>
                        </div>
                        <div className="text-slate-600 text-right">
                          ቅጣት፦ <strong className="text-amber-700">{q.lateRevenueETB.toLocaleString()}</strong> <span className="text-[9px]">ETB</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 font-sans truncate" title={q.monthsString}>
                        ወራት፦ {q.monthsString}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RECHARTS BAR CHART CONTAINER */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-emerald-600" />
                      <span>የአራቱ ሩብ ዓመታት የንፅፅር ባር ግራፍ (Quarterly Bar Chart Visualization)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {quarterlyZoneFilter === 'all' 
                        ? 'የማዕከላዊ ኢትዮጵያ 10ሩ ዞኖች ጥምር ውጤት' 
                        : `${CENTRAL_ETHIOPIA_ZONES.find(z => z.id === quarterlyZoneFilter)?.name} ብቻ`}
                    </p>
                  </div>

                  {/* Summary Ribbon */}
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                      የዓመቱ ድምር፦ {quarterlyFiscalMetrics.totalAll.toLocaleString()} ኩነቶች
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-800 font-bold border border-cyan-200">
                      የመደበኛ አማካይ፦ {quarterlyFiscalMetrics.onTimeRateAll}%
                    </span>
                  </div>
                </div>

                <div className="h-80 sm:h-96 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={quarterlyBarChartData}
                      margin={{ top: 15, right: 15, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                      <XAxis 
                        dataKey="shortLabel" 
                        stroke="#475569" 
                        fontSize={11} 
                        tickLine={false}
                        interval={0}
                      />
                      <YAxis 
                        stroke="#475569" 
                        fontSize={11} 
                        tickLine={false} 
                        tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : String(val)}
                      />
                      <Tooltip content={<CustomQuarterlyTooltip />} />
                      <Legend 
                        wrapperStyle={{ paddingTop: '16px', fontSize: '11px' }} 
                      />

                      {quarterlyChartMode === 'byEvent' && (
                        <>
                          <Bar 
                            dataKey="ልደት" 
                            name="ልደት (Birth)" 
                            fill={EVENT_COLORS.birth} 
                            radius={quarterlyLayout === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]} 
                            stackId={quarterlyLayout === 'stacked' ? 'qStack' : undefined} 
                          />
                          <Bar 
                            dataKey="ሞት" 
                            name="ሞት (Death)" 
                            fill={EVENT_COLORS.death} 
                            radius={quarterlyLayout === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]} 
                            stackId={quarterlyLayout === 'stacked' ? 'qStack' : undefined} 
                          />
                          <Bar 
                            dataKey="ጋብቻ" 
                            name="ጋብቻ (Marriage)" 
                            fill={EVENT_COLORS.marriage} 
                            radius={quarterlyLayout === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]} 
                            stackId={quarterlyLayout === 'stacked' ? 'qStack' : undefined} 
                          />
                          <Bar 
                            dataKey="ፍቺ" 
                            name="ፍቺ (Divorce)" 
                            fill={EVENT_COLORS.divorce} 
                            radius={quarterlyLayout === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]} 
                            stackId={quarterlyLayout === 'stacked' ? 'qStack' : undefined} 
                          />
                          <Bar 
                            dataKey="ጉዲፈቻ" 
                            name="ጉዲፈቻ (Adoption)" 
                            fill={EVENT_COLORS.adoption} 
                            radius={[4, 4, 0, 0]} 
                            stackId={quarterlyLayout === 'stacked' ? 'qStack' : undefined} 
                          />
                        </>
                      )}

                      {quarterlyChartMode === 'byCompliance' && (
                        <>
                          <Bar 
                            dataKey="መደበኛ" 
                            name="ወቅታዊ (0 ብር - ነፃ)" 
                            fill={COMPLIANCE_COLORS.current} 
                            radius={quarterlyLayout === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]} 
                            stackId={quarterlyLayout === 'stacked' ? 'compStack' : undefined} 
                          />
                          <Bar 
                            dataKey="ዘግይቶ" 
                            name="የዘገየ (500 ETB ቅጣት)" 
                            fill={COMPLIANCE_COLORS.late} 
                            radius={quarterlyLayout === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]} 
                            stackId={quarterlyLayout === 'stacked' ? 'compStack' : undefined} 
                          />
                          <Bar 
                            dataKey="ነባር" 
                            name="ነባር (>1 ዓመት)" 
                            fill={COMPLIANCE_COLORS.backlog} 
                            radius={[4, 4, 0, 0]} 
                            stackId={quarterlyLayout === 'stacked' ? 'compStack' : undefined} 
                          />
                        </>
                      )}

                      {quarterlyChartMode === 'total' && (
                        <Bar 
                          dataKey="ጠቅላላ" 
                          name="ጠቅላላ የተመዘገቡ ወሳኝ ኩነቶች" 
                          fill="#0284c7" 
                          radius={[6, 6, 0, 0]} 
                        />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* DETAILED QUARTERLY ANALYTICAL COMPARISON TABLE */}
              <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
                <div className="bg-slate-50/90 px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      የአራቱ ሩብ ዓመታት ዝርዝር ንፅፅር ሠንጠረዥ (Quarterly Analytical Matrix)
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    የዞን ሽፋን፦ <strong>{quarterlyZoneFilter === 'all' ? '10ሩም ዞኖች' : CENTRAL_ETHIOPIA_ZONES.find(z => z.id === quarterlyZoneFilter)?.name}</strong>
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse font-sans">
                    <thead>
                      <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="py-2.5 px-3">ሩብ ዓመት</th>
                        <th className="py-2.5 px-3">የጊዜ ወሰን (Ethiopian Dates)</th>
                        <th className="py-2.5 px-3 text-right">ልደት</th>
                        <th className="py-2.5 px-3 text-right">ሞት</th>
                        <th className="py-2.5 px-3 text-right">ጋብቻ</th>
                        <th className="py-2.5 px-3 text-right">ፍቺ</th>
                        <th className="py-2.5 px-3 text-right">ጉዲፈቻ</th>
                        <th className="py-2.5 px-3 text-right font-black text-slate-900">ጠቅላላ ኩነቶች</th>
                        <th className="py-2.5 px-3 text-right text-emerald-700">መደበኛ ምጣኔ</th>
                        <th className="py-2.5 px-3 text-right text-amber-700">የዘገየ ቅጣት (ETB)</th>
                        <th className="py-2.5 px-3 text-right text-cyan-800">የዓመቱ ድርሻ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {quarterlyBarChartData.map((row) => {
                        const share = quarterlyFiscalMetrics.totalAll > 0
                          ? Math.round((row.ጠቅላላ / quarterlyFiscalMetrics.totalAll) * 100)
                          : 0;
                        return (
                          <tr key={row.quarterId} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-3 font-sans font-bold text-slate-900 flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-emerald-600" />
                              <span>{row.quarterName}</span>
                            </td>
                            <td className="py-3 px-3 text-slate-600 font-sans text-[11px]">
                              {row.rangeAm}
                            </td>
                            <td className="py-3 px-3 text-right text-emerald-700 font-bold">{row.ልደት.toLocaleString()}</td>
                            <td className="py-3 px-3 text-right text-rose-700 font-bold">{row.ሞት.toLocaleString()}</td>
                            <td className="py-3 px-3 text-right text-cyan-700 font-bold">{row.ጋብቻ.toLocaleString()}</td>
                            <td className="py-3 px-3 text-right text-amber-700 font-bold">{row.ፍቺ.toLocaleString()}</td>
                            <td className="py-3 px-3 text-right text-purple-700 font-bold">{row.ጉዲፈቻ.toLocaleString()}</td>
                            <td className="py-3 px-3 text-right font-black text-slate-900 text-sm bg-slate-50/50">
                              {row.ጠቅላላ.toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-emerald-800">
                              {row.onTimeRate}%
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-amber-800">
                              {row.lateRevenueETB.toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-cyan-800">
                              {share}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-mono font-bold text-slate-900 border-t-2 border-slate-300">
                        <td className="py-3 px-3 font-sans font-black">የበጀት ዓመቱ ጠቅላላ ድምር</td>
                        <td className="py-3 px-3 font-sans text-[11px] text-slate-600">ከሐምሌ 1 - ሰኔ 30</td>
                        <td className="py-3 px-3 text-right text-emerald-800">{quarterlyFiscalMetrics.birthsAll.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-rose-800">{quarterlyFiscalMetrics.deathsAll.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-cyan-800">{quarterlyFiscalMetrics.marriagesAll.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-amber-800">{quarterlyFiscalMetrics.divorcesAll.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-purple-800">{quarterlyFiscalMetrics.adoptionsAll.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-black text-emerald-900 text-sm bg-emerald-50">
                          {quarterlyFiscalMetrics.totalAll.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-emerald-800">
                          {quarterlyFiscalMetrics.onTimeRateAll}%
                        </td>
                        <td className="py-3 px-3 text-right font-black text-amber-800">
                          {quarterlyFiscalMetrics.lateRevenueAll.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-cyan-900">
                          100%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MAIN BAR CHART: MONTHLY REGISTRATION TRENDS ACROSS 10 ZONES */}
          {(chartsActiveSection === 'all' || chartsActiveSection === 'zones') && (
            <>
              <div className="rounded-2xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-cyan-600" />
                  <span>የማዕከላዊ ኢትዮጵያ 10ሩ ዞኖች የወሳኝ ኩነቶች ምዝገባ ንፅፅር (Bar Chart)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  ሀላባ፣ ሀዲያ፣ ጉራጌ፣ ምሥራቅ ጉራጌ፣ ስልጤ፣ ከምባታ፣ የም፣ ማረቆ፣ ጠምባሮ እና ቀቤና
                </p>
              </div>

              {/* Bar Chart Display Toggle */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                <button
                  onClick={() => setBarChartMode('byEvent')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    barChartMode === 'byEvent'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  በኩነቶች ዓይነት
                </button>
                <button
                  onClick={() => setBarChartMode('byCompliance')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    barChartMode === 'byCompliance'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  መደበኛ (0 ብር) / ዘግይቶ (500 ETB)
                </button>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={zoneBarChartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                  <XAxis 
                    dataKey="zoneName" 
                    stroke="#64748b" 
                    fontSize={11} 
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '15px', fontSize: '11px' }} 
                  />

                  {barChartMode === 'byEvent' ? (
                    <>
                      <Bar dataKey="ልደት" name="ልደት (Birth)" fill={EVENT_COLORS.birth} radius={[4, 4, 0, 0]} stackId="a" />
                      <Bar dataKey="ሞት" name="ሞት (Death)" fill={EVENT_COLORS.death} radius={[0, 0, 0, 0]} stackId="a" />
                      <Bar dataKey="ጋብቻ" name="ጋብቻ (Marriage)" fill={EVENT_COLORS.marriage} radius={[0, 0, 0, 0]} stackId="a" />
                      <Bar dataKey="ፍቺ" name="ፍቺ (Divorce)" fill={EVENT_COLORS.divorce} radius={[0, 0, 0, 0]} stackId="a" />
                      <Bar dataKey="ጉዲፈቻ" name="ጉዲፈቻ (Adoption)" fill={EVENT_COLORS.adoption} radius={[4, 4, 0, 0]} stackId="a" />
                    </>
                  ) : (
                    <>
                      <Bar dataKey="መደበኛ" name="ወቅታዊ (0 ብር - ነፃ)" fill={COMPLIANCE_COLORS.current} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="ዘግይቶ" name="የዘገየ (500 ETB)" fill={COMPLIANCE_COLORS.late} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="ነባር" name="ነባር (>1 ዓመት)" fill={COMPLIANCE_COLORS.backlog} radius={[4, 4, 0, 0]} />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TWO PIE CHARTS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PIE CHART 1: VITAL EVENT BREAKDOWN */}
            <div className="rounded-2xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-emerald-600" />
                  <span>የወሳኝ ኩነቶች ስርጭት በመቶኛ (Vital Events Distribution Pie Chart)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ልደት፣ ሞት፣ ጋብቻ፣ ፍቺ እና ጉዲፈቻ
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eventPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      innerRadius={45}
                      paddingAngle={3}
                    >
                      {eventPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Data list below chart */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-200 text-center font-mono">
                {eventPieData.map((item, idx) => (
                  <div key={idx} className="rounded-lg bg-slate-50 p-2 border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-600 block truncate font-sans font-medium">{item.name.split(' ')[0]}</span>
                    <span className="text-xs font-bold text-slate-900 block mt-0.5">{item.value.toLocaleString()}</span>
                    <span className="text-[10px] text-emerald-700 font-bold block">{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PIE CHART 2: ON-TIME VS LATE REGISTRATION COMPLIANCE */}
            <div className="rounded-2xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-amber-600" />
                  <span>የመደበኛ (ነፃ) እና የዘገዩ (500 ETB) ምዝገባዎች ምጣኔ (Compliance Pie Chart)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  በህጋዊ የጊዜ ገደብ መመዝገብ (0 ብር) ከዘገየ ምዝገባ (500 ETB) ንፅፅር
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={compliancePieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      innerRadius={45}
                      paddingAngle={4}
                    >
                      {compliancePieData.map((entry, index) => (
                        <Cell key={`cell-comp-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Data list below chart */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 font-mono">
                <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] text-emerald-800 block font-sans font-bold">መደበኛ (0 ብር - ነፃ)</span>
                    <span className="text-base font-bold text-slate-900">
                      {compliancePieData[0]?.value.toLocaleString() || 0}
                    </span>
                  </div>
                  <span className="text-lg font-extrabold text-emerald-700">
                    {compliancePieData[0]?.percent || 0}%
                  </span>
                </div>

                <div className="rounded-xl bg-amber-50 p-3 border border-amber-200 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] text-amber-800 block font-sans font-bold">የዘገየ (500 ETB)</span>
                    <span className="text-base font-bold text-slate-900">
                      {compliancePieData[1]?.value.toLocaleString() || 0}
                    </span>
                  </div>
                  <span className="text-lg font-extrabold text-amber-700">
                    {compliancePieData[1]?.percent || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

        {/* SECOND BAR CHART: MONTHLY TIMELINE TREND (ACROSS ETHIOPIAN MONTHS) */}
        {(chartsActiveSection === 'all' || chartsActiveSection === 'progression') && (
          <div className="rounded-2xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  <span>የወርሃዊ ምዝገባ አዝማሚያ በኢትዮጵያ ካላንደር (Monthly Registration Timeline)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  በ{selectedYear} ዓ.ም የወራቶች የምዝገባ አዝማሚያ (መስከረም፣ ጥቅምት፣ ኅዳር፣ ታኅሣሥ፣ ጥር፣ የካቲት...)
                </p>
              </div>

              <div className="text-xs text-slate-600 font-mono font-bold">
                {selectedZoneFilter === 'all' 
                  ? 'የ10ሩም ዞኖች ድምር' 
                  : CENTRAL_ETHIOPIA_ZONES.find(z => z.id === selectedZoneFilter)?.name}
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyTimelineData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                  <XAxis dataKey="monthName" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '11px' }} />
                  <Bar dataKey="ልደት" name="ልደት" fill={EVENT_COLORS.birth} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ሞት" name="ሞት" fill={EVENT_COLORS.death} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ጋብቻ" name="ጋብቻ" fill={EVENT_COLORS.marriage} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ፍቺ" name="ፍቺ" fill={EVENT_COLORS.divorce} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ጉዲፈቻ" name="ጉዲፈቻ" fill={EVENT_COLORS.adoption} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        </div>
      )}

      {/* TAB: SUPER ADMIN CONTENT MANAGEMENT SYSTEM (CMS) */}
      {activeTab === 'cms' && (
        <div className="space-y-6 animate-in fade-in">
          {/* CMS Master Banner */}
          <div className="rounded-2xl border border-amber-500/50 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 p-6 sm:p-8 space-y-4 shadow-xl shadow-amber-500/10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-950/80 px-3 py-1 text-xs font-bold text-amber-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>👑 የበላይ አስተዳዳሪ (Super Admin CMS) - የይዘት መቆጣጠሪያ ማዕከል</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  የፖርታሉ 6ቱም ሞጁሎች ይዘት፣ አዋጆችና መመሪያዎች ማስተካከያ
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                  የበላይ አስተዳዳሪ (Super Admin) የፖርታሉን ማንኛውንም ይዘት፣ አዋጆች፣ መመሪያዎች፣ ህጋዊ የጊዜ ገደቦችን፣ ክፍያዎችን፣ ዞኖችን እና አድራሻዎችን የማሻሻል ሙሉ ስልጣን አለው። የሚደረጉ ለውጦች ወዲያውኑ በፖርታሉ ላይ በሙሉ ይተገበራሉ።
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {onOpenContentEditor && (
                  <button
                    onClick={() => onOpenContentEditor('home')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>ሙሉውን CMS ኤዲተር ክፈት</span>
                  </button>
                )}

                {onResetContentToDefault && (
                  <button
                    onClick={() => {
                      if (window.confirm('እርግጠኛ ነዎት የሁሉንም ሞጁሎች ይዘት ወደ ነባሪው መመለስ ይፈልጋሉ?')) {
                        onResetContentToDefault();
                        onAddAuditLog('CMS_RESET_DEFAULT', 'የሁሉም ሞጁሎች ይዘት በበላይ አስተዳዳሪ ወደ ነባሪ ተመልሷል');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                    title="ሁሉንም ሞጁሎች ወደ መጀመሪያው ነባሪ መልስ"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                    <span>ወደ ነባሪ መልስ</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 6 Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Home Module */}
            <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-5 space-y-4 flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
                      <Home className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">1. ዋና ገጽ (Home)</h3>
                      <span className="text-[10px] text-slate-500">መግቢያ፣ ባጅ፣ ማስታወቂያ</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-emerald-700 border border-slate-200">
                    ነቃ
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50/90 p-3 rounded-xl border border-slate-200/80">
                  <div className="text-[11px] text-slate-500">ዋና ርዕስ፡</div>
                  <div className="font-semibold text-slate-900 truncate">
                    {siteContent?.home?.heroTitle || 'የወሳኝ ኩነቶች ምዝገባ እና ወርሃዊ ሪፖርት ማመንጫ ፖርታል'}
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1">የጥሪ መስመር፡</div>
                  <div className="font-mono text-emerald-700 font-bold">
                    {siteContent?.home?.emergencyHotline || '8420 (ነፃ)'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onOpenContentEditor?.('home')}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200 hover:border-amber-400 shadow-xs"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>ይህን ሞጁል አርትዕ (Edit Home)</span>
              </button>
            </div>

            {/* 2. Services Module */}
            <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-5 space-y-4 flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-cyan-100 border border-cyan-300 flex items-center justify-center text-cyan-700">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">2. አገልግሎቶች (Services)</h3>
                      <span className="text-[10px] text-slate-500">5ቱ ወሳኝ ኩነቶችና ክፍያዎች</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-100 text-cyan-800 border border-cyan-200">
                    5 ኩነቶች
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50/90 p-3 rounded-xl border border-slate-200/80">
                  <div className="flex justify-between">
                    <span>ልደት (Birth):</span>
                    <strong className="text-emerald-700">90 ቀናት (0 ETB)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>ሞት (Death):</span>
                    <strong className="text-emerald-700">30 ቀናት (0 ETB)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>ጋብቻ (Marriage):</span>
                    <strong className="text-emerald-700">30 ቀናት (0 ETB)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>ፍቺና ጉዲፈቻ:</span>
                    <strong className="text-emerald-700">60 & 90 ቀናት</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-amber-800 font-bold">የዘገየ ቅጣት፡</span>
                    <strong className="text-amber-700 font-mono">500 ETB</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onOpenContentEditor?.('services')}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200 hover:border-amber-400 shadow-xs"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>ይህን ሞጁል አርትዕ (Edit Services)</span>
              </button>
            </div>

            {/* 3. About Module */}
            <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-5 space-y-4 flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700">
                      <Info className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">3. ስለ እኛ (About)</h3>
                      <span className="text-[10px] text-slate-500">ራዕይ፣ ተልዕኮ፣ አመራሮች</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-100 text-purple-800 border border-purple-200">
                    ተቋማዊ
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50/90 p-3 rounded-xl border border-slate-200/80">
                  <div>የኤጀንሲ አመራር አባላት፡ <strong className="text-slate-900">{siteContent?.about?.leaders?.length || 4} ኃላፊዎች</strong></div>
                  <div>የልማት ምዕራፎች፡ <strong className="text-slate-900">{siteContent?.about?.milestones?.length || 4} ምዕራፎች</strong></div>
                  <div className="text-[11px] text-slate-500 truncate pt-1">
                    ተልዕኮ፡ {siteContent?.about?.mission || 'በማዕከላዊ ኢትዮጵያ ክልል...'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onOpenContentEditor?.('about')}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200 hover:border-amber-400 shadow-xs"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>ይህን ሞጁል አርትዕ (Edit About)</span>
              </button>
            </div>

            {/* 4. Resources Module */}
            <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-5 space-y-4 flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-700">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">4. ሰነዶችና አዋጆች (Resources)</h3>
                      <span className="text-[10px] text-slate-500">አዋጆች፣ መመሪያዎች፣ FAQs</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-100 text-blue-800 border border-blue-200">
                    ህጎች
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50/90 p-3 rounded-xl border border-slate-200/80">
                  <div className="flex justify-between">
                    <span>ህጋዊ ሰነዶችና አዋጆች፡</span>
                    <strong className="text-slate-900 font-mono">{siteContent?.resources?.documents?.length || 4} ሰነዶች</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>ተደጋጋሚ ጥያቄዎች (FAQs)፡</span>
                    <strong className="text-slate-900 font-mono">{siteContent?.resources?.faqs?.length || 4} ጥያቄዎች</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>ሰነድ ጫን (Upload)</span>
                </button>
                <button
                  onClick={() => onOpenContentEditor?.('resources')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200 hover:border-amber-400 shadow-xs"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>አርትዕ (CMS)</span>
                </button>
              </div>
            </div>

            {/* 5. Contact Module */}
            <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-5 space-y-4 flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-teal-100 border border-teal-300 flex items-center justify-center text-teal-700">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">5. አድራሻና ቅርንጫፎች (Contact)</h3>
                      <span className="text-[10px] text-slate-500">ስልክ፣ ኢሜይል፣ የ10ሩ ዞኖች ቢሮ</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-100 text-teal-800 border border-teal-200">
                    10 ዞኖች
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50/90 p-3 rounded-xl border border-slate-200/80">
                  <div className="truncate">ዋና ቢሮ፡ <strong className="text-slate-900">{siteContent?.contact?.hqName || 'ማዕከላዊ ኢትዮጵያ ሆሳዕና'}</strong></div>
                  <div>የስልክ መስመር፡ <strong className="text-emerald-700 font-mono font-bold">{siteContent?.contact?.emergencyHotline || '8891 (ነፃ)'}</strong></div>
                  <div>የዞን ቅርንጫፎች፡ <strong className="text-slate-900 font-mono">{siteContent?.contact?.regionalOffices?.length || 10} ቢሮዎች</strong></div>
                </div>
              </div>

              <button
                onClick={() => onOpenContentEditor?.('contact')}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200 hover:border-amber-400 shadow-xs"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>ይህን ሞጁል አርትዕ (Edit Contact)</span>
              </button>
            </div>

            {/* 6. Zones & Fees Module */}
            <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-5 space-y-4 flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
                      <Settings className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">6. ዞኖችና ተመን (Zones & Fees)</h3>
                      <span className="text-[10px] text-slate-500">የ10ሩ ዞኖች ውቅርና ቅጣት</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-100 text-amber-800 border border-amber-200">
                    ደህንነት
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50/90 p-3 rounded-xl border border-slate-200/80">
                  <div className="flex justify-between">
                    <span>የዘገየ ምዝገባ ቅጣት፡</span>
                    <strong className="text-amber-700 font-mono font-bold">{siteContent?.zonesFees?.latePenaltyFeeETB || 500} ETB</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>የተመዘገቡ ዞኖች ብዛት፡</span>
                    <strong className="text-slate-900 font-mono">{siteContent?.zonesFees?.zones?.length || 10} ዞኖች</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate pt-1">
                    (ሀላባ፣ ሀዲያ፣ ጉራጌ፣ ስልጤ፣ ከምባታ፣ የም፣ ማረቆ...)
                  </div>
                </div>
              </div>

              <button
                onClick={() => onOpenContentEditor?.('zonesFees')}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200 hover:border-amber-400 shadow-xs"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>ይህን ሞጁል አርትዕ (Edit Zones & Fees)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: DOCUMENT UPLOAD & MANAGEMENT (SUPER ADMIN) */}
      {activeTab === 'documents' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Banner & Stats */}
          <div className="rounded-2xl border border-amber-400/90 bg-gradient-to-r from-amber-50 via-yellow-50 to-white p-6 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/25 shrink-0">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                      የሰነዶች መጫኛና ማስተዳደሪያ ማዕከል (Document Upload Center)
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900 border border-amber-300">
                      👑 Super Admin
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                    ከኮምፒውተርዎ ፒዲኤፍ (PDF)፣ ዎርድ (DOCX)፣ ኤክሴል (XLSX) ወይም ሌሎች ሰነዶችን ወደ ድረ-ገጹ በመጫን በህዝብ ሰነዶች (Resources) ክፍል ለዜጎች፣ ለወረዳዎችና ለ10ሩም ዞኖች ይፋ ያድርጉ።
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-black transition-all shadow-md shadow-emerald-700/25 cursor-pointer"
                >
                  <FileUp className="h-4 w-4" />
                  <span>ሰነድ ከኮምፒውተር ጫን (Upload Document)</span>
                </button>
              </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="rounded-xl bg-white p-4 border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">ጠቅላላ በድረ-ገጹ ላይ ያሉ ሰነዶች</span>
                  <span className="text-lg font-extrabold text-slate-900 font-mono mt-0.5 block">
                    {siteContent?.resources?.documents?.length || 4}
                  </span>
                </div>
                <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
                  <FileText className="h-4 w-4" />
                </div>
              </div>

              <div className="rounded-xl bg-white p-4 border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">ከኮምፒውተር የተጫኑ ሰነዶች</span>
                  <span className="text-lg font-extrabold text-amber-700 font-mono mt-0.5 block">
                    {(siteContent?.resources?.documents || []).filter(d => d.isCustomUploaded || d.uploadedBy).length}
                  </span>
                </div>
                <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold">
                  <UploadCloud className="h-4 w-4" />
                </div>
              </div>

              <div className="rounded-xl bg-white p-4 border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">የስርዓቱ ነባሪ አዋጆችና መመሪያዎች</span>
                  <span className="text-lg font-extrabold text-emerald-800 font-mono mt-0.5 block">
                    {(siteContent?.resources?.documents || []).filter(d => !d.isCustomUploaded && !d.uploadedBy).length}
                  </span>
                </div>
                <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
                  <BookOpen className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Direct Dropzone Card */}
          <div
            onClick={() => setIsUploadModalOpen(true)}
            className="rounded-2xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-white hover:bg-amber-50/30 p-6 text-center cursor-pointer transition-all shadow-xs group"
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 group-hover:bg-amber-200 text-amber-800 border border-amber-300 flex items-center justify-center shadow-xs transition-colors">
                <UploadCloud className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                አዲስ ሰነድ ከኮምፒውተርዎ ለመጫን እዚህ ጠቅ ያድርጉ
              </h3>
              <p className="text-xs text-slate-500 max-w-md">
                PDF፣ Microsoft Word (.docx)፣ Excel (.xlsx)፣ PowerPoint (.pptx)፣ እና ምስሎችን በቀጥታ ወደ ድረ-ገጹ ይጫኑ።
              </p>
            </div>
          </div>

          {/* Search, Filter & Documents List */}
          <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  የተመዘገቡ ሰነዶች ዝርዝር
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-100 text-slate-700 border border-slate-200">
                  {(siteContent?.resources?.documents || []).length} ሰነዶች
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="በርዕስ ወይም በመግለጫ ፈልግ..."
                    value={docSearchQuery}
                    onChange={(e) => setDocSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none shadow-xs"
                  />
                </div>

                <select
                  value={docCategoryFilter}
                  onChange={(e) => setDocCategoryFilter(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-none shadow-xs cursor-pointer"
                >
                  <option value="all">ሁሉም ምድቦች</option>
                  <option value="ህጋዊ አዋጅ">ህጋዊ አዋጅ</option>
                  <option value="የክልሉ መመሪያ">የክልሉ መመሪያ</option>
                  <option value="የጤና ዘርፍ መመሪያ">የጤና ዘርፍ መመሪያ</option>
                  <option value="የህዝብ ቅጽ">የህዝብ ቅጽ</option>
                  <option value="ወርሃዊ ሪፖርት">ወርሃዊ ሪፖርት</option>
                  <option value="የዳሰሳ ጥናት">የዳሰሳ ጥናት</option>
                </select>
              </div>
            </div>

            {/* Document Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider bg-slate-50/60">
                    <th className="py-3 px-3">የሰነዱ ርዕስና መግለጫ</th>
                    <th className="py-3 px-3">ምድብ</th>
                    <th className="py-3 px-3">መጠን / ዓይነት</th>
                    <th className="py-3 px-3">የወጣበት ዓ.ም</th>
                    <th className="py-3 px-3">የተጫነበት ሁኔታ</th>
                    <th className="py-3 px-3 text-right">ተግባራት</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80">
                  {(siteContent?.resources?.documents || [])
                    .filter(doc => {
                      const q = docSearchQuery.toLowerCase().trim();
                      const matchesQ = !q || doc.title.toLowerCase().includes(q) || doc.description.toLowerCase().includes(q) || doc.category.toLowerCase().includes(q);
                      const matchesCat = docCategoryFilter === 'all' || doc.category.includes(docCategoryFilter);
                      return matchesQ && matchesCat;
                    })
                    .map((doc, idx) => (
                      <tr key={doc.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 max-w-xs">
                          <div className="font-bold text-slate-900 leading-snug">{doc.title}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{doc.description}</div>
                          {doc.fileName && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">ፋይል፡ {doc.fileName}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            {doc.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {doc.fileSize}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {doc.date}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {doc.isCustomUploaded || doc.uploadedBy ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                              በበላይ አስተዳዳሪ የተጫነ
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              የስርዓቱ ነባሪ
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setPreviewDoc(doc)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200 flex items-center gap-1 shadow-xs"
                              title="ሰነዱን እይ"
                            >
                              <Eye className="h-3 w-3 text-slate-600" />
                              <span>እይ</span>
                            </button>

                            <button
                              onClick={() => triggerDocumentDownload(doc.title, doc.category, doc.date, doc.description, doc.fileData, doc.fileName, doc.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors cursor-pointer border border-emerald-200 flex items-center gap-1 shadow-xs"
                              title="ሰነዱን አውርድ"
                            >
                              <Download className="h-3 w-3 text-emerald-700" />
                              <span>አውርድ</span>
                            </button>

                            {onDeleteDocument && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`እርግጠኛ ነዎት "${doc.title}" የተሰኘውን ሰነድ ከድረ-ገጹ ማጥፋት ይፈልጋሉ?`)) {
                                    onDeleteDocument(doc.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="ሰነዱን ሰርዝ"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SUBMISSIONS MATRIX & REVIEW */}
      {activeTab === 'submissions' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header & View Switcher */}
          <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-800 mb-1.5 shadow-xs">
                  <Send className="h-3.5 w-3.5 text-cyan-600" />
                  <span>የዞኖች ወርሃዊ ሪፖርት መቀበያና ማረጋገጫ ማዕከል</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  የማዕከላዊ ኢትዮጵያ 10ሩ ዞኖች ሪፖርቶች መዝገብና ማረጋገጫ
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  የክልሉ ዋና አስተዳዳሪ ከ10ሩም ዞኖች (ሀላባ፣ ሀዲያ፣ ጉራጌ፣ ምሥራቅ ጉራጌ፣ ስልጤ፣ ከምባታ፣ የም፣ ማረቆ፣ ጠምባሮ እና ቀቤና) የቀረቡ ወርሃዊ የወሳኝ ኩነቶች ሪፖርቶችን በዞን፣ በሁኔታ፣ ወይም በቀን/ወር ገደብ በፍጥነት ፈልጎ መገምገም እና ማጽደቅ ይችላል።
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {/* View Mode Toggle */}
                <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                  <button
                    onClick={() => setSubmissionViewMode('all_records')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      submissionViewMode === 'all_records'
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>የሪፖርቶች መዝገብ ({filteredSubmissions.length})</span>
                  </button>
                  <button
                    onClick={() => setSubmissionViewMode('period_matrix')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      submissionViewMode === 'period_matrix'
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Building className="h-3.5 w-3.5" />
                    <span>የወቅቱ ዞኖች ማትሪክስ</span>
                  </button>
                </div>

                <button
                  onClick={() => setActiveTab('charts')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-50 border border-cyan-300 text-cyan-800 text-xs font-bold hover:bg-cyan-100 cursor-pointer shadow-xs"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>ግራፎች</span>
                </button>
              </div>
            </div>

            {/* SEARCH BAR & ZONE-BASED FILTERING CONSOLE */}
            <div className="space-y-3.5 pt-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
                {/* 1. Search Bar */}
                <div className="lg:col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Search className="h-3.5 w-3.5 text-cyan-700" />
                    <span>የፍለጋ አሞሌ (Search Bar)</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={submissionSearchQuery}
                      onChange={(e) => setSubmissionSearchQuery(e.target.value)}
                      placeholder="በዞን ስም፣ በኃላፊ ስም፣ በመለያ ቁጥር (ID) ወይም በማስታወሻ ፈልግ..."
                      className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-xs transition-all font-sans"
                    />
                    {submissionSearchQuery && (
                      <button
                        onClick={() => setSubmissionSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="ፍለጋውን አጽዳ"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Zone-based Filtering Dropdown */}
                <div className="lg:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-cyan-700" />
                    <span>የዞን ማጣሪያ (Zone Filter)</span>
                  </label>
                  <select
                    value={submissionZoneFilter}
                    onChange={(e) => setSubmissionZoneFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-xs cursor-pointer"
                  >
                    <option value="all">🏢 ሁሉም 10ሩ ዞኖች (All 10 Zones)</option>
                    {CENTRAL_ETHIOPIA_ZONES.map(z => (
                      <option key={z.id} value={z.id}>
                        {z.name} ({z.capital})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Status Filtering Dropdown */}
                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                    <span>የሪፖርት ሁኔታ (Status)</span>
                  </label>
                  <select
                    value={submissionStatusFilter}
                    onChange={(e) => setSubmissionStatusFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-xs cursor-pointer"
                  >
                    <option value="all">📋 ሁሉም ሁኔታዎች (All Statuses)</option>
                    <option value="የፀደቀ">✓ የፀደቁ ሪፖርቶች (Approved)</option>
                    <option value="የተረጋገጠ">⏳ የተረጋገጡ (Verified)</option>
                    <option value="በመገምገም ላይ">🔍 በመገምገም ላይ (Under Review)</option>
                  </select>
                </div>

                {/* 4. Date Range Filtering Dropdown */}
                <div className="lg:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <CalendarRange className="h-3.5 w-3.5 text-amber-700" />
                    <span>የቀንና የወር ገደብ (Date Range)</span>
                  </label>
                  <select
                    value={submissionDateRange}
                    onChange={(e) => setSubmissionDateRange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-xs cursor-pointer font-sans"
                  >
                    <option value="all">📅 ሁሉም ጊዜ (All Time - ሙሉ ታሪክ)</option>
                    <option value="fiscal_2018_2019">🏛️ የ2018/2019 በጀት ዓመት (ከሐምሌ 1/2018 - ሰኔ 30/2019 ዓ.ም)</option>
                    <option value="fiscal_q1">1️⃣ 1ኛ ሩብ ዓመት (ከሐምሌ 1 እስከ መስከረም 30)</option>
                    <option value="fiscal_q2">2️⃣ 2ኛ ሩብ ዓመት (ከጥቅምት 1 እስከ ታኅሣሥ 30)</option>
                    <option value="fiscal_q3">3️⃣ 3ኛ ሩብ ዓመት (ከጥር 1 እስከ መጋቢት 30)</option>
                    <option value="fiscal_q4">4️⃣ 4ኛ ሩብ ዓመት (ከሚያዝያ 1 እስከ ሰኔ 30)</option>
                    <option value="current_month">📌 የአሁኑ ወር (መስከረም 2019 ዓ.ም)</option>
                    <option value="2019">📆 2019 ዓ.ም (የአሁኑ ዓመት ሙሉ)</option>
                    <option value="2018">📆 2018 ዓ.ም (ያለፈው ዓመት ሙሉ)</option>
                    <option value="last_3_months">⏱️ የመጨረሻዎቹ 3 ወራት (Last 3 Months)</option>
                    <option value="last_6_months">⏱️ የመጨረሻዎቹ 6 ወራት (Last 6 Months)</option>
                    <option value="custom">⚙️ ብጁ ዓመትና ወር (Custom Period)</option>
                  </select>
                </div>
              </div>

              {/* Conditional Row for Custom Date Range & Quick Preset Badges */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
                {/* If Custom Date Range is selected, show Year and Month pickers */}
                {submissionDateRange === 'custom' ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                      <span className="font-semibold text-slate-600 text-[11px]">ብጁ ዓመት፡</span>
                      <select
                        value={customYear}
                        onChange={(e) => setCustomYear(Number(e.target.value))}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none font-mono"
                      >
                        <option value={2019}>2019 ዓ.ም</option>
                        <option value={2018}>2018 ዓ.ም</option>
                        <option value={2017}>2017 ዓ.ም</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                      <span className="font-semibold text-slate-600 text-[11px]">የወር ምርጫ፡</span>
                      <select
                        value={customMonth}
                        onChange={(e) => setCustomMonth(Number(e.target.value))}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none"
                      >
                        <option value={0}>ሁሉም ወራት (ዓመታዊ)</option>
                        {ETHIOPIAN_MONTHS.map((m, idx) => (
                          <option key={idx} value={idx + 1}>{m} ወር ({idx + 1})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  /* Quick Preset Chips */
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
                      <SlidersHorizontal className="h-3 w-3" />
                      <span>ፈጣን አቋራጭ፡</span>
                    </span>
                    <button
                      onClick={handleResetSubmissionFilters}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        !isAnySubmissionFilterActive
                          ? 'bg-slate-800 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      ሁሉም ({submissions.length})
                    </button>
                    <button
                      onClick={() => {
                        setSubmissionDateRange('fiscal_2018_2019');
                        setSubmissionStatusFilter('all');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        submissionDateRange === 'fiscal_2018_2019'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      የ2018/2019 በጀት ዓመት
                    </button>
                    <button
                      onClick={() => {
                        setSubmissionDateRange('fiscal_q1');
                        setSubmissionStatusFilter('all');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        submissionDateRange === 'fiscal_q1'
                          ? 'bg-cyan-700 text-white shadow-xs'
                          : 'bg-cyan-50 text-cyan-800 border border-cyan-200 hover:bg-cyan-100'
                      }`}
                    >
                      1ኛ ሩብ ዓመት (ሐምሌ-መስከረም)
                    </button>
                    <button
                      onClick={() => setSubmissionStatusFilter('የተረጋገጠ')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        submissionStatusFilter === 'የተረጋገጠ'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      ያልፀደቁ ብቻ (ማረጋገጫ የሚሹ)
                    </button>
                    <button
                      onClick={() => setSubmissionStatusFilter('የፀደቀ')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        submissionStatusFilter === 'የፀደቀ'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      የፀደቁ ብቻ
                    </button>
                  </div>
                )}

                {/* Right side controls: Sorting & Clear Filters Button */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700">
                    <span className="font-semibold text-slate-500 text-[11px]">ቅደም ተከተል፡</span>
                    <select
                      value={submissionSortBy}
                      onChange={(e) => setSubmissionSortBy(e.target.value as any)}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none cursor-pointer"
                    >
                      <option value="newest">አዲስ ወደ ኋላ (Newest First)</option>
                      <option value="oldest">የቆየ ወደ ፊት (Oldest First)</option>
                      <option value="zone">በዞን ስም (Zone Name A-Z)</option>
                      <option value="most_events">በከፍተኛ ኩነቶች (Most Events)</option>
                      <option value="most_late">በከፍተኛ ቅጣት (Highest Late Fee)</option>
                    </select>
                  </div>

                  {isAnySubmissionFilterActive && (
                    <button
                      onClick={handleResetSubmissionFilters}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-[11px] font-bold transition-colors cursor-pointer"
                      title="ሁሉንም ማጣሪያዎች ወደ ነባሪ መልስ"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>ማጣሪያዎችን አጽዳ</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Active Filter Badges */}
              {isAnySubmissionFilterActive && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                  <span className="text-[11px] font-semibold text-slate-500">ተግባራዊ ማጣሪያዎች፡</span>
                  {submissionSearchQuery && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-cyan-100 text-cyan-900 font-mono text-[11px]">
                      ፍለጋ: "{submissionSearchQuery}"
                      <X className="h-3 w-3 cursor-pointer hover:text-cyan-700" onClick={() => setSubmissionSearchQuery('')} />
                    </span>
                  )}
                  {submissionZoneFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-cyan-100 text-cyan-900 text-[11px]">
                      ዞን: {CENTRAL_ETHIOPIA_ZONES.find(z => z.id === submissionZoneFilter)?.name}
                      <X className="h-3 w-3 cursor-pointer hover:text-cyan-700" onClick={() => setSubmissionZoneFilter('all')} />
                    </span>
                  )}
                  {submissionStatusFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[11px]">
                      ሁኔታ: {submissionStatusFilter}
                      <X className="h-3 w-3 cursor-pointer hover:text-emerald-700" onClick={() => setSubmissionStatusFilter('all')} />
                    </span>
                  )}
                  {submissionDateRange !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[11px]">
                      ወቅት: {
                        submissionDateRange === 'fiscal_2018_2019' 
                          ? 'የ2018/2019 በጀት ዓመት'
                          : submissionDateRange === 'fiscal_q1'
                          ? '1ኛ ሩብ ዓመት (ሐምሌ-መስከረም)'
                          : submissionDateRange === 'fiscal_q2'
                          ? '2ኛ ሩብ ዓመት (ጥቅምት-ታኅሣሥ)'
                          : submissionDateRange === 'fiscal_q3'
                          ? '3ኛ ሩብ ዓመት (ጥር-መጋቢት)'
                          : submissionDateRange === 'fiscal_q4'
                          ? '4ኛ ሩብ ዓመት (ሚያዝያ-ሰኔ)'
                          : submissionDateRange === 'current_month' 
                          ? 'መስከረም 2019' 
                          : submissionDateRange === '2019' 
                          ? '2019 ዓ.ም' 
                          : submissionDateRange === '2018' 
                          ? '2018 ዓ.ም' 
                          : submissionDateRange
                      }
                      <X className="h-3 w-3 cursor-pointer hover:text-amber-700" onClick={() => setSubmissionDateRange('all')} />
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* FILTERED METRICS RIBBON (Quick KPIs) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-4 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">የተገኙ ሪፖርቶች ብዛት</span>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {filteredMetrics.totalSubmissions} <span className="text-xs text-slate-500 font-sans font-medium">ከ {submissions.length}</span>
              </div>
              <p className="text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
                <span className="text-emerald-700 font-bold">{filteredMetrics.approvedCount} የፀደቁ</span>
                <span>•</span>
                <span className="text-amber-700 font-bold">{filteredMetrics.verifiedCount + filteredMetrics.underReviewCount} በመጠባበቅ ላይ</span>
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-4 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">የተመዘገቡ ጠቅላላ ኩነቶች</span>
              <div className="text-2xl font-black text-cyan-700 font-mono">
                {filteredMetrics.totalEvents.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500">
                በተመረጡት ሪፖርቶች ውስጥ የተካተቱ ወሳኝ ኩነቶች
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 backdrop-blur-md p-4 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">የመደበኛ (ነፃ 0 ብር) ምጣኔ</span>
              <div className="text-2xl font-black text-emerald-700 font-mono">
                {filteredMetrics.onTimeRate}%
              </div>
              <p className="text-[11px] text-emerald-800 font-medium font-mono">
                {filteredMetrics.totalOnTime.toLocaleString()} ኩነቶች በህጋዊ ጊዜ
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 backdrop-blur-md p-4 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">የዘገዩ ምዝገባ ቅጣት ገቢ</span>
              <div className="text-2xl font-black text-amber-700 font-mono">
                {filteredMetrics.lateRevenueETB.toLocaleString()} <span className="text-xs text-amber-800 font-sans font-bold">ETB</span>
              </div>
              <p className="text-[11px] text-amber-800 font-medium font-mono">
                {filteredMetrics.totalLate.toLocaleString()} የዘገዩ (በ500 ETB)
              </p>
            </div>
          </div>

          {/* VIEW MODE 1: ALL SUBMISSIONS REGISTRY (SEARCH & FILTER RESULTS TABLE) */}
          {submissionViewMode === 'all_records' && (
            <div className="rounded-xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-cyan-700" />
                  <h3 className="text-sm font-bold text-slate-900">
                    የሪፖርቶች መዝገብ ዝርዝር ({filteredSubmissions.length} የተገኙ ሪፖርቶች)
                  </h3>
                </div>

                <div className="text-xs text-slate-500 font-mono">
                  {filteredSubmissions.length > 0 ? `1 - ${filteredSubmissions.length} ከ ${filteredSubmissions.length}` : 'ምንም አልተገኘም'}
                </div>
              </div>

              {filteredSubmissions.length === 0 ? (
                /* EMPTY STATE */
                <div className="py-12 px-4 text-center rounded-xl bg-slate-50/80 border border-dashed border-slate-300 space-y-3">
                  <div className="h-12 w-12 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                    <Filter className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">
                    ከተመረጡት ማጣሪያዎች ጋር የሚስማማ ሪፖርት አልተገኘም
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    የተጠቀሙበት የፍለጋ ቃል ወይም የመረጡት ዞን፣ ሁኔታ ወይም የቀን ገደብ ውጤት አላስገኘም። እባክዎ ማጣሪያዎችን ያጽዱ ወይም ሌላ ቃል ይፈልጉ።
                  </p>
                  <button
                    onClick={handleResetSubmissionFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>ሁሉንም ማጣሪያዎች አጽዳ (Reset Filters)</span>
                  </button>
                </div>
              ) : (
                /* RESULTS TABLE */
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono bg-slate-50/70">
                        <th className="py-2.5 px-3">መለያ (ID)ና ወቅት</th>
                        <th className="py-2.5 px-3">ዞን / ልዩ ወረዳ</th>
                        <th className="py-2.5 px-3">ያቀረበው ኃላፊና ቀን</th>
                        <th className="py-2.5 px-3 text-center">ሽፋን</th>
                        <th className="py-2.5 px-3 text-right">ልደት (ወቅታዊ/ዘግይቶ/ነባር)</th>
                        <th className="py-2.5 px-3 text-right">ሞት (ወቅታዊ/ዘግይቶ/ነባር)</th>
                        <th className="py-2.5 px-3 text-right">ጋብቻ (ወቅታዊ/ዘግይቶ/ነባር)</th>
                        <th className="py-2.5 px-3 text-right">ፍቺ/ጉዲፈቻ</th>
                        <th className="py-2.5 px-3 text-right">ጠቅላላ ኩነቶች</th>
                        <th className="py-2.5 px-3 text-right">የዘገየ ቅጣት</th>
                        <th className="py-2.5 px-3 text-center">ሁኔታ</th>
                        <th className="py-2.5 px-3 text-center">እርምጃዎች</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80 font-mono">
                      {filteredSubmissions.map((sub, idx) => {
                        const curTot = sub.birth.current + sub.death.current + sub.marriage.current + sub.divorce.current + sub.adoption.current;
                        const lateTot = sub.birth.late + sub.death.late + sub.marriage.late + sub.divorce.late + sub.adoption.late;
                        const backlogTot = (sub.birth.backlog || 0) + (sub.death.backlog || 0) + (sub.marriage.backlog || 0) + (sub.divorce.backlog || 0) + (sub.adoption.backlog || 0);
                        const grandTotal = curTot + lateTot + backlogTot;
                        const latePenaltyETB = lateTot * 500;
                        const isApproved = sub.status === 'የፀደቀ';
                        const zoneObj = CENTRAL_ETHIOPIA_ZONES.find(z => z.id === sub.zoneId);

                        return (
                          <tr key={`${sub.id}-${idx}`} className="hover:bg-cyan-50/40 transition-colors">
                            {/* ID & Period */}
                            <td className="py-3 px-3">
                              <span className="font-bold text-cyan-800 block text-[11px]">{sub.id}</span>
                              <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
                                {sub.monthNameAm} {sub.year} ዓ.ም
                              </span>
                            </td>

                            {/* Zone */}
                            <td className="py-3 px-3">
                              <span className="font-sans font-bold text-slate-900 block">{sub.zoneName}</span>
                              <span className="text-[10px] text-slate-500 font-sans block">
                                {zoneObj ? zoneObj.capital : ''}
                              </span>
                            </td>

                            {/* Submitted By */}
                            <td className="py-3 px-3 font-sans">
                              <span className="text-slate-800 font-medium block truncate max-w-[150px]" title={sub.submittedBy}>
                                {sub.submittedBy.split('(')[0].trim()}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                                {sub.submittedAt}
                              </span>
                            </td>

                            {/* Coverage */}
                            <td className="py-3 px-3 text-center font-sans">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-bold border border-slate-200">
                                {sub.reportingWoredasCount} ወረዳ / {sub.reportingKebelesCount} ቀበሌ
                              </span>
                            </td>

                            {/* Birth */}
                            <td className="py-3 px-3 text-right">
                              <span className="text-emerald-700 font-bold">{sub.birth.current.toLocaleString()}</span> / <span className="text-amber-700">{sub.birth.late.toLocaleString()}</span> / <span className="text-purple-700">{(sub.birth.backlog || 0).toLocaleString()}</span>
                            </td>

                            {/* Death */}
                            <td className="py-3 px-3 text-right">
                              <span className="text-emerald-700 font-bold">{sub.death.current.toLocaleString()}</span> / <span className="text-amber-700">{sub.death.late.toLocaleString()}</span> / <span className="text-purple-700">{(sub.death.backlog || 0).toLocaleString()}</span>
                            </td>

                            {/* Marriage */}
                            <td className="py-3 px-3 text-right">
                              <span className="text-emerald-700 font-bold">{sub.marriage.current.toLocaleString()}</span> / <span className="text-amber-700">{sub.marriage.late.toLocaleString()}</span> / <span className="text-purple-700">{(sub.marriage.backlog || 0).toLocaleString()}</span>
                            </td>

                            {/* Divorce & Adoption */}
                            <td className="py-3 px-3 text-right text-slate-700">
                              {(sub.divorce.current + sub.adoption.current + sub.divorce.late + sub.adoption.late + (sub.divorce.backlog || 0) + (sub.adoption.backlog || 0)).toLocaleString()}
                            </td>

                            {/* Grand Total */}
                            <td className="py-3 px-3 text-right text-slate-900 font-bold">
                              {grandTotal.toLocaleString()}
                            </td>

                            {/* Late Penalty ETB */}
                            <td className="py-3 px-3 text-right font-bold text-amber-700">
                              {latePenaltyETB > 0 ? `${latePenaltyETB.toLocaleString()} ETB` : '0 ETB'}
                            </td>

                            {/* Status */}
                            <td className="py-3 px-3 text-center font-sans">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${
                                isApproved 
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                  : sub.status === 'የተረጋገጠ'
                                    ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                                    : 'bg-amber-100 text-amber-800 border-amber-300'
                              }`}>
                                {sub.status}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-3 text-center font-sans">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setSelectedSubmissionModal(sub)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-cyan-100 text-slate-700 hover:text-cyan-800 transition-colors cursor-pointer"
                                  title="ሙሉውን የሪፖርት ዝርዝር እይ (View Dossier)"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>

                                {!isApproved ? (
                                  <button
                                    onClick={() => {
                                      onApproveSubmission(sub.id);
                                      onAddAuditLog('SUBMISSION_APPROVED', `የ${sub.zoneName} የ${sub.monthNameAm} ${sub.year} ዓ.ም ሪፖርት ፀደቀ (${sub.id})`);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer shadow-xs transition-colors flex items-center gap-1"
                                    title="ይህን ሪፖርት አጽድቅ"
                                  >
                                    <Check className="h-3 w-3" />
                                    <span>አጽድቅ</span>
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-emerald-700 font-bold px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                                    ✓ ፀድቋል
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE 2: CURRENT PERIOD ZONE CHECKLIST MATRIX */}
          {submissionViewMode === 'period_matrix' && (
            <div className="rounded-xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-6 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    የ{selectedMonth === 0 ? 'ዓመታዊ' : ETHIOPIAN_MONTHS[selectedMonth - 1]} {selectedYear} ዓ.ም የ10ሩም ዞኖች ማረጋገጫ ማትሪክስ
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    በዚህ ወቅት ሪፖርት ያቀረቡ እና ያልገቡ ዞኖች ማነፃፀሪያ (Submitted vs Pending Checklist)
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                    ያቀረቡ፡ {submittedCount} ዞኖች
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold border border-amber-200">
                    ያልገቡ፡ {pendingCount} ዞኖች
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono bg-slate-50/50">
                      <th className="py-2.5 px-3">ዞን / ልዩ ወረዳ</th>
                      <th className="py-2.5 px-3">ያቀረበው ኃላፊ</th>
                      <th className="py-2.5 px-3 text-right">ልደት (ወቅታዊ/ዘግይቶ/ነባር)</th>
                      <th className="py-2.5 px-3 text-right">ሞት (ወቅታዊ/ዘግይቶ/ነባር)</th>
                      <th className="py-2.5 px-3 text-right">ጋብቻ (ወቅታዊ/ዘግይቶ/ነባር)</th>
                      <th className="py-2.5 px-3 text-right">ፍቺ/ጉዲፈቻ</th>
                      <th className="py-2.5 px-3 text-right">አጠቃላይ ድምር</th>
                      <th className="py-2.5 px-3">ሁኔታ</th>
                      <th className="py-2.5 px-3">እርምጃ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 font-mono">
                    {zoneSubmissionMatrix.map(({ zone, submission, hasSubmitted }) => {
                      if (!hasSubmitted || !submission) {
                        return (
                          <tr key={zone.id} className="bg-slate-50/50">
                            <td className="py-3 px-3 font-sans font-bold text-slate-900">{zone.name}</td>
                            <td className="py-3 px-3 font-sans text-slate-500">{zone.officerName}</td>
                            <td colSpan={5} className="py-3 px-3 text-center text-slate-500 font-sans">
                              የዚህ ወቅት ሪፖርት እስካሁን አልገባም
                            </td>
                            <td className="py-3 px-3 font-sans">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                በመጠባበቅ ላይ
                              </span>
                            </td>
                            <td className="py-3 px-3 font-sans">
                              <button
                                onClick={handleSendZoneDigest}
                                className="text-[11px] text-cyan-700 hover:text-cyan-800 font-bold cursor-pointer"
                              >
                                ማሳሰቢያ ላክ
                              </button>
                            </td>
                          </tr>
                        );
                      }

                      const curTot = submission.birth.current + submission.death.current + submission.marriage.current + submission.divorce.current + submission.adoption.current;
                      const lateTot = submission.birth.late + submission.death.late + submission.marriage.late + submission.divorce.late + submission.adoption.late;
                      const backlogTot = (submission.birth.backlog || 0) + (submission.death.backlog || 0) + (submission.marriage.backlog || 0) + (submission.divorce.backlog || 0) + (submission.adoption.backlog || 0);
                      const isApproved = submission.status === 'የፀደቀ';

                      return (
                        <tr key={zone.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-3 font-sans font-bold text-slate-900">{zone.name}</td>
                          <td className="py-3 px-3 font-sans text-slate-700">{submission.submittedBy}</td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-emerald-700 font-bold">{submission.birth.current}</span> / <span className="text-amber-700">{submission.birth.late}</span> / <span className="text-purple-700">{submission.birth.backlog || 0}</span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-emerald-700 font-bold">{submission.death.current}</span> / <span className="text-amber-700">{submission.death.late}</span> / <span className="text-purple-700">{submission.death.backlog || 0}</span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-emerald-700 font-bold">{submission.marriage.current}</span> / <span className="text-amber-700">{submission.marriage.late}</span> / <span className="text-purple-700">{submission.marriage.backlog || 0}</span>
                          </td>
                          <td className="py-3 px-3 text-right text-slate-700">
                            {submission.divorce.current + submission.adoption.current + submission.divorce.late + submission.adoption.late + (submission.divorce.backlog || 0) + (submission.adoption.backlog || 0)}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-900 font-bold">
                            {(curTot + lateTot + backlogTot).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 font-sans">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              isApproved ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-cyan-100 text-cyan-800 border-cyan-300'
                            }`}>
                              {submission.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-sans">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setSelectedSubmissionModal(submission)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-cyan-100 text-slate-700 hover:text-cyan-800 transition-colors cursor-pointer"
                                title="ዝርዝር እይ"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              {!isApproved ? (
                                <button
                                  onClick={() => {
                                    onApproveSubmission(submission.id);
                                    onAddAuditLog('SUBMISSION_APPROVED', `የ${zone.name} ሪፖርት ፀደቀ`);
                                  }}
                                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer shadow-xs"
                                >
                                  አጽድቅ
                                </button>
                              ) : (
                                <span className="text-[11px] text-emerald-700 font-bold">✓ ፀድቋል</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUBMISSION DOSSIER / DETAIL MODAL */}
          {selectedSubmissionModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-md overflow-y-auto animate-in fade-in">
              <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-200/80 bg-slate-50/70">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-cyan-100 text-cyan-900 border border-cyan-200">
                        {selectedSubmissionModal.id}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                        selectedSubmissionModal.status === 'የፀደቀ'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : selectedSubmissionModal.status === 'የተረጋገጠ'
                            ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {selectedSubmissionModal.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 pt-1">
                      {selectedSubmissionModal.zoneName} — የ{selectedSubmissionModal.monthNameAm} {selectedSubmissionModal.year} ዓ.ም ሪፖርት ዝርዝር
                    </h3>
                    <p className="text-xs text-slate-500">
                      የቀረበበት ቀንና ሰዓት፦ <strong className="text-slate-800 font-mono">{selectedSubmissionModal.submittedAt}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedSubmissionModal(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                  {/* Coordinator & Coverage Overview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">ያቀረበው አስተባባሪ</span>
                      <p className="text-xs font-bold text-slate-900">{selectedSubmissionModal.submittedBy}</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">የወረዳዎችና ቀበሌዎች ሽፋን</span>
                      <p className="text-xs font-bold text-cyan-800 font-mono">
                        {selectedSubmissionModal.reportingWoredasCount} ወረዳዎች • {selectedSubmissionModal.reportingKebelesCount} ቀበሌዎች
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">የዘገዩ ቅጣት ገቢ (ETB)</span>
                      <p className="text-xs font-bold text-amber-700 font-mono">
                        {((selectedSubmissionModal.birth.late + selectedSubmissionModal.death.late + selectedSubmissionModal.marriage.late + selectedSubmissionModal.divorce.late + selectedSubmissionModal.adoption.late) * 500).toLocaleString()} ETB
                      </p>
                    </div>
                  </div>

                  {/* 5 Vital Events Grid */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
                      <span>የ5ቱ ወሳኝ ኩነቶች ዝርዝር ምዝገባዎች (Vital Events Breakdown)</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      {/* Birth */}
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-emerald-800">ልደት (Birth)</span>
                          <span className="text-[10px] text-emerald-700 font-mono">≤ 90 ቀናት</span>
                        </div>
                        <div className="space-y-1 text-xs font-mono">
                          <div className="flex justify-between text-slate-700">
                            <span>ወቅታዊ (≤90 ቀን)፦</span>
                            <strong className="text-emerald-700">{selectedSubmissionModal.birth.current.toLocaleString()}</strong>
                          </div>
                          <div className="flex justify-between text-slate-700">
                            <span>የዘገየ (90ቀን-1ዓመት)፦</span>
                            <strong className="text-amber-700">{selectedSubmissionModal.birth.late.toLocaleString()}</strong>
                          </div>
                          <div className="flex justify-between text-slate-700">
                            <span>ነባር (ከ1 ዓመት በኋላ)፦</span>
                            <strong className="text-purple-700">{(selectedSubmissionModal.birth.backlog || 0).toLocaleString()}</strong>
                          </div>
                          <div className="flex justify-between border-t border-emerald-200/80 pt-1 text-slate-900 font-bold">
                            <span>ጠቅላላ ድምር፦</span>
                            <span>{(selectedSubmissionModal.birth.current + selectedSubmissionModal.birth.late + (selectedSubmissionModal.birth.backlog || 0)).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Death */}
                      <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-rose-800">ሞት (Death)</span>
                          <span className="text-[10px] text-rose-700 font-mono">≤ 50 ቀናት</span>
                        </div>
                        <div className="space-y-1 text-xs font-mono">
                          <div className="flex justify-between text-slate-700">
                            <span>ወቅታዊ (≤50 ቀን)፦</span>
                            <strong className="text-emerald-700">{selectedSubmissionModal.death.current.toLocaleString()}</strong>
                          </div>
                          <div className="flex justify-between text-slate-700">
                            <span>የዘገየ (50ቀን-1ዓመት)፦</span>
                            <strong className="text-amber-700">{selectedSubmissionModal.death.late.toLocaleString()}</strong>
                          </div>
                          <div className="flex justify-between text-slate-700">
                            <span>ነባር (ከ1 ዓመት በኋላ)፦</span>
                            <strong className="text-purple-700">{(selectedSubmissionModal.death.backlog || 0).toLocaleString()}</strong>
                          </div>
                          <div className="flex justify-between border-t border-rose-200/80 pt-1 text-slate-900 font-bold">
                            <span>ጠቅላላ ድምር፦</span>
                            <span>{(selectedSubmissionModal.death.current + selectedSubmissionModal.death.late + (selectedSubmissionModal.death.backlog || 0)).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Marriage */}
                      <div className="rounded-xl border border-cyan-200 bg-cyan-50/60 p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-cyan-800">ጋብቻ (Marriage)</span>
                          <span className="text-[10px] text-cyan-700 font-mono">≤ 30 ቀናት</span>
                        </div>
                        <div className="space-y-1 text-xs font-mono">
                          <div className="flex justify-between text-slate-700">
                            <span>ወቅታዊ (≤30 ቀን)፦</span>
                            <strong className="text-emerald-700">{selectedSubmissionModal.marriage.current.toLocaleString()}</strong>
                          </div>
                          <div className="flex justify-between text-slate-700">
                            <span>የዘገየ (31ቀን-1ዓመት)፦</span>
                            <strong className="text-amber-700">{selectedSubmissionModal.marriage.late.toLocaleString()}</strong>
                          </div>
                          <div className="flex justify-between text-slate-700">
                            <span>ነባር (ከ1 ዓመት በኋላ)፦</span>
                            <strong className="text-purple-700">{(selectedSubmissionModal.marriage.backlog || 0).toLocaleString()}</strong>
                          </div>
                          <div className="flex justify-between border-t border-cyan-200/80 pt-1 text-slate-900 font-bold">
                            <span>ጠቅላላ ድምር፦</span>
                            <span>{(selectedSubmissionModal.marriage.current + selectedSubmissionModal.marriage.late + (selectedSubmissionModal.marriage.backlog || 0)).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Divorce */}
                      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-amber-800">ፍቺ (Divorce)</span>
                          <span className="text-[10px] text-amber-700 font-mono">≤ 30 ቀናት</span>
                        </div>
                        <div className="space-y-1 text-xs font-mono">
                          <div className="flex justify-between text-slate-700">
                            <span>ወቅታዊ (≤30 ቀን)፦</span>
                            <strong className="text-emerald-700">{selectedSubmissionModal.divorce.current.toLocaleString()}</strong>
                          </div>
                          <div className="flex justify-between text-slate-700">
                            <span>የዘገየ (31ቀን-1ዓመት)፦</span>
                            <strong className="text-amber-700">{selectedSubmissionModal.divorce.late.toLocaleString()}</strong>
                          </div>
                          <div className="flex justify-between text-slate-700">
                            <span>ነባር (ከ1 ዓመት በኋላ)፦</span>
                            <strong className="text-purple-700">{(selectedSubmissionModal.divorce.backlog || 0).toLocaleString()}</strong>
                          </div>
                          <div className="flex justify-between border-t border-amber-200/80 pt-1 text-slate-900 font-bold">
                            <span>ጠቅላላ ድምር፦</span>
                            <span>{(selectedSubmissionModal.divorce.current + selectedSubmissionModal.divorce.late + (selectedSubmissionModal.divorce.backlog || 0)).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Adoption */}
                      <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-purple-800">ጉዲፈቻ (Adoption)</span>
                          <span className="text-[10px] text-purple-700 font-mono">≤ 30 ቀናት</span>
                        </div>
                        <div className="space-y-1 text-xs font-mono">
                          <div className="flex justify-between text-slate-700">
                            <span>ወቅታዊ (≤30 ቀን)፦</span>
                            <strong className="text-emerald-700">{selectedSubmissionModal.adoption.current.toLocaleString()}</strong>
                          </div>
                          <div className="flex justify-between text-slate-700">
                            <span>የዘገየ (31ቀን-1ዓመት)፦</span>
                            <strong className="text-amber-700">{selectedSubmissionModal.adoption.late.toLocaleString()}</strong>
                          </div>
                          <div className="flex justify-between text-slate-700">
                            <span>ነባር (ከ1 ዓመት በኋላ)፦</span>
                            <strong className="text-purple-700">{(selectedSubmissionModal.adoption.backlog || 0).toLocaleString()}</strong>
                          </div>
                          <div className="flex justify-between border-t border-purple-200/80 pt-1 text-slate-900 font-bold">
                            <span>ጠቅላላ ድምር፦</span>
                            <span>{(selectedSubmissionModal.adoption.current + selectedSubmissionModal.adoption.late + (selectedSubmissionModal.adoption.backlog || 0)).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submission Notes */}
                  {selectedSubmissionModal.notes && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-4 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                        ከዞኑ ወሳኝ ኩነቶች አስተባባሪ የተላከ ማስታወሻና ማብራሪያ፦
                      </span>
                      <p className="text-xs text-slate-800 leading-relaxed font-sans">
                        {selectedSubmissionModal.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 sm:p-5 border-t border-slate-200/80 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 font-mono">
                    ጠቅላላ የተመዘገቡ ኩነቶች፦ <strong className="text-slate-900 font-bold text-sm">
                      {(
                        selectedSubmissionModal.birth.current + selectedSubmissionModal.birth.late +
                        selectedSubmissionModal.death.current + selectedSubmissionModal.death.late +
                        selectedSubmissionModal.marriage.current + selectedSubmissionModal.marriage.late +
                        selectedSubmissionModal.divorce.current + selectedSubmissionModal.divorce.late +
                        selectedSubmissionModal.adoption.current + selectedSubmissionModal.adoption.late
                      ).toLocaleString()}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedSubmissionModal(null)}
                      className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      ዝጋ
                    </button>

                    {selectedSubmissionModal.status !== 'የፀደቀ' ? (
                      <button
                        onClick={() => {
                          onApproveSubmission(selectedSubmissionModal.id);
                          onAddAuditLog('SUBMISSION_APPROVED', `የ${selectedSubmissionModal.zoneName} የ${selectedSubmissionModal.monthNameAm} ${selectedSubmissionModal.year} ዓ.ም ሪፖርት ፀደቀ (${selectedSubmissionModal.id})`);
                          setSelectedSubmissionModal({ ...selectedSubmissionModal, status: 'የፀደቀ' });
                        }}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md shadow-emerald-600/20"
                      >
                        <Check className="h-4 w-4" />
                        <span>ይህን ሪፖርት አጽድቅ (Approve Report)</span>
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>በክልሉ አስተዳዳሪ የፀደቀ ሪፖርት</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: ETHIOPIAN CALENDAR CONVERTER */}
      {activeTab === 'converter' && (
        <div className="space-y-6">
          <EthiopianCalendarConverterWidget />
        </div>
      )}

      {/* TAB: ZONE CREDENTIALS & PASSWORDS */}
      {activeTab === 'zoneCredentials' && (
        <div className="space-y-6">
          {/* Security Banner */}
          <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/70 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-emerald-950">ምስጢራዊ የመለያ መረጃዎች ጥበቃ (Protected Credentials)</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900 border border-emerald-300">
                    Production Ready
                  </span>
                </div>
                <p className="text-xs text-emerald-800 mt-0.5">
                  የይለፍ ቃላት በግልጽ አይታዩም። ለስራ አስፈላጊ ሲሆን ብቻ የአይን ምልክቷን በመጫን ለጊዜው ማየት ወይም አዲስ የይለፍ ቃል መመደብ ይችላሉ።
                </p>
              </div>
            </div>
            {passwordNotice && (
              <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shrink-0 ${
                passwordNotice.type === 'success' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-rose-600 text-white shadow-xs'
              }`}>
                <span>{passwordNotice.message}</span>
              </div>
            )}
          </div>

          {/* Regional & Super Admin Credentials Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Super Admin */}
            <div className="rounded-xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                  <h4 className="text-sm font-bold text-slate-900">የበላይ አስተዳዳሪ (Super Admin)</h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-bold border border-purple-200">
                  Full Authority
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">የተጠቃሚ ስም:</span>
                  <span className="font-mono font-bold text-slate-800">{credentialsConfig.superAdmin.username}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">የይለፍ ቃል:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-700 tracking-wider">
                      {revealedAdminPasswords['super_admin'] ? credentialsConfig.superAdmin.passwordHash : '••••••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setRevealedAdminPasswords(prev => ({ ...prev, super_admin: !prev.super_admin }))}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title={revealedAdminPasswords['super_admin'] ? "ደብቅ" : "አሳይ"}
                    >
                      {revealedAdminPasswords['super_admin'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAdminRole('super_admin');
                        setNewAdminPasswordInput('');
                        setPasswordNotice(null);
                      }}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <KeyRound className="h-3 w-3" />
                      <span>ቀይር</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Regional Admin */}
            <div className="rounded-xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
                  <h4 className="text-sm font-bold text-slate-900">የክልሉ ማዕከላዊ አስተዳዳሪ (Regional Admin)</h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-100 text-cyan-900 font-bold border border-cyan-200">
                  Regional Central
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">የተጠቃሚ ስም:</span>
                  <span className="font-mono font-bold text-slate-800">{credentialsConfig.regionalAdmin.username}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">የይለፍ ቃል:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-700 tracking-wider">
                      {revealedAdminPasswords['regional_admin'] ? credentialsConfig.regionalAdmin.passwordHash : '••••••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setRevealedAdminPasswords(prev => ({ ...prev, regional_admin: !prev.regional_admin }))}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title={revealedAdminPasswords['regional_admin'] ? "ደብቅ" : "አሳይ"}
                    >
                      {revealedAdminPasswords['regional_admin'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAdminRole('regional_admin');
                        setNewAdminPasswordInput('');
                        setPasswordNotice(null);
                      }}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <KeyRound className="h-3 w-3" />
                      <span>ቀይር</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Zones Credentials Table */}
          <div className="rounded-xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-6 space-y-4 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-slate-900">የማዕከላዊ ኢትዮጵያ 10ሩም ዞኖች ይፋዊ የተጠቃሚ ስሞች እና የይለፍ ቃሎች</h2>
              <p className="text-xs text-slate-500">
                እያንዳንዱ ዞን (ሀላባ፣ ሀዲያ፣ ጉራጌ፣ ምሥራቅ ጉራጌ፣ ስልጤ፣ ከምባታ፣ የም፣ ማረቆ፣ ጠምባሮ እና ቀቤና) የወረዳና የቀበሌዎችን ሪፖርት ለክልሉ የሚያቀርበው በእነዚህ ምስጢራዊ መለያዎች ነው።
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono bg-slate-50/50">
                    <th className="py-2.5 px-3">ዞን / ልዩ ወረዳ</th>
                    <th className="py-2.5 px-3">ዋና ከተማ</th>
                    <th className="py-2.5 px-3">ኃላፊ ስም</th>
                    <th className="py-2.5 px-3">ስልክ ቁጥር</th>
                    <th className="py-2.5 px-3 font-mono">የተጠቃሚ ስም (Username)</th>
                    <th className="py-2.5 px-3 font-mono">የይለፍ ቃል (Password)</th>
                    <th className="py-2.5 px-3 text-right">እርምጃ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 font-mono">
                  {CENTRAL_ETHIOPIA_ZONES.map((z) => {
                    const zonePass = credentialsConfig.zones[z.id]?.password || getZonePassword(z.id);
                    const zoneUser = credentialsConfig.zones[z.id]?.username || z.username;
                    const isRevealed = !!revealedZonePasswords[z.id];

                    return (
                      <tr key={z.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 font-sans font-bold text-slate-900">{z.name}</td>
                        <td className="py-3 px-3 font-sans text-slate-700">{z.capital}</td>
                        <td className="py-3 px-3 font-sans text-slate-700">{z.officerName}</td>
                        <td className="py-3 px-3 text-slate-600">{z.officerPhone}</td>
                        <td className="py-3 px-3 text-cyan-800 font-bold">{zoneUser}</td>
                        <td className="py-3 px-3 text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono tracking-wider font-semibold">
                              {isRevealed ? zonePass : '••••••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setRevealedZonePasswords(prev => ({ ...prev, [z.id]: !prev[z.id] }))}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                              title={isRevealed ? "የይለፍ ቃል ደብቅ" : "የይለፍ ቃል አሳይ"}
                            >
                              {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-sans">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingZonePassword({ id: z.id, name: z.name, username: zoneUser });
                              setNewZonePasswordInput('');
                              setPasswordNotice(null);
                            }}
                            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <KeyRound className="h-3 w-3" />
                            <span>ቀይር</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Change Zone Password Modal */}
          {editingZonePassword && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
              <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">የዞን የይለፍ ቃል ማስተካከያ</h3>
                      <p className="text-[11px] text-slate-500">{editingZonePassword.name} ({editingZonePassword.username})</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setEditingZonePassword(null); setPasswordNotice(null); }}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">አዲስ የይለፍ ቃል አስገባ</label>
                    <input
                      type="text"
                      value={newZonePasswordInput}
                      onChange={(e) => setNewZonePasswordInput(e.target.value)}
                      placeholder="ቢያንስ 6 ፊደላት ወይም ቁጥሮች..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500"
                      autoFocus
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      ዞኑ ሪፖርቶችን ሲያቀርብ አዲሱን የይለፍ ቃል ይጠቀማል።
                    </p>
                  </div>

                  {passwordNotice && (
                    <div className={`p-2 rounded-lg text-xs font-semibold ${
                      passwordNotice.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                    }`}>
                      {passwordNotice.message}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => { setEditingZonePassword(null); setPasswordNotice(null); }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    ሰርዝ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateZonePassword(editingZonePassword.id, editingZonePassword.name)}
                    className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    አስቀምጥ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Change Admin Password Modal */}
          {editingAdminRole && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
              <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">የአስተዳዳሪ የይለፍ ቃል ማስተካከያ</h3>
                      <p className="text-[11px] text-slate-500">
                        {editingAdminRole === 'super_admin' ? 'የበላይ አስተዳዳሪ (Super Admin)' : 'የክልሉ ማዕከላዊ አስተዳዳሪ (Regional Admin)'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setEditingAdminRole(null); setPasswordNotice(null); }}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">አዲስ የይለፍ ቃል አስገባ</label>
                    <input
                      type="text"
                      value={newAdminPasswordInput}
                      onChange={(e) => setNewAdminPasswordInput(e.target.value)}
                      placeholder="ቢያንስ 6 ፊደላት ወይም ቁጥሮች..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
                      autoFocus
                    />
                  </div>

                  {passwordNotice && (
                    <div className={`p-2 rounded-lg text-xs font-semibold ${
                      passwordNotice.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                    }`}>
                      {passwordNotice.message}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => { setEditingAdminRole(null); setPasswordNotice(null); }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    ሰርዝ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateAdminPassword(editingAdminRole)}
                    className="px-4 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    አስቀምጥ
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: ZONE MESSAGE REQUESTS & DIRECT REPLAY */}
      {activeTab === 'zoneMessages' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-50/90 via-white/95 to-amber-50/70 backdrop-blur-md p-6 sm:p-7 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/30">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      የ10ሩ ዞኖች የመልእክት፣ የአቅርቦትና የቴክኒክ ድጋፍ ጥያቄዎች ማዕከል
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-950 border border-amber-400 font-mono">
                      Direct Replay Hub
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    ከ10ሩ የማዕከላዊ ኢትዮጵያ ዞኖች የተላኩ የሰርተፊኬት ወረቀት፣ የቅጾች አቅርቦት፣ የኔትወርክና የሲስተም ድጋፍ እና የህግ ማብራሪያ ጥያቄዎችን በመመርመር ለዞኖች ይፋዊ ምላሽ (Replay/Reply) ይስጡ።
                  </p>
                </div>
              </div>

              {pendingMessagesCount > 0 && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                  <span>{pendingMessagesCount} ጥያቄዎች ምላሽ በመጠባበቅ ላይ ናቸው</span>
                </div>
              )}
            </div>

            {/* Success Alert Toast */}
            {messageSuccessNotice && (
              <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs transition-all animate-fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{messageSuccessNotice}</span>
              </div>
            )}
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-4 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">ጠቅላላ ጥያቄዎች</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 font-mono">{currentZoneMessages.length}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">ከ10 ዞኖች</span>
              </div>
              <span className="text-[10px] text-slate-500 block">የተመዘገቡ የመልእክት ልውውጦች</span>
            </div>

            <div className="rounded-xl border border-amber-300 bg-amber-50/80 backdrop-blur-md p-4 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span>ምላሽ የሚሹ (Pending)</span>
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-amber-900 font-mono">{pendingMessagesCount}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 font-mono">
                  {currentZoneMessages.length > 0 ? Math.round((pendingMessagesCount / currentZoneMessages.length) * 100) : 0}%
                </span>
              </div>
              <span className="text-[10px] text-amber-800 block">አፋጣኝ ምላሽ የሚሹ</span>
            </div>

            <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 backdrop-blur-md p-4 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">ምላሽ የተሰጠባቸው</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-900 font-mono">{repliedMessagesCount}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-950 font-mono">
                  {currentZoneMessages.length > 0 ? Math.round((repliedMessagesCount / currentZoneMessages.length) * 100) : 0}%
                </span>
              </div>
              <span className="text-[10px] text-emerald-700 block">ምላሽ ያገኙና የተፈቱ</span>
            </div>

            <div className="rounded-xl border border-rose-300 bg-rose-50/80 backdrop-blur-md p-4 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
                <span>አስቸኳይ ቅድሚያ (Urgent)</span>
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-rose-900 font-mono">{urgentMessagesCount}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-200 text-rose-950">ቅድሚያ</span>
              </div>
              <span className="text-[10px] text-rose-700 block">አስቸኳይ ትኩረት የሚሹ</span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={msgSearchQuery}
                  onChange={(e) => setMsgSearchQuery(e.target.value)}
                  placeholder="በዞን ስም፣ በኃላፊ ስም፣ በርዕስ፣ በወረዳ ወይም በመልእክት ይዘት ፈልግ..."
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-slate-800"
                />
                {msgSearchQuery && (
                  <button
                    onClick={() => setMsgSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Filters row */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Zone Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 shrink-0">ዞን፦</span>
                  <select
                    value={msgZoneFilter}
                    onChange={(e) => setMsgZoneFilter(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
                  >
                    <option value="all">ሁሉም 10ሩ ዞኖች</option>
                    {CENTRAL_ETHIOPIA_ZONES.map(z => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 shrink-0">ሁኔታ፦</span>
                  <select
                    value={msgStatusFilter}
                    onChange={(e) => setMsgStatusFilter(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
                  >
                    <option value="all">ሁሉም ሁኔታዎች</option>
                    <option value="pending">⏳ በመጠባበቅ ላይ (Pending)</option>
                    <option value="replied">✅ ምላሽ የተሰጠው (Replied)</option>
                    <option value="resolved">✨ የተፈታ (Resolved)</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 shrink-0">ቅድሚያ፦</span>
                  <select
                    value={msgPriorityFilter}
                    onChange={(e) => setMsgPriorityFilter(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
                  >
                    <option value="all">ሁሉም ቅድሚያዎች</option>
                    <option value="urgent">🚨 አስቸኳይ (Urgent)</option>
                    <option value="high">⚡ ከፍተኛ (High)</option>
                    <option value="normal">📋 መደበኛ (Normal)</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 shrink-0">ዘርፍ፦</span>
                  <select
                    value={msgCategoryFilter}
                    onChange={(e) => setMsgCategoryFilter(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
                  >
                    <option value="all">ሁሉም ዘርፎች</option>
                    <option value="supplies">📦 የቁሳቁስና ቅጾች</option>
                    <option value="system_support">💻 የስርዓት ድጋፍ</option>
                    <option value="legal_inquiry">⚖️ የህግና ደንብ ማብራሪያ</option>
                    <option value="urgent_request">🚨 አስቸኳይ ጥያቄ</option>
                    <option value="general">📝 አጠቃላይ</option>
                  </select>
                </div>

                {(msgSearchQuery || msgZoneFilter !== 'all' || msgStatusFilter !== 'all' || msgPriorityFilter !== 'all' || msgCategoryFilter !== 'all') && (
                  <button
                    onClick={handleResetMsgFilters}
                    className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    አጽዳ
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 font-mono">
              <span>የተገኙ ጥያቄዎች፦ <strong className="text-slate-900">{filteredZoneMessages.length}</strong> ከ {currentZoneMessages.length}</span>
              <span className="text-slate-400 text-[11px] font-sans">ከእያንዳንዱ ዞን የቀረቡ ጥያቄዎችን በመምረጥ ምላሽ (Replay) መስጠት ይችላሉ።</span>
            </div>
          </div>

          {/* Message Requests List */}
          {filteredZoneMessages.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Inbox className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">በተመረጠው ማጣሪያ ምንም ዓይነት የመልእክት ጥያቄ አልተገኘም</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                እባክዎ የፍለጋ ቃሉን ወይም የዞን፣ የሁኔታና የቅድሚያ ማጣሪያዎችን አስተካክለው ይሞክሩ።
              </p>
              <button
                onClick={handleResetMsgFilters}
                className="mt-2 px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                ሁሉንም ማጣሪያዎች አጽዳ
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredZoneMessages.map((msg) => {
                const isReplying = activeReplyId === msg.id;
                const hasReplies = msg.replies && msg.replies.length > 0;

                return (
                  <div
                    key={msg.id}
                    className={`rounded-2xl border transition-all duration-200 bg-white/95 backdrop-blur-md shadow-sm overflow-hidden ${
                      msg.status === 'pending'
                        ? 'border-amber-300/90 ring-1 ring-amber-400/20'
                        : msg.status === 'resolved'
                        ? 'border-cyan-300/80'
                        : 'border-emerald-300/80'
                    }`}
                  >
                    {/* Message Header Strip */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Zone Name Badge */}
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-50 border border-cyan-300 text-cyan-900 font-bold text-xs shadow-2xs">
                            <Building className="h-3.5 w-3.5 text-cyan-700" />
                            <span>{msg.zoneName}</span>
                          </div>

                          {/* Officer Info */}
                          <div className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                            <span className="font-bold text-slate-900">{msg.officerName}</span>
                            <span className="text-slate-300">|</span>
                            <span className="flex items-center gap-1 font-mono text-[11px] text-slate-600">
                              <Phone className="h-3 w-3 text-slate-400" />
                              {msg.officerPhone}
                            </span>
                          </div>

                          {/* Category Badge */}
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                            <Tag className="h-3 w-3 text-slate-500" />
                            <span>{msg.categoryAm}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Priority Pill */}
                          {msg.priority === 'urgent' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-900 text-xs font-bold border border-rose-300 animate-pulse">
                              <span className="h-2 w-2 rounded-full bg-rose-600" />
                              <span>አስቸኳይ (Urgent)</span>
                            </span>
                          )}
                          {msg.priority === 'high' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 text-xs font-bold border border-amber-300">
                              <span className="h-2 w-2 rounded-full bg-amber-600" />
                              <span>ከፍተኛ (High)</span>
                            </span>
                          )}
                          {msg.priority === 'normal' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                              <span>መደበኛ</span>
                            </span>
                          )}

                          {/* Status Pill */}
                          {msg.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 text-xs font-bold border border-amber-300">
                              <Clock className="h-3 w-3 text-amber-600" />
                              <span>በመጠባበቅ ላይ</span>
                            </span>
                          )}
                          {msg.status === 'replied' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 text-xs font-bold border border-emerald-300">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span>ምላሽ የተሰጠው</span>
                            </span>
                          )}
                          {msg.status === 'resolved' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-900 text-xs font-bold border border-cyan-300">
                              <Check className="h-3 w-3 text-cyan-600" />
                              <span>የተፈታ</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Subject and Date */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          {msg.subject}
                        </h3>
                        <span className="text-[11px] font-mono text-slate-500 shrink-0 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span>{msg.createdAt}</span>
                        </span>
                      </div>

                      {msg.woredaAffected && (
                        <div className="flex items-center gap-1 text-xs text-amber-900 bg-amber-50/80 px-2.5 py-1 rounded-md border border-amber-200 w-fit">
                          <MapPin className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                          <span>የሚመለከተው ወረዳ/አካባቢ፦ <strong>{msg.woredaAffected}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Message Body */}
                    <div className="p-4 sm:p-5 space-y-4">
                      <div className="rounded-xl bg-slate-50/80 border border-slate-200/90 p-4 text-xs text-slate-800 leading-relaxed font-sans">
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 flex items-center gap-1">
                          <MessageCircle className="h-3 w-3 text-slate-400" />
                          <span>ከ{msg.zoneName} የቀረበ የመልእክት ይዘት፦</span>
                        </div>
                        <p className="whitespace-pre-line text-slate-700">{msg.message}</p>
                      </div>

                      {/* Conversation / Reply History */}
                      {hasReplies && (
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-900">
                            <CornerDownRight className="h-4 w-4 text-cyan-700" />
                            <span>የክልሉ አስተዳደር የሰጣቸው ይፋዊ ምላሾች ({msg.replies.length})፦</span>
                          </div>

                          <div className="space-y-2.5 pl-3 sm:pl-4 border-l-2 border-cyan-400/80">
                            {msg.replies.map((rep) => (
                              <div
                                key={rep.id}
                                className="rounded-xl border border-cyan-200/90 bg-gradient-to-r from-cyan-50/70 to-emerald-50/40 p-3.5 space-y-1.5 shadow-2xs"
                              >
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-cyan-950 flex items-center gap-1.5">
                                    <ShieldCheck className="h-3.5 w-3.5 text-cyan-700" />
                                    <span>{rep.senderName}</span>
                                  </span>
                                  <span className="font-mono text-slate-500 text-[10px]">{rep.sentAt}</span>
                                </div>
                                <p className="text-xs text-slate-800 leading-relaxed font-sans">{rep.message}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Reply Form / Action Bar */}
                      <div className="pt-2 border-t border-slate-100">
                        {isReplying ? (
                          <div className="rounded-xl border border-amber-300 bg-amber-50/40 p-4 space-y-3 animate-fade-in">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <Reply className="h-4 w-4 text-amber-700" />
                                <span>ለ{msg.zoneName} ({msg.officerName}) ይፋዊ ምላሽ ይጻፉ</span>
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">Replay to {msg.id}</span>
                            </div>

                            {/* Quick Response Templates */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                ፈጣን አብነቶች (Quick Templates - አንድ ጠቅ በማድረግ ይሙሉ)፦
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  'ጥያቄዎ ተቀባይነት አግኝቷል፤ የታተሙ ሰርተፊኬቶችና ቅጾች በክልሉ ፖስታ ተልከዋል።',
                                  'የክልሉ ቴክኒካል ድጋፍ ቡድን በስልክ ተገናኝቶ ስርዓቱን በሩቅ መቆጣጠሪያ እንዲያስተካክል ተመድቧል።',
                                  'የህግ ማብራሪያ ሰርኩላር ደብዳቤና የክፍያ መመሪያ በኢሜይል ተልኳል፤ በዞኑ ተፈፃሚ እንዲሆን።',
                                  'ጥያቄው በክልሉ አመራር ቦርድ ውይይት ተደርጎበት ውሳኔው በይፋዊ ደብዳቤ ይገለጻል።',
                                  'አስቸኳይ ጉዳይ በመሆኑ የድጋፍ ቡድኑ በነገው ዕለት ወደ ዞኑ ዋና ከተማ ይጓዛል።'
                                ].map((tpl, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setReplyInputText(tpl)}
                                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-amber-300/80 hover:bg-amber-100 text-slate-700 hover:text-slate-950 transition-colors text-left cursor-pointer"
                                  >
                                    + {tpl.slice(0, 36)}...
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Reply Textarea */}
                            <div>
                              <textarea
                                rows={3}
                                value={replyInputText}
                                onChange={(e) => setReplyInputText(e.target.value)}
                                placeholder="የክልሉን ይፋዊ ምላሽ ወይም ውሳኔ እዚህ ይጻፉ..."
                                className="w-full p-3 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-slate-800 leading-relaxed font-sans"
                                autoFocus
                              />
                            </div>

                            {/* Status radio selection */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                              <div className="flex items-center gap-4 text-xs">
                                <span className="font-bold text-slate-700">ከምላሽ በኋላ ያለው ሁኔታ፦</span>
                                <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                                  <input
                                    type="radio"
                                    name={`status-${msg.id}`}
                                    checked={replyStatusChoice === 'replied'}
                                    onChange={() => setReplyStatusChoice('replied')}
                                    className="text-amber-600 focus:ring-amber-500"
                                  />
                                  <span>ምላሽ የተሰጠው (Replied)</span>
                                </label>
                                <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                                  <input
                                    type="radio"
                                    name={`status-${msg.id}`}
                                    checked={replyStatusChoice === 'resolved'}
                                    onChange={() => setReplyStatusChoice('resolved')}
                                    className="text-cyan-600 focus:ring-cyan-500"
                                  />
                                  <span>የተፈታ (Resolved)</span>
                                </label>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveReplyId(null);
                                    setReplyInputText('');
                                  }}
                                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
                                >
                                  ሰርዝ
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSendReply(msg.id)}
                                  disabled={!replyInputText.trim()}
                                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white shadow-xs transition-colors cursor-pointer"
                                >
                                  <Send className="h-3.5 w-3.5" />
                                  <span>ምላሹን ለዞኑ አስተላልፍ (Send Replay)</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="text-xs text-slate-500">
                              {hasReplies ? (
                                <span className="text-emerald-700 font-medium">✓ ይህ ጥያቄ የክልሉ አስተዳደር ምላሽ አግኝቷል</span>
                              ) : (
                                <span className="text-amber-700 font-medium">⚠️ ይህ ጥያቄ የክልሉን ምላሽ በመጠባበቅ ላይ ነው</span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {msg.status !== 'resolved' && hasReplies && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onReplyToZoneMessage) {
                                      onReplyToZoneMessage(msg.id, 'ጉዳዩ ሙሉ በሙሉ ተፈትቶ ተዘግቷል።', 'resolved');
                                    } else {
                                      setLocalZoneMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'resolved', statusAm: 'የተፈታ' } : m));
                                    }
                                    setMessageSuccessNotice(`ለ${msg.zoneName} ጥያቄ 'የተፈታ' ሁነታ ተመዝግቧል!`);
                                    setTimeout(() => setMessageSuccessNotice(null), 3000);
                                  }}
                                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
                                >
                                  እንደተፈታ ምልክት አድርግ
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveReplyId(msg.id);
                                  setReplyInputText('');
                                  setReplyStatusChoice('replied');
                                }}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white shadow-xs transition-colors cursor-pointer"
                              >
                                <Reply className="h-3.5 w-3.5" />
                                <span>{hasReplies ? 'ተጨማሪ ምላሽ ስጥ (Replay)' : 'ምላሽ ስጥ (Replay)'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {activeTab === 'notifications' && (
        <div className="rounded-xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-slate-900">ለ10ሩም ዞኖች አስተባባሪዎች ማሳሰቢያና የማጠቃለያ ሪፖርት መላኪያ</h2>
            <p className="text-xs text-slate-500">
              በየወሩ ማጠቃለያ ላይ የስታቲስቲክስ ግራፎችና የፓወር ፖይንት ሰነድ አያይዞ ለዞኖችና ለክልሉ አመራሮች በኤስኤምኤስ እና በኢሜይል መላኪያ።
            </p>
          </div>

          {notificationMsg && (
            <div className="p-3.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{notificationMsg}</span>
            </div>
          )}

          <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 text-xs text-slate-700 space-y-2">
            <span className="text-cyan-800 font-bold block uppercase text-[10px]">የማሳሰቢያው መልእክት ይዘት፡</span>
            <p className="leading-relaxed">
              "ክቡር የዞን ወሳኝ ኩነቶች አስተባባሪ፤ የማዕከላዊ ኢትዮጵያ ክልል የወሳኝ ኩነቶች የ{selectedMonth === 0 ? 'ዓመታዊ' : ETHIOPIAN_MONTHS[selectedMonth - 1]} ወር የተጠናከረ የትንታኔ ሪፖርት ተዘጋጅቷል። በወሩ የተመዘገቡ ወሳኝ ኩነቶች፣ የመደበኛና የዘገዩ ምዝገባዎች ንፅፅር እና የዞኖች አፈጻጸም ዝርዝር ግራፎች ተያይዘዋል። ያልተሟሉ ወረዳዎች በአስቸኳይ እንዲያጠናቅቁ እናሳስባለን።"
            </p>
          </div>

          <button
            onClick={handleSendZoneDigest}
            className="flex items-center gap-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white px-6 py-2.5 text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Mail className="h-4 w-4" />
            <span>ማሳሰቢያውን ለ10ሩም ዞኖች አስተላልፍ</span>
          </button>
        </div>
      )}

      {/* TAB: ENCRYPTED BACKUP */}
      {activeTab === 'backup' && (
        <div className="rounded-xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-slate-900">ምስጠራዊ የውሂብ ቅጂ ማውረጃ (SHA-256 Encrypted Backup)</h2>
            <p className="text-xs text-slate-500">
              በማዕከላዊ ኢትዮጵያ ክልል 10ሩም ዞኖች የተመዘገቡ ወሳኝ ኩነቶች በምስጠራ ጥበቃ ተደርጎላቸው በአንድ ማህደር ይወርዳሉ።
            </p>
          </div>

          <button
            onClick={handleDownloadEncryptedBackup}
            className="flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white px-6 py-2.5 text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Download className="h-4 w-4" />
            <span>ምስጠራዊ የውሂብ ቅጂ አውርድ (.json)</span>
          </button>

          {backupJson && (
            <div className="pt-2">
              <span className="text-[11px] text-slate-500 font-mono block mb-1">የምስጠራው ቅጂ ማሳያ፡</span>
              <pre className="max-h-48 overflow-y-auto rounded-lg bg-slate-50 p-4 font-mono text-[10px] text-emerald-800 border border-slate-200">
                {backupJson.slice(0, 600)}...
              </pre>
            </div>
          )}
        </div>
      )}

      {/* TAB: AUDIT LOGS */}
      {activeTab === 'auditLogs' && (
        <div className="rounded-xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">የስርዓት ደህንነት እና የተግባራት ኦዲት መዝገብ</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider bg-slate-50/50">
                  <th className="py-2.5 px-3">ቀንና ሰዓት</th>
                  <th className="py-2.5 px-3">ፈጻሚው አካል</th>
                  <th className="py-2.5 px-3">የተከናወነ ተግባር</th>
                  <th className="py-2.5 px-3">ዝርዝር</th>
                  <th className="py-2.5 px-3">ሁኔታ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">{log.timestamp}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-800">{log.actor}</td>
                    <td className="py-2.5 px-3 text-cyan-800 font-bold">{log.action}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-700">{log.details}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Document Modal for Super Admin */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={(newDoc) => {
          if (onUploadDocument) {
            onUploadDocument(newDoc);
          }
        }}
      />

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={!!previewDoc}
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
};
