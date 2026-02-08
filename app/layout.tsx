import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SoundProvider } from "@/components/shared/sound-provider";
import { ThemeProvider } from "@/components/shared/theme-provider";
import "./globals.css";

export const metadataBase = new URL("https://githistorian.com");

export const metadata: Metadata = {
  title: "Git Historian — Every codebase has a story",
  description:
    "AI-narrated interactive timeline documentary of how your codebase evolved. Paste a repo URL and explore its history.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "Git Historian — Every codebase has a story",
    description:
      "AI-narrated interactive timeline documentary of how your codebase evolved. Paste a repo URL and explore its history.",
    type: "website",
    siteName: "Git Historian",
  },
  twitter: {
    card: "summary",
    title: "Git Historian — Every codebase has a story",
    description:
      "AI-narrated interactive timeline documentary of how your codebase evolved. Paste a repo URL and explore its history.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Git Historian",
  description:
    "AI-narrated interactive timeline documentary of how your codebase evolved. Paste a repo URL and explore its history.",
  url: "https://githistorian.com",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider>
          <SoundProvider>
            {children}
            <Analytics />
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
