"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import { createOrder } from "../services/payment.api";

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

export default function PremiumPlans() {
  const router = useRouter();
  const { user, isAuthenticated } = useUser();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handlePlanClick = async (planType) => {
    // Check if user is logged in
    if (!isAuthenticated) {
      router.push("/auth?redirect=/premium");
      return;
    }

    // User is logged in, create order
    setLoading(true);
    setSelectedPlan(planType);

    try {
      const response = await createOrder(planType);
      // Redirect to premium page with order data
      router.push("/premium");
    } catch (err) {
      console.error("Failed to create order:", err);
      // If there's already a pending order, redirect to premium page
      if (err.message.includes("already have a pending order")) {
        router.push("/premium");
      } else {
        alert(err.message || "Failed to create order. Please try again.");
      }
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="w-full py-16 px-4" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4" style={{ color: "var(--foreground)" }}>
            Upgrade to Premium
          </h2>
          <p className="text-xl" style={{ color: "var(--secondary)" }}>
            Choose the perfect plan for your typing journey
          </p>
          {user?.isPremium && (
            <div className="mt-4 inline-block px-4 py-2 rounded-full" style={{ backgroundColor: "var(--success-bg)", color: "var(--success-text)" }}>
              ✨ You already have Premium!
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div className="flex flex-row justify-center items-stretch gap-6 w-full transition-all ease-in-out">
          {PLANS.map((plan) => (
            <div
              key={plan.type}
              className="relative rounded-3xl shadow-2xl overflow-hidden transition-all hover:scale-105 flex-1 max-w-xs w-full"
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border)"
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  className="absolute top-4 right-4 text-white px-3 py-1 text-xs font-bold rounded-full"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {plan.badge}
                </div>
              )}

              {/* Plan Content */}
              <div className="p-5">
                {/* Plan Name */}
                <h3 className="text-base font-semibold mb-4" style={{ color: "var(--secondary)" }}>
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline mb-1">
                    <span className="text-4xl font-bold" style={{ color: "var(--foreground)" }}>
                      ₹{plan.price}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--secondary)" }}>
                    per {plan.duration}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-xs">
                      <svg
                        className="w-4 h-4 mr-2 shrink-0 mt-0.5"
                        style={{ color: "var(--success)" }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span style={{ color: "var(--foreground)" }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handlePlanClick(plan.type)}
                  disabled={loading && selectedPlan === plan.type}
                  className="w-full text-white font-semibold py-3 text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 hover:shadow-lg"
                  style={{
                    backgroundColor: loading && selectedPlan === plan.type
                      ? '#9ca3af'
                      : "var(--primary)",
                  }}
                >
                  {loading && selectedPlan === plan.type ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    `Choose Plan`
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Text */}
        <div className="text-center mt-8">
          <p className="text-sm" style={{ color: "var(--secondary)" }}>
            {isAuthenticated
              ? "Click on any plan to proceed with payment"
              : "Please login to purchase a premium plan"}
          </p>
        </div>
      </div>
    </div>
  );
}
