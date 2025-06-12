"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Database, Save, TestTube } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useDbConfig } from "@/lib/db-config-provider"

export default function KonfigurasiView() {
  const { toast } = useToast()
  const { config, setConfig, isConnected, testConnection, saveConfig } = useDbConfig()

  const [formState, setFormState] = useState({
    host: "",
    port: "",
    database: "",
    username: "",
    password: "",
    schema: "",
    ssl: false,
    useMockData: true,
  })

  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (config) {
      setFormState({
        host: config.host || "",
        port: config.port || "5432",
        database: config.database || "",
        username: config.username || "",
        password: config.password || "",
        schema: config.schema || "public",
        ssl: config.ssl || false,
        useMockData: config.useMockData !== false,
      })
    }
  }, [config])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormState((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    try {
      const success = await testConnection(formState)
      if (success) {
        toast({
          title: "Koneksi berhasil",
          description: "Berhasil terhubung ke database PostgreSQL",
        })
      } else {
        toast({
          title: "Koneksi gagal",
          description: "Gagal terhubung ke database PostgreSQL. Periksa kembali konfigurasi Anda.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Koneksi gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat menguji koneksi",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSaveConfig = async () => {
    setIsSaving(true)
    try {
      await saveConfig(formState)
      toast({
        title: "Konfigurasi tersimpan",
        description: "Konfigurasi database berhasil disimpan",
      })
    } catch (error) {
      toast({
        title: "Gagal menyimpan",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan konfigurasi",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Konfigurasi Database</h1>
          <p className="text-muted-foreground">Pengaturan koneksi database untuk FHIR Process Log</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1 text-sm">
            <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
            <span>{isConnected ? "Terhubung" : "Tidak terhubung"}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="database" className="space-y-4">
        <TabsList>
          <TabsTrigger value="database">Database PostgreSQL</TabsTrigger>
          <TabsTrigger value="data">Pengaturan Data</TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Koneksi PostgreSQL</CardTitle>
              <CardDescription>
                Konfigurasi koneksi ke database PostgreSQL yang berisi tabel fhir_process_log
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    name="host"
                    placeholder="localhost"
                    value={formState.host}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input id="port" name="port" placeholder="5432" value={formState.port} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="database">Database</Label>
                  <Input
                    id="database"
                    name="database"
                    placeholder="fhir_db"
                    value={formState.database}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schema">Schema</Label>
                  <Input
                    id="schema"
                    name="schema"
                    placeholder="public"
                    value={formState.schema}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="postgres"
                    value={formState.username}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formState.password}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="ssl"
                  name="ssl"
                  checked={formState.ssl}
                  onCheckedChange={(checked) => handleSwitchChange("ssl", checked)}
                />
                <Label htmlFor="ssl">Gunakan SSL</Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleTestConnection} disabled={isTesting}>
                {isTesting ? (
                  <>
                    <TestTube className="mr-2 h-4 w-4 animate-spin" />
                    Menguji...
                  </>
                ) : (
                  <>
                    <TestTube className="mr-2 h-4 w-4" />
                    Uji Koneksi
                  </>
                )}
              </Button>
              <Button onClick={handleSaveConfig} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Save className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Konfigurasi
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Data</CardTitle>
              <CardDescription>Konfigurasi sumber data untuk dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="useMockData"
                  name="useMockData"
                  checked={formState.useMockData}
                  onCheckedChange={(checked) => handleSwitchChange("useMockData", checked)}
                />
                <Label htmlFor="useMockData">Gunakan data dummy jika tidak terhubung ke database</Label>
              </div>
              <div className="rounded-md bg-muted p-4">
                <div className="flex items-start gap-4">
                  <Database className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <h4 className="text-sm font-medium">Informasi Tabel</h4>
                    <p className="text-sm text-muted-foreground">
                      Dashboard ini menggunakan tabel <code>fhir_process_log</code> dengan struktur yang sesuai dengan
                      skema yang diberikan. Pastikan tabel tersebut ada di database yang dikonfigurasi.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveConfig} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Save className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Pengaturan
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
