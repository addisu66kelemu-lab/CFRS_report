import React, { useState, useMemo } from 'react';
import { UserRole, ZoneAccount } from '../types';
import { CENTRAL_ETHIOPIA_ZONES } from '../data/mockDatabase';
import { getCurrentEthiopianDate } from '../utils/ethiopianCalendar';
import { 
  Building2, 
  FileText, 
  BarChart3, 
  HelpCircle, 
  PhoneCall, 
  ShieldCheck, 
  Menu, 
  X, 
  ChevronDown,
  User,
  Send,
  Lock,
  LogOut,
  Sliders,
  Calendar,
  Sparkles,
  Type,
  Palette
} from 'lucide-react';
import { BgTheme } from './VitalEventsBackground';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userRole: UserRole;
  activeZoneAccount: ZoneAccount | null;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  fontSize?: 'small' | 'medium' | 'large';
  onToggleFontSize?: () => void;
  bgTheme?: BgTheme;
  onSelectBgTheme?: (theme: BgTheme) => void;
  onOpenContentEditor?: (moduleName?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  activeZoneAccount,
  onOpenLoginModal,
  onLogout,
  highContrast,
  onToggleHighContrast,
  fontSize = 'medium',
  onToggleFontSize,
  bgTheme = 'emerald',
  onSelectBgTheme,
  onOpenContentEditor,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const bgThemeList: { id: BgTheme; name: string; dot: string; title: string }[] = [
    { id: 'emerald', name: 'ኤመራልድ', dot: 'bg-emerald-500', title: '🌿 ኤመራልድና ዕንቁ (ስማርት የሲቪክ ህብር)' },
    { id: 'sapphire', name: 'ሰንፔር', dot: 'bg-sky-500', title: '💎 ሰንፔርና ሰማያዊ (ዘመናዊና ንጹህ)' },
    { id: 'golden', name: 'ወርቃማ', dot: 'bg-amber-500', title: '☀️ ወርቃማ ጸዳል (የተከበረ የንጋት ብርሃን)' },
    { id: 'slate', name: 'ሲቪክ', dot: 'bg-slate-500', title: '🏛️ ክላሲክ ሲቪክ (ቀላልና ጸጥተኛ)' },
  ];

  const currentThemeObj = bgThemeList.find(t => t.id === bgTheme) || bgThemeList[0];

  const handleCycleBgTheme = () => {
    if (!onSelectBgTheme) return;
    const currentIdx = bgThemeList.findIndex(t => t.id === bgTheme);
    const nextIdx = (currentIdx + 1) % bgThemeList.length;
    onSelectBgTheme(bgThemeList[nextIdx].id);
  };

  const navLinks = useMemo(() => [
    { id: 'home', label: 'መነሻ', icon: Building2 },
    { id: 'about', label: 'ስለ እኛ', icon: Building2 },
    { id: 'services', label: 'አገልግሎቶች', icon: FileText },
    { 
      id: 'reports', 
      label: userRole === 'zone_officer' 
        ? `የ${activeZoneAccount?.name || 'ዞኔ'} ሪፖርት` 
        : (userRole === 'regional_admin' || userRole === 'super_admin') 
        ? 'አጠቃላይ ሪፖርቶች' 
        : 'ሪፖርቶች', 
      icon: BarChart3 
    },
    { id: 'resources', label: 'መመሪያዎች', icon: HelpCircle },
    { id: 'contact', label: 'ያግኙን', icon: PhoneCall },
  ], [userRole, activeZoneAccount]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark (የማዕከላዊ ኢትዮጵያ ክልል ሲቪልና ቤተሰብ ምዝገባ ኤጀንሲ) */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onSelectTab('home')}
            className="group flex items-center gap-2.5 text-left transition-opacity hover:opacity-90 cursor-pointer"
            title="የማዕከላዊ ኢትዮጵያ ክልል ሲቪልና ቤተሰብ ምዝገባ ኤጀንሲ"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-md shadow-emerald-600/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors block leading-tight">
                የማዕከላዊ ኢትዮጵያ ክልል
              </span>
              <span className="text-[11px] text-emerald-700 font-bold block">
                ሲቪልና ቤተሰብ ምዝገባ ኤጀንሲ
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Clean text with hover underlines) */}
        <nav className="hidden lg:flex items-center gap-1.5" aria-label="ዋና ማውጫ">
          {navLinks.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`relative px-3.5 py-2 text-sm font-bold transition-colors whitespace-nowrap rounded-md cursor-pointer ${
                  isActive
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/80'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-full" />
                )}
              </button>
            );
          })}

          {/* Zone Reporting Tab (visible to zone officers) */}
          {userRole === 'zone_officer' && (
            <button
              onClick={() => onSelectTab('zoneReport')}
              className={`flex items-center gap-1.5 px-3 py-1.5 ml-1 text-sm font-bold rounded-lg border transition-all cursor-pointer ${
                currentTab === 'zoneReport'
                  ? 'bg-amber-100 text-amber-900 border-amber-400'
                  : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50'
              }`}
            >
              <Send className="h-4 w-4" />
              <span>የወሩ ሪፖርት መላኪያ</span>
            </button>
          )}

          {/* Regional Admin & Super Admin Portal Tab */}
          {(userRole === 'regional_admin' || userRole === 'super_admin') && (
            <button
              onClick={() => onSelectTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 ml-1 text-sm font-bold rounded-lg border transition-all cursor-pointer ${
                currentTab === 'admin'
                  ? userRole === 'super_admin'
                    ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-sm'
                    : 'bg-cyan-100 text-cyan-900 border-cyan-400'
                  : userRole === 'super_admin'
                  ? 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50'
                  : 'bg-white text-cyan-800 border-cyan-300 hover:bg-cyan-50'
              }`}
            >
              <Sliders className="h-4 w-4" />
              <span>{userRole === 'super_admin' ? 'የአስተዳደርና CMS መቆጣጠሪያ' : 'የክልሉ አስተዳደር መቆጣጠሪያ'}</span>
            </button>
          )}

          {/* Quick Super Admin CMS Button */}
          {userRole === 'super_admin' && onOpenContentEditor && (
            <button
              onClick={() => onOpenContentEditor()}
              className="flex items-center gap-1.5 px-3 py-1.5 ml-1 text-sm font-bold rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-sm cursor-pointer transition-all"
              title="የሁሉንም ሞጁሎች ይዘት አርትዕ (Edit Content of All Modules)"
            >
              <Sparkles className="h-4 w-4" />
              <span>ይዘት አርትዕ (CMS)</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Actions (User Login State, Contrast, Mobile Toggle) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Ethiopian Calendar Date */}
          <div 
            title="ዛሬ በኢትዮጵያ ዘመን አቆጣጠር"
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs font-mono font-bold"
          >
            <Calendar className="h-3.5 w-3.5 text-emerald-600" />
            <span>ዛሬ፡ {getCurrentEthiopianDate().fullFormatted}</span>
          </div>

          {/* Font Size Toggle: Small / Medium / Large (የፊደል መጠን መቆጣጠሪያ) */}
          {onToggleFontSize && (
            <button
              onClick={onToggleFontSize}
              title={`የፊደል መጠን፡ ${
                fontSize === 'small' ? 'ትንሽ (ወደ መካከለኛ ቀይር)' :
                fontSize === 'medium' ? 'መካከለኛ (ወደ ትልቅ ቀይር)' :
                'ትልቅ (ወደ ትንሽ ቀይር)'
              }`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Type className="h-3.5 w-3.5 text-emerald-700" />
              <span className="hidden sm:inline">ፊደል:</span>
              <span className={`px-1.5 py-0.5 rounded text-[11px] font-black ${
                fontSize === 'large' ? 'bg-emerald-600 text-white' :
                fontSize === 'medium' ? 'bg-cyan-600 text-white' :
                'bg-slate-200 text-slate-800'
              }`}>
                {fontSize === 'small' ? 'ትንሽ' : fontSize === 'medium' ? 'መካከለኛ' : 'ትልቅ'}
              </span>
            </button>
          )}

          {/* Smart Background Theme Switcher (የጀርባ ህብር መምረጫ) */}
          {onSelectBgTheme && (
            <button
              onClick={handleCycleBgTheme}
              title={`የጀርባ ህብር፡ ${currentThemeObj.title} (ጠቅ በማድረግ ይቀይሩ)`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Palette className="h-3.5 w-3.5 text-teal-600" />
              <span className="hidden sm:inline">ጀርባ:</span>
              <span className="flex items-center gap-1">
                <span className={`h-2.5 w-2.5 rounded-full ${currentThemeObj.dot} ring-1 ring-black/10`} />
                <span className="text-[11px] font-black text-slate-850">{currentThemeObj.name}</span>
              </span>
            </button>
          )}

          {/* Contrast Mode Toggle */}
          <button
            onClick={onToggleHighContrast}
            title={highContrast ? 'መደበኛ እይታ' : 'ከፍተኛ ንፅፅር እይታ (High Contrast)'}
            className={`hidden sm:flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
              highContrast 
                ? 'bg-amber-400 text-slate-950 border-amber-300' 
                : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-white hover:border-slate-400'
            }`}
          >
            አ+
          </button>

          {/* User Account / Role Button */}
          {userRole === 'citizen' ? (
            <button
              onClick={onOpenLoginModal}
              title="መግቢያ/Login"
              aria-label="መግቢያ/Login"
              className="flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>መግቢያ/Login</span>
            </button>
          ) : userRole === 'zone_officer' && activeZoneAccount ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('zoneReport')}
                className="flex items-center gap-2 rounded-lg border border-amber-400 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span>{activeZoneAccount.name}</span>
              </button>
              <button
                onClick={onLogout}
                title="ውጣ (Logout)"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:text-red-600 hover:border-red-300 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : userRole === 'super_admin' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('admin')}
                className="flex items-center gap-1.5 rounded-lg border border-amber-500 bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-900 hover:bg-amber-200 transition-colors cursor-pointer shadow-sm"
                title="የበላይ አስተዳዳሪ - ሁሉንም ሞጁሎች ማስተካከል ይችላሉ"
              >
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                <span>👑 የበላይ አስተዳዳሪ</span>
              </button>
              <button
                onClick={onLogout}
                title="ውጣ (Logout)"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:text-red-600 hover:border-red-300 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('admin')}
                className="flex items-center gap-2 rounded-lg border border-cyan-400 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-900 hover:bg-cyan-100 transition-colors cursor-pointer"
              >
                <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                <span>የክልሉ አስተዳዳሪ</span>
              </button>
              <button
                onClick={onLogout}
                title="ውጣ (Logout)"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:text-red-600 hover:border-red-300 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:text-slate-900 cursor-pointer"
            aria-label="ማውጫ ክፈት"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white/98 px-4 pt-2 pb-6 lg:hidden shadow-lg">
          <nav className="flex flex-col gap-1">
            {navLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-left ${
                  currentTab === item.id
                    ? 'bg-emerald-50 text-emerald-800 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <item.icon className="h-4 w-4 text-slate-500" />
                <span>{item.label}</span>
              </button>
            ))}

            {userRole === 'zone_officer' && (
              <button
                onClick={() => {
                  onSelectTab('zoneReport');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold text-left bg-amber-50 text-amber-900 border border-amber-300"
              >
                <Send className="h-4 w-4 text-amber-600" />
                <span>የወሩ ሪፖርት መላኪያ ({activeZoneAccount?.name})</span>
              </button>
            )}

            {/* Mobile Font Size Toggle */}
            {onToggleFontSize && (
              <div className="flex items-center justify-between p-3 mt-2 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-emerald-700" />
                  <span className="text-sm font-bold text-slate-800">የፊደል መጠን</span>
                </div>
                <button
                  onClick={onToggleFontSize}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-black shadow-xs cursor-pointer"
                >
                  {fontSize === 'small' ? 'ትንሽ (Small) ✓' : fontSize === 'medium' ? 'መካከለኛ (Medium) ✓' : 'ትልቅ (Large) ✓'}
                </button>
              </div>
            )}

            {/* Mobile Background Theme Switcher */}
            {onSelectBgTheme && (
              <div className="p-3 mt-1.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-teal-700" />
                  <span className="text-sm font-bold text-slate-800">የጀርባ ህብር (Smart Background)</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {bgThemeList.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onSelectBgTheme(t.id)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        bgTheme === t.id
                          ? 'bg-white border-emerald-500 text-emerald-900 shadow-xs'
                          : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${t.dot}`} />
                      <span>{t.name}</span>
                      {bgTheme === t.id && <span className="ml-auto text-emerald-600 font-black">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
