import type { Metadata } from "next";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/ibm-plex-mono/400.css";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Study Spot Finder — Campus Directory",
  description:
    "Find the best places to study on campus, rated by students on noise, wifi, outlets, and how busy they are right now.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className="antialiased"
        style={{ fontFamily: "var(--font-jakarta), var(--font-inter), sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
