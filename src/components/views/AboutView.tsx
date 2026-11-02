import React from 'react';
import { Shield, Target, Compass, Building, Users, CheckCircle2, Sparkles } from 'lucide-react';
import { AboutModuleContent, UserRole } from '../../types';

interface AboutViewProps {
  content?: AboutModuleContent;
  userRole?: UserRole;
  onOpenContentEditor?: (moduleName: any) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  content,
  userRole,
  onOpenContentEditor
}) => {
  const defaultLeaders = [
    {
      name: 'ዶ/ር ማርቆስ ተስፋዬ',
      title: 'የማዕከላዊ ኢትዮጵያ ክልል የወሳኝ ኩነቶች ኤጀንሲ ዋና ዳይሬክተር',
      bio: 'በሲቪል ምዝገባና ማህበረሰብ ስታትስቲክስ ዘርፍ የረጅም ጊዜ ልምድ ያላቸው ሲሆን፣ በክልሉ 10ሩም ዞኖች (ሀላባን ጨምሮ) ዲጂታል የወሳኝ ኩነቶች ምዝገባ እንዲስፋፋ እየመሩ ይገኛሉ።',
      image: '/src/assets/images/director_general_portrait_1791107786721.jpg',
      tenure: 'ከ2015 ዓ.ም ጀምሮ',
    },
    {
      name: 'አቶ አበበ ኃይሌ',
      title: 'የዞኖች ቅንጅትና የስታቲስቲክስ ዘርፍ ምክትል ዳይሬክተር',
      bio: 'የሀላባ፣ ሀዲያ፣ ጉራጌ፣ ስልጤ፣ ከምባታ እና የልዩ ወረዳዎችን ወርሃዊ ሪፖርት መረካከብና የጥራት ቁጥጥር ስራዎችን በበላይነት ያስተባብራሉ።',
      image: '/src/assets/images/civic_identity_hero_1791107773539.jpg',
      tenure: 'ከ2016 ዓ.ም ጀምሮ',
    },
    {
      name: 'ወ/ሮ ዘውዲቱ ተስፋዬ',
      title: 'የህግና የደንብ ተገዢነት ዋና ኦፊሰር',
      bio: 'የህጋዊ የጊዜ ገደቦችን፣ የዘገዩ ምዝገባዎች የቃለ-መሀላ ማስረጃዎችንና የዜጎች መብት ጥበቃ ደንቦችን አፈጻጸም ይከታተላሉ።',
      image: '/src/assets/images/director_general_portrait_1791107786721.jpg',
      tenure: 'ከ2016 ዓ.ም ጀምሮ',
    },
    {
      name: 'አቶ ከድር ሸምሱ',
      title: 'የመረጃ ቴክኖሎጂና ዲጂታል ትስስር ኃላፊ',
      bio: 'የወረዳዎችንና የሆስፒታሎችን ዲጂታል ትስስር እና የወርሃዊ ፓወር ፖይንት አውቶሜሽን ስርዓትን የዘረጉ መሃንዲስ።',
      image: '/src/assets/images/civic_identity_hero_1791107773539.jpg',
      tenure: 'ከ2016 ዓ.ም ጀምሮ',
    },
  ];

  const leaders = content?.leaders?.length ? content.leaders : defaultLeaders;
  const milestones = content?.milestones?.length ? content.milestones : [
    {
      year: '2016 ዓ.ም',
      title: 'ምዕራፍ 1፡ የ10ሩም ዞኖች የመረጃ ቋት ማቋቋም',
      desc: 'የሀላባ፣ ሀዲያ፣ ጉራጌ፣ ምሥራቅ ጉራጌ፣ ስልጤ፣ ከምባታ፣ የም፣ ማረቆ፣ ጠምባሮ እና ቀቤና ዞኖች የወሳኝ ኩነቶች መረብ ተዘረጋ።'
    },
    {
      year: '2016 ዓ.ም',
      title: 'ምዕራፍ 2፡ የሆስፒታሎችና ጤና ጣቢያዎች ቀጥታ ትስስር',
      desc: 'በሀላባ ቁሊቶ፣ ሆሳዕና፣ ወልቂጤ፣ ቡታጅራ፣ ወራቤ እና ዱራሜ በሚገኙ ሆስፒታሎች የልደትና ሞት ማሳወቂያ ዲጂታል ሆነ።'
    },
    {
      year: '2017 ዓ.ም',
      title: 'ምዕራፍ 3፡ ወርሃዊ የፓወር ፖይንት (PPTX) ሪፖርት አውቶሜሽን',
      desc: 'ዞኖች ወርሃዊ መረጃቸውን በየመለያቸው ሲያስገቡ የክልሉ አስተዳደር ወዲያውኑ የተጠናከረ የፓወር ፖይንት ሪፖርት የሚያመነጭበት ቴክኖሎጂ ስራ ጀመረ።'
    },
    {
      year: '2018 ዓ.ም',
      title: 'ምዕራፍ 4፡ 100% በወቅቱ የምዝገባ ሽፋን ግብ (SDG 16.9)',
      desc: 'በክልሉ ተንቀሳቃሽ የምዝገባ ቡድኖችን ወደ ተራራማና ሩቅ ወረዳዎች በማሰማራት የዘገዩ ምዝገባዎችን ወደ ዜሮ የማውረድ ዘመቻ።'
    }
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
              <span className="text-[11px] text-amber-800">የተቋሙን ራዕይ፣ ተልዕኮ፣ እሴቶችና የአመራሮችን መረጃ ማስተካከል ይችላሉ።</span>
            </div>
          </div>
          <button
            onClick={() => onOpenContentEditor('about')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-black cursor-pointer shadow-md transition-all self-start sm:self-auto"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>የስለ እኛ ይዘት አርትዕ (Edit About Content)</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 shadow-xs">
          <Building className="h-3.5 w-3.5 text-emerald-600" />
          <span>የክልሉ ተቋማዊ ተልዕኮና አደረጃጀት</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          ስለ ማዕከላዊ ኢትዮጵያ ክልል የወሳኝ ኩነቶች ምዝገባ ኤጀንሲ
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed font-normal">
          {content?.agencyOverview || 'የማዕከላዊ ኢትዮጵያ ብሔራዊ ክልላዊ መንግሥት የወሳኝ ኩነቶች ምዝገባ ኤጀንሲ በክልሉ ህግ መሠረት የተቋቋመ ብቸኛ ባለስልጣን ሲሆን፣ በ10ሩም ዞኖችና ልዩ ወረዳዎች የዜጎችን ልደት፣ ሞት፣ ጋብቻ፣ ፍቺ እና ጉዲፈቻ ይመዘግባል፤ ያረጋግጣል፤ ለክልሉ ዕድገት ወሳኝ የሆኑ ስታትስቲካዊ ሪፖርቶችን ያቀርባል።'}
        </p>
      </div>

      {/* Mission & Vision - NO BLACK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-6 space-y-3 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-xs">
            <Target className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">ተልዕኮ</h2>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {content?.mission || 'በማዕከላዊ ኢትዮጵያ ክልል ውስጥ የሚከሰቱ ማንኛውንም ወሳኝ ኩነቶች ጥራቱን በጠበቀ፣ ተደራሽ እና ዘመናዊ አሰራር በመመዝገብ ለዜጎች ህጋዊ የማንነት ሰነድ መስጠት እና አስተማማኝ ስታትስቲክስ ማቅረብ።'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-6 space-y-3 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-700 shadow-xs">
            <Compass className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">ራዕይ</h2>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {content?.vision || 'በ2022 ዓ.ም በክልሉ 100% የሚሆኑ ወሳኝ ኩነቶች በወቅቱና በህጋዊ የጊዜ ገደብ የተመዘገቡበት፣ ሙሉ በሙሉ በዲጂታል የተሳሰረ እና ተዓማኒ የሲቪል ምዝገባ ሥርዓት መገንባት።'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-6 space-y-3 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 border border-purple-200 text-purple-700 shadow-xs">
            <Shield className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">የህግ የበላይነትና ደህንነት</h2>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            የተመዘገቡ ሰነዶችን ከህገ-ወጥ ለውጥና ማጭበርበር መጠበቅ፣ የዜጎችን የግል መረጃ ሚስጥራዊነት ማረጋገጥ እና የወሳኝ ኩነቶችን ህጋዊ ክብደት ማስጠበቅ።
          </p>
        </div>
      </div>

      {/* Leadership - NO BLACK */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">የክልሉ አመራር ቡድን</h2>
          <p className="text-xs text-slate-600">የክልሉን የሲቪል ምዝገባ ስራ በታማኝነትና በሙያዊ ብቃት የሚመሩ ኃላፊዎች</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {leaders.map((leader, i) => (
            <div key={i} className="flex flex-col rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-5 space-y-4 shadow-xs text-slate-900">
              {leader.image ? (
                <div className="relative h-48 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  <img
                    src={leader.image}
                    alt={leader.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-2 right-2 rounded bg-white/95 border border-slate-200 px-2 py-0.5 text-[10px] font-mono text-emerald-800 font-bold shadow-xs">
                    {leader.tenure}
                  </span>
                </div>
              ) : (
                <div className="flex h-48 w-full items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-400">
                  <Users className="h-12 w-12" />
                </div>
              )}

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">{leader.name}</h3>
                <p className="text-xs font-semibold text-emerald-700">{leader.title}</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed flex-1 font-normal">
                {leader.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap - NO BLACK */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-6 sm:p-8 shadow-sm">
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">የዘመናዊነት ጉዞ</div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">የማዕከላዊ ኢትዮጵያ ክልል የወሳኝ ኩነቶች የዲጂታል ሽግግር</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              ከወረቀት አሰራር ወደ ፈጣንና ደህንነቱ ወደተጠበቀ የዲጂታል ሪፖርትና ምዝገባ ሥርዓት የተደረገ የደረጃ በደረጃ ሽግግር።
            </p>
          </div>

          <div className="space-y-4">
            {milestones.map((m, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 border border-emerald-400 text-emerald-700 text-xs font-mono font-bold shadow-xs">
                    {idx + 1}
                  </div>
                  {idx < milestones.length - 1 && <div className="h-full w-0.5 bg-slate-200 my-1" />}
                </div>
                <div className="space-y-0.5 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-700 font-mono">{m.year}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <h3 className="text-xs font-bold text-slate-900">{m.title}</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="relative overflow-hidden rounded-xl border border-slate-200 shadow-xl bg-white">
            <img
              src="/src/assets/images/digital_archive_concept_1791107797229.jpg"
              alt="የማዕከላዊ ኢትዮጵያ ክልል ማዕከላዊ የመረጃ ቋት"
              className="w-full h-80 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-5">
              <span className="text-xs font-bold text-emerald-300 font-mono">የክልሉ ማዕከላዊ የውሂብ ማዕከል</span>
              <span className="text-sm font-semibold text-white mt-1">የ10ሩም ዞኖች ደህንነቱ የተጠበቀ የወሳኝ ኩነቶች መዝገብ</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
