/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { VitalRecord, UserRole, AuditLog, CitizenFeedback, ZoneMonthlySubmission, ZoneAccount, SiteModulesContent, ZoneMessageRequest, ZoneMessageReply, PolicyDocumentItem } from './types';
import { 
  generateInitialZoneSubmissions, 
  generateInitialVitalRecords, 
  INITIAL_AUDIT_LOGS_AM, 
  INITIAL_CITIZEN_FEEDBACK_AM,
  INITIAL_ZONE_MESSAGES,
  CENTRAL_ETHIOPIA_ZONES
} from './data/mockDatabase';
import { loadSiteContent, saveSiteContent, resetSiteContentToDefault } from './data/defaultSiteContent';
import { formatEthiopianDateTime, formatToEthiopian } from './utils/ethiopianCalendar';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LoginModal } from './components/LoginModal';
import { ModuleContentEditorModal } from './components/admin/ModuleContentEditorModal';
import { VitalEventsBackground, BgTheme } from './components/VitalEventsBackground';
import { HomeView } from './components/views/HomeView';
import { AboutView } from './components/views/AboutView';
import { ServicesView } from './components/views/ServicesView';
import { ReportsView } from './components/views/ReportsView';
import { ResourcesView } from './components/views/ResourcesView';
import { ContactView } from './components/views/ContactView';
import { ZoneReportingView } from './components/views/ZoneReportingView';
import { AdminPortalView } from './components/views/AdminPortalView';

// One-time purge of legacy sample/mock data for clean production launch
const PURGE_KEY = 'central_ethiopia_sample_data_cleared_v1';
if (typeof window !== 'undefined') {
  try {
    if (!localStorage.getItem(PURGE_KEY)) {
      localStorage.removeItem('central_ethiopia_zone_submissions_v2');
      localStorage.removeItem('central_ethiopia_vital_records');
      localStorage.removeItem('central_ethiopia_feedbacks');
      localStorage.removeItem('central_ethiopia_zone_messages');
      localStorage.setItem(PURGE_KEY, 'true');
    }
  } catch {}
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [userRole, setUserRole] = useState<UserRole>('citizen');
  const [activeZoneAccount, setActiveZoneAccount] = useState<ZoneAccount | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [bgTheme, setBgTheme] = useState<BgTheme>(() => {
    try {
      const saved = localStorage.getItem('central_ethiopia_bg_theme');
      if (saved === 'emerald' || saved === 'sapphire' || saved === 'golden' || saved === 'slate') {
        return saved;
      }
    } catch {}
    return 'emerald';
  });

  const handleSelectBgTheme = (theme: BgTheme) => {
    setBgTheme(theme);
    try {
      localStorage.setItem('central_ethiopia_bg_theme', theme);
    } catch {}
  };

  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(() => {
    try {
      const saved = localStorage.getItem('central_ethiopia_font_size');
      if (saved === 'small' || saved === 'large' || saved === 'medium') return saved;
    } catch {}
    return 'medium';
  });

  const handleToggleFontSize = () => {
    setFontSize(prev => {
      const next: 'small' | 'medium' | 'large' = 
        prev === 'small' ? 'medium' :
        prev === 'medium' ? 'large' : 'small';
      try {
        localStorage.setItem('central_ethiopia_font_size', next);
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    document.documentElement.classList.add(`font-size-${fontSize}`);
  }, [fontSize]);

  // Super Admin Site Modules Content (CMS)
  const [siteContent, setSiteContent] = useState<SiteModulesContent>(() => loadSiteContent());
  const [isContentEditorOpen, setIsContentEditorOpen] = useState<boolean>(false);
  const [editorInitialModule, setEditorInitialModule] = useState<keyof SiteModulesContent>('home');

  // Persistent Zone Monthly Submissions (Sent from zones to regional admin)
  const [submissions, setSubmissions] = useState<ZoneMonthlySubmission[]>(() => {
    try {
      const saved = localStorage.getItem('central_ethiopia_zone_submissions_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Deduplicate items by ID to prevent duplicate React keys
          const seen = new Set<string>();
          const deduped: ZoneMonthlySubmission[] = [];
          for (const item of parsed) {
            if (item && item.id && !seen.has(item.id)) {
              seen.add(item.id);
              deduped.push({
                ...item,
                birth: {
                  current: Number(item.birth?.current) || 0,
                  late: Number(item.birth?.late) || 0,
                  backlog: Number(item.birth?.backlog) || 0,
                },
                death: {
                  current: Number(item.death?.current) || 0,
                  late: Number(item.death?.late) || 0,
                  backlog: Number(item.death?.backlog) || 0,
                },
                marriage: {
                  current: Number(item.marriage?.current) || 0,
                  late: Number(item.marriage?.late) || 0,
                  backlog: Number(item.marriage?.backlog) || 0,
                },
                divorce: {
                  current: Number(item.divorce?.current) || 0,
                  late: Number(item.divorce?.late) || 0,
                  backlog: Number(item.divorce?.backlog) || 0,
                },
                adoption: {
                  current: Number(item.adoption?.current) || 0,
                  late: Number(item.adoption?.late) || 0,
                  backlog: Number(item.adoption?.backlog) || 0,
                },
              });
            }
          }
          return deduped;
        }
      }
    } catch {}
    return generateInitialZoneSubmissions();
  });

  // Persistent Detailed Vital Records
  const [records, setRecords] = useState<VitalRecord[]>(() => {
    try {
      const saved = localStorage.getItem('central_ethiopia_vital_records');
      if (saved) return JSON.parse(saved);
    } catch {}
    return generateInitialVitalRecords();
  });

  // Persistent Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('central_ethiopia_audit_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_AUDIT_LOGS_AM;
  });

  // Persistent Citizen Feedbacks
  const [feedbacks, setFeedbacks] = useState<CitizenFeedback[]>(() => {
    try {
      const saved = localStorage.getItem('central_ethiopia_feedbacks');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CITIZEN_FEEDBACK_AM;
  });

  // Persistent Zone Message Requests (Requests from zones to regional admin, and admin replies)
  const [zoneMessages, setZoneMessages] = useState<ZoneMessageRequest[]>(() => {
    try {
      const saved = localStorage.getItem('central_ethiopia_zone_messages');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ZONE_MESSAGES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('central_ethiopia_zone_submissions_v2', JSON.stringify(submissions));
    } catch {}
  }, [submissions]);

  useEffect(() => {
    try {
      localStorage.setItem('central_ethiopia_vital_records', JSON.stringify(records));
    } catch {}
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem('central_ethiopia_audit_logs', JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('central_ethiopia_feedbacks', JSON.stringify(feedbacks));
    } catch {}
  }, [feedbacks]);

  useEffect(() => {
    try {
      localStorage.setItem('central_ethiopia_zone_messages', JSON.stringify(zoneMessages));
    } catch {}
  }, [zoneMessages]);

  // Add audit log helper
  const handleAddAuditLog = (action: string, details: string) => {
    const actorName = userRole === 'regional_admin' 
      ? 'የክልሉ ማዕከላዊ አስተዳዳሪ' 
      : activeZoneAccount 
      ? `${activeZoneAccount.officerName} (${activeZoneAccount.name})` 
      : 'የህዝብ ተጠቃሚ (ዜጋ)';

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: formatEthiopianDateTime(new Date()),
      actor: actorName,
      role: userRole,
      action,
      details,
      ipAddress: '10.20.1.14',
      status: 'የተሳካ',
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Add or update zone report submission (upsert to prevent duplicate IDs)
  const handleSubmitZoneReport = (newSub: ZoneMonthlySubmission) => {
    setSubmissions(prev => {
      // Filter out any existing submission matching same ID or same zone+year+month
      const filtered = prev.filter(s => s.id !== newSub.id && !(s.zoneId === newSub.zoneId && s.year === newSub.year && s.month === newSub.month));
      return [newSub, ...filtered];
    });
    handleAddAuditLog('ZONE_REPORT_RECEIVED', `${newSub.zoneName} የ${newSub.monthNameAm} ወር ሪፖርት ለክልሉ አስተዳዳሪ አስገባ`);
  };

  // Approve a zone submission by regional admin
  const handleApproveSubmission = (subId: string) => {
    setSubmissions(prev => prev.map(s => s.id === subId ? { ...s, status: 'የፀደቀ' } : s));
  };

  // Citizen feedback submission
  const handleSubmitFeedback = (fb: Omit<CitizenFeedback, 'id' | 'ticketNumber' | 'createdAt' | 'status'>): string => {
    const ticketNumber = `CR-FB-${Math.floor(1000 + Math.random() * 9000)}`;
    const newFeedback: CitizenFeedback = {
      id: `fb-${Date.now()}`,
      ticketNumber,
      citizenName: fb.citizenName,
      phone: fb.phone,
      zone: fb.zone,
      serviceCategory: fb.serviceCategory,
      rating: fb.rating,
      comments: fb.comments,
      createdAt: formatToEthiopian(new Date()),
      status: 'አዲስ',
    };
    setFeedbacks(prev => [newFeedback, ...prev]);
    handleAddAuditLog('FEEDBACK_SUBMITTED', `አዲስ አስተያየት በ${fb.citizenName} (${fb.zone}) ተመዘገበ`);
    return ticketNumber;
  };

  // Admin replies to a zone's message request
  const handleReplyToZoneMessage = (messageId: string, replyText: string, updatedStatus: 'replied' | 'resolved' = 'replied') => {
    const adminName = userRole === 'super_admin' ? 'የበላይ አስተዳዳሪ (Super Admin)' : 'የማዕከላዊ ኢትዮጵያ ክልል ዋና አስተዳዳሪ';
    const newReply: ZoneMessageReply = {
      id: `rep-${Date.now()}`,
      senderRole: userRole === 'super_admin' ? 'super_admin' : 'regional_admin',
      senderName: adminName,
      message: replyText,
      sentAt: formatEthiopianDateTime(new Date()),
    };

    setZoneMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          status: updatedStatus,
          statusAm: updatedStatus === 'resolved' ? 'የተፈታ' : 'ምላሽ የተሰጠው',
          replies: [...msg.replies, newReply]
        };
      }
      return msg;
    }));

    const targetMsg = zoneMessages.find(m => m.id === messageId);
    handleAddAuditLog(
      'ZONE_MESSAGE_REPLIED',
      `አስተዳዳሪው ለ${targetMsg?.zoneName || 'ዞን'} የጥያቄ መልእክት ("${targetMsg?.subject || ''}") ምላሽ ላከ`
    );
  };

  // Zone officer creates a new message request to admin
  const handleCreateZoneMessage = (newMsg: Omit<ZoneMessageRequest, 'id' | 'createdAt' | 'replies' | 'status' | 'statusAm'>) => {
    const created: ZoneMessageRequest = {
      ...newMsg,
      id: `msg-${newMsg.zoneId}-${Date.now()}`,
      createdAt: formatEthiopianDateTime(new Date()),
      status: 'pending',
      statusAm: 'በመጠባበቅ ላይ',
      replies: []
    };
    setZoneMessages(prev => [created, ...prev]);
    handleAddAuditLog(
      'ZONE_MESSAGE_REQUEST_CREATED',
      `${newMsg.zoneName} (${newMsg.officerName}) አዲስ የመልእክት/ድጋፍ ጥያቄ ለክልሉ አስተዳዳሪ ላከ፡ "${newMsg.subject}"`
    );
  };

  // CMS Content Handlers for Super Admin
  const handleOpenContentEditor = (moduleKey?: keyof SiteModulesContent) => {
    if (moduleKey) {
      setEditorInitialModule(moduleKey);
    }
    setIsContentEditorOpen(true);
  };

  const handleSaveSiteContent = (updated: SiteModulesContent, moduleUpdatedName: string) => {
    setSiteContent(updated);
    saveSiteContent(updated);
    handleAddAuditLog('MODULE_CONTENT_UPDATED', `የ${moduleUpdatedName} ይዘት በበላይ አስተዳዳሪ (Super Admin) ተሻሽሎ ተሰራጭቷል`);
  };

  const handleResetSiteContent = () => {
    const defaultContent = resetSiteContentToDefault();
    setSiteContent(defaultContent);
    handleAddAuditLog('MODULE_CONTENT_RESET', 'የሁሉም ሞጁሎች ይዘት በበላይ አስተዳዳሪ ወደ ነባሪ (Default) ተመልሷል');
  };

  // Super Admin document upload handler (upload from local storage)
  const handleUploadDocument = (newDoc: PolicyDocumentItem) => {
    setSiteContent(prev => {
      const existingDocs = prev.resources?.documents || [];
      const updatedDocs = [newDoc, ...existingDocs];
      const updatedContent: SiteModulesContent = {
        ...prev,
        resources: {
          ...prev.resources,
          documents: updatedDocs
        }
      };
      saveSiteContent(updatedContent);
      return updatedContent;
    });

    handleAddAuditLog(
      'DOCUMENT_UPLOADED',
      `አዲስ ሰነድ ከኮምፒውተር ተጫነ፡ "${newDoc.title}" (${newDoc.fileSize}) በበላይ አስተዳዳሪ (Super Admin)`
    );
  };

  // Super Admin document deletion handler
  const handleDeleteDocument = (docId: string) => {
    let deletedTitle = '';
    setSiteContent(prev => {
      const existingDocs = prev.resources?.documents || [];
      const target = existingDocs.find(d => d.id === docId);
      if (target) {
        deletedTitle = target.title;
      }
      const updatedDocs = existingDocs.filter(d => d.id !== docId);
      const updatedContent: SiteModulesContent = {
        ...prev,
        resources: {
          ...prev.resources,
          documents: updatedDocs
        }
      };
      saveSiteContent(updatedContent);
      return updatedContent;
    });

    if (deletedTitle) {
      handleAddAuditLog(
        'DOCUMENT_DELETED',
        `ሰነድ ከድረ-ገጹ ተሰረዘ፡ "${deletedTitle}" በበላይ አስተዳዳሪ (Super Admin)`
      );
    }
  };

  // Handle successful login
  const handleLoginSuccess = (role: UserRole, zoneAccount: ZoneAccount | null) => {
    setUserRole(role);
    setActiveZoneAccount(zoneAccount);

    if (role === 'zone_officer') {
      setCurrentTab('zoneReport');
      handleAddAuditLog('ZONE_LOGIN', `${zoneAccount?.name} (${zoneAccount?.officerName}) በመለያ ገባ`);
    } else if (role === 'regional_admin') {
      setCurrentTab('admin');
      handleAddAuditLog('ADMIN_LOGIN', 'የማዕከላዊ ኢትዮጵያ ክልል ዋና አስተዳዳሪ በመለያ ገባ');
    } else if (role === 'super_admin') {
      setCurrentTab('admin');
      handleAddAuditLog('SUPER_ADMIN_LOGIN', 'የበላይ አስተዳዳሪ (Super Admin) በሙሉ የይዘትና የአስተዳደር ፈቃድ በመለያ ገባ');
    }
  };

  // Handle logout
  const handleLogout = () => {
    handleAddAuditLog('USER_LOGOUT', `${userRole} ከመለያ ወጣ`);
    setUserRole('citizen');
    setActiveZoneAccount(null);
    setCurrentTab('home');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 relative font-size-${fontSize} ${
      highContrast ? 'bg-amber-50 text-slate-950 contrast-125' : 'text-slate-900'
    }`}>
      {/* Smart & Attractive Vital Events Background Component with Ambient Lighting Mesh & Civic Guilloche */}
      <VitalEventsBackground theme={bgTheme} />

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userRole={userRole}
        activeZoneAccount={activeZoneAccount}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
        fontSize={fontSize}
        onToggleFontSize={handleToggleFontSize}
        bgTheme={bgTheme}
        onSelectBgTheme={handleSelectBgTheme}
        onOpenContentEditor={handleOpenContentEditor}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        {currentTab === 'home' && (
          <HomeView
            submissions={submissions}
            records={records}
            onSelectTab={setCurrentTab}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            content={siteContent.home}
            userRole={userRole}
            onOpenContentEditor={handleOpenContentEditor}
          />
        )}

        {currentTab === 'about' && (
          <AboutView 
            content={siteContent.about}
            userRole={userRole}
            onOpenContentEditor={handleOpenContentEditor}
          />
        )}

        {currentTab === 'services' && (
          <ServicesView 
            content={siteContent.services}
            userRole={userRole}
            onOpenContentEditor={handleOpenContentEditor}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsView
            submissions={
              userRole === 'zone_officer' && activeZoneAccount
                ? submissions.filter(s => s.zoneId === activeZoneAccount.id)
                : submissions
            }
            onAddAuditLog={handleAddAuditLog}
            userRole={userRole}
            activeZoneAccount={activeZoneAccount}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onSelectTab={setCurrentTab}
          />
        )}

        {currentTab === 'resources' && (
          <ResourcesView 
            content={siteContent.resources}
            userRole={userRole}
            onOpenContentEditor={handleOpenContentEditor}
            onUploadDocument={handleUploadDocument}
            onDeleteDocument={handleDeleteDocument}
          />
        )}

        {currentTab === 'contact' && (
          <ContactView
            feedbacks={feedbacks}
            onSubmitFeedback={handleSubmitFeedback}
            content={siteContent.contact}
            userRole={userRole}
            onOpenContentEditor={handleOpenContentEditor}
          />
        )}

        {currentTab === 'zoneReport' && activeZoneAccount && userRole === 'zone_officer' && (
          <ZoneReportingView
            activeZone={activeZoneAccount}
            submissions={submissions}
            onSubmitReport={handleSubmitZoneReport}
            onAddAuditLog={handleAddAuditLog}
            zoneMessages={zoneMessages}
            onCreateZoneMessage={handleCreateZoneMessage}
          />
        )}

        {currentTab === 'admin' && (userRole === 'regional_admin' || userRole === 'super_admin') && (
          <AdminPortalView
            submissions={submissions}
            records={records}
            onApproveSubmission={handleApproveSubmission}
            auditLogs={auditLogs}
            onAddAuditLog={handleAddAuditLog}
            userRole={userRole}
            siteContent={siteContent}
            onOpenContentEditor={handleOpenContentEditor}
            onResetContentToDefault={handleResetSiteContent}
            zoneMessages={zoneMessages}
            onReplyToZoneMessage={handleReplyToZoneMessage}
            onUploadDocument={handleUploadDocument}
            onDeleteDocument={handleDeleteDocument}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onSelectTab={setCurrentTab} />

      {/* Login Modal for Zones & Regional Admin */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Super Admin Module Content Editor Modal (CMS) */}
      <ModuleContentEditorModal
        isOpen={isContentEditorOpen}
        onClose={() => setIsContentEditorOpen(false)}
        initialModule={editorInitialModule}
        content={siteContent}
        onSaveContent={handleSaveSiteContent}
        onResetToDefault={handleResetSiteContent}
      />
    </div>
  );
}
