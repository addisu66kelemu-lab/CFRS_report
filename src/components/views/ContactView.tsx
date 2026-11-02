import React, { useState } from 'react';
import { REGIONAL_OFFICE_DIRECTORY } from '../../data/mockDatabase';
import { CitizenFeedback, ServiceType, ContactModuleContent, UserRole } from '../../types';
import { 
  Building2, 
  Phone, 
  Mail, 
  Clock, 
  MapPin, 
  MessageSquare, 
  Star, 
  CheckCircle2, 
  Send,
  AlertCircle,
  Sparkles,
  SendHorizontal
} from 'lucide-react';

interface ContactViewProps {
  feedbacks: CitizenFeedback[];
  onSubmitFeedback: (feedback: Omit<CitizenFeedback, 'id' | 'ticketNumber' | 'createdAt' | 'status'>) => string;
  content?: ContactModuleContent;
  userRole?: UserRole;
  onOpenContentEditor?: (moduleName: any) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ 
  feedbacks, 
  onSubmitFeedback,
  content,
  userRole,
  onOpenContentEditor
}) => {
  const [citizenName, setCitizenName] = useState('');
  const [phone, setPhone] = useState('');
  const [zone, setZone] = useState('ሀዲያ ዞን');
  const [serviceCategory, setServiceCategory] = useState<ServiceType | 'general'>('general');
  const [rating, setRating] = useState<number>(5);
  const [comments, setComments] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const [searchTicket, setSearchTicket] = useState('');
  const [foundFeedback, setFoundFeedback] = useState<CitizenFeedback | null>(null);
  const [ticketSearchError, setTicketSearchError] = useState<string | null>(null);

  const regionalOffices = content?.regionalOffices?.length ? content.regionalOffices : REGIONAL_OFFICE_DIRECTORY;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName.trim() || !phone.trim() || !comments.trim()) return;

    const ticket = onSubmitFeedback({
      citizenName,
      phone,
      zone,
      serviceCategory,
      rating,
      comments,
    });

    setSubmittedTicket(ticket);
    setCitizenName('');
    setPhone('');
    setComments('');
    setRating(5);
  };

  const handleLookupTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSearchError(null);
    setFoundFeedback(null);

    const term = searchTicket.trim().toUpperCase();
    if (!term) return;

    const match = feedbacks.find(f => f.ticketNumber.toUpperCase() === term);
    if (match) {
      setFoundFeedback(match);
    } else {
      setTicketSearchError(`በመለያ ቁጥር "${term}" የተመዘገበ አስተያየት አልተገኘም። እባክዎ ቁጥሩን ያረጋግጡ።`);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Super Admin Quick Content Edit Bar */}
      {userRole === 'super_admin' && onOpenContentEditor && (
        <div className="rounded-xl border border-amber-400/80 bg-amber-50/95 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-amber-200/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-black text-amber-900 block">👑 የበላይ አስተዳዳሪ ሁነታ (Super Admin CMS)</span>
              <span className="text-[11px] text-slate-700">ዋናውን የኤጀንሲ አድራሻ፣ የስልክ መስመሮች፣ የስራ ሰዓትና የ10ሩን ዞኖች ቅርንጫፍ ቢሮዎች መረጃ መቀየር ይችላሉ።</span>
            </div>
          </div>
          <button
            onClick={() => onOpenContentEditor('contact')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-black cursor-pointer shadow-md transition-all self-start sm:self-auto"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>የአድራሻ ይዘት አርትዕ (Edit Contact Content)</span>
          </button>
        </div>
      )}

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 shadow-xs">
          <Building2 className="h-3.5 w-3.5 text-emerald-600" />
          <span>የዞኖች አድራሻና የዜጎች አስተያየት መስጫ</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {content?.hqName || 'ያግኙን እና የዞኖች አድራሻ ማውጫ'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          {content?.supportNotice || 'በማዕከላዊ ኢትዮጵያ ክልል የሚገኙ 10ሩን የዞን የወሳኝ ኩነቶች ጽሕፈት ቤቶች (ሀላባ፣ ሀዲያ፣ ጉራጌ፣ ስልጤ፣ ከምባታ እና ሌሎችም) አድራሻና ስልክ እዚህ ያግኙ፤ እንዲሁም አስተያየትዎን ወይም ቅሬታዎን ያስገቡ።'}
        </p>
      </div>

      {/* Hotlines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-emerald-200 bg-white/85 backdrop-blur-md p-5 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-700">
            <Phone className="h-4 w-4" />
            <span className="text-xs font-bold uppercase">የክልሉ ነፃ የስልክ መስመር</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-900">{content?.emergencyHotline || '8891 (ነፃ ጥሪ)'}</div>
          <p className="text-xs text-slate-600">{content?.workingHours || 'ስለ ልደት፣ ጋብቻ፣ ፍቺና ጉዲፈቻ መረጃ ለማግኘት (ከሰኞ - አርብ 2:30 - 11:30)'}</p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-white/85 backdrop-blur-md p-5 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-amber-700">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-bold uppercase">የዋና መስሪያ ቤት ስልክ</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-900">{content?.hqPhone || '046-555-1212'}</div>
          <p className="text-xs text-slate-600">{content?.hqAddress || 'ሆሳዕና፣ ማዕከላዊ ኢትዮጵያ ክልል መንግሥት ህንፃ'}</p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-5 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-cyan-700">
            <Mail className="h-4 w-4" />
            <span className="text-xs font-bold uppercase">ይፋዊ የኢሜይል አድራሻ</span>
          </div>
          <div className="text-xs font-bold font-mono text-slate-900">{content?.hqEmail || 'info@centralethiopia-crvs.gov.et'}</div>
          <p className="text-xs text-slate-600">ቴሌግራም፡ {content?.officialTelegram || '@CentralEthiopiaVitalEvents'}</p>
        </div>
      </div>

      {/* Citizen Feedback & Tracking */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
              <MessageSquare className="h-4 w-4" />
              <span>የዜጎች እርካታና አስተያየት መስጫ</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">አስተያየት፣ ጥያቄ ወይም ቅሬታ ያስገቡ</h2>
            <p className="text-xs text-slate-600">
              አስተያየትዎ ለዞኖቹ አገልግሎት ማሻሻያ በቀጥታ ለክልሉ አመራር ይደርሳል።
            </p>
          </div>

          {submittedTicket && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 space-y-1 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>አስተያየትዎ በተሳካ ሁኔታ ተመዝግቧል!</span>
              </div>
              <p className="text-xs text-slate-700">
                የመከታተያ መለያ ቁጥርዎ፡ <strong className="font-mono text-slate-900 text-sm">{submittedTicket}</strong> ነው።
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ሙሉ ስም</label>
                <input
                  type="text"
                  required
                  placeholder="ለምሳሌ፡ ተስፋዬ በቀለ"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ስልክ ቁጥር</label>
                <input
                  type="tel"
                  required
                  placeholder="0911-XXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ዞን / ልዩ ወረዳ</label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none shadow-xs"
                >
                  {regionalOffices.map(o => (
                    <option key={o.id} value={o.zone}>{o.zone}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">የአገልግሎት እርካታ ደረጃ</label>
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRating(s)}
                      className="cursor-pointer"
                    >
                      <Star className={`h-5 w-5 ${s <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                    </button>
                  ))}
                  <span className="text-xs text-slate-600 font-mono ml-2 font-bold">{rating}/5</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">የአስተያየትዎ ወይም የጥያቄዎ ዝርዝር</label>
              <textarea
                required
                rows={3}
                placeholder="ስለ አገኘሁት አገልግሎት፣ የጊዜ ገደብ ወይም አስተያየት ዝርዝር እዚህ ጻፉ..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none shadow-xs"
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Send className="h-4 w-4" />
              <span>አስተያየቱን ላክ</span>
            </button>
          </form>
        </div>

        {/* Tracking */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">የአስተያየትዎን ሁኔታ ይከታተሉ</h3>
            <p className="text-xs text-slate-600">
              የመከታተያ መለያ ቁጥርዎን (ለምሳሌ፡ CR-FB-8101) በማስገባት ምላሹን ያረጋግጡ፡
            </p>

            <form onSubmit={handleLookupTicket} className="flex gap-2">
              <input
                type="text"
                placeholder="CR-FB-XXXX"
                value={searchTicket}
                onChange={(e) => setSearchTicket(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none uppercase shadow-xs"
              />
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold cursor-pointer shadow-xs"
              >
                ፈትሽ
              </button>
            </form>

            {ticketSearchError && (
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                {ticketSearchError}
              </div>
            )}

            {foundFeedback && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 space-y-2 text-xs shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-800">{foundFeedback.ticketNumber}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {foundFeedback.status}
                  </span>
                </div>
                <div className="text-slate-800">አመልካች፡ <strong>{foundFeedback.citizenName}</strong> ({foundFeedback.zone})</div>
                <div className="text-slate-500 text-[11px]">የቀረበበት ቀን፡ {foundFeedback.createdAt}</div>
                <div className="p-2 rounded bg-white border border-slate-200 text-slate-700 text-[11px] italic">
                  "{foundFeedback.comments}"
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Directory of 10 Zones */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">የማዕከላዊ ኢትዮጵያ 10ሩም ዞኖች የወሳኝ ኩነቶች ቢሮዎች አድራሻ</h2>
          <p className="text-xs text-slate-600">የ10ሩም ዞኖች (ሀላባን ጨምሮ) ዋና ከተሞች፣ የኃላፊዎች ስም እና የስልክ አድራሻዎች</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regionalOffices.map((off) => (
            <div
              key={off.id}
              className="rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-5 space-y-3 hover:border-emerald-500/50 hover:shadow-md transition-all shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{off.zone}</h3>
                  <span className="text-xs text-emerald-700 font-medium">ዋና ከተማ፡ {off.capital}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">{off.id}</span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200">
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>{off.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="font-mono">{off.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span>{off.operatingHours}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                የዞኑ አስተባባሪ፡ <strong className="text-slate-900">{off.headRegistrar}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
