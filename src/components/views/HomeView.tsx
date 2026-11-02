import React, { useState, useMemo } from 'react';
import { ZoneMonthlySubmission, VitalRecord, HomeModuleContent, UserRole } from '../../types';
import { CENTRAL_ETHIOPIA_ZONES, STATUTORY_LIMITS_AM } from '../../data/mockDatabase';
import { getCurrentEthiopianDate, gregorianToEthiopian } from '../../utils/ethiopianCalendar';
import { INITIAL_SITE_CONTENT } from '../../data/defaultSiteContent';
import { 
  Building2, 
  BarChart3, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  AlertCircle, 
  Baby, 
  FileCheck2, 
  Heart, 
  HeartHandshake, 
  UserCheck, 
  Download, 
  MapPin, 
  Send,
  Lock,
  Calendar,
  RefreshCw,
  Sparkles,
  Megaphone,
  Phone
} from 'lucide-react';

interface HomeViewProps {
  submissions: ZoneMonthlySubmission[];
  records: VitalRecord[];
  onSelectTab: (tab: string) => void;
  onOpenLoginModal: () => void;
  content?: HomeModuleContent;
  userRole?: UserRole;
  onOpenContentEditor?: (moduleName: any) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ 
  submissions, 
  onSelectTab, 
  onOpenLoginModal,
  content,
  userRole,
  onOpenContentEditor
}) => {
  const safeContent = content || INITIAL_SITE_CONTENT.home;
  const ethToday = getCurrentEthiopianDate();
  const [converterInputDate, setConverterInputDate] = useState<string>('2026-10-04');
  const [selectedServiceForCheck, setSelectedServiceForCheck] = useState<'birth' | 'death' | 'marriage' | 'divorce' | 'adoption'>('birth');

  const convertedDateResult = useMemo(() => {
    return gregorianToEthiopian(converterInputDate);
  }, [converterInputDate]);

  // Check statutory compliance for converted date
  const complianceStatus = useMemo(() => {
    const eventTime = new Date(converterInputDate).getTime();
    const todayTime = new Date('2026-10-04').getTime();
    const diffDays = Math.max(0, Math.floor((todayTime - eventTime) / (1000 * 60 * 60 * 24)));
    const limitDays = STATUTORY_LIMITS_AM[selectedServiceForCheck].days;
    const isCurrent = diffDays <= limitDays;
    const isLate = diffDays > limitDays && diffDays <= 365;
    const isBacklog = diffDays > 365;

    let categoryLabel = 'ወቅታዊ ምዝገባ (በህጋዊ ጊዜ)';
    let feeLabel = 'ሙሉ በሙሉ ነፃ (0 ብር)';
    let message = `ኩነቱ በህጋዊ የ${limitDays} ቀናት ገደብ ውስጥ ነው (${diffDays} ቀናት)፤ ምዝገባው ሙሉ በሙሉ ነፃ (0 ብር) ነው።`;

    if (isLate) {
      categoryLabel = 'የዘገየ ምዝገባ (እስከ 1 ዓመት)';
      feeLabel = '500 የኢትዮጵያ ብር (ETB) የቅጣት ክፍያ';
      message = `ኩነቱ ከተከሰተ ${diffDays} ቀናት አልፈዋል (ከ${limitDays} ቀናት በላይ እስከ 1 ዓመት)፤ 500 ብር ህጋዊ ቅጣት ይከፈላል።`;
    } else if (isBacklog) {
      categoryLabel = 'ነባር ምዝገባ (ከ1 ዓመት በኋላ)';
      feeLabel = 'በፍርድ ቤት/የቀበሌ ማረጋገጫ ውሳኔ';
      message = `ኩነቱ ከተከሰተ ከ1 ዓመት በላይ (${diffDays} ቀናት) አልፏል፤ ነባር ምዝገባ ሆኖ በህጋዊ ማረጋገጫና ውሳኔ ሰነድ ይመዘገባል።`;
    }

    return {
      diffDays,
      limitDays,
      isCurrent,
      isLate,
      isBacklog,
      categoryLabel,
      fee: feeLabel,
      message
    };
  }, [converterInputDate, selectedServiceForCheck]);

  // Aggregate stats across all submissions (including statutory backlog)
  let totalBirthCurrent = 0, totalBirthLate = 0, totalBirthBacklog = 0;
  let totalDeathCurrent = 0, totalDeathLate = 0, totalDeathBacklog = 0;
  let totalMarriageCurrent = 0, totalMarriageLate = 0, totalMarriageBacklog = 0;
  let totalDivorceCurrent = 0, totalDivorceLate = 0, totalDivorceBacklog = 0;
  let totalAdoptionCurrent = 0, totalAdoptionLate = 0, totalAdoptionBacklog = 0;

  submissions.forEach(s => {
    totalBirthCurrent += s.birth.current;
    totalBirthLate += s.birth.late;
    totalBirthBacklog += s.birth.backlog || 0;

    totalDeathCurrent += s.death.current;
    totalDeathLate += s.death.late;
    totalDeathBacklog += s.death.backlog || 0;

    totalMarriageCurrent += s.marriage.current;
    totalMarriageLate += s.marriage.late;
    totalMarriageBacklog += s.marriage.backlog || 0;

    totalDivorceCurrent += s.divorce.current;
    totalDivorceLate += s.divorce.late;
    totalDivorceBacklog += s.divorce.backlog || 0;

    totalAdoptionCurrent += s.adoption.current;
    totalAdoptionLate += s.adoption.late;
    totalAdoptionBacklog += s.adoption.backlog || 0;
  });

  const totalCurrent = totalBirthCurrent + totalDeathCurrent + totalMarriageCurrent + totalDivorceCurrent + totalAdoptionCurrent;
  const totalLate = totalBirthLate + totalDeathLate + totalMarriageLate + totalDivorceLate + totalAdoptionLate;
  const totalBacklog = totalBirthBacklog + totalDeathBacklog + totalMarriageBacklog + totalDivorceBacklog + totalAdoptionBacklog;
  const grandTotal = totalCurrent + totalLate + totalBacklog;
  const onTimePercentage = grandTotal > 0 ? ((totalCurrent / grandTotal) * 100).toFixed(1) : '0';

  const quickServices = [
    {
      id: 'birth',
      name: 'የልደት ምዝገባ',
      icon: Baby,
      window: '90 ቀናት',
      windowLate: '90 ቀን - 1 ዓመት',
      windowBacklog: 'ከ1 ዓመት በኋላ',
      feeCurrent: 'ነፃ (0 ብር)',
      feeLate: '500 ብር (ETB)',
      desc: 'የህፃኑ ህጋዊ ማንነት ማረጋገጫ፣ የልደት ምስክር ወረቀት መስጠት እና የዜግነት መብትን ማስጠበቅ።'
    },
    {
      id: 'death',
      name: 'የሞት ምዝገባ',
      icon: FileCheck2,
      window: '50 ቀናት',
      windowLate: '50 ቀን - 1 ዓመት',
      windowBacklog: 'ከ1 ዓመት በኋላ',
      feeCurrent: 'ነፃ (0 ብር)',
      feeLate: '500 ብር (ETB)',
      desc: 'ህጋዊ የሞት ምስክር ወረቀት፣ የውርስና የስም ዝውውር ፈቃድ፣ እና የህክምና መንስኤ ምዝገባ።'
    },
    {
      id: 'marriage',
      name: 'የጋብቻ ምዝገባ',
      icon: Heart,
      window: '30 ቀናት',
      windowLate: '31 ቀን - 1 ዓመት',
      windowBacklog: 'ከ1 ዓመት በኋላ',
      feeCurrent: 'ነፃ (0 ብር)',
      feeLate: '500 ብር (ETB)',
      desc: 'የፍትሐብሔር እና የባህላዊ ጋብቻ ማረጋገጫ፣ የጋራ መብቶች ጥበቃና የጋብቻ ሰርተፊኬት መስጠት።'
    },
    {
      id: 'divorce',
      name: 'የፍቺ ምዝገባ',
      icon: HeartHandshake,
      window: '30 ቀናት',
      windowLate: '31 ቀን - 1 ዓመት',
      windowBacklog: 'ከ1 ዓመት በኋላ',
      feeCurrent: 'ነፃ (0 ብር)',
      feeLate: '500 ብር (ETB)',
      desc: 'የፍርድ ቤት ፍቺ ውሳኔ መመዝገብ፣ የጋብቻ መፍረስ ማረጋገጫ ሰርተፊኬት እና የፍትሐብሔር ሁኔታ ማስተካከያ።'
    },
    {
      id: 'adoption',
      name: 'የጉዲፈቻ ምዝገባ',
      icon: UserCheck,
      window: '30 ቀናት',
      windowLate: '31 ቀን - 1 ዓመት',
      windowBacklog: 'ከ1 ዓመት በኋላ',
      feeCurrent: 'ነፃ (0 ብር)',
      feeLate: '500 ብር (ETB)',
      desc: 'የፍርድ ቤት የጉዲፈቻ ፍርድ ማስመዝገብ፣ ህጋዊ የወላጅነት መብት ማስተላለፍ እና የልደት መዝገብ ማደስ።'
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Super Admin Quick Content Edit Bar */}
      {userRole === 'super_admin' && onOpenContentEditor && (
        <div className="rounded-xl border border-amber-400/80 bg-amber-50/95 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-amber-500/10 text-slate-900">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-700 font-bold">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-black text-amber-900 block">👑 የበላይ አስተዳዳሪ ሁነታ (Super Admin CMS)</span>
              <span className="text-[11px] text-amber-800">የዋና ገጹን ርዕሶች፣ ማስታወቂያዎችና የጥሪ መስመሮች በቀጥታ መቀየር ይችላሉ።</span>
            </div>
          </div>
          <button
            onClick={() => onOpenContentEditor('home')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-black cursor-pointer shadow-md transition-all self-start sm:self-auto"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>የዋና ገጽ ይዘት አርትዕ (Edit Home Content)</span>
          </button>
        </div>
      )}

      {/* Hero Section - Translucent Luminous Civic Glass (NO BLACK) */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-6 sm:p-10 lg:p-12 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-cyan-600/10 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 shadow-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{safeContent.heroBadge || 'የማዕከላዊ ኢትዮጵያ ክልል ሲቪልና ቤተሰብ ምዝገባ ኤጀንሲ'}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300 bg-cyan-50 px-3.5 py-1 text-xs font-mono font-bold text-cyan-800 shadow-xs">
                <Calendar className="h-3.5 w-3.5 text-cyan-600" />
                <span>ዛሬ፡ {ethToday.withWeekday}</span>
              </div>

              {safeContent.emergencyHotline && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-mono font-bold text-amber-800 shadow-xs">
                  <Phone className="h-3.5 w-3.5 text-amber-600" />
                  <span>ጥሪ፡ {safeContent.emergencyHotline}</span>
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {safeContent.heroTitle || 'የወሳኝ ኩነቶች ምዝገባ እና ወርሃዊ ሪፖርት ማመንጫ ፖርታል'}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed max-w-xl font-normal">
              {safeContent.heroSubtitle}
            </p>

            {safeContent.announcementText && (
              <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-3.5 flex items-start gap-3 shadow-xs">
                <Megaphone className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <span className="font-bold mr-1">ይፋዊ ማስታወቂያ ({safeContent.announcementDate || 'መስከረም 2019'}):</span>
                  <span>{safeContent.announcementText}</span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onSelectTab('reports')}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500 transition-all cursor-pointer"
              >
                <BarChart3 className="h-4 w-4" />
                <span>
                  {userRole === 'zone_officer'
                    ? 'የዞኔ ሪፖርትና ማተሚያ ክፈት'
                    : (userRole === 'regional_admin' || userRole === 'super_admin')
                    ? 'የአጠቃላይ ሪፖርት ማመንጫ (PPTX/PDF)'
                    : 'የወሳኝ ኩነቶች ሪፖርት ማዕከል'
                  }
                </span>
              </button>

              <button
                onClick={() => {
                  if (userRole === 'zone_officer') {
                    onSelectTab('zoneReport');
                  } else {
                    onOpenLoginModal();
                  }
                }}
                className="flex items-center gap-2 rounded-xl border border-amber-500/80 bg-amber-50 px-5 py-3 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-all cursor-pointer shadow-xs"
              >
                <Send className="h-4 w-4 text-amber-700" />
                <span>{userRole === 'zone_officer' ? 'የወሩን ሪፖርት መላኪያ ቅጽ' : 'የዞን ወይም አስተዳዳሪ መግቢያ'}</span>
              </button>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600" />
                <span>በወቅቱ መመዝገብ፡ <strong className="text-emerald-700 font-bold">ሙሉ በሙሉ ነፃ (0 ብር)</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span>ዘግይቶ ምዝገባ፡ <strong className="text-amber-700 font-bold">500 ብር (ETB) የቅጣት ክፍያ</strong></span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 shadow-xl bg-white">
              <img
                src="/src/assets/images/civic_identity_hero_1791107773539.jpg"
                alt="የማዕከላዊ ኢትዮጵያ ወሳኝ ኩነቶች ማዕከል"
                className="w-full h-80 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex flex-col justify-end p-5">
                <span className="text-[11px] font-bold text-emerald-300 font-mono">የማዕከላዊ ኢትዮጵያ ክልል</span>
                <span className="text-sm font-bold text-white mt-1">ለሁሉም ዜጎች ህጋዊ ማንነትን ማረጋገጥ (SDG 16.9)</span>
                <span className="text-xs text-slate-200 mt-1">10ሩም ዞኖችና ልዩ ወረዳዎች በዲጂታል ትስስር የተገናኙበት ሥርዓት</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Gregorian to Ethiopian Date Converter Helper - NO BLACK */}
      <section className="rounded-2xl border border-cyan-200/90 bg-white/85 backdrop-blur-md p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300 bg-cyan-50 px-3 py-0.5 text-xs font-bold text-cyan-800 mb-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
              <span>የቀን መለወጫ መገልገያ (Gregorian to Ethiopian Calendar Converter)</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              የፈረንጆች እና የኢትዮጵያ ካላንደር መለወጫ
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              ከሆስፒታልና ፍርድ ቤት የሚቀርቡ የፈረንጆች ቀኖችን (Gregorian) ወዲያውኑ ወደ ኢትዮጵያ ዘመን አቆጣጠር በመቀየር የምዝገባ ሁኔታና ክፍያ ያረጋግጡ።
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 font-mono text-xs">
            <span className="text-slate-500">ዛሬ በኢትዮጵያ፡</span>
            <strong className="text-emerald-700">{ethToday.fullFormatted}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Input Controls */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                የፈረንጆች ቀን ያስገቡ (Gregorian Date Input)
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={converterInputDate}
                  onChange={(e) => setConverterInputDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-mono text-slate-900 focus:border-cyan-500 focus:outline-none shadow-xs"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                የተመረጠው የፈረንጆች ቀን፡ <strong className="text-slate-800 font-mono">{converterInputDate}</strong>
              </span>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">ፈጣን ምሳሌዎች፡</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setConverterInputDate('2026-10-04')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    converterInputDate === '2026-10-04'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  ዛሬ (Oct 4, 2026) → መስከረም 24/ 2019
                </button>
                <button
                  type="button"
                  onClick={() => setConverterInputDate('2026-09-11')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    converterInputDate === '2026-09-11'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  እንቁጣጣሽ (Sept 11, 2026) → መስከረም 1/ 2019
                </button>
                <button
                  type="button"
                  onClick={() => setConverterInputDate('2026-09-10')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    converterInputDate === '2026-09-10'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  ጳጉሜን 5/ 2018 (Sept 10, 2026)
                </button>
              </div>
            </div>

            {/* Service Type Checker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                የወሳኝ ኩነት ዓይነት (የህጋዊ ጊዜ ገደብ ለማጣራት)
              </label>
              <select
                value={selectedServiceForCheck}
                onChange={(e) => setSelectedServiceForCheck(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none shadow-xs"
              >
                <option value="birth">👶 የልደት ምዝገባ (ህጋዊ የ90 ቀናት ገደብ)</option>
                <option value="death">🕊️ የሞት ምዝገባ (ህጋዊ የ50 ቀናት ገደብ)</option>
                <option value="marriage">💍 የጋብቻ ምዝገባ (ህጋዊ የ30 ቀናት ገደብ)</option>
                <option value="divorce">⚖️ የፍቺ ምዝገባ (ህጋዊ የ30 ቀናት ገደብ)</option>
                <option value="adoption">🤝 የጉዲፈቻ ምዝገባ (ህጋዊ የ30 ቀናት ገደብ)</option>
              </select>
            </div>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-6 rounded-2xl border border-cyan-200 bg-cyan-50/70 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-cyan-200/80 pb-3">
              <span className="text-xs font-bold text-cyan-800 uppercase tracking-wider">
                የተለወጠው የኢትዮጵያ ቀን (Converted Result)
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white text-cyan-800 border border-cyan-300 font-bold">
                {convertedDateResult.formatted}
              </span>
            </div>

            {/* Main Result Display */}
            <div className="text-center py-2 space-y-1">
              <span className="text-xs text-slate-600 block font-sans">
                {convertedDateResult.weekdayName}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800">
                {convertedDateResult.fullFormatted}
              </div>
              <span className="text-xs text-slate-600 font-mono block">
                ወር {convertedDateResult.month} ({convertedDateResult.monthName}) | ቀን {convertedDateResult.day} | {convertedDateResult.year} ዓ.ም
              </span>
            </div>

            {/* Statutory Window & Payment Assessment */}
            <div className={`rounded-xl p-3.5 border text-xs space-y-1.5 ${
              complianceStatus.isBacklog
                ? 'bg-purple-50 border-purple-300 text-purple-950'
                : complianceStatus.isLate 
                  ? 'bg-amber-100/80 border-amber-300 text-amber-900' 
                  : 'bg-emerald-100/80 border-emerald-300 text-emerald-900'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span>የምዝገባ ምድብ፡</span>
                <span className={
                  complianceStatus.isBacklog
                    ? 'text-purple-800 font-extrabold'
                    : complianceStatus.isLate 
                      ? 'text-amber-800 font-extrabold' 
                      : 'text-emerald-800 font-extrabold'
                }>
                  {complianceStatus.categoryLabel}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>የክፍያ/የአሰራር ተመን፡</span>
                <strong className="font-mono text-sm text-slate-900 font-bold">{complianceStatus.fee}</strong>
              </div>
              <p className="text-[11px] opacity-90 leading-relaxed pt-1 border-t border-slate-200">
                {complianceStatus.message}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Summary Cards Across Central Ethiopia - NO BLACK */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {safeContent.statsSectionTitle || 'የክልሉ የወሳኝ ኩነቶች የቀጥታ መረጃ ቋት'}
            </h2>
            <p className="text-xs text-slate-600">
              {safeContent.statsSectionSubtitle || 'በ10ሩም ዞኖች (ሀላባን ጨምሮ) የተመዘገቡ ወሳኝ ኩነቶች አጠቃላይ ድምር'}
            </p>
          </div>
          <button 
            onClick={() => onSelectTab('reports')} 
            className="flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
          >
            <span>{userRole === 'zone_officer' ? 'የዞኔን ሪፖርት ተመልከት' : 'ሙሉ ትንታኔ ተመልከት'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-3.5 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">አጠቃላይ ኩነቶች</span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">{grandTotal.toLocaleString()}</div>
            <span className="text-[10px] text-cyan-700 font-semibold mt-0.5 block">የተጠናከረ መረጃ</span>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 backdrop-blur-md p-3.5 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">ወቅታዊ (በህጋዊ ጊዜ)</span>
            <div className="text-xl font-bold font-mono text-emerald-800 mt-1 tabular-nums">{totalCurrent.toLocaleString()}</div>
            <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">{onTimePercentage}% ነፃ (0 ብር)</span>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/80 backdrop-blur-md p-3.5 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">የዘገየ (እስከ 1 ዓመት)</span>
            <div className="text-xl font-bold font-mono text-amber-800 mt-1 tabular-nums">{totalLate.toLocaleString()}</div>
            <span className="text-[10px] text-amber-700 font-semibold mt-0.5 block">500 ETB ቅጣት</span>
          </div>

          <div className="rounded-xl border border-purple-200 bg-purple-50/80 backdrop-blur-md p-3.5 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-purple-700 tracking-wider">ነባር (ከ1 ዓመት በኋላ)</span>
            <div className="text-xl font-bold font-mono text-purple-800 mt-1 tabular-nums">{totalBacklog.toLocaleString()}</div>
            <span className="text-[10px] text-purple-700 font-semibold mt-0.5 block">በማስረጃ ውሳኔ</span>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-3.5 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">👶 የልደት ምዝገባ</span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">{(totalBirthCurrent + totalBirthLate + totalBirthBacklog).toLocaleString()}</div>
            <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">90 ቀናት ገደብ</span>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-3.5 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">🕊️ የሞት ምዝገባ</span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">{(totalDeathCurrent + totalDeathLate + totalDeathBacklog).toLocaleString()}</div>
            <span className="text-[10px] text-rose-700 font-semibold mt-0.5 block">50 ቀናት ገደብ</span>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-3.5 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">💍 የጋብቻ ምዝገባ</span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">{(totalMarriageCurrent + totalMarriageLate + totalMarriageBacklog).toLocaleString()}</div>
            <span className="text-[10px] text-sky-700 font-semibold mt-0.5 block">30 ቀናት ገደብ</span>
          </div>
        </div>
      </section>

      {/* Central Ethiopia 10 Zones Showcase - NO BLACK */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">የማዕከላዊ ኢትዮጵያ ክልል 10ሩም ዞኖች እና ልዩ ወረዳዎች</h2>
          <p className="text-xs text-slate-600">ሀላባ፣ ሀዲያ፣ ጉራጌ፣ ምሥራቅ ጉራጌ፣ ስልጤ፣ ከምባታ፣ የም፣ ማረቆ፣ ጠምባሮ እና ቀቤና ዞኖች ወርሃዊ መረጃዎችን ለክልሉ ያቀርባሉ</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CENTRAL_ETHIOPIA_ZONES.map((zone) => {
            const zSubs = submissions.filter(s => s.zoneId === zone.id);
            let cur = 0, late = 0, backlog = 0;
            zSubs.forEach(s => {
              cur += (s.birth.current + s.death.current + s.marriage.current + s.divorce.current + s.adoption.current);
              late += (s.birth.late + s.death.late + s.marriage.late + s.divorce.late + s.adoption.late);
              backlog += ((s.birth.backlog || 0) + (s.death.backlog || 0) + (s.marriage.backlog || 0) + (s.divorce.backlog || 0) + (s.adoption.backlog || 0));
            });
            const tot = cur + late + backlog;

            return (
              <div
                key={zone.id}
                className="rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-5 space-y-3 hover:border-emerald-500/70 hover:shadow-md transition-all text-slate-900"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{zone.name}</h3>
                    <span className="text-xs text-emerald-700 font-semibold">ዋና ከተማ፡ {zone.capital}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                    {zone.woredasCount} ወረዳዎች
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>ኃላፊ፡</span>
                    <span className="text-slate-900 font-medium">{zone.officerName}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>ስልክ፡</span>
                    <span className="font-mono text-slate-800">{zone.officerPhone}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>የተመዘገቡ ኩነቶች፡</span>
                    <span className="font-mono font-bold text-slate-900">{tot.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 font-mono">
                    <span className="text-emerald-700 font-semibold" title="ወቅታዊ (ነፃ)">ወቅታዊ፦ {cur.toLocaleString()}</span>
                    <span className="text-amber-700 font-semibold" title="የዘገየ (500 ETB)">የዘገየ፦ {late.toLocaleString()}</span>
                    <span className="text-purple-700 font-semibold" title="ነባር (>1 ዓመት)">ነባር፦ {backlog.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectTab('reports')}
                  className="w-full mt-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  የዞኑን ሪፖርት ተመልከት
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Statutory Grace Period Comparison Banner - NO BLACK */}
      <section className="rounded-2xl border border-emerald-200/90 bg-emerald-50/90 backdrop-blur-md p-6 sm:p-8 shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <AlertCircle className="h-4 w-4 text-emerald-600" />
            <span>የህዝብ ማሳሰቢያ፡ መደበኛ እና ዘግይቶ ምዝገባ ልዩነቶች</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">ለምን በህጋዊ የጊዜ ገደብ ውስጥ መመዝገብ አስፈለገ?</h3>
          <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
            በኢትዮጵያ የወሳኝ ኩነቶች ምዝገባ አዋጅ መሠረት፣ በወቅቱ የተመዘገቡ ማናቸውም የልደት፣ ሞት፣ ጋብቻ፣ ፍቺ እና ጉዲፈቻ ኩነቶች <strong className="text-emerald-800 font-bold">ሙሉ በሙሉ ከክፍያ ነፃ (0 ብር)</strong> ናቸው። ከህጋዊው የጊዜ ገደብ ውጪ ለዘገየ ለማንኛውም ምዝገባ <strong className="text-amber-800 font-bold">500 የኢትዮጵያ ብር (ETB)</strong> ህጋዊ የቅጣት ክፍያ ይከፈላል።
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3">
            <div className="rounded-lg bg-white/95 p-3 border border-emerald-200 text-center shadow-xs">
              <span className="text-[11px] text-slate-600 block font-bold">👶 ልደት (90 ቀናት)</span>
              <span className="text-xs font-bold text-emerald-700 block">በወቅቱ፡ ነፃ (0 ብር)</span>
              <span className="text-[10px] text-amber-700 block font-semibold">ዘግይቶ፡ 500 ብር</span>
            </div>
            <div className="rounded-lg bg-white/95 p-3 border border-emerald-200 text-center shadow-xs">
              <span className="text-[11px] text-slate-600 block font-bold">🕊️ ሞት (30 ቀናት)</span>
              <span className="text-xs font-bold text-emerald-700 block">በወቅቱ፡ ነፃ (0 ብር)</span>
              <span className="text-[10px] text-amber-700 block font-semibold">ዘግይቶ፡ 500 ብር</span>
            </div>
            <div className="rounded-lg bg-white/95 p-3 border border-emerald-200 text-center shadow-xs">
              <span className="text-[11px] text-slate-600 block font-bold">💍 ጋብቻ (30 ቀናት)</span>
              <span className="text-xs font-bold text-emerald-700 block">በወቅቱ፡ ነፃ (0 ብር)</span>
              <span className="text-[10px] text-amber-700 block font-semibold">ዘግይቶ፡ 500 ብር</span>
            </div>
            <div className="rounded-lg bg-white/95 p-3 border border-emerald-200 text-center shadow-xs">
              <span className="text-[11px] text-slate-600 block font-bold">⚖️ ፍቺ (60 ቀናት)</span>
              <span className="text-xs font-bold text-emerald-700 block">በወቅቱ፡ ነፃ (0 ብር)</span>
              <span className="text-[10px] text-amber-700 block font-semibold">ዘግይቶ፡ 500 ብር</span>
            </div>
            <div className="rounded-lg bg-white/95 p-3 border border-emerald-200 text-center shadow-xs">
              <span className="text-[11px] text-slate-600 block font-bold">🤝 ጉዲፈቻ (90 ቀናት)</span>
              <span className="text-xs font-bold text-emerald-700 block">በወቅቱ፡ ነፃ (0 ብር)</span>
              <span className="text-[10px] text-amber-700 block font-semibold">ዘግይቶ፡ 500 ብር</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Vital Services Informational Cards - NO BLACK */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">የወሳኝ ኩነቶች መረጃና መመሪያዎች</h2>
          <p className="text-xs text-slate-600">የእያንዳንዱን ኩነት ቅድመ-ሁኔታዎች፣ አስፈላጊ ሰነዶች እና የምዝገባ ቅደም-ተከተል ይመልከቱ</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickServices.map((svc) => (
            <div
              key={svc.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-5 space-y-4 hover:border-emerald-500/70 hover:shadow-md transition-all text-slate-900 shadow-xs"
            >
              <div className="space-y-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg border shadow-xs ${
                  svc.id === 'birth' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                  svc.id === 'death' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                  svc.id === 'marriage' ? 'bg-sky-50 border-sky-200 text-sky-700' :
                  svc.id === 'divorce' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                  'bg-purple-50 border-purple-200 text-purple-700'
                }`}>
                  <svc.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{svc.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{svc.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">የጊዜ ገደብ፡</span>
                  <span className="font-bold text-emerald-700">{svc.window}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">በወቅቱ ክፍያ፡</span>
                  <span className="font-bold text-slate-900">{svc.feeCurrent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ዘግይቶ ቅጣት፡</span>
                  <span className="font-bold text-amber-700">{svc.feeLate}</span>
                </div>

                <button
                  onClick={() => onSelectTab('services')}
                  className="w-full mt-2 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 hover:border-transparent border border-slate-200 font-semibold transition-colors cursor-pointer text-center"
                >
                  ዝርዝሩን አንብብ
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
