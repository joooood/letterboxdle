import "@/styles/globals.css";

import { type Metadata } from "next";
import { Open_Sans } from "next/font/google";

export const metadata: Metadata = {
  title: "Letterboxdle",
  description: "Link your Letterboxd account and play a variant of Framed!",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const sans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
