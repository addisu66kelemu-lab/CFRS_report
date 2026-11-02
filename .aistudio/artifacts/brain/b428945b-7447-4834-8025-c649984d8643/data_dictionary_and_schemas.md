# Central Ethiopia Regional State Civil & Family Registration Portal
## Data Dictionary & Technical Schema Specifications

---

### 1. Zone Entity Schema (`ZoneAccount`)

Represents each of the 10 administrative zones and special woredas across Central Ethiopia:

```typescript
export interface ZoneAccount {
  id: string;               // Unique zone slug (e.g. 'east_gurage', 'silte', 'hadiya')
  name: string;             // Official Amharic name (e.g. 'ምሥራቅ ጉራጌ ዞን')
  capital: string;          // Zonal administrative seat (e.g. 'ቡታጅራ', 'ወራቤ')
  username: string;         // Dedicated portal login identifier
  password: string;         // Default access password
  officerName: string;      // Assigned vital events coordinator
  officerPhone: string;     // Official coordination mobile line
  woredasCount: number;     // Total woredas under the zone
  kebelesCount: number;     // Total kebeles under the zone
}
```

#### Administrative Zones Registry
| ID | Zone Name (አማርኛ) | Administrative Capital | Woredas | Kebeles | Coordinator |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `hadiya` | ሀዲያ ዞን | ሆሳዕና | 13 | 329 | አቶ አበበ ኃይሌ |
| `gurage` | ጉራጌ ዞን | ወልቂጤ | 16 | 412 | ወ/ሮ ዘውዲቱ ተስፋዬ |
| `east_gurage` | ምሥራቅ ጉራጌ ዞን | ቡታጅራ | 6 | 148 | አቶ ከድር ሸምሱ |
| `silte` | ስልጤ ዞን | ወራቤ | 10 | 218 | አቶ ጀማል ሁሴን |
| `kembata` | ከምባታ ዞን | ዱራሜ | 8 | 176 | አቶ ዮሐንስ በርሄ |
| `halaba` | ሀላባ ዞን | ሀላባ ቁሊቶ | 4 | 86 | አቶ አብዱረህማን ዑመር |
| `yem` | የም ልዩ ዞን | ሳጃ | 4 | 84 | አቶ ደረጀ ታደሰ |
| `mareko` | ማረቆ ልዩ ወረዳ/ዞን | ኮስሄ | 2 | 46 | ወ/ሮ ረድኤት አሰፋ |
| `tembaro` | ጠምባሮ ልዩ ወረዳ/ዞን | ሙዱላ | 2 | 52 | አቶ ማርቆስ ማቴዎስ |
| `kebena` | ቀበና ልዩ ወረዳ/ዞን | ወልቂጤ ዙሪያ | 2 | 44 | አቶ ሱልጣን አህመድ |

---

### 2. Monthly Zonal Submission Schema (`ZoneMonthlySubmission`)

Represents the aggregated vital statistics transmitted monthly from a zone to the regional bureau:

```typescript
export interface ZoneMonthlySubmission {
  id: string;                      // Composite ID: SUB-{YEAR}-{ZONE}-M{MONTH}
  zoneId: string;                  // Foreign key reference to ZoneAccount.id
  zoneName: string;                // Amharic display name of the zone
  year: number;                    // Ethiopian Fiscal Year (e.g., 2019, 2018)
  month: number;                   // Ethiopian Month index (1 to 12)
  monthNameAm: string;             // Amharic month name (e.g., 'መስከረም')
  submittedBy: string;             // Submitting officer's name and title
  submittedAt: string;             // Formatted Ethiopian date & time stamp
  reportingWoredasCount: number;   // Number of woredas included
  reportingKebelesCount: number;   // Number of kebeles covered
  status: 'የተረጋገጠ' | 'የፀደቀ' | 'በመጠባበቅ ላይ'; // Validation workflow status
  birth: VitalEventCount;          // On-time vs. late birth counts
  death: VitalEventCount;          // On-time vs. late death counts
  marriage: VitalEventCount;       // On-time vs. late marriage counts
  divorce: VitalEventCount;        // On-time vs. late divorce counts
  adoption: VitalEventCount;       // On-time vs. late adoption counts
  notes: string;                   // Qualitative coordinator remarks
}

export interface VitalEventCount {
  current: number;                 // Timely registrations within statutory limit (0 ETB fee)
  late: number;                    // Delayed registrations after statutory limit up to 1 year (500 ETB fee)
  backlog: number;                 // Historical backlog registrations over 1 year (ከ1 ዓመት በኋላ)
}
```

#### Statutory Registration Windows & Penalties
| Vital Event (ኩነት) | ወቅታዊ ምዝገባ (Current Window) | የዘገየ ምዝገባ (Late Window) | ነባር ምዝገባ (Backlog Window) | ክፍያ / ቅጣት |
| :--- | :--- | :--- | :--- | :--- |
| **ልደት (Birth)** | በተወለደ በ90 ቀናት ውስጥ | ከ90 ቀናት እስከ 1 ዓመት | ከ1 ዓመት በኋላ | ወቅታዊ፡ 0 ETB (ነፃ), የዘገየ፡ 500 ETB, ነባር፡ በማስረጃ |
| **ሞት (Death)** | ከሞተ እስከ 50 ቀናት ውስጥ | ከ50 ቀናት እስከ 1 ዓመት | ከ1 ዓመት በኋላ | ወቅታዊ፡ 0 ETB (ነፃ), የዘገየ፡ 500 ETB, ነባር፡ በማስረጃ |
| **ጋብቻ (Marriage)** | በተጋቡ በ30 ቀናት ውስጥ | ከ31 ቀናት እስከ 1 ዓመት | ከ1 ዓመት በኋላ | ወቅታዊ፡ 0 ETB (ነፃ), የዘገየ፡ 500 ETB, ነባር፡ በማስረጃ |
| **ፍቺ (Divorce)** | በፍርድ በ30 ቀናት ውስጥ | ከ31 ቀናት እስከ 1 ዓመት | ከ1 ዓመት በኋላ | ወቅታዊ፡ 0 ETB (ነፃ), የዘገየ፡ 500 ETB, ነባር፡ በማስረጃ |
| **ጉዲፈቻ (Adoption)** | በፍርድ በ30 ቀናት ውስጥ | ከ31 ቀናት እስከ 1 ዓመት | ከ1 ዓመት በኋላ | ወቅታዊ፡ 0 ETB (ነፃ), የዘገየ፡ 500 ETB, ነባር፡ በማስረጃ |

---

### 3. Granular Vital Record Model (`VitalRecord`)

Represents individual vital status certificates stored for verification and tracking:

```typescript
export interface VitalRecord {
  id: string;                      // Serialized certificate record ID (e.g. 'REC-2019-B-001')
  certificateNumber: string;       // Public verification certificate number
  serviceType: 'birth' | 'death' | 'marriage' | 'divorce' | 'adoption';
  registrantFullName: string;      // Full name in Amharic
  gender?: 'ወንድ' | 'ሴት';
  eventDate: string;               // Date event occurred (Ethiopian Calendar)
  registrationDate: string;        // Date record was filed (Ethiopian Calendar)
  zone: string;                    // Administrative zone of registration
  woreda: string;                  // Specific woreda
  kebele: string;                  // Specific kebele
  isLate: boolean;                 // Whether filed after legal statutory threshold
  penaltyFeeETB: number;           // 0 ETB if on-time, 500 ETB if late
  status: 'የተረጋገጠ' | 'በሂደት ላይ';
  verifiedOfficer: string;         // Signing civil registrar officer
}
```

---

### 4. Policy Document Item Schema (`PolicyDocumentItem`)

Enhanced schema supporting both system default legal texts and custom Super Admin uploads:

```typescript
export interface PolicyDocumentItem {
  id: string;                      // Unique document identifier (e.g., 'doc-172945678')
  title: string;                   // Document display title
  category: string;                // Category (ህጋዊ አዋጅ, መመሪያ, ቅጽ, ሪፖርት)
  fileSize: string;                // Formatted file size string (e.g., '2.4 MB')
  description: string;             // Detailed executive summary
  date: string;                    // Release or publication year (e.g., '2019 ዓ.ም')
  fileName?: string;               // Original uploaded file name (e.g., 'directive_v2.pdf')
  fileType?: string;               // MIME type (e.g., 'application/pdf')
  fileData?: string;               // Optional Data URL for small previews
  uploadedBy?: string;             // Name or role of uploading Super Admin
  uploadedAt?: string;             // Timestamp of upload
  isCustomUploaded?: boolean;      // Distinguishes local uploads from factory defaults
}
```

---

### 5. Statutory Limits & Fee Constants (`STATUTORY_LIMITS_AM`)

| Vital Event (የኩነት ዓይነት) | ወቅታዊ ምዝገባ (On-Time Window) | የዘገየ ምዝገባ (Late Window) | ነባር ምዝገባ (Backlog Window) | ክፍያ / ቅጣት (Fee & Penalty) |
| :--- | :--- | :--- | :--- | :---: |
| **ልደት (Birth)** | በተወለደ በ90 ቀናት ውስጥ (≤ 90d) | ከ90 ቀናት እስከ 1 ዓመት | ከ1 ዓመት በኋላ | **ወቅታዊ፡ 0 ETB (ነፃ)**<br>የዘገየ፡ **500 ETB** |
| **ሞት (Death)** | ከሞተ እስከ 50 ቀናት ውስጥ (≤ 50d) | ከ50 ቀናት እስከ 1 ዓመት | ከ1 ዓመት በኋላ | **ወቅታዊ፡ 0 ETB (ነፃ)**<br>የዘገየ፡ **500 ETB** |
| **ጋብቻ (Marriage)** | በተጋቡ በ30 ቀናት ውስጥ (≤ 30d) | ከ31 ቀናት እስከ 1 ዓመት | ከ1 ዓመት በኋላ | **ወቅታዊ፡ 0 ETB (ነፃ)**<br>የዘገየ፡ **500 ETB** |
| **ፍቺ (Divorce)** | በፍርድ በ30 ቀናት ውስጥ (≤ 30d) | ከ31 ቀናት እስከ 1 ዓመት | ከ1 ዓመት በኋላ | **ወቅታዊ፡ 0 ETB (ነፃ)**<br>የዘገየ፡ **500 ETB** |
| **ጉዲፈቻ (Adoption)** | በፍርድ በ30 ቀናት ውስጥ (≤ 30d) | ከ31 ቀናት እስከ 1 ዓመት | ከ1 ዓመት በኋላ | **ወቅታዊ፡ 0 ETB (ነፃ)**<br>የዘገየ፡ **500 ETB** |

---

### 6. Official Zonal Printable Dossier Schema (`ZonalPrintableDossier`)

Used by the browser print subsystem and PDF renderer to produce authenticated government filings:

```typescript
export interface ZonalPrintableDossier {
  id: string;                      // Document Ref: e.g. 'SUB-2019-SILTE-M01'
  zoneId: string;                  // Target zone identifier
  zoneName: string;                // Official zone title (e.g. 'ስልጤ ዞን')
  year: number;                    // Ethiopian fiscal year
  month: number;                   // Ethiopian calendar month
  monthNameAm: string;             // Amharic month name (e.g. 'መስከረም')
  submittedBy: string;             // Authorized coordinator name and title
  submittedAt: string;             // Certified registration date & time
  reportingWoredasCount: number;   // Number of woredas submitting data
  reportingKebelesCount: number;   // Total kebeles covered
  status: 'የተረጋገጠ' | 'የፀደቀ' | 'በመገምገም ላይ';
  birth: VitalEventCount;          // { current: n, late: n, backlog: n }
  death: VitalEventCount;          // { current: n, late: n, backlog: n }
  marriage: VitalEventCount;       // { current: n, late: n, backlog: n }
  divorce: VitalEventCount;        // { current: n, late: n, backlog: n }
  adoption: VitalEventCount;       // { current: n, late: n, backlog: n }
  notes: string;                   // Qualitative field remarks
}
```

#### Official Document Physical Verification Fields
- **Government Emblem**: Central Ethiopia Regional State coat of arms
- **Reference Code**: Standardized filing reference number
- **Late Penalty Revenue Total**: Computed strictly as `(lateBirth + lateDeath + lateMarriage + lateDivorce + lateAdoption) * 500 ETB`
- **Seal & Certification Block**: Dedicated physical stamp box (`የዞኑ ቅርንጫፍ ጽ/ቤት ይፋዊ ክብ ማህተም`) and coordinator verification line (`ያረጋገጠው አስተባባሪ ፊርማ`)

---

### 7. Strict RBAC Data Partitioning & Scoping Rules

To prevent data leakage across administrative boundaries:

```typescript
// Root Application Filter (App.tsx)
const visibleSubmissions = userRole === 'zone_officer' && activeZoneAccount
  ? submissions.filter(s => s.zoneId === activeZoneAccount.id)
  : submissions;

// Reports View Partition (ReportsView.tsx)
// If userRole === 'zone_officer':
// - selectedZone is locked to activeZoneAccount.name
// - Dropdown is disabled with verified badge
// - Tab 2 (Zonal Breakdown) renders only the zone's private historical filings with 'አትም (Print)' action
// - 10-zone comparison matrix is inaccessible
// - PDF / PPTX / CSV exports are locked exclusively to the officer's zone
```
