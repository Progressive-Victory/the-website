import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Progressive Victory",
  description: "Get involved!",
};

const geist = Geist({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geist.className}>{children}</body>
    </html>
  );
}
