import { useState } from 'react';
import {
  Mail, Loader2, Sparkles, Copy, CheckCheck, ExternalLink,
  AlertCircle, User, Briefcase, Edit3, Send
} from 'lucide-react';
import { generateColdEmail } from '../lib/gemini';
import type { DeveloperProfile, JobListing, Lead } from '../types';

interface ColdPitchEngineProps {
  profile: DeveloperProfile;
  prefilledJob?: JobListing | null;
  prefilledLead?: Lead | null;
  onClearPrefill: () => void;
}

export default function ColdPitchEngine({ profile, prefilledJob, prefilledLead, onClearPrefill }: ColdPitchEngineProps) {
  const [customTo, setCustomTo]   = useState('');
  const [subject, setSubject]     = useState('');
  const [body, setBody]           = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [copied, setCopied]       = useState(false);
  const [editMode, setEditMode]   = useState(false);

  const hasProfile = profile.name && profile.skills.length > 0;

  async function generate() {
    if (!hasProfile) {
      setError('Please complete your Developer Profile first so the AI can personalise the pitch.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await generateColdEmail(profile, {
        lead: prefilledLead ?? undefined,
        job:  prefilledJob  ?? undefined,
        customTo: customTo || undefined,
      });
      setSubject(result.subject);
      setBody(result.body);
      setEditMode(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Email generation failed.');
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openGmail() {
    const recipientEmail = prefilledLead?.email ?? customTo ?? '';
    const params = new URLSearchParams({
      to:      recipientEmail,
      su:      subject,
      body:    body,
    });
    window.open(`https://mail.google.com/mail/u/0/?view=cm&fs=1&${params.toString()}`, '_blank');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Mail className="text-cyan-400" size={24} />
          AI Cold-Pitch Engine
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Hyper-personalised cold emails powered by your developer profile.
        </p>
      </div>

      {/* Context badges */}
      <div className="flex gap-2 flex-wrap">
        {prefilledJob && (
          <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-2">
            <Briefcase size={13} className="text-cyan-400" />
            <span className="text-cyan-300 text-xs font-medium">{prefilledJob.title} @ {prefilledJob.company}</span>
            <button onClick={onClearPrefill} className="text-gray-500 hover:text-white ml-1">×</button>
          </div>
        )}
        {prefilledLead && (
          <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-lg px-3 py-2">
            <User size={13} className="text-purple-400" />
            <span className="text-purple-300 text-xs font-medium">{prefilledLead.name} @ {prefilledLead.company}</span>
            <button onClick={onClearPrefill} className="text-gray-500 hover:text-white ml-1">×</button>
          </div>
        )}
        {!prefilledJob && !prefilledLead && (
          <p className="text-gray-500 text-xs">
            No context loaded — pitch will be a general cold email, or enter a recipient below.
          </p>
        )}
      </div>

      {!hasProfile && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex gap-3">
          <AlertCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-amber-300 text-sm">
            Your profile is incomplete. Head to <strong>My Profile</strong> and add your name, skills, and bio to unlock personalised pitches.
          </p>
        </div>
      )}

      {/* Compose area */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
        {/* Custom recipient */}
        {!prefilledLead && (
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              placeholder="Recipient email (optional — or load a lead from the Prospector)"
              value={customTo}
              onChange={e => setCustomTo(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        )}

        <button
          onClick={generate}
          disabled={loading || !hasProfile}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-all"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Crafting your pitch…</>
          ) : (
            <><Sparkles size={16} /> Generate Cold Pitch</>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Generated email */}
      {(subject || body) && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Generated Email</p>
            <div className="flex gap-2">
              <button
                onClick={() => setEditMode(!editMode)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  editMode ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' : 'border-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                <Edit3 size={12} /> {editMode ? 'Done' : 'Edit'}
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 text-xs border border-gray-700 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-all"
              >
                {copied ? <CheckCheck size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={openGmail}
                className="flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                <ExternalLink size={12} />
                Open in Gmail
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Subject */}
            <div>
              <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-1.5">Subject</label>
              {editMode ? (
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
              ) : (
                <p className="text-white text-sm font-medium bg-gray-800 rounded-lg px-3 py-2.5">{subject}</p>
              )}
            </div>

            {/* Body */}
            <div>
              <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-1.5">Body</label>
              {editMode ? (
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={14}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white font-mono leading-relaxed focus:outline-none focus:border-cyan-500 transition-colors resize-y"
                />
              ) : (
                <div className="bg-gray-800 rounded-lg px-4 py-4 text-sm text-gray-200 whitespace-pre-line leading-relaxed font-mono">
                  {body}
                </div>
              )}
            </div>
          </div>

          {/* Quick send strip */}
          <div className="border-t border-gray-800 px-5 py-3 flex items-center justify-between">
            <p className="text-gray-600 text-xs">
              Tip: Click "Edit" to tweak before sending.
            </p>
            <button
              onClick={openGmail}
              className="flex items-center gap-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              <Send size={12} /> Send via Gmail
            </button>
          </div>
        </div>
      )}

      {!subject && !body && !loading && !error && (
        <div className="text-center py-16 text-gray-600">
          <Mail size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Click "Generate Cold Pitch" above to create a personalised email.</p>
          <p className="text-xs mt-1 text-gray-700">Load a job or lead first for best results.</p>
        </div>
      )}
    </div>
  );
}
