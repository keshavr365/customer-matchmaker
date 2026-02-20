import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-gray-900">Customer Matchmaker</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            Find warm intros to your
            <span className="text-brand-600"> ideal customers</span>
          </h1>
          <p className="mt-6 text-xl text-gray-500 leading-relaxed">
            Leverage the professional networks of founders and VC partners to get introduced to the right people. No more cold outreach.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bg-brand-600 text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-brand-700 transition-colors"
            >
              Start for free
            </Link>
            <Link
              href="/login"
              className="border border-gray-200 text-gray-700 px-6 py-3 rounded-lg text-base font-medium hover:bg-gray-50 transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Define your ICP',
                desc: 'Tell us who your ideal customer is — industry, role, company size, and region.',
              },
              {
                step: '02',
                title: 'Get matched leads',
                desc: 'Our system analyzes professional networks to find the best-fit contacts for you.',
              },
              {
                step: '03',
                title: 'Get introduced',
                desc: 'A mutual connection makes a warm introduction. No cold outreach needed.',
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl p-8 border border-gray-100">
                <div className="text-brand-600 font-mono text-sm font-bold mb-3">{item.step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-sm text-gray-400 text-center">Customer Matchmaker — Portfolio Company Lead Generation</p>
        </div>
      </footer>
    </div>
  )
}
