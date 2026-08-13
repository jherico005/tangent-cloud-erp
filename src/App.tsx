import React, { useState, useEffect } from 'react';
import { 
  NavigationModule, 
  ServiceRequest, 
  FieldTechnician, 
  AuditLogItem, 
  EFSRRecord, 
  IMSLogItem, 
  POSPrepLogItem, 
  PendingSummaryItem, 
  UserProfile,
  AppUser,
  SRNStatus
} from './types';
import { 
  initialUserProfile, 
  initialFieldTechnicians, 
  initialServiceRequests, 
  initialAuditLogs, 
  initialEFSRRecords, 
  initialIMSLogs, 
  initialPOSPrepLogs, 
  initialPendingSummary,
  initialUsers
} from './data/mockData';

import { LoginView } from './components/auth/LoginView';
import { FieldTechnicianPortal } from './components/portals/FieldTechnicianPortal';
import { DepartmentPortal } from './components/portals/DepartmentPortal';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DispatchingView } from './components/dispatching/DispatchingView';
import { ServiceRequestAuditLogsView } from './components/modules/ServiceRequestAuditLogsView';
import { EFSRViewer } from './components/modules/EFSRViewer';
import { IMSLogsView } from './components/modules/IMSLogsView';
import { POSPrepDailyLogsView } from './components/modules/POSPrepDailyLogsView';
import { PendingSummaryView } from './components/modules/PendingSummaryView';
import { CCIARCOSupportView } from './components/modules/CCIARCOSupportView';
import { EmployeeManagementView } from './components/modules/EmployeeManagementView';

import { DispatchModal } from './components/dispatching/DispatchModal';
import { ReassignModal } from './components/dispatching/ReassignModal';
import { SRNDetailModal } from './components/dispatching/SRNDetailModal';
import { NewSRNModal } from './components/modals/NewSRNModal';
import { CsvImportModal } from './components/modals/CsvImportModal';
import { SmartSdSyncModal } from './components/modals/SmartSdSyncModal';
import { UserProfileModal } from './components/modals/UserProfileModal';
import { RightSideChatPanel } from './components/chat/RightSideChatPanel';
import { ChatFloatingTrigger } from './components/chat/ChatFloatingTrigger';

import { azureApi } from './services/azureApi';
import { chatService } from './services/chatService';
import { supabaseAuthService } from './services/supabaseAuthService';
import { ACCOUNT_CHANNELS_LIST, playTeamsNotificationSound } from './data/accountChannels';
import { CheckCircle2, X, ShieldAlert, WifiOff, RefreshCw, LogOut } from 'lucide-react';
import { TangentLoadingScreen } from './components/common/TangentLoadingScreen';

export default function App() {
  // Azure SQL Connection Status
  const [isAzureConnected, setIsAzureConnected] = useState(false);

  // Logout Confirmation Prompt Modal State
  const [isLogoutPromptOpen, setIsLogoutPromptOpen] = useState(false);

  // Authentication & Session State
  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('tangent_app_users');
    let list: AppUser[] = saved ? JSON.parse(saved) : initialUsers;
    if (!list.some(u => u.username === 'marian_santos')) {
      list = [...initialUsers];
    }
    return list;
  });

  // Load live Users & eFSR Records from Supabase & Azure API on mount
  useEffect(() => {
    let isMounted = true;

    const initData = async () => {
      try {
        // Fetch users from Supabase Realtime Database
        const spUsers = await supabaseAuthService.getUsers();
        if (isMounted && spUsers && spUsers.length > 0) {
          setUsers(prev => {
            const combined = [...spUsers];
            prev.forEach(u => {
              if (!combined.some(s => s.username === u.username)) {
                combined.push(u);
              }
            });
            return combined;
          });
        }

        const health = await azureApi.checkHealth();
        if (isMounted) setIsAzureConnected(health.azureDbConnected);

        const liveUsers = await azureApi.getUsers();
        if (isMounted && liveUsers && liveUsers.length > 0) {
          setUsers(prev => {
            const combined = [...liveUsers];
            prev.forEach(u => {
              if (!combined.some(c => c.username === u.username)) {
                combined.push(u);
              }
            });
            return combined;
          });
        }

        const liveEFSRs = await azureApi.getEFSRRecords();
        if (isMounted && liveEFSRs && liveEFSRs.length > 0) {
          setEfsrRecords(liveEFSRs);
        }
      } catch (err) {
        console.warn('Initial load notice:', err);
      }
    };

    initData();

    // Subscribe to real-time user database updates from Supabase
    const unsubscribeUserSync = supabaseAuthService.subscribeToUserUpdates((updatedUser) => {
      if (!isMounted) return;
      setUsers(prev => {
        const index = prev.findIndex(u => u.username === updatedUser.username || u.id === updatedUser.id);
        if (index >= 0) {
          const updatedList = [...prev];
          updatedList[index] = { ...updatedList[index], ...updatedUser };
          return updatedList;
        }
        return [updatedUser, ...prev];
      });
    });

    return () => { 
      isMounted = false; 
      unsubscribeUserSync();
    };
  }, []);

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('tangent_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Mobile App View Shortcut Toggle
  const [showMobilePortalOverride, setShowMobilePortalOverride] = useState(false);

  // Real-time Chat Right Drawer State
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Global Satellite Loading Overlay State
  const [actionLoading, setActionLoading] = useState<{
    isLoading: boolean;
    status: string;
    progress: number;
  }>({
    isLoading: false,
    status: '',
    progress: 0
  });

  const triggerActionLoading = (statusMessage: string, durationMs: number = 700) => {
    setActionLoading({
      isLoading: true,
      status: statusMessage,
      progress: 20
    });

    const stepMs = Math.max(80, durationMs / 4);
    const interval = setInterval(() => {
      setActionLoading(prev => {
        if (!prev.isLoading || prev.progress >= 90) {
          clearInterval(interval);
          return prev;
        }
        return { ...prev, progress: prev.progress + 25 };
      });
    }, stepMs);

    setTimeout(() => {
      clearInterval(interval);
      setActionLoading({ isLoading: false, status: '', progress: 100 });
    }, durationMs);
  };

  // Connection Lost / Offline Network Handler
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Global Theme Mode State persisted in localStorage
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('tangent_theme_mode');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('tangent_theme_mode', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
    };
    const handleOnline = () => {
      setIsOffline(false);
      triggerActionLoading('Connection Restored! Re-synchronizing Tangent Cloud Data...', 800);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Navigation Module for Admin Portal
  const [activeModule, setActiveModule] = useState<NavigationModule>('dispatching');
  const [viewResetKey, setViewResetKey] = useState<number>(0);

  // Home Navigation & Reset Handler
  const handleNavigateHome = () => {
    triggerActionLoading('Refreshing Workspace to Home Portal...', 500);
    setActiveModule('dispatching');
    setViewResetKey(prev => prev + 1);
    showToast('Refreshed to Home (Dispatching - ASSIGN FT interface)', 'info');
  };

  // Sidebar Module Navigation Handler (Resets sub-interface to default first tab)
  const handleSelectModule = (module: NavigationModule) => {
    triggerActionLoading(`Loading Module: ${module.replace('-', ' ').toUpperCase()}...`, 500);
    setActiveModule(module);
    setViewResetKey(prev => prev + 1);
  };

  // Persistence State in LocalStorage
  const [userProfile] = useState<UserProfile>(initialUserProfile);
  
  const [requests, setRequests] = useState<ServiceRequest[]>(() => {
    const saved = localStorage.getItem('tangent_srn_requests');
    return saved ? JSON.parse(saved) : initialServiceRequests;
  });

  const [fieldTechnicians, setFieldTechnicians] = useState<FieldTechnician[]>(() => {
    const saved = localStorage.getItem('tangent_fts');
    let list: FieldTechnician[] = saved ? JSON.parse(saved) : initialFieldTechnicians;
    if (!list.some(ft => ft.name.toLowerCase().includes('magat') || ft.name.toLowerCase().includes('stephen'))) {
      list = [...initialFieldTechnicians];
    }
    return list;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem('tangent_audit_logs');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [efsrRecords, setEfsrRecords] = useState<EFSRRecord[]>(() => {
    const saved = localStorage.getItem('tangent_efsrs');
    return saved ? JSON.parse(saved) : initialEFSRRecords;
  });

  const [imsLogs, setImsLogs] = useState<IMSLogItem[]>(initialIMSLogs);
  const [posPrepLogs, setPosPrepLogs] = useState<POSPrepLogItem[]>(initialPOSPrepLogs);
  const [pendingSummary, setPendingSummary] = useState<PendingSummaryItem[]>(initialPendingSummary);

  // Sync animation state
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [isSRNDetailModalOpen, setIsSRNDetailModalOpen] = useState(false);
  const [isNewSRNModalOpen, setIsNewSRNModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isSmartSdModalOpen, setIsSmartSdModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedSRNForDetail, setSelectedSRNForDetail] = useState<ServiceRequest | null>(null);

  // SMART SD Strateq Sync Handler
  const handleSyncSmartSDConfirm = (importedRequests: ServiceRequest[]) => {
    triggerActionLoading(`Syncing ${importedRequests.length} SMART SD Service Orders to Dispatcher Logs...`, 900);

    const existingSrns = new Set(requests.map(r => r.srn));
    const newRequests = importedRequests.filter(r => !existingSrns.has(r.srn));

    if (newRequests.length > 0) {
      setRequests(prev => [...newRequests, ...prev]);

      const newAudit: AuditLogItem = {
        id: `audit-smartsd-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        srn: `${newRequests.length} SOs Synced`,
        action: 'SMART SD Strateq Sync',
        performedBy: currentUser?.name || 'Team Leader',
        details: `Synced ${newRequests.length} active Service Orders from SMART SD Gateway (Strateq).`,
        category: 'System Sync'
      };
      setAuditLogs(prev => [newAudit, ...prev]);
      showToast(`Successfully synced ${newRequests.length} active Service Orders from SMART SD!`);
    } else {
      showToast(`All ${importedRequests.length} SMART SD Service Orders are already present in Dispatcher Logs.`, 'info');
    }

    setIsSmartSdModalOpen(false);
  };

  // CSV Batch Upload Handler
  const handleBatchImportCSV = (importedRequests: ServiceRequest[], newIMSLogs: IMSLogItem[]) => {
    triggerActionLoading(`Saving CSV Batch Manifest (${importedRequests.length} SRNs) to Azure Database...`, 900);
    setRequests(prev => [...importedRequests, ...prev]);
    setImsLogs(prev => [...newIMSLogs, ...prev]);

    const newAudit: AuditLogItem = {
      id: `audit-csv-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      srn: `${importedRequests.length} SRNs Batch Import`,
      action: 'CSV Manifest Batch Import',
      performedBy: currentUser?.name || 'IMS Custodian',
      details: `Successfully uploaded CSV manifest containing ${importedRequests.length} service requests directly into Dispatching Queue.`,
      category: 'IMS Batch Upload'
    };
    setAuditLogs(prev => [newAudit, ...prev]);

    showToast(`CSV Batch Upload successful! ${importedRequests.length} SRNs released to Dispatching queue.`);
  };

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Save to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('tangent_app_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tangent_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('tangent_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('tangent_srn_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('tangent_fts', JSON.stringify(fieldTechnicians));
  }, [fieldTechnicians]);

  useEffect(() => {
    localStorage.setItem('tangent_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('tangent_efsrs', JSON.stringify(efsrRecords));
  }, [efsrRecords]);

  // Login handler
  const handleLoginSuccess = (user: AppUser) => {
    setCurrentUser(user);
    setShowMobilePortalOverride(false);
    showToast(`Welcome back, ${user.name}! Logged in as ${(user.role || '').replace('-', ' ').toUpperCase()}.`);

    // Automatic Notification to Account Group Chat if user is an Account Channel Representative
    const channel = ACCOUNT_CHANNELS_LIST.find(c => 
      (user.accountChannelId && c.id === user.accountChannelId) ||
      c.salesReps.toLowerCase().includes(user.name.toLowerCase()) ||
      c.csAgents.toLowerCase().includes(user.name.toLowerCase())
    );

    if (channel) {
      setTimeout(async () => {
        const loginNoticeMsg = {
          id: `msg-login-${Date.now()}`,
          senderId: user.id,
          senderName: user.name,
          senderRole: user.role === 'sales-lead' ? 'Sales Lead' : user.role === 'customer-service' ? 'Customer Service' : user.role,
          receiverId: channel.id,
          receiverName: channel.name,
          message: `🟢 ${user.name} (${user.department || user.role}) is now LOGGED IN and active in ${channel.name} to handle Field Technician concerns.`,
          timestamp: new Date().toISOString(),
          status: 'Delivered' as const,
          isRead: false
        };
        await chatService.sendMessage(loginNoticeMsg);
        playTeamsNotificationSound();
      }, 500);
    }
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    setShowMobilePortalOverride(false);
    showToast('Logged out of Tangent Cloud System.', 'info');
  };

  // User Management CRUD Handlers
  const handleAddUser = (newUser: AppUser) => {
    setUsers(prev => [newUser, ...prev]);

    // Async sync to Azure API
    azureApi.createUser(newUser).catch(err => {
      console.warn('Azure user creation sync notice:', err);
    });

    // If new user is a Field Technician, also add to Field Technicians list so dispatching works!
    if (newUser.role === 'Field Technician' || newUser.role === 'field-technician') {
      const newFT: FieldTechnician = {
        id: newUser.assignedFTId || `FT-${Date.now()}`,
        name: newUser.name,
        employeeCode: newUser.employeeCode,
        area: newUser.area || 'LUZON',
        sector: newUser.sector || 'SOUTH LUZON',
        contactNumber: newUser.contactNumber,
        activeDispatches: 0,
        completedToday: 0,
        status: 'Available',
        vehicle: 'Motorcycle - Fleet Unit'
      };
      setFieldTechnicians(prev => [newFT, ...prev]);
    }

    showToast(`Registered account for ${newUser.name} (${newUser.role}).`);
  };

  const handleUpdateUserStatus = (userId: string, status: 'Active' | 'Inactive') => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    azureApi.updateUser(userId, { status }).catch(err => console.warn('Azure update notice:', err));
    showToast(`Updated user status to ${status}.`);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    azureApi.deleteUser(userId).catch(err => console.warn('Azure delete notice:', err));
    showToast('User account removed.');
  };

  const handleResetPassword = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: 'tangent123' } : u));
    azureApi.updateUser(userId, { password: 'tangent123' }).catch(err => console.warn('Azure password reset notice:', err));
    showToast('Password reset to default: tangent123');
  };

  const handleUpdateUser = (updatedUser: AppUser) => {
    triggerActionLoading('Saving User Profile Details & Updating Directory...', 800);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    azureApi.updateUser(updatedUser.id, updatedUser).catch(err => console.warn('Azure update user notice:', err));
    showToast(`Account details updated for ${updatedUser.name}.`);
  };

  // Handle Selection Toggle
  const handleSelectRequest = (id: string, selected: boolean) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, selected } : req));
  };

  const handleSelectAll = (selected: boolean) => {
    setRequests(prev => prev.map(req => ({ ...req, selected })));
  };

  // Action 1: Dispatch Selected SRNs
  const handleConfirmDispatch = (
    srnIds: string[], 
    ftId: string, 
    ftName: string, 
    dispatchDate: string, 
    dispatchTime: string, 
    remarks: string
  ) => {
    triggerActionLoading(`Dispatching Field Technician ${ftName} & Releasing eFSR...`, 800);
    const nowTimestamp = new Date().toLocaleString();

    setRequests(prev => prev.map(req => {
      if (srnIds.includes(req.id)) {
        return {
          ...req,
          status: 'Dispatched',
          assignedFTId: ftId,
          assignedFTName: ftName,
          assignedDate: dispatchDate,
          assignedTime: dispatchTime,
          remarks,
          selected: false
        };
      }
      return req;
    }));

    setFieldTechnicians(prev => prev.map(ft => {
      if (ft.id === ftId) {
        return {
          ...ft,
          activeDispatches: ft.activeDispatches + srnIds.length,
          status: 'On Delivery'
        };
      }
      return ft;
    }));

    const newLogs: AuditLogItem[] = srnIds.map((id, index) => {
      const targetSrn = requests.find(r => r.id === id)?.srn || id;
      return {
        id: `audit-${Date.now()}-${index}`,
        timestamp: nowTimestamp,
        srn: targetSrn,
        action: 'FT Dispatched',
        performedBy: currentUser ? currentUser.name : userProfile.name,
        details: `Dispatched to Field Technician ${ftName} for schedule ${dispatchDate} ${dispatchTime}. Remarks: ${remarks}`,
        category: 'Dispatch'
      };
    });

    setAuditLogs(prev => [...newLogs, ...prev]);
    setIsDispatchModalOpen(false);
    showToast(`Successfully dispatched ${srnIds.length} Service Request(s) to ${ftName}.`);
  };

  // Action 2: Reassign Field Technician
  const handleConfirmReassign = (
    srnIds: string[], 
    newFtId: string, 
    newFtName: string, 
    reason: string
  ) => {
    triggerActionLoading(`Reassigning Service Request to ${newFtName}...`, 800);
    const nowTimestamp = new Date().toLocaleString();

    setRequests(prev => prev.map(req => {
      if (srnIds.includes(req.id)) {
        return {
          ...req,
          assignedFTId: newFtId,
          assignedFTName: newFtName,
          remarks: `Reassigned: ${reason}`,
          selected: false
        };
      }
      return req;
    }));

    const newLogs: AuditLogItem[] = srnIds.map((id, idx) => {
      const targetSrn = requests.find(r => r.id === id)?.srn || id;
      return {
        id: `audit-reassign-${Date.now()}-${idx}`,
        timestamp: nowTimestamp,
        srn: targetSrn,
        action: 'FT Reassigned',
        performedBy: currentUser ? currentUser.name : userProfile.name,
        details: `Reassigned to ${newFtName}. Reason: ${reason}`,
        category: 'Dispatch'
      };
    });

    setAuditLogs(prev => [...newLogs, ...prev]);
    setIsReassignModalOpen(false);
    showToast(`Reassigned ${srnIds.length} SRN(s) to ${newFtName}.`);
  };

  // Action 3: Create / Release New SRN
  const handleCreateSRN = (newRequest: Omit<ServiceRequest, 'id'>) => {
    triggerActionLoading(`Generating New SRN ${newRequest.srn} & Releasing to Dispatcher Queue...`, 800);
    const id = `srn-${Date.now()}`;
    const fullSRN: ServiceRequest = {
      ...newRequest,
      id
    };

    setRequests(prev => [fullSRN, ...prev]);

    setAuditLogs(prev => [{
      id: `audit-new-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      srn: fullSRN.srn,
      action: 'SRN Created & Released',
      performedBy: currentUser ? currentUser.name : userProfile.name,
      details: `New Service Request released for ${fullSRN.merchantName} (${fullSRN.cityMunicipality})`,
      category: 'Release'
    }, ...prev]);

    setIsNewSRNModalOpen(false);
    showToast(`New SRN ${fullSRN.srn} released to Dispatcher portal!`);
  };

  // Status update from Field Tech Portal
  const handleUpdateSRNStatus = (srnId: string, status: SRNStatus, extraData?: any) => {
    triggerActionLoading(`Updating SRN Status to ${status}...`, 600);
    setRequests(prev => prev.map(req => {
      if (req.id === srnId) {
        return {
          ...req,
          status,
          ...(extraData?.serialNumber ? { serialNumber: extraData.serialNumber } : {}),
          ...(extraData?.remarks ? { remarks: extraData.remarks } : {})
        };
      }
      return req;
    }));

    setAuditLogs(prev => [{
      id: `audit-tech-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      srn: requests.find(r => r.id === srnId)?.srn || srnId,
      action: `Status: ${status}`,
      performedBy: currentUser ? currentUser.name : 'Field Technician',
      details: `Field status updated to ${status}. ${extraData?.remarks || ''}`,
      category: 'Field Action'
    }, ...prev]);

    showToast(`SRN status updated to: ${status}`);
  };

  // Submit eFSR from Field Tech
  const handleSubmitEFSR = (newEFSR: EFSRRecord) => {
    triggerActionLoading(`Saving eFSR ${newEFSR.efsrNumber} Details & Generating Audit Trail...`, 800);
    setEfsrRecords(prev => [newEFSR, ...prev]);

    // Sync to Azure API
    azureApi.createEFSRRecord(newEFSR).catch(err => {
      console.warn('Azure eFSR record create sync notice:', err);
    });

    setAuditLogs(prev => [{
      id: `audit-efsr-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      srn: newEFSR.srn,
      action: 'eFSR Submitted',
      performedBy: newEFSR.technicianName,
      details: `Electronic Field Service Report ${newEFSR.efsrNumber} submitted for ${newEFSR.merchantName}. Serial: ${newEFSR.terminalSerialInstalled}`,
      category: 'eFSR'
    }, ...prev]);

    showToast(`eFSR ${newEFSR.efsrNumber} submitted successfully!`);
  };

  // Export CSV Utility - Complete column manifest
  const handleExportCSV = (filteredList: ServiceRequest[]) => {
    const headers = [
      'Merchant Name',
      'Merchant Address',
      'City Municipality',
      'Province',
      'Area',
      'Sector',
      'SRN',
      'Request Category',
      'Account Name',
      'Client Count',
      'CCIARCO/IMS/POSP/RC Released Date',
      'CCIARCO/IMS/POSP/RC Released Time',
      'SLA Remarks',
      'Contact Person',
      'Contact Number',
      'Addtl Instructions',
      'Project',
      'Requestor',
      'Request Classification',
      'Status'
    ];

    const rows = filteredList.map(r => [
      `"${(r.merchantName || '').replace(/"/g, '""')}"`,
      `"${(r.merchantAddress || '').replace(/"/g, '""')}"`,
      `"${(r.cityMunicipality || '').replace(/"/g, '""')}"`,
      `"${(r.province || '').replace(/"/g, '""')}"`,
      r.area || 'LUZON',
      r.sector || 'SOUTH LUZON',
      r.srn,
      r.requestCategory || 'INS',
      `"${(r.accountName || '').replace(/"/g, '""')}"`,
      r.clientCount || 1,
      r.releasedDate || '',
      r.releasedTime || '',
      `"${(r.slaRemarks || r.releasedDate || '').replace(/"/g, '""')}"`,
      `"${(r.contactPerson || '').replace(/"/g, '""')}"`,
      `"${(r.contactNumber || '').replace(/"/g, '""')}"`,
      `"${(r.remarks || '').replace(/"/g, '""')}"`,
      `"${(r.projectName || '').replace(/"/g, '""')}"`,
      `"${(r.requestor || '').replace(/"/g, '""')}"`,
      `"${(r.requestClassification || 'REGULAR').replace(/"/g, '""')}"`,
      r.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tangent_Dispatcher_Manifest_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${filteredList.length} complete records to CSV file.`);
  };

  // Refresh / Cloud Sync simulation
  const handleRefreshData = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('Cloud database sync complete. All queues updated.');
    }, 800);
  };

  // 1. IF NO USER LOGGED IN -> SHOW LOGIN VIEW
  if (!currentUser) {
    return (
      <LoginView
        users={users}
        onLoginSuccess={handleLoginSuccess}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(prev => !prev)}
      />
    );
  }

  // 2. IF LOGGED IN AS FIELD TECHNICIAN OR MOBILE OVERRIDE IS ACTIVE -> SHOW MOBILE PORTAL
  if (currentUser.role === 'field-technician' || currentUser.role === 'Field Technician' || showMobilePortalOverride) {
    return (
      <>
        <FieldTechnicianPortal
          currentUser={currentUser}
          requests={requests}
          efsrRecords={efsrRecords}
          users={users}
          onUpdateSRNStatus={handleUpdateSRNStatus}
          onSubmitEFSR={handleSubmitEFSR}
          onLogout={() => setIsLogoutPromptOpen(true)}
        />
        <ChatFloatingTrigger 
          onClick={() => setIsChatOpen(true)}
          isOpen={isChatOpen}
          currentUserId={currentUser.id}
        />
        <RightSideChatPanel
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          currentUser={currentUser}
          users={users}
          serviceRequests={requests}
          efsrRecords={efsrRecords}
        />

        {/* LOGOUT CONFIRMATION PROMPT MODAL */}
        {isLogoutPromptOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs select-none animate-fadeIn">
            <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border transition-colors duration-300 ${
              isDarkMode
                ? 'bg-slate-900 border-slate-700 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-500">
                  <LogOut className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">Confirm Logout</h3>
                  <p className="text-xs text-slate-400">Tangent Operations Portal</p>
                </div>
              </div>

              <div className="py-2 mb-6">
                <p className="text-sm font-semibold">
                  Are you sure you want to log out?
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Sigurado ka bang gusto mong mag-log out? Unsaved session data will be preserved locally.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLogoutPromptOpen(false)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isDarkMode
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                  }`}
                >
                  NO
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogoutPromptOpen(false);
                    handleLogout();
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>YES</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // 3. IF LOGGED IN AS DEPARTMENT USER (POS PREP, IMS CUSTODIAN, CCI-ARCO SUPPORT)
  if (
    currentUser.role === 'posprep-tech' ||
    currentUser.role === 'ims-custodian' ||
    currentUser.role === 'cciarco-support'
  ) {
    return (
      <>
        <DepartmentPortal
          currentUser={currentUser}
          requests={requests}
          posPrepLogs={posPrepLogs}
          imsLogs={imsLogs}
          onAddPOSPrepLog={(log) => setPosPrepLogs(prev => [log, ...prev])}
          onAddIMSLog={(log) => setImsLogs(prev => [log, ...prev])}
          onCreateSRN={handleCreateSRN}
          onBatchImportCSV={handleBatchImportCSV}
          onLogout={() => setIsLogoutPromptOpen(true)}
        />
        <ChatFloatingTrigger 
          onClick={() => setIsChatOpen(true)}
          isOpen={isChatOpen}
          currentUserId={currentUser.id}
        />
        <RightSideChatPanel
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          currentUser={currentUser}
          users={users}
          serviceRequests={requests}
          efsrRecords={efsrRecords}
        />

        {/* LOGOUT CONFIRMATION PROMPT MODAL */}
        {isLogoutPromptOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs select-none animate-fadeIn">
            <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border transition-colors duration-300 ${
              isDarkMode
                ? 'bg-slate-900 border-slate-700 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-500">
                  <LogOut className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">Confirm Logout</h3>
                  <p className="text-xs text-slate-400">Tangent Department Portal</p>
                </div>
              </div>

              <div className="py-2 mb-6">
                <p className="text-sm font-semibold">
                  Are you sure you want to log out?
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Sigurado ka bang gusto mong mag-log out? Unsaved session data will be preserved locally.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLogoutPromptOpen(false)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isDarkMode
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                  }`}
                >
                  NO
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogoutPromptOpen(false);
                    handleLogout();
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>YES</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // 4. SUPER ADMIN & DISPATCHER PORTAL VIEW
  const selectedRequests = requests.filter(r => r.selected);
  const counts = {
    dispatchingPending: requests.filter(r => r.status === 'Release To Dispatcher').length,
    pendingTotal: requests.filter(r => r.status !== 'Completed').length,
    efsrSubmitted: requests.filter(r => r.status === 'eFSR Submitted').length
  };

  return (
    <div className="min-h-screen bg-[#edf2f7] dark:bg-slate-950 flex flex-col font-sans text-slate-800 dark:text-slate-100 antialiased">
      {/* Top Header */}
      <Header
        user={userProfile}
        currentUser={currentUser}
        activeModule={activeModule}
        onNavigateHome={handleNavigateHome}
        onRefreshData={handleRefreshData}
        onOpenNewSRNModal={() => setIsNewSRNModalOpen(true)}
        onOpenMobilePortal={() => {
          triggerActionLoading('Loading Field Technician Mobile Portal...', 500);
          setShowMobilePortalOverride(true);
        }}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onLogout={() => setIsLogoutPromptOpen(true)}
        isSyncing={isSyncing}
        isOffline={isOffline}
        onSimulateOffline={() => setIsOffline(prev => !prev)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(prev => !prev)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentUser={currentUser}
          activeModule={activeModule}
          onSelectModule={handleSelectModule}
          counts={counts}
        />

        {/* Main View Canvas */}
        <main className="flex-1 p-4 overflow-y-auto max-h-[calc(100vh-3.5rem)] space-y-4">
          {/* Toast Notification */}
          {toastMessage && (
            <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl border flex items-center space-x-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 ${
              toastMessage.type === 'success' 
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700' 
                : 'bg-blue-900 text-blue-100 border-blue-700'
            }`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{toastMessage.text}</span>
              <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-80">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Module Router */}
          {activeModule === 'dispatching' && (
            <DispatchingView
              key={viewResetKey}
              requests={requests}
              fieldTechnicians={fieldTechnicians}
              efsrRecords={efsrRecords}
              onSelectRequest={handleSelectRequest}
              onSelectAll={handleSelectAll}
              onOpenDispatchModal={() => setIsDispatchModalOpen(true)}
              onOpenReassignModal={() => setIsReassignModalOpen(true)}
              onViewSRNDetails={(req) => {
                setSelectedSRNForDetail(req);
                setIsSRNDetailModalOpen(true);
              }}
              onExportCSV={handleExportCSV}
              onOpenCsvModal={() => setIsCsvModalOpen(true)}
              onOpenSmartSdModal={() => setIsSmartSdModalOpen(true)}
              onRecallDispatch={(srnId) => {
                setRequests(prev => prev.map(r => r.id === srnId ? { ...r, status: 'Release To Dispatcher', assignedFTId: undefined, assignedFTName: undefined } : r));
                showToast('Dispatch recalled. Service Request returned to Release queue.');
              }}
              onApproveEFSR={(efsrId) => {
                setEfsrRecords(prev => prev.map(e => e.id === efsrId ? { ...e, status: 'Approved' } : e));
                showToast('eFSR approved successfully.');
              }}
              onRequestCorrection={(efsrId, reason) => {
                setEfsrRecords(prev => prev.map(e => e.id === efsrId ? { ...e, status: 'Correction Needed', remarks: `Correction requested: ${reason}` } : e));
                showToast('Correction request sent to technician.', 'info');
              }}
            />
          )}

          {activeModule === 'audit-logs' && (
            <ServiceRequestAuditLogsView auditLogs={auditLogs} />
          )}

          {activeModule === 'efsr-viewer' && (
            <EFSRViewer efsrRecords={efsrRecords} />
          )}

          {activeModule === 'ims-logs' && (
            <IMSLogsView imsLogs={imsLogs} onOpenCsvModal={() => setIsCsvModalOpen(true)} />
          )}

          {activeModule === 'posprep-logs' && (
            <POSPrepDailyLogsView posPrepLogs={posPrepLogs} />
          )}

          {activeModule === 'pending-summary' && (
            <PendingSummaryView pendingSummary={pendingSummary} />
          )}

          {activeModule === 'cciarco-logs' && (
            <CCIARCOSupportView />
          )}

          {activeModule === 'employee-management' && (
            (currentUser?.role === 'Super Admin' || currentUser?.role === 'super-admin') ? (
              <EmployeeManagementView
                users={users}
                onAddUser={handleAddUser}
                onUpdateUserStatus={handleUpdateUserStatus}
                onDeleteUser={handleDeleteUser}
                onResetPassword={handleResetPassword}
                onUpdateUser={handleUpdateUser}
                isAzureConnected={isAzureConnected}
              />
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-red-200 shadow-sm text-center max-w-md mx-auto my-12 space-y-4 font-sans">
                <div className="p-4 bg-red-50 text-red-600 rounded-full w-16 h-16 mx-auto flex items-center justify-center border border-red-100">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Access Restricted</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Only <span className="font-bold text-purple-700">Super Admin</span> accounts have permission to access and manage the User & Employee Directory.
                  </p>
                </div>
                <button
                  onClick={handleNavigateHome}
                  className="px-5 py-2 bg-[#1b497d] text-white font-bold text-xs rounded-xl hover:bg-[#163c68] transition cursor-pointer"
                >
                  Back to Dispatching Home
                </button>
              </div>
            )
          )}
        </main>
      </div>

      {/* User Profile Modal for updating details / password / photo */}
      {isProfileModalOpen && (
        <UserProfileModal
          currentUser={currentUser}
          onClose={() => setIsProfileModalOpen(false)}
          onUpdateUser={(updatedUser) => {
            handleUpdateUser(updatedUser);
            setIsProfileModalOpen(false);
          }}
        />
      )}

      {/* Interactive Modals */}
      {isDispatchModalOpen && (
        <DispatchModal
          selectedRequests={selectedRequests}
          fieldTechnicians={fieldTechnicians}
          onClose={() => setIsDispatchModalOpen(false)}
          onConfirmDispatch={handleConfirmDispatch}
        />
      )}

      {isReassignModalOpen && (
        <ReassignModal
          selectedRequests={selectedRequests}
          fieldTechnicians={fieldTechnicians}
          onClose={() => setIsReassignModalOpen(false)}
          onConfirmReassign={handleConfirmReassign}
        />
      )}

      {isSRNDetailModalOpen && (
        <SRNDetailModal
          request={selectedSRNForDetail}
          onClose={() => setIsSRNDetailModalOpen(false)}
          onQuickDispatch={(req) => {
            setRequests(prev => prev.map(r => r.id === req.id ? { ...r, selected: true } : { ...r, selected: false }));
            setIsDispatchModalOpen(true);
          }}
        />
      )}

      {isNewSRNModalOpen && (
        <NewSRNModal
          onClose={() => setIsNewSRNModalOpen(false)}
          onCreateSRN={handleCreateSRN}
        />
      )}

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        uploaderName={currentUser?.name || 'IMS Custodian'}
        onImportConfirm={handleBatchImportCSV}
      />

      {/* SMART SD (Strateq) Sync Modal */}
      <SmartSdSyncModal
        isOpen={isSmartSdModalOpen}
        onClose={() => setIsSmartSdModalOpen(false)}
        teamLeaderName={currentUser?.name || 'tl_manila_01'}
        onSyncConfirm={handleSyncSmartSDConfirm}
      />

      {/* Real-time Messaging & Chat Drawer (Right-side Panel) */}
      <ChatFloatingTrigger 
        onClick={() => setIsChatOpen(true)}
        isOpen={isChatOpen}
        currentUserId={currentUser.id}
      />
      <RightSideChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUser={currentUser}
        users={users}
        serviceRequests={requests}
        efsrRecords={efsrRecords}
      />

      {/* SATELLITE ORBIT LOADING SCREEN OVERLAY FOR DISPATCH, MODULE NAV, SAVE DETAILS, FILTERS */}
      {actionLoading.isLoading && (
        <TangentLoadingScreen
          progress={actionLoading.progress}
          statusMessage={actionLoading.status}
          fullscreen={true}
          isDarkMode={isDarkMode}
        />
      )}

      {/* SATELLITE ORBIT LOADING OVERLAY FOR CONNECTION LOST / OFFLINE MODE */}
      {isOffline && (
        <div className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white select-none">
          <TangentLoadingScreen
            progress={100}
            statusMessage="Connection Lost — Attempting to Reconnect to Tangent Cloud Network..."
            fullscreen={false}
            isDarkMode={isDarkMode}
          />
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-center space-x-2 text-rose-400 font-bold text-sm bg-rose-950/80 px-4 py-2 rounded-xl border border-rose-800/80 shadow-md">
              <WifiOff className="w-5 h-5 animate-pulse" />
              <span>Offline Mode Active • Azure Database Unreachable</span>
            </div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Network connection was disrupted. Local changes are safely queued and will automatically sync once connectivity is restored.
            </p>
            <button
              onClick={() => {
                triggerActionLoading('Attempting Reconnection to Azure Cloud...', 800);
                setTimeout(() => setIsOffline(false), 800);
              }}
              className="mt-2 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer active:scale-95 flex items-center justify-center space-x-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Retry Cloud Connection</span>
            </button>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION PROMPT MODAL */}
      {isLogoutPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs select-none animate-fadeIn">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border transition-colors duration-300 ${
            isDarkMode
              ? 'bg-slate-900 border-slate-700 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-500">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight">Confirm Logout</h3>
                <p className="text-xs text-slate-400">Tangent Field Operations Portal</p>
              </div>
            </div>

            <div className="py-2 mb-6">
              <p className="text-sm font-semibold">
                Are you sure you want to log out?
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Sigurado ka bang gusto mong mag-log out? Unsaved session data will be preserved locally.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsLogoutPromptOpen(false)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                }`}
              >
                NO
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogoutPromptOpen(false);
                  handleLogout();
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all shadow-md cursor-pointer flex items-center space-x-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>YES</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
