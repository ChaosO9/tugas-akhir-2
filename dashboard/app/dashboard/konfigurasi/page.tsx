import type { Metadata } from "next"
import KonfigurasiView from "@/components/konfigurasi-view"

export const metadata: Metadata = {
  title: "Konfigurasi Database",
  description: "Pengaturan koneksi database untuk FHIR Process Log",
}

export default function KonfigurasiPage() {
  return <KonfigurasiView />
}
