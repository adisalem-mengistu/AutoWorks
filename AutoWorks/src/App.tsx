import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, logOut, loadProfile, isConfigured } from './lib/firebase';
import { loadProfileLocal, loadLeadsLocal, DEFAULT_PROFILE } from './lib/storage';

import Navbar        from './components/Navbar';
import AuthModal     from './components/AuthModal';
import JobGenerator  from './components/JobGenerator';
import LeadProspector from './components/LeadProspector';
import ColdPitchEngine from './components/ColdPitchEngine';
import ProfileEditor from './components/ProfileEditor';

import type { ActiveTab, DeveloperProfile, JobListing, Lead } from './types';

export default function App() {
  const [activeTab, setActiveTab]         = useState<ActiveTab>('jobs');
  const [user, setUser]                   = useState<User | null>(null);
  const [showAuth, setShowAuth]           = useState(false);
  const [profile, setProfile]             = useState<DeveloperProfile>(() => loadProfileLocal() ?? DEFAULT_PROFILE);
  const [leads, setLeads]                 = useState<Lead[]>(() => loadLeadsLocal());
  const [prefilledJob, setPrefilledJob]   = useState<JobListing | null>(null);
  const [prefilledLead, setPrefilledLead] = useState<Lead | null>(null);

  // Firebase auth listener
  useEffect(() => {
    if (!auth || !isConfigured) return;
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const remoteProfile = await loadProfile(u.uid);
        if (remoteProfile) {
          setProfile(remoteProfile);
        }
      }
    });
    return unsub;
  }, []);

  function handleProfileChange(p: DeveloperProfile) {
    setProfile(p);
  }

  function handleDraftFromJob(job: JobListing) {
    setPrefilledJob(job);
    setPrefilledLead(null);
    setActiveTab('compose');
  }

  function handleDraftFromLead(lead: Lead) {
    setPrefilledLead(lead);
    setPrefilledJob(null);
    setActiveTab('compose');
  }

  function clearPrefill() {
    setPrefilledJob(null);
    setPrefilledLead(null);
  }

  async function handleLogout() {
    try { await logOut(); } catch { /* noop */ }
    setUser(null);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        onAuthClick={() => setShowAuth(true)}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'jobs' && (
          <JobGenerator onDraftEmail={handleDraftFromJob} />
        )}
        {activeTab === 'leads' && (
          <LeadProspector
            leads={leads}
            onLeadsChange={setLeads}
            onDraftEmail={handleDraftFromLead}
          />
        )}
        {activeTab === 'compose' && (
          <ColdPitchEngine
            profile={profile}
            prefilledJob={prefilledJob}
            prefilledLead={prefilledLead}
            onClearPrefill={clearPrefill}
          />
        )}
        {activeTab === 'profile' && (
          <ProfileEditor
            profile={profile}
            onProfileChange={handleProfileChange}
            uid={user?.uid}
          />
        )}
      </main>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
