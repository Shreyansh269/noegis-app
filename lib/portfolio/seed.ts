import type { Portfolio } from './schema'

/**
 * Placeholder content inserted on first run. Every value marked
 * "[Placeholder]" is meant to be replaced from the Admin dashboard.
 */
export const SEED_PORTFOLIO: Portfolio = {
  profile: {
    fullName: 'Shreyansh Srivastava',
    portfolioId: 'SS-2026-001',
    title: 'Your Professional Title',
    tagline: '[Placeholder] A one-line statement about the value you bring to clients and teams.',
    about:
      '[Placeholder] Write a short introduction here — who you are, what you specialise in, and what kind of work you are looking for. Edit this from the Admin dashboard.',
    email: 'hello@example.com',
    phone: '+91 00000 00000',
    location: 'Lucknow, India',
    photoUrl: '',
    socials: [
      { id: 'seed-linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/' },
      { id: 'seed-github', label: 'GitHub', url: 'https://github.com/' },
    ],
  },
  qualifications: [
    {
      id: 'seed-qual-1',
      title: '[Placeholder] Bachelor of Technology',
      institution: 'Your University',
      years: '2020 — 2024',
      details: 'Describe your specialisation, key coursework, or achievements.',
    },
  ],
  skills: [
    {
      id: 'seed-skill-1',
      name: '[Placeholder] Web Development',
      description: 'Describe a skill or service you offer and the results it delivers.',
      level: 85,
    },
  ],
  projects: [
    {
      id: 'seed-project-1',
      title: '[Placeholder] Sample Project',
      description: 'A short summary of the problem, your role, and the outcome.',
      tags: ['Next.js', 'Design'],
      projectUrl: 'https://example.com',
      videoUrl: '',
      coverUrl: '',
    },
  ],
  videos: [
    {
      id: 'seed-video-1',
      title: '[Placeholder] Sample Video',
      description: 'Replace with a YouTube or Vimeo link to your own work.',
      url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    },
  ],
  pricing: [
    {
      id: 'seed-plan-1',
      name: '[Placeholder] Starter',
      price: '₹5,000',
      unit: 'per project',
      features: ['Feature one', 'Feature two', 'Feature three'],
      featured: true,
    },
  ],
  settings: {
    seoTitle: 'Shreyansh Srivastava — Portfolio',
    metaDescription: 'Portfolio of Shreyansh Srivastava — projects, skills, qualifications and pricing.',
    ogImageUrl: '',
    sections: {
      about: true,
      qualifications: true,
      skills: true,
      projects: true,
      videos: true,
      pricing: true,
      contact: true,
    },
  },
}
