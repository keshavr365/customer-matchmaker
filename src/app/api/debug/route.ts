import { NextResponse } from 'next/server'

/**
 * Diagnostic endpoint — reveals what env vars and build the live runtime sees.
 * Remove once the production DB issue is resolved.
 * Values are redacted to show only the prefix so secrets are never leaked.
 */
export async function GET() {
  const dbUrl = process.env.DATABASE_URL || ''
  const nextAuthUrl = process.env.NEXTAUTH_URL || ''
  const secret = process.env.NEXTAUTH_SECRET || ''

  return NextResponse.json({
    commit: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    commitMsg: process.env.VERCEL_GIT_COMMIT_MESSAGE?.slice(0, 80) || 'unknown',
    vercelEnv: process.env.VERCEL_ENV || 'unknown',
    deploymentUrl: process.env.VERCEL_URL || 'unknown',
    databaseUrl: {
      present: dbUrl.length > 0,
      length: dbUrl.length,
      prefix: dbUrl.slice(0, 15), // e.g. "postgresql://" or "file:./"
      host: dbUrl.match(/@([^/?]+)/)?.[1] || 'no-host-match',
      provider: dbUrl.startsWith('postgres') ? 'postgres' : dbUrl.startsWith('file:') ? 'sqlite-file' : 'other',
    },
    nextAuthUrl: {
      present: nextAuthUrl.length > 0,
      value: nextAuthUrl,
    },
    nextAuthSecret: {
      present: secret.length > 0,
      length: secret.length,
    },
    node: process.version,
    time: new Date().toISOString(),
  })
}
