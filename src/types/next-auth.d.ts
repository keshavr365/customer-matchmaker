import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      bonusPoints: number
      hasContributedData: boolean
      isFrozen: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    bonusPoints: number
    hasContributedData: boolean
    isFrozen: boolean
  }
}
