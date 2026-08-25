"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { apiClient } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Send,
  Zap,
  TrendingUp,
  ShieldCheck,
  Users2,
  Bot,
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
  Play,
  FileCheck,
  Calendar,
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>({
    jobs_found_today: 100,
    eligible_jobs: 78,
    high_match_jobs: 42,
    applications_submitted: 0,
    applications_pending: 10,
    hr_messages_sent: 0,
    hr_messages_skipped: 2,
    hr_replies: 0,
    interviews: 0,
    rejected: 0,
    offers: 0,
  });
  const [trendingJobs, setTrendingJobs] = useState<any[]>([]);
  const [approvalItems, setApprovalItems] = useState<any[]>([]);
  const [dailyReport, setDailyReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, trendingRes, approvalRes, reportRes] = await Promise.allSettled([
        apiClient.getDashboardStats(),
        apiClient.getTrendingJobs(),
        apiClient.getApprovalQueue(),
        apiClient.getDailyReport(),
      ]);

      if (statsRes.status === "fulfilled") setStats(statsRes.value);
      if (trendingRes.status === "fulfilled") setTrendingJobs(trendingRes.value);
      if (approvalRes.status === "fulfilled") setApprovalItems(approvalRes.value);
      if (reportRes.status === "fulfilled") setDailyReport(reportRes.value);
    } catch (e) {
      console.error("Error loading dashboard data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onTriggerRun={loadDashboardData} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none" />
            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-indigo-700/70 text-indigo-100 text-xs px-3 py-1 rounded-full font-semibold inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Dual Automation Active
                </span>
                <span className="text-xs text-indigo-200">Timezone: Asia/Kolkata (IST)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome back, Sadhna! 👋
              </h1>
              <p className="text-indigo-200 text-sm mt-2 leading-relaxed">
                Your AI Career Assistant is monitoring jobs across LinkedIn, Naukri, Internshala, and Company portals.
                Next automatic cycle scheduled for <strong>5:00 AM / 9:00 PM IST</strong>.
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-6">
                <Link href="/approval-center">
                  <Button size="sm" className="bg-white text-indigo-950 hover:bg-indigo-50 font-semibold shadow-xs">
                    <ShieldCheck className="h-4 w-4 mr-1.5 text-indigo-600" />
                    Review Pending Approvals ({approvalItems.length})
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button size="sm" variant="outline" className="text-white border-indigo-400/50 hover:bg-indigo-800/50">
                    Discover Jobs
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-gray-200/90 shadow-2xs hover:border-indigo-200 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Discovered Today</span>
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Zap className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-gray-900">{stats.jobs_found_today}</div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{stats.eligible_jobs} BCA Eligible</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200/90 shadow-2xs hover:border-indigo-200 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">High Match (&ge;75%)</span>
                  <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-purple-700">{stats.high_match_jobs}</div>
                <p className="text-xs text-gray-500 mt-1">Python, SQL, React & AI/ML</p>
              </CardContent>
            </Card>

            <Card className="border-gray-200/90 shadow-2xs hover:border-indigo-200 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Applications</span>
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Send className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-emerald-700">{stats.applications_submitted}</div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <span>{stats.applications_pending} pending in review</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200/90 shadow-2xs hover:border-indigo-200 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Interviews & Offers</span>
                  <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-amber-600">{stats.interviews} / {stats.offers}</div>
                <p className="text-xs text-gray-500 mt-1">{stats.hr_replies} Recruiter replies</p>
              </CardContent>
            </Card>
          </div>

          {/* Main 2-Column Section */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Top Matches */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Top Recommended Matches</h2>
                  <p className="text-xs text-gray-500">Ranked by AI match score against your BCA profile</p>
                </div>
                <Link href="/jobs" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
                  View All ({stats.jobs_found_today}) <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {trendingJobs.length > 0 ? (
                  trendingJobs.slice(0, 4).map((job) => (
                    <Card key={job.id} className="border-gray-200/90 hover:border-indigo-300 transition-all">
                      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-sm hover:text-indigo-600 transition-colors">
                              {job.role}
                            </h3>
                            <Badge
                              variant={job.match_score >= 90 ? "successLight" : "secondary"}
                              className="text-[11px] font-bold"
                            >
                              {job.match_score}% Match
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">
                            <strong>{job.company}</strong> • {job.location || "Remote"} • Source: <span className="uppercase text-[10px] font-bold text-gray-500">{job.source}</span>
                          </p>
                          {job.stipend_min > 0 && (
                            <p className="text-xs text-emerald-700 font-medium">
                              Stipend: ₹{job.stipend_min.toLocaleString()}/month
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Link href={`/jobs`}>
                            <Button size="sm" variant="outline" className="text-xs h-8">
                              Match Details
                            </Button>
                          </Link>
                          <Link href={`/jobs`}>
                            <Button size="sm" className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white">
                              Apply
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center border-dashed border-gray-300">
                    <p className="text-sm text-gray-500">Loading recommended opportunities...</p>
                  </Card>
                )}
              </div>

              {/* Recruiter & Outreach Safety Box */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users2 className="h-4 w-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-gray-900">Recruiter Outreach Safety Rules</h3>
                  </div>
                  <Link href="/recruiters" className="text-xs text-indigo-600 hover:underline">
                    CRM ({stats.hr_messages_sent} contacted)
                  </Link>
                </div>
                <div className="grid sm:grid-cols-3 gap-3 text-xs text-gray-600 pt-1">
                  <div className="bg-slate-50 p-3 rounded-xl border border-gray-100">
                    <p className="font-semibold text-gray-900">Max 5 New Emails/Run</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Strict anti-spam quota limit</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-gray-100">
                    <p className="font-semibold text-gray-900">30-Day Cooldown</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Prevents re-contacting same HR</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-gray-100">
                    <p className="font-semibold text-gray-900">Dynamic Greetings</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">5 AM (Morning) / 9 PM (Evening)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Approval Queue & AI Assistant Widget */}
            <div className="space-y-6">
              {/* Approval Queue Quick Widget */}
              <Card className="border-gray-200/90 shadow-2xs">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-amber-500" />
                      <span>Approval Center</span>
                    </CardTitle>
                    <Badge variant="warningLight" className="text-xs font-bold">
                      {approvalItems.length} Pending
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Human oversight required before submission
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {approvalItems.length > 0 ? (
                    approvalItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-slate-50 rounded-xl border border-gray-200/80 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 capitalize">
                            {item.action_type === "hr_message" ? "HR Outreach Message" : "Job Application"}
                          </span>
                          <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">
                            Score: {item.priority}%
                          </span>
                        </div>
                        <p className="text-gray-600 text-[11px]">
                          {item.job?.role || item.data?.role} at {item.job?.company || item.data?.company}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs text-gray-500">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
                      <span>No actions waiting for review. All clear!</span>
                    </div>
                  )}

                  <Link href="/approval-center" className="block pt-2">
                    <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                      Open Approval Center &rarr;
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* AI Career Assistant Prompt Chip Card */}
              <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-purple-50/50 shadow-2xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-indigo-950 flex items-center gap-2">
                    <Bot className="h-4 w-4 text-indigo-600" />
                    <span>AI Career Assistant</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-indigo-900/70">
                    Ask questions directly against your database
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <Link href="/assistant" className="block">
                    <div className="bg-white p-2.5 rounded-xl border border-indigo-100/80 text-indigo-800 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer">
                      "Find today's best Python internships above 85% match" &rarr;
                    </div>
                  </Link>
                  <Link href="/assistant" className="block">
                    <div className="bg-white p-2.5 rounded-xl border border-indigo-100/80 text-indigo-800 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer">
                      "Which recruiters have I already contacted?" &rarr;
                    </div>
                  </Link>
                  <Link href="/assistant" className="block">
                    <div className="bg-white p-2.5 rounded-xl border border-indigo-100/80 text-indigo-800 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer">
                      "Which skills should I learn for data analyst roles?" &rarr;
                    </div>
                  </Link>

                  <Link href="/assistant" className="block pt-2">
                    <Button size="sm" className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                      Open AI Assistant Chat
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
