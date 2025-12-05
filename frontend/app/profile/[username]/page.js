"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { getUserProfile } from "../../services/api";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser, isAuthenticated, logout } = useUser();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const username = params.username;
  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUserProfile(username);
        setProfileData(data);
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <ErrorState message={error} />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <ErrorState message="Profile not found" />
      </div>
    );
  }

  const stats = [
    { label: "Highest WPM", value: profileData.bestWPM || 0, icon: "🚀" },
    { label: "Average WPM", value: profileData.avgWPM?.toFixed(1) || 0, icon: "📊" },
    { label: "Highest Accuracy", value: profileData.bestAccuracy ? `${profileData.bestAccuracy.toFixed(1)}%` : "0%", icon: "🎯" },
    { label: "Average Accuracy", value: profileData.avgAccuracy ? `${profileData.avgAccuracy.toFixed(1)}%` : "0%", icon: "📈" },
    { label: "Tests Taken", value: profileData.testsTaken || 0, icon: "✍️" },
    { label: "Tests Completed", value: profileData.testsCompleted || 0, icon: "✅" },
  ];

  return (
    <main
      className="min-h-screen p-8"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Header with back button */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
            style={{ backgroundColor: "var(--card)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            <span>Back to Home</span>
          </button>

          {isOwnProfile && isAuthenticated && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg hover:opacity-80 transition-opacity text-white font-medium"
              style={{ backgroundColor: "var(--primary)" }}
            >
              Logout
            </button>
          )}
        </div>

        {/* Profile Header */}
        <div
          className="rounded-2xl p-8 mb-8 shadow-lg"
          style={{ backgroundColor: "var(--card)" }}
        >
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold"
              style={{ backgroundColor: "var(--primary)", color: "#ffffff" }}
            >
              {profileData.username?.charAt(0).toUpperCase() || "U"}
            </div>

            {/* User Info */}
            <div>
              <h1 className="text-4xl font-bold mb-2">{profileData.username}</h1>
              <p className="text-lg opacity-70">{profileData.email}</p>
              {profileData.isPremium && (
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: "var(--primary)", color: "#ffffff" }}>
                  ⭐ Premium Member
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              style={{ backgroundColor: "var(--card)" }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{stat.icon}</span>
              </div>
              <h3 className="text-sm font-medium opacity-70 mb-2">
                {stat.label}
              </h3>
              <p className="text-4xl font-bold" style={{ color: "var(--primary)" }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Info Section */}
        <div
          className="rounded-2xl p-8 mt-8 shadow-lg"
          style={{ backgroundColor: "var(--card)" }}
        >
          <h2 className="text-2xl font-bold mb-4">Account Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: "var(--border)" }}>
              <span className="opacity-70">Member Since</span>
              <span className="font-medium">
                {profileData.createdAt
                  ? new Date(profileData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: "var(--border)" }}>
              <span className="opacity-70">Email Verified</span>
              <span className="font-medium">
                {profileData.isEmailVerified ? "✅ Yes" : "❌ No"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="opacity-70">Free AI Feedback Remaining</span>
              <span className="font-medium">{profileData.freeFeedbackLeft || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
