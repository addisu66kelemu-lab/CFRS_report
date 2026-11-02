import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  X,
  FileSpreadsheet,
  FileCode,
  Tag,
  Calendar,
  Sparkles
} from 'lucide-react';
import { PolicyDocumentItem } from '../../types';
import { formatDocumentSize, saveDocumentBlob } from '../../utils/documentStorage';
import { formatEthiopianDateTime } from '../../utils/ethiopianCalendar';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newDoc: PolicyDocumentItem) => void;
}

const CATEGORY_PRESETS = [
  'ህጋዊ አዋጅ',
  'የክልሉ መመሪያ',
  'የጤና ዘርፍ መመሪያ',
  'የህዝብ ቅጽ',
  'ወርሃዊ ሪፖርት',
  'የዳሰሳ ጥናት',
  'የአሰራር ደንብ'
];

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('የክልሉ መመሪያ');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2018 ዓ.ም');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProcessFile = (file: File) => {
    setErrorMsg(null);
    setSelectedFile(file);

    // Auto-fill title from clean filename if blank or matching previous file
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    if (!title || title.trim() === '') {
      setTitle(cleanName);
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUrl(reader.result as string);
    };
    reader.onerror = () => {
      setErrorMsg('ፋይሉን ማንበብ አልተቻለም። እባክዎ እንደገና ይሞክሩ።');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !fileDataUrl) {
      setErrorMsg('እባክዎ መጀመሪያ ከኮምፒውተርዎ ፋይል ይምረጡ።');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('እባክዎ የሰነዱን ርዕስ ያስገቡ።');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const extMatch = selectedFile.name.match(/\.[^/.]+$/);
      const ext = extMatch ? extMatch[0] : '';
      const formattedSize = formatDocumentSize(selectedFile.size, ext);
      const docId = `doc-upload-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Save full binary in IndexedDB
      await saveDocumentBlob(docId, fileDataUrl, selectedFile.name);

      // Keep small files (< 600KB) inline in JSON, otherwise rely on IndexedDB
      const inlineData = selectedFile.size < 600 * 1024 ? fileDataUrl : undefined;

      const newDoc: PolicyDocumentItem = {
        id: docId,
        title: title.trim(),
        category: category.trim() || 'የክልሉ መመሪያ',
        fileSize: formattedSize,
        description: description.trim() || `ይህ ሰነድ በበላይ አስተዳዳሪ ከኮምፒውተር የተጫነ ይፋዊ ${category} ነው።`,
        date: date.trim() || '2018 ዓ.ም',
        fileName: selectedFile.name,
        fileType: selectedFile.type || 'application/octet-stream',
        fileData: inlineData,
        uploadedBy: 'የበላይ አስተዳዳሪ (Super Admin)',
        uploadedAt: formatEthiopianDateTime(new Date()),
        isCustomUploaded: true
      };

      onUploadSuccess(newDoc);
      onClose();
    } catch (err: any) {
      console.error('Failed to upload document:', err);
      setErrorMsg('ሰነዱን በመጫን ሂደት ላይ ስህተት ተከስቷል። እባክዎ እንደገና ይሞክሩ።');
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.pdf')) {
      return <FileText className="h-6 w-6 text-rose-600" />;
    }
    if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) {
      return <FileSpreadsheet className="h-6 w-6 text-emerald-600" />;
    }
    if (lower.endsWith('.doc') || lower.endsWith('.docx')) {
      return <FileText className="h-6 w-6 text-blue-600" />;
    }
    return <FileCode className="h-6 w-6 text-amber-600" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-amber-50 via-yellow-50 to-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/20 font-black">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">ሰነድ ከኮምፒውተር ወደ ድረ-ገጹ ጫን</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-200 text-amber-900 border border-amber-300">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-600">
                ከሎካል ስቶሬጅ ፒዲኤፍ፣ ዎርድ፣ ኤክሴል ወይም ሌሎች ሰነዶችን በመጫን በድረ-ገጹ ላይ ያትሙ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs font-semibold">{errorMsg}</div>
            </div>
          )}

          {/* Local File Dropzone */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              ፋይሉን ከኮምፒውተርዎ ይምረጡ (Select Document File from Local Storage) *
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-amber-500 bg-amber-50/80 scale-[0.99]'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50/70'
                  : 'border-slate-300 bg-slate-50/70 hover:bg-slate-100 hover:border-amber-400'
              }`}
            >
              {selectedFile ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                      {getFileIcon(selectedFile.name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                          {selectedFile.name}
                        </span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        መጠን፡ {formatDocumentSize(selectedFile.size, selectedFile.name.split('.').pop() || '')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-amber-400 text-slate-700 text-xs font-bold transition-all shadow-xs"
                    >
                      ፋይል ቀይር
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-4">
                  <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center shadow-xs">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div className="font-bold text-slate-800 text-xs sm:text-sm">
                    ፋይል እዚህ ይጎትቱ ወይም ለመምረጥ <span className="text-amber-700 underline">እዚህ ጠቅ ያድርጉ</span>
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-sm">
                    PDF፣ Word (.docx)፣ Excel (.xlsx)፣ PowerPoint (.pptx)፣ Text (.txt) እስከ 50MB ድረስ ይደግፋል
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              የሰነዱ ይፋዊ ርዕስ (Document Title) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ለምሳሌ፡ የማዕከላዊ ኢትዮጵያ ክልል የወሳኝ ኩነቶች ምዝገባ አፈጻጸም መመሪያ ቁጥር 04/2018"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs font-medium shadow-xs"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                የሰነዱ ምድብ (Category) *
              </label>
              <span className="text-[11px] text-slate-500">ፈጣን ምድብ ይምረጡ፡</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_PRESETS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-amber-500 text-slate-950 shadow-xs border border-amber-600'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative">
              <Tag className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="ብጁ ምድብ ይጻፉ..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:border-amber-500 shadow-xs"
              />
            </div>
          </div>

          {/* Publication Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              የወጣበት ዓ.ም / ቀን (Publication Year or Date) *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="ለምሳሌ፡ 2018 ዓ.ም ወይም ሐምሌ 2018 ዓ.ም"
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:border-amber-500 shadow-xs"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              የሰነዱ አጭር ማጠቃለያና መግለጫ (Summary / Scope)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ይህ ሰነድ ምን እንደሚመለከት፣ የትኞቹን ዞኖችና ወረዳዎች እንደሚሸፍን ወይም የዜጎችን ግዴታ የሚያብራራ አጭር ማጠቃለያ..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 leading-relaxed shadow-xs"
            />
          </div>

          {/* Notice info */}
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 flex items-start gap-2.5 text-[11px] text-amber-900">
            <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>ለድረ-ገጽ ጎብኚዎች እና ለዞኖች ወዲያውኑ ይታያል፡</strong> ሰነዱ እንደተጫነ በይፋዊው የድረ-ገጽ “ሰነዶችና አዋጆች (Resources)” ገጽ ላይ ለዜጎች፣ ለወረዳዎችና ለ10ሩም ዞን ኦፊሰሮች ወዲያውኑ ይሰራጫል፤ በቀጥታም ማውረድ ይችላሉ።
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all cursor-pointer"
            >
              ተመለስ
            </button>
            <button
              type="submit"
              disabled={isProcessing || !selectedFile}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-md cursor-pointer ${
                isProcessing || !selectedFile
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-amber-500/25'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>በመጫን ላይ...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  <span>ሰነዱን ወደ ድረ-ገጹ ጫን (Upload to Website)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
