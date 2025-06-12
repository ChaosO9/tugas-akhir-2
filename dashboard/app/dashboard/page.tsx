import type { Metadata } from "next"
import DashboardView from "@/components/dashboard-view"

export const metadata: Metadata = {
  title: "Dashboard FHIR Process Log",
  description:
    "Dashboard untuk monitoring interoperabilitas antara Rekam Medis Elektronik Mandiri dengan Platform SATUSEHAT",
}

export default function DashboardPage() {
  return <DashboardView />
}
