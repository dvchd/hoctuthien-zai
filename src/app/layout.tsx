import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth";

// Inter font with Vietnamese support
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Học Từ Thiện - Nền tảng kết nối Mentor & Mentee",
  description: "Nền tảng học từ thiện kết nối 1-1 giữa Mentor và Mentee. Học phí được chuyển khoản trực tiếp sang quỹ Thiện Nguyện App của MBBank.",
  keywords: ["Học từ thiện", "Mentor", "Mentee", "Giáo dục", "Thiện nguyện", "MBBank"],
  authors: [{ name: "Học Từ Thiện Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Học Từ Thiện",
    description: "Nền tảng học từ thiện kết nối Mentor và Mentee",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
