import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-thai",
});

export const metadata: Metadata = {
  title: "ระบบจัดการการเงินร้านค้า",
  description: "บันทึกรายรับ–รายจ่าย สรุปกำไร และจัดการสต๊อกครบวงจร",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning className={notoSansThai.variable}>
      <body className="min-h-dvh font-sans">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
