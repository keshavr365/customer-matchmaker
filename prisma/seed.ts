import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.profileInsight.deleteMany()
  await prisma.bonusTransaction.deleteMany()
  await prisma.feedback.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.introRequest.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.iCPRequest.deleteMany()
  await prisma.connection.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await hash('password123', 12)

  // Create users
  const alice = await prisma.user.create({
    data: {
      email: 'alice@startup.com',
      passwordHash,
      name: 'Alice Chen',
      role: 'REQUESTER',
      bonusPoints: 25,
      hasContributedData: true,
    },
  })

  const bob = await prisma.user.create({
    data: {
      email: 'bob@venture.com',
      passwordHash,
      name: 'Bob Martinez',
      role: 'CONNECTOR',
      bonusPoints: 40,
      hasContributedData: true,
    },
  })

  const carol = await prisma.user.create({
    data: {
      email: 'carol@founder.io',
      passwordHash,
      name: 'Carol Park',
      role: 'REQUESTER',
      bonusPoints: 15,
      hasContributedData: true,
    },
  })

  const dave = await prisma.user.create({
    data: {
      email: 'dave@vc.fund',
      passwordHash,
      name: 'Dave Wilson',
      role: 'CONNECTOR',
      bonusPoints: 35,
      hasContributedData: true,
    },
  })

  const admin = await prisma.user.create({
    data: {
      email: 'admin@platform.com',
      passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
      bonusPoints: 100,
      hasContributedData: true,
    },
  })

  // Create profiles for users
  const aliceProfile = await prisma.profile.create({
    data: {
      userId: alice.id,
      fullName: 'Alice Chen',
      headline: 'CEO & Co-founder at DataFlow',
      company: 'DataFlow',
      title: 'CEO',
      industry: 'SaaS',
      companySize: '11-50',
      region: 'North America',
      description: 'Building the next-gen data pipeline platform for enterprise teams.',
    },
  })

  const bobProfile = await prisma.profile.create({
    data: {
      userId: bob.id,
      fullName: 'Bob Martinez',
      headline: 'Partner at Horizon Ventures',
      company: 'Horizon Ventures',
      title: 'Partner',
      industry: 'Finance',
      companySize: '11-50',
      region: 'North America',
      description: 'Early-stage VC investing in B2B SaaS and developer tools.',
    },
  })

  const carolProfile = await prisma.profile.create({
    data: {
      userId: carol.id,
      fullName: 'Carol Park',
      headline: 'Founder at HealthBridge',
      company: 'HealthBridge',
      title: 'Founder',
      industry: 'Healthcare',
      companySize: '1-10',
      region: 'North America',
      description: 'Digital health platform connecting patients with specialists.',
    },
  })

  const daveProfile = await prisma.profile.create({
    data: {
      userId: dave.id,
      fullName: 'Dave Wilson',
      headline: 'Managing Director at TechFund Capital',
      company: 'TechFund Capital',
      title: 'Managing Director',
      industry: 'Finance',
      companySize: '11-50',
      region: 'Europe',
      description: 'Growth-stage investment in enterprise software.',
    },
  })

  await prisma.profile.create({
    data: {
      userId: admin.id,
      fullName: 'Admin User',
      headline: 'Platform Administrator',
      company: 'Customer Matchmaker',
      title: 'Administrator',
      industry: 'Technology',
      region: 'Global',
    },
  })

  // Create lead profiles (not registered users)
  const leadProfiles = await Promise.all([
    prisma.profile.create({
      data: {
        fullName: 'Sarah Johnson',
        headline: 'VP of Engineering at CloudScale',
        company: 'CloudScale',
        title: 'VP of Engineering',
        industry: 'SaaS',
        companySize: '201-500',
        region: 'North America',
        description: 'Leading engineering teams building cloud infrastructure and data tools.',
      },
    }),
    prisma.profile.create({
      data: {
        fullName: 'Michael Torres',
        headline: 'Head of Product at DataVault',
        company: 'DataVault',
        title: 'Head of Product',
        industry: 'SaaS',
        companySize: '51-200',
        region: 'North America',
        description: 'Product leader focused on data management and analytics platforms.',
      },
    }),
    prisma.profile.create({
      data: {
        fullName: 'Emily Zhang',
        headline: 'CTO at FinEdge',
        company: 'FinEdge',
        title: 'CTO',
        industry: 'Finance',
        companySize: '51-200',
        region: 'Asia Pacific',
        description: 'Building next-generation fintech infrastructure for emerging markets.',
      },
    }),
    prisma.profile.create({
      data: {
        fullName: 'James Anderson',
        headline: 'Director of IT at MedTech Solutions',
        company: 'MedTech Solutions',
        title: 'Director of IT',
        industry: 'Healthcare',
        companySize: '201-500',
        region: 'North America',
        description: 'Digital transformation leader in healthcare technology.',
      },
    }),
    prisma.profile.create({
      data: {
        fullName: 'Lisa Kim',
        headline: 'VP of Operations at ShopFlow',
        company: 'ShopFlow',
        title: 'VP of Operations',
        industry: 'E-commerce',
        companySize: '51-200',
        region: 'North America',
        description: 'Operations and supply chain optimization for e-commerce platforms.',
      },
    }),
    prisma.profile.create({
      data: {
        fullName: 'Robert Chen',
        headline: 'Head of Data at InsureNow',
        company: 'InsureNow',
        title: 'Head of Data',
        industry: 'Finance',
        companySize: '201-500',
        region: 'Europe',
        description: 'Data engineering and ML pipelines for insurance technology.',
      },
    }),
    prisma.profile.create({
      data: {
        fullName: 'Maria Garcia',
        headline: 'Chief Product Officer at EduLearn',
        company: 'EduLearn',
        title: 'Chief Product Officer',
        industry: 'Education',
        companySize: '51-200',
        region: 'Latin America',
        description: 'EdTech product leader building learning platforms for enterprises.',
      },
    }),
    prisma.profile.create({
      data: {
        fullName: 'David Brown',
        headline: 'SVP of Technology at RetailMax',
        company: 'RetailMax',
        title: 'SVP of Technology',
        industry: 'E-commerce',
        companySize: '501-1000',
        region: 'North America',
        description: 'Technology leadership for large-scale retail and commerce platforms.',
      },
    }),
    prisma.profile.create({
      data: {
        fullName: 'Priya Patel',
        headline: 'VP of Engineering at HealthSync',
        company: 'HealthSync',
        title: 'VP of Engineering',
        industry: 'Healthcare',
        companySize: '51-200',
        region: 'North America',
        description: 'Building health data interoperability and patient engagement tools.',
      },
    }),
    prisma.profile.create({
      data: {
        fullName: 'Alex Turner',
        headline: 'Director of Product at DevTools Inc',
        company: 'DevTools Inc',
        title: 'Director of Product',
        industry: 'SaaS',
        companySize: '11-50',
        region: 'Europe',
        description: 'Product management for developer productivity tools and CI/CD platforms.',
      },
    }),
    prisma.profile.create({
      data: {
        fullName: 'Nina Ivanova',
        headline: 'CTO at LogiFlow',
        company: 'LogiFlow',
        title: 'CTO',
        industry: 'Transportation',
        companySize: '51-200',
        region: 'Europe',
        description: 'Technology leader in logistics and supply chain software.',
      },
    }),
    prisma.profile.create({
      data: {
        fullName: 'Thomas Wright',
        headline: 'Head of Engineering at GreenEnergy',
        company: 'GreenEnergy',
        title: 'Head of Engineering',
        industry: 'Energy',
        companySize: '201-500',
        region: 'North America',
        description: 'Engineering leader building renewable energy management platforms.',
      },
    }),
  ])

  // Create connections: Bob knows many leads (he's a VC partner)
  for (const lead of leadProfiles.slice(0, 8)) {
    await prisma.connection.create({
      data: { profileAId: bobProfile.id, profileBId: lead.id },
    })
  }

  // Dave knows some leads too
  for (const lead of leadProfiles.slice(4, 12)) {
    await prisma.connection.create({
      data: { profileAId: daveProfile.id, profileBId: lead.id },
    })
  }

  // Alice knows a few leads (she's also in the network)
  for (const lead of leadProfiles.slice(0, 3)) {
    await prisma.connection.create({
      data: { profileAId: aliceProfile.id, profileBId: lead.id },
    })
  }

  // Carol knows a few leads
  for (const lead of [leadProfiles[3], leadProfiles[8]]) {
    await prisma.connection.create({
      data: { profileAId: carolProfile.id, profileBId: lead.id },
    })
  }

  // Connector-to-connector connections (so they can be indirect paths)
  await prisma.connection.create({
    data: { profileAId: bobProfile.id, profileBId: daveProfile.id },
  })
  await prisma.connection.create({
    data: { profileAId: aliceProfile.id, profileBId: bobProfile.id },
  })

  // Create an ICP request for Alice (already matched)
  const aliceICP = await prisma.iCPRequest.create({
    data: {
      userId: alice.id,
      industry: 'SaaS',
      role: 'VP of Engineering',
      companySize: '51-200',
      region: 'North America',
      description: 'Looking for engineering leaders at mid-size SaaS companies who need data pipeline solutions.',
      status: 'MATCHED',
    },
  })

  // Create leads for Alice's ICP
  const aliceLead1 = await prisma.lead.create({
    data: {
      icpRequestId: aliceICP.id,
      profileId: leadProfiles[0].id, // Sarah Johnson
      matchScore: 92,
      status: 'INTRO_SENT',
    },
  })

  await prisma.lead.create({
    data: {
      icpRequestId: aliceICP.id,
      profileId: leadProfiles[1].id, // Michael Torres
      matchScore: 85,
      status: 'SUGGESTED',
    },
  })

  await prisma.lead.create({
    data: {
      icpRequestId: aliceICP.id,
      profileId: leadProfiles[9].id, // Alex Turner
      matchScore: 78,
      status: 'SUGGESTED',
    },
  })

  // Create intro request: Alice -> Bob (connector) -> Sarah Johnson (lead)
  const intro1 = await prisma.introRequest.create({
    data: {
      leadId: aliceLead1.id,
      requesterId: alice.id,
      connectorId: bob.id,
      connectionType: 'DIRECT',
      status: 'ACCEPTED',
      draftMessage: `Hi Sarah,\n\nI'd like to introduce you to Alice Chen, CEO of DataFlow. She's building a data pipeline platform that could be very relevant to your work at CloudScale.\n\nAlice is looking to connect with VP-level engineering leaders at SaaS companies. I think there could be a valuable conversation here.\n\nWould you be open to a brief chat?\n\nBest regards`,
      respondedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
  })

  // Create an ICP for Carol
  const carolICP = await prisma.iCPRequest.create({
    data: {
      userId: carol.id,
      industry: 'Healthcare',
      role: 'Director of IT',
      companySize: '201-500',
      region: 'North America',
      description: 'Looking for IT directors at healthcare companies who need patient engagement solutions.',
      status: 'MATCHED',
    },
  })

  const carolLead1 = await prisma.lead.create({
    data: {
      icpRequestId: carolICP.id,
      profileId: leadProfiles[3].id, // James Anderson
      matchScore: 88,
      status: 'INTRO_SENT',
    },
  })

  await prisma.lead.create({
    data: {
      icpRequestId: carolICP.id,
      profileId: leadProfiles[8].id, // Priya Patel
      matchScore: 80,
      status: 'SUGGESTED',
    },
  })

  // Intro request for Carol: pending on Bob
  await prisma.introRequest.create({
    data: {
      leadId: carolLead1.id,
      requesterId: carol.id,
      connectorId: bob.id,
      connectionType: 'INDIRECT',
      contributorProfileId: carolProfile.id,
      status: 'PENDING',
      draftMessage: `Hi James,\n\nI'd like to introduce you to Carol Park, Founder of HealthBridge. She's building a digital health platform that could be relevant to your role at MedTech Solutions.\n\nCarol is looking to connect with IT directors at healthcare companies. Would you be open to a brief chat?\n\nBest regards`,
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  })

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: alice.id,
        type: 'INTRO_ACCEPTED',
        title: 'Intro Accepted!',
        message: 'Bob Martinez accepted your intro request to Sarah Johnson.',
        linkUrl: '/dashboard/intros',
        isRead: false,
      },
      {
        userId: alice.id,
        type: 'POINTS_EARNED',
        title: 'Points Earned',
        message: 'You earned 3 bonus points for uploading connections.',
        isRead: true,
      },
      {
        userId: bob.id,
        type: 'INTRO_REQUEST',
        title: 'New Intro Request',
        message: 'Carol Park is requesting an introduction to James Anderson.',
        linkUrl: '/dashboard/intros',
        isRead: false,
      },
      {
        userId: bob.id,
        type: 'POINTS_EARNED',
        title: 'Points Earned',
        message: 'You earned 10 bonus points for accepting an intro.',
        isRead: true,
      },
      {
        userId: carol.id,
        type: 'FEEDBACK_DUE',
        title: 'Feedback Needed',
        message: 'Please provide feedback on your pending introductions.',
        linkUrl: '/dashboard/intros',
        isRead: false,
      },
    ],
  })

  // Create bonus transactions
  await prisma.bonusTransaction.createMany({
    data: [
      { userId: alice.id, amount: -5, reason: 'Intro request', introRequestId: intro1.id },
      { userId: bob.id, amount: 10, reason: 'ACCEPT_INTRO', introRequestId: intro1.id },
      { userId: alice.id, amount: 3, reason: 'UPLOAD' },
      { userId: carol.id, amount: 3, reason: 'UPLOAD' },
      { userId: bob.id, amount: 3, reason: 'UPLOAD' },
      { userId: dave.id, amount: 3, reason: 'UPLOAD' },
    ],
  })

  // Pre-generate insights for a few lead profiles
  await prisma.profileInsight.create({
    data: {
      profileId: leadProfiles[0].id, // Sarah Johnson
      currentThesis: 'Sarah Johnson has been increasingly vocal about the convergence of AI and vertical SaaS, arguing that domain-specific LLMs will replace horizontal platforms within 3-5 years. Their recent activity suggests a strong focus on developer tooling and infrastructure automation.',
      interests: JSON.stringify(['vertical SaaS', 'AI-native products', 'developer experience', 'platform engineering', 'cloud infrastructure']),
      recentActivity: JSON.stringify([
        { type: 'blog', title: 'Why SaaS Needs an AI-First Approach in 2026', source: 'sarahjohnson.substack.com', date: 'Nov 2025' },
        { type: 'podcast', title: '"Inside CloudScale" — How We Built Our Platform', source: 'Spotify / Apple Podcasts', date: 'Nov 2025' },
        { type: 'linkedin', title: 'Shared insights on SaaS market trends and the role of AI in transforming traditional workflows', source: 'LinkedIn', date: 'Sep 2025' },
        { type: 'twitter', title: 'Thread on why SaaS is at an inflection point — "We\'re seeing a 10x shift in how companies buy software"', source: 'X (Twitter)', date: 'Sep 2025' },
      ]),
      investmentFocus: 'Based on recent activity, Sarah Johnson appears most engaged with early-to-mid stage companies in the SaaS space, particularly those leveraging AI to solve workflow automation and data intelligence challenges.',
      confidence: 85,
      sources: JSON.stringify(['linkedin.com/in/sarah-johnson', 'sarahjohnson.substack.com', 'twitter.com/sarahjohnson', 'cloudscale.com/blog']),
    },
  })

  await prisma.profileInsight.create({
    data: {
      profileId: leadProfiles[1].id, // Michael Torres
      currentThesis: 'Michael Torres is currently focused on the next wave of B2B SaaS — specifically composable architectures and API-first platforms. He believes the "all-in-one" era is ending in favor of best-of-breed integrations powered by AI orchestration layers.',
      interests: JSON.stringify(['API-first architecture', 'composable software', 'usage-based pricing', 'data engineering', 'product-led growth']),
      recentActivity: JSON.stringify([
        { type: 'blog', title: 'The Future of Product Strategy in the Age of AI', source: 'michaeltorres.substack.com', date: 'Oct 2025' },
        { type: 'podcast', title: 'Guest on SaaStr Sessions: SaaS Trends for 2026', source: 'Spotify / Apple Podcasts', date: 'Oct 2025' },
        { type: 'linkedin', title: 'Posted about the future of go-to-market strategy and lessons from DataVault', source: 'LinkedIn', date: 'Aug 2025' },
      ]),
      investmentFocus: 'Michael Torres\'s current focus at DataVault suggests strong interest in companies building foundational technology for the SaaS sector, with emphasis on scalability and enterprise readiness.',
      confidence: 79,
      sources: JSON.stringify(['linkedin.com/in/michael-torres', 'michaeltorres.substack.com', 'twitter.com/michaeltorres', 'datavault.com/blog', 'crunchbase.com/person/michael-torres']),
    },
  })

  await prisma.profileInsight.create({
    data: {
      profileId: leadProfiles[3].id, // James Anderson
      currentThesis: 'James Anderson is deeply focused on the intersection of AI and clinical decision support. He believes the biggest opportunity in healthcare tech is reducing administrative burden through intelligent automation, not replacing clinicians.',
      interests: JSON.stringify(['clinical AI', 'digital therapeutics', 'health data interoperability', 'EHR modernization', 'patient engagement']),
      recentActivity: JSON.stringify([
        { type: 'blog', title: 'Why Healthcare Needs an AI-First Approach in 2026', source: 'jamesanderson.substack.com', date: 'Dec 2025' },
        { type: 'podcast', title: '"Rethinking Healthcare" on The Startup Podcast', source: 'Spotify / Apple Podcasts', date: 'Dec 2025' },
        { type: 'linkedin', title: 'Shared insights on healthcare market trends and the role of AI in transforming traditional workflows', source: 'LinkedIn', date: 'Sep 2025' },
      ]),
      investmentFocus: 'Based on recent activity, James Anderson appears most engaged with early-to-mid stage companies in the healthcare space, particularly those leveraging AI to solve workflow automation and data intelligence challenges.',
      confidence: 82,
      sources: JSON.stringify(['linkedin.com/in/james-anderson', 'jamesanderson.substack.com', 'twitter.com/jamesanderson', 'medtechsolutions.com/blog']),
    },
  })

  console.log('Seeding complete!')
  console.log('')
  console.log('Demo accounts (all use password: password123):')
  console.log('  Requester: alice@startup.com')
  console.log('  Connector: bob@venture.com')
  console.log('  Requester: carol@founder.io')
  console.log('  Connector: dave@vc.fund')
  console.log('  Admin:     admin@platform.com')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
