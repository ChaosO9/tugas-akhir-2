"use client"

import { useState } from "react"
import { Download, Filter, RefreshCw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RecentLogsTable } from "@/components/recent-logs-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LogsView() {
  const [date, setDate] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [bundleType, setBundleType] = useState("all")

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Log Proses FHIR</h1>
          <p className="text-muted-foreground">
            Daftar log proses FHIR untuk interoperabilitas dengan Platform SATUSEHAT
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
            <span className="sr-only">Download</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="search" className="text-sm font-medium">
                Cari
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  type="search"
                  placeholder="Cari berdasarkan ID..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="processing">Diproses</SelectItem>
                  <SelectItem value="queued">Antrian</SelectItem>
                  <SelectItem value="error">Gagal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="bundle-type" className="text-sm font-medium">
                Bundle Type
              </label>
              <Select value={bundleType} onValueChange={setBundleType}>
                <SelectTrigger id="bundle-type">
                  <SelectValue placeholder="Pilih tipe bundle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="transaction">Transaction</SelectItem>
                  <SelectItem value="batch">Batch</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="message">Message</SelectItem>
                  <SelectItem value="collection">Collection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Rentang Tanggal</label>
              <DatePickerWithRange date={date} setDate={setDate} />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Terapkan Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <RecentLogsTable />
        </CardContent>
      </Card>
    </div>
  )
}
