import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic } from "next/font/google";

import { ThemeProvider } from "@/providers/theme-provider";
import { LocaleProvider } from "@/providers/locale-provider";
import { readServerLocale } from "@/i18n/locale-server";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-sans-arabic",
  weight: ["400", "500", "600"],
  subsets: ["arabic"],
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