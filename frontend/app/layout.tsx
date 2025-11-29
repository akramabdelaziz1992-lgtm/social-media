import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "لينك كول - LinkCall",
  description: "منصة ويب احترافية لإدارة محادثات الأقسام عبر صندوق وارد موحد",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&family=Cairo:wght@300;400;500;600;700;800;900&family=Almarai:wght@300;400;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-gray-900 overflow-hidden">
        {/* Animated Starry Night Background */}
        <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-purple-900 to-black overflow-hidden">
          {/* Stars Layer */}
          <div className="absolute inset-0">
            {[...Array(150)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              >
                <div
                  className="w-1 h-1 bg-white rounded-full opacity-70"
                  style={{
                    boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Shooting Stars */}
          <div className="absolute inset-0">
            {[...Array(3)].map((_, i) => (
              <div
                key={`shooting-${i}`}
                className="absolute w-px h-px bg-white opacity-80"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 50}%`,
                  animationDelay: `${Math.random() * 10 + 5}s`,
                  animationDuration: '3s',
                  animationIterationCount: 'infinite',
                  transform: 'rotate(45deg)',
                  boxShadow: '0 0 20px rgba(255, 255, 255, 0.8)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shooting-star" />
              </div>
            ))}
          </div>

          {/* Nebula Effect */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-600 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
