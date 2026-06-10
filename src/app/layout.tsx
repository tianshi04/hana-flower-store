import type { Metadata } from "next";
import { Lora, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const lora = Lora({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HanaShop | Cửa Hàng Hoa Tươi Thiết Kế Cao Cấp",
  description: "Cửa hàng hoa tươi HanaShop cung cấp các mẫu bó hoa, giỏ hoa thiết kế sang trọng, phục vụ dịp sinh nhật, khai trương, tình yêu và chia buồn giao hàng nhanh.",
  keywords: "bán hoa tươi, shop hoa tươi hà nội, đặt hoa online, hoa sinh nhật, hoa khai trương",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="vi" className={`${lora.variable} ${plusJakartaSans.variable}`}>
      <body>
        <CartProvider>
          <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Navbar session={session} />
            <main style={{ flex: "1 0 auto" }}>{children}</main>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
