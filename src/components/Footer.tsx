import React from 'react';
import { ShieldCheck, Lock, ExternalLink } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="border-t border-slate-200/90 bg-white/95 backdrop-blur-md text-slate-600 no-print mt-auto shadow-xs">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-base font-black text-slate-900 tracking-tight leading-tight">የማዕከላዊ ኢትዮጵያ ክልል ሲቪልና ቤተሰብ ምዝገባ ኤጀንሲ</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              የማዕከላዊ ኢትዮጵያ ክልል ሲቪልና ቤተሰብ ምዝገባ ኤጀንሲ ይፋዊ ፖርታል፤ በሀላባ፣ ሀዲያ፣ ጉራጌ፣ ምሥራቅ ጉራጌ፣ ስልጤ፣ ከምባታ፣ የም፣ ማረቆ፣ ጠምባሮ እና ቀቤና ዞኖች የተመዘገቡ ወሳኝ ኩነቶች ህጋዊ መዝገብ።
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-mono font-bold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 inline-flex">
              <Lock className="h-3 w-3 text-emerald-600" />
              <span>TLS 1.3 / AES-256 በምስጠራ የተጠበቀ</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">የወሳኝ ኩነት አገልግሎቶች</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onSelectTab('services')} className="hover:text-emerald-700 transition-colors cursor-pointer text-slate-600">
                  የልደት ምዝገባ (በ90 ቀናት ውስጥ በነፃ)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('services')} className="hover:text-emerald-700 transition-colors cursor-pointer text-slate-600">
                  የሞት ምዝገባ (በ30 ቀናት ውስጥ በነፃ)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('services')} className="hover:text-emerald-700 transition-colors cursor-pointer text-slate-600">
                  የጋብቻ ምዝገባ እና ህጋዊ ምስክር
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('services')} className="hover:text-emerald-700 transition-colors cursor-pointer text-slate-600">
                  የፍርድ ቤት ፍቺ ውሳኔ ምዝገባ
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('services')} className="hover:text-emerald-700 transition-colors cursor-pointer text-slate-600">
                  የጉዲፈቻ ልጅ አስተዳደግ ምዝገባ
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">የትንታኔ ሪፖርቶች</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onSelectTab('reports')} className="hover:text-emerald-700 transition-colors cursor-pointer text-slate-600">
                  የወርሃዊ ፓወር ፖይንት (.pptx) ሪፖርት ማመንጫ
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('reports')} className="hover:text-emerald-700 transition-colors cursor-pointer text-slate-600">
                  የመደበኛ እና የዘገዩ ምዝገባዎች ንፅፅር
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('reports')} className="hover:text-emerald-700 transition-colors cursor-pointer text-slate-600">
                  የ10ሩም ዞኖች አፈጻጸም ሠንጠረዥ
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('resources')} className="hover:text-emerald-700 transition-colors cursor-pointer text-slate-600">
                  የኢትዮጵያ የወሳኝ ኩነቶች አዋጅና ደንብ
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">የእርዳታ መስመርና አድራሻ</h4>
            <p className="text-xs text-slate-600 mb-1">የክልሉ ነፃ የስልክ መስመር፡</p>
            <p className="text-base font-bold font-mono mb-2 text-emerald-700">8891 (ነፃ ጥሪ)</p>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              ሆሳዕና ከተማ፣ የማዕከላዊ ኢትዮጵያ ክልል መንግሥት ህንፃ። የስራ ሰዓት፡ ከሰኞ - አርብ ከጧቱ 2:30 እስከ 11:30።
            </p>
            <button
              onClick={() => onSelectTab('contact')}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
            >
              <span>የዞኖችን ቢሮዎች አድራሻ ተመልከት</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 የማዕከላዊ ኢትዮጵያ ክልል ሲቪልና ቤተሰብ ምዝገባ ኤጀንሲ። መብቱ በህግ የተጠበቀ ነው።</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-800 cursor-pointer" onClick={() => onSelectTab('resources')}>ደንቦችና መመሪያዎች</span>
            <span>·</span>
            <span className="hover:text-slate-800 cursor-pointer" onClick={() => onSelectTab('contact')}>ያግኙን</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
