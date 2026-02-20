interface ProfileInput {
  fullName: string
  company: string
  title: string
  industry: string
  description: string
}

interface ActivityItem {
  type: 'blog' | 'podcast' | 'linkedin' | 'twitter' | 'investment'
  title: string
  source: string
  date: string
}

export interface InsightData {
  currentThesis: string
  interests: string[]
  recentActivity: ActivityItem[]
  investmentFocus: string
  confidence: number
  sources: string[]
}

// Simple hash for deterministic but varied output per profile
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash)
}

function pick<T>(arr: T[], hash: number, count: number): T[] {
  const result: T[] = []
  for (let i = 0; i < count && i < arr.length; i++) {
    result.push(arr[(hash + i * 7) % arr.length])
  }
  return result
}

const thesisTemplates: Record<string, string[]> = {
  SaaS: [
    '{name} has been increasingly vocal about the convergence of AI and vertical SaaS, arguing that domain-specific LLMs will replace horizontal platforms within 3-5 years. Their recent activity suggests a strong focus on developer tooling and infrastructure automation.',
    '{name} is currently focused on the next wave of B2B SaaS — specifically composable architectures and API-first platforms. They believe the "all-in-one" era is ending in favor of best-of-breed integrations powered by AI orchestration layers.',
    '{name} has shifted their thesis toward product-led growth combined with AI-native features. Their recent writings emphasize that the most defensible SaaS companies will be those that generate proprietary data flywheels through daily user interactions.',
  ],
  Healthcare: [
    '{name} is deeply focused on the intersection of AI and clinical decision support. They believe the biggest opportunity in healthcare tech is reducing administrative burden through intelligent automation, not replacing clinicians.',
    '{name} has been championing interoperability as the key unlock for health tech. Their recent talks emphasize FHIR-native platforms and the shift from EHR-centric to patient-centric data models.',
    '{name} is bullish on digital therapeutics and remote patient monitoring. They see the post-pandemic telehealth correction as a buying opportunity for platforms that can demonstrate real clinical outcomes.',
  ],
  Finance: [
    '{name} is currently excited about embedded finance and the unbundling of traditional banking services. Their thesis centers on infrastructure layers that let any software company offer financial products.',
    '{name} has pivoted their focus toward real-time payment infrastructure and cross-border settlement. They see significant opportunity in emerging markets where mobile-first financial services are leapfrogging traditional banking.',
    '{name} is focused on the intersection of AI and risk management. They believe the next generation of fintech winners will be companies that can underwrite in real-time using alternative data signals.',
  ],
  'E-commerce': [
    '{name} is bullish on the shift from marketplace to direct-to-consumer infrastructure. Their recent activity highlights a focus on supply chain intelligence and real-time demand forecasting powered by AI.',
    '{name} has been focused on social commerce and the creator economy as distribution channels. They believe the future of e-commerce is conversational, with AI agents handling product discovery and checkout.',
  ],
  Education: [
    '{name} is excited about AI tutoring systems that adapt in real-time to individual learning styles. Their thesis is that personalized education at scale will be the biggest impact of generative AI.',
    '{name} is focused on workforce reskilling platforms, particularly for the AI transition. They see a massive opportunity in upskilling programs that combine cohort-based learning with hands-on project work.',
  ],
  Technology: [
    '{name} is focused on developer infrastructure and the rise of AI-augmented software development. They believe coding copilots are just the beginning — the real opportunity is in AI-driven testing, deployment, and observability.',
    '{name} has been increasingly vocal about edge computing and the decentralization of cloud infrastructure. Their thesis centers on latency-sensitive applications that require processing closer to the data source.',
  ],
  Transportation: [
    '{name} is deeply invested in the logistics technology space, particularly autonomous fleet management and last-mile delivery optimization. They see AI route planning as a trillion-dollar efficiency unlock.',
  ],
  Energy: [
    '{name} is focused on grid modernization and the software layer for renewable energy management. Their thesis is that the energy transition will be won by platforms that can balance supply and demand in real-time.',
  ],
}

const interestPools: Record<string, string[]> = {
  SaaS: ['vertical SaaS', 'AI-native products', 'developer experience', 'platform engineering', 'product-led growth', 'API-first architecture', 'composable software', 'usage-based pricing', 'cloud infrastructure', 'data engineering'],
  Healthcare: ['clinical AI', 'digital therapeutics', 'health data interoperability', 'remote patient monitoring', 'EHR modernization', 'patient engagement', 'value-based care', 'FDA digital health', 'mental health tech', 'precision medicine'],
  Finance: ['embedded finance', 'real-time payments', 'DeFi infrastructure', 'neobanking', 'insurtech', 'credit AI', 'cross-border payments', 'regulatory technology', 'alternative lending', 'wealth tech'],
  'E-commerce': ['social commerce', 'supply chain AI', 'headless commerce', 'conversational shopping', 'demand forecasting', 'creator economy', 'live shopping', 'sustainable retail'],
  Education: ['AI tutoring', 'workforce reskilling', 'cohort-based learning', 'credentialing platforms', 'enterprise L&D', 'adaptive learning', 'skill assessment AI'],
  Technology: ['developer tools', 'AI infrastructure', 'edge computing', 'observability', 'security automation', 'MLOps', 'low-code platforms', 'cloud-native'],
  Transportation: ['autonomous logistics', 'fleet management', 'last-mile delivery', 'route optimization', 'EV infrastructure', 'supply chain visibility'],
  Energy: ['grid modernization', 'renewable energy software', 'carbon accounting', 'energy storage', 'demand response', 'smart grid AI'],
}

function generateActivities(profile: ProfileInput, hash: number): ActivityItem[] {
  const name = profile.fullName.split(' ')[0]
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const recentMonth = months[(hash % 3) + 9] // Oct-Dec
  const olderMonth = months[(hash % 4) + 5]  // Jun-Sep

  const blogTopics = [
    `Why ${profile.industry} Needs an AI-First Approach in 2026`,
    `The Future of ${profile.title.includes('VP') ? 'Engineering Leadership' : 'Product Strategy'} in the Age of AI`,
    `Lessons from Scaling ${profile.company} to 100+ Enterprise Customers`,
    `What Most People Get Wrong About ${profile.industry} Technology`,
    `Building High-Performance Teams at ${profile.company}`,
  ]

  const podcastTopics = [
    `"Rethinking ${profile.industry}" on The Startup Podcast`,
    `"Inside ${profile.company}" — How We Built Our Platform`,
    `Guest on SaaStr Sessions: ${profile.industry} Trends for 2026`,
    `"The AI Revolution in ${profile.industry}" on Tech Talk Daily`,
  ]

  const linkedinTopics = [
    `Shared insights on ${profile.industry.toLowerCase()} market trends and the role of AI in transforming traditional workflows`,
    `Posted about the future of ${profile.title.toLowerCase().includes('engineer') ? 'platform architecture' : 'go-to-market strategy'} and lessons from ${profile.company}`,
    `Engaged in discussion about hiring practices and building engineering culture at scale`,
  ]

  const twitterTopics = [
    `Thread on why ${profile.industry.toLowerCase()} is at an inflection point — "We're seeing a 10x shift in how companies buy software"`,
    `Reacted to industry news about AI regulation, shared perspective from ${profile.company}`,
  ]

  const activities: ActivityItem[] = [
    {
      type: 'blog',
      title: blogTopics[hash % blogTopics.length],
      source: `${profile.fullName.toLowerCase().replace(/\s/g, '')}.substack.com`,
      date: `${recentMonth} 2025`,
    },
    {
      type: 'podcast',
      title: podcastTopics[(hash + 1) % podcastTopics.length],
      source: 'Spotify / Apple Podcasts',
      date: `${recentMonth} 2025`,
    },
    {
      type: 'linkedin',
      title: linkedinTopics[(hash + 2) % linkedinTopics.length],
      source: 'LinkedIn',
      date: `${olderMonth} 2025`,
    },
    {
      type: 'twitter',
      title: twitterTopics[hash % twitterTopics.length],
      source: 'X (Twitter)',
      date: `${olderMonth} 2025`,
    },
  ]

  // Return 3-4 items based on hash
  return activities.slice(0, 3 + (hash % 2))
}

function generateSources(profile: ProfileInput, hash: number): string[] {
  const slug = profile.fullName.toLowerCase().replace(/\s/g, '-')
  const companySlug = profile.company.toLowerCase().replace(/\s/g, '')
  return [
    `linkedin.com/in/${slug}`,
    `${slug}.substack.com`,
    `twitter.com/${slug.replace('-', '')}`,
    `${companySlug}.com/blog`,
    `crunchbase.com/person/${slug}`,
  ].slice(0, 3 + (hash % 3))
}

export async function generateMockInsights(profile: ProfileInput): Promise<InsightData> {
  // Simulate scraping + LLM processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const hash = simpleHash(profile.fullName + profile.company)
  const industry = profile.industry || 'Technology'

  // Get thesis
  const theses = thesisTemplates[industry] || thesisTemplates['Technology']
  const thesis = theses[hash % theses.length].replace(/{name}/g, profile.fullName)

  // Get interests
  const pool = interestPools[industry] || interestPools['Technology']
  const interests = pick(pool, hash, 4 + (hash % 2))

  // Get activities
  const recentActivity = generateActivities(profile, hash)

  // Investment focus
  const focusTemplates = [
    `Based on recent activity, ${profile.fullName} appears most engaged with early-to-mid stage companies in the ${industry.toLowerCase()} space, particularly those leveraging AI to solve workflow automation and data intelligence challenges.`,
    `${profile.fullName}'s current focus at ${profile.company} suggests strong interest in companies building foundational technology for the ${industry.toLowerCase()} sector, with emphasis on scalability and enterprise readiness.`,
    `Analysis of ${profile.fullName}'s recent engagements indicates a preference for companies with strong technical moats, recurring revenue models, and clear paths to market leadership in ${industry.toLowerCase()}.`,
  ]
  const investmentFocus = focusTemplates[hash % focusTemplates.length]

  // Confidence varies between 68-92 based on how much mock data we generate
  const confidence = 68 + (hash % 25)

  const sources = generateSources(profile, hash)

  return {
    currentThesis: thesis,
    interests,
    recentActivity,
    investmentFocus,
    confidence,
    sources,
  }
}
