import type { DeveloperProfile, Lead } from '../types';

const PROFILE_KEY = 'flutterapply_profile';
const LEADS_KEY   = 'flutterapply_leads';

// ─── Profile ──────────────────────────────────────────────────────────────────

export function saveProfileLocal(profile: DeveloperProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadProfileLocal(): DeveloperProfile | null {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as DeveloperProfile; }
  catch { return null; }
}

// ─── Leads ────────────────────────────────────────────────────────────────────

export function saveLeadsLocal(leads: Lead[]) {
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
}

export function loadLeadsLocal(): Lead[] {
  const raw = localStorage.getItem(LEADS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as Lead[]; }
  catch { return []; }
}

// ─── Default profile ──────────────────────────────────────────────────────────

export const DEFAULT_PROFILE: DeveloperProfile = {
  name: '',
  email: '',
  yearsOfExperience: 2,
  bio: '',
  skills: ['Flutter', 'Dart', 'Firebase'],
  githubUrl: '',
  linkedinUrl: '',
  portfolioUrl: '',
  preferredRoles: ['Flutter Developer'],
  preferredLocations: ['Remote'],
  openToRemote: true,
};
