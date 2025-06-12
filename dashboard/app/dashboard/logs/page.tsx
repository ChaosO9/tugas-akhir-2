import type { Metadata } from "next"
import LogsView from "@/components/logs-view"

export const metadata: Metadata = {
  title: "Log FHIR Process",
  description: "Daftar log proses FHIR untuk interoperabilitas dengan Platform SATUSEHAT",
}

export default function LogsPage() {
  return <LogsView />
}
