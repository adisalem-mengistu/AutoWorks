import { useState } from 'react';
import {
  Search, Loader2, Briefcase, MapPin, Clock, DollarSign,
  ExternalLink, Sparkles, ChevronDown, ChevronUp, Send, AlertCircle
} from 'lucide-react';
import { searchFlutterJobs } from '../lib/gemini';
import type { JobListing } from '../types';

interface JobGeneratorProps {
  onDraftEmail: (job: JobListing) => void;
}

const JOB_TYPES = ['Any', 'Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];

export default function JobGenerator({ onDraftEmail }: JobGeneratorProps) {
  const [query, setQuery]       = useState('Senior Flutter Developer');
  const [location, setLocation] = useState('');
  const [jobType, setJobType]   = useState('Any');
  const [jobs, setJobs]         = useState<JobListing[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setJobs([]);
    try {
      const results = await searchFlutterJobs(query, location, jobType);
      setJobs(results);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Search failed. Check your Gemini API key.');
    } finally {
      setLoading(false);
    }
  }

  function scoreColor(score?: number) {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  }

  function scoreBg(score?: number) {
    if (!score) return 'bg-gray-500/10 border-gray-500/30';
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/30';
    if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-red-500/10 border-red-500/30';
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Briefcase className="text-cyan-400" size={24} />
          Job Generator
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          AI-powered Flutter job search grounded in real-time web data.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="e.g. Senior Flutter Developer, Flutter + Firebase…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <div className="relative">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Location (or leave blank for remote)"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-gray-400 text-xs font-medium">Job type:</span>
          {JOB_TYPES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setJobType(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                jobType === t
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Scanning the web…</>
          ) : (
            <><Sparkles size={16} /> Search with AI</>
          )}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {jobs.length > 0 && (
        <div className="space-y-3">
          <p className="text-gray-400 text-sm">{jobs.length} listings found</p>
          {jobs.map(job => (
            <div key={job.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all">
              {/* Card header */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-base truncate">{job.title}</h3>
                    <p className="text-cyan-400 text-sm mt-0.5">{job.company}</p>
                  </div>
                  {job.matchScore !== undefined && (
                    <div className={`shrink-0 px-2.5 py-1 rounded-full border text-xs font-bold ${scoreBg(job.matchScore)}`}>
                      <span className={scoreColor(job.matchScore)}>{job.matchScore}% match</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  {job.location && (
                    <span className="flex items-center gap-1 text-gray-400 text-xs">
                      <MapPin size={11} /> {job.location}
                    </span>
                  )}
                  {job.type && (
                    <span className="flex items-center gap-1 text-gray-400 text-xs">
                      <Clock size={11} /> {job.type}
                    </span>
                  )}
                  {job.salary && (
                    <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                      <DollarSign size={11} /> {job.salary}
                    </span>
                  )}
                  <span className="text-gray-600 text-xs">{job.source}</span>
                </div>

                {/* AI Summary */}
                {job.aiSummary && (
                  <div className="mt-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg px-3 py-2 flex gap-2">
                    <Sparkles size={13} className="text-cyan-400 mt-0.5 shrink-0" />
                    <p className="text-cyan-300 text-xs">{job.aiSummary}</p>
                  </div>
                )}
              </div>

              {/* Expandable details */}
              <div className="border-t border-gray-800">
                <button
                  onClick={() => setExpanded(expanded === job.id ? null : job.id)}
                  className="w-full flex items-center justify-between px-5 py-2.5 text-gray-400 hover:text-white text-xs font-medium transition-colors"
                >
                  <span>View details</span>
                  {expanded === job.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {expanded === job.id && (
                  <div className="px-5 pb-5 space-y-4">
                    <p className="text-gray-300 text-sm leading-relaxed">{job.description}</p>
                    {job.requirements.length > 0 && (
                      <div>
                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Requirements</p>
                        <ul className="space-y-1">
                          {job.requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                              <span className="text-cyan-500 mt-1">•</span> {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      {job.url && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 px-3 py-2 rounded-lg transition-all"
                        >
                          <ExternalLink size={13} /> View posting
                        </a>
                      )}
                      <button
                        onClick={() => onDraftEmail(job)}
                        className="flex items-center gap-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-2 rounded-lg transition-colors font-medium"
                      >
                        <Send size={13} /> Draft cold pitch
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && jobs.length === 0 && !error && (
        <div className="text-center py-16 text-gray-600">
          <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Enter a query above and click Search to find Flutter jobs.</p>
        </div>
      )}
    </div>
  );
}
