import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ZoneMonthlySubmission, ServiceType, UserRole, ZoneAccount } from '../../types';
import { ETHIOPIAN_MONTHS, CENTRAL_ETHIOPIA_ZONES, STATUTORY_LIMITS_AM } from '../../data/mockDatabase';
import { generatePowerPointReport } from '../../utils/pptxGenerator';
import { exportZoneSubmissionsToCSV } from '../../utils/csvGenerator';
import { generatePDFFromElement } from '../../utils/pdfGenerator';
import { 
  getCurrentEthiopianDate, 
  formatEthiopianDateTime,
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
  BarChart3, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  Filter, 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Search, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  ArrowRightLeft, 
  FileDown, 
  PieChart as PieChartIcon, 
  ShieldCheck, 
  Eye, 
  FileText, 
  Sparkles, 
  Layers, 
  Award, 
  Info, 
  ArrowUp, 
  ArrowDown,
  Lock,
  Baby,
  Heart,
  HeartHandshake,
  UserCheck,
  FileCheck2
} from 'lucide-react';

interface ReportsViewProps {
  submissions: ZoneMonthlySubmission[];
  onAddAuditLog: (action: string, details: string) => void;
  userRole?: UserRole;
  activeZoneAccount?: ZoneAccount | null;
  onOpenLoginModal?: () => void;
  onSelectTab?: (tab: string) => void;
}

// Chart color definitions
const EVENT_COLORS = {
  birth: '#10b981',    // Emerald
  death: '#f43f5e',    // Rose
  marriage: '#06b6d4', // Cyan
  divorce: '#f59e0b',  // Amber
  adoption: '#8b5cf6', // Violet
};

export const ReportsView: React.FC<ReportsViewProps> = ({ 
  submissions, 
  onAddAuditLog,
  userRole = 'citizen',
  activeZoneAccount = null,
  onOpenLoginModal,
  onSelectTab
}) => {
  const ethToday = getCurrentEthiopianDate();
  const pdfTemplateRef = useRef<HTMLDivElement>(null);

  const isAdmin = userRole === 'regional_admin' || userRole === 'super_admin';
  const isZoneOfficer = userRole === 'zone_officer';
  const isCitizen = userRole === 'citizen';

  const [timeRange, setTimeRange] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [selectedYear, setSelectedYear] = useState<number>(2019); // 2019 ዓ.ም የኢትዮጵያ ዘመን አቆጣጠር
  const [selectedMonth, setSelectedMonth] = useState<number>(1); // መስከረም
  const [selectedQuarter, setSelectedQuarter] = useState<number>(1);
  const [selectedZone, setSelectedZone] = useState<string>(() => {
    if (isZoneOfficer && activeZoneAccount) {
      return activeZoneAccount.name;
    }
    return 'all';
  });
  const [selectedService, setSelectedService] = useState<'all' | ServiceType>('all');
  const [isExportingPPTX, setIsExportingPPTX] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [pdfSuccessNotice, setPdfSuccessNotice] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'table' | 'pdfPreview'>('analytics');
  const [showConverter, setShowConverter] = useState(false);

  // Strictly enforce that zone officers can NEVER view any zone other than their own
  useEffect(() => {
    if (isZoneOfficer && activeZoneAccount) {
      setSelectedZone(activeZoneAccount.name);
    }
  }, [isZoneOfficer, activeZoneAccount]);

  // Filter submissions based on user criteria (Monthly, Ethiopian Fiscal Quarters, Annual Budget Year)
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      if (selectedZone !== 'all' && s.zoneName !== selectedZone) return false;

      if (timeRange === 'monthly') {
        if (s.year !== selectedYear) return false;
        if (s.month !== selectedMonth) return false;
        return true;
      }

      if (timeRange === 'quarterly') {
        // Ethiopian Fiscal Quarters:
        // 1ኛ ሩብ ዓመት: ከሐምሌ 1 እስከ መስከረም 30 (Hamle, Nehase, Pagumen, Meskerem)
        // 2ኛ ሩብ ዓመት: ከጥቅምት 1 እስከ ታኅሣሥ 30 (Tikimt, Hidar, Tahsas)
        // 3ኛ ሩብ ዓመት: ከጥር 1 እስከ መጋቢት 30 (Tir, Yekatit, Megabit)
        // 4ኛ ሩብ ዓመት: ከሚያዝያ 1 እስከ ሰኔ 30 (Miazia, Ginbot, Sene)
        if (selectedQuarter === 1) {
          // Q1: Months 11, 12, 13 of prior year or Month 1 of current year
          const isQ1 = (s.year === selectedYear - 1 && s.month >= 11) ||
                       (s.year === selectedYear && s.month === 1) ||
                       (s.year === selectedYear && s.month >= 11);
          return isQ1;
        }
        if (selectedQuarter === 2) {
          // Q2: ከጥቅምት 1 እስከ ታኅሣሥ 30 (Months 2, 3, 4)
          const targetYear = selectedYear === 2019 ? 2018 : selectedYear;
          return (s.year === selectedYear || s.year === targetYear) && (s.month === 2 || s.month === 3 || s.month === 4);
        }
        if (selectedQuarter === 3) {
          // Q3: ከጥር 1 እስከ መጋቢት 30 (Months 5, 6, 7)
          const targetYear = selectedYear === 2019 ? 2018 : selectedYear;
          return (s.year === selectedYear || s.year === targetYear) && (s.month === 5 || s.month === 6 || s.month === 7);
        }
        if (selectedQuarter === 4) {
          // Q4: ከሚያዝያ 1 እስከ ሰኔ 30 (Months 8, 9, 10)
          const targetYear = selectedYear === 2019 ? 2018 : selectedYear;
          return (s.year === selectedYear || s.year === targetYear) && (s.month === 8 || s.month === 9 || s.month === 10);
        }
        return false;
      }

      if (timeRange === 'yearly') {
        // Annual Fiscal Year Report:
        // "የአመት ሪፖርት ማለት ከ ሀምሌ 1/2018 ዓ.ም አስከ ሰኔ 30/2019 ዓ.ም ነው።"
        if (selectedYear === 2019) {
          return (s.year === 2018 && s.month >= 11) || (s.year === 2019 && s.month <= 10) || (s.year === 2018);
        } else {
          return (s.year === selectedYear - 1 && s.month >= 11) || (s.year === selectedYear && s.month <= 10) || (s.year === selectedYear);
        }
      }

      return true;
    });
  }, [submissions, selectedYear, timeRange, selectedMonth, selectedQuarter, selectedZone]);

  // Aggregate sums across the 3 statutory categories: ወቅታዊ፣ የዘገየ፣ ነባር
  let totalBirthCur = 0, totalBirthLate = 0, totalBirthBacklog = 0;
  let totalDeathCur = 0, totalDeathLate = 0, totalDeathBacklog = 0;
  let totalMarriageCur = 0, totalMarriageLate = 0, totalMarriageBacklog = 0;
  let totalDivorceCur = 0, totalDivorceLate = 0, totalDivorceBacklog = 0;
  let totalAdoptionCur = 0, totalAdoptionLate = 0, totalAdoptionBacklog = 0;

  filteredSubmissions.forEach(s => {
    totalBirthCur += s.birth?.current || 0;
    totalBirthLate += s.birth?.late || 0;
    totalBirthBacklog += s.birth?.backlog || 0;

    totalDeathCur += s.death?.current || 0;
    totalDeathLate += s.death?.late || 0;
    totalDeathBacklog += s.death?.backlog || 0;

    totalMarriageCur += s.marriage?.current || 0;
    totalMarriageLate += s.marriage?.late || 0;
    totalMarriageBacklog += s.marriage?.backlog || 0;

    totalDivorceCur += s.divorce?.current || 0;
    totalDivorceLate += s.divorce?.late || 0;
    totalDivorceBacklog += s.divorce?.backlog || 0;

    totalAdoptionCur += s.adoption?.current || 0;
    totalAdoptionLate += s.adoption?.late || 0;
    totalAdoptionBacklog += s.adoption?.backlog || 0;
  });

  const totalCurrent = totalBirthCur + totalDeathCur + totalMarriageCur + totalDivorceCur + totalAdoptionCur;
  const totalLate = totalBirthLate + totalDeathLate + totalMarriageLate + totalDivorceLate + totalAdoptionLate;
  const totalBacklog = totalBirthBacklog + totalDeathBacklog + totalMarriageBacklog + totalDivorceBacklog + totalAdoptionBacklog;
  const grandTotal = totalCurrent + totalLate + totalBacklog;

  const currentPercent = grandTotal > 0 ? ((totalCurrent / grandTotal) * 100).toFixed(1) : '0';
  const latePercent = grandTotal > 0 ? ((totalLate / grandTotal) * 100).toFixed(1) : '0';
  const backlogPercent = grandTotal > 0 ? ((totalBacklog / grandTotal) * 100).toFixed(1) : '0';
  const ratioStr = totalLate > 0 ? `1 : ${(totalCurrent / totalLate).toFixed(1)}` : 'N/A';

  // Total penalty revenue collected from late registrations (500 ETB for every late registration)
  const penaltyRevenue = totalLate * 500;

  // 1. Service Breakdown rows with exact statutory timeframes
  const serviceBreakdowns = useMemo(() => [
    { 
      type: 'birth' as ServiceType, 
      name: 'የልደት ምዝገባ', 
      current: totalBirthCur, 
      late: totalBirthLate, 
      backlog: totalBirthBacklog,
      limit: 'በተወለደ በ90 ቀናት (የዘገየ፡ 90ቀን-1ዓመት | ነባር፡ >1ዓመት)', 
      ruleShort: 'በ90 ቀናት',
      feeCur: 'ነፃ (0 ብር)', 
      feeLate: '500 ብር' 
    },
    { 
      type: 'death' as ServiceType, 
      name: 'የሞት ምዝገባ', 
      current: totalDeathCur, 
      late: totalDeathLate, 
      backlog: totalDeathBacklog,
      limit: 'ከሞተ እስከ 50 ቀናት (የዘገየ፡ 50ቀን-1ዓመት | ነባር፡ >1ዓመት)', 
      ruleShort: 'እስከ 50 ቀናት',
      feeCur: 'ነፃ (0 ብር)', 
      feeLate: '500 ብር' 
    },
    { 
      type: 'marriage' as ServiceType, 
      name: 'የጋብቻ ምዝገባ', 
      current: totalMarriageCur, 
      late: totalMarriageLate, 
      backlog: totalMarriageBacklog,
      limit: 'በተጋቡ በ30 ቀናት (የዘገየ፡ 31ቀን-1ዓመት | ነባር፡ >1ዓመት)', 
      ruleShort: 'በ30 ቀናት',
      feeCur: 'ነፃ (0 ብር)', 
      feeLate: '500 ብር' 
    },
    { 
      type: 'divorce' as ServiceType, 
      name: 'የፍቺ ምዝገባ', 
      current: totalDivorceCur, 
      late: totalDivorceLate, 
      backlog: totalDivorceBacklog,
      limit: 'በፍቺ ውሳኔ በ30 ቀናት (የዘገየ፡ 31ቀን-1ዓመት | ነባር፡ >1ዓመት)', 
      ruleShort: 'በ30 ቀናት',
      feeCur: 'ነፃ (0 ብር)', 
      feeLate: '500 ብር' 
    },
    { 
      type: 'adoption' as ServiceType, 
      name: 'የጉዲፈቻ ምዝገባ', 
      current: totalAdoptionCur, 
      late: totalAdoptionLate, 
      backlog: totalAdoptionBacklog,
      limit: 'በጉዲፈቻ በ30 ቀናት (የዘገየ፡ 31ቀን-1ዓመት | ነባር፡ >1ዓመት)', 
      ruleShort: 'በ30 ቀናት',
      feeCur: 'ነፃ (0 ብር)', 
      feeLate: '500 ብር' 
    },
  ], [totalBirthCur, totalBirthLate, totalBirthBacklog, totalDeathCur, totalDeathLate, totalDeathBacklog, totalMarriageCur, totalMarriageLate, totalMarriageBacklog, totalDivorceCur, totalDivorceLate, totalDivorceBacklog, totalAdoptionCur, totalAdoptionLate, totalAdoptionBacklog]);

  // 2. 10 Zones Summary for the selected period
  const zoneBreakdowns = useMemo(() => {
    return CENTRAL_ETHIOPIA_ZONES.map(z => {
      const zSubs = filteredSubmissions.filter(s => s.zoneId === z.id);
      let zCur = 0, zLate = 0, zBack = 0;
      let bTot = 0, dTot = 0, mTot = 0, divTot = 0, adTot = 0;

      zSubs.forEach(s => {
        const cur = (s.birth?.current || 0) + (s.death?.current || 0) + (s.marriage?.current || 0) + (s.divorce?.current || 0) + (s.adoption?.current || 0);
        const late = (s.birth?.late || 0) + (s.death?.late || 0) + (s.marriage?.late || 0) + (s.divorce?.late || 0) + (s.adoption?.late || 0);
        const back = (s.birth?.backlog || 0) + (s.death?.backlog || 0) + (s.marriage?.backlog || 0) + (s.divorce?.backlog || 0) + (s.adoption?.backlog || 0);

        zCur += cur;
        zLate += late;
        zBack += back;

        bTot += (s.birth?.current || 0) + (s.birth?.late || 0) + (s.birth?.backlog || 0);
        dTot += (s.death?.current || 0) + (s.death?.late || 0) + (s.death?.backlog || 0);
        mTot += (s.marriage?.current || 0) + (s.marriage?.late || 0) + (s.marriage?.backlog || 0);
        divTot += (s.divorce?.current || 0) + (s.divorce?.late || 0) + (s.divorce?.backlog || 0);
        adTot += (s.adoption?.current || 0) + (s.adoption?.late || 0) + (s.adoption?.backlog || 0);
      });

      const zTot = zCur + zLate + zBack;
      const zCurRate = zTot > 0 ? ((zCur / zTot) * 100).toFixed(1) : '0.0';
      const zLateRate = zTot > 0 ? ((zLate / zTot) * 100).toFixed(1) : '0.0';

      return {
        id: z.id,
        name: z.name,
        capital: z.capital,
        woredas: z.woredasCount,
        kebeles: z.kebelesCount,
        current: zCur,
        late: zLate,
        backlog: zBack,
        total: zTot,
        currentRate: `${zCurRate}%`,
        lateRate: `${zLateRate}%`,
        birth: bTot,
        death: dTot,
        marriage: mTot,
        divorce: divTot,
        adoption: adTot,
      };
    });
  }, [filteredSubmissions]);

  // 3. Monthly trend for selected year (Full 12 months)
  const monthlyTrendData = useMemo(() => {
    return ETHIOPIAN_MONTHS.slice(0, 12).map((mName, idx) => {
      const mNum = idx + 1;
      const mSubs = submissions.filter(s => s.year === selectedYear && s.month === mNum && (selectedZone === 'all' || s.zoneName === selectedZone));
      let c = 0, l = 0, b = 0;
      mSubs.forEach(s => {
        c += (s.birth?.current || 0) + (s.death?.current || 0) + (s.marriage?.current || 0) + (s.divorce?.current || 0) + (s.adoption?.current || 0);
        l += (s.birth?.late || 0) + (s.death?.late || 0) + (s.marriage?.late || 0) + (s.divorce?.late || 0) + (s.adoption?.late || 0);
        b += (s.birth?.backlog || 0) + (s.death?.backlog || 0) + (s.marriage?.backlog || 0) + (s.divorce?.backlog || 0) + (s.adoption?.backlog || 0);
      });
      return {
        month: mName,
        monthNum: mNum,
        ወቅታዊ: c,
        የዘገየ: l,
        ነባር: b,
        ጠቅላላ: c + l + b,
      };
    });
  }, [submissions, selectedYear, selectedZone]);

  // 4. Vital Events Distribution Data for Pie Chart
  const eventDistributionPieData = useMemo(() => [
    { name: 'ልደት (Birth)', value: totalBirthCur + totalBirthLate + totalBirthBacklog, color: EVENT_COLORS.birth, percent: grandTotal ? Math.round(((totalBirthCur + totalBirthLate + totalBirthBacklog) / grandTotal) * 100) : 0 },
    { name: 'ሞት (Death)', value: totalDeathCur + totalDeathLate + totalDeathBacklog, color: EVENT_COLORS.death, percent: grandTotal ? Math.round(((totalDeathCur + totalDeathLate + totalDeathBacklog) / grandTotal) * 100) : 0 },
    { name: 'ጋብቻ (Marriage)', value: totalMarriageCur + totalMarriageLate + totalMarriageBacklog, color: EVENT_COLORS.marriage, percent: grandTotal ? Math.round(((totalMarriageCur + totalMarriageLate + totalMarriageBacklog) / grandTotal) * 100) : 0 },
    { name: 'ፍቺ (Divorce)', value: totalDivorceCur + totalDivorceLate + totalDivorceBacklog, color: EVENT_COLORS.divorce, percent: grandTotal ? Math.round(((totalDivorceCur + totalDivorceLate + totalDivorceBacklog) / grandTotal) * 100) : 0 },
    { name: 'ጉዲፈቻ (Adoption)', value: totalAdoptionCur + totalAdoptionLate + totalAdoptionBacklog, color: EVENT_COLORS.adoption, percent: grandTotal ? Math.round(((totalAdoptionCur + totalAdoptionLate + totalAdoptionBacklog) / grandTotal) * 100) : 0 },
  ].filter(i => i.value > 0), [totalBirthCur, totalBirthLate, totalBirthBacklog, totalDeathCur, totalDeathLate, totalDeathBacklog, totalMarriageCur, totalMarriageLate, totalMarriageBacklog, totalDivorceCur, totalDivorceLate, totalDivorceBacklog, totalAdoptionCur, totalAdoptionLate, totalAdoptionBacklog, grandTotal]);

  // Top zone for selected period
  const topZone = useMemo(() => {
    const sorted = [...zoneBreakdowns].sort((a, b) => b.total - a.total);
    return sorted[0] && sorted[0].total > 0 ? sorted[0] : null;
  }, [zoneBreakdowns]);

  // Period label string
  const currentPeriodLabel = useMemo(() => {
    const fyLabel = selectedYear === 2019 ? '2018/2019' : `${selectedYear - 1}/${selectedYear}`;
    const startYear = selectedYear === 2019 ? '2018' : String(selectedYear - 1);

    if (timeRange === 'monthly') {
      return `${ETHIOPIAN_MONTHS[selectedMonth - 1]} ወር ${selectedYear} ዓ.ም`;
    } else if (timeRange === 'quarterly') {
      if (selectedQuarter === 1) return `1ኛ ሩብ ዓመት (ከሐምሌ 1 እስከ መስከረም 30) - የ${fyLabel} በጀት ዓመት`;
      if (selectedQuarter === 2) return `2ኛ ሩብ ዓመት (ከጥቅምት 1 እስከ ታኅሣሥ 30) - የ${fyLabel} በጀት ዓመት`;
      if (selectedQuarter === 3) return `3ኛ ሩብ ዓመት (ከጥር 1 እስከ መጋቢት 30) - የ${fyLabel} በጀት ዓመት`;
      if (selectedQuarter === 4) return `4ኛ ሩብ ዓመት (ከሚያዝያ 1 እስከ ሰኔ 30) - የ${fyLabel} በጀት ዓመት`;
    }
    return `የ${fyLabel} በጀት ዓመት (ከሐምሌ 1/${startYear} ዓ.ም እስከ ሰኔ 30/${selectedYear} ዓ.ም)`;
  }, [timeRange, selectedMonth, selectedQuarter, selectedYear]);

  // 1. Export PDF using jsPDF
  const handleDownloadPDF = async () => {
    try {
      setIsExportingPDF(true);
      const safePeriodName = timeRange === 'monthly'
        ? ETHIOPIAN_MONTHS[selectedMonth - 1]
        : timeRange === 'quarterly'
        ? selectedQuarter === 1
          ? '1ኛ_ሩብ_ዓመት_ሐምሌ_መስከረም'
          : selectedQuarter === 2
          ? '2ኛ_ሩብ_ዓመት_ጥቅምት_ታኅሣሥ'
          : selectedQuarter === 3
          ? '3ኛ_ሩብ_ዓመት_ጥር_መጋቢት'
          : '4ኛ_ሩብ_ዓመት_ሚያዝያ_ሰኔ'
        : `የ${selectedYear === 2019 ? '2018_2019' : `${selectedYear - 1}_${selectedYear}`}_በጀት_ዓመት`;

      const docFilename = isZoneOfficer && activeZoneAccount
        ? `የ${activeZoneAccount.name}_ወሳኝ_ኩነቶች_ይፋዊ_ሪፖርት_${selectedYear}_${safePeriodName}`
        : `የማዕከላዊ_ኢትዮጵያ_ወሳኝ_ኩነቶች_ይፋዊ_ሪፖርት_${selectedYear}_${safePeriodName}`;

      const docTitle = isZoneOfficer && activeZoneAccount
        ? `የ${activeZoneAccount.name} የወሳኝ ኩነቶች ይፋዊ ሪፖርት (${currentPeriodLabel})`
        : `የማዕከላዊ ኢትዮጵያ ክልል የወሳኝ ኩነቶች ሪፖርት (${currentPeriodLabel})`;

      const docAuthor = isZoneOfficer && activeZoneAccount
        ? `የ${activeZoneAccount.name} የወሳኝ ኩነቶች አስተባባሪ ጽሕፈት ቤት`
        : 'የማዕከላዊ ኢትዮጵያ ክልል የወሳኝ ኩነቶች ምዝገባና መረጃ ኤጀንሲ';

      await generatePDFFromElement({
        elementId: 'official-pdf-report-container',
        filename: docFilename,
        title: docTitle,
        periodLabel: currentPeriodLabel,
        year: selectedYear,
        generatedDateEth: ethToday.fullFormatted,
        author: docAuthor
      });

      onAddAuditLog('REPORT_PDF_GENERATE', `${isZoneOfficer ? activeZoneAccount?.name : 'የክልሉ'} የ${currentPeriodLabel} ይፋዊ የወሳኝ ኩነቶች ሪፖርት በjsPDF አመነጨ`);
      setPdfSuccessNotice(`የ${currentPeriodLabel} ይፋዊ ፒዲኤፍ (PDF) ሰነድ በከፍተኛ ጥራት ተዘጋጅቶ ወርዷል!`);
      setTimeout(() => setPdfSuccessNotice(null), 5000);
    } catch (err) {
      console.error('Failed to generate PDF document:', err);
      alert('የPDF ሰነዱን ማመንጨት አልተቻለም። እባክዎ እንደገና ይሞክሩ።');
    } finally {
      setIsExportingPDF(false);
    }
  };

  // 2. Export PPTX handler
  const handleDownloadPPTX = async () => {
    try {
      setIsExportingPPTX(true);
      const fyLabel = selectedYear === 2019 ? '2018/2019' : `${selectedYear - 1}/${selectedYear}`;
      const periodLabel = timeRange === 'monthly'
        ? `${ETHIOPIAN_MONTHS[selectedMonth - 1]} ወር`
        : timeRange === 'quarterly'
        ? selectedQuarter === 1
          ? '1ኛ ሩብ ዓመት (ከሐምሌ 1 እስከ መስከረም 30)'
          : selectedQuarter === 2
          ? '2ኛ ሩብ ዓመት (ከጥቅምት 1 እስከ ታኅሣሥ 30)'
          : selectedQuarter === 3
          ? '3ኛ ሩብ ዓመት (ከጥር 1 እስከ መጋቢት 30)'
          : '4ኛ ሩብ ዓመት (ከሚያዝያ 1 እስከ ሰኔ 30)'
        : `የ${fyLabel} በጀት ዓመት (ከሐምሌ 1/${selectedYear === 2019 ? '2018' : selectedYear - 1} እስከ ሰኔ 30/${selectedYear} ዓ.ም)`;

      const pptxTitle = isZoneOfficer && activeZoneAccount
        ? `የ${activeZoneAccount.name} - ${periodLabel}`
        : periodLabel;

      await generatePowerPointReport({
        submissions: filteredSubmissions,
        monthName: pptxTitle,
        year: selectedYear,
        selectedZone: isZoneOfficer && activeZoneAccount ? activeZoneAccount.name : selectedZone,
        selectedService,
      });

      onAddAuditLog('MONTHLY_PPTX_GENERATE', `${isZoneOfficer ? activeZoneAccount?.name : 'የክልሉ'} የ${periodLabel} ${selectedYear} ዓ.ም የወሳኝ ኩነቶች ሪፖርት በፓወር ፖይንት (PPTX) አመነጨ`);
    } catch (err) {
      console.error('Failed to generate PPTX', err);
    } finally {
      setIsExportingPPTX(false);
    }
  };

  // 3. Export CSV handler
  const handleExportCSV = () => {
    const periodLabel = timeRange === 'monthly' 
      ? ETHIOPIAN_MONTHS[selectedMonth - 1] 
      : timeRange === 'quarterly'
      ? `ሩብ_ዓመት_${selectedQuarter}`
      : `የ${selectedYear === 2019 ? '2018_2019' : `${selectedYear - 1}_${selectedYear}`}_በጀት_ዓመት`;

    const csvFilename = isZoneOfficer && activeZoneAccount
      ? `የ${activeZoneAccount.name}_ወሳኝ_ኩነቶች_${periodLabel}`
      : `የማዕከላዊ_ኢትዮጵያ_ወሳኝ_ኩነቶች_${periodLabel}`;

    exportZoneSubmissionsToCSV(filteredSubmissions, csvFilename);
    onAddAuditLog('REPORT_EXPORT_CSV', `${isZoneOfficer ? activeZoneAccount?.name : 'የክልሉ'} የ${periodLabel} ወርሃዊ ሪፖርት በCSV አወረደ`);
  };

  // 4. Browser Print handler
  const handlePrint = () => {
    setActiveSubTab('pdfPreview');
    setTimeout(() => {
      window.print();
      onAddAuditLog('REPORT_PRINT_PDF', `${isZoneOfficer ? activeZoneAccount?.name : 'የማዕከላዊ ኢትዮጵያ'} ወሳኝ ኩነቶች ሪፖርት ለህትመት/PDF አዘጋጀ`);
    }, 200);
  };

  // =========================================================================
  // ROLE GUARD FOR CITIZENS / PUBLIC:
  // "ከዋና አስተዳደሪው(admin) ውጭ ያሉት ዞኖች አጠቃላይ ሪፖርት ማየት የለባቸውም ። የራሳቸውን ብቻ መላክ፣ማየት፣ፕሪንት ማድረግ እንዲችሉ አድርግ።"
  // Citizens cannot see internal administrative zonal dossiers; provide educational statutory info & login link
  // =========================================================================
  if (isCitizen) {
    return (
      <div className="space-y-8 pb-16">
        {/* Security & Access Restriction Banner */}
        <div className="rounded-2xl border border-amber-300 bg-amber-50/80 backdrop-blur-md p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
              <Lock className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>የደህንነትና የመረጃ ገደብ (Role-Based Security)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                የክልሉ አጠቃላይ የዞኖች ሪፖርት ማዕከል
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-3xl">
                በማዕከላዊ ኢትዮጵያ ክልል ሲቪልና ቤተሰብ ምዝገባ ኤጀንሲ መመሪያ መሠረት፤ ከዋና አስተዳዳሪው (Regional Admin) ውጭ ያሉ ዞኖች አጠቃላይ ሪፖርት ማየት አይችሉም። ዞኖች የራሳቸውን ሪፖርት ብቻ መላክ፣ ማየትና ማተም የተፈቀደላቸው ሲሆን፤ ዝርዝር የ10ሩ ዞኖች ማጠቃለያ የተጠበቀ ነው።
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-600" />
                <span>የዞን አስተባባሪ ነዎት? (Zone Officer)</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                የዞንዎን ወርሃዊ ሪፖርት ለክልሉ ለመላክ፣ ያለፉትን ሪፖርቶች ለመመልከት እና ይፋዊ የዞንዎን ሰነድ ለማተም (Print) በመለያዎ ይግቡ።
              </p>
              <button
                onClick={onOpenLoginModal}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>መግቢያ/Login (የዞን መለያ)</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-600" />
                <span>የክልሉ ዋና አስተዳዳሪ ነዎት? (Regional Admin)</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                የ10ሩንም ዞኖች አጠቃላይ መረጃዎች፣ ንፅፅሮች፣ የፓወር ፖይንትና ፒዲኤፍ ማመንጫዎች ሙሉ ፈቃድ ለማግኘት በአስተዳዳሪ መለያዎ ይግቡ።
              </p>
              <button
                onClick={onOpenLoginModal}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>መግቢያ/Login (የዋና አስተዳዳሪ መለያ)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Public Citizen Educational Section: The 5 Statutory Limits */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Info className="h-5 w-5 text-emerald-600" />
              <span>የወሳኝ ኩነቶች ህጋዊ የምዝገባ ጊዜ ገደቦችና ክፍያዎች (ለህዝብ ይፋ የሆነ)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              በአዋጅ ቁጥር 760/2004 እና በማዕከላዊ ኢትዮጵያ ክልል ደንብ መሠረት እያንዳንዱ ዜጋ ኩነቱ በተከሰተበት የጊዜ ገደብ ውስጥ በነፃ መመዝገብ አለበት።
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Birth 90d */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Baby className="h-4 w-4 text-emerald-600" />
                  <span>የልደት ምዝገባ</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold font-mono">በ90 ቀናት</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                • <strong>ወቅታዊ ምዝገባ</strong>፡ በተወለደ በ90 ቀናት (ነፃ / 0 ብር)<br />
                • <strong>የዘገየ ምዝገባ</strong>፡ ከ90 ቀን እስከ 1 ዓመት (500 ብር ቅጣት)<br />
                • <strong>ነባር ምዝገባ</strong>፡ ከ1 ዓመት በኋላ (በሕግ ማስረጃ)
              </p>
            </div>

            {/* Death 50d */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <FileCheck2 className="h-4 w-4 text-rose-600" />
                  <span>የሞት ምዝገባ</span>
                </span>
                <span className="text-[10px] bg-rose-100 text-rose-900 px-2 py-0.5 rounded font-bold font-mono">እስከ 50 ቀናት</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                • <strong>ወቅታዊ ምዝገባ</strong>፡ ከሞተ እስከ 50 ቀናት (ነፃ / 0 ብር)<br />
                • <strong>የዘገየ ምዝገባ</strong>፡ ከ50 ቀን እስከ 1 ዓመት (500 ብር ቅጣት)<br />
                • <strong>ነባር ምዝገባ</strong>፡ ከ1 ዓመት በኋላ (በሕግ ማስረጃ)
              </p>
            </div>

            {/* Marriage 30d */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-cyan-600" />
                  <span>የጋብቻ ምዝገባ</span>
                </span>
                <span className="text-[10px] bg-cyan-100 text-cyan-900 px-2 py-0.5 rounded font-bold font-mono">በ30 ቀናት</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                • <strong>ወቅታዊ ምዝገባ</strong>፡ በተጋቡ በ30 ቀናት (ነፃ / 0 ብር)<br />
                • <strong>የዘገየ ምዝገባ</strong>፡ ከ31 ቀን እስከ 1 ዓመት (500 ብር ቅጣት)<br />
                • <strong>ነባር ምዝገባ</strong>፡ ከ1 ዓመት በኋላ
              </p>
            </div>

            {/* Divorce 30d */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <HeartHandshake className="h-4 w-4 text-amber-600" />
                  <span>የፍቺ ምዝገባ</span>
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold font-mono">በ30 ቀናት</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                • <strong>ወቅታዊ ምዝገባ</strong>፡ በፍቺ ውሳኔ በ30 ቀናት (ነፃ / 0 ብር)<br />
                • <strong>የዘገየ ምዝገባ</strong>፡ ከ31 ቀን እስከ 1 ዓመት (500 ብር ቅጣት)<br />
                • <strong>ነባር ምዝገባ</strong>፡ ከ1 ዓመት በኋላ
              </p>
            </div>

            {/* Adoption 30d */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-purple-600" />
                  <span>የጉዲፈቻ ምዝገባ</span>
                </span>
                <span className="text-[10px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-bold font-mono">በ30 ቀናት</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                • <strong>ወቅታዊ ምዝገባ</strong>፡ በውሳኔ በ30 ቀናት (ነፃ / 0 ብር)<br />
                • <strong>የዘገየ ምዝገባ</strong>፡ ከ31 ቀን እስከ 1 ዓመት (500 ብር ቅጣት)<br />
                • <strong>ነባር ምዝገባ</strong>፡ ከ1 ዓመት በኋላ
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {onSelectTab && (
              <button
                onClick={() => onSelectTab('services')}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                ወደ አገልግሎቶች ዝርዝር ሂድ
              </button>
            )}
            <button
              onClick={onOpenLoginModal}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shadow-xs"
            >
              መግቢያ/Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/90 pb-6 no-print">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 mb-2 shadow-xs">
            <BarChart3 className="h-3.5 w-3.5 text-emerald-600" />
            <span>
              {isZoneOfficer && activeZoneAccount 
                ? `የ${activeZoneAccount.name} የወሳኝ ኩነቶች ይፋዊ ሪፖርት ማዕከል`
                : 'የማዕከላዊ ኢትዮጵያ ክልል የወሳኝ ኩነቶች ሪፖርት ማመንጫ'
              }
            </span>
            <span className="text-emerald-700 font-mono ml-2 border-l border-emerald-300 pl-2">ዛሬ፡ {ethToday.fullFormatted}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isZoneOfficer && activeZoneAccount
              ? `የ${activeZoneAccount.name} ወርሃዊ የትንታኔ ሪፖርትና ማተሚያ`
              : 'የዞኖች ወርሃዊ የትንታኔ ሪፖርትና የሰነድ ማመንጫ'
            }
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            {isZoneOfficer && activeZoneAccount
              ? `የ${activeZoneAccount.name} ወሳኝ ኩነቶች ምዝገባ ብቻ ይፋዊ መረጃ በፒዲኤፍ (PDF)፣ በፓወር ፖይንት (.pptx)፣ በCSV እና በአሳሽ ህትመት (Print) ማመንጫ። በክልሉ መመሪያ መሠረት የሌሎች ዞኖች መረጃ ተገድቧል።`
              : 'ከ10ሩም ዞኖች (ሀላባ፣ ሀዲያ፣ ጉራጌ፣ ምሥራቅ ጉራጌ፣ ስልጤ፣ ከምባታ፣ የም፣ ማረቆ፣ ጠምባሮ እና ቀቤና) የተላኩ መረጃዎችን በይፋዊ ፒዲኤፍ (PDF በjsPDF)፣ በፓወር ፖይንት (.pptx) እና በCSV ማመንጫ።'
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* PRIMARY ACTION: Download PDF using jsPDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={isExportingPDF}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
            title="ይፋዊ የPDF ሰነድ ማመንጨት በjsPDF"
          >
            <FileDown className="h-4 w-4" />
            <span>{isExportingPDF ? 'PDF እየተዘጋጀ ነው...' : 'PDF አውርድ (jsPDF)'}</span>
          </button>

          {/* PPTX Download */}
          <button
            onClick={handleDownloadPPTX}
            disabled={isExportingPPTX}
            className="flex items-center gap-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3.5 py-2.5 text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="ፓወር ፖይንት ሪፖርት ማመንጨት"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>{isExportingPPTX ? 'እያመነጨ ነው...' : 'PPTX (.pptx)'}</span>
          </button>

          {/* CSV Download */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition-colors cursor-pointer"
            title="CSV ፋይል አውርድ"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>CSV</span>
          </button>

          {/* Ethiopian Calendar Converter Toggle */}
          <button
            onClick={() => setShowConverter(!showConverter)}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs"
            title="የኢትዮጵያ እና ፈረንጆች ካላንደር መለወጫ"
          >
            <ArrowRightLeft className="h-4 w-4 text-emerald-600" />
            <span>{showConverter ? 'መለወጫውን ደብቅ' : 'የቀን መለወጫ'}</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition-colors cursor-pointer"
            title="በአሳሽ አትም"
          >
            <Printer className="h-4 w-4 text-cyan-600" />
            <span>አትም</span>
          </button>
        </div>
      </div>

      {/* PDF Generation Success Alert */}
      {pdfSuccessNotice && (
        <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs font-semibold flex items-center justify-between gap-3 shadow-md no-print">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{pdfSuccessNotice}</span>
          </div>
          <button
            onClick={() => setPdfSuccessNotice(null)}
            className="text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
          >
            ዝጋ
          </button>
        </div>
      )}

      {/* Optional Ethiopian Calendar Converter */}
      {showConverter && (
        <div className="no-print">
          <EthiopianCalendarConverterWidget />
        </div>
      )}

      {/* Filter Parameters */}
      <section className="rounded-2xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-5 space-y-4 shadow-sm no-print">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-emerald-800 flex items-center gap-1.5 uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5 text-emerald-600" />
            <span>የሪፖርት መምረጫ መስፈርቶች</span>
          </span>
          <span className="text-slate-600 font-mono text-[11px]">
            የተካተቱ ዞኖች ሪፖርት፡ <strong className="text-slate-900">{filteredSubmissions.length}</strong> | የጊዜ ወቅት፡ <span className="text-emerald-700 font-bold">{currentPeriodLabel}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Cadence */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">የሪፖርት እርከን</label>
            <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1">
              {[
                { id: 'monthly', label: 'ወርሃዊ' },
                { id: 'quarterly', label: 'ሩብ ዓመት' },
                { id: 'yearly', label: 'የበጀት ዓመት' },
              ].map(cad => (
                <button
                  key={cad.id}
                  onClick={() => setTimeRange(cad.id as any)}
                  className={`flex-1 py-1 text-[11px] font-bold rounded cursor-pointer transition-colors ${
                    timeRange === cad.id ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cad.label}
                </button>
              ))}
            </div>
          </div>

          {/* Year */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">ዓመተ ምህረት (በጀት ዓመት)</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none font-mono shadow-xs"
            >
              <option value={2019}>2018/2019 በጀት ዓመት (የአሁኑ)</option>
              <option value={2018}>2017/2018 በጀት ዓመት</option>
              <option value={2017}>2016/2017 በጀት ዓመት</option>
            </select>
          </div>

          {/* Month / Quarter */}
          {timeRange === 'monthly' ? (
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">የሪፖርት ወር</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none shadow-xs"
              >
                {ETHIOPIAN_MONTHS.slice(0, 12).map((m, idx) => (
                  <option key={idx} value={idx + 1}>{m} ወር ({idx + 1})</option>
                ))}
              </select>
            </div>
          ) : timeRange === 'quarterly' ? (
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">የበጀት ዓመት ሩብ ዓመት</label>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none shadow-xs font-sans"
              >
                <option value={1}>1ኛ ሩብ ዓመት (ከሐምሌ 1 እስከ መስከረም 30)</option>
                <option value={2}>2ኛ ሩብ ዓመት (ከጥቅምት 1 እስከ ታኅሣሥ 30)</option>
                <option value={3}>3ኛ ሩብ ዓመት (ከጥር 1 እስከ መጋቢት 30)</option>
                <option value={4}>4ኛ ሩብ ዓመት (ከሚያዝያ 1 እስከ ሰኔ 30)</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">የበጀት ዓመት ዘመን</label>
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-[11px] text-emerald-800 font-bold leading-tight font-mono">
                ከሐምሌ 1/{selectedYear === 2019 ? '2018' : selectedYear - 1} እስከ ሰኔ 30/{selectedYear} ዓ.ም
              </div>
            </div>
          )}

          {/* Zone Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              {isZoneOfficer ? 'የእርስዎ ዞን (የተቆለፈ / የተፈቀደ)' : 'ዞን / ልዩ ወረዳ ይምረጡ'}
            </label>
            {isZoneOfficer && activeZoneAccount ? (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-950 shadow-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{activeZoneAccount.name}</span>
                <span className="ml-auto text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-mono font-bold">የዞኑ ብቻ</span>
              </div>
            ) : (
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none shadow-xs"
              >
                <option value="all">ሁሉም 10ሩ ዞኖችና ልዩ ወረዳዎች (ሀላባን ጨምሮ)</option>
                {CENTRAL_ETHIOPIA_ZONES.map(z => (
                  <option key={z.id} value={z.name}>{z.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Service Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">የወሳኝ ኩነት ዓይነት</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value as any)}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none shadow-xs"
            >
              <option value="all">ሁሉም ኩነቶች (ልደት፣ ሞት፣ ጋብቻ፣ ፍቺ፣ ጉዲፈቻ)</option>
              <option value="birth">የልደት ምዝገባ ብቻ</option>
              <option value="death">የሞት ምዝገባ ብቻ</option>
              <option value="marriage">የጋብቻ ምዝገባ ብቻ</option>
              <option value="divorce">የፍቺ ምዝገባ ብቻ</option>
              <option value="adoption">የጉዲፈቻ ምዝገባ ብቻ</option>
            </select>
          </div>
        </div>

        {/* Fiscal Year Reference Guide Box */}
        <div className="rounded-xl border border-emerald-300/80 bg-emerald-50/70 p-3.5 text-xs text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="space-y-1">
            <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
              <Calendar className="h-4 w-4 text-emerald-700" />
              <span>የኢትዮጵያ በጀት ዓመት አወቃቀር እና የሩብ ዓመታት የጊዜ ሰሌዳ፦</span>
            </span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-emerald-800 font-medium">
              <span>• <strong>1ኛ ሩብ ዓመት</strong>፡ ከሐምሌ 1 እስከ መስከረም 30</span>
              <span>• <strong>2ኛ ሩብ ዓመት</strong>፡ ከጥቅምት 1 እስከ ታኅሣሥ 30</span>
              <span>• <strong>3ኛ ሩብ ዓመት</strong>፡ ከጥር 1 እስከ መጋቢት 30</span>
              <span>• <strong>4ኛ ሩብ ዓመት</strong>፡ ከሚያዝያ 1 እስከ ሰኔ 30</span>
            </div>
          </div>
          <div className="text-[11px] bg-white/90 border border-emerald-300 rounded-lg px-2.5 py-1 text-emerald-800 font-mono font-bold shrink-0">
            የዓመት ሪፖርት ፡ ከሐምሌ 1/2018 ዓ.ም እስከ ሰኔ 30/2019 ዓ.ም
          </div>
        </div>
      </section>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/90 pb-2 no-print">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'analytics'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-emerald-600" />
              <span>የትንታኔ ማጠቃለያና ግራፎች</span>
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('table')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'table'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              <span>{isZoneOfficer && activeZoneAccount ? `የ${activeZoneAccount.name} ያለፉት ወራት ዝርዝር` : 'የዞኖች ዝርዝር ሠንጠረዥ (10 ዞኖች)'}</span>
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('pdfPreview')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'pdfPreview'
                ? 'bg-cyan-50 text-cyan-800 border border-cyan-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-cyan-600" />
              <span>ይፋዊ የPDF ሰነድ ቅድመ-እይታ (Document Preview)</span>
            </span>
          </button>
        </div>

        {/* Quick PDF button in subtabs */}
        <button
          onClick={handleDownloadPDF}
          disabled={isExportingPDF}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
        >
          <FileDown className="h-3.5 w-3.5" />
          <span>ይፋዊ PDF አውርድ</span>
        </button>
      </div>

      {/* TAB 1: ANALYTICS & RECHARTS */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-8 no-print">
          {/* Key Metric Summary Cards (3 Statutory Categories + Total + Revenue) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-4 shadow-sm">
              <span className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">አጠቃላይ የተመዘገቡ</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">{grandTotal.toLocaleString()}</div>
              <span className="text-[10px] text-cyan-700 font-semibold mt-1 block">በ{currentPeriodLabel}</span>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 backdrop-blur-md p-4 shadow-sm">
              <span className="text-[11px] font-semibold uppercase text-emerald-800 tracking-wider">ወቅታዊ (በህጉ ገደብ)</span>
              <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">{totalCurrent.toLocaleString()}</div>
              <span className="text-[10px] text-emerald-800 font-bold mt-1 block">{currentPercent}% በወቅቱ (0 ብር ነፃ)</span>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/90 backdrop-blur-md p-4 shadow-sm">
              <span className="text-[11px] font-semibold uppercase text-amber-800 tracking-wider">የዘገየ (እስከ 1 ዓመት)</span>
              <div className="text-2xl font-bold font-mono text-amber-700 mt-1 tabular-nums">{totalLate.toLocaleString()}</div>
              <span className="text-[10px] text-amber-800 font-bold mt-1 block">{latePercent}% የዘገየ (500 ETB ቅጣት)</span>
            </div>

            <div className="rounded-xl border border-purple-200 bg-purple-50/90 backdrop-blur-md p-4 shadow-sm">
              <span className="text-[11px] font-semibold uppercase text-purple-800 tracking-wider">ነባር (ከ1 ዓመት በኋላ)</span>
              <div className="text-2xl font-bold font-mono text-purple-700 mt-1 tabular-nums">{totalBacklog.toLocaleString()}</div>
              <span className="text-[10px] text-purple-800 font-bold mt-1 block">{backlogPercent}% ከ1 ዓመት በላይ የቆየ</span>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-4 shadow-sm">
              <span className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">የተሰበሰበ የቅጣት ገቢ (ETB)</span>
              <div className="text-2xl font-bold font-mono text-amber-700 mt-1 tabular-nums">{penaltyRevenue.toLocaleString()} ብር</div>
              <span className="text-[10px] text-slate-500 mt-1 block">ከ{totalLate.toLocaleString()} የዘገዩ ምዝገባዎች</span>
            </div>
          </div>

          {/* TWO CHARTS ROW (BAR CHART + PIE CHART) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart 1: Monthly Trend Bar Chart */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-emerald-600" />
                    <span>ወርሃዊ አዝማሚያ፡ ወቅታዊ፣ የዘገየ እና ነባር ምዝገባዎች ({selectedYear} ዓ.ም)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">በ3ቱ ህጋዊ የጊዜ ገደቦች የተመዘገቡ ወሳኝ ኩነቶች</p>
                </div>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="ወቅታዊ" name="ወቅታዊ (0 ብር)" fill="#059669" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="የዘገየ" name="የዘገየ (500 ETB)" fill="#d97706" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ነባር" name="ነባር (>1 ዓመት)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Vital Events Distribution Pie Chart */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-5 space-y-4 shadow-sm">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-cyan-600" />
                  <span>የወሳኝ ኩነቶች ስርጭት በመቶኛ</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">በ{currentPeriodLabel} የተመዘገቡ ኩነቶች</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eventDistributionPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={40}
                      paddingAngle={3}
                    >
                      {eventDistributionPieData.map((entry, index) => (
                        <Cell key={`cell-ev-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Service Breakdown Table */}
          <div className="rounded-2xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  የወሳኝ ኩነቶች ዓይነት ንፅፅር ሰንጠረዥ (በ3ቱ የጊዜ ገደቦች)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ልደት (በ90 ቀን)፣ ሞት (እስከ 50 ቀን)፣ ጋብቻ (በ30 ቀን)፣ ፍቺ (በ30 ቀን) እና ጉዲፈቻ (በ30 ቀን)
                </p>
              </div>
              <span className="text-xs text-emerald-700 font-mono font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                ወቅታዊ፡ 0 ብር (ነፃ) | የዘገየ፡ 500 ETB | ነባር፡ ከ1 ዓመት በኋላ
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">የኩነት ዓይነት</th>
                    <th className="py-2.5 px-3">ህጋዊ የጊዜ ገደብ መስፈርት</th>
                    <th className="py-2.5 px-3 text-right">ወቅታዊ (ነፃ 0 ብር)</th>
                    <th className="py-2.5 px-3 text-right">የዘገየ (እስከ 1 ዓመት)</th>
                    <th className="py-2.5 px-3 text-right">ነባር (ከ1 ዓመት በኋላ)</th>
                    <th className="py-2.5 px-3 text-right">አጠቃላይ ድምር</th>
                    <th className="py-2.5 px-3 text-right">ወቅታዊ ምጣኔ (%)</th>
                    <th className="py-2.5 px-3">ሁኔታ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {serviceBreakdowns.map((sb) => {
                    const tot = sb.current + sb.late + sb.backlog;
                    const curRateNum = tot > 0 ? (sb.current / tot) * 100 : 0;
                    return (
                      <tr key={sb.type} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-sans font-bold text-slate-900">{sb.name}</td>
                        <td className="py-3 px-3 text-slate-600 font-sans text-[11px]">{sb.limit}</td>
                        <td className="py-3 px-3 text-right text-emerald-700 font-bold tabular-nums">{sb.current.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-amber-700 font-bold tabular-nums">{sb.late.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-purple-700 font-bold tabular-nums">{sb.backlog.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-slate-900 font-black tabular-nums">{tot.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-emerald-800 font-bold tabular-nums">{curRateNum.toFixed(1)}%</td>
                        <td className="py-3 px-3 font-sans">
                          {curRateNum >= 75 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>ከፍተኛ ወቅታዊ ምዝገባ</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                              <AlertTriangle className="h-3 w-3" />
                              <span>ማሻሻያ ያስፈልጋል</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TABLE TAB (ZONE'S OWN MONTHLY RECORDS FOR ZONE OFFICERS, OR 10 ZONES BREAKDOWN FOR ADMINS) */}
      {activeSubTab === 'table' && (
        <div className="rounded-2xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-6 space-y-4 no-print shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {isZoneOfficer && activeZoneAccount
                  ? `የ${activeZoneAccount.name} የወሳኝ ኩነቶች ወርሃዊ የሪፖርት መዝገብ ሠንጠረዥ`
                  : 'የማዕከላዊ ኢትዮጵያ ክልል 10ሩም ዞኖች እና ልዩ ወረዳዎች የሪፖርት ሠንጠረዥ'}
              </h3>
              <p className="text-xs text-slate-500">
                {isZoneOfficer && activeZoneAccount
                  ? `በክልሉ መመሪያ መሠረት የ${activeZoneAccount.name} ይፋዊ ሪፖርት ብቻ እዚህ ተካቷል። (የሌሎች ዞኖች መረጃ ተገድቧል)`
                  : 'ሀላባ፣ ሀዲያ፣ ጉራጌ፣ ምሥራቅ ጉራጌ፣ ስልጤ፣ ከምባታ፣ የም፣ ማረቆ፣ ጠምባሮ እና ቀቤና ዞኖች'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-bold cursor-pointer shadow-xs"
              >
                <FileDown className="h-3.5 w-3.5" />
                <span>ይህን ሠንጠረዥ በPDF አውርድ</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                <span>CSV አውርድ</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isZoneOfficer && activeZoneAccount ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider font-mono">
                    <th className="py-2.5 px-3">የሪፖርት ወቅት</th>
                    <th className="py-2.5 px-3 text-right">የልደት (ወቅታዊ/ዘገየ/ነባር)</th>
                    <th className="py-2.5 px-3 text-right">የሞት (ወቅታዊ/ዘገየ/ነባር)</th>
                    <th className="py-2.5 px-3 text-right">የጋብቻ (ወቅታዊ/ዘገየ/ነባር)</th>
                    <th className="py-2.5 px-3 text-right">የፍቺና ጉዲፈቻ</th>
                    <th className="py-2.5 px-3 text-right">አጠቃላይ ድምር</th>
                    <th className="py-2.5 px-3">የወረዳዎች ብዛት</th>
                    <th className="py-2.5 px-3">ሁኔታ</th>
                    <th className="py-2.5 px-3 text-center">ተግባር</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500 font-sans text-xs">
                        ለተመረጠው የጊዜ ወቅት እስካሁን የገባ ሪፖርት የለም።
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub, idx) => {
                      const bCur = sub.birth?.current || 0, bLate = sub.birth?.late || 0, bBack = sub.birth?.backlog || 0;
                      const dCur = sub.death?.current || 0, dLate = sub.death?.late || 0, dBack = sub.death?.backlog || 0;
                      const mCur = sub.marriage?.current || 0, mLate = sub.marriage?.late || 0, mBack = sub.marriage?.backlog || 0;
                      const divCur = sub.divorce?.current || 0, divLate = sub.divorce?.late || 0, divBack = sub.divorce?.backlog || 0;
                      const adCur = sub.adoption?.current || 0, adLate = sub.adoption?.late || 0, adBack = sub.adoption?.backlog || 0;
                      const tot = bCur + bLate + bBack + dCur + dLate + dBack + mCur + mLate + mBack + divCur + divLate + divBack + adCur + adLate + adBack;
                      return (
                        <tr key={`${sub.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 font-sans font-bold text-slate-900">
                            {sub.monthNameAm} {sub.year} ዓ.ም
                          </td>
                          <td className="py-3 px-3 text-right text-slate-700">
                            <span className="text-emerald-700 font-bold">{bCur}</span> / <span className="text-amber-700 font-bold">{bLate}</span> / <span className="text-purple-700 font-bold">{bBack}</span>
                          </td>
                          <td className="py-3 px-3 text-right text-slate-700">
                            <span className="text-emerald-700 font-bold">{dCur}</span> / <span className="text-amber-700 font-bold">{dLate}</span> / <span className="text-purple-700 font-bold">{dBack}</span>
                          </td>
                          <td className="py-3 px-3 text-right text-slate-700">
                            <span className="text-emerald-700 font-bold">{mCur}</span> / <span className="text-amber-700 font-bold">{mLate}</span> / <span className="text-purple-700 font-bold">{mBack}</span>
                          </td>
                          <td className="py-3 px-3 text-right text-slate-700">
                            <span className="text-emerald-700 font-bold">{divCur + adCur}</span> / <span className="text-amber-700 font-bold">{divLate + adLate}</span> / <span className="text-purple-700 font-bold">{divBack + adBack}</span>
                          </td>
                          <td className="py-3 px-3 text-right text-slate-900 font-black">
                            {tot.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 font-sans text-slate-600 text-[11px]">
                            {sub.reportingWoredasCount} ወረዳዎች ({sub.reportingKebelesCount} ቀበሌዎች)
                          </td>
                          <td className="py-3 px-3 font-sans">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {sub.status || 'የተረጋገጠ'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={handlePrint}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-300 text-[11px] font-bold text-slate-700 cursor-pointer transition-colors"
                              title="የዚህን ወር ሪፖርት አትም"
                            >
                              <Printer className="h-3 w-3 text-cyan-600" />
                              <span>አትም</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider font-mono">
                    <th className="py-2.5 px-3">ዞን / ልዩ ወረዳ</th>
                    <th className="py-2.5 px-3">ዋና ከተማ</th>
                    <th className="py-2.5 px-3 text-right">ወረዳዎች</th>
                    <th className="py-2.5 px-3 text-right">ቀበሌዎች</th>
                    <th className="py-2.5 px-3 text-right">ወቅታዊ (0 ብር)</th>
                    <th className="py-2.5 px-3 text-right">የዘገየ (500 ETB)</th>
                    <th className="py-2.5 px-3 text-right">ነባር (&gt;1 ዓመት)</th>
                    <th className="py-2.5 px-3 text-right">አጠቃላይ ድምር</th>
                    <th className="py-2.5 px-3 text-right">ወቅታዊ ምጣኔ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {zoneBreakdowns.map((z) => (
                    <tr key={z.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-sans font-bold text-slate-900">{z.name}</td>
                      <td className="py-3 px-3 font-sans text-slate-600">{z.capital}</td>
                      <td className="py-3 px-3 text-right text-slate-700">{z.woredas}</td>
                      <td className="py-3 px-3 text-right text-slate-600">{z.kebeles}</td>
                      <td className="py-3 px-3 text-right text-emerald-700 font-bold">{z.current.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-amber-700 font-bold">{z.late.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-purple-700 font-bold">{z.backlog.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-slate-900 font-black">{z.total.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-emerald-800 font-bold">{z.currentRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: OFFICIAL PDF DOCUMENT PREVIEW */}
      {activeSubTab === 'pdfPreview' && (
        <div className="rounded-2xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-5 space-y-4 no-print shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-cyan-600" />
                <span>ይፋዊ የPDF ሰነድ ቅድመ-እይታ (Official PDF Document Preview)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                የወረደው PDF ሰነድ የሚያካትታቸው ይፋዊ ማህተሞች፣ ግራፎች እና የማጠቃለያ ሠንጠረዦች ማሳያ።
              </p>
            </div>

            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <FileDown className="h-4 w-4" />
              <span>{isExportingPDF ? 'PDF እየተዘጋጀ ነው...' : 'ይህን ሰነድ በPDF አውርድ (.pdf)'}</span>
            </button>
          </div>

          <div className="p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 overflow-x-auto flex justify-center">
            <p className="text-xs text-slate-600 italic">
              ከዚህ በታች ያለው ሰነድ በjsPDF እና በhtml2canvas የሚቀረጽ እና የሚወርድ ይፋዊ የሪፖርት ገጽ ነው።
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OFFICIAL PDF PRINTABLE & CAPTURABLE REPORT CONTAINER (Captured by jsPDF)   */}
      {/* ========================================================================= */}
      <div 
        id="official-pdf-report-container"
        ref={pdfTemplateRef}
        className={`bg-white text-slate-900 p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-2xl max-w-5xl mx-auto space-y-8 ${
          activeSubTab === 'pdfPreview'
            ? 'block'
            : 'fixed -left-[9999px] top-0 opacity-0 pointer-events-none print:static print:opacity-100 print:pointer-events-auto print:block'
        }`}
        style={{ 
          minWidth: '900px',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          borderColor: '#e2e8f0'
        }}
      >
        {/* Document Header & State Emblem */}
        <div className="border-b-2 border-slate-900 pb-6 text-center space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-left text-[11px] font-mono text-slate-600">
              <div>የሰነድ ቁጥር፡ <strong className="text-slate-900">{isZoneOfficer && activeZoneAccount ? `ማኢ/ወኩ-${activeZoneAccount.id.toUpperCase()}-ሪፖ-${selectedYear}/01` : `ማኢ/ወኩ/ሪፖ-${selectedYear}/042`}</strong></div>
              <div>የተዘጋጀበት ቀን፡ <strong className="text-slate-900">{ethToday.fullFormatted}</strong></div>
              <div>የደህንነት ኮድ፡ <strong className="text-emerald-700">{isZoneOfficer && activeZoneAccount ? `ZONE-${activeZoneAccount.id.toUpperCase()}-AUTH` : `SEC-ETH-${selectedYear}-OK`}</strong></div>
            </div>

            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 text-white flex items-center justify-center font-extrabold shadow-md mb-1">
                <ShieldCheck className="h-9 w-9 text-white" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {isZoneOfficer && activeZoneAccount ? `የ${activeZoneAccount.name} ማህተም` : 'ይፋዊ ማህተም'}
              </span>
            </div>

            <div className="text-right text-[11px] font-mono text-slate-600">
              <div>የሪፖርት ወቅት፡ <strong className="text-slate-900">{currentPeriodLabel}</strong></div>
              <div>{isZoneOfficer && activeZoneAccount ? 'ዞን / ቅርንጫፍ፡' : 'የዞኖች ብዛት፡'} <strong className="text-slate-900">{isZoneOfficer && activeZoneAccount ? activeZoneAccount.name : '10 ዞኖች'}</strong></div>
              <div>ስርዓት፡ <strong className="text-slate-900">CER-CRVS v2.6</strong></div>
            </div>
          </div>

          <div className="pt-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
              የማዕከላዊ ኢትዮጵያ ብሔራዊ ክልላዊ መንግሥት
            </h1>
            <h2 className="text-base sm:text-lg font-bold text-emerald-800">
              {isZoneOfficer && activeZoneAccount
                ? `የ${activeZoneAccount.name} ቅርንጫፍ ጽሕፈት ቤት ይፋዊ የወሳኝ ኩነቶች ወርሃዊ ሪፖርት`
                : 'የወሳኝ ኩነቶች ምዝገባና ማህበረሰብ ስታትስቲክስ መረጃ ኤጀንሲ'
              }
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl mx-auto pt-1">
              {isZoneOfficer && activeZoneAccount
                ? `በ${activeZoneAccount.name} ዞን የተመዘገቡ ወሳኝ ኩነቶች (ልደት፣ ሞት፣ ጋብቻ፣ ፍቺና ጉዲፈቻ) ይፋዊ የትንታኔ ሰነድ`
                : 'በ10ሩም ዞኖች (ሀላባ፣ ሀዲያ፣ ጉራጌ፣ ምሥራቅ ጉራጌ፣ ስልጤ፣ ከምባታ፣ የም፣ ማረቆ፣ ጠምባሮ እና ቀቤና) የተመዘገቡ ወሳኝ ኩነቶች ይፋዊ ወርሃዊ የትንታኔ ሪፖርት'
              }
            </p>
          </div>
        </div>

        {/* Executive Summary Cards in PDF (5 Key Indicators) */}
        <div className="grid grid-cols-5 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-600 block">አጠቃላይ የተመዘገቡ</span>
            <div className="text-xl font-black text-slate-950 font-mono mt-1">{grandTotal.toLocaleString()}</div>
            <span className="text-[9px] text-slate-500 block mt-0.5">በ{currentPeriodLabel}</span>
          </div>

          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3.5 text-center">
            <span className="text-[10px] font-bold uppercase text-emerald-800 block">ወቅታዊ (በወቅቱ)</span>
            <div className="text-xl font-black text-emerald-700 font-mono mt-1">{totalCurrent.toLocaleString()}</div>
            <span className="text-[9px] text-emerald-800 font-bold block mt-0.5">{currentPercent}% (ነፃ - 0 ብር)</span>
          </div>

          <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-center">
            <span className="text-[10px] font-bold uppercase text-amber-800 block">የዘገየ (እስከ 1 ዓመት)</span>
            <div className="text-xl font-black text-amber-700 font-mono mt-1">{totalLate.toLocaleString()}</div>
            <span className="text-[9px] text-amber-800 font-bold block mt-0.5">{latePercent}% (በ500 ETB)</span>
          </div>

          <div className="rounded-xl border border-purple-300 bg-purple-50 p-3.5 text-center">
            <span className="text-[10px] font-bold uppercase text-purple-800 block">ነባር (ከ1 ዓመት በኋላ)</span>
            <div className="text-xl font-black text-purple-700 font-mono mt-1">{totalBacklog.toLocaleString()}</div>
            <span className="text-[9px] text-purple-800 font-bold block mt-0.5">{backlogPercent}% (&gt;1 ዓመት የቆየ)</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-600 block">የተሰበሰበ የቅጣት ገቢ</span>
            <div className="text-xl font-black text-slate-900 font-mono mt-1">{penaltyRevenue.toLocaleString()} ብር</div>
            <span className="text-[9px] text-slate-500 block mt-0.5">ህጋዊ የቅጣት ገቢ</span>
          </div>
        </div>

        {/* PDF SECTION 1: CHART VISUALIZATION */}
        <div className="space-y-4 border border-slate-200 rounded-xl p-5 bg-slate-50/50">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-700" />
              <span>ክፍል 1፦ የወርሃዊ ምዝገባ አዝማሚያ (ወቅታዊ፣ የዘገየ፣ ነባር) እና የወሳኝ ኩነቶች ስርጭት</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">ዓመተ ምህረት፡ {selectedYear} ዓ.ም</span>
          </div>

          {/* Clean High-Resolution Bar & Proportion Visualizer for Print Capture */}
          <div className="grid grid-cols-12 gap-6 items-center">
            <div className="col-span-7 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">የወራቶች ንፅፅር በ3ቱ የጊዜ ገደቦች፡</span>
              <div className="space-y-2">
                {monthlyTrendData.slice(0, 6).map((m, idx) => {
                  const mTot = (m.ወቅታዊ + m.የዘገየ + m.ነባር) || 1;
                  const cRatio = (m.ወቅታዊ / mTot) * 100;
                  const lRatio = (m.የዘገየ / mTot) * 100;
                  const bRatio = (m.ነባር / mTot) * 100;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-800">{m.month} ወር</span>
                        <span className="font-mono text-slate-600">
                          ድምር፡ <strong className="text-slate-900">{m.ጠቅላላ.toLocaleString()}</strong> (ወቅታዊ፡ {m.ወቅታዊ} | የዘገየ፡ {m.የዘገየ} | ነባር፡ {m.ነባር})
                        </span>
                      </div>
                      <div className="h-3.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                        <div style={{ width: `${cRatio}%` }} className="bg-emerald-600 h-full" title="ወቅታዊ" />
                        <div style={{ width: `${lRatio}%` }} className="bg-amber-500 h-full" title="የዘገየ" />
                        <div style={{ width: `${bRatio}%` }} className="bg-purple-600 h-full" title="ነባር" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 text-[10px] font-bold pt-1">
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <div className="h-3 w-3 bg-emerald-600 rounded-sm" />
                  <span>ወቅታዊ (0 ብር - ነፃ)</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-800">
                  <div className="h-3 w-3 bg-amber-500 rounded-sm" />
                  <span>የዘገየ (እስከ 1 ዓመት - 500 ETB)</span>
                </div>
                <div className="flex items-center gap-1.5 text-purple-800">
                  <div className="h-3 w-3 bg-purple-600 rounded-sm" />
                  <span>ነባር (ከ1 ዓመት በኋላ)</span>
                </div>
              </div>
            </div>

            {/* Vital Events Share List */}
            <div className="col-span-5 bg-white p-4 rounded-xl border border-slate-200 space-y-2.5">
              <span className="text-xs font-bold text-slate-900 block border-b border-slate-100 pb-1.5">
                የወሳኝ ኩነቶች ድርሻ በመቶኛ፡
              </span>
              {eventDistributionPieData.map((ev, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ev.color }} />
                    <span>{ev.name.split(' ')[0]}</span>
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-500 text-[11px]">{ev.value.toLocaleString()}</span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                      {ev.percent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PDF SECTION 2: SERVICE BREAKDOWN SUMMARY TABLE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-300 pb-2">
            <h3 className="text-sm font-bold text-slate-900">
              ክፍል 2፦ የወሳኝ ኩነቶች ዓይነት ንፅፅር ማጠቃለያ ሠንጠረዥ (በ3ቱ የጊዜ ገደቦች)
            </h3>
            <span className="text-[11px] text-slate-500">ተመን፡ ወቅታዊ 0 ብር | የዘገየ 500 ብር | ነባር &gt;1 ዓመት</span>
          </div>

          <table className="w-full text-left text-xs border border-slate-200 border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-2 px-3 border border-slate-200">የኩነት ዓይነት</th>
                <th className="py-2 px-3 border border-slate-200">ህጋዊ የጊዜ ገደብ መስፈርት</th>
                <th className="py-2 px-3 border border-slate-200 text-right">ወቅታዊ (0 ብር)</th>
                <th className="py-2 px-3 border border-slate-200 text-right">የዘገየ (እስከ 1 ዓመት)</th>
                <th className="py-2 px-3 border border-slate-200 text-right">ነባር (&gt;1 ዓመት)</th>
                <th className="py-2 px-3 border border-slate-200 text-right">አጠቃላይ ድምር</th>
                <th className="py-2 px-3 border border-slate-200 text-right">ወቅታዊ ምጣኔ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {serviceBreakdowns.map((sb, idx) => {
                const tot = sb.current + sb.late + sb.backlog;
                const curRatio = tot > 0 ? ((sb.current / tot) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="py-2 px-3 border border-slate-200 font-sans font-bold text-slate-900">{sb.name}</td>
                    <td className="py-2 px-3 border border-slate-200 text-slate-600 font-sans text-[11px]">{sb.limit}</td>
                    <td className="py-2 px-3 border border-slate-200 text-right text-emerald-700 font-bold">{sb.current.toLocaleString()}</td>
                    <td className="py-2 px-3 border border-slate-200 text-right text-amber-700 font-bold">{sb.late.toLocaleString()}</td>
                    <td className="py-2 px-3 border border-slate-200 text-right text-purple-700 font-bold">{sb.backlog.toLocaleString()}</td>
                    <td className="py-2 px-3 border border-slate-200 text-right text-slate-900 font-black">{tot.toLocaleString()}</td>
                    <td className="py-2 px-3 border border-slate-200 text-right font-bold text-emerald-800">{curRatio}%</td>
                  </tr>
                );
              })}
              <tr className="bg-slate-100 font-bold">
                <td colSpan={2} className="py-2 px-3 border border-slate-200 font-sans text-slate-900">ጠቅላላ ድምር</td>
                <td className="py-2 px-3 border border-slate-200 text-right text-emerald-800 font-black">{totalCurrent.toLocaleString()}</td>
                <td className="py-2 px-3 border border-slate-200 text-right text-amber-800 font-black">{totalLate.toLocaleString()}</td>
                <td className="py-2 px-3 border border-slate-200 text-right text-purple-800 font-black">{totalBacklog.toLocaleString()}</td>
                <td className="py-2 px-3 border border-slate-200 text-right text-slate-950 font-black">{grandTotal.toLocaleString()}</td>
                <td className="py-2 px-3 border border-slate-200 text-right text-emerald-800 font-black">{currentPercent}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PDF SECTION 3: COMPLETE 10 ZONES SUMMARY TABLE (OR ZONE'S OWN MONTHLY RECORD) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-slate-300 pb-2">
            <h3 className="text-sm font-bold text-slate-900">
              {isZoneOfficer && activeZoneAccount
                ? `ክፍል 3፦ የ${activeZoneAccount.name} ያለፉት ወራት የሪፖርት መዝገብ`
                : 'ክፍል 3፦ የማዕከላዊ ኢትዮጵያ ክልል 10ሩም ዞኖች ዝርዝር የሪፖርት ሠንጠረዥ'}
            </h3>
            <span className="text-[11px] text-slate-500">
              {isZoneOfficer && activeZoneAccount
                ? `በ${activeZoneAccount.name} ዞን ስር ያሉ ${activeZoneAccount.woredasCount} ወረዳዎች እና ${activeZoneAccount.kebelesCount} ቀበሌዎች የተጠናከረ መረጃ`
                : 'ሀላባ፣ ሀዲያ፣ ጉራጌ፣ ምሥራቅ ጉራጌ፣ ስልጤ፣ ከምባታ፣ የም፣ ማረቆ፣ ጠምባሮ እና ቀቤና'}
            </span>
          </div>

          {isZoneOfficer && activeZoneAccount ? (
            <table className="w-full text-left text-[11px] border border-slate-200 border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase font-mono text-[9px]">
                <tr>
                  <th className="py-1.5 px-2.5 border border-slate-200">የሪፖርት ወቅት</th>
                  <th className="py-1.5 px-2.5 border border-slate-200 text-right">የልደት (ወቅታዊ/ዘገየ/ነባር)</th>
                  <th className="py-1.5 px-2.5 border border-slate-200 text-right">የሞት (ወቅታዊ/ዘገየ/ነባር)</th>
                  <th className="py-1.5 px-2.5 border border-slate-200 text-right">የጋብቻ (ወቅታዊ/ዘገየ/ነባር)</th>
                  <th className="py-1.5 px-2.5 border border-slate-200 text-right">የፍቺና ጉዲፈቻ</th>
                  <th className="py-1.5 px-2.5 border border-slate-200 text-right">አጠቃላይ ድምር</th>
                  <th className="py-1.5 px-2.5 border border-slate-200 text-right">ወረዳዎች</th>
                  <th className="py-1.5 px-2.5 border border-slate-200">ሁኔታ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-4 text-center text-slate-500 font-sans text-xs">
                      ለተመረጠው ወቅት እስካሁን የገባ ሪፖርት የለም።
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub, idx) => {
                    const bCur = sub.birth?.current || 0, bLate = sub.birth?.late || 0, bBack = sub.birth?.backlog || 0;
                    const dCur = sub.death?.current || 0, dLate = sub.death?.late || 0, dBack = sub.death?.backlog || 0;
                    const mCur = sub.marriage?.current || 0, mLate = sub.marriage?.late || 0, mBack = sub.marriage?.backlog || 0;
                    const divCur = sub.divorce?.current || 0, divLate = sub.divorce?.late || 0, divBack = sub.divorce?.backlog || 0;
                    const adCur = sub.adoption?.current || 0, adLate = sub.adoption?.late || 0, adBack = sub.adoption?.backlog || 0;
                    const tot = bCur + bLate + bBack + dCur + dLate + dBack + mCur + mLate + mBack + divCur + divLate + divBack + adCur + adLate + adBack;
                    return (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="py-1.5 px-2.5 border border-slate-200 font-sans font-bold text-slate-900">{sub.monthNameAm} {sub.year}</td>
                        <td className="py-1.5 px-2.5 border border-slate-200 text-right text-slate-700">{bCur} / {bLate} / {bBack}</td>
                        <td className="py-1.5 px-2.5 border border-slate-200 text-right text-slate-700">{dCur} / {dLate} / {dBack}</td>
                        <td className="py-1.5 px-2.5 border border-slate-200 text-right text-slate-700">{mCur} / {mLate} / {mBack}</td>
                        <td className="py-1.5 px-2.5 border border-slate-200 text-right text-slate-700">{divCur + adCur} / {divLate + adLate} / {divBack + adBack}</td>
                        <td className="py-1.5 px-2.5 border border-slate-200 text-right text-slate-950 font-black">{tot.toLocaleString()}</td>
                        <td className="py-1.5 px-2.5 border border-slate-200 text-right text-slate-600 font-sans text-[10px]">{sub.reportingWoredasCount} ወረዳዎች</td>
                        <td className="py-1.5 px-2.5 border border-slate-200 font-sans text-emerald-800 font-bold">{sub.status || 'የተረጋገጠ'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-[11px] border border-slate-200 border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase font-mono text-[9px]">
                <tr>
                  <th className="py-1.5 px-2.5 border border-slate-200">ዞን / ልዩ ወረዳ</th>
                  <th className="py-1.5 px-2.5 border border-slate-200">ዋና ከተማ</th>
                  <th className="py-1.5 px-2.5 border border-slate-200 text-right">ወረዳዎች</th>
                  <th className="py-1.5 px-2.5 border border-slate-200 text-right">ቀበሌዎች</th>
                  <th className="py-1.5 px-2.5 border border-slate-200 text-right">ወቅታዊ (0 ብር)</th>
                  <th className="py-1.5 px-2.5 border border-slate-200 text-right">የዘገየ (500 ETB)</th>
                  <th className="py-1.5 px-2.5 border border-slate-200 text-right">ነባር (&gt;1 ዓመት)</th>
                  <th className="py-1.5 px-2.5 border border-slate-200 text-right">አጠቃላይ ድምር</th>
                  <th className="py-1.5 px-2.5 border border-slate-200 text-right">ወቅታዊ ምጣኔ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {zoneBreakdowns.map((z, idx) => (
                  <tr key={z.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="py-1.5 px-2.5 border border-slate-200 font-sans font-bold text-slate-900">{z.name}</td>
                    <td className="py-1.5 px-2.5 border border-slate-200 font-sans text-slate-600">{z.capital}</td>
                    <td className="py-1.5 px-2.5 border border-slate-200 text-right text-slate-700">{z.woredas}</td>
                    <td className="py-1.5 px-2.5 border border-slate-200 text-right text-slate-700">{z.kebeles}</td>
                    <td className="py-1.5 px-2.5 border border-slate-200 text-right text-emerald-700 font-bold">{z.current.toLocaleString()}</td>
                    <td className="py-1.5 px-2.5 border border-slate-200 text-right text-amber-700 font-bold">{z.late.toLocaleString()}</td>
                    <td className="py-1.5 px-2.5 border border-slate-200 text-right text-purple-700 font-bold">{z.backlog.toLocaleString()}</td>
                    <td className="py-1.5 px-2.5 border border-slate-200 text-right text-slate-900 font-black">{z.total.toLocaleString()}</td>
                    <td className="py-1.5 px-2.5 border border-slate-200 text-right font-bold text-emerald-800">{z.currentRate}</td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-bold">
                  <td colSpan={2} className="py-2 px-2.5 border border-slate-200 font-sans text-slate-900">የክልሉ ጠቅላላ ድምር (10 ዞኖች)</td>
                  <td className="py-2 px-2.5 border border-slate-200 text-right text-slate-800">50</td>
                  <td className="py-2 px-2.5 border border-slate-200 text-right text-slate-800">1,026</td>
                  <td className="py-2 px-2.5 border border-slate-200 text-right text-emerald-800 font-black">{totalCurrent.toLocaleString()}</td>
                  <td className="py-2 px-2.5 border border-slate-200 text-right text-amber-800 font-black">{totalLate.toLocaleString()}</td>
                  <td className="py-2 px-2.5 border border-slate-200 text-right text-purple-800 font-black">{totalBacklog.toLocaleString()}</td>
                  <td className="py-2 px-2.5 border border-slate-200 text-right text-slate-950 font-black">{grandTotal.toLocaleString()}</td>
                  <td className="py-2 px-2.5 border border-slate-200 text-right text-emerald-800 font-black">{currentPercent}%</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* PDF SECTION 4: OFFICIAL SIGN-OFF, STAMPS & LEGAL NOTICE */}
        <div className="pt-6 border-t-2 border-slate-800 grid grid-cols-3 gap-6 text-xs">
          <div className="space-y-2">
            <span className="font-bold text-slate-800 block text-[11px] uppercase">ያዘጋጀው ባለሙያ፦</span>
            <div className="h-10 border-b border-dashed border-slate-400" />
            <div className="text-[11px] text-slate-600">
              ስም፦ <strong>{isZoneOfficer && activeZoneAccount ? `የ${activeZoneAccount.name} የወሳኝ ኩነቶች ዳታ ኃላፊ` : 'አቶ ተስፋዬ በቀለ'}</strong><br />
              የስራ መደብ፦ {isZoneOfficer ? 'የስታቲስቲክስና ዳታ ትንታኔ ኃላፊ' : 'የስታቲስቲክስና ዳታ ትንታኔ ከፍተኛ ባለሙያ'}<br />
              ቀን፦ <strong>{ethToday.fullFormatted}</strong>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <span className="font-bold text-slate-800 block text-[11px] uppercase">
              {isZoneOfficer && activeZoneAccount ? `የ${activeZoneAccount.name} ማህተም፦` : 'የክልሉ ይፋዊ ማህተም፦'}
            </span>
            <div className="h-16 w-16 mx-auto rounded-full border-2 border-dashed border-emerald-700 flex items-center justify-center text-emerald-800 font-bold text-[9px] uppercase tracking-tighter text-center">
              {isZoneOfficer && activeZoneAccount ? (
                <>የ{activeZoneAccount.name}<br />ቅርንጫፍ<br />ማህተም</>
              ) : (
                <>ማኢ ክልል<br />ወሳኝ ኩነቶች<br />ማህተም</>
              )}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              መለያ፦ {isZoneOfficer && activeZoneAccount ? `SEAL-${activeZoneAccount.id.toUpperCase()}-2019` : 'REG-SEAL-2019-ETH'}
            </div>
          </div>

          <div className="space-y-2 text-right">
            <span className="font-bold text-slate-800 block text-[11px] uppercase">ያጸደቀው ኃላፊ፦</span>
            <div className="h-10 border-b border-dashed border-slate-400" />
            <div className="text-[11px] text-slate-600">
              ስም፦ <strong>{isZoneOfficer && activeZoneAccount ? activeZoneAccount.officerName : 'ዶ/ር አለሙ በቀለ'}</strong><br />
              የስራ መደብ፦ {isZoneOfficer && activeZoneAccount ? `የ${activeZoneAccount.name} የወሳኝ ኩነቶች አስተባባሪ` : 'የማዕከላዊ ኢትዮጵያ ክልል የወሳኝ ኩነቶች ዋና ዳይሬክተር'}<br />
              ፊርማ፦ <i>{isZoneOfficer && activeZoneAccount ? `${activeZoneAccount.officerName.split(' ')[0]} (ያረጋገጠው)` : 'Alemu B. (ተረጋግጧል)'}</i>
            </div>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-500 flex items-center justify-between">
          <span>ይህ ሰነድ በማዕከላዊ ኢትዮጵያ ክልል የወሳኝ ኩነቶች ዲጂታል ፖርታል አማካኝነት በjsPDF የተዘጋጀ ህጋዊ ሰነድ ነው።</span>
          <span className="font-mono">ገጽ 1 / 1</span>
        </div>
      </div>
    </div>
  );
};
