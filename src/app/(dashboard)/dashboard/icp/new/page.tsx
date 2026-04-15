'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

// Comprehensive industry list aligned with LinkedIn's industry taxonomy
const industries = [
  'Accounting',
  'Advertising & Marketing',
  'Aerospace & Defense',
  'Agriculture',
  'Airlines & Aviation',
  'Apparel & Fashion',
  'Architecture & Planning',
  'Artificial Intelligence',
  'Automotive',
  'Banking',
  'Biotechnology',
  'Broadcast Media',
  'Chemicals',
  'Civic & Social Organization',
  'Civil Engineering',
  'Commercial Real Estate',
  'Computer & Network Security',
  'Computer Hardware',
  'Computer Software',
  'Construction',
  'Consulting',
  'Consumer Electronics',
  'Consumer Goods',
  'Consumer Services',
  'Cybersecurity',
  'Design',
  'E-commerce',
  'Education',
  'Electrical & Electronic Manufacturing',
  'Energy & Utilities',
  'Entertainment',
  'Environmental Services',
  'Events Services',
  'Facilities Services',
  'Financial Services',
  'Fintech',
  'Food & Beverages',
  'Gaming',
  'Government',
  'Graphic Design',
  'Healthcare',
  'Higher Education',
  'Hospitality',
  'Human Resources',
  'Import & Export',
  'Industrial Automation',
  'Information Services',
  'Information Technology',
  'Insurance',
  'International Trade',
  'Internet',
  'Investment Banking',
  'Investment Management',
  'Legal Services',
  'Leisure & Travel',
  'Logistics & Supply Chain',
  'Luxury Goods',
  'Machinery',
  'Management Consulting',
  'Manufacturing',
  'Maritime',
  'Market Research',
  'Marketing & Advertising',
  'Media Production',
  'Medical Devices',
  'Mental Health Care',
  'Mining & Metals',
  'Nanotechnology',
  'Nonprofit',
  'Oil & Gas',
  'Online Media',
  'Outsourcing/Offshoring',
  'Packaging',
  'Paper & Forest Products',
  'Pharmaceuticals',
  'Philanthropy',
  'Photography',
  'Professional Training',
  'Public Relations',
  'Public Safety',
  'Publishing',
  'Real Estate',
  'Recreational Facilities',
  'Religious Institutions',
  'Renewables & Environment',
  'Research',
  'Restaurants',
  'Retail',
  'Robotics',
  'SaaS',
  'Security & Investigations',
  'Semiconductors',
  'Shipping',
  'Social Media',
  'Sports',
  'Staffing & Recruiting',
  'Technology',
  'Telecommunications',
  'Textiles',
  'Think Tanks',
  'Tobacco',
  'Transportation',
  'Utilities',
  'Venture Capital & Private Equity',
  'Veterinary',
  'Warehousing',
  'Wholesale',
  'Wine & Spirits',
  'Wireless',
  'Writing & Editing',
  'Other',
]

const companySizes = [
  '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+',
]

const regions = [
  'North America', 'Europe', 'Asia Pacific', 'Latin America',
  'Middle East', 'Africa', 'Global',
]

export default function NewICPPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])

  function toggleSize(s: string) {
    setSelectedSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }
  function toggleRegion(r: string) {
    setSelectedRegions((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (selectedSizes.length === 0) {
      setError('Please select at least one company size.')
      setLoading(false)
      return
    }
    if (selectedRegions.length === 0) {
      setError('Please select at least one region.')
      setLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    const body = {
      industry: formData.get('industry') as string,
      role: formData.get('role') as string,
      companySize: selectedSizes.join(','),
      region: selectedRegions.join(','),
      description: formData.get('description') as string,
    }

    try {
      const res = await fetch('/api/icp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to submit ICP.')
        setLoading(false)
        return
      }

      const data = await res.json()
      router.push(`/dashboard/leads?icpId=${data.id}`)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Define Your Ideal Customer</h1>
        <p className="text-gray-500 mt-1">Tell us who you&apos;re looking to connect with and we&apos;ll find matching leads.</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white border border-gray-100 rounded-xl p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <select
                id="industry"
                name="industry"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
              >
                <option value="">Select an industry</option>
                {industries.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Target Role / Title
              </label>
              <input
                id="role"
                name="role"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="e.g. VP of Engineering, Head of Product"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Size <span className="text-gray-400 font-normal">(select all that apply)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {companySizes.map((s) => {
                  const checked = selectedSizes.includes(s)
                  return (
                    <label
                      key={s}
                      className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm cursor-pointer transition-colors ${
                        checked
                          ? 'bg-brand-50 border-brand-200 text-brand-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSize(s)}
                        className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                      />
                      <span>{s}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region <span className="text-gray-400 font-normal">(select all that apply)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {regions.map((r) => {
                  const checked = selectedRegions.includes(r)
                  return (
                    <label
                      key={r}
                      className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm cursor-pointer transition-colors ${
                        checked
                          ? 'bg-brand-50 border-brand-200 text-brand-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleRegion(r)}
                        className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                      />
                      <span>{r}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Details <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                placeholder="Describe your ideal customer in more detail..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Finding matches...' : 'Find Matching Leads'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
