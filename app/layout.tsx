import type { Metadata } from "next";
import { SoundProvider } from "@/components/shared/sound-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Git Historian — Every codebase has a story",
  description:
    "AI-narrated interactive timeline documentary of how your codebase evolved. Paste a repo URL and explore its history.",
  openGraph: {
    title: "Git Historian",
    description: "Every codebase has a story.",
    siteName: "Git Historian",
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
          <SoundProvider>{children}</SoundProvider>
        </body>
    </html>
  );
}
