import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "sonner";
import { cookies } from "next/headers";
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
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read the theme cookie server-side so the `class="dark"` on <html> matches
  // whatever the client is about to show. This avoids hydration reconciliation
  // fighting the inline script (which was re-adding "dark" after the script
  // had removed it, so light mode didn't persist on reload). The inline script
  // stays as a fallback for the first visit before any cookie is written — it
  // migrates an older `localStorage.theme` value into a cookie.
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value;
  const isDark = theme !== "light"; // default to dark when the cookie is missing

  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${jetbrainsMono.variable} h-full antialiased${isDark ? " dark" : ""}`}
      style={{ colorScheme: isDark ? "dark" : "light" }}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var m=document.cookie.match(/(?:^|;\\s*)theme=(light|dark)/);var c=m?m[1]:null;if(!c){var l=localStorage.getItem("theme");if(l==="light"||l==="dark"){c=l;document.cookie="theme="+l+"; path=/; max-age=31536000; SameSite=Lax"}}if(c==="light"){document.documentElement.classList.remove("dark");document.documentElement.style.colorScheme="light"}else if(c==="dark"){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark"}}catch(e){}`,
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
