"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { apiClient } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Kanban as KanbanIcon,
  Building2,
  MapPin,
  Calendar,
  Sparkles,
  ChevronRight,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
} from "lucide-react";

const COLUMNS = [
  { id: "saved", title: "Saved", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { id: "review", title: "In Review", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "ready", title: "Ready to Apply", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "applied", title: "Applied", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { id: "interview", title: "Interviewing", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: "offer", title: "Offers", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "rejected", title: "Archived", color: "bg-gray-100 text-gray-500 border-gray-200" },
];

export default function ApplicationsPage() {
  const [groupedApps, setGroupedApps] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getApplicationsByStatus();
      setGroupedApps(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (appId: number, newStatus: string) => {
    try {
      setUpdatingId(appId);
      await apiClient.updateApplication(appId, { status: newStatus });
      fetchApplications();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onTriggerRun={fetchApplications} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <KanbanIcon className="h-6 w-6 text-indigo-600" />
                <span>Application Kanban Tracker</span>
              </h1>
              <p className="text-xs text-gray-500">
                Track stages from Saved to Interview and Offer with automatic duplicate protection.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 text-xs font-semibold">
                Daily Limit: Max 10 Apps
              </Badge>
            </div>
          </div>

          {/* Kanban Board Grid */}
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-500">
              <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>Loading applications pipeline...</span>
            </div>
          ) : (
            <div className="flex gap-4 pb-6 overflow-x-auto min-h-[600px]">
              {COLUMNS.map((col) => {
                const items = groupedApps[col.id] || [];
                return (
                  <div
                    key={col.id}
                    className="w-72 flex-shrink-0 bg-slate-100/70 rounded-2xl p-3 border border-gray-200/80 flex flex-col"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${col.color}`}>
                          {col.title}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-400">{items.length}</span>
                    </div>

                    {/* Column Cards */}
                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {items.map((app) => (
                        <Card
                          key={app.id}
                          className="border-gray-200 shadow-2xs hover:shadow-xs hover:border-indigo-300 transition-all bg-white"
                        >
                          <CardContent className="p-3.5 space-y-2.5">
                            <div className="flex items-start justify-between gap-1">
                              <h3 className="font-bold text-gray-900 text-xs leading-snug">
                                {app.job?.role || "Developer Role"}
                              </h3>
                              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded flex-shrink-0">
                                {app.match_score || 85}%
                              </span>
                            </div>

                            <p className="text-[11px] font-medium text-gray-600 flex items-center gap-1">
                              <Building2 className="h-3 w-3 text-gray-400" />
                              {app.job?.company || "Tech Corp"}
                            </p>

                            <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-100">
                              <span>{app.job?.location || "Remote"}</span>
                              {app.applied_date && (
                                <span>{new Date(app.applied_date).toLocaleDateString()}</span>
                              )}
                            </div>

                            {/* Move Stage Selector */}
                            <div className="pt-2 flex items-center justify-between gap-1">
                              <select
                                value={app.status}
                                onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                disabled={updatingId === app.id}
                                className="w-full text-[10px] bg-slate-50 border border-gray-200 rounded px-1.5 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                              >
                                {COLUMNS.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    Move to &rarr; {c.title}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {items.length === 0 && (
                        <div className="py-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
                          No applications
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
