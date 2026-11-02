import React, { useEffect, useState } from 'react';
import {
  X,
  Download,
  FileText,
  FileSpreadsheet,
  FileCode,
  Calendar,
  Tag,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { PolicyDocumentItem } from '../../types';
import { getDocumentBlob, triggerDocumentDownload } from '../../utils/documentStorage';

interface DocumentViewerModalProps {
  document: PolicyDocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document: doc,
  isOpen,
  onClose
}) => {
  const [activeDataUrl, setActiveDataUrl] = useState<string | null>(null);
  const [isLoadingBlob, setIsLoadingBlob] = useState(false);

  useEffect(() => {
    if (!doc) {
      setActiveDataUrl(null);
      return;
    }

    if (doc.fileData) {
      setActiveDataUrl(doc.fileData);
    } else {
      // Check IndexedDB
      setIsLoadingBlob(true);
      getDocumentBlob(doc.id).then((blobUrl) => {
        setActiveDataUrl(blobUrl);
        setIsLoadingBlob(false);
      });
    }
  }, [doc]);

  if (!isOpen || !doc) return null;

  const isPdf =
    doc.fileType?.includes('pdf') ||
    doc.fileName?.toLowerCase().endsWith('.pdf') ||
    doc.fileSize?.toLowerCase().includes('pdf');

  const isImage =
    doc.fileType?.startsWith('image/') ||
    /\.(jpg|jpeg|png|webp|gif)$/i.test(doc.fileName || '');

  const isText =
    doc.fileType?.includes('text') ||
    /\.(txt|csv)$/i.test(doc.fileName || '');

  const handleDownload = () => {
    triggerDocumentDownload(
      doc.title,
      doc.category,
      doc.date,
      doc.description,
      activeDataUrl || doc.fileData,
      doc.fileName,
      doc.id
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between shrink-0">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {doc.category}
              </span>
              <span className="text-[11px] font-mono text-slate-500">{doc.fileSize}</span>
              {doc.isCustomUploaded && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                  በበላይ አስተዳዳሪ የተጫነ
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{doc.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">የወጣበት ቀን/ዓ.ም</span>
              <span className="text-xs font-bold text-slate-900 font-mono mt-0.5 block">{doc.date || '2018 ዓ.ም'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">የፋይሉ ስም</span>
              <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 block truncate">
                {doc.fileName || `${doc.title.slice(0, 24)}.pdf`}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">የተጫነበት ሁኔታ</span>
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>በስርዓቱ የተረጋገጠ</span>
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-900">የሰነዱ ማጠቃለያና ዝርዝር መረጃ፦</h3>
            <p className="text-xs text-slate-600 leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
              {doc.description}
            </p>
          </div>

          {/* Live Preview if PDF / Image / Text */}
          {activeDataUrl && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>የሰነዱ ቅድመ እይታ (Preview)</span>
              </h3>

              {isPdf && (
                <div className="rounded-xl overflow-hidden border border-slate-200 h-80 bg-slate-100 flex flex-col">
                  <iframe
                    src={activeDataUrl}
                    title={doc.title}
                    className="w-full h-full border-0"
                  />
                </div>
              )}

              {isImage && (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900/5 p-4 flex items-center justify-center max-h-80">
                  <img
                    src={activeDataUrl}
                    alt={doc.title}
                    className="max-h-72 object-contain rounded-lg shadow-sm"
                  />
                </div>
              )}

              {!isPdf && !isImage && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <FileText className="h-8 w-8 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-600">
                    ይህ ሰነድ ከኮምፒውተር በቀጥታ የወረደ ኦሪጅናል ፋይል ነው። ሙሉ ይዘቱን ለመክፈት ከስር ያለውን የማውረጃ ቁልፍ ይጠቀሙ።
                  </p>
                </div>
              )}
            </div>
          )}

          {isLoadingBlob && (
            <div className="text-center py-6 text-slate-400 text-xs">
              <div className="h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>ሰነዱን በመጫን ላይ...</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            የማዕከላዊ ኢትዮጵያ ክልል የወሳኝ ኩነቶች ኤጀንሲ ይፋዊ ማህደር
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              ዝጋ
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>ሰነዱን አውርድ (Download)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
