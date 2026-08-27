import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Sponsor My Shirt | Own a Piece of the Kit",
  description:
    "Sponsor a slot on my kit for the Great North Run and get your brand featured!",
  metadataBase: new URL("https://www.sponsormyshirt.app"),
  openGraph: {
    title: "Sponsor My Shirt | Own a Piece of the Kit",
    description:
      "Sponsor a slot on my kit for the Great North Run and get your brand featured!",
    url: "https://www.sponsormyshirt.app",
    siteName: "Sponsor My Shirt",
    images: [
      {
        url: "/og-image.png",
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
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${ibmPlexMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-[#F9F9FB] font-sans text-zinc-900">
        {children}
      </body>
    </html>
  );
}
