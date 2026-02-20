import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: ['/dashboard/:path*', '/api/icp/:path*', '/api/leads/:path*', '/api/intros/:path*', '/api/feedback/:path*', '/api/notifications/:path*', '/api/connections/:path*'],
}
