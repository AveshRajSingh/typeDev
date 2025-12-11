"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { getOrderStatus, submitTransaction } from "../../services/api";

const STATUS_CONFIG = {
  pending: {
    label: "Pending Payment",
    color: "yellow",
    icon: "⏳",
    description: "Waiting for payment"
  },
  submitted: {
    label: "Verifying Payment",
    color: "blue",
    icon: "🔍",
    description: "Your payment is being verified"
  },
  verified: {
    label: "Payment Verified",
    color: "green",
    icon: "✅",
    description: "Premium activated successfully!"
  },
  expired: {
    label: "Order Expired",
    color: "red",
    icon: "⏰",
    description: "This order has expired"
  },
  failed: {
    label: "Payment Failed",
    color: "red",
    icon: "❌",
    description: "Payment verification failed"
  }
};

export default function PaymentStatusPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId;
  const { isAuthenticated, fetchCurrentUser } = useUser();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    upiTransactionId: "",
    screenshot: null
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch order status
  const fetchOrderStatus = async () => {
    try {
      const response = await getOrderStatus(orderId);
      setOrder(response.data);
      setError(null);

      // If verified, refresh user data
      if (response.data.status === "verified") {
        await fetchCurrentUser();
      }
    } catch (err) {
      setError(err.message || "Failed to fetch order status");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/auth?redirect=/payment-status/" + orderId);
      return;
    }

    if (orderId) {
      fetchOrderStatus();
    }
  }, [orderId, isLoggedIn]);

  // Poll for status updates every 5 seconds if submitted
  useEffect(() => {
    if (order?.status === "submitted") {
      const interval = setInterval(fetchOrderStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [order?.status]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }
    setFormData(prev => ({ ...prev, screenshot: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.upiTransactionId.match(/^\d{12}$/)) {
      alert("Please enter a valid 12-digit UPI transaction ID");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await submitTransaction(orderId, formData.upiTransactionId, formData.screenshot);
      setSubmitSuccess(true);
      await fetchOrderStatus();
    } catch (err) {
      setError(err.message || "Failed to submit transaction");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 mx-auto mb-4 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/premium")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all"
          >
            Back to Premium
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-8">
            <div className="text-7xl mb-4">{statusInfo.icon}</div>
            <h1 className={`text-3xl font-bold text-${statusInfo.color}-600 mb-2`}>
              {statusInfo.label}
            </h1>
            <p className="text-gray-600 text-lg">{statusInfo.description}</p>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Order Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono text-sm text-gray-900">{order.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="font-semibold text-gray-900 capitalize">{order.planType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="text-xl font-bold text-green-600">₹{order.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
                  {statusInfo.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="text-gray-900">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>
              {order.verifiedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Verified:</span>
                  <span className="text-gray-900">
                    {new Date(order.verifiedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status-specific content */}
          {order.status === "pending" && !submitSuccess && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Action Required</h3>
              <p className="text-yellow-800">
                Please complete the payment and submit your UPI transaction ID below.
              </p>
            </div>
          )}

          {order.status === "submitted" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verification in Progress
              </h3>
              <p className="text-blue-800">
                Our team is verifying your payment. You'll receive an email confirmation once verified (usually within 24 hours).
              </p>
            </div>
          )}

          {order.status === "verified" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-green-900 mb-2">🎉 Premium Activated!</h3>
              <p className="text-green-800">
                Your premium subscription is now active. Enjoy unlimited features!
              </p>
              <button
                onClick={() => router.push("/profile/" + user?.username)}
                className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all"
              >
                Go to Profile
              </button>
            </div>
          )}

          {order.status === "expired" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-red-900 mb-2">Order Expired</h3>
              <p className="text-red-800">
                This order has expired. Please create a new order to continue.
              </p>
              <button
                onClick={() => router.push("/premium")}
                className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-all"
              >
                Create New Order
              </button>
            </div>
          )}

          {/* Transaction Submission Form */}
          {(order.status === "pending" || order.status === "submitted") && !submitSuccess && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  UPI Transaction ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="upiTransactionId"
                  value={formData.upiTransactionId}
                  onChange={handleInputChange}
                  placeholder="Enter 12-digit transaction ID"
                  maxLength="12"
                  pattern="\d{12}"
                  required
                  disabled={order.status === "submitted"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Find this in your UPI app's transaction history
                </p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Payment Screenshot <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  disabled={order.status === "submitted"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload a screenshot for faster verification (max 5MB)
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {order.status === "pending" && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Submit Transaction Details"
                  )}
                </button>
              )}
            </form>
          )}

          {submitSuccess && order.status === "submitted" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-2">✅ Submitted Successfully!</h3>
              <p className="text-green-800">
                Your transaction details have been submitted. We'll verify your payment and activate premium within 24 hours.
              </p>
            </div>
          )}

          {/* Back Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/")}
              className="text-gray-600 hover:text-gray-900 font-semibold"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
