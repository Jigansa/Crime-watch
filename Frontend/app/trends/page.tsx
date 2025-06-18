"use client"
import dynamic from "next/dynamic";
const TrendsPageClient = dynamic(() => import("./TrendsPageClient"), { ssr: false });
export default function Page() {
  return <TrendsPageClient />;
}