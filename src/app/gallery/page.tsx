"use client";

import { useEffect, useState } from "react";
import { Upload, Download, Image as ImageIcon, Video, X } from "lucide-react";
import Link from "next/link";

interface MediaFile {
  id: string;
  file_name: string;
  storage_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  media_type: "photo" | "video";
}

export default function GalleryPage() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async (offset = 0) => {
    try {
      const response = await fetch(`/api/media?limit=20&offset=${offset}`);
      const files = await response.json();
      if (offset === 0) {
        setMediaFiles(files);
      } else {
        setMediaFiles((prev) => [...prev, ...files]);
      }
      setHasMore(files.length === 20);

      // Generate signed URLs for all files
      const urls: Record<string, string> = {};
      for (const file of files) {
        const urlResponse = await fetch(
          `/api/signed-url?path=${encodeURIComponent(file.storage_path)}`,
        );
        const urlData = await urlResponse.json();
        if (urlData.url) {
          urls[file.id] = urlData.url;
        }
      }
      setSignedUrls((prev) => ({ ...prev, ...urls }));
    } catch (error) {
      console.error("Error loading media:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    loadMedia(mediaFiles.length);
  };

  const handleDownload = async (media: MediaFile) => {
    const url = signedUrls[media.id];
    if (url) {
      const link = document.createElement("a");
      link.href = url;
      link.download = media.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Wedding Gallery</h1>
          <div className="flex gap-3">
            <Link
              href="/upload"
              className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Upload className="w-5 h-5" />
              Upload
            </Link>
            <Link
              href="/download"
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download All
            </Link>
          </div>
        </div>
      </header>

      {/* Gallery Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading && mediaFiles.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading gallery...</p>
          </div>
        ) : mediaFiles.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No photos yet
            </h2>
            <p className="text-gray-600 mb-6">
              Be the first to share your memories!
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Upload className="w-5 h-5" />
              Upload Photos
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mediaFiles.map((media) => (
                <div
                  key={media.id}
                  className="relative group aspect-square rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow"
                  onClick={() => setSelectedMedia(media)}
                >
                  {media.media_type === "photo" ? (
                    <img
                      src={signedUrls[media.id] || ""}
                      alt={media.file_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                      <Video className="w-12 h-12 text-white" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(media);
                      }}
                      className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Media Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X className="w-8 h-8" />
          </button>
          <div
            className="max-w-4xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMedia.media_type === "photo" ? (
              <img
                src={signedUrls[selectedMedia.id] || ""}
                alt={selectedMedia.file_name}
                className="max-w-full max-h-[80vh] object-contain"
              />
            ) : (
              <video
                src={signedUrls[selectedMedia.id] || ""}
                controls
                className="max-w-full max-h-[80vh]"
              />
            )}
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={() => handleDownload(selectedMedia)}
                className="bg-white text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
