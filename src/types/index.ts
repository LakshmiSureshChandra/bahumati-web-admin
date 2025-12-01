export type Role = 'OnboardingAgent' | 'ReconciliationAgent' | 'SuperAdmin';

export type KYCStatus = 'Pending' | 'Approved' | 'Rejected';
export type AllocationType = 'Top 50 Companies' | 'Digital Gold';
export type EventStatus = 'Upcoming' | 'Ongoing' | 'Ended';
export type TransactionType = 'Deposit' | 'Withdrawal' | 'Allocation' | 'Refund';
export type TransactionStatus = 'Pending' | 'Completed' | 'Failed';
export type WithdrawStatus = 'Pending' | 'Completed' | 'Rejected';
export type AgentStatus = 'Active' | 'Disabled';
export type AdPlacement = 'HomeBanner' | 'DashboardCard' | 'Sidebar';
export type AdType = 'TextOnly' | 'ImageOnly' | 'TextAndImage';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  kycStatus: KYCStatus;
  kycLevel?: number;
  createdDate: string; // ISO Date
  isBanned: boolean;
  defaultAllocationType: AllocationType;
  eventParticipationCount: number;
  totalBalance: number;
  withdrawableAmount: number;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    accountHolderName: string;
  };
  upiId?: string;
}

export interface KYCDetails {
  userId: string;
  governmentIdNumber: string;
  governmentIdType: string;
  addressProof: string; // URL or description
  documents: string[]; // URLs
  submittedAt: string;
  reviewedBy?: string; // Agent ID
  reviewNotes?: string;
  decisionDate?: string;
}

export interface Event {
  id: string;
  name: string;
  organizerUserId: string;
  startDate: string;
  endDate: string;
  status: EventStatus;
  totalCollectedAmount: number;
  tPlusXDays: number;
  defaultAllocationType: AllocationType;
  allowedWithdrawPercentage: number; // 0-100
  autoAllocationScheduledDate: string;
}

export interface Transaction {
  id: string;
  userId: string;
  eventId?: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  createdAt: string;
  processedAt?: string;
}

export interface WithdrawRequest {
  id: string;
  userId: string;
  eventId?: string;
  requestedAmount: number;
  allowedMaxAmount: number;
  status: WithdrawStatus;
  requestDate: string;
  processedBy?: string; // Agent ID
  processedDate?: string;
  transactionId?: string;
  transactionProofImageUrl?: string;
  notes?: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: AgentStatus;
  lastActive: string;
}

export interface AppConfig {
  maintenanceMode: boolean;
  minAppVersionIos: string;
  minAppVersionAndroid: string;
  supportEmail: string;
  supportPhone: string;
  maxDailyWithdrawalLimit: number;
  kycAutoApprovalEnabled: boolean;
}

export interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  redirectUrl: string;
  placement: AdPlacement;
  type: AdType;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
