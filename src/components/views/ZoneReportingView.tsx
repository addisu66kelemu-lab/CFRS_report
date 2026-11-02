import React, { useState } from 'react';
import { 
  ZoneAccount, 
  ZoneMonthlySubmission, 
  ZoneMessageRequest, 
  ZoneMessageCategory, 
  ZoneMessagePriority 
} from '../../types';
import { ETHIOPIAN_MONTHS, STATUTORY_LIMITS_AM } from '../../data/mockDatabase';
import { getCurrentEthiopianDate, formatEthiopianDateTime, gregorianToEthiopian } from '../../utils/ethiopianCalendar';
import { EthiopianCalendarConverterWidget } from '../EthiopianCalendarConverterWidget';
import { 
  Send, 
  Building, 
  CheckCircle2, 
  Baby, 
  FileCheck2, 
  Heart, 
  HeartHandshake, 
  UserCheck, 
  Clock, 
  MapPin, 
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  ArrowRightLeft,
  MessageSquare,
  Reply,
  CornerDownRight,
  ShieldCheck,
  Tag,
  Plus,
  Printer,
  X,
  Eye,
  FileDown,
  Lock
} from 'lucide-react';

interface ZoneReportingViewProps {
  activeZone: ZoneAccount;
  submissions: ZoneMonthlySubmission[];
  onSubmitReport: (report: ZoneMonthlySubmission) => void;
  onAddAuditLog: (action: string, details: string) => void;
  zoneMessages?: ZoneMessageRequest[];
  onCreateZoneMessage?: (msg: Omit<ZoneMessageRequest, 'id' | 'createdAt' | 'replies' | 'status' | 'statusAm'>) => void;
}

export const ZoneReportingView: React.FC<ZoneReportingViewProps> = ({
  activeZone,
  submissions,
  onSubmitReport,
  onAddAuditLog,
  zoneMessages,
  onCreateZoneMessage,
}) => {
  const ethToday = getCurrentEthiopianDate();
  const [selectedMonth, setSelectedMonth] = useState<number>(1); // መስከረም
  const [selectedYear, setSelectedYear] = useState<number>(2019); // 2019 ዓ.ም የኢትዮጵያ ዘመን አቆጣጠር
  const [reportingWoredas, setReportingWoredas] = useState<number>(activeZone.woredasCount);
  const [reportingKebeles, setReportingKebeles] = useState<number>(Math.round(activeZone.kebelesCount * 0.95));

  // Counts for each of the 5 vital events (3 categories: ወቅታዊ፣ የዘገየ፣ ነባር)
  const [birthCurrent, setBirthCurrent] = useState<number>(activeZone.woredasCount * 45);
  const [birthLate, setBirthLate] = useState<number>(activeZone.woredasCount * 12);
  const [birthBacklog, setBirthBacklog] = useState<number>(activeZone.woredasCount * 5);

  const [deathCurrent, setDeathCurrent] = useState<number>(activeZone.woredasCount * 16);
  const [deathLate, setDeathLate] = useState<number>(activeZone.woredasCount * 5);
  const [deathBacklog, setDeathBacklog] = useState<number>(activeZone.woredasCount * 2);

  const [marriageCurrent, setMarriageCurrent] = useState<number>(activeZone.woredasCount * 18);
  const [marriageLate, setMarriageLate] = useState<number>(activeZone.woredasCount * 6);
  const [marriageBacklog, setMarriageBacklog] = useState<number>(activeZone.woredasCount * 3);

  const [divorceCurrent, setDivorceCurrent] = useState<number>(activeZone.woredasCount * 4);
  const [divorceLate, setDivorceLate] = useState<number>(activeZone.woredasCount * 1);
  const [divorceBacklog, setDivorceBacklog] = useState<number>(activeZone.woredasCount * 1);

  const [adoptionCurrent, setAdoptionCurrent] = useState<number>(activeZone.woredasCount * 2);
  const [adoptionLate, setAdoptionLate] = useState<number>(activeZone.woredasCount * 1);
  const [adoptionBacklog, setAdoptionBacklog] = useState<number>(0);

  const [notes, setNotes] = useState<string>('ከሁሉም ወረዳዎች እና ቀበሌዎች የተጠናከረ ወርሃዊ የወሳኝ ኩነቶች ምዝገባ ሪፖርት።');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showConverter, setShowConverter] = useState<boolean>(false);

  // Printable Dossier State for Zone Officer (ፕሪንት ማድረግ)
  const [printableDossier, setPrintableDossier] = useState<ZoneMonthlySubmission | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  const handleOpenPrintDossier = (sub: ZoneMonthlySubmission) => {
    setPrintableDossier(sub);
    setIsPrintModalOpen(true);
    onAddAuditLog('ZONE_REPORT_PREVIEW_PRINT', `${activeZone.name} የ${sub.monthNameAm} ${sub.year} ይፋዊ ሪፖርት ለህትመት ከፈተ`);
  };

  const handlePrintCurrentDraft = () => {
    const draftSubmission: ZoneMonthlySubmission = {
      id: `SUB-${selectedYear}-${activeZone.id.toUpperCase()}-M${String(selectedMonth).padStart(2, '0')}`,
      zoneId: activeZone.id,
      zoneName: activeZone.name,
      year: selectedYear,
      month: selectedMonth,
      monthNameAm: ETHIOPIAN_MONTHS[selectedMonth - 1],
      submittedBy: `${activeZone.officerName} (${activeZone.name} የወሳኝ ኩነቶች አስተባባሪ)`,
      submittedAt: formatEthiopianDateTime(new Date()),
      reportingWoredasCount: Number(reportingWoredas),
      reportingKebelesCount: Number(reportingKebeles),
      status: 'የተረጋገጠ',
      birth: { current: Number(birthCurrent), late: Number(birthLate), backlog: Number(birthBacklog) },
      death: { current: Number(deathCurrent), late: Number(deathLate), backlog: Number(deathBacklog) },
      marriage: { current: Number(marriageCurrent), late: Number(marriageLate), backlog: Number(marriageBacklog) },
      divorce: { current: Number(divorceCurrent), late: Number(divorceLate), backlog: Number(divorceBacklog) },
      adoption: { current: Number(adoptionCurrent), late: Number(adoptionLate), backlog: Number(adoptionBacklog) },
      notes,
    };
    setPrintableDossier(draftSubmission);
    setIsPrintModalOpen(true);
    onAddAuditLog('ZONE_REPORT_DRAFT_PRINT', `${activeZone.name} የወሩን ረቂቅ ሪፖርት ለህትመት ከፈተ`);
  };

  // Zone Message Request to Admin state
  const [isComposingMsg, setIsComposingMsg] = useState<boolean>(false);
  const [reqSubject, setReqSubject] = useState<string>('');
  const [reqCategory, setReqCategory] = useState<ZoneMessageCategory>('supplies');
  const [reqPriority, setReqPriority] = useState<ZoneMessagePriority>('high');
  const [reqWoreda, setReqWoreda] = useState<string>('');
  const [reqBody, setReqBody] = useState<string>('');
  const [msgSuccessToast, setMsgSuccessToast] = useState<string | null>(null);

  // Past submissions for this zone
  const zoneHistory = submissions.filter(s => s.zoneId === activeZone.id);

  // Messages sent by this zone
  const thisZoneMessages = (zoneMessages || []).filter(m => m.zoneId === activeZone.id);

  const handleSendMessageToAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqSubject.trim() || !reqBody.trim() || !onCreateZoneMessage) return;

    const categoryAmMap: Record<ZoneMessageCategory, string> = {
      supplies: 'የቁሳቁስና ቅጾች አቅርቦት',
      system_support: 'የስርዓት ድጋፍ',
      legal_inquiry: 'የህግና ደንብ ማብራሪያ',
      urgent_request: 'አስቸኳይ ጥያቄ',
      general: 'አጠቃላይ'
    };

    const priorityAmMap: Record<ZoneMessagePriority, string> = {
      urgent: 'አስቸኳይ',
      high: 'ከፍተኛ',
      normal: 'መደበኛ'
    };

    onCreateZoneMessage({
      zoneId: activeZone.id,
      zoneName: activeZone.name,
      officerName: activeZone.officerName,
      officerPhone: activeZone.officerPhone,
      subject: reqSubject.trim(),
      category: reqCategory,
      categoryAm: categoryAmMap[reqCategory],
      priority: reqPriority,
      priorityAm: priorityAmMap[reqPriority],
      message: reqBody.trim(),
      woredaAffected: reqWoreda.trim() || undefined,
    });

    setMsgSuccessToast('የመልእክት ጥያቄዎ ለክልሉ ማዕከላዊ አስተዳዳሪ በተሳካ ሁኔታ ተልኳል!');
    setTimeout(() => setMsgSuccessToast(null), 5000);
    setReqSubject('');
    setReqBody('');
    setReqWoreda('');
    setIsComposingMsg(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submissionId = `SUB-${selectedYear}-${activeZone.id.toUpperCase()}-M${String(selectedMonth).padStart(2, '0')}`;
    const newSubmission: ZoneMonthlySubmission = {
      id: submissionId,
      zoneId: activeZone.id,
      zoneName: activeZone.name,
      year: selectedYear,
      month: selectedMonth,
      monthNameAm: ETHIOPIAN_MONTHS[selectedMonth - 1],
      submittedBy: `${activeZone.officerName} (${activeZone.name} የወሳኝ ኩነቶች አስተባባሪ)`,
      submittedAt: formatEthiopianDateTime(new Date()),
      reportingWoredasCount: Number(reportingWoredas),
      reportingKebelesCount: Number(reportingKebeles),
      status: 'የተረጋገጠ',
      birth: { current: Number(birthCurrent), late: Number(birthLate), backlog: Number(birthBacklog) },
      death: { current: Number(deathCurrent), late: Number(deathLate), backlog: Number(deathBacklog) },
      marriage: { current: Number(marriageCurrent), late: Number(marriageLate), backlog: Number(marriageBacklog) },
      divorce: { current: Number(divorceCurrent), late: Number(divorceLate), backlog: Number(divorceBacklog) },
      adoption: { current: Number(adoptionCurrent), late: Number(adoptionLate), backlog: Number(adoptionBacklog) },
      notes,
    };

    onSubmitReport(newSubmission);
    onAddAuditLog('ZONE_REPORT_SUBMISSION', `${activeZone.name} የ${newSubmission.monthNameAm} ወር ሪፖርት (ወቅታዊ፣ የዘገየ፣ ነባር) ለክልሉ አስተዳዳሪ ላከ`);

    setSuccessMsg(`የ${activeZone.name} የ${newSubmission.monthNameAm} ወር ሪፖርት በተሳካ ሁኔታ ለክልሉ አስተዳዳሪ ተልኳል!`);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const totalCurrentSum = birthCurrent + deathCurrent + marriageCurrent + divorceCurrent + adoptionCurrent;
  const totalLateSum = birthLate + deathLate + marriageLate + divorceLate + adoptionLate;
  const totalBacklogSum = birthBacklog + deathBacklog + marriageBacklog + divorceBacklog + adoptionBacklog;
  const grandTotal = totalCurrentSum + totalLateSum + totalBacklogSum;

  return (
    <div className="space-y-8 pb-16">
      {/* Zone Header Banner with Security Isolation & Print Action */}
      <div className="rounded-2xl border border-amber-300/80 bg-white/85 backdrop-blur-md p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900 shadow-xs">
              <Building className="h-3.5 w-3.5 text-amber-600" />
              <span>የዞን ወሳኝ ኩነቶች ሪፖርት ማቅረቢያ ፖርታል</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeZone.name} ({activeZone.capital} ከተማ)
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              ኃላፊ፡ <strong className="text-slate-900">{activeZone.officerName}</strong> | ስልክ፡ <span className="font-mono text-amber-700 font-bold">{activeZone.officerPhone}</span> | ጠቅላላ ወረዳዎች፡ <strong className="text-slate-900">{activeZone.woredasCount}</strong> | ጠቅላላ ቀበሌዎች፡ <strong className="text-slate-900">{activeZone.kebelesCount}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrintCurrentDraft}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              title="የዚህን ወር ሪፖርት አትም (Print / Export Dossier)"
            >
              <Printer className="h-4 w-4" />
              <span>🖨️ የዞኑን ሪፖርት አትም (Print)</span>
            </button>

            <div className="rounded-xl border border-slate-200 bg-white/95 p-3 text-center shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-mono block font-bold">የተጠቃሚ መለያ</span>
              <span className="font-mono text-xs font-bold text-amber-800">{activeZone.username}</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">✓ በመለያ ገብተዋል</span>
            </div>
          </div>
        </div>

        {/* User Rule Compliance Notice */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-50/90 border border-amber-300 text-amber-950 text-xs font-semibold">
          <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0" />
          <span>
            <strong>የመመሪያ ማስታወሻ፦</strong> ከዋና አስተዳዳሪው ውጭ ያሉ ዞኖች አጠቃላይ ሪፖርት ማየት አይችሉም። እዚህ የራስዎን ዞን ({activeZone.name}) ሪፖርት ብቻ መላክ፣ ማየትና ፕሪንት ማድረግ ይችላሉ።
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 flex items-center gap-3 text-emerald-900 text-xs font-semibold shadow-md">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Payment & Calendar Policy Notice */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 backdrop-blur-md p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shrink-0 border border-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              የክፍያ መመሪያ እና የኢትዮጵያ ዘመን አቆጣጠር
            </h4>
            <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
              ሁሉም በህጋዊ የጊዜ ገደብ የተከናወኑ መደበኛ ምዝገባዎች <strong className="text-emerald-700 font-bold">ሙሉ በሙሉ ነፃ (0 ብር)</strong> ናቸው። ከጊዜ ገደብ ውጪ ለዘገዩ ምዝገባዎች ለእያንዳንዳቸው <strong className="text-amber-700 font-bold">500 የኢትዮጵያ ብር (ETB)</strong> ህጋዊ የቅጣት ክፍያ ተሰብስቦ ሪፖርት ይደረጋል።
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 text-xs font-mono">
          <button
            type="button"
            onClick={() => setShowConverter(!showConverter)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold cursor-pointer transition-colors shadow-xs"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span>{showConverter ? 'መለወጫውን ደብቅ' : 'የቀን መለወጫ (Converter)'}</span>
          </button>
          <span className="px-2.5 py-1 rounded bg-white border border-emerald-200 text-emerald-800 font-bold shadow-xs">
            መደበኛ፡ 0 ብር (ነፃ)
          </span>
          <span className="px-2.5 py-1 rounded bg-white border border-amber-200 text-amber-800 font-bold shadow-xs">
            ዘግይቶ፡ 500 ETB
          </span>
        </div>
      </div>

      {/* Collapsible Ethiopian Calendar Converter Widget */}
      {showConverter && (
        <EthiopianCalendarConverterWidget />
      )}

      {/* Main Submission Form */}
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Reporting Period & Scope */}
        <div className="rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-600" />
            <span>1. የሪፖርት ወቅት እና የተሸፈኑ ወረዳዎች/ቀበሌዎች</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ዓመተ ምህረት (የኢትዮጵያ ካላንደር)</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none font-mono shadow-xs"
              >
                <option value={2019}>2019 ዓ.ም (የአሁኑ ዓመት)</option>
                <option value={2018}>2018 ዓ.ም</option>
                <option value={2017}>2017 ዓ.ም</option>
                <option value={2016}>2016 ዓ.ም</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">የሪፖርት ወር</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none shadow-xs"
              >
                {ETHIOPIAN_MONTHS.map((m, idx) => (
                  <option key={idx} value={idx + 1}>{m} ወር</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ሪፖርት ያቀረቡ ወረዳዎች ብዛት</label>
              <input
                type="number"
                min={1}
                max={activeZone.woredasCount}
                value={reportingWoredas}
                onChange={(e) => setReportingWoredas(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-500 focus:outline-none shadow-xs"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">ከጠቅላላ {activeZone.woredasCount} ወረዳዎች</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ሪፖርት ያቀረቡ ቀበሌዎች ብዛት</label>
              <input
                type="number"
                min={1}
                max={activeZone.kebelesCount}
                value={reportingKebeles}
                onChange={(e) => setReportingKebeles(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-500 focus:outline-none shadow-xs"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">ከጠቅላላ {activeZone.kebelesCount} ቀበሌዎች</span>
            </div>
          </div>
        </div>

        {/* 5 Vital Events Input Cards */}
        <div className="rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <span>2. በወረዳዎችና ቀበሌዎች የተመዘገቡ ወሳኝ ኩነቶች ቁጥር (በ3ቱ የጊዜ ገደቦች)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                በህጉ የጊዜ ገደብ መሠረት ወቅታዊ (ነፃ)፣ የዘገየ (እስከ 1 ዓመት - 500 ETB)፣ እና ነባር (ከ1 ዓመት በኋላ) የተመዘገቡትን ቁጥሮች ያስገቡ።
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">ወቅታዊ፡ {totalCurrentSum.toLocaleString()}</span>
              <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">የዘገየ፡ {totalLateSum.toLocaleString()}</span>
              <span className="text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">ነባር፡ {totalBacklogSum.toLocaleString()}</span>
              <span className="text-slate-900 font-black bg-slate-100 px-2.5 py-0.5 rounded border border-slate-300">ጠቅላላ፡ {grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
            {/* 1. ልደት */}
            <div className="rounded-xl border border-emerald-200 bg-white/95 p-3.5 space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2 text-slate-900">
                <Baby className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-bold">የልደት ምዝገባ</h3>
              </div>
              <div className="p-1.5 rounded bg-emerald-50/80 border border-emerald-100 text-[10px] text-emerald-900 space-y-0.5">
                <div>• ወቅታዊ፡ <strong>በተወለደ በ90 ቀናት</strong> (ነፃ)</div>
                <div>• የዘገየ፡ <strong>ከ90 ቀን እስከ 1 ዓመት</strong></div>
                <div>• ነባር፡ <strong>ከ1 ዓመት በኋላ</strong></div>
              </div>

              <div className="space-y-1.5">
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-800 mb-0.5">ወቅታዊ (በ90 ቀናት)</label>
                  <input
                    type="number"
                    min={0}
                    value={birthCurrent}
                    onChange={(e) => setBirthCurrent(Number(e.target.value))}
                    className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-mono text-slate-900 focus:border-emerald-500 focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-800 mb-0.5">የዘገየ (90 ቀን - 1 ዓመት)</label>
                  <input
                    type="number"
                    min={0}
                    value={birthLate}
                    onChange={(e) => setBirthLate(Number(e.target.value))}
                    className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-mono text-slate-900 focus:border-amber-500 focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-purple-800 mb-0.5">ነባር (ከ1 ዓመት በኋላ)</label>
                  <input
                    type="number"
                    min={0}
                    value={birthBacklog}
                    onChange={(e) => setBirthBacklog(Number(e.target.value))}
                    className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-mono text-slate-900 focus:border-purple-500 focus:outline-none shadow-xs"
                  />
                </div>
                <div className="pt-1 text-[10px] text-right font-mono text-slate-500">
                  ድምር፡ <strong className="text-slate-800 font-bold">{(birthCurrent + birthLate + birthBacklog).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* 2. ሞት */}
            <div className="rounded-xl border border-rose-200 bg-white/95 p-3.5 space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2 text-slate-900">
                <FileCheck2 className="h-4 w-4 text-rose-600" />
                <h3 className="text-xs font-bold">የሞት ምዝገባ</h3>
              </div>
              <div className="p-1.5 rounded bg-rose-50/80 border border-rose-100 text-[10px] text-rose-900 space-y-0.5">
                <div>• ወቅታዊ፡ <strong>እስከ 50 ቀናት</strong> (ነፃ)</div>
                <div>• የዘገየ፡ <strong>ከ50 ቀን እስከ 1 ዓመት</strong></div>
                <div>• ነባር፡ <strong>ከ1 ዓመት በኋላ</strong></div>
              </div>

              <div className="space-y-1.5">
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-800 mb-0.5">ወቅታዊ (እስከ 50 ቀናት)</label>
                  <input
                    type="number"
                    min={0}
                    value={deathCurrent}
                    onChange={(e) => setDeathCurrent(Number(e.target.value))}
                    className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-mono text-slate-900 focus:border-emerald-500 focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-800 mb-0.5">የዘገየ (50 ቀን - 1 ዓመት)</label>
                  <input
                    type="number"
                    min={0}
                    value={deathLate}
                    onChange={(e) => setDeathLate(Number(e.target.value))}
                    className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-mono text-slate-900 focus:border-amber-500 focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-purple-800 mb-0.5">ነባር (ከ1 ዓመት በኋላ)</label>
                  <input
                    type="number"
                    min={0}
                    value={deathBacklog}
                    onChange={(e) => setDeathBacklog(Number(e.target.value))}
                    className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-mono text-slate-900 focus:border-purple-500 focus:outline-none shadow-xs"
                  />
                </div>
                <div className="pt-1 text-[10px] text-right font-mono text-slate-500">
                  ድምር፡ <strong className="text-slate-800 font-bold">{(deathCurrent + deathLate + deathBacklog).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* 3. ጋብቻ */}
            <div className="rounded-xl border border-sky-200 bg-white/95 p-3.5 space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2 text-slate-900">
                <Heart className="h-4 w-4 text-sky-600" />
                <h3 className="text-xs font-bold">የጋብቻ ምዝገባ</h3>
              </div>
              <div className="p-1.5 rounded bg-sky-50/80 border border-sky-100 text-[10px] text-sky-900 space-y-0.5">
                <div>• ወቅታዊ፡ <strong>በተጋቡ በ30 ቀናት</strong> (ነፃ)</div>
                <div>• የዘገየ፡ <strong>ከ31 ቀናት እስከ 1 ዓመት</strong></div>
                <div>• ነባር፡ <strong>ከ1 ዓመት በኋላ</strong></div>
              </div>

              <div className="space-y-1.5">
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-800 mb-0.5">ወቅታዊ (በ30 ቀናት)</label>
                  <input
                    type="number"
                    min={0}
                    value={marriageCurrent}
                    onChange={(e) => setMarriageCurrent(Number(e.target.value))}
                    className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-mono text-slate-900 focus:border-emerald-500 focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-800 mb-0.5">የዘገየ (31 ቀን - 1 ዓመት)</label>
                  <input
                    type="number"
                    min={0}
                    value={marriageLate}
                    onChange={(e) => setMarriageLate(Number(e.target.value))}
                    className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-mono text-slate-900 focus:border-amber-500 focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-purple-800 mb-0.5">ነባር (ከ1 ዓመት በኋላ)</label>
                  <input
                    type="number"
                    min={0}
                    value={marriageBacklog}
                    onChange={(e) => setMarriageBacklog(Number(e.target.value))}
                    className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-mono text-slate-900 focus:border-purple-500 focus:outline-none shadow-xs"
                  />
                </div>
                <div className="pt-1 text-[10px] text-right font-mono text-slate-500">
                  ድምር፡ <strong className="text-slate-800 font-bold">{(marriageCurrent + marriageLate + marriageBacklog).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* 4. ፍቺ */}
            <div className="rounded-xl border border-amber-200 bg-white/95 p-3.5 space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2 text-slate-900">
                <HeartHandshake className="h-4 w-4 text-amber-600" />
                <h3 className="text-xs font-bold">የፍቺ ምዝገባ</h3>
              </div>
              <div className="p-1.5 rounded bg-amber-50/80 border border-amber-100 text-[10px] text-amber-900 space-y-0.5">
                <div>• ወቅታዊ፡ <strong>በፍቺ በ30 ቀናት</strong> (ነፃ)</div>
                <div>• የዘገየ፡ <strong>ከ31 ቀናት እስከ 1 ዓመት</strong></div>
                <div>• ነባር፡ <strong>ከ1 ዓመት በኋላ</strong></div>
              </div>

              <div className="space-y-1.5">
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-800 mb-0.5">ወቅታዊ (በ30 ቀናት)</label>
                  <input
                    type="number"
                    min={0}
                    value={divorceCurrent}
                    onChange={(e) => setDivorceCurrent(Number(e.target.value))}
                    className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-mono text-slate-900 focus:border-emerald-500 focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-800 mb-0.5">የዘገየ (31 ቀን - 1 ዓመት)</label>
                  <input
                    type="number"
                    min={0}
                    value={divorceLate}
                    onChange={(e) => setDivorceLate(Number(e.target.value))}
                    className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-mono text-slate-900 focus:border-amber-500 focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-purple-800 mb-0.5">ነባር (ከ1 ዓመት በኋላ)</label>
                  <input
                    type="number"
                    min={0}
                    value={divorceBacklog}
                    onChange={(e) => setDivorceBacklog(Number(e.target.value))}
                    className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-mono text-slate-900 focus:border-purple-500 focus:outline-none shadow-xs"
                  />
                </div>
                <div className="pt-1 text-[10px] text-right font-mono text-slate-500">
                  ድምር፡ <strong className="text-slate-800 font-bold">{(divorceCurrent + divorceLate + divorceBacklog).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* 5. ጉዲፈቻ */}
            <div className="rounded-xl border border-purple-200 bg-white/95 p-3.5 space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2 text-slate-900">
                <UserCheck className="h-4 w-4 text-purple-600" />
                <h3 className="text-xs font-bold">የጉዲፈቻ ምዝገባ</h3>
              </div>
              <div className="p-1.5 rounded bg-purple-50/80 border border-purple-100 text-[10px] text-purple-900 space-y-0.5">
                <div>• ወቅታዊ፡ <strong>በጉዲፈቻ በ30 ቀናት</strong> (ነፃ)</div>
                <div>• የዘገየ፡ <strong>ከ31 ቀናት እስከ 1 ዓመት</strong></div>
                <div>• ነባር፡ <strong>ከ1 ዓመት በኋላ</strong></div>
              </div>

              <div className="space-y-1.5">
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-800 mb-0.5">ወቅታዊ (በ30 ቀናት)</label>
                  <input
                    type="number"
                    min={0}
                    value={adoptionCurrent}
                    onChange={(e) => setAdoptionCurrent(Number(e.target.value))}
                    className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-mono text-slate-900 focus:border-emerald-500 focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-800 mb-0.5">የዘገየ (31 ቀን - 1 ዓመት)</label>
                  <input
                    type="number"
                    min={0}
                    value={adoptionLate}
                    onChange={(e) => setAdoptionLate(Number(e.target.value))}
                    className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-mono text-slate-900 focus:border-amber-500 focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-purple-800 mb-0.5">ነባር (ከ1 ዓመት በኋላ)</label>
                  <input
                    type="number"
                    min={0}
                    value={adoptionBacklog}
                    onChange={(e) => setAdoptionBacklog(Number(e.target.value))}
                    className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-mono text-slate-900 focus:border-purple-500 focus:outline-none shadow-xs"
                  />
                </div>
                <div className="pt-1 text-[10px] text-right font-mono text-slate-500">
                  ድምር፡ <strong className="text-slate-800 font-bold">{(adoptionCurrent + adoptionLate + adoptionBacklog).toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Submission Action */}
        <div className="rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-6 space-y-4 shadow-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">የዞኑ ማጠቃለያ ማስታወሻ ወይም አስተያየት</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ለምሳሌ፡ ከሩቅ ወረዳዎች የዘገዩና ነባር የምዝገባ መረጃዎች በቃለ-መሀላ ተረጋግጠው ተካትተዋል..."
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none shadow-xs"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-600">
              አጠቃላይ የሚላከው፡ <strong className="text-slate-900 font-mono text-sm">{grandTotal.toLocaleString()}</strong> ኩነቶች (ወቅታዊ፡ {totalCurrentSum} | የዘገየ፡ {totalLateSum} | ነባር፡ {totalBacklogSum})
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-3 text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>ሪፖርቱን ለክልሉ አስተዳዳሪ ላክ</span>
            </button>
          </div>
        </div>
      </form>

      {/* History of Past Submissions by this Zone */}
      <div className="rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          የ{activeZone.name} ያለፉት ወራት የሪፖርት መዝገብ
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider font-mono">
                <th className="py-2.5 px-3">የሪፖርት ወቅት</th>
                <th className="py-2.5 px-3 text-right">የልደት (ወቅታዊ/የዘገየ/ነባር)</th>
                <th className="py-2.5 px-3 text-right">የሞት (ወቅታዊ/የዘገየ/ነባር)</th>
                <th className="py-2.5 px-3 text-right">የጋብቻ (ወቅታዊ/የዘገየ/ነባር)</th>
                <th className="py-2.5 px-3 text-right">የፍቺና ጉዲፈቻ</th>
                <th className="py-2.5 px-3 text-right">አጠቃላይ ድምር</th>
                <th className="py-2.5 px-3">ሁኔታ</th>
                <th className="py-2.5 px-3 text-center">ተግባር (አትም)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {zoneHistory.map((sub, idx) => {
                const bCur = sub.birth?.current || 0, bLate = sub.birth?.late || 0, bBack = sub.birth?.backlog || 0;
                const dCur = sub.death?.current || 0, dLate = sub.death?.late || 0, dBack = sub.death?.backlog || 0;
                const mCur = sub.marriage?.current || 0, mLate = sub.marriage?.late || 0, mBack = sub.marriage?.backlog || 0;
                const divCur = sub.divorce?.current || 0, divLate = sub.divorce?.late || 0, divBack = sub.divorce?.backlog || 0;
                const adCur = sub.adoption?.current || 0, adLate = sub.adoption?.late || 0, adBack = sub.adoption?.backlog || 0;
                const cur = bCur + dCur + mCur + divCur + adCur;
                const late = bLate + dLate + mLate + divLate + adLate;
                const back = bBack + dBack + mBack + divBack + adBack;
                const grand = cur + late + back;
                return (
                  <tr key={`${sub.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-sans text-slate-900 font-semibold">
                      {sub.monthNameAm} {sub.year}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      <span className="text-emerald-700 font-bold">{bCur}</span> / <span className="text-amber-700 font-bold">{bLate}</span> / <span className="text-purple-700 font-bold">{bBack}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      <span className="text-emerald-700 font-bold">{dCur}</span> / <span className="text-amber-700 font-bold">{dLate}</span> / <span className="text-purple-700 font-bold">{dBack}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      <span className="text-emerald-700 font-bold">{mCur}</span> / <span className="text-amber-700 font-bold">{mLate}</span> / <span className="text-purple-700 font-bold">{mBack}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      <span className="text-emerald-700 font-bold">{divCur + adCur}</span> / <span className="text-amber-700 font-bold">{divLate + adLate}</span> / <span className="text-purple-700 font-bold">{divBack + adBack}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-900 font-bold">
                      {grand.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenPrintDossier(sub)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-slate-300 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
                        title="ይህን ሪፖርት አትም"
                      >
                        <Printer className="h-3.5 w-3.5 text-emerald-600" />
                        <span>አትም</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ZONE MESSAGE REQUESTS TO REGIONAL ADMIN & ADMIN REPLIES FEED */}
      <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/20">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  ለክልሉ አስተዳዳሪ የድጋፍ፣ የአቅርቦትና የህግ ጥያቄ መላኪያ
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 font-mono">
                  {thisZoneMessages.length} ጥያቄዎች
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                የሰርተፊኬት ወረቀት እጥረት፣ የኔትወርክ፣ የሲስተም ድጋፍ ወይም የህግ ማብራሪያ ጥያቄዎችን ለክልሉ ይላኩ፤ አስተዳዳሪው የሚሰጠውን ይፋዊ ምላሽ (Replay) እዚህ ያገኛሉ።
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsComposingMsg(!isComposingMsg)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-xs transition-colors cursor-pointer shrink-0"
          >
            {isComposingMsg ? (
              <span>ቅጹን ዝጋ</span>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>አዲስ ጥያቄ ለክልሉ ላክ</span>
              </>
            )}
          </button>
        </div>

        {/* Success Toast */}
        {msgSuccessToast && (
          <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs animate-fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{msgSuccessToast}</span>
          </div>
        )}

        {/* Message Composition Form */}
        {isComposingMsg && (
          <form onSubmit={handleSendMessageToAdmin} className="rounded-xl border border-amber-300 bg-amber-50/50 p-5 sm:p-6 space-y-4 animate-fade-in">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Send className="h-4 w-4 text-amber-600" />
              <span>አዲስ የድጋፍና የመልእክት ጥያቄ ቅጽ (ለክልሉ ማዕከላዊ አስተዳዳሪ)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700">የጥያቄው ርዕስ *</label>
                <input
                  type="text"
                  required
                  value={reqSubject}
                  onChange={(e) => setReqSubject(e.target.value)}
                  placeholder="ለምሳሌ፡ የልደት ሰርተፊኬት ደህንነቱ የተጠበቀ ወረቀት እጥረት ማሟያ ጥያቄ"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">የጥያቄው ዘርፍ</label>
                <select
                  value={reqCategory}
                  onChange={(e) => setReqCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  <option value="supplies">📦 የቁሳቁስና ቅጾች አቅርቦት</option>
                  <option value="system_support">💻 የስርዓትና አይቲ ድጋፍ</option>
                  <option value="legal_inquiry">⚖️ የህግና ደንብ ማብራሪያ</option>
                  <option value="urgent_request">🚨 አስቸኳይ ጥያቄ</option>
                  <option value="general">📝 አጠቃላይ</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">የቅድሚያ ደረጃ</label>
                <div className="flex items-center gap-3 pt-1">
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="reqPriority"
                      checked={reqPriority === 'normal'}
                      onChange={() => setReqPriority('normal')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>መደበኛ</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-amber-800 font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="reqPriority"
                      checked={reqPriority === 'high'}
                      onChange={() => setReqPriority('high')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>ከፍተኛ (High)</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-rose-800 font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="reqPriority"
                      checked={reqPriority === 'urgent'}
                      onChange={() => setReqPriority('urgent')}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>🚨 አስቸኳይ (Urgent)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">የሚመለከተው ወረዳ / አካባቢ (አማራጭ)</label>
                <input
                  type="text"
                  value={reqWoreda}
                  onChange={(e) => setReqWoreda(e.target.value)}
                  placeholder="ለምሳሌ፡ ሆሳዕና ከተማ፣ ሶሮ ወረዳ"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">የጥያቄው ዝርዝር ማብራሪያ *</label>
              <textarea
                required
                rows={4}
                value={reqBody}
                onChange={(e) => setReqBody(e.target.value)}
                placeholder="የሚያስፈልገውን እገዛ፣ የቁሳቁስ ብዛት፣ ወይም የህግ ማብራሪያ ዝርዝር እዚህ ያብራሩ..."
                className="w-full p-3 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsComposingMsg(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                ሰርዝ
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-xs transition-colors cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>ጥያቄውን ለክልሉ ላክ</span>
              </button>
            </div>
          </form>
        )}

        {/* Existing Messages & Replies Feed */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            የ{activeZone.name} የተመዘገቡ ጥያቄዎችና የክልሉ ምላሾች ({thisZoneMessages.length})፦
          </span>

          {thisZoneMessages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center space-y-2">
              <MessageSquare className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-600">እስካሁን ለክልሉ የተላከ የድጋፍ ጥያቄ የለም።</p>
              <p className="text-[11px] text-slate-400">
                የሰርተፊኬት ወረቀት ወይም የሲስተም ድጋፍ ካስፈለገዎት ከላይ 'አዲስ ጥያቄ ለክልሉ ላክ' የሚለውን ይጫኑ።
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {thisZoneMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 space-y-3 shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                        {msg.categoryAm}
                      </span>
                      {msg.priority === 'urgent' && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-300">
                          🚨 አስቸኳይ
                        </span>
                      )}
                      {msg.priority === 'high' && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-300">
                          ከፍተኛ
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">{msg.createdAt}</span>
                    </div>

                    <div>
                      {msg.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 font-bold text-[10px] border border-amber-300">
                          <Clock className="h-3 w-3 text-amber-600" />
                          <span>ምላሽ በመጠባበቅ ላይ</span>
                        </span>
                      )}
                      {msg.status === 'replied' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 font-bold text-[10px] border border-emerald-300">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>ምላሽ ተሰጥቷል</span>
                        </span>
                      )}
                      {msg.status === 'resolved' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-900 font-bold text-[10px] border border-cyan-300">
                          <span>✨ የተፈታ</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{msg.subject}</h5>

                  {msg.woredaAffected && (
                    <div className="text-[11px] text-amber-900 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-amber-600" />
                      <span>የሚመለከተው ወረዳ፦ {msg.woredaAffected}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {msg.message}
                  </p>

                  {/* Admin Replies */}
                  {msg.replies && msg.replies.length > 0 && (
                    <div className="pt-2 space-y-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-900">
                        <CornerDownRight className="h-3.5 w-3.5 text-cyan-700" />
                        <span>ከክልሉ ማዕከላዊ አስተዳዳሪ የተሰጠ ይፋዊ ምላሽ፦</span>
                      </div>
                      <div className="space-y-2 pl-3 border-l-2 border-cyan-500">
                        {msg.replies.map((rep) => (
                          <div key={rep.id} className="rounded-lg bg-cyan-50/80 border border-cyan-200/90 p-3 space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-cyan-950 flex items-center gap-1">
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* OFFICIAL PRINTABLE ZONAL REPORT DOSSIER MODAL (ፕሪንት ማድረግ)              */}
      {/* ========================================================================= */}
      {isPrintModalOpen && printableDossier && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
          <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-300 shadow-2xl p-6 sm:p-8 space-y-6 my-auto print:border-none print:shadow-none print:p-0 print:max-w-none">
            {/* Modal Controls (Hidden in Print) */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  የ{activeZone.name} ይፋዊ ወርሃዊ ሪፖርት ሰነድ ማተሚያ (Print Preview)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
                >
                  <Printer className="h-4 w-4" />
                  <span>🖨️ በአሳሽ አትም (Print / Ctrl+P)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPrintModalOpen(false);
                    setPrintableDossier(null);
                  }}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Print Document Content */}
            <div className="p-6 sm:p-8 border border-slate-200 rounded-xl space-y-6 bg-white text-slate-900 print:border-none print:p-0">
              {/* Document Header & State Emblem */}
              <div className="border-b-2 border-slate-900 pb-5 text-center space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-600">
                  <div className="text-left">
                    <div>የሰነድ ቁጥር፡ <strong className="text-slate-900">ማኢ/ወኩ-{activeZone.id.toUpperCase()}-ሪፖ-{printableDossier.year}/{String(printableDossier.month).padStart(2, '0')}</strong></div>
                    <div>ቀን፡ <strong className="text-slate-900">{printableDossier.submittedAt || ethToday.fullFormatted}</strong></div>
                    <div>የደህንነት ኮድ፡ <strong className="text-emerald-700">SEC-ZONE-{activeZone.id.toUpperCase()}-VALID</strong></div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-700 via-teal-800 to-cyan-900 text-white flex items-center justify-center font-extrabold shadow-md mb-1">
                      <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">ይፋዊ ማህተም</span>
                  </div>

                  <div className="text-right">
                    <div>የሪፖርት ወቅት፡ <strong className="text-slate-900">{printableDossier.monthNameAm} {printableDossier.year} ዓ.ም</strong></div>
                    <div>ቅርንጫፍ ጽ/ቤት፡ <strong className="text-slate-900">{activeZone.name}</strong></div>
                    <div>አስተባባሪ፡ <strong className="text-slate-900">{activeZone.officerName}</strong></div>
                  </div>
                </div>

                <div className="pt-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                    የማዕከላዊ ኢትዮጵያ ብሔራዊ ክልላዊ መንግሥት
                  </h1>
                  <h2 className="text-base font-bold text-emerald-800">
                    የሲቪልና ቤተሰብ ምዝገባ ኤጀንሲ - የ{activeZone.name} ቅርንጫፍ ጽሕፈት ቤት
                  </h2>
                  <h3 className="text-sm font-semibold text-slate-700 pt-0.5">
                    ይፋዊ የወሳኝ ኩነቶች ወርሃዊ የትንታኔ ሪፖርት ሰነድ
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    ሪፖርት ያቀረቡ ወረዳዎች፦ <strong className="text-slate-800">{printableDossier.reportingWoredasCount}</strong> | ቀበሌዎች፦ <strong className="text-slate-800">{printableDossier.reportingKebelesCount}</strong>
                  </p>
                </div>
              </div>

              {/* Comprehensive Statutory Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>የወሳኝ ኩነቶች ምዝገባ በ3ቱ ህጋዊ የጊዜ ገደቦች ማጠቃለያ፦</span>
                  <span className="text-[11px] font-normal text-slate-500">ተመን፡ ወቅታዊ 0 ብር (ነፃ) | የዘገየ 500 ETB ቅጣት</span>
                </div>

                {(() => {
                  const bCur = printableDossier.birth?.current || 0, bLate = printableDossier.birth?.late || 0, bBack = printableDossier.birth?.backlog || 0;
                  const dCur = printableDossier.death?.current || 0, dLate = printableDossier.death?.late || 0, dBack = printableDossier.death?.backlog || 0;
                  const mCur = printableDossier.marriage?.current || 0, mLate = printableDossier.marriage?.late || 0, mBack = printableDossier.marriage?.backlog || 0;
                  const divCur = printableDossier.divorce?.current || 0, divLate = printableDossier.divorce?.late || 0, divBack = printableDossier.divorce?.backlog || 0;
                  const adCur = printableDossier.adoption?.current || 0, adLate = printableDossier.adoption?.late || 0, adBack = printableDossier.adoption?.backlog || 0;

                  const totalCur = bCur + dCur + mCur + divCur + adCur;
                  const totalLate = bLate + dLate + mLate + divLate + adLate;
                  const totalBack = bBack + dBack + mBack + divBack + adBack;
                  const grand = totalCur + totalLate + totalBack;
                  const onTimePct = grand > 0 ? ((totalCur / grand) * 100).toFixed(1) : '0';
                  const penaltyCollected = totalLate * 500;

                  const rows = [
                    { name: 'የልደት ምዝገባ', limit: 'በተወለደ በ90 ቀናት (የዘገየ፡ 90ቀን-1ዓመት | ነባር፡ >1ዓመት)', cur: bCur, late: bLate, back: bBack },
                    { name: 'የሞት ምዝገባ', limit: 'ከሞተ እስከ 50 ቀናት (የዘገየ፡ 50ቀን-1ዓመት | ነባር፡ >1ዓመት)', cur: dCur, late: dLate, back: dBack },
                    { name: 'የጋብቻ ምዝገባ', limit: 'በተጋቡ በ30 ቀናት (የዘገየ፡ 31ቀን-1ዓመት | ነባር፡ >1ዓመት)', cur: mCur, late: mLate, back: mBack },
                    { name: 'የፍቺ ምዝገባ', limit: 'በፍቺ ውሳኔ በ30 ቀናት (የዘገየ፡ 31ቀን-1ዓመት | ነባር፡ >1ዓመት)', cur: divCur, late: divLate, back: divBack },
                    { name: 'የጉዲፈቻ ምዝገባ', limit: 'በጉዲፈቻ ውሳኔ በ30 ቀናት (የዘገየ፡ 31ቀን-1ዓመት | ነባር፡ >1ዓመት)', cur: adCur, late: adLate, back: adBack },
                  ];

                  return (
                    <>
                      <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                        <thead className="bg-slate-100 text-slate-800 uppercase font-mono text-[10px]">
                          <tr>
                            <th className="py-2 px-3 border border-slate-300">የኩነት ዓይነት</th>
                            <th className="py-2 px-3 border border-slate-300">ህጋዊ የጊዜ ገደብ</th>
                            <th className="py-2 px-3 border border-slate-300 text-right">ወቅታዊ (0 ብር)</th>
                            <th className="py-2 px-3 border border-slate-300 text-right">የዘገየ (500 ETB)</th>
                            <th className="py-2 px-3 border border-slate-300 text-right">ነባር (&gt;1 ዓመት)</th>
                            <th className="py-2 px-3 border border-slate-300 text-right">አጠቃላይ ድምር</th>
                            <th className="py-2 px-3 border border-slate-300 text-right">ወቅታዊ ምጣኔ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-mono">
                          {rows.map((r, i) => {
                            const rTot = r.cur + r.late + r.back;
                            const rCurPct = rTot > 0 ? ((r.cur / rTot) * 100).toFixed(1) : '0.0';
                            return (
                              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                                <td className="py-2 px-3 border border-slate-200 font-sans font-bold text-slate-900">{r.name}</td>
                                <td className="py-2 px-3 border border-slate-200 text-slate-600 font-sans text-[11px]">{r.limit}</td>
                                <td className="py-2 px-3 border border-slate-200 text-right text-emerald-700 font-bold">{r.cur.toLocaleString()}</td>
                                <td className="py-2 px-3 border border-slate-200 text-right text-amber-700 font-bold">{r.late.toLocaleString()}</td>
                                <td className="py-2 px-3 border border-slate-200 text-right text-purple-700 font-bold">{r.back.toLocaleString()}</td>
                                <td className="py-2 px-3 border border-slate-200 text-right text-slate-950 font-black">{rTot.toLocaleString()}</td>
                                <td className="py-2 px-3 border border-slate-200 text-right font-bold text-emerald-800">{rCurPct}%</td>
                              </tr>
                            );
                          })}
                          <tr className="bg-slate-100 font-bold">
                            <td colSpan={2} className="py-2.5 px-3 border border-slate-300 font-sans text-slate-950">
                              የ{activeZone.name} ጠቅላላ ድምር
                            </td>
                            <td className="py-2.5 px-3 border border-slate-300 text-right text-emerald-800 font-black">{totalCur.toLocaleString()}</td>
                            <td className="py-2.5 px-3 border border-slate-300 text-right text-amber-800 font-black">{totalLate.toLocaleString()}</td>
                            <td className="py-2.5 px-3 border border-slate-300 text-right text-purple-800 font-black">{totalBack.toLocaleString()}</td>
                            <td className="py-2.5 px-3 border border-slate-300 text-right text-slate-950 font-black">{grand.toLocaleString()}</td>
                            <td className="py-2.5 px-3 border border-slate-300 text-right text-emerald-800 font-black">{onTimePct}%</td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Revenue & Notes Summary */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                          <span className="text-[11px] font-bold text-slate-700 block">የተሰበሰበ ህጋዊ የቅጣት ገቢ፦</span>
                          <div className="text-lg font-black font-mono text-amber-800">
                            {penaltyCollected.toLocaleString()} የኢትዮጵያ ብር (ETB)
                          </div>
                          <p className="text-[10px] text-slate-500">
                            ከ{totalLate.toLocaleString()} የዘገዩ ምዝገባዎች በእያንዳንዳቸው በ500 ብር ተመን ተሰብስቦ ወደ ክልሉ ገቢ ተደርጓል።
                          </p>
                        </div>

                        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                          <span className="text-[11px] font-bold text-slate-700 block">የዞኑ ማጠቃለያ ማስታወሻ፦</span>
                          <p className="text-xs text-slate-700 italic">
                            "{printableDossier.notes || 'ከሁሉም ወረዳዎች እና ቀበሌዎች የተጠናከረ ወርሃዊ የወሳኝ ኩነቶች ምዝገባ ሪፖርት።'}"
                          </p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Official Stamp & Coordinator Signature Box */}
              <div className="pt-6 border-t-2 border-slate-800 grid grid-cols-2 gap-8 text-xs">
                <div className="space-y-2">
                  <span className="font-bold text-slate-900 block text-[11px] uppercase">
                    ያረጋገጠው የዞኑ አስተባባሪ፦
                  </span>
                  <div className="h-10 border-b border-dashed border-slate-400" />
                  <div className="text-[11px] text-slate-700 space-y-0.5">
                    <div>ስም፦ <strong>{activeZone.officerName}</strong></div>
                    <div>የስራ መደብ፦ <strong>የ{activeZone.name} የወሳኝ ኩነቶች አስተባባሪ</strong></div>
                    <div>ስልክ ቁጥር፦ <strong className="font-mono">{activeZone.officerPhone}</strong></div>
                    <div>ቀን፦ <strong className="font-mono">{printableDossier.submittedAt || ethToday.fullFormatted}</strong></div>
                  </div>
                </div>

                <div className="space-y-2 text-center">
                  <span className="font-bold text-slate-900 block text-[11px] uppercase">
                    የዞኑ ቅርንጫፍ ጽሕፈት ቤት ይፋዊ ማህተም፦
                  </span>
                  <div className="h-20 w-20 mx-auto rounded-full border-2 border-dashed border-emerald-700 flex items-center justify-center text-emerald-800 font-bold text-[9px] uppercase tracking-tighter text-center">
                    የ{activeZone.name}<br />ቅርንጫፍ<br />ማህተም
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    መለያ፦ SEAL-{activeZone.id.toUpperCase()}-CONFIRMED
                  </div>
                </div>
              </div>

              {/* Legal Footer Notice */}
              <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-500 flex items-center justify-between">
                <span>ይህ ሰነድ የማዕከላዊ ኢትዮጵያ ክልል የወሳኝ ኩነቶች ዲጂታል ፖርታል ይፋዊ የዞን ሪፖርት ማረጋገጫ ሰነድ ነው።</span>
                <span className="font-mono">ገጽ 1 / 1</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
