import { useState } from 'react';
import { User, Save, CheckCheck, Plus, X, Github, Linkedin, Globe, AlertCircle } from 'lucide-react';
import { saveProfileLocal } from '../lib/storage';
import { saveProfile } from '../lib/firebase';
import type { DeveloperProfile } from '../types';

interface ProfileEditorProps {
  profile: DeveloperProfile;
  onProfileChange: (p: DeveloperProfile) => void;
  uid?: string | null;
}

const COMMON_SKILLS = [
  'Flutter', 'Dart', 'BLoC', 'Riverpod', 'GetX', 'Provider',
  'Firebase', 'Firestore', 'REST APIs', 'GraphQL', 'SQLite',
  'Hive', 'Dio', 'Retrofit', 'Clean Architecture', 'TDD',
  'CI/CD', 'Fastlane', 'Android', 'iOS', 'Web', 'Desktop',
  'Git', 'GitHub Actions', 'Figma',
];

export default function ProfileEditor({ profile, onProfileChange, uid }: ProfileEditorProps) {
  const [saved, setSaved]       = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newRole, setNewRole]   = useState('');
  const [newLoc, setNewLoc]     = useState('');

  function update(patch: Partial<DeveloperProfile>) {
    onProfileChange({ ...profile, ...patch });
  }

  function addSkill(skill: string) {
    const s = skill.trim();
    if (s && !profile.skills.includes(s)) {
      update({ skills: [...profile.skills, s] });
    }
  }

  function removeSkill(skill: string) {
    update({ skills: profile.skills.filter(s => s !== skill) });
  }

  function addRole() {
    const r = newRole.trim();
    if (r && !profile.preferredRoles.includes(r)) {
      update({ preferredRoles: [...profile.preferredRoles, r] });
      setNewRole('');
    }
  }

  function addLocation() {
    const l = newLoc.trim();
    if (l && !profile.preferredLocations.includes(l)) {
      update({ preferredLocations: [...profile.preferredLocations, l] });
      setNewLoc('');
    }
  }

  async function handleSave() {
    setError('');
    setSaving(true);
    try {
      saveProfileLocal(profile);
      if (uid) await saveProfile(uid, profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors";
  const labelClass = "block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="text-cyan-400" size={24} />
            My Profile
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            The AI uses this to personalise every pitch. Be specific — it pays off.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          {saved ? <CheckCheck size={15} className="text-emerald-300" /> : <Save size={15} />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Profile'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Basic info */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-white font-semibold text-sm">Basic Information</h2>

          <div>
            <label className={labelClass}>Full Name</label>
            <input
              type="text"
              placeholder="e.g. Alex Chen"
              value={profile.name}
              onChange={e => update({ name: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={profile.email}
              onChange={e => update({ email: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Years of Flutter Experience</label>
            <input
              type="number"
              min={0}
              max={20}
              value={profile.yearsOfExperience}
              onChange={e => update({ yearsOfExperience: Number(e.target.value) })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Professional Bio</label>
            <textarea
              placeholder="2-3 sentences about what you build, your strengths, and what makes you stand out as a Flutter dev…"
              value={profile.bio}
              onChange={e => update({ bio: e.target.value })}
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        {/* Links & preferences */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-white font-semibold text-sm">Links & Preferences</h2>

          <div>
            <label className={labelClass}>GitHub</label>
            <div className="relative">
              <Github size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="url"
                placeholder="https://github.com/yourusername"
                value={profile.githubUrl ?? ''}
                onChange={e => update({ githubUrl: e.target.value })}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>LinkedIn</label>
            <div className="relative">
              <Linkedin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="url"
                placeholder="https://linkedin.com/in/yourhandle"
                value={profile.linkedinUrl ?? ''}
                onChange={e => update({ linkedinUrl: e.target.value })}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Portfolio / Website</label>
            <div className="relative">
              <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="url"
                placeholder="https://yourportfolio.dev"
                value={profile.portfolioUrl ?? ''}
                onChange={e => update({ portfolioUrl: e.target.value })}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="remote"
              checked={profile.openToRemote}
              onChange={e => update({ openToRemote: e.target.checked })}
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
            <label htmlFor="remote" className="text-gray-300 text-sm cursor-pointer">
              Open to remote work
            </label>
          </div>

          {/* Preferred Roles */}
          <div>
            <label className={labelClass}>Preferred Roles</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {profile.preferredRoles.map(r => (
                <span key={r} className="flex items-center gap-1 bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
                  {r}
                  <button onClick={() => update({ preferredRoles: profile.preferredRoles.filter(x => x !== r) })}>
                    <X size={10} className="hover:text-red-400" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Senior Flutter Dev"
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addRole()}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
              <button onClick={addRole} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors">
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Preferred Locations */}
          <div>
            <label className={labelClass}>Preferred Locations</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {profile.preferredLocations.map(l => (
                <span key={l} className="flex items-center gap-1 bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
                  {l}
                  <button onClick={() => update({ preferredLocations: profile.preferredLocations.filter(x => x !== l) })}>
                    <X size={10} className="hover:text-red-400" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Remote, New York, London"
                value={newLoc}
                onChange={e => setNewLoc(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addLocation()}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
              <button onClick={addLocation} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors">
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-white font-semibold text-sm">Technical Skills</h2>

        {/* Selected skills */}
        <div className="flex flex-wrap gap-2 min-h-[40px]">
          {profile.skills.map(skill => (
            <span key={skill} className="flex items-center gap-1.5 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs px-3 py-1.5 rounded-full font-medium">
              {skill}
              <button onClick={() => removeSkill(skill)} className="hover:text-red-400 transition-colors">
                <X size={10} />
              </button>
            </span>
          ))}
          {profile.skills.length === 0 && (
            <p className="text-gray-600 text-xs">No skills added yet. Click below to add.</p>
          )}
        </div>

        {/* Quick-add common skills */}
        <div>
          <p className="text-gray-500 text-xs mb-2">Quick-add:</p>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_SKILLS.filter(s => !profile.skills.includes(s)).map(skill => (
              <button
                key={skill}
                onClick={() => addSkill(skill)}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-400 hover:text-white text-xs px-2.5 py-1 rounded-full transition-all"
              >
                + {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Custom skill input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a custom skill…"
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { addSkill(newSkill); setNewSkill(''); } }}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => { addSkill(newSkill); setNewSkill(''); }}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* API keys notice */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h2 className="text-white font-semibold text-sm mb-3">API Keys Setup</h2>
        <div className="space-y-2 text-sm text-gray-400">
          <p>Create a <code className="bg-gray-800 px-1.5 py-0.5 rounded text-cyan-400 text-xs">.env</code> file in the project root with these keys:</p>
          <pre className="bg-gray-800 rounded-xl p-4 text-xs text-gray-300 overflow-x-auto font-mono leading-relaxed">
{`VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional — for profile sync across devices
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=`}
          </pre>
          <p className="text-gray-600 text-xs">
            Get your Gemini API key at{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
              aistudio.google.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
