import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.smpn1rangsangbarat.web.id"),
  title: "SMPN 1 Rangsang Barat - Pengumuman Kelulusan",
  description: "Cek hasil kelulusan siswa secara online. Masukkan NISN untuk mengetahui hasil kelulusan Anda.",
  icons: [{ rel: "icon", url: "/logo.png" }],
  openGraph: {
    title: "SMPN 1 Rangsang Barat - Pengumuman Kelulusan",
    description: "Cek hasil kelulusan siswa secara online. Masukkan NISN untuk mengetahui hasil kelulusan Anda.",
    url: "https://smpn1rangsangbarat.web.id",
    siteName: "SMPN 1 Rangsang Barat",
    images: [{ url: "/lulus.png", width: 1200, height: 630, alt: "Pengumuman Kelulusan SMPN 1 Rangsang Barat" }],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SMPN 1 Rangsang Barat - Pengumuman Kelulusan",
    description: "Cek hasil kelulusan siswa secara online. Masukkan NISN untuk mengetahui hasil kelulusan Anda.",
    images: ["/lulus.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
