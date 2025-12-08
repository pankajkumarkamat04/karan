import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import Provider from "./provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blox Fruit Hub",
  description: "Blox Fruit Hub",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Provider>
          <Suspense>{children}</Suspense>
        </Provider>
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              background: "#32250aff",
              // color: "#fada1d", 
              border: "1px solid #fada1d",
            },
          }}
        />
      </body>
    </html>
  );
}
