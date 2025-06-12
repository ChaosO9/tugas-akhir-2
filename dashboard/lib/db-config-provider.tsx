"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface DbConfig {
  host: string
  port: string
  database: string
  username: string
  password: string
  schema: string
  ssl: boolean
  useMockData: boolean
}

interface DbConfigContextType {
  config: DbConfig | null
  setConfig: (config: DbConfig) => void
  isConnected: boolean
  testConnection: (config: DbConfig) => Promise<boolean>
  saveConfig: (config: DbConfig) => Promise<void>
}

const defaultConfig: DbConfig = {
  host: "",
  port: "5432",
  database: "",
  username: "",
  password: "",
  schema: "public",
  ssl: false,
  useMockData: true,
}

const DbConfigContext = createContext<DbConfigContextType | undefined>(undefined)

export function DbConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<DbConfig | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Load config from localStorage on mount
    if (typeof window !== "undefined") {
      const savedConfig = localStorage.getItem("dbConfig")
      if (savedConfig) {
        try {
          const parsedConfig = JSON.parse(savedConfig)
          setConfig(parsedConfig)

          // Check connection status if we have a saved config
          if (parsedConfig.host && parsedConfig.database) {
            testConnection(parsedConfig).then(setIsConnected)
          }
        } catch (error) {
          console.error("Failed to parse saved config:", error)
          setConfig(defaultConfig)
        }
      } else {
        setConfig(defaultConfig)
      }
    } else {
      setConfig(defaultConfig)
    }
  }, [])

  const testConnection = async (configToTest: DbConfig): Promise<boolean> => {
    // In a real app, this would make an API call to test the connection
    // For this demo, we'll simulate a connection test
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate connection success if all required fields are filled
        const success = !!(
          configToTest.host &&
          configToTest.port &&
          configToTest.database &&
          configToTest.username &&
          configToTest.password
        )
        resolve(success)
      }, 1500)
    })
  }

  const saveConfig = async (configToSave: DbConfig): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Save to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("dbConfig", JSON.stringify(configToSave))
        }
        setConfig(configToSave)

        // Update connection status
        if (configToSave.host && configToSave.database) {
          testConnection(configToSave).then(setIsConnected)
        } else {
          setIsConnected(false)
        }

        resolve()
      }, 1000)
    })
  }

  return (
    <DbConfigContext.Provider
      value={{
        config,
        setConfig,
        isConnected,
        testConnection,
        saveConfig,
      }}
    >
      {children}
    </DbConfigContext.Provider>
  )
}

export function useDbConfig() {
  const context = useContext(DbConfigContext)
  if (context === undefined) {
    throw new Error("useDbConfig must be used within a DbConfigProvider")
  }
  return context
}
