import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "sonner";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const isLocal = process.env.NODE_ENV === "development";
const titleSuffix = isLocal ? "Family Pack - LOCAL" : "Family Pack";

export const metadata: Metadata = {
  title: {
    default: titleSuffix,
    template: `%s — ${titleSuffix}`,
  },
  description:
    "Backpacking gear management for couples, families, and pets. Track weights, plan trips, and balance packs across your whole household.",
  openGraph: {
    title: "Family Pack",
    description: "Backpacking gear management for couples, families, and pets.",
    siteName: "Family Pack",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#13140f" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem("theme");if(t!=="light")document.documentElement.classList.add("dark")}catch(e){document.documentElement.classList.add("dark")}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="bottom-right" />
        <Analytics />
      </body>
    </html>
  );
}
