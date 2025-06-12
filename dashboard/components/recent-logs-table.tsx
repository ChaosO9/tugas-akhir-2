"use client"

import { useState } from "react"
import { Eye, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { mockRecentLogs } from "@/lib/mock-data"

export function RecentLogsTable() {
  const [selectedLog, setSelectedLog] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <Badge className="bg-green-500">Selesai</Badge>
      case "processing":
        return <Badge className="bg-blue-500">Diproses</Badge>
      case "queued":
        return <Badge className="bg-yellow-500">Antrian</Badge>
      case "error":
        return <Badge className="bg-red-500">Gagal</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const viewLogDetails = (log: any) => {
    setSelectedLog(log)
    setDialogOpen(true)
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Log ID</TableHead>
            <TableHead>Pasien ID</TableHead>
            <TableHead>Bundle Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Dibuat Pada</TableHead>
            <TableHead>Selesai Pada</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockRecentLogs.map((log) => (
            <TableRow key={log.log_id}>
              <TableCell className="font-medium">{log.log_id}</TableCell>
              <TableCell>{log.patient_id}</TableCell>
              <TableCell>{log.bundle_type}</TableCell>
              <TableCell>{getStatusBadge(log.status)}</TableCell>
              <TableCell>{formatDate(log.created_at)}</TableCell>
              <TableCell>{formatDate(log.completed_at)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Buka menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => viewLogDetails(log)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Lihat Detail
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Coba Ulang</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Log #{selectedLog?.log_id}</DialogTitle>
            <DialogDescription>Detail lengkap log proses FHIR</DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Log ID</h3>
                  <p>{selectedLog.log_id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Job UUID</h3>
                  <p>{selectedLog.job_uuid}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Pendaftaran ID</h3>
                  <p>{selectedLog.pendaftaran_id || "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Encounter ID</h3>
                  <p>{selectedLog.encounter_id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Patient ID</h3>
                  <p>{selectedLog.patient_id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Bundle Type</h3>
                  <p>{selectedLog.bundle_type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Status</h3>
                  <p>{getStatusBadge(selectedLog.status)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Retry Count</h3>
                  <p>{selectedLog.retry_count}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Timeline</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Dibuat:</span>
                    <span>{formatDate(selectedLog.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Masuk Antrian:</span>
                    <span>{formatDate(selectedLog.queued_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mulai Diproses:</span>
                    <span>{formatDate(selectedLog.processing_started_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Percobaan Terakhir:</span>
                    <span>{formatDate(selectedLog.last_attempt_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Selesai:</span>
                    <span>{formatDate(selectedLog.completed_at)}</span>
                  </div>
                </div>
              </div>

              {selectedLog.error_message && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Pesan Error</h3>
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-300">
                    {selectedLog.error_message}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Bundle JSON</h3>
                <div className="max-h-60 overflow-auto rounded-md bg-slate-100 p-3 dark:bg-slate-900">
                  <pre className="text-xs">{JSON.stringify(selectedLog.bundle_json, null, 2)}</pre>
                </div>
              </div>

              {selectedLog.response_json && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Response JSON</h3>
                  <div className="max-h-60 overflow-auto rounded-md bg-slate-100 p-3 dark:bg-slate-900">
                    <pre className="text-xs">{JSON.stringify(selectedLog.response_json, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
