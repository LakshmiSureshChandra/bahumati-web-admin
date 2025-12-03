export type Role = 'OnboardingAgent' | 'ReconciliationAgent' | 'SuperAdmin' | 'onboarding_agent' | 'reconciliation_agent';

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
  gender?: 'male' | 'female' | 'other';
  birthDate?: string; // ISO Date
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
  idType: 'aadhaar' | 'pan' | 'driving_license' | 'voter_id' | 'passport';
  frontPic: string;
  backPic: string;
  selfie: string;
  status: KYCStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedBy?: string; // Agent ID
  reviewNotes?: string;
  decisionDate?: string;
  // Legacy fields kept for compatibility if needed, or removed if strictly following new schema
  governmentIdNumber?: string;
  governmentIdType?: string;
  addressProof?: string;
  documents?: string[];
}

export interface Event {
  id: string;
  name: string;
  creator: {
    id: string;
    name: string;
    image?: string;
  };
  description?: string;
  image?: string;
  startDate: string;
  endDate: string;
  status: EventStatus;
  totalCollectedAmount: number;
  totalWithdrawnAmount: number;
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
  username?: string;
  email?: string; // Made optional as API doesn't seem to require it for creation
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
export interface UserHistorySummary {
  totalGiftsSent: number;
  totalGiftsReceived: number;
  totalAllocated: number;
  totalWithdrawn: number;
  totalPendingWithdrawals: number;
  netBalance: number;
  totalEventsCreated: number;
  totalEventGiftsAmount: number;
  totalEventWithdrawals: number;
}

export interface HistoryTransaction {
  type: 'gift_received' | 'gift_sent' | 'allocation';
  transactionId?: string;
  amount: number;
  giftType?: 'gold' | 'stock';
  giftName?: string;
  quantity?: number;
  status?: string;
  isAllotted?: boolean;
  sender?: {
    id: string;
    name: string;
    image?: string;
    number: string;
  };
  receiver?: {
    id: string;
    name: string;
    image?: string;
    number: string;
  };
  event?: {
    id: string;
    title: string;
    eventLink: string;
  } | null;
  createdAt: string; // or allocatedAt
  allocatedAt?: string;
  isSelfGift?: boolean;
  allocationType?: string;
  pricePerUnit?: number;
  giftId?: {
    _id: string;
    valueInINR: number;
    type: string;
    name: string;
  };
}

export interface HistoryWithdrawal {
  _id: string;
  eventId: {
    _id: string;
    title: string;
    eventLink: string;
    eventStartDate: string;
    eventEndDate: string;
  };
  userId: string;
  amount: number;
  percentage: number;
  totalGiftsAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  moneyState: string;
  approvedBy?: {
    _id: string;
    fullName: string;
  } | null;
  approvedAt?: string | null;
  rejectedBy?: {
    _id: string;
    fullName: string;
  } | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryEvent {
  id: string;
  title: string;
  description: string;
  image: string | null;
  eventStartDate: string;
  eventEndDate: string;
  eventLink: string;
  status: 'active' | 'ended' | 'cancelled';
  withdrawalPercentage: number;
  stats: {
    totalGiftsReceived: number;
    totalGiftsAmount: number;
    maxWithdrawable: number;
    totalWithdrawn: number;
    totalPendingWithdrawals: number;
    availableForWithdrawal: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserHistoryResponse {
  user: {
    id: string;
    fullName: string;
    number: string;
    image: string | null;
  };
  summary: UserHistorySummary;
  transactions: {
    giftsSent: number;
    giftsReceived: number;
    allocations: number;
    total: number;
    list: HistoryTransaction[];
  };
  withdrawals: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    list: HistoryWithdrawal[];
  };
  events: {
    total: number;
    active: number;
    ended: number;
    cancelled: number;
    list: HistoryEvent[];
  };
}
