import type { Metadata } from "next"
import AnalyticsView from "@/components/analytics-view"

export const metadata: Metadata = {
  title: "Analisis FHIR Process",
  description: "Analisis proses FHIR untuk interoperabilitas dengan Platform SATUSEHAT",
}

export default function AnalyticsPage() {
  return <AnalyticsView />
}
