import type { Metadata } from "next";
import localFont from "next/font/local";

import { ThemeProvider } from "@/providers/theme-provider";
import { LocaleProvider } from "@/providers/locale-provider";
import { readServerLocale } from "@/i18n/locale-server";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const ibmPlexSans = localFont({
  variable: "--font-ibm-plex-sans",
  src: [
    {
      path: "../../public/fonts/ibm-plex/IBMPlexSans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/ibm-plex/IBMPlexSans-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/ibm-plex/IBMPlexSans-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  display: "swap",
});

const ibmPlexSansArabic = localFont({
  variable: "--font-ibm-plex-sans-arabic",
  src: [
    {
      path: "../../public/fonts/ibm-plex/IBMPlexSansArabic-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/ibm-plex/IBMPlexSansArabic-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/ibm-plex/IBMPlexSansArabic-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hadaf — Productivity with Elastic Motivation",
  description:
    "Bilingual productivity app built around Minimum Viable Day, day types, and adaptive capacity. BETA scaffold (E0.1).",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await readServerLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexSansArabic.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
