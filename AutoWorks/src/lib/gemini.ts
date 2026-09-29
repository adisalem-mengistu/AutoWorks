import { GoogleGenerativeAI } from '@google/generative-ai';
import type { DeveloperProfile, JobListing, Lead, LeadStrategy } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? '';

function getClient() {
  if (!API_KEY) throw new Error('VITE_GEMINI_API_KEY is not set in your .env file.');
  return new GoogleGenerativeAI(API_KEY);
}

// ─── Job Search ───────────────────────────────────────────────────────────────

export async function searchFlutterJobs(
  query: string,
  location: string,
  jobType: string
): Promise<JobListing[]> {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const prompt = `
You are a Flutter job search agent. Search for live Flutter developer job listings and return a JSON array of job objects.

Search query: "${query}"
Location filter: "${location || 'Worldwide / Remote'}"
Job type filter: "${jobType || 'Any'}"

Return ONLY a valid JSON array (no markdown, no explanation) with up to 10 jobs in this exact shape:
[
  {
    "id": "unique-id-string",
    "title": "Job title",
    "company": "Company name",
    "location": "City, Country or Remote",
    "type": "Full-time | Part-time | Contract | Remote",
    "salary": "e.g. $80k-$120k or null",
    "description": "2-3 sentence overview of the role",
    "requirements": ["Requirement 1", "Requirement 2", "Requirement 3"],
    "aiSummary": "One sentence AI analysis of whether this is a good Flutter opportunity",
    "matchScore": 85,
    "url": "https://example-job-board.com/job/123",
    "postedDate": "2024-01-15",
    "source": "LinkedIn / Indeed / Glassdoor / etc."
  }
]

Focus on real, realistic, currently-hiring Flutter developer roles. Include a variety of companies (startups and enterprises). Be specific and realistic with requirements (Flutter, Dart, BLoC, Riverpod, GetX, Firebase, REST APIs, etc.).`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(text) as JobListing[];
  } catch {
    // Try to extract JSON array if wrapped in markdown
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]) as JobListing[];
    throw new Error('Failed to parse job listings from AI response.');
  }
}

// ─── Lead Prospector ──────────────────────────────────────────────────────────

export async function findLeads(
  strategy: LeadStrategy,
  targetCompany: string,
  count: number = 8
): Promise<Lead[]> {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const strategyLabel: Record<LeadStrategy, string> = {
    active_hiring:    'companies actively hiring Flutter developers',
    recruiters:       'technical recruiters who place mobile / Flutter developers',
    decision_makers:  'CTOs, VPs of Engineering, or Heads of Mobile who make hiring decisions',
  };

  const prompt = `
You are a lead prospector agent specialising in the Flutter developer job market. Your job is to find real-ish contact leads for ${strategyLabel[strategy]}.
${targetCompany ? `Focus on or around the company: "${targetCompany}".` : 'Target a variety of companies globally.'}

Return ONLY a valid JSON array (no markdown, no explanation) with exactly ${count} leads in this shape:
[
  {
    "id": "unique-id-string",
    "name": "Full Name",
    "title": "Job Title",
    "company": "Company Name",
    "email": "firstname.lastname@company.com",
    "linkedin": "https://linkedin.com/in/handle",
    "twitter": "https://twitter.com/handle or null",
    "source": "LinkedIn | Twitter | Company Website | GitHub",
    "sourceSnippet": "The original context snippet or post excerpt that reveals this person is relevant (1-2 sentences)",
    "strategy": "${strategy}",
    "addedAt": "${new Date().toISOString()}"
  }
]

Make the leads realistic. Use plausible names, proper email formats, and real-sounding companies in the Flutter ecosystem.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(text) as Lead[];
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]) as Lead[];
    throw new Error('Failed to parse leads from AI response.');
  }
}

// ─── Cold-Pitch Email Composer ────────────────────────────────────────────────

export async function generateColdEmail(
  profile: DeveloperProfile,
  target: { lead?: Lead; job?: JobListing; customTo?: string }
): Promise<{ subject: string; body: string }> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const recipientContext = target.lead
    ? `Recipient: ${target.lead.name}, ${target.lead.title} at ${target.lead.company}`
    : target.job
    ? `Applying for: ${target.job.title} at ${target.job.company}`
    : `Recipient: ${target.customTo ?? 'Hiring Manager'}`;

  const jobContext = target.job
    ? `\nJob requirements: ${target.job.requirements.join(', ')}\nJob description: ${target.job.description}`
    : '';

  const prompt = `
You are an expert career coach who writes hyper-personalised cold outreach emails for Flutter developers.

Developer Profile:
- Name: ${profile.name}
- Years of experience: ${profile.yearsOfExperience}
- Skills: ${profile.skills.join(', ')}
- Bio: ${profile.bio}
- GitHub: ${profile.githubUrl ?? 'Not provided'}
- Portfolio: ${profile.portfolioUrl ?? 'Not provided'}
- LinkedIn: ${profile.linkedinUrl ?? 'Not provided'}
- Preferred roles: ${profile.preferredRoles.join(', ')}

${recipientContext}${jobContext}

Write a concise, professional cold-pitch email (NOT a cover letter). It should:
1. Open with a personalised hook referencing the company or recipient's work
2. Highlight 2-3 directly relevant Flutter/Dart skills from the profile
3. Include one specific achievement or project if possible (infer from bio/skills)
4. Have a clear, low-friction call to action (15-minute call or reply)
5. Be under 200 words total — respect their time
6. Sound human, confident, and not desperate

Return ONLY this JSON (no markdown):
{
  "subject": "Email subject line",
  "body": "Full email body with line breaks as \\n"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const parsed = JSON.parse(text);
    return { subject: parsed.subject, body: parsed.body };
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return { subject: parsed.subject, body: parsed.body };
    }
    throw new Error('Failed to parse email draft from AI response.');
  }
}
