import { useState, useRef } from 'react';
import {
  Users, Loader2, Search, Infinity, Zap, Linkedin, Twitter,
  Mail, Copy, CheckCheck, Trash2, ExternalLink, AlertCircle, Target
} from 'lucide-react';
import { findLeads } from '../lib/gemini';
import { saveLeadsLocal } from '../lib/storage';
import type { Lead, LeadStrategy, InfinitySession } from '../types';

interface LeadProspectorProps {
  leads: Lead[];
  onLeadsChange: (leads: Lead[]) => void;
  onDraftEmail: (lead: Lead) => void;
}

const STRATEGIES: { id: LeadStrategy; label: string; desc: string }[] = [
  { id: 'active_hiring',   label: 'Active Hiring',    desc: 'Companies currently posting Flutter roles' },
  { id: 'recruiters',      label: 'Recruiters',       desc: 'Technical recruiters placing mobile devs' },
  { id: 'decision_makers', label: 'Decision Makers',  desc: 'CTOs, VPs, Heads of Mobile who hire directly' },
];

export default function LeadProspector({ leads, onLeadsChange, onDraftEmail }: LeadProspectorProps) {
  const [strategy, setStrategy]     = useState<LeadStrategy>('recruiters');
  const [company, setCompany]       = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [copied, setCopied]         = useState('');
  const [infinity, setInfinity]     = useState<InfinitySession>({ running: false, batchCount: 0, totalFound: 0 });
  const infinityRef                 = useRef(false);

  const selectedLeads = leads.filter(l => l.selected);

  async function handleSearch() {
    setError('');
    setLoading(true);
    try {
      const newLeads = await findLeads(strategy, company, 8);
      const merged = dedupe([...leads, ...newLeads]);
      onLeadsChange(merged);
      saveLeadsLocal(merged);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lead search failed.');
    } finally {
      setLoading(false);
    }
  }

  async function startInfinity() {
    infinityRef.current = true;
    setInfinity({ running: true, batchCount: 0, totalFound: leads.length });
    let batch = 0;

    while (infinityRef.current) {
      try {
        const newLeads = await findLeads(strategy, company, 5);
        batch++;
        onLeadsChange(prev => {
          const merged = dedupe([...prev, ...newLeads]);
          saveLeadsLocal(merged);
          setInfinity({ running: true, batchCount: batch, totalFound: merged.length });
          return merged;
        });
        // Throttle: wait 4 seconds between batches
        await new Promise(r => setTimeout(r, 4000));
      } catch {
        break;
      }
    }
    setInfinity(s => ({ ...s, running: false }));
  }

  function stopInfinity() {
    infinityRef.current = false;
    setInfinity(s => ({ ...s, running: false }));
  }

  function dedupe(arr: Lead[]) {
    const seen = new Set<string>();
    return arr.filter(l => {
      const key = (l.email ?? l.linkedin ?? l.name + l.company).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function toggleSelect(id: string) {
    onLeadsChange(leads.map(l => l.id === id ? { ...l, selected: !l.selected } : l));
  }

  function toggleAll() {
    const allSelected = leads.length > 0 && leads.every(l => l.selected);
    onLeadsChange(leads.map(l => ({ ...l, selected: !allSelected })));
  }

  function removeLead(id: string) {
    const next = leads.filter(l => l.id !== id);
    onLeadsChange(next);
    saveLeadsLocal(next);
  }

  function clearAll() {
    onLeadsChange([]);
    saveLeadsLocal([]);
  }

  async function copyEmails() {
    const emails = selectedLeads.map(l => l.email).filter(Boolean).join(', ');
    await navigator.clipboard.writeText(emails);
    setCopied('emails');
    setTimeout(() => setCopied(''), 2000);
  }

  async function copyAll() {
    const text = selectedLeads.map(l =>
      `${l.name} | ${l.title} | ${l.company} | ${l.email ?? 'N/A'} | ${l.linkedin ?? 'N/A'}`
    ).join('\n');
    await navigator.clipboard.writeText(text);
    setCopied('all');
    setTimeout(() => setCopied(''), 2000);
  }

  const strategyColor: Record<LeadStrategy, string> = {
    active_hiring:   'text-emerald-400',
    recruiters:      'text-cyan-400',
    decision_makers: 'text-purple-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="text-cyan-400" size={24} />
          Lead Prospector
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Find direct contact info for hiring managers and recruiters.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
        {/* Strategy */}
        <div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Strategy</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {STRATEGIES.map(s => (
              <button
                key={s.id}
                onClick={() => setStrategy(s.id)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  strategy === s.id
                    ? 'border-cyan-500/50 bg-cyan-500/10'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <p className={`font-semibold text-sm ${strategy === s.id ? 'text-white' : 'text-gray-300'}`}>
                  {s.label}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Target company */}
        <div className="relative">
          <Target size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Target company (optional) — e.g. Shopify, Invertase…"
            value={company}
            onChange={e => setCompany(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            disabled={loading || infinity.running}
            className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            {loading ? 'Prospecting…' : 'Find Leads'}
          </button>

          {infinity.running ? (
            <button
              onClick={stopInfinity}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Stop
            </button>
          ) : (
            <button
              onClick={startInfinity}
              disabled={loading}
              title="Infinity Mode — continuously crawls for new leads"
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              <Infinity size={16} />
              Infinity
            </button>
          )}
        </div>

        {infinity.running && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 flex items-center gap-3">
            <Zap size={16} className="text-purple-400 animate-bounce" />
            <div>
              <p className="text-purple-300 text-sm font-medium">Infinity Mode Active</p>
              <p className="text-purple-400/70 text-xs">
                Batch {infinity.batchCount} — {infinity.totalFound} leads total
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Bulk actions */}
      {leads.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={leads.length > 0 && leads.every(l => l.selected)}
              onChange={toggleAll}
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
            <span className="text-gray-400 text-sm">
              {selectedLeads.length > 0 ? `${selectedLeads.length} selected` : `${leads.length} leads`}
            </span>
          </div>

          {selectedLeads.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={copyEmails}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 px-3 py-1.5 rounded-lg transition-all"
              >
                {copied === 'emails' ? <CheckCheck size={13} className="text-emerald-400" /> : <Mail size={13} />}
                Copy emails
              </button>
              <button
                onClick={copyAll}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 px-3 py-1.5 rounded-lg transition-all"
              >
                {copied === 'all' ? <CheckCheck size={13} className="text-emerald-400" /> : <Copy size={13} />}
                Copy all details
              </button>
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 px-3 py-1.5 rounded-lg transition-all"
              >
                <Trash2 size={13} />
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {/* Lead cards */}
      {leads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {leads.map(lead => (
            <div
              key={lead.id}
              className={`bg-gray-900 border rounded-2xl p-4 transition-all ${
                lead.selected ? 'border-cyan-500/50' : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={!!lead.selected}
                  onChange={() => toggleSelect(lead.id)}
                  className="w-4 h-4 accent-cyan-500 cursor-pointer mt-1 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-white font-semibold text-sm">{lead.name}</p>
                      <p className="text-gray-400 text-xs">{lead.title}</p>
                      <p className={`text-xs font-medium mt-0.5 ${strategyColor[lead.strategy]}`}>{lead.company}</p>
                    </div>
                    <button
                      onClick={() => removeLead(lead.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Contact links */}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs transition-colors">
                        <Mail size={11} /> {lead.email}
                      </a>
                    )}
                    {lead.linkedin && (
                      <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs transition-colors">
                        <Linkedin size={11} /> LinkedIn
                      </a>
                    )}
                    {lead.twitter && (
                      <a href={lead.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sky-400 hover:text-sky-300 text-xs transition-colors">
                        <Twitter size={11} /> Twitter
                      </a>
                    )}
                  </div>

                  {/* Source snippet */}
                  <p className="text-gray-600 text-xs mt-2 italic line-clamp-2">"{lead.sourceSnippet}"</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ExternalLink size={10} className="text-gray-600" />
                    <span className="text-gray-600 text-xs">{lead.source}</span>
                  </div>

                  <button
                    onClick={() => onDraftEmail(lead)}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/30 text-cyan-400 py-1.5 rounded-lg transition-all font-medium"
                  >
                    <Mail size={12} /> Draft cold pitch
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div className="text-center py-16 text-gray-600">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No leads yet. Run a search or start Infinity Mode.</p>
          </div>
        )
      )}
    </div>
  );
}
