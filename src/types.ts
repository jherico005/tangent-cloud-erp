export type MessageStatus = 'Sending' | 'Sent' | 'Delivered' | 'Read';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole | string;
  receiverId: string; // 'ALL' for broadcast, or specific user ID / FT ID
  receiverName?: string;
  ticketId?: string; // e.g. eFSR ID or SRN Number
  ticketType?: 'eFSR' | 'SRN' | 'Merchant';
  message: string;
  timestamp: string;
  status: MessageStatus;
  isRead: boolean;
  seenAt?: string; // exact time when the message was read/seen
  attachmentUrl?: string;
  attachmentName?: string;
  reactions?: { [emoji: string]: string[] }; // emoji -> array of sender Names or IDs
}

export interface ChatContact {
  id: string;
  name: string;
  role: UserRole | string;
  employeeCode?: string;
  status: 'Online' | 'Offline' | 'On Delivery' | 'Available';
  avatar?: string;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

export type NavigationModule = 
  | 'audit-logs'
  | 'efsr-viewer'
  | 'ims-logs'
  | 'dispatching'
  | 'posprep-logs'
  | 'pending-summary'
  | 'cciarco-logs'
  | 'employee-management';

export type UserRole = 
  | 'Super Admin'
  | 'super-admin'
  | 'Department Admin'
  | 'department-admin'
  | 'Department User'
  | 'department-user'
  | 'Field Technician'
  | 'field-technician'
  | 'dispatcher'
  | 'posprep-tech'
  | 'ims-custodian'
  | 'cciarco-support'
  | 'sales-lead'
  | 'customer-service'
  | 'account-rep';

export interface AppUser {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  role: UserRole;
  employeeCode: string;
  department: string;
  area?: AreaType;
  sector?: SectorType;
  contactNumber: string;
  status: 'Active' | 'Inactive';
  avatar?: string;
  assignedFTId?: string; // links to FieldTechnician id if role is field-technician
  accountChannelId?: string; // links to Account Group Channel ID e.g. 'CHANNEL_GCASH'
}

export type DispatchSubTab = 
  | 'assign-ft'
  | 'view-dispatched'
  | 'efsr-correction'
  | 'search-ft'
  | 'dashboard';

export type SRNStatus = 
  | 'Release To Dispatcher'
  | 'Pending Dispatch'
  | 'Dispatched'
  | 'In Transit'
  | 'On Site'
  | 'eFSR Submitted'
  | 'Completed'
  | 'Correction Needed'
  | 'Cancelled';

export type AreaType = 'LUZON' | 'VISAYAS' | 'MINDANAO' | 'NCR';

export type SectorType = 
  | 'SOUTH LUZON' 
  | 'NORTH LUZON' 
  | 'NCR' 
  | 'VISAYAS' 
  | 'MINDANAO'
  | string;

export type RequestCategory = 
  | 'ALL' 
  | 'INS' 
  | 'INS-RPL' 
  | 'INS-RPG' 
  | 'INS-FTS' 
  | 'PLO' 
  | 'PLO-DPG' 
  | 'RPL' 
  | 'RPL-FTS' 
  | 'RPG' 
  | 'CHK' 
  | 'ACC' 
  | 'OTH'
  | string;

export interface ServiceRequest {
  id: string;
  selected?: boolean;
  merchantName: string;
  merchantAddress: string;
  cityMunicipality: string;
  province: string;
  area: AreaType;
  sector: SectorType;
  srn: string; // Service Request Number
  requestCategory: string; // INS, REP, etc.
  accountName: string; // SBIS, PNB, MAYA, BDO, etc.
  clientCount: number;
  releasedDate: string; // YYYY-MM-DD
  releasedTime: string; // hh:mm:ss AM/PM
  slaRemarks?: string;
  status: SRNStatus;
  projectName?: string;
  requestor?: string;
  requestClassification?: string;
  isMayaRequest?: boolean;
  assignedFTId?: string;
  assignedFTName?: string;
  assignedDate?: string;
  assignedTime?: string;
  remarks?: string;
  contactPerson?: string;
  contactNumber?: string;
  terminalModel?: string;
  serialNumber?: string;
  assignmentId?: string;
  assignee?: string;
}

export interface FieldTechnician {
  id: string;
  name: string;
  employeeCode: string;
  area: AreaType;
  sector: SectorType;
  contactNumber: string;
  activeDispatches: number;
  completedToday: number;
  status: 'Available' | 'On Delivery' | 'Off Duty' | 'On Leave';
  vehicle: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  srn: string;
  action: string;
  performedBy: string;
  details: string;
  category: string;
}

export interface EfsrAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  date?: string;
}

export interface EFSRRecord {
  id: string;
  efsrNumber: string;
  srn: string;
  merchantName: string;
  technicianName: string;
  dateCompleted: string;
  timeInArrival?: string;
  timeOutCompleted?: string;
  status: 'Approved' | 'Pending Review' | 'Correction Needed' | 'Unsuccessful' | 'For eFSR Correction';
  terminalSerialInstalled?: string;
  terminalSerialPulledOut?: string;
  signalStrength?: string;
  testTransactionSuccess?: boolean;
  merchantSignature?: string;
  actionTaken?: string;
  remarks?: string;
  attachments?: EfsrAttachment[];
  merchantEmail?: string;
  emailSentAt?: string;

  // Detailed eFSR & FSR Viewer Fields from System Screenshots
  accountCode?: string;
  servicingStatus?: 'Successful' | 'Unsuccessful' | 'Approved' | 'Pending Review';
  terminalStatus?: string;
  serialNumber?: string;
  poSerialNumber?: string;
  timeCompleted?: string;
  merchantAddress?: string;
  contactPerson?: string;
  contactNumber?: string;
  rating?: string;
  serviceType?: string;
  
  // Terminal Details
  terminalType?: string;
  peripherals?: string;
  mid?: string;
  tid?: string;
  appVersion?: string;
  simDetails?: string;
  simSerial?: string;
  accessories?: string;

  // Service Timestamps & SDR
  acceptanceTesting?: string;
  sdrNumber?: string;
  leftPreviousLocation?: string;
  arrivalAtMerchant?: string;
  serviceStarted?: string;
  serviceCompleted?: string;
  departureFromMerchant?: string;

  // Correction Tracking
  correctionReasons?: string[];
  correctionSelectedOptions?: string[];
  correctionSubmittedAt?: string;
}

export interface IMSLogItem {
  id: string;
  timestamp: string;
  serialNumber: string;
  model: string;
  account: string;
  movementType: 'Inbound' | 'Outbound to Dispatch' | 'Returned' | 'Defective';
  releasedTo: string;
  verifiedBy: string;
}

export interface POSPrepLogItem {
  id: string;
  date: string;
  srn: string;
  terminalModel: string;
  serialNumber: string;
  simCardNo: string;
  accountName: string;
  prepStatus: 'Key Injected' | 'Software Loaded' | 'QC Passed' | 'Packed';
  preppedBy: string;
}

export interface PendingSummaryItem {
  accountName: string;
  area: AreaType;
  sector: SectorType;
  insPending: number;
  repPending: number;
  pntPending: number;
  pupPending: number;
  swpPending: number;
  totalPending: number;
}

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  avatar: string;
  location: string;
}
