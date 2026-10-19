import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { adminService } from '@/lib/api'
import FloatingBackground from '@/components/FloatingBackground'
import {
  Users, AlertTriangle, ShieldCheck, FileSpreadsheet,
  Search, CheckCircle2, Activity, HeartPulse
} from 'lucide-react'

const Admin: React.FC = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [reviewedAlerts, setReviewedAlerts] = useState<Record<number, boolean>>({})

  useEffect(() => {
    adminService.getAdminMetrics().then((res) => {
      setData(res)
      setLoading(false)
    })
  }, [])

  const markReviewed = (id: number) => {
    setReviewedAlerts((prev) => ({ ...prev, [id]: true }))
  }

  const filteredUsers = (data?.recent_users || []).filter((u: any) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen pt-24 pb-16">
      <FloatingBackground />

      <div className="zenora-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-purple-600 text-white hover:bg-purple-700">
                Administrative Oversight Portal
              </Badge>
              <Badge variant="outline" className="text-xs">Clinical System Monitor</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              ZENORA Platform Administration & Crisis Alert Hub
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review user engagement metrics, clinical risk flags, and safety crisis notifications.
            </p>
          </div>
        </div>

        {/* High-Level System Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-8">
          <Card className="bg-white/85 backdrop-blur-md border border-white/60 shadow-sm p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase">Registered Users</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{data?.stats?.total_users ?? 148}</p>
            <p className="text-xs text-green-600 font-medium mt-1">Active Patient Base</p>
          </Card>

          <Card className="bg-white/85 backdrop-blur-md border border-white/60 shadow-sm p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase">Journal Reflections</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{data?.stats?.total_journals ?? 842}</p>
            <p className="text-xs text-purple-600 font-medium mt-1">NLP Analyzed</p>
          </Card>

          <Card className="bg-white/85 backdrop-blur-md border border-white/60 shadow-sm p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase">Mood Logs</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{data?.stats?.total_moods ?? 1260}</p>
            <p className="text-xs text-blue-600 font-medium mt-1">Tracked Sessions</p>
          </Card>

          <Card className="bg-white/85 backdrop-blur-md border border-white/60 shadow-sm p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase">Assessments</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{data?.stats?.total_assessments ?? 310}</p>
            <p className="text-xs text-teal-600 font-medium mt-1">GAD-7 & PHQ-9</p>
          </Card>

          <Card className="bg-red-50/90 border border-red-200 shadow-sm p-4 col-span-2 sm:col-span-1">
            <p className="text-xs font-semibold text-red-700 uppercase">Crisis Risk Flags</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{data?.stats?.active_crisis_alerts ?? 2}</p>
            <p className="text-xs text-red-600 font-semibold mt-1">Requires Clinical Review</p>
          </Card>
        </div>

        {/* Priority Crisis Alerts Section */}
        <Card className="bg-white/90 backdrop-blur-md border border-red-100 shadow-sm mb-8 overflow-hidden">
          <CardHeader className="bg-red-50/50 border-b border-red-100 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <CardTitle className="text-base font-bold text-red-950">
                  Active Clinical Safety & Crisis Alert Queue
                </CardTitle>
              </div>
              <Badge variant="destructive" className="text-xs">
                {data?.crisis_alerts?.length || 2} Potential Risks Flagged
              </Badge>
            </div>
            <CardDescription className="text-xs text-red-800">
              Entries triggering acute distress or self-harm keywords via NLP or elevated PHQ-9 item 9 scores.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {(data?.crisis_alerts || []).map((alert: any) => {
                const isDone = reviewedAlerts[alert.id]
                return (
                  <div key={alert.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-muted/30 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                          {alert.type}
                        </span>
                        <span className="text-xs text-muted-foreground">User ID #{alert.user_id}</span>
                        <span className="text-xs text-muted-foreground">• {alert.date}</span>
                      </div>
                      <p className="font-semibold text-sm text-gray-900">{alert.title}</p>
                      <p className="text-xs text-gray-600 italic bg-muted/40 p-2 rounded-md max-w-2xl">
                        "{alert.snippet}"
                      </p>
                    </div>
                    <div>
                      {isDone ? (
                        <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed & Escalated
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => markReviewed(alert.id)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs"
                        >
                          Mark as Reviewed
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* User Engagement & Patient Directory */}
        <Card className="bg-white/90 backdrop-blur-md border border-white/60 shadow-sm">
          <CardHeader className="py-4 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Patient & User Directory
                </CardTitle>
                <CardDescription className="text-xs">
                  Active accounts, assigned roles, and reflection counts.
                </CardDescription>
              </div>
              <div className="w-full sm:w-64">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b">
                  <tr>
                    <th className="p-3">User ID</th>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Access Role</th>
                    <th className="p-3">Registration Date</th>
                    <th className="p-3">Journal Count</th>
                    <th className="p-3">Mood Logs</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map((u: any) => (
                    <tr key={u.id} className="hover:bg-muted/20">
                      <td className="p-3 font-semibold text-gray-700">#{u.id}</td>
                      <td className="p-3 font-medium text-gray-900">{u.name}</td>
                      <td className="p-3 text-gray-600">{u.email}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-3xs font-bold uppercase tracking-wider ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500">{u.joined}</td>
                      <td className="p-3">{u.journal_count}</td>
                      <td className="p-3">{u.mood_count}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Admin
