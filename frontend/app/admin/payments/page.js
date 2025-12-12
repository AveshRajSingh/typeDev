"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "../../context/UserContext";
import {
  getPendingOrders,
  verifyOrder,
  reconcilePayments,
  getNotifications,
  markNotificationRead
} from "../../services/api";

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: userLoading } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState("pending");
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [verifyNotes, setVerifyNotes] = useState("");
  const [reconcileFile, setReconcileFile] = useState(null);
  const [reconcileResult, setReconcileResult] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check admin access
  useEffect(() => {
    // Wait for user context to load
    if (userLoading) return;
    
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    if (user && !user.isAdmin) {
      router.push("/");
      return;
    }
  }, [isAuthenticated, user, router, userLoading]);

  // Fetch data
  useEffect(() => {
    if (user?.isAdmin) {
      fetchData();
    }
  }, [user, activeTab]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (user?.isAdmin) {
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (activeTab === "pending") {
        const response = await getPendingOrders("submitted", 1, 50);
        setOrders(response.data.orders);
      } else if (activeTab === "notifications") {
        const response = await getNotifications(null, 50);
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (orderId, action) => {
    if (action === "reject" && !verifyNotes) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      await verifyOrder(orderId, action, verifyNotes);
      alert(`Order ${action === "approve" ? "approved" : "rejected"} successfully!`);
      setSelectedOrder(null);
      setVerifyNotes("");
      fetchData();
    } catch (err) {
      alert(err.message || `Failed to ${action} order`);
    }
  };

  const handleReconcile = async (e) => {
    e.preventDefault();

    if (!reconcileFile) {
      alert("Please select a CSV file");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await reconcilePayments(reconcileFile);
      setReconcileResult(response.data);
      setReconcileFile(null);
      alert(`Reconciliation complete! Matched: ${response.data.matched}, Auto-verified: ${response.data.autoVerified}`);
    } catch (err) {
      setError(err.message || "Reconciliation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationRead(notification._id);
        fetchData();
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Management</h1>
          <p className="text-gray-600">Manage orders, reconcile payments, and view notifications</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-4 font-semibold ${
                activeTab === "pending"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Pending Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("reconcile")}
              className={`px-6 py-4 font-semibold ${
                activeTab === "reconcile"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Reconcile CSV
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`px-6 py-4 font-semibold relative ${
                activeTab === "notifications"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Notifications
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Pending Orders Tab */}
        {activeTab === "pending" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Pending Verification</h2>
                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <svg className="animate-spin h-12 w-12 mx-auto text-blue-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-gray-600 mt-4">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No pending orders</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Txn ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold text-gray-900">{order.userId?.username}</div>
                              <div className="text-sm text-gray-500">{order.userId?.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm capitalize">
                              {order.planType}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-green-600">₹{order.uniqueAmount}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm">{order.userSubmittedTxnId || "N/A"}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reconciliation Tab */}
        {activeTab === "reconcile" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Bank Statement Reconciliation</h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Instructions:</h3>
              <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
                <li>Download your bank statement as CSV from Union Bank</li>
                <li>Ensure it has columns: Date, Credit, Transaction ID, Description</li>
                <li>Upload the CSV file below</li>
                <li>System will auto-match and verify high-confidence payments</li>
              </ol>
            </div>

            <form onSubmit={handleReconcile} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Upload Bank Statement CSV
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setReconcileFile(e.target.files[0])}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !reconcileFile}
                className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Start Reconciliation"}
              </button>
            </form>

            {reconcileResult && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-4">✅ Reconciliation Complete</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">{reconcileResult.total}</div>
                    <div className="text-sm text-gray-600">Total Transactions</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">{reconcileResult.matched}</div>
                    <div className="text-sm text-gray-600">Matched</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600">{reconcileResult.autoVerified}</div>
                    <div className="text-sm text-gray-600">Auto-Verified</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-600">{reconcileResult.unmatched}</div>
                    <div className="text-sm text-gray-600">Unmatched</div>
                  </div>
                </div>

                {reconcileResult.needsReview?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Needs Manual Review:</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      {reconcileResult.needsReview.slice(0, 5).map((item, idx) => (
                        <li key={idx}>
                          Order {item.orderId} - ₹{item.amount} - {item.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No notifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        notif.isRead
                          ? "bg-gray-50 border-gray-200"
                          : "bg-blue-50 border-blue-300 shadow"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{notif.title}</h3>
                          <p className="text-gray-700 text-sm mb-2">{notif.message}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(notif.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notif.isRead && (
                          <div className="ml-4">
                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                              New
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">User:</span>
                    <p className="font-semibold">{selectedOrder.userId?.username}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.userId?.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Plan:</span>
                    <p className="font-semibold capitalize">{selectedOrder.planType}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <p className="font-semibold text-green-600">₹{selectedOrder.uniqueAmount}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">UPI Transaction ID:</span>
                    <p className="font-mono text-sm">{selectedOrder.userSubmittedTxnId || "N/A"}</p>
                  </div>
                </div>

                {selectedOrder.screenshotUrl && (
                  <div>
                    <span className="text-gray-600 block mb-2">Payment Screenshot:</span>
                    <img
                      src={`http://localhost:5000${selectedOrder.screenshotUrl}`}
                      alt="Payment proof"
                      className="max-w-full rounded-lg border"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Notes (optional for approval, required for rejection):
                  </label>
                  <textarea
                    value={verifyNotes}
                    onChange={(e) => setVerifyNotes(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Add verification notes..."
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => handleVerify(selectedOrder._id, "approve")}
                  className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700"
                >
                  ✅ Approve & Activate Premium
                </button>
                <button
                  onClick={() => handleVerify(selectedOrder._id, "reject")}
                  className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700"
                >
                  ❌ Reject Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
