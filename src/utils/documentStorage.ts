// IndexedDB storage utility for uploaded documents to avoid localStorage quota issues
const DB_NAME = 'CentralEthiopiaDocumentsDB';
const DB_VERSION = 1;
const STORE_NAME = 'uploaded_documents';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

/**
 * Stores document dataUrl in IndexedDB
 */
export async function saveDocumentBlob(id: string, dataUrl: string, fileName?: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({ id, dataUrl, fileName, timestamp: Date.now() });

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB save failed, falling back:', err);
  }
}

/**
 * Retrieves document dataUrl from IndexedDB
 */
export async function getDocumentBlob(id: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => {
        if (req.result && req.result.dataUrl) {
          resolve(req.result.dataUrl);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('IndexedDB read failed:', err);
    return null;
  }
}

/**
 * Deletes document blob from IndexedDB
 */
export async function deleteDocumentBlob(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch (err) {
    console.warn('IndexedDB delete failed:', err);
  }
}

/**
 * Formats byte size into human readable string with type
 */
export function formatDocumentSize(bytes: number, ext: string): string {
  let sizeStr = '';
  if (bytes < 1024) {
    sizeStr = `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    sizeStr = `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    sizeStr = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  const cleanExt = ext.replace('.', '').toUpperCase();
  return `${sizeStr} · ${cleanExt || 'DOC'}`;
}

/**
 * Downloads a document, utilizing actual uploaded binary dataUrl or generating an official text fallback
 */
export async function triggerDocumentDownload(
  title: string,
  category: string,
  date: string,
  description: string,
  fileData?: string,
  fileName?: string,
  docId?: string
): Promise<void> {
  let activeDataUrl = fileData;

  if (!activeDataUrl && docId) {
    activeDataUrl = (await getDocumentBlob(docId)) || undefined;
  }

  if (activeDataUrl) {
    const a = document.createElement('a');
    a.href = activeDataUrl;
    a.download = fileName || `${title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    // Generate official textual record
    const content = [
      '========================================================================',
      'የማዕከላዊ ኢትዮጵያ ብሔራዊ ክልላዊ መንግሥት የወሳኝ ኩነቶች ኤጀንሲ',
      'CENTRAL ETHIOPIA REGIONAL STATE VITAL EVENTS REGISTRATION AGENCY',
      '========================================================================',
      '',
      `ሰነድ ርዕስ (Document Title): ${title}`,
      `ምድብ (Category): ${category}`,
      `የወጣበት ቀን/ዓ.ም (Date): ${date || new Date().toLocaleDateString('am-ET')}`,
      '',
      'መግለጫ (Summary):',
      description || 'ይህ ሰነድ በማዕከላዊ ኢትዮጵያ ክልል የወሳኝ ኩነቶች ህጎችና አሰራሮችን ያካተተ ይፋዊ ሰነድ ነው።',
      '',
      '------------------------------------------------------------------------',
      'ይህ ሰነድ ከማዕከላዊ ኢትዮጵያ ክልል የወሳኝ ኩነቶች ኤጀንሲ ኦፊሴላዊ ድረ-ገጽ የወረደ ነው።',
      `የወረደበት ቀን፡ ${new Date().toLocaleString('am-ET')}`,
      '------------------------------------------------------------------------'
    ].join('\r\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
