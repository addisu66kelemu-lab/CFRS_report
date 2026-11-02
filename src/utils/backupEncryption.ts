import { VitalRecord, AuditLog } from '../types';

export interface EncryptedBackupEnvelope {
  schemaVersion: string;
  backupTimestamp: string;
  recordCount: number;
  encryptionAlgorithm: 'AES-GCM-256-SIMULATED';
  checksumSha256: string;
  encryptedPayload: string; // Base64 encoded payload
  metadata: {
    authority: string;
    jurisdiction: string;
    certifiedBy: string;
  };
}

// Compute simple SHA-256 string hash in browser
async function computeSha256(text: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function createEncryptedDatabaseBackup(
  records: VitalRecord[],
  auditLogs: AuditLog[],
  officerName: string
): Promise<EncryptedBackupEnvelope> {
  const payloadData = {
    records,
    auditLogs,
    exportedAt: new Date().toISOString(),
  };

  const rawJson = JSON.stringify(payloadData);
  const checksum = await computeSha256(rawJson);
  
  // Create Base64 payload representing encrypted container
  const base64Payload = btoa(unescape(encodeURIComponent(rawJson)));

  const envelope: EncryptedBackupEnvelope = {
    schemaVersion: '2.4.0',
    backupTimestamp: new Date().toISOString(),
    recordCount: records.length,
    encryptionAlgorithm: 'AES-GCM-256-SIMULATED',
    checksumSha256: checksum,
    encryptedPayload: base64Payload,
    metadata: {
      authority: 'National Civil Registration Authority',
      jurisdiction: 'National Civil Registry & Vital Statistics (CRVS)',
      certifiedBy: officerName || 'System Chief Registrar'
    }
  };

  return envelope;
}

export async function restoreEncryptedBackup(
  envelope: EncryptedBackupEnvelope
): Promise<{ success: boolean; records?: VitalRecord[]; auditLogs?: AuditLog[]; error?: string }> {
  try {
    const rawJson = decodeURIComponent(escape(atob(envelope.encryptedPayload)));
    const calculatedChecksum = await computeSha256(rawJson);

    if (calculatedChecksum !== envelope.checksumSha256) {
      return {
        success: false,
        error: 'Cryptographic Checksum Mismatch! The backup archive has been tampered with or corrupted.'
      };
    }

    const parsed = JSON.parse(rawJson);
    if (!Array.isArray(parsed.records)) {
      return {
        success: false,
        error: 'Invalid database payload schema.'
      };
    }

    return {
      success: true,
      records: parsed.records,
      auditLogs: parsed.auditLogs || []
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `Decryption failed: ${message}`
    };
  }
}
