import type { Metadata } from "next";
import LogoGalleryContent from "@/components/logo-gallery-content";

export const metadata: Metadata = {
  title: "Logo — Solscale",
  description: "Logo directions for Solscale.",
};

export default function LogoPage() {
  return <LogoGalleryContent />;
}
