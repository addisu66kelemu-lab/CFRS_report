import { UserRole, ZoneAccount } from '../types';
import { CENTRAL_ETHIOPIA_ZONES } from '../data/mockDatabase';

const CREDENTIALS_STORAGE_KEY = 'central_ethiopia_credentials_config_v1';

export interface CredentialsConfig {
  superAdmin: {
    username: string;
    passwordHash: string; // Stored password
  };
  regionalAdmin: {
    username: string;
    passwordHash: string;
  };
  zones: Record<string, { username: string; password: string }>;
}

const DEFAULT_CREDENTIALS: CredentialsConfig = {
  superAdmin: {
    username: 'super_admin',
    passwordHash: 'superadmin@2026',
  },
  regionalAdmin: {
    username: 'central_admin',
    passwordHash: 'admin@2026',
  },
  zones: {
    hadiya: { username: 'hadiya_zone', password: 'hadiya@2026' },
    gurage: { username: 'gurage_zone', password: 'gurage@2026' },
    east_gurage: { username: 'east_gurage', password: 'egurage@2026' },
    silte: { username: 'silte_zone', password: 'silte@2026' },
    kembata: { username: 'kembata_zone', password: 'kembata@2026' },
    halaba: { username: 'halaba_zone', password: 'halaba@2026' },
    yem: { username: 'yem_zone', password: 'yem@2026' },
    mareko: { username: 'mareko_zone', password: 'mareko@2026' },
    tembaro: { username: 'tembaro_zone', password: 'tembaro@2026' },
    kebena: { username: 'kebena_zone', password: 'kebena@2026' },
  },
};

export function loadCredentials(): CredentialsConfig {
  try {
    const raw = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.superAdmin && parsed.regionalAdmin && parsed.zones) {
        return {
          superAdmin: { ...DEFAULT_CREDENTIALS.superAdmin, ...parsed.superAdmin },
          regionalAdmin: { ...DEFAULT_CREDENTIALS.regionalAdmin, ...parsed.regionalAdmin },
          zones: { ...DEFAULT_CREDENTIALS.zones, ...parsed.zones },
        };
      }
    }
  } catch {}
  return DEFAULT_CREDENTIALS;
}

export function saveCredentials(config: CredentialsConfig): void {
  try {
    localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(config));
  } catch {}
}

export interface AuthResult {
  success: boolean;
  role?: UserRole;
  zone?: ZoneAccount;
  error?: string;
}

export function verifyCredentials(usernameInput: string, passwordInput: string): AuthResult {
  const u = usernameInput.trim().toLowerCase();
  const p = passwordInput.trim();

  if (!u || !p) {
    return { success: false, error: 'እባክዎ የተጠቃሚ ስም እና የይለፍ ቃል ያስገቡ።' };
  }

  const creds = loadCredentials();

  // 1. Check Super Admin
  if (u === creds.superAdmin.username.toLowerCase() && p === creds.superAdmin.passwordHash) {
    return { success: true, role: 'super_admin' };
  }

  // 2. Check Regional Admin
  if (u === creds.regionalAdmin.username.toLowerCase() && p === creds.regionalAdmin.passwordHash) {
    return { success: true, role: 'regional_admin' };
  }

  // 3. Check Zone Accounts
  for (const zone of CENTRAL_ETHIOPIA_ZONES) {
    const zoneCred = creds.zones[zone.id];
    const expectedUsername = (zoneCred ? zoneCred.username : zone.username).toLowerCase();
    const expectedPassword = zoneCred ? zoneCred.password : zone.password;

    if (u === expectedUsername && p === expectedPassword) {
      return { success: true, role: 'zone_officer', zone };
    }
  }

  return { success: false, error: 'የተሳሳተ የተጠቃሚ ስም ወይም የይለፍ ቃል አስገብተዋል። እባክዎ እንደገና ይሞክሩ።' };
}

export function updateZonePassword(zoneId: string, newPassword: string): boolean {
  if (!newPassword || newPassword.trim().length < 6) return false;
  const creds = loadCredentials();
  if (!creds.zones[zoneId]) {
    const found = CENTRAL_ETHIOPIA_ZONES.find(z => z.id === zoneId);
    creds.zones[zoneId] = { username: found ? found.username : `${zoneId}_zone`, password: newPassword.trim() };
  } else {
    creds.zones[zoneId].password = newPassword.trim();
  }
  saveCredentials(creds);
  return true;
}

export function updateAdminPassword(role: 'regional_admin' | 'super_admin', newPassword: string): boolean {
  if (!newPassword || newPassword.trim().length < 6) return false;
  const creds = loadCredentials();
  if (role === 'super_admin') {
    creds.superAdmin.passwordHash = newPassword.trim();
  } else {
    creds.regionalAdmin.passwordHash = newPassword.trim();
  }
  saveCredentials(creds);
  return true;
}

export function getZonePassword(zoneId: string): string {
  const creds = loadCredentials();
  if (creds.zones[zoneId]) {
    return creds.zones[zoneId].password;
  }
  const found = CENTRAL_ETHIOPIA_ZONES.find(z => z.id === zoneId);
  return found?.password || '••••••••';
}
