// Generate mock data for the dashboard
const generateDailyData = (days: number) => {
  const data = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    const success = Math.floor(Math.random() * 50) + 30
    const error = Math.floor(Math.random() * 10) + 5
    const pending = Math.floor(Math.random() * 15) + 10

    data.push({
      date: date.toISOString().split("T")[0],
      success,
      error,
      pending,
      total: success + error + pending,
    })
  }

  return data
}

const generateProcessingTimeData = (days: number) => {
  const data = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    data.push({
      date: date.toISOString().split("T")[0],
      processingTime: Math.random() * 5 + 1, // 1-6 seconds
    })
  }

  return data
}

const generateRecentLogs = (count: number) => {
  const statuses = ["completed", "processing", "queued", "error"]
  const bundleTypes = ["transaction", "batch", "document", "message", "collection"]
  const logs = []

  for (let i = 0; i < count; i++) {
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    const status = statuses[Math.floor(Math.random() * statuses.length)]

    const queuedAt = new Date(createdAt.getTime() + Math.random() * 60 * 1000)
    const processingStartedAt = new Date(queuedAt.getTime() + Math.random() * 60 * 1000)
    const lastAttemptAt = new Date(processingStartedAt.getTime() + Math.random() * 60 * 1000)

    let completedAt = null
    if (status === "completed" || status === "error") {
      completedAt = new Date(lastAttemptAt.getTime() + Math.random() * 60 * 1000)
    }

    logs.push({
      log_id: 1000 + i,
      job_uuid: crypto.randomUUID(),
      pendaftaran_id: `P${100000 + i}`,
      encounter_id: `E${200000 + i}`,
      patient_id: `PT${300000 + i}`,
      bundle_type: bundleTypes[Math.floor(Math.random() * bundleTypes.length)],
      bundle_json: {
        resourceType: "Bundle",
        type: bundleTypes[Math.floor(Math.random() * bundleTypes.length)],
        entry: [
          { resource: { resourceType: "Patient", id: `PT${300000 + i}` } },
          { resource: { resourceType: "Encounter", id: `E${200000 + i}` } },
        ],
      },
      bundle_file_path: `/storage/bundles/bundle_${1000 + i}.json`,
      status,
      created_at: createdAt.toISOString(),
      queued_at: queuedAt.toISOString(),
      processing_started_at: processingStartedAt.toISOString(),
      last_attempt_at: lastAttemptAt.toISOString(),
      completed_at: completedAt ? completedAt.toISOString() : null,
      response_json: status === "completed" ? { status: "success", id: crypto.randomUUID() } : null,
      error_message: status === "error" ? "Connection timeout when connecting to SATUSEHAT API" : null,
      retry_count: status === "error" ? Math.floor(Math.random() * 3) : 0,
      created_by: "system",
      reg_company_id: 1,
      reg_apps_id: 1,
    })
  }

  return logs
}

// Calculate total logs
const dailyLogsData = generateDailyData(30)
const totalLogs = dailyLogsData.reduce((sum, day) => sum + day.total, 0)

// Calculate success and error rates
const successCount = dailyLogsData.reduce((sum, day) => sum + day.success, 0)
const pendingCount = dailyLogsData.reduce((sum, day) => sum + day.pending, 0)
const errorCount = dailyLogsData.reduce((sum, day) => sum + day.error, 0)
const successRate = Math.round((successCount / totalLogs) * 100)
const errorRate = Math.round((errorCount / totalLogs) * 100)

// Calculate average processing time
const processingTimeData = generateProcessingTimeData(30)
const avgProcessingTime = Number.parseFloat(
  (processingTimeData.reduce((sum, day) => sum + day.processingTime, 0) / processingTimeData.length).toFixed(2),
)

// Status distribution
const statusDistribution = [
  { name: "completed", value: successCount },
  { name: "processing", value: pendingCount / 2 },
  { name: "queued", value: pendingCount / 2 },
  { name: "error", value: errorCount },
]

// Retry distribution
const retryDistribution = [
  { retries: 0, count: Math.floor(totalLogs * 0.7) },
  { retries: 1, count: Math.floor(totalLogs * 0.15) },
  { retries: 2, count: Math.floor(totalLogs * 0.1) },
  { retries: 3, count: Math.floor(totalLogs * 0.05) },
]

// Error type distribution
const errorTypeDistribution = [
  { name: "connection-error", value: Math.floor(errorCount * 0.4) },
  { name: "validation-error", value: Math.floor(errorCount * 0.3) },
  { name: "timeout-error", value: Math.floor(errorCount * 0.15) },
  { name: "server-error", value: Math.floor(errorCount * 0.1) },
  { name: "other-error", value: Math.floor(errorCount * 0.05) },
]

export const mockData = {
  totalLogs,
  successRate,
  errorRate,
  avgProcessingTime,
  statusDistribution,
  processingTimeData,
  dailyLogsData,
  retryDistribution,
  errorTypeDistribution,
}

export const mockRecentLogs = generateRecentLogs(10)
