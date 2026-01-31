import { Dashboard } from "@/components/dashboard"

export default function DashboardPage() {
  return (
    <Dashboard
      userName="Max"
      completionPercentage={65}
      pointsCollected={120}
      tasksCompleted={8}
      totalTasks={12}
    />
  )
}
