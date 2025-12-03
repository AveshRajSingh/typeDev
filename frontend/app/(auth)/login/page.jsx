"use client";
import React, { useState } from "react";
import ThemeSelector from "../../components/ThemeSelector";

const page = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Add your login API call here
      console.log("Login attempt:", formData);
      // Example: await login(formData.usernameOrEmail, formData.password)
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="absolute top-4 right-4">
        <ThemeSelector />
      </div>

      <div
        className="w-full max-w-md p-8 rounded-lg"
        style={{
          backgroundColor: "var(--card)",
          borderWidth: "2px",
          borderStyle: "solid",
          borderColor: "var(--primary)",
        }}
      >
        <h1
          className="text-center mb-6 text-3xl font-bold"
          style={{ color: "var(--foreground)" }}
        >
          Log in
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="usernameOrEmail"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Username or Email
            </label>
            <input
              type="text"
              id="usernameOrEmail"
              name="usernameOrEmail"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "var(--input)",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "var(--inputBorder)",
                color: "var(--foreground)",
              }}
              placeholder="Enter username or email"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "var(--input)",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "var(--inputBorder)",
                color: "var(--foreground)",
              }}
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md font-semibold transition-colors duration-200"
            style={{
              backgroundColor: "var(--primary)",
              color: "#ffffff",
            }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = "var(--primaryHover)")
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "var(--primary)")
            }
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default page;
