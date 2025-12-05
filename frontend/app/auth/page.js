"use client";
import { useRouter } from "next/navigation";
import Login from "../components/auth/Login";
import Signup from "../components/auth/Signup";

export default function AuthPage() {
  const router = useRouter();

  const handleSwitchToSignup = () => {
    // Scroll to signup section or focus on it
    document.getElementById('signup-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSwitchToLogin = () => {
    // Scroll to login section or focus on it
    document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleCloseAuth = () => {
    router.push('/');
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center p-8 py-12"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Back to Home Button */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-6 left-6 p-2 rounded-full hover:opacity-80 transition-opacity"
        style={{ backgroundColor: "var(--primary)" }}
        aria-label="Back to home"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="white"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
      </button>

      {/* Split Layout Container */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Login Section - Left Side */}
        <div
          id="login-section"
          className="rounded-xl shadow-lg p-6 max-w-md mx-auto w-full"
          style={{
            backgroundColor: "var(--card)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Login 
            onSwitchToSignup={handleSwitchToSignup} 
            onClose={handleCloseAuth}
          />
        </div>

        {/* Signup Section - Right Side */}
        <div
          id="signup-section"
          className="rounded-xl shadow-lg p-6 max-w-md mx-auto w-full"
          style={{
            backgroundColor: "var(--card)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Signup onSwitchToLogin={handleSwitchToLogin} />
        </div>
      </div>
    </main>
  );
}
