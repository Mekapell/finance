import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ระบบจัดการการเงินร้านค้า",
    short_name: "การเงินร้านค้า",
    description: "บันทึกรายรับ–รายจ่าย สรุปกำไร และจัดการสต๊อกครบวงจร",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6d5bd0",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/icon", sizes: "192x192", type: "image/png" },
    ],
  };
}
