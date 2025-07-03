// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "imgs-pdf - Convert images to PDF easily",
  description:
    "A simple and fast way to turn your photos or images into printable PDF documents.",
  generator: "v0.dev",
  keywords: [
    "image to pdf",
    "convert image pdf",
    "imgs-pdf",
    "photo to pdf",
    "online pdf",
  ],
  themeColor: "#18181C",
  applicationName: "imgs-pdf",
  metadataBase: new URL("https://imgs-pdf.vercel.app/"),

  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "imgs-pdf",
    title: "imgs-pdf - Convert images to PDF easily",
    description:
      "A simple and fast way to turn your photos or images into printable PDF documents.",
    images: [
      {
        url: "/cover.png",
        width: 1200,
        height: 630,
        alt: "imgs-pdf cover image",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "imgs-pdf - Convert images to PDF easily",
    description:
      "A simple and fast way to turn your photos or images into printable PDF documents.",
    images: ["/cover.png"],
  },

  appleWebApp: {
    capable: true,
    title: "imgs-pdf",
  },

  icons: {
    icon: [{ url: "/favicon.png", sizes: "any", type: "image/png" }],
    apple: "/favicon.png",
    other: [
      { rel: "icon", url: "/favicon.png", sizes: "192x192" },
      { rel: "icon", url: "/favicon.png", sizes: "512x512" },
    ],
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
