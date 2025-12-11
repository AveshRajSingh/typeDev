"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import { createOrder, getMyOrders } from "../services/payment.api";

const PLANS = [
  {
    type: "monthly",
    name: "Monthly Premium",
    price: 69,
    duration: "30 days",
    features: [
      "Unlimited typing tests",
      "100 AI feedback credits/month",
      "50 AI paragraph generations/month",
      "Advanced statistics",
      "Priority support"
    ],
    badge: null,
    color: "blue"
  },
  {
    type: "yearly",
    name: "Yearly Premium",
    price: 200,
    duration: "365 days",
    features: [
      "Everything in Monthly",
      "Save ₹628 per year",
      "1200 AI feedback credits/year",
      "600 AI paragraph generations/year",
      "Early access to new features"
    ],
    badge: "BEST VALUE",
    color: "purple"
  },
  {
    type: "lifetime",
    name: "Lifetime Premium",
    price: 599,
    duration: "Forever",
    features: [
      "Everything in Yearly",
      "One-time payment",
      "Unlimited AI features forever",
      "Lifetime updates",
      "VIP support"
    ],
    badge: "POPULAR",
    color: "green"
  }
];

export default function PremiumPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth?redirect=/premium");
    }
  }, [isAuthenticated, router]);

  // Fetch pending order on mount
  useEffect(() => {
    const fetchPendingOrder = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await getMyOrders(1, 1, true);
        if (response.data?.orders?.length > 0) {
          const pendingOrder = response.data.orders.find(
            order => order.status === 'pending' || order.status === 'submitted'
          );
          
          if (pendingOrder) {
            // Check if order is still valid
            const now = new Date().getTime();
            const expiry = new Date(pendingOrder.expiresAt).getTime();
            
            if (expiry > now) {
              setOrderData({
                orderId: pendingOrder._id,
                planType: pendingOrder.planType,
                amount: pendingOrder.uniqueAmount,
                baseAmount: pendingOrder.baseAmount,
                upiString: pendingOrder.upiString,
                qrCodeBase64: pendingOrder.qrCodeBase64,
                expiresAt: pendingOrder.expiresAt,
                status: pendingOrder.status
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch pending orders:', err);
      }
    };

    fetchPendingOrder();
  }, [isAuthenticated]);

  // Countdown timer for order expiry
  useEffect(() => {
    if (!orderData?.expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(orderData.expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeRemaining(null);
        setError("Order expired. Please create a new order.");
        setOrderData(null);
      } else {
        const minutes = Math.floor(diff / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [orderData]);

  const handleCreateOrder = async (planType) => {
    setLoading(true);
    setError(null);
    setSelectedPlan(planType);

    try {
      const response = await createOrder(planType);
      setOrderData(response.data);
    } catch (err) {
      setError(err.message || "Failed to create order");
      setSelectedPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUPIDeeplink = () => {
    if (orderData?.upiString) {
      window.location.href = orderData.upiString;
    }
  };

  const handleReset = () => {
    setOrderData(null);
    setSelectedPlan(null);
    setError(null);
  };

  const handleNavigateToSubmit = () => {
    router.push(`/payment-status/${orderData.orderId}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Show QR code if order is created
  if (orderData) {
    return (
      <div className="min-h-screen py-8 px-4" style={{ backgroundColor: "var(--background)" }}>
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3" style={{ color: "var(--foreground)" }}>
              Complete Your Payment
            </h1>
            <p className="text-lg" style={{ color: "var(--secondary)" }}>
              Your order is ready! Choose your preferred payment method below
            </p>
          </div>

          {/* Timer Alert */}
          {timeRemaining && (
            <div className="max-w-2xl mx-auto mb-6 rounded-xl p-4 text-center animate-pulse" style={{ backgroundColor: "var(--warning-bg)", border: "2px solid var(--warning-border)" }}>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">⏰</span>
                <p className="font-bold text-lg" style={{ color: "var(--warning-text)" }}>
                  Order expires in: {timeRemaining}
                </p>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Left Column - Order Details & QR Code */}
            <div className="space-y-6">
              {/* Order Summary Card */}
              <div className="rounded-2xl shadow-lg p-6" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)" }}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                  <span>📋</span> Order Summary
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
                    <span className="text-sm font-medium" style={{ color: "var(--secondary)" }}>Plan Type</span>
                    <span className="font-semibold capitalize text-lg" style={{ color: "var(--foreground)" }}>
                      {orderData.planType} Premium
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
                    <span className="text-sm font-medium" style={{ color: "var(--secondary)" }}>Order ID</span>
                    <span className="font-mono text-sm px-3 py-1 rounded" style={{ backgroundColor: "var(--secondary-bg)", color: "var(--foreground)" }}>
                      {orderData.orderId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-medium" style={{ color: "var(--secondary)" }}>Total Amount</span>
                    <div className="text-right">
                      <div className="text-3xl font-bold" style={{ color: "var(--success)" }}>
                        ₹{orderData.amount}
                      </div>
                      <div className="text-xs" style={{ color: "var(--secondary)" }}>
                        Inclusive of all taxes
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code Card */}
              <div className="rounded-2xl shadow-lg p-6 text-center" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)" }}>
                <h2 className="text-xl font-bold mb-4" style={{ color: "var(--foreground)" }}>
                  Scan to Pay
                </h2>
                <div className="flex justify-center mb-4">
                  {orderData.qrCodeBase64 ? (
                    <div className="rounded-2xl p-4 inline-block" style={{ backgroundColor: "var(--qr-bg)", border: "3px solid var(--border)", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                      <img
                        src={orderData.qrCodeBase64}
                        alt="UPI QR Code"
                        className="w-56 h-56 sm:w-64 sm:h-64"
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl p-4 inline-block" style={{ backgroundColor: "var(--secondary-bg)", border: "3px solid var(--border)" }}>
                      <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center" style={{ color: "var(--secondary)" }}>
                        <div className="text-center">
                          <div className="text-4xl mb-2">⏳</div>
                          <div>Loading QR Code...</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm" style={{ color: "var(--secondary)" }}>
                  Scan with any UPI app to pay instantly
                </p>
              </div>
            </div>

            {/* Right Column - Payment Instructions & Actions */}
            <div className="space-y-6">
              {/* Payment Instructions Card */}
              <div className="rounded-2xl shadow-lg p-6" style={{ backgroundColor: "var(--info-bg)", border: "1px solid var(--info-border)" }}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "var(--info-text)" }}>
                  <span>💡</span> How to Complete Payment
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: "var(--primary)" }}>
                      1
                    </div>
                    <div>
                      <p className="font-semibold mb-1" style={{ color: "var(--info-text)" }}>Open Your UPI App</p>
                      <p className="text-sm" style={{ color: "var(--info-text)", opacity: 0.9 }}>
                        Use GPay, PhonePe, Paytm, or any UPI-enabled app
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: "var(--primary)" }}>
                      2
                    </div>
                    <div>
                      <p className="font-semibold mb-1" style={{ color: "var(--info-text)" }}>Scan or Click Button</p>
                      <p className="text-sm" style={{ color: "var(--info-text)", opacity: 0.9 }}>
                        Scan the QR code or use the "Pay with UPI" button below
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: "var(--primary)" }}>
                      3
                    </div>
                    <div>
                      <p className="font-semibold mb-1" style={{ color: "var(--info-text)" }}>Complete Payment</p>
                      <p className="text-sm" style={{ color: "var(--info-text)", opacity: 0.9 }}>
                        Enter your UPI PIN and confirm the payment of ₹{orderData.amount}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: "var(--primary)" }}>
                      4
                    </div>
                    <div>
                      <p className="font-semibold mb-1" style={{ color: "var(--info-text)" }}>Submit Transaction ID</p>
                      <p className="text-sm" style={{ color: "var(--info-text)", opacity: 0.9 }}>
                        After payment, submit your UPI transaction ID for verification
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleUPIDeeplink}
                  className="w-full text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-2xl hover:scale-105 transform"
                  style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)" }}
                >
                  <span className="flex items-center justify-center gap-3">
                    <span className="text-2xl">📱</span>
                    <span className="text-lg">Pay with UPI App</span>
                  </span>
                </button>

                <button
                  onClick={handleNavigateToSubmit}
                  className="w-full text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 transform"
                  style={{ backgroundColor: "var(--success)" }}
                >
                  <span className="flex items-center justify-center gap-3">
                    <span className="text-2xl">✅</span>
                    <span className="text-lg">I've Paid - Submit Transaction ID</span>
                  </span>
                </button>

                <button
                  onClick={handleReset}
                  className="w-full font-semibold py-3 px-6 rounded-xl transition-all hover:scale-105 transform"
                  style={{ backgroundColor: "var(--secondary-bg)", color: "var(--foreground)", border: "1px solid var(--border)" }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>←</span>
                    <span>Back to Plans</span>
                  </span>
                </button>
              </div>

              {/* Support Note */}
              <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "var(--secondary-bg)", border: "1px solid var(--border)" }}>
                <p className="text-sm" style={{ color: "var(--secondary)" }}>
                  Need help? Contact our support team for assistance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show plan selection
  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4" style={{ color: "var(--foreground)" }}>
            Upgrade to Premium
          </h1>
          <p className="text-xl" style={{ color: "var(--secondary)" }}>
            Unlock unlimited features and supercharge your typing practice
          </p>
          {user?.isPremium && (
            <div className="mt-4 inline-block px-4 py-2 rounded-full" style={{ backgroundColor: "var(--success-bg)", color: "var(--success-text)" }}>
              ✨ You already have Premium! Extend or upgrade below.
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 rounded-lg p-4" style={{ backgroundColor: "var(--error-bg)", border: "1px solid var(--error-border)" }}>
            <p className="text-center" style={{ color: "var(--error-text)" }}>{error}</p>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {PLANS.map((plan) => (
            <div
              key={plan.type}
              className="relative rounded-2xl shadow-xl overflow-hidden transform transition-all hover:scale-105"
              style={{
                backgroundColor: "var(--card-bg)",
                border: plan.badge ? "4px solid var(--primary)" : "1px solid var(--border)"
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute top-0 right-0 text-white px-4 py-1 text-sm font-bold rounded-bl-lg" style={{ backgroundColor: "var(--primary)" }}>
                  {plan.badge}
                </div>
              )}

              {/* Plan Header */}
              <div className="text-white p-8" style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)" }}>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold">₹{plan.price}</span>
                  <span className="ml-2 text-lg opacity-90">/{plan.duration}</span>
                </div>
              </div>

              {/* Features */}
              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        className="w-6 h-6 mr-3 shrink-0"
                        style={{ color: "var(--primary)" }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span style={{ color: "var(--foreground)" }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleCreateOrder(plan.type)}
                  disabled={loading && selectedPlan === plan.type}
                  className="w-full text-white font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)" }}
                >
                  {loading && selectedPlan === plan.type ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Order...
                    </span>
                  ) : (
                    `Get ${plan.name}`
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto rounded-2xl shadow-xl p-8" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)" }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--foreground)" }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                How do I pay?
              </h3>
              <p style={{ color: "var(--secondary)" }}>
                After selecting a plan, you'll receive a UPI QR code. Scan it with any UPI app
                (GPay, PhonePe, Paytm, etc.) and complete the payment.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                When will my premium activate?
              </h3>
              <p style={{ color: "var(--secondary)" }}>
                After payment, submit your UPI transaction ID. Our team will verify it within 24 hours
                and activate your premium.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                Can I get a refund?
              </h3>
              <p style={{ color: "var(--secondary)" }}>
                Yes, we offer refunds within 7 days of purchase if you're not satisfied.
                Contact support with your order ID.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
