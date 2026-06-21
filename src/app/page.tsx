import Link from "next/link";
import { Heart, Camera, Lock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="mb-8">
            <Heart className="w-20 h-20 text-pink-600 mx-auto mb-4" />
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              WeddingShare
            </h1>
            <p className="text-xl text-gray-600">
              Share your wedding memories privately and securely
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Welcome to Our Wedding Gallery
            </h2>
            <p className="text-gray-600 mb-8">
              Scan the QR code provided at the wedding to access our private
              photo gallery. Upload your photos and videos, browse memories
              shared by other guests, and download everything to keep forever.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4">
                <Camera className="w-12 h-12 text-pink-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Easy Upload
                </h3>
                <p className="text-sm text-gray-600">
                  Drag and drop photos and videos from your phone
                </p>
              </div>
              <div className="text-center p-4">
                <Heart className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Share Memories
                </h3>
                <p className="text-sm text-gray-600">
                  View all photos and videos from the wedding
                </p>
              </div>
              <div className="text-center p-4">
                <Lock className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Private & Secure
                </h3>
                <p className="text-sm text-gray-600">
                  Only guests with the QR code can access
                </p>
              </div>
            </div>

            <div className="bg-pink-50 rounded-lg p-6 mb-6">
              <p className="text-pink-900 font-medium mb-2">Have a QR code?</p>
              <p className="text-pink-700 text-sm mb-4">
                Scan it with your phone camera to access the gallery
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/admin"
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Admin Dashboard
              </Link>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            No account required • Private access only • Mobile-friendly
          </p>
        </div>
      </main>
    </div>
  );
}
