import React, { useState } from 'react';
import { ServiceType, ServicesModuleContent, UserRole } from '../../types';
import { STATUTORY_LIMITS_AM } from '../../data/mockDatabase';
import { 
  Baby, 
  FileCheck2, 
  Heart, 
  HeartHandshake, 
  UserCheck, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  HelpCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface ServicesViewProps {
  content?: ServicesModuleContent;
  userRole?: UserRole;
  onOpenContentEditor?: (moduleName: any) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  content,
  userRole,
  onOpenContentEditor
}) => {
  const [activeService, setActiveService] = useState<ServiceType>('birth');

  const defaultIcons: Record<ServiceType, React.ComponentType<{ className?: string }>> = {
    birth: Baby,
    death: FileCheck2,
    marriage: Heart,
    divorce: HeartHandshake,
    adoption: UserCheck
  };

  const servicesDataAm: Record<ServiceType, {
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    statutoryDays: number;
    feeCurrent: string;
    feeLate: string;
    informant: string;
    requiredDocs: string[];
    steps: { title: string; desc: string }[];
    lateRequirements: string[];
    faqs: { q: string; a: string }[];
  }> = {
    birth: {
      title: 'የልደት ምዝገባ አገልግሎት',
      subtitle: 'የህፃኑን ህጋዊ ማንነትና ዜግነት የማረጋገጥ ህገ-መንግሥታዊ መብት',
      icon: Baby,
      statutoryDays: 90,
      feeCurrent: 'ነፃ (0 የኢትዮጵያ ብር)',
      feeLate: '500 የኢትዮጵያ ብር (ETB) የቅጣት ክፍያ',
      informant: 'የህፃኑ ወላጅ እናት ወይም አባት፣ ህጋዊ አሳዳጊ ወይም ልደቱን ያዋለደው የጤና ባለሙያ።',
      requiredDocs: [
        'ህፃኑ የተወለደበት ሆስፒታል ወይም ጤና ጣቢያ የሰጠው የልደት ማስታወቂያ ሰነድ (Birth Notification)',
        'የወላጆች የታደሰ የቀበሌ መታወቂያ ወይም ፓስፖርት ኮፒ',
        'የወላጆች የጋብቻ ምስክር ወረቀት (ካለ)',
        'በቤት ውስጥ የተወለደ ከሆነ የቀበሌው አስተዳደር ወይም የጎረቤት ምስክሮች የሰጡት ማረጋገጫ'
      ],
      steps: [
        { title: 'ደረጃ 1፡ የልደት ማስታወቂያ ሰነድ መያዝ', desc: 'ህፃኑ በተወለደበት የጤና ተቋም የተሰጠውን ህጋዊ የልደት ቅፅ ይያዙ።' },
        { title: 'ደረጃ 2፡ ወደ ቀበሌ ወይም ወረዳ ወሳኝ ኩነቶች ቢሮ መሄድ', desc: 'በ90 ቀናት ውስጥ የወላጆችን መታወቂያ ይዘው በአቅራቢያዎ ወደሚገኝ የወሳኝ ኩነቶች ጽሕፈት ቤት ያምሩ።' },
        { title: 'ደረጃ 3፡ መረጃውን በመዝገብ ላይ ማስፈር', desc: 'መዝጋቢው መረጃዎችን አረጋግጦ ወደ ማዕከላዊ የሲቪል መዝገብ ያስገባል።' },
        { title: 'ደረጃ 4፡ የልደት ምስክር ወረቀት መረከብ', desc: 'የደህንነት ባርኮድ እና ይፋዊ ማህተም ያለበትን የልደት ምስክር ወረቀት ሙሉ በሙሉ በነፃ (0 ብር) ይረከባሉ።' }
      ],
      lateRequirements: [
        'ህፃኑ በ90 ቀናት ውስጥ ያልተመዘገበበትን ምክንያት የሚገልጽ በወረዳ ፍርድ ቤት የተረጋገጠ ቃለ-መሀላ',
        'የህፃኑ የክትባት ካርድ (Immunization Card) ዋናውና ፎቶ ኮፒ',
        'የ500 የኢትዮጵያ ብር (ETB) የዘገየ ምዝገባ ህጋዊ የቅጣት ክፍያ ደረሰኝ'
      ],
      faqs: [
        { q: 'ልደት በ90 ቀናት ውስጥ ካልተመዘገበ ምን ይሆናል?', a: 'ከ90 ቀናት በኋላ የሚቀርብ ምዝገባ ዘግይቶ እንደተመዘገበ ተቆጥሮ ተጨማሪ የፍርድ ቤት ቃለ-መሀላ ማስረጃዎችን ማቅረብና 500 የኢትዮጵያ ብር (ETB) የቅጣት ክፍያ መክፈልን ይጠይቃል። በወቅቱ ከተመዘገበ ግን ሙሉ በሙሉ ነፃ (0 ብር) ነው።' },
        { q: 'በቤት ውስጥ የተወለደን ህፃን እንዴት ማስመዝገብ ይቻላል?', a: 'ልደቱ በተከሰተበት ቀበሌ በመሄድ ልደቱን ያዩ ሁለት ምስክሮች ቃለ-መሀላ በመስጠት በቀበሌው ወሳኝ ኩነቶች መዝጋቢ በኩል በነፃ ማስመዝገብ ይቻላል።' }
      ]
    },
    death: {
      title: 'የሞት ምዝገባ አገልግሎት',
      subtitle: 'ህጋዊ የሞት ምስክር ወረቀት እና የውርስ ማጣሪያ ፈቃድ',
      icon: FileCheck2,
      statutoryDays: 50,
      feeCurrent: 'ነፃ (0 የኢትዮጵያ ብር)',
      feeLate: '500 የኢትዮጵያ ብር (ETB) የቅጣት ክፍያ',
      informant: 'የሟች የትዳር አጋር፣ የቅርብ የቤተሰብ አባል፣ አብሮ የሚኖር ዘመድ ወይም የቀብር ስነ-ስርዓት አስተባባሪ።',
      requiredDocs: [
        'የህክምና ተቋም የሰጠው የሞት መንስኤ ማረጋገጫ ምስክር ወረቀት (Medical Certificate of Cause of Death)',
        'የሟች ዋናው የቀበሌ መታወቂያ (ለመሰረዝ የሚመለስ)',
        'ሞቱ የተከሰተበትን የሚያረጋግጥ የቀበሌ አስተዳደር የድጋፍ ደብዳቤ',
        'የአመልካቹ የታደሰ መታወቂያ'
      ],
      steps: [
        { title: 'ደረጃ 1፡ የሞት ማረጋገጫ ማግኘት', desc: 'ከህክምና ባለሙያ ወይም ከቀበሌው አስተዳደር የሞት ማረጋገጫ ሰነድ ይቀበሉ።' },
        { title: 'ደረጃ 2፡ በ50 ቀናት ውስጥ ማመልከት', desc: 'ሰነዶቹን ይዘው ወደ ወረዳው ወይም ቀበሌው ወሳኝ ኩነቶች ጽሕፈት ቤት በነፃ (0 ብር) ያቅርቡ።' },
        { title: 'ደረጃ 3፡ የሟችን መታወቂያ መሰረዝ', desc: 'የሟች የቀበሌ መታወቂያ በህግ ተሰርዞ ከመዝገብ ጋር ይያያዛል።' },
        { title: 'ደረጃ 4፡ የሞት ምስክር ወረቀት መረከብ', desc: 'ለቀብር፣ ለውርስና ለጡረታ ማስፈጸሚያ የሚረዳ ህጋዊ የሞት ሰርተፊኬት ይሰጣል።' }
      ],
      lateRequirements: [
        'ከ50 ቀናት እስከ 1 ዓመት የዘገየበትን ምክንያት የሚያስረዳ የቤተሰብ ቃለ-መሀላ',
        'የፖሊስ ወይም የፍርድ ቤት ማጣሪያ ማረጋገጫ',
        'የ500 የኢትዮጵያ ብር (ETB) ዘግይቶ ምዝገባ የቅጣት ክፍያ ደረሰኝ',
        'ከ1 ዓመት በላይ ለሆነ ነባር ሞት የፍርድ ቤት ውሳኔ ሰነድ'
      ],
      faqs: [
        { q: 'የሞት ምዝገባ የጊዜ ገደብ ለምን እስከ 50 ቀናት ሆነ?', a: 'ለቀብር ፍቃድ፣ ለንብረትና ውርስ ክፍፍል፣ ለጡረታ አበል እና የሟችን ህጋዊ ሰነዶች በወቅቱ ሰርዞ የማንነት ማጭበርበርን ለመከላከል ነው። በ50 ቀናት ውስጥ መመዝገብ ሙሉ በሙሉ ነፃ (0 ብር) ሲሆን፣ ከ50 ቀናት እስከ 1 ዓመት 500 ብር ቅጣት ይከፈላል፤ ከ1 ዓመት በላይ ሲሆን ነባር ሆኖ በማስረጃ ይስተናገዳል።' }
      ]
    },
    marriage: {
      title: 'የጋብቻ ምዝገባ አገልግሎት',
      subtitle: 'የፍትሐብሔር እና የባህላዊ ጋብቻዎች ህጋዊ እውቅና ማረጋገጫ',
      icon: Heart,
      statutoryDays: 30,
      feeCurrent: 'ነፃ (0 የኢትዮጵያ ብር)',
      feeLate: '500 የኢትዮጵያ ብር (ETB) የቅጣት ክፍያ',
      informant: 'ሁለቱም ተጋቢዎች በአካል ቀርበው ከሁለት ምስክሮች ጋር የሚያረጋግጡት።',
      requiredDocs: [
        'የሁለቱም ተጋቢዎች የታደሰ የቀበሌ መታወቂያ እና የፓስፖርት መጠን ፎቶግራፍ',
        'ጋብቻው የተፈጸመበት የሃይማኖት ተቋም ወይም የባህላዊ ሽማግሌዎች የጋብቻ ውል ሰነድ',
        'የሁለት አዋቂ ምስክሮች የታደሰ የቀበሌ መታወቂያ',
        'ተጋቢዎቹ ከዚህ በፊት ያላገቡ መሆናቸውን ወይም የቀድሞ ጋብቻ በፍቺ/በሞት የተቋረጠ መሆኑን የሚያረጋግጥ ማስረጃ'
      ],
      steps: [
        { title: 'ደረጃ 1፡ የጋብቻ ውል ሰነድ ማዘጋጀት', desc: 'በሃይማኖት፣ በባህል ወይም በፍትሐብሔር የተፈጸመውን ጋብቻ ማስረጃ ያዘጋጁ።' },
        { title: 'ደረጃ 2፡ ወደ ወሳኝ ኩነቶች ቢሮ መቅረብ', desc: 'ጋብቻው ከተፈጸመበት ቀን ጀምሮ በ30 ቀናት ውስጥ ሁለቱም ተጋቢዎች ከምስክሮቻቸው ጋር ያለ ምንም ክፍያ በነፃ ይቅረቡ።' },
        { title: 'ደረጃ 3፡ ፊርማ ማኖር', desc: 'በመዝገቡ ላይ ተጋቢዎችና ምስክሮች ፊርማቸውን ያኖራሉ።' },
        { title: 'ደረጃ 4፡ የጋብቻ ምስክር ወረቀት መረከብ', desc: 'ህጋዊ የጋብቻ ሰርተፊኬት በሁለቱም ስም በነፃ ተዘጋጅቶ ይሰጣል።' }
      ],
      lateRequirements: [
        'ከተጋቡ ከ31 ቀናት እስከ 1 ዓመት የዘገየበትን ምክንያት የሚገልጽ በወረዳ ፍርድ ቤት የተረጋገጠ የጋራ ቃለ-መሀላ',
        'የ500 የኢትዮጵያ ብር (ETB) የዘገየ ምዝገባ የቅጣት ክፍያ ደረሰኝ',
        'ከ1 ዓመት በኋላ ለሚቀርብ ነባር ጋብቻ የጋብቻ ውል ማረጋገጫ'
      ],
      faqs: [
        { q: 'ባህላዊ ወይም የሃይማኖት ጋብቻዎች መመዝገብ አለባቸው?', a: 'አዎ። ማንኛውም ዓይነት ጋብቻ ህጋዊ ጥበቃ እንዲያገኝ በተጋቡ በ30 ቀናት ውስጥ በነፃ መመዝገብ አለበት። ከ31 ቀናት እስከ 1 ዓመት 500 ብር ቅጣት ሲሆን ከ1 ዓመት በኋላ ነባር ሆኖ ይመዘገባል።' }
      ]
    },
    divorce: {
      title: 'የፍቺ ምዝገባ አገልግሎት',
      subtitle: 'የፍርድ ቤት ፍቺ ውሳኔን ማስመዝገብና የጋብቻ መፍረስ ማረጋገጫ',
      icon: HeartHandshake,
      statutoryDays: 30,
      feeCurrent: 'ነፃ (0 የኢትዮጵያ ብር)',
      feeLate: '500 የኢትዮጵያ ብር (ETB) የቅጣት ክፍያ',
      informant: 'ከቀድሞ ተጋቢዎች አንደኛው ወይም ህጋዊ ውክልና ያለው ጠበቃ።',
      requiredDocs: [
        'የፍርድ ቤት ይፋዊ ማህተም ያረፈበት የመጨረሻ የፍቺ ውሳኔ (Decree Absolute)',
        'ዋናው የጋብቻ ምስክር ወረቀት (የተሰረዘ ማህተም ለማሳረፍ)',
        'የአመልካቹ የታደሰ የቀበሌ መታወቂያ',
        'የውሳኔው ላይ ይግባኝ ያልተባለበት መሆኑን የሚያረጋግጥ የፍርድ ቤት ደብዳቤ'
      ],
      steps: [
        { title: 'ደረጃ 1፡ የፍርድ ቤት ውሳኔ ማግኘት', desc: 'ከሚመለከተው የወረዳ ወይም የከፍተኛ ፍርድ ቤት የመጨረሻ የፍቺ ፍርድ ሰነድ ይቀበሉ።' },
        { title: 'ደረጃ 2፡ በ30 ቀናት ውስጥ ማቅረብ', desc: 'ሰነዱን ይዘው ወደ ወረዳው ወሳኝ ኩነቶች ጽሕፈት ቤት ያለ ክፍያ በነፃ ያቅርቡ።' },
        { title: 'ደረጃ 3፡ የሲቪል ሁኔታ ማስተካከያ', desc: 'በመዝገቡ ላይ የተጋቢዎቹ ሁኔታ ከባለትዳርነት ወደ ነጠላ/የተፋታ ይቀየራል።' },
        { title: 'ደረጃ 4፡ የፍቺ ማረጋገጫ ሰርተፊኬት', desc: 'ህጋዊ የፍቺ ምስክር ወረቀት ተዘጋጅቶ ለአመልካቹ ይሰጣል።' }
      ],
      lateRequirements: [
        'ከ31 ቀናት እስከ 1 ዓመት የዘገየበትን ምክንያት የሚያስረዳ ማመልከቻ',
        'የ500 የኢትዮጵያ ብር (ETB) የዘገየ ምዝገባ የቅጣት ክፍያ ደረሰኝ',
        'ከ1 ዓመት በኋላ ለሆነ ነባር ፍቺ ተጨማሪ የፍርድ ቤት ማጣሪያ'
      ],
      faqs: [
        { q: 'ፍርድ ቤት ከወሰነ በቂ አይደለም ወይ?', a: 'ፍርድ ቤቱ የፍቺ ውሳኔ ቢሰጥም የሲቪል መዝገብ ላይ ተመዝግቦ የጋብቻ ምስክር ወረቀቱ ካልተሰረዘ በህግ ዘንድ የጋብቻው ሁኔታ እንደቀጠለ ይቆጠራል። በ30 ቀናት ውስጥ መመዝገብ ነፃ ሲሆን ከ31 ቀናት እስከ 1 ዓመት 500 ብር ቅጣት ይከፈላል፤ ከ1 ዓመት በኋላ ነባር ፍቺ ነው።' }
      ]
    },
    adoption: {
      title: 'የጉዲፈቻ ምዝገባ አገልግሎት',
      subtitle: 'የልጆች ህጋዊ ጥበቃ፣ አዲስ የልደት ሰነድ እና የወላጅነት መብት',
      icon: UserCheck,
      statutoryDays: 30,
      feeCurrent: 'ነፃ (0 የኢትዮጵያ ብር)',
      feeLate: '500 የኢትዮጵያ ብር (ETB) የቅጣት ክፍያ',
      informant: 'የጉዲፈቻ አሳዳጊ ወላጆች ወይም የህፃናት መብት ተሟጋች ተቋም ኃላፊ።',
      requiredDocs: [
        'የፍርድ ቤት ይፋዊ የጉዲፈቻ ውሳኔ እና ውል ማረጋገጫ (Adoption Court Order)',
        'የህፃኑ የቀድሞ ዋና የልደት ምስክር ወረቀት',
        'የአሳዳጊ ወላጆች የታደሰ መታወቂያ ወይም ፓስፖርት',
        'የማህበራዊ ጉዳይና ሴቶችና ህፃናት መምሪያ የሰጠው የብቃት ድጋፍ ደብዳቤ'
      ],
      steps: [
        { title: 'ደረጃ 1፡ የፍርድ ቤት ውሳኔ መቀበል', desc: 'ከከፍተኛ ፍርድ ቤት ህጋዊ የጉዲፈቻ ፈቃድ ውሳኔን ይቀበሉ።' },
        { title: 'ደረጃ 2፡ በ30 ቀናት ውስጥ ማስመዝገብ', desc: 'ሰነዶቹን ወደ ወሳኝ ኩነቶች ጽሕፈት ቤት የጉዲፈቻ መዝገብ ክፍል ያለ ክፍያ በነፃ ያቅርቡ።' },
        { title: 'ደረጃ 3፡ የቀድሞ መዝገብን በሚስጥር ማሸግ', desc: 'የህፃኑ የቀድሞ ማንነት በህግ በሚስጥር መዝገብ ውስጥ ተቀምጦ ይታሸጋል።' },
        { title: 'ደረጃ 4፡ በአዲሶቹ ወላጆች ስም የልደት ምስክር መስጠት', desc: 'በአሳዳጊ ወላጆች ስም አዲስ ህጋዊ የልደት ሰርተፊኬት ተዘጋጅቶ ይሰጣል።' }
      ],
      lateRequirements: [
        'ከ31 ቀናት እስከ 1 ዓመት የዘገየበትን ምክንያት የሚያስረዳ ማብራሪያ',
        'የሴቶችና ህፃናት መምሪያ የድጋፍ ደብዳቤ',
        'የ500 የኢትዮጵያ ብር (ETB) የዘገየ ምዝገባ የቅጣት ክፍያ ደረሰኝ',
        'ከ1 ዓመት በኋላ ለሆነ ነባር ጉዲፈቻ የፍርድ ቤት ውሳኔ ማረጋገጫ'
      ],
      faqs: [
        { q: 'አዲሱ የልደት ሰርተፊኬት ላይ ጉዲፈቻ መሆኑ ይገለጻል?', a: 'አይገለጽም። የህፃኑን ስነ-ልቦና እና እኩልነት ለመጠበቅ ልክ እንደ ማንኛውም መደበኛ የልደት ምስክር ወረቀት ተዘጋጅቶ ይሰጣል። በ30 ቀናት ውስጥ ምዝገባው ነፃ ሲሆን ከ31 ቀናት እስከ 1 ዓመት 500 ብር ቅጣት ይከፈላል፤ ከ1 ዓመት በኋላ ነባር ጉዲፈቻ ነው።' }
      ]
    }
  };

  // Use dynamic content from Super Admin CMS if available, falling back to initial data
  const dynamicService = content ? content[activeService] : null;
  const baseService = servicesDataAm[activeService];
  const current = {
    ...baseService,
    title: dynamicService?.title || baseService.title,
    subtitle: dynamicService?.subtitle || baseService.subtitle,
    statutoryDays: dynamicService?.statutoryDays || baseService.statutoryDays,
    feeCurrent: dynamicService?.feeCurrent || baseService.feeCurrent,
    feeLate: dynamicService?.feeLate || baseService.feeLate,
    informant: dynamicService?.informant || baseService.informant,
    requiredDocs: dynamicService?.requiredDocs?.length ? dynamicService.requiredDocs : baseService.requiredDocs,
    lateRequirements: dynamicService?.lateRequirements?.length ? dynamicService.lateRequirements : baseService.lateRequirements,
    steps: dynamicService?.steps?.length ? dynamicService.steps : baseService.steps,
    faqs: dynamicService?.faqs?.length ? dynamicService.faqs : baseService.faqs,
    icon: defaultIcons[activeService] || Baby,
  };
  const CurrentIcon = current.icon;

  const serviceTabButtons: { id: ServiceType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'birth', label: 'የልደት ምዝገባ', icon: Baby },
    { id: 'death', label: 'የሞት ምዝገባ', icon: FileCheck2 },
    { id: 'marriage', label: 'የጋብቻ ምዝገባ', icon: Heart },
    { id: 'divorce', label: 'የፍቺ ምዝገባ', icon: HeartHandshake },
    { id: 'adoption', label: 'የጉዲፈቻ ምዝገባ', icon: UserCheck },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Super Admin Quick Content Edit Bar */}
      {userRole === 'super_admin' && onOpenContentEditor && (
        <div className="rounded-xl border border-amber-400/80 bg-amber-50/95 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-amber-500/10 text-slate-900">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-700 font-bold">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-black text-amber-900 block">👑 የበላይ አስተዳዳሪ ሁነታ (Super Admin CMS)</span>
              <span className="text-[11px] text-amber-800">የ5ቱንም ወሳኝ ኩነቶች ህጋዊ የጊዜ ገደብ፣ የቅጣት ተመንና መመሪያዎች ማስተካከል ይችላሉ።</span>
            </div>
          </div>
          <button
            onClick={() => onOpenContentEditor('services')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-black cursor-pointer shadow-md transition-all self-start sm:self-auto"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>የአገልግሎቶች ይዘት አርትዕ (Edit Services Content)</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 shadow-xs">
          <FileText className="h-3.5 w-3.5 text-emerald-600" />
          <span>የህዝብ መረጃና መመሪያዎች</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          የወሳኝ ኩነቶች ምዝገባ አገልግሎቶች መመሪያ
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed font-normal">
          በማዕከላዊ ኢትዮጵያ ክልል ለሚገኙ ዜጎች የሚሰጡ የወሳኝ ኩነቶች ምዝገባ መረጃዎች። አስፈላጊ ሰነዶችን፣ ህጋዊ የጊዜ ገደቦችን፣ የአገልግሎት ክፍያዎችን እና የዘገዩ ምዝገባዎች ቅጣትን እዚህ ይመልከቱ።
        </p>
      </div>

      {/* Tabs - Clean Civic Buttons */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/90 rounded-xl border border-slate-200 shadow-xs">
        {serviceTabButtons.map((tab) => {
          const TabIcon = tab.icon;
          const isSelected = activeService === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveService(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TabIcon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Service Detail Banner - NO BLACK */}
      <div className="space-y-8">
        <div className="rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-700 shadow-xs">
                <CurrentIcon className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{current.title}</h2>
                <p className="text-xs text-emerald-700 font-semibold mt-0.5">{current.subtitle}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="rounded-xl border border-emerald-300 bg-emerald-50/90 p-3 shadow-xs">
                <span className="text-emerald-800 block text-[10px] uppercase font-sans font-bold">1. ወቅታዊ ምዝገባ</span>
                <span className="text-emerald-950 font-black text-sm block">እስከ {current.statutoryDays} ቀናት</span>
                <span className="text-[11px] text-emerald-700 font-sans block mt-0.5">ሙሉ በሙሉ ነፃ (0 ብር)</span>
              </div>
              <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-3 shadow-xs">
                <span className="text-amber-800 block text-[10px] uppercase font-sans font-bold">2. የዘገየ ምዝገባ</span>
                <span className="text-amber-950 font-black text-sm block">ከ{current.statutoryDays} ቀን - 1 ዓመት</span>
                <span className="text-[11px] text-amber-700 font-sans block mt-0.5">500 ETB ህጋዊ ቅጣት</span>
              </div>
              <div className="rounded-xl border border-purple-300 bg-purple-50/90 p-3 shadow-xs">
                <span className="text-purple-800 block text-[10px] uppercase font-sans font-bold">3. ነባር ምዝገባ</span>
                <span className="text-purple-950 font-black text-sm block">ከ1 ዓመት በኋላ</span>
                <span className="text-[11px] text-purple-700 font-sans block mt-0.5">በማስረጃ እና የውሳኔ ሰነድ</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">ኩነቱን ማሳወቅ የሚችሉ አካላት (አመልካቾች)፡</h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              {current.informant}
            </p>
          </div>
        </div>

        {/* Requirements & Procedures */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Docs Checklist */}
          <div className="lg:col-span-5 rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">አስፈላጊ ሰነዶች ማመሳከሪያ</h3>
            </div>
            <p className="text-xs text-slate-600">
              ወደ ቀበሌው ወይም ወረዳው ወሳኝ ኩነቶች ቢሮ ሲሄዱ ዋናውንና ፎቶ ኮፒውን ይዘው ይቅረቡ፡
            </p>
            <ul className="space-y-3">
              {current.requiredDocs.map((doc, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div className="lg:col-span-7 rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">የምዝገባ ቅደም-ተከተል</h3>
            </div>
            <div className="space-y-3">
              {current.steps.map((st, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 shadow-xs">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{st.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{st.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Late Registration Regulations */}
        <div className="rounded-xl border border-amber-300 bg-amber-50/90 backdrop-blur-md p-6 space-y-3 shadow-xs text-slate-900">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider">ዘግይቶ ምዝገባ ደንቦች እና ማሟያዎች</h3>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            ምዝገባው ከህጋዊው <strong>የ{current.statutoryDays} ቀናት ገደብ</strong> ካለፈ መደበኛ ምዝገባ ይቋረጣል። የማጭበርበር ስጋትን ለመከላከል ተጨማሪ ህጋዊ ሰነዶችን ማቅረብ ያስፈልጋል፡
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {current.lateRequirements.map((req, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-800 bg-white/95 p-2.5 rounded-lg border border-amber-200 shadow-xs">
                <span className="text-amber-700 font-bold">›</span>
                <span>{req}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-6 space-y-4 shadow-sm text-slate-900">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">ተደጋግመው የሚጠየቁ ጥያቄዎች</h3>
          </div>
          <div className="space-y-3">
            {current.faqs.map((faq, i) => (
              <div key={i} className="rounded-lg bg-slate-50 p-4 border border-slate-200 space-y-1 shadow-xs">
                <h4 className="text-xs font-bold text-slate-900">{faq.q}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
