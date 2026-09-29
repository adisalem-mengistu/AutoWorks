// ─── Core Data Types ────────────────────────────────────────────────────────

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;          // Full-time, Contract, Remote, etc.
  salary?: string;
  description: string;
  requirements: string[];
  aiSummary?: string;
  matchScore?: number;   // 0-100
  url?: string;
  postedDate?: string;
  source: string;
}

export interface Lead {
  id: string;
  name: string;
  title: string;
  company: string;
  email?: string;
  linkedin?: string;
  twitter?: string;
  source: string;
  sourceSnippet: string;
  strategy: LeadStrategy;
  addedAt: string;
  selected?: boolean;
}

export interface DeveloperProfile {
  name: string;
  email: string;
  yearsOfExperience: number;
  bio: string;
  skills: string[];           // e.g. ["Flutter", "Dart", "BLoC", "Firebase"]
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  preferredRoles: string[];   // e.g. ["Senior Flutter Dev", "Mobile Lead"]
  preferredLocations: string[];
  openToRemote: boolean;
}

export interface EmailDraft {
  to: string;
  subject: string;
  body: string;
  jobContext?: JobListing;
  leadContext?: Lead;
}

// ─── Enum-like string unions ─────────────────────────────────────────────────

export type LeadStrategy = 'active_hiring' | 'recruiters' | 'decision_makers';
export type ActiveTab = 'jobs' | 'leads' | 'compose' | 'profile';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ─── API / State helpers ──────────────────────────────────────────────────────

export interface SearchState<T> {
  data: T[];
  status: LoadingState;
  error?: string;
}

export interface InfinitySession {
  running: boolean;
  batchCount: number;
  totalFound: number;
}
