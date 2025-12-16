"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { getUserProfile, getMyOrders } from "../../services/api";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import CacheManager from "../../components/CacheManager";
import { useOfflineRouter } from "../../utils/offlineNavigation";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  submitted: "bg-blue-100 text-blue-800",
  verified: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
  failed: "bg-red-100 text-red-800"
};

const STATUS_LABELS = {
  pending: "Pending",
  submitted: "Verifying",
  verified: "Completed",
  expired: "Expired",
  failed: "Failed"
};

export default function ProfilePage() {
  const router = useOfflineRouter();
  const params = useParams();
  const { user: currentUser, isAuthenticated, logout } = useUser();
  const [profileData, setProfileData] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const username = params.username;
  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    // Only fetch if we don't have data or username changed
    if (!username) return;
    
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

    fetchProfile();
    
    // Fetch payment history if it's user's own profile
    if (isOwnProfile && isAuthenticated) {
      fetchPaymentHistory();
    }
  }, [username, isOwnProfile, isAuthenticated]);

  const fetchPaymentHistory = async () => {
    try {
      setLoadingPayments(true);
      const response = await getMyOrders(1, 10);
      setPaymentHistory(response.data.orders);
    } catch (err) {
      console.error("Failed to load payment history:", err);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    // Navigation is handled by logout function
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
            onClick={() => router.back()}
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

        {/* Payment History - Only for own profile */}
        {isOwnProfile && isAuthenticated && (
          <div
            className="rounded-2xl p-8 mt-8 shadow-lg"
            style={{ backgroundColor: "var(--card)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Payment History</h2>
              <button
                onClick={() => router.push("/premium")}
                className="px-4 py-2 rounded-lg hover:opacity-80 transition-opacity text-white font-medium"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Upgrade to Premium
              </button>
            </div>

            {loadingPayments ? (
              <div className="text-center py-8">
                <p className="opacity-70">Loading payment history...</p>
              </div>
            ) : paymentHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="opacity-70 mb-4">No payment history yet</p>
                <button
                  onClick={() => router.push("/premium")}
                  className="px-6 py-3 rounded-lg hover:opacity-80 transition-opacity text-white font-medium"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  Get Premium Now
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                      <th className="text-left py-3 px-4 font-medium opacity-70">Date</th>
                      <th className="text-left py-3 px-4 font-medium opacity-70">Plan</th>
                      <th className="text-left py-3 px-4 font-medium opacity-70">Amount</th>
                      <th className="text-left py-3 px-4 font-medium opacity-70">Status</th>
                      <th className="text-left py-3 px-4 font-medium opacity-70">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((order) => (
                      <tr
                        key={order._id}
                        className="border-b hover:bg-opacity-50"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <td className="py-3 px-4">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize font-medium">{order.planType}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold">₹{order.uniqueAmount || order.baseAmount}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                            {STATUS_LABELS[order.status]}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => router.push(`/payment-status/${order._id}`)}
                            className="text-sm hover:opacity-70 transition-opacity"
                            style={{ color: "var(--primary)" }}
                          >
                            View Details →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Cache Manager - Only for own profile */}
        {isOwnProfile && (
          <div className="mt-8">
            <CacheManager user={currentUser} />
          </div>
        )}
      </div>
    </main>
  );
}
