"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Trash2,
  Download,
  RefreshCw,
  QrCode,
  Lock,
  Unlock,
} from "lucide-react";
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    totalPhotos: number;
    totalVideos: number;
    totalStorage: number;
  } | null>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [inviteTokens, setInviteTokens] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    uploadsEnabled: true,
    downloadsEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "media" | "tokens" | "settings"
  >("overview");

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "overview" || activeTab === "media") {
        const [statsRes, mediaRes] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/admin/media"),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (mediaRes.ok) setMediaFiles(await mediaRes.json());
      }
      if (activeTab === "tokens") {
        const tokensRes = await fetch("/api/admin/tokens");
        if (tokensRes.ok) setInviteTokens(await tokensRes.json());
      }
      if (activeTab === "settings") {
        const settingsRes = await fetch("/api/admin/settings");
        if (settingsRes.ok) setSettings(await settingsRes.json());
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      const response = await fetch(`/api/admin/media/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setMediaFiles((prev) => prev.filter((m) => m.id !== id));
        loadData();
      }
    } catch (error) {
      console.error("Error deleting media:", error);
    }
  };

  const handleGenerateToken = async () => {
    try {
      const response = await fetch("/api/admin/tokens", { method: "POST" });
      if (response.ok) {
        const newToken = await response.json();
        setInviteTokens((prev) => [newToken, ...prev]);
      }
    } catch (error) {
      console.error("Error generating token:", error);
    }
  };

  const handleToggleToken = async (id: string, active: boolean) => {
    try {
      const response = await fetch(`/api/admin/tokens/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      if (response.ok) {
        setInviteTokens((prev) =>
          prev.map((t) => (t.id === id ? { ...t, active: !active } : t)),
        );
      }
    } catch (error) {
      console.error("Error toggling token:", error);
    }
  };

  const handleDeleteToken = async (id: string) => {
    if (!confirm("Are you sure you want to delete this token?")) return;

    try {
      const response = await fetch(`/api/admin/tokens/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setInviteTokens((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error("Error deleting token:", error);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        alert("Settings updated successfully");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <Link href="/gallery" className="text-gray-600 hover:text-gray-900">
            Back to Gallery
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {(["overview", "media", "tokens", "settings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize ${
                activeTab === tab
                  ? "text-pink-600 border-b-2 border-pink-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {activeTab === "overview" && stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Total Photos
                  </h3>
                  <p className="text-4xl font-bold text-pink-600">
                    {stats.totalPhotos}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Total Videos
                  </h3>
                  <p className="text-4xl font-bold text-purple-600">
                    {stats.totalVideos}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Storage Used
                  </h3>
                  <p className="text-4xl font-bold text-blue-600">
                    {formatFileSize(stats.totalStorage)}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "media" && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Media Management</h2>
                  <Link
                    href="/download"
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                  >
                    <Download className="w-4 h-4" />
                    Download All
                  </Link>
                </div>
                <div className="p-6">
                  {mediaFiles.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No media files yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {mediaFiles.map((media) => (
                        <div
                          key={media.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-2xl">
                              {media.media_type === "photo" ? "📷" : "🎥"}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">
                                {media.file_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(media.file_size)} •{" "}
                                {new Date(
                                  media.uploaded_at,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteMedia(media.id)}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "tokens" && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Invite Tokens</h2>
                  <button
                    onClick={handleGenerateToken}
                    className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
                  >
                    <QrCode className="w-4 h-4" />
                    Generate Token
                  </button>
                </div>
                <div className="p-6">
                  {inviteTokens.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No invite tokens yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {inviteTokens.map((token) => (
                        <div
                          key={token.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-mono text-sm font-medium text-gray-900">
                              {token.token}
                            </p>
                            <p className="text-xs text-gray-500">
                              Created:{" "}
                              {new Date(token.created_at).toLocaleDateString()}
                              {token.expires_at &&
                                ` • Expires: ${new Date(token.expires_at).toLocaleDateString()}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleToggleToken(token.id, token.active)
                              }
                              className={`p-2 rounded ${token.active ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                            >
                              {token.active ? (
                                <Unlock className="w-5 h-5" />
                              ) : (
                                <Lock className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteToken(token.id)}
                              className="text-red-600 hover:text-red-700 p-2"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold">Settings</h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Enable Uploads
                      </h3>
                      <p className="text-sm text-gray-500">
                        Allow guests to upload photos and videos
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          uploadsEnabled: !prev.uploadsEnabled,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.uploadsEnabled ? "bg-pink-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.uploadsEnabled
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Enable Downloads
                      </h3>
                      <p className="text-sm text-gray-500">
                        Allow guests to download photos and videos
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          downloadsEnabled: !prev.downloadsEnabled,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.downloadsEnabled
                          ? "bg-pink-600"
                          : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.downloadsEnabled
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={handleUpdateSettings}
                      className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
