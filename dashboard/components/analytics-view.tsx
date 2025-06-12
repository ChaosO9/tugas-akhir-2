"use client"

import { useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockData } from "@/lib/mock-data"

export default function AnalyticsView() {
  const [date, setDate] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })

  const { statusDistribution, processingTimeData, dailyLogsData, retryDistribution, errorTypeDistribution } = mockData

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analitik</h1>
          <p className="text-muted-foreground">Analisis mendalam tentang proses FHIR untuk interoperabilitas</p>
        </div>
        <div className="flex items-center gap-2">
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performa</TabsTrigger>
          <TabsTrigger value="errors">Kesalahan</TabsTrigger>
          <TabsTrigger value="distribution">Distribusi</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Waktu Pemrosesan Harian</CardTitle>
                <CardDescription>Waktu pemrosesan rata-rata per hari dalam 30 hari terakhir</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                  <p className="text-muted-foreground">Grafik Waktu Pemrosesan Harian</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribusi Percobaan Ulang</CardTitle>
                <CardDescription>Jumlah log berdasarkan jumlah percobaan ulang</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {retryDistribution.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.retries} percobaan ulang</span>
                      <span className="text-sm font-medium">{item.count} log</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tipe Kesalahan</CardTitle>
                <CardDescription>Distribusi tipe kesalahan yang terjadi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {errorTypeDistribution.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            item.name === "connection-error"
                              ? "bg-red-500"
                              : item.name === "validation-error"
                                ? "bg-yellow-500"
                                : item.name === "timeout-error"
                                  ? "bg-blue-500"
                                  : item.name === "server-error"
                                    ? "bg-purple-500"
                                    : "bg-green-500"
                          }`}
                        />
                        <span className="text-sm capitalize">{item.name.replace("-", " ")}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kesalahan Harian</CardTitle>
                <CardDescription>Jumlah kesalahan per hari dalam 30 hari terakhir</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                  <p className="text-muted-foreground">Grafik Kesalahan Harian</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Status</CardTitle>
                <CardDescription>Distribusi status log proses FHIR</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {statusDistribution.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            item.name === "completed"
                              ? "bg-green-500"
                              : item.name === "processing"
                                ? "bg-blue-500"
                                : item.name === "queued"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                          }`}
                        />
                        <span className="text-sm capitalize">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribusi Bundle Type</CardTitle>
                <CardDescription>Distribusi tipe bundle FHIR yang diproses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                      <span className="text-sm">Transaction</span>
                    </div>
                    <span className="text-sm font-medium">450</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <span className="text-sm">Batch</span>
                    </div>
                    <span className="text-sm font-medium">300</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                      <span className="text-sm">Document</span>
                    </div>
                    <span className="text-sm font-medium">150</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <span className="text-sm">Message</span>
                    </div>
                    <span className="text-sm font-medium">100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-purple-500" />
                      <span className="text-sm">Collection</span>
                    </div>
                    <span className="text-sm font-medium">50</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
