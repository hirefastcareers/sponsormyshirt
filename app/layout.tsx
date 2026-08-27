import type { Metadata } from "next";
import Script from "next/script";
import { Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const SITE_URL = "https://www.sponsormyshirt.app";
const OG_IMAGE_URL = `${SITE_URL}/og-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Sponsor My Shirt | Own a Piece of the Kit",
  description:
    "Sponsor a slot on my kit for the Great North Run and get your brand featured!",
  openGraph: {
    title: "Sponsor My Shirt | Own a Piece of the Kit",
    description:
      "Sponsor a slot on my kit for the Great North Run and get your brand featured!",
    url: SITE_URL,
    siteName: "Sponsor My Shirt",
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Sponsor My Shirt Kit Preview",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sponsor My Shirt | Own a Piece of the Kit",
    description:
      "Sponsor a slot on my kit for the Great North Run and get your brand featured!",
    images: [OG_IMAGE_URL],
  },
};

const VEMETRIC_TOKEN = "zE4bqXjTb5RDh9Vb";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${ibmPlexMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-[#F9F9FB] font-sans text-zinc-900">
        <Script
          src="https://cdn.vemetric.com/v1.js"
          strategy="afterInteractive"
          data-token={VEMETRIC_TOKEN}
          data-host="https://hub.vemetric.com"
        />
        {children}
      </body>
    </html>
  );
}
