import { StatusReport } from "@/components/status-report"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Statusbericht - SchuldenKompass",
  description: "Automatisch generierter Statusbericht zur Vorlage bei Behörden",
}

export default function ReportPage() {
  return <StatusReport />
}
