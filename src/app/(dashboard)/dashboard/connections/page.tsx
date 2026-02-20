'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

interface ConnectionProfile {
  id: string
  fullName: string
  company: string
  title: string
  industry: string
}

export default function ConnectionsPage() {
  const { data: session, update } = useSession()
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [connections, setConnections] = useState<ConnectionProfile[]>([])
  const [loading, setLoading] = useState(true)

  const hasContributed = (session?.user as any)?.hasContributedData

  useEffect(() => {
    async function fetchConnections() {
      try {
        const res = await fetch('/api/connections')
        if (res.ok) setConnections(await res.json())
      } catch {}
      setLoading(false)
    }
    fetchConnections()
  }, [])

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setUploading(true)
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const file = formData.get('file') as File

    if (!file || !file.name.endsWith('.csv')) {
      setMessage('Please upload a CSV file.')
      setUploading(false)
      return
    }

    const text = await file.text()
    try {
      const res = await fetch('/api/connections/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: text }),
      })

      const data = await res.json()
      if (res.ok) {
        setMessage(`Successfully imported ${data.count} connections!`)
        // Refresh connections list
        const res2 = await fetch('/api/connections')
        if (res2.ok) setConnections(await res2.json())
        // Update session
        update()
      } else {
        setMessage(data.error || 'Failed to upload.')
      }
    } catch {
      setMessage('Something went wrong.')
    }
    setUploading(false)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">LinkedIn Connections</h1>
        <p className="text-gray-500 mt-1">Upload your LinkedIn connections to participate in the network.</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-2">Upload Connections CSV</h2>
        <p className="text-sm text-gray-500 mb-4">
          Export your connections from LinkedIn and upload the CSV file here. The file should have columns for
          First Name, Last Name, Company, Position, and optionally Industry and Region.
        </p>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm border ${
              message.includes('Successfully') ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-600'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleUpload} className="flex items-end gap-4">
          <div className="flex-1">
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
              CSV File
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept=".csv"
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-brand-50 file:text-brand-700"
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 flex-shrink-0"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 font-medium mb-1">Expected CSV format:</p>
          <code className="text-xs text-gray-600">First Name,Last Name,Company,Position,Industry,Region</code>
        </div>
      </div>

      {/* Connections List */}
      <div className="bg-white border border-gray-100 rounded-xl">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            Your Connections {connections.length > 0 && `(${connections.length})`}
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : connections.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-500">No connections uploaded yet. Upload a CSV to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {connections.map((conn) => (
              <div key={conn.id} className="px-6 py-3 flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {conn.fullName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{conn.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {conn.title}
                    {conn.company ? ` at ${conn.company}` : ''}
                  </p>
                </div>
                {conn.industry && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs flex-shrink-0">{conn.industry}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
