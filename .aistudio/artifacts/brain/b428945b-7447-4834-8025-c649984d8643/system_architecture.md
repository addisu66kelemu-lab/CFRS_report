# Central Ethiopia Regional State Civil & Family Registration Portal
## System Architecture & Technical Specifications

**Applet ID**: `b428945b-7447-4834-8025-c649984d8643`  
**Organization**: Central Ethiopia Regional State Civil & Family Registration Agency (የማዕከላዊ ኢትዮጵያ ክልል ሲቪልና ቤተሰብ ምዝገባ ኤጀንሲ)  
**Fiscal Period**: 2019 ዓ.ም (Ethiopian Fiscal Calendar)

---

### 1. High-Level Architecture Overview

The system is architected as an offline-first, client-rendered Single Page Application (SPA) designed to operate reliably in regional administrative offices and woreda centers across Central Ethiopia.

```
+------------------------------------------------------------------------------------+
|                                CLIENT APPLICATION LAYER                            |
|                                                                                    |
|  +-------------------------+  +--------------------------+  +--------------------+ |
|  |     Citizen Portal      |  |  Zone Reporting Office  |  | Regional Admin /   | |
|  | (Guidance, Fees, Check) |  |   (10 Regional Zones)    |  | Super Admin Portal | |
|  +-------------------------+  +--------------------------+  +--------------------+ |
|               |                             |                          |           |
|               +----------------------+------+--------------------------+           |
|                                      |                                             |
|                                      v                                             |
|                     +----------------------------------+                           |
|                     |       Application Core (App.tsx) |                           |
|                     | - Routing & Tab Navigation       |                           |
|                     | - Role-Based Access Control      |                           |
|                     | - Global Audit Trail Engine      |                           |
|                     | - Dynamic CMS Content State      |                           |
|                     | - Font Scaling & Theme Engine    |                           |
|                     +----------------------------------+                           |
+--------------------------------------|---------------------------------------------+
                                       |
    +----------------------------------+-----------------------------------+
    |                                  |                                   |
    v                                  v                                   v
+------------------------+   +------------------------+   +------------------------+
|  Local Engine Services |   | Document Storage Core  |   | Reporting & Analytics  |
| - Ethiopian Calendar   |   | - Browser IndexedDB    |   | - Recharts Line/Bars   |
|   (13 Months, Leap)    |   |   (Large Multi-MB Files|   | - jsPDF Official Docs  |
| - Statutory Rule Calc  |   | - localStorage Sync    |   | - PPTX Presentation    |
|   (90d, 30d, 60d limits|   |   (Metadata & State)   |   | - UTF-8 CSV Generator  |
+------------------------+   +------------------------+   +------------------------+
```

---

### 2. Component Hierarchy & Navigation Map

1. **`App.tsx`** - Root Application Controller
   - **`Navbar.tsx`**
     - Primary Navigation Tabs: `Home`, `About`, `Services`, `Reports`, `Resources`, `Contact`
     - Role-Protected Direct Links: `የወሩ ሪፖርት መላኪያ (Zone)`, `የአስተዳደርና CMS መቆጣጠሪያ (Admin)`
     - Dynamic Tools: Live Ethiopian Date Indicator, Font Size Switcher (`መካከለኛ / ትልቅ`), Background Color Theme Selector (`ኤመራልድ / ሰንፔር / ወርቃማ / ሲቪክ`), High Contrast Toggle
   - **`VitalEventsBackground.tsx`**
     - Ambient Lighting Mesh with 4 dynamic colorways
     - Authentic Ethiopian Civil Security Guilloche Watermark (concentric rings, 8-point stars, micro-grid)
   - **Main View Modules (`src/components/views/`)**:
     - `HomeView.tsx` - Hero banner, statutory eligibility checker, aggregate statistics, 10-zone quick cards
     - `AboutView.tsx` - Agency proclamation mandate, vision, mission, leadership structure, regional map
     - `ServicesView.tsx` - Statutory rules for 5 vital events (Birth, Death, Marriage, Divorce, Adoption), required documents, fee schedules
     - `ReportsView.tsx` - Recharts monthly registration trend line chart, seasonal analysis (Tsedey, Bega, Belg, Kiremt), annual comparisons, multi-format export (PDF, PPTX, CSV)
     - `ResourcesView.tsx` - Searchable legal proclamations, directives, citizen forms, with Super Admin local upload button and modal
     - `ContactView.tsx` - Direct directory of the 10 zonal offices, hotline, interactive feedback ticketing
     - `ZoneReportingView.tsx` - Role-restricted monthly submission interface for 10 regional zones with automatic statutory breakdown calculations
     - `AdminPortalView.tsx` - Comprehensive dashboard with 10 management tabs:
       - 📈 **የምዝገባ ስታቲስቲክስና ግራፎች (Charts)**
       - 📁 **የሰነዶች መጫኛ (Document Upload Center)**
       - 👑 **የሞጁሎች ይዘት (CMS Content Editor)**
       - 📥 **የዞኖች ወርሃዊ ሪፖርት መቀበያ (Submissions Inbox & Dossiers)**
       - 💬 **የዞኖች የመልእክት ጥያቄዎች (Requests & Reply)**
       - 📅 **የኢትዮጵያ ካላንደር መለወጫ (Calendar Converter)**
       - 🔑 **የ10ሩ ዞኖች መለያዎች (Zone Credentials)**
       - ✉️ **ለዞኖች ማሳሰቢያ መላኪያ (Zone Notifications & Digest)**
       - 💾 **ምስጠራዊ የውሂብ ቅጂ (JSON Backup & Restore)**
       - 🛡️ **የደህንነት ኦዲት መዝገብ (Security Audit Logs)**

---

### 3. Role-Based Access Control (RBAC) Matrix

| Feature / Capability | Public Citizen | Zone Coordinator | Regional Admin | Super Admin |
| :--- | :---: | :---: | :---: | :---: |
| Browse Proclamations & Services | Yes | Yes | Yes | Yes |
| Run Date Conversion & Fee Calculator | Yes | Yes | Yes | Yes |
| Submit Citizen Feedback & Get Ticket | Yes | Yes | Yes | Yes |
| Download Public Documents (PDF) | Yes | Yes | Yes | Yes |
| Submit Monthly Zonal Vital Reports | No | **Yes (Own Zone Only)** | No | No |
| View Past Submissions & Local Trends | No | **Yes (Own Zone Only)** | **Yes (All 10 Zones)** | **Yes (All 10 Zones)** |
| View Aggregate Regional 10-Zone Comparison | **No (Blocked)** | **No (Blocked)** | **Yes** | **Yes** |
| Print Official Zonal Monthly Dossier & Seal | No | **Yes (Own Zone Only)** | **Yes (Any Zone)** | **Yes (Any Zone)** |
| Send Official Query / Request to Region | No | **Yes** | No | No |
| Approve / Reject Zonal Reports | No | No | **Yes** | **Yes** |
| Send Broadcast Notifications to Zones | No | No | **Yes** | **Yes** |
| Export Analytical Reports (PDF, PPTX, CSV) | No | **Yes (Own Zone Only)** | **Yes (All 10 Zones)** | **Yes (All 10 Zones)** |
| Manage Zone User Accounts & Credentials | No | No | **Yes** | **Yes** |
| Upload Documents from Local Storage | No | No | No | **Yes** |
| Edit Website Content (CMS Editor) | No | No | No | **Yes** |
| Reset Content to Default / Restore | No | No | No | **Yes** |
| Access Full Security Audit Trail | No | No | **Yes** | **Yes** |

---

### 4. Storage Architecture & Offline Persistence Strategy

1. **LocalStorage Partitioning**:
   - `central_ethiopia_zone_submissions_v2`: Serialized zone submissions array with deduplication safety guards.
   - `central_ethiopia_vital_records`: Granular citizen registration registry.
   - `central_ethiopia_cms_content_v1`: Real-time mutable website copy managed by Super Admin.
   - `central_ethiopia_audit_logs`: Timestamped event security trail.
   - `central_ethiopia_font_size`: User typography scale preference (`medium` or `large`).
   - `central_ethiopia_bg_theme`: User background theme preference (`emerald`, `sapphire`, `golden`, `slate`).

2. **IndexedDB Document Storage (`src/utils/documentStorage.ts`)**:
   - Database: `CentralEthiopiaDocumentsDB` (Version 1)
   - Store: `uploaded_documents` (Key: `id`)
   - Schema:
     - `id`: Unique document ID
     - `title`: Document name
     - `fileName`: Original file name
     - `fileType`: MIME type (e.g. `application/pdf`)
     - `fileSize`: Formatted string (e.g. `2.4 MB`)
     - `blob`: Binary file blob
     - `uploadedAt`: Timestamp
   - Enables storage of multi-megabyte PDFs and forms without triggering browser `QuotaExceededError`.

---

### 5. Dual Calendar Calculation Engine & Statutory Registration Windows

The system features an algorithmic converter (`src/utils/ethiopianCalendar.ts`) between the Gregorian and Ethiopian calendars:
- Handles 13 Ethiopian months: *መስከረም, ጥቅምት, ኅዳር, ታኅሣሥ, ጥር, የካቲት, መጋቢት, ሚያዝያ, ግንቦት, ሰኔ, ሐምሌ, ነሐሴ, ጳጉሜን*.
- Accurate 7–8 year offset computation and Ethiopian leap year adjustments (ጳጉሜን 5 vs. 6 days).
- **Statutory 3-Tier Windows for All 5 Vital Events (የ5ቱ ኩነቶች የጊዜ ገደብና የክፍያ መመሪያ)**:
  - **ልደት (Birth)**:
    - ወቅታዊ ምዝገባ: በተወለደ በ90 ቀናት ውስጥ (0 ETB - ነፃ)
    - የዘገየ ምዝገባ: በተወለደ ከ90 ቀን እስከ 1 ዓመት ባለው ጊዜ (500 ETB ቅጣት)
    - ነባር ምዝገባ: በተወለደ ከ1 ዓመት በኋላ
  - **ሞት (Death)**:
    - ወቅታዊ ምዝገባ: ከሞተ እስከ 50 ቀናት ባለው ጊዜ (0 ETB - ነፃ)
    - የዘገየ ምዝገባ: ከ50 ቀን እስከ 1 ዓመት ባለው ጊዜ (500 ETB ቅጣት)
    - ነባር ምዝገባ: ከ1 ዓመት በኋላ
  - **ጋብቻ (Marriage)**:
    - ወቅታዊ ምዝገባ: በተጋቡ በ30 ቀናት ውስጥ (0 ETB - ነፃ)
    - የዘገየ ምዝገባ: ከ31 ቀናት እስከ 1 ዓመት ባለው ጊዜ (500 ETB ቅጣት)
    - ነባር ምዝገባ: ከ1 ዓመት በኋላ
  - **ፍቺ (Divorce)**:
    - ወቅታዊ ምዝገባ: ፍቺው በተፈጸመ በ30 ቀናት ውስጥ (0 ETB - ነፃ)
    - የዘገየ ምዝገባ: ከ31 ቀናት እስከ 1 ዓመት ባለው ጊዜ (500 ETB ቅጣት)
    - ነባር ምዝገባ: ከ1 ዓመት በኋላ
  - **ጉዲፈቻ (Adoption)**:
    - ወቅታዊ ምዝገባ: በ30 ቀናት ውስጥ (0 ETB - ነፃ)
    - የዘገየ ምዝገባ: ከ31 ቀናት እስከ 1 ዓመት ባለው ጊዜ (500 ETB ቅጣት)
    - ነባር ምዝገባ: ከ1 ዓመት በኋላ

---

### 6. Production Security Hardening & Zero-Exposure Architecture

Prior to production launch, comprehensive security hardening was executed across the codebase:
1. **Zero Sample Data Exposure**:
   - Synthetic mock registries (previously containing hundreds of auto-generated records and fake submissions) have been replaced with pristine empty schemas.
   - Automatic one-time client purge mechanism (`central_ethiopia_sample_data_cleared_v1`) wipes legacy mock caches from visitors' browser `localStorage`.
   - Analytical reporting algorithms derive metrics purely from verified submissions rather than fabricated synthetic multipliers.
2. **Elimination of Unauthenticated Elevation Backdoors**:
   - Removed direct `onElevateToSuperAdmin` elevation bypass from the navigation layer. Role elevation strictly requires valid cryptographic authentication through the authenticated modal.
3. **Password Masking & Privacy by Default**:
   - All zonal and administrative passwords in `AdminPortalView` and `ModuleContentEditorModal` are hidden behind bullet masks (`••••••••••••`) by default.
   - Ephemeral eye-toggle actions require explicit user intent to view.
   - Plaintext credentials and sample credential helper trays have been eradicated from citizen-facing login modals.
4. **Brute Force Defense & Rate Limiting**:
   - `LoginModal` incorporates a client-side velocity throttle restricting rapid consecutive failed attempts to 5 before triggering a temporary 30-second lockout cooldown.
5. **Secure Credential Lifecycle (`src/utils/authCredentials.ts`)**:
   - Dedicated authentication manager supporting independent password rotation for each of the 10 zones and administrative tiers with real-time audit logging.

