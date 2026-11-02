import React, { useState } from 'react';
import { 
  gregorianToEthiopian, 
  ethiopianToGregorianDate, 
  getCurrentEthiopianDate, 
  ETHIOPIAN_MONTH_NAMES, 
  ETHIOPIAN_WEEKDAY_NAMES,
  EthiopianDate 
} from '../utils/ethiopianCalendar';
import { Calendar, ArrowRightLeft, Clock, CheckCircle2, Info, Sparkles } from 'lucide-react';

interface EthiopianCalendarConverterWidgetProps {
  compact?: boolean;
  className?: string;
}

export const EthiopianCalendarConverterWidget: React.FC<EthiopianCalendarConverterWidgetProps> = ({
  compact = false,
  className = ''
}) => {
  const todayEth = getCurrentEthiopianDate();

  // Mode: 'gregToEth' or 'ethToGreg'
  const [conversionMode, setConversionMode] = useState<'gregToEth' | 'ethToGreg'>('gregToEth');

  // Gregorian input state (default to today: 2026-10-04)
  const [gregDateStr, setGregDateStr] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  // Ethiopian input state (default to today: 2019, መስከረም, 24)
  const [ethYear, setEthYear] = useState<number>(todayEth.year);
  const [ethMonth, setEthMonth] = useState<number>(todayEth.month);
  const [ethDay, setEthDay] = useState<number>(todayEth.day);

  // Converted results
  const convertedFromGreg: EthiopianDate = gregorianToEthiopian(gregDateStr);

  const convertedGregDate: Date = ethiopianToGregorianDate(ethYear, ethMonth, ethDay);
  const gregConvertedStr = !isNaN(convertedGregDate.getTime()) 
    ? convertedGregDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'ትክክለኛ ያልሆነ ቀን';

  const gregIsoConverted = !isNaN(convertedGregDate.getTime())
    ? convertedGregDate.toISOString().slice(0, 10)
    : '';

  const handleSetToday = () => {
    const now = new Date();
    setGregDateStr(now.toISOString().slice(0, 10));
    setEthYear(todayEth.year);
    setEthMonth(todayEth.month);
    setEthDay(todayEth.day);
  };

  const handleSetEnkutatash = () => {
    // መስከረም 1, 2019
    setEthYear(2019);
    setEthMonth(1);
    setEthDay(1);
    setGregDateStr('2026-09-11');
  };

  return (
    <div className={`rounded-2xl border border-emerald-300/80 bg-white/90 backdrop-blur-md p-5 sm:p-6 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-700 shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                የኢትዮጵያ እና የፈረንጆች (Gregorian) ዘመን አቆጣጠር መለወጫ
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-[10px] font-bold text-emerald-800">
                13 ወራት
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              መደበኛ የፈረንጆች ቀናትን ወደ ኢትዮጵያ ካላንደር ለወርሃዊ ሪፖርትና ዳሽቦርድ መመልከቻ መለወጫ
            </p>
          </div>
        </div>

        {/* Live today badge */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-xs font-mono text-emerald-800 font-bold flex items-center gap-1.5 shadow-xs">
            <Clock className="h-3.5 w-3.5 text-emerald-600" />
            <span>ዛሬ፡ {todayEth.fullFormatted} ({todayEth.weekdayName})</span>
          </div>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 mb-5">
        <button
          type="button"
          onClick={() => setConversionMode('gregToEth')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            conversionMode === 'gregToEth'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <span>ከፈረንጆች (G.C.) ➔ ወደ ኢትዮጵያ (E.C.)</span>
        </button>
        <button
          type="button"
          onClick={() => setConversionMode('ethToGreg')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            conversionMode === 'ethToGreg'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <span>ከኢትዮጵያ (E.C.) ➔ ወደ ፈረንጆች (G.C.)</span>
        </button>
      </div>

      {/* Mode 1: Gregorian to Ethiopian */}
      {conversionMode === 'gregToEth' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Input Gregorian Date */}
            <div className="md:col-span-5 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                የፈረንጆች ቀን ይምረጡ ወይም ያስገቡ (Gregorian Date)
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={gregDateStr}
                  onChange={(e) => setGregDateStr(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 font-mono focus:border-emerald-500 focus:outline-none shadow-xs"
                />
              </div>
              <div className="flex items-center gap-2 pt-1 text-[11px]">
                <button
                  type="button"
                  onClick={handleSetToday}
                  className="px-2 py-1 rounded bg-slate-100 text-emerald-800 hover:bg-slate-200 cursor-pointer font-medium border border-slate-200"
                >
                  ዛሬ (2026-10-04)
                </button>
                <button
                  type="button"
                  onClick={() => setGregDateStr('2026-09-11')}
                  className="px-2 py-1 rounded bg-slate-100 text-cyan-800 hover:bg-slate-200 cursor-pointer font-medium border border-slate-200"
                >
                  እንቁጣጣሽ 2019 (2026-09-11)
                </button>
              </div>
            </div>

            {/* Arrow Divider */}
            <div className="md:col-span-2 flex justify-center py-2">
              <div className="h-9 w-9 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-xs">
                <ArrowRightLeft className="h-4 w-4" />
              </div>
            </div>

            {/* Output Ethiopian Date Result */}
            <div className="md:col-span-5 rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  የተለወጠው የኢትዮጵያ ቀን
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  ዓ.ም (E.C.)
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {convertedFromGreg.fullFormatted}
              </div>
              <div className="text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>ዕለት፦ {convertedFromGreg.weekdayName} | ቁጥራዊ፦ {convertedFromGreg.formatted}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Mode 2: Ethiopian to Gregorian */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Input Ethiopian Date */}
            <div className="md:col-span-6 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                የኢትዮጵያን ቀን፣ ወር እና ዓመተ ምህረት ይምረጡ
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">ቀን</label>
                  <select
                    value={ethDay}
                    onChange={(e) => setEthDay(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs text-slate-900 font-mono focus:border-cyan-500 focus:outline-none shadow-xs"
                  >
                    {Array.from({ length: ethMonth === 13 ? 6 : 30 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">ወር</label>
                  <select
                    value={ethMonth}
                    onChange={(e) => setEthMonth(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none shadow-xs"
                  >
                    {ETHIOPIAN_MONTH_NAMES.map((m, idx) => (
                      <option key={idx} value={idx + 1}>{m} ({idx + 1})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">ዓመተ ምህረት</label>
                  <select
                    value={ethYear}
                    onChange={(e) => setEthYear(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs text-slate-900 font-mono focus:border-cyan-500 focus:outline-none shadow-xs"
                  >
                    {[2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012].map((y) => (
                      <option key={y} value={y}>{y} ዓ.ም</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 text-[11px]">
                <button
                  type="button"
                  onClick={handleSetToday}
                  className="px-2 py-1 rounded bg-slate-100 text-cyan-800 hover:bg-slate-200 cursor-pointer font-medium border border-slate-200"
                >
                  ዛሬ (መስከረም 24/ 2019)
                </button>
                <button
                  type="button"
                  onClick={handleSetEnkutatash}
                  className="px-2 py-1 rounded bg-slate-100 text-emerald-800 hover:bg-slate-200 cursor-pointer font-medium border border-slate-200"
                >
                  እንቁጣጣሽ (መስከረም 1)
                </button>
              </div>
            </div>

            {/* Arrow Divider */}
            <div className="md:col-span-1 flex justify-center py-2">
              <div className="h-9 w-9 rounded-full bg-cyan-100 border border-cyan-300 flex items-center justify-center text-cyan-700 shadow-xs">
                <ArrowRightLeft className="h-4 w-4" />
              </div>
            </div>

            {/* Output Gregorian Date Result */}
            <div className="md:col-span-5 rounded-xl border border-cyan-300 bg-cyan-50/80 p-4 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800">
                  የተለወጠው የፈረንጆች ቀን (G.C.)
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {gregIsoConverted}
                </span>
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-slate-900">
                {gregConvertedStr}
              </div>
              <div className="text-xs text-cyan-800 font-mono">
                ISO 8601: {gregIsoConverted}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info footer */}
      {!compact && (
        <div className="mt-4 pt-3 border-t border-slate-200 space-y-2 text-[11px] text-slate-600 leading-relaxed">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              የኢትዮጵያ ዘመን አቆጣጠር 12 ወራት እያንዳንዳቸው 30 ቀናት እና 13ኛዋ ወር ጳጉሜን 5 ቀናት (በዘመነ ዮሐንስ 6 ቀናት) አሉት። በማዕከላዊ ኢትዮጵያ ክልል የወሳኝ ኩነቶች ሪፖርት ወቅትም በዚሁ ህጋዊ የቀን መቁጠሪያ መሰረት ይሰላል።
            </span>
          </div>

          <div className="rounded-xl bg-emerald-50 border border-emerald-200/90 p-3 text-emerald-950 font-medium space-y-1 shadow-xs">
            <span className="font-bold block text-emerald-900 text-xs">የኢትዮጵያ በጀት ዓመት አወቃቀር (Fiscal Year Guide)፦</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-emerald-800">
              <span>• <strong>1ኛ ሩብ ዓመት</strong>፡ ከሐምሌ 1 እስከ መስከረም 30</span>
              <span>• <strong>2ኛ ሩብ ዓመት</strong>፡ ከጥቅምት 1 እስከ ታኅሣሥ 30</span>
              <span>• <strong>3ኛ ሩብ ዓመት</strong>፡ ከጥር 1 እስከ መጋቢት 30</span>
              <span>• <strong>4ኛ ሩብ ዓመት</strong>፡ ከሚያዝያ 1 እስከ ሰኔ 30</span>
            </div>
            <p className="text-[11px] text-emerald-800 font-mono font-semibold pt-0.5 border-t border-emerald-200/70 mt-1">
              የዓመት ሪፖርት ፡ ከሐምሌ 1/2018 ዓ.ም እስከ ሰኔ 30/2019 ዓ.ም (የሙሉ በጀት ዓመት ማጠቃለያ)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
