import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  Search,
  FileText,
  Scale,
  Sparkles,
  UploadCloud,
  Eye,
  Trash2,
  CheckCircle2,
  Calendar,
  FileUp
} from 'lucide-react';
import { PolicyDocumentItem, ResourcesModuleContent, UserRole } from '../../types';
import { triggerDocumentDownload } from '../../utils/documentStorage';
import { UploadDocumentModal } from '../admin/UploadDocumentModal';
import { DocumentViewerModal } from '../admin/DocumentViewerModal';

interface ResourcesViewProps {
  content?: ResourcesModuleContent;
  userRole?: UserRole;
  onOpenContentEditor?: (moduleName: any) => void;
  onUploadDocument?: (doc: PolicyDocumentItem) => void;
  onDeleteDocument?: (docId: string) => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  content,
  userRole,
  onOpenContentEditor,
  onUploadDocument,
  onDeleteDocument
}) => {
  const [faqSearch, setFaqSearch] = useState('');
  const [docSearch, setDocSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<PolicyDocumentItem | null>(null);

  const defaultPolicyDocuments: PolicyDocumentItem[] = [
    {
      id: 'doc-01',
      title: 'የኢትዮጵያ የወሳኝ ኩነቶች ምዝገባ እና ብሔራዊ መታወቂያ አዋጅ',
      category: 'ህጋዊ አዋጅ',
      fileSize: '2.1 MB · PDF',
      description: 'በሀገር አቀፍ ደረጃ የወሳኝ ኩነቶች ምዝገባ ግዴታ፣ ህጋዊ የጊዜ ገደቦችና የመዝጋቢዎች ስልጣንን የሚደነግገው ዋናው ህግ።',
      date: 'የታደሰ 2016 ዓ.ም'
    },
    {
      id: 'doc-02',
      title: 'የማዕከላዊ ኢትዮጵያ ክልል የዞኖችና ወረዳዎች የምዝገባ አፈጻጸም መመሪያ',
      category: 'የክልሉ መመሪያ',
      fileSize: '1.7 MB · PDF',
      description: 'በሀላባ፣ ሀዲያ፣ ጉራጌ፣ ስልጤ፣ ከምባታ እና በሌሎችም ዞኖች ወርሃዊ ሪፖርት አቀራረብና የመረጃ ፍሰት መመሪያ።',
      date: '2016 ዓ.ም'
    },
    {
      id: 'doc-03',
      title: 'የጤና ተቋማትና የሆስፒታሎች የልደትና ሞት ማሳወቂያ መመሪያ',
      category: 'የጤና ዘርፍ መመሪያ',
      fileSize: '1.4 MB · PDF',
      description: 'የወሊድ ክፍሎችና የሆስፒታል ሞግዚቶች ልደትና ሞት እንደተከሰተ ወዲያውኑ ለወሳኝ ኩነቶች ቢሮ የሚያሳውቁበት መመሪያ።',
      date: '2016 ዓ.ም'
    },
    {
      id: 'doc-04',
      title: 'ዘግይቶ ምዝገባ የፍርድ ቤት ቃለ-መሀላ ማስረጃ ቅጽ (Affidavit Form)',
      category: 'የህዝብ ቅጽ',
      fileSize: '420 KB · PDF',
      description: 'ከህጋዊ የጊዜ ገደብ ውጪ ለዘገዩ ምዝገባዎች በወረዳ ፍርድ ቤት የሚሞላና የሚረጋገጥ የቃለ-መሀላ ማመልከቻ።',
      date: '2016 ዓ.ም'
    }
  ];

  const defaultFaqs = [
    {
      q: 'መደበኛ ምዝገባ እና ዘግይቶ ምዝገባ ልዩነታቸው ምንድን ነው?',
      a: 'መደበኛ ምዝገባ ማለት በህጉ በተቀመጠው የጊዜ ገደብ ውስጥ (ለምሳሌ ልደት በ90 ቀናት፣ ሞትና ጋብቻ በ30 ቀናት፣ ፍቺ በ60 ቀናት) የሚከናወን ሲሆን ሙሉ በሙሉ ከክፍያ ነፃ (0 ብር) ነው። ዘግይቶ ምዝገባ ደግሞ ከጊዜ ገደቡ በኋላ የሚከናወን ሲሆን የፍርድ ቤት ቃለ-መሀላ ማቅረብንና ለእያንዳንዱ ኩነት 500 የኢትዮጵያ ብር (ETB) ህጋዊ የቅጣት ክፍያ መክፈልን ይጠይቃል።',
      category: 'አጠቃላይ'
    },
    {
      q: 'የልደት ምስክር ወረቀት በነፃ ነው ወይስ በክፍያ ይሰጣል?',
      a: 'ህፃኑ በተወለደ በ90 ቀናት ውስጥ ለሚቀርብ ማንኛውም የልደት ምዝገባ የምስክር ወረቀቱ ሙሉ በሙሉ በነፃ (0 የኢትዮጵያ ብር) ይሰጣል። ከ90 ቀናት ካለፈ ግን 500 የኢትዮጵያ ብር (ETB) ቅጣት ይከፈላል።',
      category: 'ልደት'
    },
    {
      q: 'ዞኖች ወርሃዊ ሪፖርታቸውን እንዴት ነው ለክልሉ የሚያቀርቡት?',
      a: 'እያንዳንዱ ዞን (ሀላባ፣ ሀዲያ፣ ጉራጌ፣ ስልጤ፣ ከምባታ፣ የም፣ ማረቆ፣ ጠምባሮ፣ ቀቤና እና ምሥራቅ ጉራጌ) የተሰጠውን የተጠቃሚ ስም (Username) እና የይለፍ ቃል (Password) በመጠቀም ወደ ፖርታሉ በመግባት በወረዳዎችና ቀበሌዎች የተመዘገቡትን የልደት፣ ሞት፣ ጋብቻ፣ ፍቺና ጉዲፈቻ መደበኛና ዘግይቶ ቁጥሮችን ያስገባል፤ ለክልሉ አስተዳዳሪ ይልካል።',
      category: 'ሪፖርት'
    },
    {
      q: 'በማዕከላዊ ኢትዮጵያ ክልል የወሳኝ ኩነቶች ዋና ቢሮ የት ነው የሚገኘው?',
      a: 'የማዕከላዊ ኢትዮጵያ ክልል የወሳኝ ኩነቶች ኤጀንሲ ዋና ጽሕፈት ቤት በሆሳዕና ከተማ ይገኛል፤ በ10ሩም ዞኖች ደግሞ የዞን መምሪያዎች አሉት።',
      category: 'አድራሻ'
    }
  ];

  const policyDocuments = content?.documents?.length ? content.documents : defaultPolicyDocuments;
  const faqs = content?.faqs?.length ? content.faqs : defaultFaqs;

  const filteredDocs = policyDocuments.filter(doc => {
    const q = docSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.category.toLowerCase().includes(q) ||
      doc.description.toLowerCase().includes(q)
    );
  });

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.q.includes(faqSearch) || faq.a.includes(faqSearch);
    const matchesCat = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleDownloadDoc = (doc: PolicyDocumentItem) => {
    triggerDocumentDownload(
      doc.title,
      doc.category,
      doc.date,
      doc.description,
      doc.fileData,
      doc.fileName,
      doc.id
    );
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Super Admin Quick Content & Upload Bar */}
      {userRole === 'super_admin' && (
        <div className="rounded-2xl border border-amber-400/90 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100/60 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md shadow-amber-200/50">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-amber-500 text-slate-950 border border-amber-600 flex items-center justify-center shrink-0 shadow-sm font-black">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-950 uppercase tracking-wider block">
                  👑 የበላይ አስተዳዳሪ የሰነዶች መቆጣጠሪያ (Super Admin Document Center)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-300 text-amber-950">
                  {policyDocuments.length} ሰነዶች በድረ-ገጹ ላይ
                </span>
              </div>
              <span className="text-xs text-slate-700 leading-relaxed block mt-0.5">
                ከኮምፒውተርዎ ፒዲኤፍ፣ ዎርድ፣ ወይም ኤክሴል ሰነዶችን በቀጥታ በመጫን በድረ-ገጹ ላይ ለህዝብና ለዞን ኦፊሰሮች ያሰራጩ።
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-black cursor-pointer shadow-md shadow-emerald-700/25 transition-all"
            >
              <FileUp className="h-4 w-4" />
              <span>ሰነድ ከኮምፒውተር ጫን (Upload Document)</span>
            </button>

            {onOpenContentEditor && (
              <button
                onClick={() => onOpenContentEditor('resources')}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300 cursor-pointer shadow-xs transition-all"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>ይዘት አርትዕ (Edit CMS)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 shadow-xs">
          <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
          <span>መመሪያዎችና የህግ ማዕቀፎች</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          የወሳኝ ኩነቶች ህጎች፣ መመሪያዎችና ጥያቄዎች
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          የማዕከላዊ ኢትዮጵያ ክልል የወሳኝ ኩነቶች አዋጆች፣ የዞኖች አሰራር መመሪያዎች፣ የቃለ-መሀላ ቅጾች እና ተደጋግመው የሚጠየቁ ጥያቄዎች ማብራሪያ።
        </p>
      </div>

      {/* Publications / Documents Section */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>ህጋዊ ህትመቶችና መመሪያዎች</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {filteredDocs.length} ሰነዶች
              </span>
            </h2>
            <p className="text-xs text-slate-500">ለዜጎችና ለዞን ኦፊሰሮች ክፍት የተደረጉ ኦፊሴላዊ ሰነዶች</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="ሰነዶችን ፈልግ..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none shadow-xs"
              />
            </div>

            {userRole === 'super_admin' && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-sm cursor-pointer shrink-0 border border-amber-600"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>አዲስ ሰነድ ጫን</span>
              </button>
            )}
          </div>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-3">
            <FileText className="h-10 w-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">የተፈለገው ሰነድ አልተገኘም</h3>
            <p className="text-xs text-slate-500">የፍለጋ ቃሉን ይቀይሩ ወይም አዲስ ሰነድ ይጫኑ።</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-5 space-y-4 hover:border-emerald-500/50 hover:shadow-md transition-all shadow-sm relative group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {doc.category}
                      </span>
                      {doc.isCustomUploaded && (
                        <span className="font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 text-[10px] flex items-center gap-1">
                          <Sparkles className="h-2.5 w-2.5 text-amber-700" />
                          <span>በበላይ አስተዳዳሪ የተጫነ</span>
                        </span>
                      )}
                    </div>
                    <span className="text-slate-500 font-mono text-[11px] shrink-0">{doc.fileSize}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{doc.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{doc.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs gap-2">
                  <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    <span>{doc.date}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="flex items-center gap-1 text-slate-700 hover:text-slate-900 font-bold cursor-pointer bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors shadow-xs"
                      title="ይዘቱን በዝርዝር እይ"
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-600" />
                      <span>እይ</span>
                    </button>

                    <button
                      onClick={() => handleDownloadDoc(doc)}
                      className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-xs"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>አውርድ</span>
                    </button>

                    {userRole === 'super_admin' && onDeleteDocument && (
                      <button
                        onClick={() => {
                          if (window.confirm(`እርግጠኛ ነዎት "${doc.title}" የተሰኘውን ሰነድ ከድረ-ገጹ ማጥፋት ይፈልጋሉ?`)) {
                            onDeleteDocument(doc.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="ይህን ሰነድ ሰርዝ"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FAQs */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">ተደጋግመው የሚጠየቁ ጥያቄዎችና መልሶች</h2>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="ጥያቄዎችን ይፈልጉ..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none shadow-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFaqs.map((faq, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-5 space-y-2 shadow-sm">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">{faq.category}</span>
              <h3 className="text-xs font-bold text-slate-900">{faq.q}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Upload Document Modal for Super Admin */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={(newDoc) => {
          if (onUploadDocument) {
            onUploadDocument(newDoc);
          }
        }}
      />

      {/* Document Viewer / Preview Modal */}
      <DocumentViewerModal
        isOpen={!!previewDoc}
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
};
