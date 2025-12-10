"use client";
import React, { useState } from "react";
import { useUser } from "../../context/UserContext";

const Login = ({ onSwitchToSignup, onClose, disabled = false }) => {
  const { login, loading } = useUser();
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState({
    usernameOrEmail: false,
    password: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFocus = (field) => {
    setIsFocused((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setIsFocused((prev) => ({ ...prev, [field]: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    console.log('Login form submitted with:', formData.usernameOrEmail);
    
    try {
      const result = await login(formData.usernameOrEmail, formData.password);
      
      if (result.success) {
        console.log("Login successful:", result.data);
        // Close modal if onClose function is provided
        if (onClose) {
          onClose();
        }
      } else {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-4">
        <h1
          className="text-xl font-bold mb-1"
          style={{ color: "var(--foreground)" }}
        >
          Welcome Back
        </h1>
        <p className="text-sm" style={{ color: "var(--secondary)" }}>
          Sign in to continue your journey
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div
            className="p-3 rounded-lg text-sm"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              color: "#ef4444",
              border: "1px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            {error}
          </div>
        )}

        <div className="relative">
          <label
            htmlFor="usernameOrEmail"
            className={`absolute left-3 transition-all duration-300 ease-out pointer-events-none z-10 ${
              isFocused.usernameOrEmail || formData.usernameOrEmail
                ? "-top-3 text-xs px-2 scale-95"
                : "top-3 text-sm"
            }`}
            style={{
              color: isFocused.usernameOrEmail
                ? "var(--primary)"
                : "var(--secondary)",
              textShadow: isFocused.usernameOrEmail || formData.usernameOrEmail
                ? "0 0 8px var(--card), 0 0 4px var(--card), -1px 0 2px var(--card), 1px 0 2px var(--card), 0 -1px 2px var(--card), 0 1px 2px var(--card)"
                : "none",
            }}
          >
            Username or Email
          </label>
          <input
            type="text"
            id="usernameOrEmail"
            name="usernameOrEmail"
            value={formData.usernameOrEmail}
            onChange={handleChange}
            onFocus={() => handleFocus("usernameOrEmail")}
            onBlur={() => handleBlur("usernameOrEmail")}
            className="w-full px-4 py-2.5 rounded-lg transition-all duration-200 focus:outline-none"
            style={{
              backgroundColor: "var(--input)",
              borderWidth: "2px",
              borderStyle: "solid",
              borderColor: isFocused.usernameOrEmail
                ? "var(--primary)"
                : "transparent",
              color: "var(--foreground)",
              transform: isFocused.usernameOrEmail ? "scale(1.01)" : "scale(1)",
            }}
            required
          />
        </div>

        <div className="relative">
          <label
            htmlFor="password"
            className={`absolute left-3 transition-all duration-300 ease-out pointer-events-none z-10 ${
              isFocused.password || formData.password
                ? "-top-3 text-xs px-2 scale-95"
                : "top-3 text-sm"
            }`}
            style={{
              color: isFocused.password ? "var(--primary)" : "var(--secondary)",
              textShadow: isFocused.password || formData.password
                ? "0 0 8px var(--card), 0 0 4px var(--card), -1px 0 2px var(--card), 1px 0 2px var(--card), 0 -1px 2px var(--card), 0 1px 2px var(--card)"
                : "none",
            }}
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onFocus={() => handleFocus("password")}
            onBlur={() => handleBlur("password")}
            className="w-full px-4 py-2.5 rounded-lg transition-all duration-200 focus:outline-none"
            style={{
              backgroundColor: "var(--input)",
              borderWidth: "2px",
              borderStyle: "solid",
              borderColor: isFocused.password ? "var(--primary)" : "transparent",
              color: "var(--foreground)",
              transform: isFocused.password ? "scale(1.01)" : "scale(1)",
            }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || disabled}
          className="w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 hover:brightness-90 active:brightness-75 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "var(--primary)",
            color: "#ffffff",
          }}
        >
          {loading ? "Signing In..." : disabled ? "Offline - Sign In Disabled" : "Sign In"}
        </button>
      </form>

      <div className="relative my-4">
        <div
          className="absolute inset-0 flex items-center"
          style={{ borderTop: "1px solid var(--border)" }}
        ></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span
            className="px-2"
            style={{ backgroundColor: "var(--card)", color: "var(--secondary)" }}
          >
            Or
          </span>
        </div>
      </div>

      <div className="text-center">
        <p style={{ color: "var(--foreground)" }} className="text-sm">
          Don't have an account?{" "}
          <button
            onClick={onSwitchToSignup}
            className="font-semibold transition-all duration-200 hover:underline inline-flex items-center gap-1 group"
            style={{ color: "var(--primary)" }}
          >
            Create Account
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
