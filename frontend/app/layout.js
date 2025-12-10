import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";
import OnlineStatusIndicator from "./components/OnlineStatusIndicator";
import CacheWarmer from "./components/CacheWarmer";
import ServiceWorkerInit from "./components/ServiceWorkerInit";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TypeDev - Typing Speed Test",
  description: "Improve your typing speed with TypeDev",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#60a5fa" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <UserProvider>
            <ServiceWorkerInit />
            <OnlineStatusIndicator />
            <CacheWarmer />
            {children}
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
