import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/auth";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "FlowerDang | Cửa Hàng Hoa Tươi Thiết Kế Cao Cấp",
  description: "Cửa hàng hoa tươi FlowerDang cung cấp các mẫu bó hoa, giỏ hoa thiết kế sang trọng, phục vụ dịp sinh nhật, khai trương, tình yêu và chia buồn giao hàng nhanh.",
  keywords: "bán hoa tươi, shop hoa tươi hà nội, đặt hoa online, hoa sinh nhật, hoa khai trương",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="vi">
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
