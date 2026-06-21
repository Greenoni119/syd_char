'use client'

import { useState, useEffect } from 'react'
import { Download, Check, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function DownloadPage() {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadComplete, setDownloadComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{ totalPhotos: number; totalVideos: number; totalStorage: number } | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleDownloadAll = async () => {
    setIsDownloading(true)
    setError(null)

    try {
      const response = await fetch('/api/download-all')
      
      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `wedding-photos-${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setDownloadComplete(true)
    } catch (error) {
      setError('Failed to download. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Download All Photos</h1>
          <Link
            href="/gallery"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Gallery
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <Download className="w-20 h-20 text-purple-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Download Wedding Memories
            </h2>
            <p className="text-gray-600">
              Get all photos and videos from the wedding in a single ZIP file
            </p>
          </div>

          {stats && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-pink-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-pink-600">{stats.totalPhotos}</p>
                <p className="text-sm text-gray-600">Photos</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">{stats.totalVideos}</p>
                <p className="text-sm text-gray-600">Videos</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">{formatFileSize(stats.totalStorage)}</p>
                <p className="text-sm text-gray-600">Total Size</p>
              </div>
            </div>
          )}

          <div className="text-center">
            {downloadComplete ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 inline-flex items-center gap-3">
                <Check className="w-6 h-6 text-green-600" />
                <span className="text-green-900 font-medium">
                  Download started successfully!
                </span>
              </div>
            ) : (
              <button
                onClick={handleDownloadAll}
                disabled={isDownloading || !stats || stats.totalPhotos + stats.totalVideos === 0}
                className="bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
              >
                {isDownloading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Preparing download...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Download All
                  </span>
                )}
              </button>
            )}

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 inline-flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <span className="text-red-900">{error}</span>
              </div>
            )}

            {!stats || stats.totalPhotos + stats.totalVideos === 0 ? (
              <p className="mt-4 text-gray-500">
                No photos or videos available to download yet.
              </p>
            ) : null}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Download Tips</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• The ZIP file may take a few moments to prepare</li>
              <li>• Make sure you have enough storage space on your device</li>
              <li>• Photos and videos are organized by type in the ZIP file</li>
              <li>• You can download multiple times if needed</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
