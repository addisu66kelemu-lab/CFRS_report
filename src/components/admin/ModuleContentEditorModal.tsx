import React, { useState, useEffect } from 'react';
import { 
  SiteModulesContent, 
  ServiceType, 
  ServiceModuleItem, 
  AboutLeaderItem, 
  AboutMilestoneItem, 
  PolicyDocumentItem, 
  FaqItem,
  RegionalOfficeInfo,
  ZoneAccount
} from '../../types';
import { 
  X, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Home, 
  Layers, 
  Info, 
  FileText, 
  Phone, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Sparkles,
  ShieldAlert,
  Building,
  Calendar,
  HelpCircle,
  Clock,
  DollarSign,
  UploadCloud,
  FileUp,
  Eye,
  EyeOff
} from 'lucide-react';
import { saveDocumentBlob, formatDocumentSize } from '../../utils/documentStorage';
import { formatEthiopianDateTime } from '../../utils/ethiopianCalendar';

interface ModuleContentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialModule?: keyof SiteModulesContent;
  content: SiteModulesContent;
  onSaveContent: (updated: SiteModulesContent, moduleUpdatedName: string) => void;
  onResetToDefault: () => void;
}

export const ModuleContentEditorModal: React.FC<ModuleContentEditorModalProps> = ({
  isOpen,
  onClose,
  initialModule = 'home',
  content,
  onSaveContent,
  onResetToDefault,
}) => {
  const [activeModuleTab, setActiveModuleTab] = useState<keyof SiteModulesContent>(initialModule);
  const [draftContent, setDraftContent] = useState<SiteModulesContent>(content);
  const [selectedServiceId, setSelectedServiceId] = useState<ServiceType>('birth');
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setDraftContent(content);
  }, [content]);

  useEffect(() => {
    if (initialModule) {
      setActiveModuleTab(initialModule);
    }
  }, [initialModule, isOpen]);

  if (!isOpen) return null;

  const showNotice = (type: 'success' | 'error', message: string) => {
    setStatusNotice({ type, message });
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const moduleNamesAm: Record<keyof SiteModulesContent, string> = {
      home: 'የዋና ገጽ (Home)',
      services: 'የወሳኝ ኩነቶች አገልግሎቶች (Services)',
      about: 'የስለ እኛ (About)',
      resources: 'የሰነዶችና አዋጆች (Resources)',
      contact: 'የአድራሻና ቅርንጫፍ ቢሮዎች (Contact)',
      zonesFees: 'የዞኖችና የክፍያ ተመን (Zones & Fees)'
    };
    onSaveContent(draftContent, moduleNamesAm[activeModuleTab]);
    showNotice('success', `የ${moduleNamesAm[activeModuleTab]} ሞጁል ይዘት በተሳካ ሁኔታ ተሻሽሎ በመላው ፖርታሉ ተሰራጭቷል!`);
  };

  const handleResetConfirm = () => {
    if (window.confirm('እርግጠኛ ነዎት የሁሉንም ሞጁሎች ይዘት ወደ መጀመሪያው ነባሪ (Default) መመለስ ይፈልጋሉ?')) {
      onResetToDefault();
      showNotice('success', 'የሁሉም ሞጁሎች ይዘት ወደ ነባሪው ተመልሷል።');
    }
  };

  // Helper updater for home
  const updateHome = <K extends keyof typeof draftContent.home>(key: K, val: typeof draftContent.home[K]) => {
    setDraftContent(prev => ({
      ...prev,
      home: { ...prev.home, [key]: val }
    }));
  };

  // Helper updater for services
  const updateService = <K extends keyof ServiceModuleItem>(key: K, val: ServiceModuleItem[K]) => {
    setDraftContent(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [selectedServiceId]: {
          ...prev.services[selectedServiceId],
          [key]: val
        }
      }
    }));
  };

  // Helper updater for about
  const updateAbout = <K extends keyof typeof draftContent.about>(key: K, val: typeof draftContent.about[K]) => {
    setDraftContent(prev => ({
      ...prev,
      about: { ...prev.about, [key]: val }
    }));
  };

  // Helper updater for contact
  const updateContact = <K extends keyof typeof draftContent.contact>(key: K, val: typeof draftContent.contact[K]) => {
    setDraftContent(prev => ({
      ...prev,
      contact: { ...prev.contact, [key]: val }
    }));
  };

  // Helper updater for zonesFees
  const updateZonesFees = <K extends keyof typeof draftContent.zonesFees>(key: K, val: typeof draftContent.zonesFees[K]) => {
    setDraftContent(prev => ({
      ...prev,
      zonesFees: { ...prev.zonesFees, [key]: val }
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl text-slate-900 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded">
                  Super Admin CMS
                </span>
                <span className="text-xs text-slate-500">የይዘት ማስተዳደሪያ ማዕከል</span>
              </div>
              <h2 className="text-lg font-black text-slate-900">
                የሁሉንም ሞጁሎች ይዘት ማስተካከያ (Content Management System)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetConfirm}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors shadow-xs"
              title="ሁሉንም ይዘቶች ወደ ነባሪ መልስ"
            >
              <RotateCcw className="h-3.5 w-3.5 text-amber-600" />
              <span>ወደ ነባሪ መልስ</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Status Notice Banner */}
        {statusNotice && (
          <div className={`px-6 py-2.5 text-xs font-semibold flex items-center gap-2 border-b ${
            statusNotice.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{statusNotice.message}</span>
          </div>
        )}

        {/* Module Selection Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto px-6 py-2.5 bg-slate-100/80 border-b border-slate-200 scrollbar-thin">
          {[
            { id: 'home', label: '1. ዋና ገጽ (Home)', icon: Home },
            { id: 'services', label: '2. አገልግሎቶች (Services)', icon: Layers },
            { id: 'about', label: '3. ስለ እኛ (About)', icon: Info },
            { id: 'resources', label: '4. ሰነዶችና አዋጆች (Resources)', icon: FileText },
            { id: 'contact', label: '5. አድራሻና ቅርንጫፎች (Contact)', icon: Phone },
            { id: 'zonesFees', label: '6. ዞኖችና ተመኖች (Zones & Fees)', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeModuleTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveModuleTab(tab.id as keyof SiteModulesContent)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Container */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ========================================================================= */}
          {/* 1. HOME MODULE EDITOR                                                    */}
          {/* ========================================================================= */}
          {activeModuleTab === 'home' && (
            <div className="space-y-5">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Home className="h-4 w-4 text-emerald-600" />
                  <span>የዋና ገጽ (Home View) ይዘት ማስተካከያ</span>
                </h3>
                <p className="text-xs text-slate-500">የመግቢያ ርዕሶች፣ ይፋዊ ማስታወቂያዎችና የስልክ መስመሮች</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">የኤጀንሲው የበላይ ባጅ (Hero Badge)</label>
                  <input
                    type="text"
                    value={draftContent.home.heroBadge}
                    onChange={(e) => updateHome('heroBadge', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ዋና ርዕስ (Hero Main Title)</label>
                  <input
                    type="text"
                    value={draftContent.home.heroTitle}
                    onChange={(e) => updateHome('heroTitle', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-bold focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ንዑስ ማብራሪያ (Hero Subtitle)</label>
                  <textarea
                    rows={3}
                    value={draftContent.home.heroSubtitle}
                    onChange={(e) => updateHome('heroSubtitle', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 leading-relaxed focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-amber-800 mb-1">ይፋዊ የአዋጅ/ህግ ማስታወቂያ (Announcement Banner)</label>
                  <textarea
                    rows={2}
                    value={draftContent.home.announcementText}
                    onChange={(e) => updateHome('announcementText', e.target.value)}
                    className="w-full rounded-lg border border-amber-300 bg-amber-50/70 px-3 py-2 text-xs text-amber-900 leading-relaxed focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">የማስታወቂያ ወቅት/ቀን (Announcement Period)</label>
                  <input
                    type="text"
                    value={draftContent.home.announcementDate}
                    onChange={(e) => updateHome('announcementDate', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">የነፃ የስልክ መስመር (Emergency Hotline)</label>
                  <input
                    type="text"
                    value={draftContent.home.emergencyHotline}
                    onChange={(e) => updateHome('emergencyHotline', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">የስታትስቲክስ ክፍል ርዕስ (Stats Title)</label>
                  <input
                    type="text"
                    value={draftContent.home.statsSectionTitle}
                    onChange={(e) => updateHome('statsSectionTitle', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">የስታትስቲክስ ንዑስ ማብራሪያ (Stats Subtitle)</label>
                  <input
                    type="text"
                    value={draftContent.home.statsSectionSubtitle}
                    onChange={(e) => updateHome('statsSectionSubtitle', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. SERVICES MODULE EDITOR                                                */}
          {/* ========================================================================= */}
          {activeModuleTab === 'services' && (
            <div className="space-y-5">
              <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-cyan-600" />
                    <span>የወሳኝ ኩነቶች አገልግሎቶች (Services View) ማስተካከያ</span>
                  </h3>
                  <p className="text-xs text-slate-500">የጊዜ ገደቦች፣ ህጋዊ ክፍያዎች፣ መመሪያዎችና ቅድመ-ሁኔታዎች</p>
                </div>

                {/* Sub-selector for the 5 services */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  {[
                    { id: 'birth', label: 'ልደት' },
                    { id: 'death', label: 'ሞት' },
                    { id: 'marriage', label: 'ጋብቻ' },
                    { id: 'divorce', label: 'ፍቺ' },
                    { id: 'adoption', label: 'ጉዲፈቻ' },
                  ].map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedServiceId(s.id as ServiceType)}
                      className={`px-2.5 py-1 text-xs font-bold rounded cursor-pointer transition-colors ${
                        selectedServiceId === s.id 
                          ? 'bg-amber-500 text-slate-950' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Item Form */}
              {draftContent.services[selectedServiceId] && (
                <div className="space-y-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">የአገልግሎት ስም (Service Title)</label>
                      <input
                        type="text"
                        value={draftContent.services[selectedServiceId].title}
                        onChange={(e) => updateService('title', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-bold focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">ንዑስ ርዕስ (Service Subtitle)</label>
                      <input
                        type="text"
                        value={draftContent.services[selectedServiceId].subtitle}
                        onChange={(e) => updateService('subtitle', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-emerald-800 mb-1">
                        ህጋዊ የጊዜ ገደብ በቀናት (Statutory Limit in Days)
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                        <input
                          type="number"
                          value={draftContent.services[selectedServiceId].statutoryDays}
                          onChange={(e) => updateService('statutoryDays', Number(e.target.value))}
                          className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs font-mono text-emerald-700 font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-emerald-800 mb-1">መደበኛ ክፍያ ተመን (On-time Fee)</label>
                      <input
                        type="text"
                        value={draftContent.services[selectedServiceId].feeCurrent}
                        onChange={(e) => updateService('feeCurrent', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-amber-800 mb-1">የዘገየ ቅጣት ተመን (Late Penalty Fee)</label>
                      <input
                        type="text"
                        value={draftContent.services[selectedServiceId].feeLate}
                        onChange={(e) => updateService('feeLate', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">ህጋዊ አመልካች / አሳዋቂ (Legal Informant)</label>
                      <input
                        type="text"
                        value={draftContent.services[selectedServiceId].informant}
                        onChange={(e) => updateService('informant', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Required Documents List */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      የሚያስፈልጉ ሰነዶች (Required Documents - በአንድ መስመር አንድ ሰነድ ያስገቡ)
                    </label>
                    <textarea
                      rows={4}
                      value={draftContent.services[selectedServiceId].requiredDocs.join('\n')}
                      onChange={(e) => updateService('requiredDocs', e.target.value.split('\n').filter(Boolean))}
                      placeholder="በአንድ መስመር አንድ ሰነድ..."
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 leading-relaxed focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Late Requirements List */}
                  <div>
                    <label className="block text-xs font-semibold text-amber-800 mb-1.5">
                      ዘግይቶ ለሚመዘገብ ተጨማሪ መስፈርቶች (Late Registration Requirements)
                    </label>
                    <textarea
                      rows={3}
                      value={draftContent.services[selectedServiceId].lateRequirements.join('\n')}
                      onChange={(e) => updateService('lateRequirements', e.target.value.split('\n').filter(Boolean))}
                      placeholder="በአንድ መስመር አንድ ቅድመ-ሁኔታ..."
                      className="w-full rounded-lg border border-amber-300 bg-amber-50/70 px-3 py-2 text-xs text-amber-900 leading-relaxed focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. ABOUT MODULE EDITOR                                                   */}
          {/* ========================================================================= */}
          {activeModuleTab === 'about' && (
            <div className="space-y-5">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Info className="h-4 w-4 text-purple-600" />
                  <span>የስለ እኛ (About View) ይዘት ማስተካከያ</span>
                </h3>
                <p className="text-xs text-slate-500">ራዕይ፣ ተልዕኮ፣ እሴቶች፣ አመራሮችና የክልሉ ታሪካዊ ምዕራፎች</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">የኤጀንሲው አጠቃላይ መግለጫ (Overview)</label>
                  <textarea
                    rows={3}
                    value={draftContent.about.agencyOverview}
                    onChange={(e) => updateAbout('agencyOverview', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 leading-relaxed focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-800 mb-1">ራዕይ (Vision)</label>
                  <textarea
                    rows={3}
                    value={draftContent.about.vision}
                    onChange={(e) => updateAbout('vision', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 leading-relaxed focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cyan-800 mb-1">ተልዕኮ (Mission)</label>
                  <textarea
                    rows={3}
                    value={draftContent.about.mission}
                    onChange={(e) => updateAbout('mission', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 leading-relaxed focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    መሰረታዊ እሴቶች (Core Values - በአንድ መስመር አንድ እሴት)
                  </label>
                  <textarea
                    rows={3}
                    value={draftContent.about.values.join('\n')}
                    onChange={(e) => updateAbout('values', e.target.value.split('\n').filter(Boolean))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 leading-relaxed focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Leadership Management */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    የክልሉ ከፍተኛ አመራሮች ({draftContent.about.leaders.length} አባላት)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newLeader: AboutLeaderItem = {
                        name: 'አዲስ አመራር ስም',
                        title: 'የስራ መደብ',
                        bio: 'የአመራሩ አጭር የህይወት ታሪክና የትምህርት ዝግጅት...',
                        tenure: 'ከ2017 ዓ.ም ጀምሮ'
                      };
                      updateAbout('leaders', [...draftContent.about.leaders, newLeader]);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold hover:bg-amber-200 cursor-pointer shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>አመራር ጨምር</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {draftContent.about.leaders.map((leader, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={leader.name}
                          onChange={(e) => {
                            const copy = [...draftContent.about.leaders];
                            copy[idx].name = e.target.value;
                            updateAbout('leaders', copy);
                          }}
                          placeholder="የአመራሩ ስም..."
                          className="font-bold text-slate-900 text-xs bg-transparent border-b border-slate-300 pb-1 focus:outline-none focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const copy = draftContent.about.leaders.filter((_, i) => i !== idx);
                            updateAbout('leaders', copy);
                          }}
                          className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={leader.title}
                        onChange={(e) => {
                          const copy = [...draftContent.about.leaders];
                          copy[idx].title = e.target.value;
                          updateAbout('leaders', copy);
                        }}
                        placeholder="የስራ መደብ..."
                        className="w-full text-slate-700 text-xs bg-transparent border-b border-slate-200 pb-1 focus:outline-none"
                      />
                      <textarea
                        rows={2}
                        value={leader.bio}
                        onChange={(e) => {
                          const copy = [...draftContent.about.leaders];
                          copy[idx].bio = e.target.value;
                          updateAbout('leaders', copy);
                        }}
                        placeholder="የአመራሩ ተግባርና ኃላፊነት..."
                        className="w-full text-slate-600 text-xs bg-transparent border-b border-slate-200 pb-1 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. RESOURCES MODULE EDITOR                                               */}
          {/* ========================================================================= */}
          {activeModuleTab === 'resources' && (
            <div className="space-y-5">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span>የሰነዶችና አዋጆች (Resources View) ማስተካከያ</span>
                  </h3>
                  <p className="text-xs text-slate-500">የህግ አዋጆች፣ መመሪያዎች፣ የወረዳ ቅጾችና ተደጋጋሚ ጥያቄዎች (FAQs)</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shadow-xs transition-colors">
                    <FileUp className="h-3.5 w-3.5" />
                    <span>ከኮምፒውተር ሰነድ ጫን (Upload)</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.png"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = async () => {
                          const dataUrl = reader.result as string;
                          const extMatch = file.name.match(/\.[^/.]+$/);
                          const ext = extMatch ? extMatch[0] : '';
                          const docId = `doc-upload-${Date.now()}`;
                          await saveDocumentBlob(docId, dataUrl, file.name);
                          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
                          const newDoc: PolicyDocumentItem = {
                            id: docId,
                            title: cleanName,
                            category: 'የክልሉ መመሪያ',
                            fileSize: formatDocumentSize(file.size, ext),
                            description: `ከኮምፒውተር የተጫነ ይፋዊ ፋይል (${file.name})`,
                            date: '2018 ዓ.ም',
                            fileName: file.name,
                            fileType: file.type,
                            fileData: file.size < 600 * 1024 ? dataUrl : undefined,
                            uploadedBy: 'የበላይ አስተዳዳሪ (Super Admin)',
                            uploadedAt: formatEthiopianDateTime(new Date()),
                            isCustomUploaded: true
                          };
                          setDraftContent(prev => ({
                            ...prev,
                            resources: {
                              ...prev.resources,
                              documents: [newDoc, ...prev.resources.documents]
                            }
                          }));
                        };
                        reader.readAsDataURL(file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newDoc: PolicyDocumentItem = {
                        id: `doc-${Date.now()}`,
                        title: 'አዲስ የክልሉ መመሪያ ሰነድ',
                        category: 'የክልሉ መመሪያ',
                        fileSize: '1.2 MB · PDF',
                        description: 'የሰነዱ አጭር መግለጫ...',
                        date: '2019 ዓ.ም'
                      };
                      setDraftContent(prev => ({
                        ...prev,
                        resources: {
                          ...prev.resources,
                          documents: [newDoc, ...prev.resources.documents]
                        }
                      }));
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold hover:bg-amber-200 cursor-pointer shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>ባዶ ሰነድ ጨምር</span>
                  </button>
                </div>
              </div>

              {/* Document List */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  የህግና መመሪያ ሰነዶች ({draftContent.resources.documents.length} ሰነዶች)
                </span>
                {draftContent.resources.documents.map((doc, idx) => (
                  <div key={doc.id || idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={doc.title}
                        onChange={(e) => {
                          const copy = [...draftContent.resources.documents];
                          copy[idx].title = e.target.value;
                          setDraftContent(p => ({ ...p, resources: { ...p.resources, documents: copy } }));
                        }}
                        className="font-bold text-slate-900 text-xs bg-transparent border-b border-slate-300 w-full focus:outline-none focus:border-amber-500"
                        placeholder="የሰነዱ ርዕስ..."
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const copy = draftContent.resources.documents.filter((_, i) => i !== idx);
                          setDraftContent(p => ({ ...p, resources: { ...p.resources, documents: copy } }));
                        }}
                        className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <input
                        type="text"
                        value={doc.category}
                        onChange={(e) => {
                          const copy = [...draftContent.resources.documents];
                          copy[idx].category = e.target.value;
                          setDraftContent(p => ({ ...p, resources: { ...p.resources, documents: copy } }));
                        }}
                        className="text-slate-700 bg-transparent border-b border-slate-200 focus:outline-none"
                        placeholder="ምድብ (Category)..."
                      />
                      <input
                        type="text"
                        value={doc.date}
                        onChange={(e) => {
                          const copy = [...draftContent.resources.documents];
                          copy[idx].date = e.target.value;
                          setDraftContent(p => ({ ...p, resources: { ...p.resources, documents: copy } }));
                        }}
                        className="text-slate-500 bg-transparent border-b border-slate-200 focus:outline-none"
                        placeholder="የወጣበት ዓ.ም..."
                      />
                    </div>

                    <textarea
                      rows={2}
                      value={doc.description}
                      onChange={(e) => {
                        const copy = [...draftContent.resources.documents];
                        copy[idx].description = e.target.value;
                        setDraftContent(p => ({ ...p, resources: { ...p.resources, documents: copy } }));
                      }}
                      className="w-full text-slate-600 text-xs bg-transparent border-b border-slate-200 focus:outline-none leading-relaxed"
                      placeholder="የሰነዱ አጭር ማጠቃለያ..."
                    />
                  </div>
                ))}
              </div>

              {/* FAQs Section */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                    ተደጋጋሚ ጥያቄዎች (FAQs - {draftContent.resources.faqs.length} ጥያቄዎች)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newFaq: FaqItem = {
                        q: 'አዲስ የጥያቄ ርዕስ እዚህ ይጻፉ?',
                        a: 'ይፋዊ መልስ እዚህ ይጻፉ...',
                        category: 'አጠቃላይ'
                      };
                      setDraftContent(prev => ({
                        ...prev,
                        resources: {
                          ...prev.resources,
                          faqs: [newFaq, ...prev.resources.faqs]
                        }
                      }));
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold hover:bg-amber-200 cursor-pointer shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>ጥያቄ ጨምር</span>
                  </button>
                </div>

                {draftContent.resources.faqs.map((faq, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={faq.q}
                        onChange={(e) => {
                          const copy = [...draftContent.resources.faqs];
                          copy[idx].q = e.target.value;
                          setDraftContent(p => ({ ...p, resources: { ...p.resources, faqs: copy } }));
                        }}
                        className="font-bold text-slate-900 text-xs bg-transparent border-b border-slate-300 w-full focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const copy = draftContent.resources.faqs.filter((_, i) => i !== idx);
                          setDraftContent(p => ({ ...p, resources: { ...p.resources, faqs: copy } }));
                        }}
                        className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={faq.a}
                      onChange={(e) => {
                        const copy = [...draftContent.resources.faqs];
                        copy[idx].a = e.target.value;
                        setDraftContent(p => ({ ...p, resources: { ...p.resources, faqs: copy } }));
                      }}
                      className="w-full text-slate-600 text-xs bg-transparent border-b border-slate-200 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. CONTACT MODULE EDITOR                                                 */}
          {/* ========================================================================= */}
          {activeModuleTab === 'contact' && (
            <div className="space-y-5">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-teal-600" />
                  <span>የአድራሻና ቅርንጫፍ ቢሮዎች (Contact View) ማስተካከያ</span>
                </h3>
                <p className="text-xs text-slate-500">ዋና መስሪያ ቤት፣ ነፃ የስልክ መስመሮችና የ10ሩም ዞን ቅርንጫፎች ዝርዝር</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">የዋና መስሪያ ቤት ይፋዊ ስም</label>
                  <input
                    type="text"
                    value={draftContent.contact.hqName}
                    onChange={(e) => updateContact('hqName', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ዋና አድራሻ (HQ Address)</label>
                  <input
                    type="text"
                    value={draftContent.contact.hqAddress}
                    onChange={(e) => updateContact('hqAddress', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ስልክ ቁጥር (HQ Phone)</label>
                  <input
                    type="text"
                    value={draftContent.contact.hqPhone}
                    onChange={(e) => updateContact('hqPhone', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ኢሜይል (HQ Email)</label>
                  <input
                    type="email"
                    value={draftContent.contact.hqEmail}
                    onChange={(e) => updateContact('hqEmail', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">የስራ ሰዓት (Operating Hours)</label>
                  <input
                    type="text"
                    value={draftContent.contact.workingHours}
                    onChange={(e) => updateContact('workingHours', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ይፋዊ ቴሌግራም (Official Telegram)</label>
                  <input
                    type="text"
                    value={draftContent.contact.officialTelegram}
                    onChange={(e) => updateContact('officialTelegram', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Zone Offices Details */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  የ10ሩ ዞኖች ቅርንጫፍ ቢሮዎች አድራሻና ስልክ
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {draftContent.contact.regionalOffices.map((office, idx) => (
                    <div key={office.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{office.zone}</span>
                        <span className="text-[10px] text-amber-700 font-mono font-bold">{office.capital}</span>
                      </div>
                      <input
                        type="text"
                        value={office.address}
                        onChange={(e) => {
                          const copy = [...draftContent.contact.regionalOffices];
                          copy[idx].address = e.target.value;
                          updateContact('regionalOffices', copy);
                        }}
                        className="w-full text-slate-700 text-[11px] bg-transparent border-b border-slate-200 pb-0.5 focus:outline-none"
                        placeholder="ቢሮ አድራሻ..."
                      />
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <input
                          type="text"
                          value={office.phone}
                          onChange={(e) => {
                            const copy = [...draftContent.contact.regionalOffices];
                            copy[idx].phone = e.target.value;
                            updateContact('regionalOffices', copy);
                          }}
                          className="text-slate-700 font-mono bg-transparent border-b border-slate-200 pb-0.5 focus:outline-none"
                          placeholder="ስልክ..."
                        />
                        <input
                          type="text"
                          value={office.headRegistrar}
                          onChange={(e) => {
                            const copy = [...draftContent.contact.regionalOffices];
                            copy[idx].headRegistrar = e.target.value;
                            updateContact('regionalOffices', copy);
                          }}
                          className="text-slate-500 bg-transparent border-b border-slate-200 pb-0.5 focus:outline-none"
                          placeholder="ኃላፊ ስም..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 6. ZONES & FEES MODULE EDITOR                                            */}
          {/* ========================================================================= */}
          {activeModuleTab === 'zonesFees' && (
            <div className="space-y-5">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Settings className="h-4 w-4 text-amber-600" />
                  <span>የዞኖችና የክፍያ ተመን (Zones & Statutory Fees) ማስተካከያ</span>
                </h3>
                <p className="text-xs text-slate-500">የዘገዩ ምዝገባዎች የቅጣት ተመን እና የ10ሩ ዞኖች መለያዎች</p>
              </div>

              {/* Late Penalty Configuration */}
              <div className="bg-amber-50/70 border border-amber-300 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-900 text-xs font-bold uppercase">
                  <DollarSign className="h-4 w-4 text-amber-600" />
                  <span>የክልሉ ይፋዊ የዘገየ ምዝገባ ቅጣት ተመን (Late Registration Penalty)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">የቅጣት መጠን በብር (ETB per Event)</label>
                    <input
                      type="number"
                      value={draftContent.zonesFees.latePenaltyFeeETB}
                      onChange={(e) => updateZonesFees('latePenaltyFeeETB', Number(e.target.value))}
                      className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-mono text-amber-800 font-bold focus:border-amber-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">መደበኛ ምዝገባ ሁልጊዜም ነፃ (0 ብር) ነው</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">የህጋዊ አፈጻጸም መግለጫ</label>
                    <textarea
                      rows={2}
                      value={draftContent.zonesFees.penaltyDescription}
                      onChange={(e) => updateZonesFees('penaltyDescription', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 10 Zones Accounts Management */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  የ10ሩ ዞኖች መረጃ፣ ወረዳዎችና የቀበሌዎች ብዛት
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {draftContent.zonesFees.zones.map((zone, idx) => (
                    <div key={zone.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{zone.name}</span>
                        <span className="text-[10px] font-mono text-cyan-700 font-bold">{zone.capital}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-500 block">የወረዳዎች ብዛት</label>
                          <input
                            type="number"
                            value={zone.woredasCount}
                            onChange={(e) => {
                              const copy = [...draftContent.zonesFees.zones];
                              copy[idx].woredasCount = Number(e.target.value);
                              updateZonesFees('zones', copy);
                            }}
                            className="w-full rounded bg-white border border-slate-300 px-2 py-1 text-xs text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block">የቀበሌዎች ብዛት</label>
                          <input
                            type="number"
                            value={zone.kebelesCount}
                            onChange={(e) => {
                              const copy = [...draftContent.zonesFees.zones];
                              copy[idx].kebelesCount = Number(e.target.value);
                              updateZonesFees('zones', copy);
                            }}
                            className="w-full rounded bg-white border border-slate-300 px-2 py-1 text-xs text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-500 block">የተጠቃሚ ስም (Username)</label>
                          <input
                            type="text"
                            value={zone.username}
                            onChange={(e) => {
                              const copy = [...draftContent.zonesFees.zones];
                              copy[idx].username = e.target.value;
                              updateZonesFees('zones', copy);
                            }}
                            className="w-full rounded bg-white border border-slate-300 px-2 py-1 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="text-[10px] text-slate-500 block">የይለፍ ቃል (Password)</label>
                            <button
                              type="button"
                              onClick={() => setRevealedPasswords(prev => ({ ...prev, [zone.id]: !prev[zone.id] }))}
                              className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                              title={revealedPasswords[zone.id] ? "የይለፍ ቃል ደብቅ" : "የይለፍ ቃል አሳይ"}
                            >
                              {revealedPasswords[zone.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              <span>{revealedPasswords[zone.id] ? 'ደብቅ' : 'አሳይ'}</span>
                            </button>
                          </div>
                          <input
                            type={revealedPasswords[zone.id] ? "text" : "password"}
                            value={zone.password}
                            onChange={(e) => {
                              const copy = [...draftContent.zonesFees.zones];
                              copy[idx].password = e.target.value;
                              updateZonesFees('zones', copy);
                            }}
                            className="w-full rounded bg-white border border-slate-300 px-2 py-1 text-xs font-mono text-amber-700 font-bold focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="sticky bottom-0 pt-4 pb-2 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500">
              ለውጦችን ሲመዘግቡ በመላው የፖርታሉ ገጾች ላይ በቀጥታ ተፈፃሚ ይሆናል።
            </span>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors"
              >
                ዝጋ
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/25 cursor-pointer transition-all"
              >
                <Save className="h-4 w-4 text-slate-950" />
                <span>ለውጦችን መዝግብና አሰራጭ (Save & Publish)</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
