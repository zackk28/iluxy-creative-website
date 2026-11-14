import "./globals.css";
import DesktopNavbar from "@/components/shared/DesktopNavbar";
import MobileBottomBar from "@/components/shared/MobileBottomBar";

export const metadata = {
  title: "Iluxy Creative — Studio Fotografi & Private Gallery Padang",
  description:
    "Sistem Informasi Booking Jasa Fotografi, Videografi, dan Manajemen Private Gallery Berbasis Web pada Iluxy Creative Padang.",
  keywords: ["fotografi padang", "studio foto padang", "wedding padang", "private gallery", "iluxy creative"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="dark">
      <body className="bg-[#0A0A0E] text-neutral-100 min-h-screen flex flex-col selection:bg-amber-500 selection:text-neutral-950">
        {/* Desktop Floating Pill Navbar */}
        <DesktopNavbar />

        {/* Main Content Area */}
        <main className="flex-1 pb-24 md:pb-12 pt-20 md:pt-24">{children}</main>

        {/* Mobile Bottom Tab Bar */}
        <MobileBottomBar />
      </body>
    </html>
  );
}
