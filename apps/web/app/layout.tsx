import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kairo",
  description: "Kairo — Seize the Moment. AI-powered UTME learning.",
};

// viewportFit: "cover" lets the safe-area-inset-* env() variables the
// splash screen relies on actually resolve to non-zero values behind
// the iOS Dynamic Island / notch and Android status bar cutouts.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#012748",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="bg-kairo-navy-900 font-body antialiased">
        {children}
      </body>
    </html>
  );
}
