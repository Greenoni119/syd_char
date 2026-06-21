'use client'

import { useState, useRef } from 'react'
import { Upload, X, Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface UploadProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    handleFiles(selectedFiles)
  }

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const isPhoto = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      const isValidSize = isPhoto ? file.size <= 100 * 1024 * 1024 : file.size <= 250 * 1024 * 1024
      return (isPhoto || isVideo) && isValidSize
    })

    setFiles(prev => [...prev, ...validFiles])
    setUploadProgress(prev => [
      ...prev,
      ...validFiles.map(file => ({
        file,
        progress: 0,
        status: 'pending' as const,
      }))
    ])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setUploadProgress(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const mediaType = file.type.startsWith('image/') ? 'photo' : 'video'

      setUploadProgress(prev => 
        prev.map((p, idx) => 
          idx === i ? { ...p, status: 'uploading', progress: 0 } : p
        )
      )

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('mediaType', mediaType)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        setUploadProgress(prev =>
          prev.map((p, idx) =>
            idx === i ? { ...p, status: 'success', progress: 100 } : p
          )
        )
      } catch (error) {
        setUploadProgress(prev =>
          prev.map((p, idx) =>
            idx === i ? { ...p, status: 'error', error: 'Upload failed' } : p
          )
        )
      }
    }
  }

  const allComplete = uploadProgress.every(p => p.status === 'success')
  const hasErrors = uploadProgress.some(p => p.status === 'error')

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Upload Photos & Videos</h1>
          <Link
            href="/gallery"
            className="text-gray-600 hover:text-gray-900"
          >
            Back to Gallery
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            isDragging
              ? 'border-pink-600 bg-pink-50'
              : 'border-gray-300 hover:border-pink-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Drag and drop your files here
          </h2>
          <p className="text-gray-600 mb-4">
            or click to browse
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
          >
            Select Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <p className="text-sm text-gray-500 mt-4">
            Photos: JPG, PNG, WebP, HEIC (max 100MB)
            <br />
            Videos: MP4, MOV, HEVC (max 250MB)
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {files.length} file{files.length !== 1 ? 's' : ''} selected
              </h3>
              {!allComplete && (
                <button
                  onClick={uploadFiles}
                  disabled={uploadProgress.some(p => p.status === 'uploading')}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadProgress.some(p => p.status === 'uploading')
                    ? 'Uploading...'
                    : 'Upload All'}
                </button>
              )}
            </div>

            <div className="space-y-3">
              {files.map((file, index) => {
                const progress = uploadProgress[index]
                return (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-4 shadow-sm flex items-center gap-4"
                  >
                    <div className="flex-shrink-0">
                      {file.type.startsWith('image/') ? (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">📷</span>
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">🎥</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {progress?.status === 'uploading' && (
                        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-pink-600 transition-all"
                            style={{ width: `${progress.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {progress?.status === 'success' && (
                        <Check className="w-6 h-6 text-green-600" />
                      )}
                      {progress?.status === 'error' && (
                        <AlertCircle className="w-6 h-6 text-red-600" />
                      )}
                      {progress?.status === 'pending' && (
                        <button
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {allComplete && (
              <div className="mt-6 text-center">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-flex items-center gap-3">
                  <Check className="w-6 h-6 text-green-600" />
                  <span className="text-green-900 font-medium">
                    All files uploaded successfully!
                  </span>
                </div>
                <Link
                  href="/gallery"
                  className="block mt-4 text-pink-600 hover:text-pink-700 font-medium"
                >
                  View in Gallery →
                </Link>
              </div>
            )}

            {hasErrors && (
              <div className="mt-6 text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 inline-flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <span className="text-red-900 font-medium">
                    Some files failed to upload. Please try again.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
