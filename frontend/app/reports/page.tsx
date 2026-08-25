"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { apiClient } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Send,
  Building2,
  Sparkles,
  Download,
} from "lucide-react";

export default function ReportsPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState<any>(null);

  const fetchRuns = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getAutomationRuns();
      setRuns(res);
      if (res && res.length > 0) {
        setSelectedRun(res[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onTriggerRun={fetchRuns} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <FileText className="h-6 w-6 text-indigo-600" />
                <span>Daily Automation Reports</span>
              </h1>
              <p className="text-xs text-gray-500">
                Archived summaries of 05:00 AM & 09:00 PM IST automated discovery and outreach cycles.
              </p>
            </div>
            <Badge variant="secondary" className="text-xs font-semibold bg-indigo-50 text-indigo-700">
              {runs.length} Reports Logged
            </Badge>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-gray-500">
              <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>Loading daily reports...</span>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column: List of Past Runs */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Automation History
                </h2>

                <div className="space-y-2">
                  {runs.map((run) => (
                    <Card
                      key={run.id}
                      onClick={() => setSelectedRun(run)}
                      className={`cursor-pointer transition-all border ${
                        selectedRun?.id === run.id
                          ? "border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50/40"
                          : "border-gray-200/90 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <CardContent className="p-3.5 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900">
                            {run.run_time === "05:00" ? "05:00 AM Run" : run.run_time === "21:00" ? "09:00 PM Run" : "On-Demand Run"}
                          </span>
                          <Badge variant="successLight" className="text-[10px] uppercase font-bold">
                            {run.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-gray-500">
                          {new Date(run.start_time).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-gray-600 pt-1">
                          <span>{run.jobs_discovered} Discovered</span>
                          <span>•</span>
                          <span>{run.jobs_eligible} Eligible</span>
                          <span>•</span>
                          <span>{run.applications_submitted} Apps</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Right Column: Selected Report Viewer */}
              <div className="lg:col-span-2">
                {selectedRun ? (
                  <Card className="border-gray-200/90 shadow-2xs bg-white">
                    <CardHeader className="border-b border-gray-100 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-bold text-gray-900">
                            JOBHUNT AI DAILY REPORT
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Execution Timestamp: {new Date(selectedRun.start_time).toLocaleString()} (IST)
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="font-bold">
                          Run: {selectedRun.run_time || "Scheduled"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6 text-xs text-gray-800">
                      {/* Metric Summary Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-slate-50 p-3 rounded-xl border border-gray-100">
                          <span className="text-gray-500 text-[11px]">Jobs Discovered</span>
                          <p className="text-xl font-bold text-indigo-900 mt-1">{selectedRun.jobs_discovered}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-gray-100">
                          <span className="text-gray-500 text-[11px]">BCA Eligible</span>
                          <p className="text-xl font-bold text-emerald-700 mt-1">{selectedRun.jobs_eligible}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-gray-100">
                          <span className="text-gray-500 text-[11px]">High Match (&ge;75%)</span>
                          <p className="text-xl font-bold text-purple-700 mt-1">{selectedRun.jobs_high_match}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-gray-100">
                          <span className="text-gray-500 text-[11px]">Applications</span>
                          <p className="text-xl font-bold text-blue-700 mt-1">{selectedRun.applications_submitted}</p>
                        </div>
                      </div>

                      {/* Recruiter Stats */}
                      <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-2">
                        <p className="font-bold text-amber-950 flex items-center gap-1.5">
                          <Send className="h-4 w-4 text-amber-700" />
                          <span>HR & Recruiter Outreach Stats:</span>
                        </p>
                        <p className="text-amber-900 text-xs">
                          • HR messages sent: <strong>{selectedRun.hr_messages_sent}</strong> (Greeting: <em>{selectedRun.run_time === "21:00" ? "Good evening" : "Good morning"}</em>)
                        </p>
                        <p className="text-amber-900 text-xs">
                          • HR messages skipped: <strong>{selectedRun.hr_messages_skipped}</strong> (due to 30-day cooldown / previous contact)
                        </p>
                      </div>

                      {/* Top Opportunities */}
                      {selectedRun.report?.top_opportunities && (
                        <div className="space-y-2">
                          <p className="font-bold text-gray-900">Top Matched Opportunities from Run:</p>
                          <div className="space-y-1.5">
                            {selectedRun.report.top_opportunities.map((opp: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-gray-100 text-xs"
                              >
                                <span className="font-semibold text-gray-900">
                                  {idx + 1}. {opp.role} — <span className="text-indigo-600 font-normal">{opp.company}</span>
                                </span>
                                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                  {opp.match_score}% Match
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="p-8 text-center text-gray-400">Select a report to view details</div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
