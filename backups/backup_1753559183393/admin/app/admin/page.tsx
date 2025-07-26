"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Database, 
  Server, 
  Brain, 
  Settings, 
  BarChart3,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboardPage() {
  const stats = [
    {
      title: "Total Users",
      value: "5",
      change: "+2 this week",
      icon: Users,
      color: "blue",
    },
    {
      title: "Active Models",
      value: "5",
      change: "All running",
      icon: Brain,
      color: "green",
    },
    {
      title: "Database Size",
      value: "9.7MB",
      change: "+1.2MB today",
      icon: Database,
      color: "purple",
    },
    {
      title: "Server Status",
      value: "Online",
      change: "99.9% uptime",
      icon: Server,
      color: "orange",
    },
  ]

  const recentActivity = [
    {
      id: 1,
      action: "User logged in",
      user: "admin",
      time: "2 minutes ago",
      status: "success",
    },
    {
      id: 2,
      action: "Database backup completed",
      user: "system",
      time: "5 minutes ago",
      status: "success",
    },
    {
      id: 3,
      action: "New AI model added",
      user: "admin",
      time: "10 minutes ago",
      status: "success",
    },
    {
      id: 4,
      action: "System update available",
      user: "system",
      time: "15 minutes ago",
      status: "warning",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600">Welcome back! Here's what's happening with your system.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{stat.change}</p>
                  </div>
                  <div
                    className={`bg-${stat.color}-100 text-${stat.color}-800 rounded-full w-12 h-12 flex items-center justify-center`}
                  >
                    <IconComponent className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/admin/users">
                  <div className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-blue-500 text-white p-2 rounded-lg group-hover:scale-110 transition-transform">
                        <Users className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold group-hover:text-blue-600 transition-colors">
                        Manage Users
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600">Add, edit, or remove user accounts</p>
                  </div>
                </Link>

                <Link href="/admin/settings">
                  <div className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-green-500 text-white p-2 rounded-lg group-hover:scale-110 transition-transform">
                        <Settings className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold group-hover:text-green-600 transition-colors">
                        System Settings
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600">Configure system preferences</p>
                  </div>
                </Link>

                <Link href="/models">
                  <div className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-purple-500 text-white p-2 rounded-lg group-hover:scale-110 transition-transform">
                        <Brain className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold group-hover:text-purple-600 transition-colors">
                        AI Models
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600">Monitor and manage AI models</p>
                  </div>
                </Link>

                <Link href="/database">
                  <div className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-orange-500 text-white p-2 rounded-lg group-hover:scale-110 transition-transform">
                        <Database className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold group-hover:text-orange-600 transition-colors">
                        Database
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600">Manage database and backups</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className={`rounded-full w-8 h-8 flex items-center justify-center ${
                      activity.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {activity.status === 'success' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{activity.action}</div>
                      <div className="text-xs text-slate-600 flex items-center gap-1">
                        <span>{activity.user}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </span>
                      </div>
                    </div>
                    <Badge 
                      variant={activity.status === 'success' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
