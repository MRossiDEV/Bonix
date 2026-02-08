import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthSessionSync } from "@/app/components/AuthSessionSync";
import { ServiceWorkerRegistration } from "@/app/components/ServiceWorkerRegistration";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Bonix",
  description: "Save money where you already eat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <ServiceWorkerRegistration />
        <AuthSessionSync />
        {children}
      </body>
    </html>
  );
}
