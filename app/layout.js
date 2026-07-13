import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Nav from "../components/Nav";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-cormorant",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Stillpoint",
  description: "A quiet space for reflection, and two guides to sit with when you need one.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
