"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { apiClient } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  CheckCircle2,
  Users2,
  Briefcase,
  Layers,
  Award,
  Zap,
} from "lucide-react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>({
    jobs_found_today: 100,
    eligible_jobs: 78,
    high_match_jobs: 42,
    applications_submitted: 10,
    hr_messages_sent: 5,
    hr_replies: 2,
    interviews: 1,
    offers: 0,
  });

  useEffect(() => {
    apiClient.getDashboardStats().then((data) => {
      if (data) setStats(data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
                <span>Analytics & Success Trends</span>
              </h1>
              <p className="text-xs text-gray-500">
                Performance indicators, conversion rates, and multi-platform distribution for Sadhna.
              </p>
            </div>
            <Badge variant="secondary" className="text-xs bg-indigo-50 text-indigo-700 font-semibold">
              Live Metrics
            </Badge>
          </div>

          {/* Key Rates Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-gray-200/90 shadow-2xs">
              <CardContent className="p-4 space-y-1">
                <span className="text-xs font-semibold text-gray-500">Eligibility Ratio</span>
                <p className="text-2xl font-black text-indigo-900">78%</p>
                <p className="text-[11px] text-emerald-600 font-medium">BCA & Fresher Accepted</p>
              </CardContent>
            </Card>

            <Card className="border-gray-200/90 shadow-2xs">
              <CardContent className="p-4 space-y-1">
                <span className="text-xs font-semibold text-gray-500">High Match Ratio</span>
                <p className="text-2xl font-black text-purple-700">42%</p>
                <p className="text-[11px] text-purple-600 font-medium">Score &ge; 75%</p>
              </CardContent>
            </Card>

            <Card className="border-gray-200/90 shadow-2xs">
              <CardContent className="p-4 space-y-1">
                <span className="text-xs font-semibold text-gray-500">Recruiter Response Rate</span>
                <p className="text-2xl font-black text-emerald-600">40.0%</p>
                <p className="text-[11px] text-gray-500">2 Replies / 5 Contacted</p>
              </CardContent>
            </Card>

            <Card className="border-gray-200/90 shadow-2xs">
              <CardContent className="p-4 space-y-1">
                <span className="text-xs font-semibold text-gray-500">Interview Rate</span>
                <p className="text-2xl font-black text-amber-600">10.0%</p>
                <p className="text-[11px] text-gray-500">1 Interview Scheduled</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdown Charts / Grids */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Source Distribution */}
            <Card className="border-gray-200/90 shadow-2xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-600" />
                  <span>Opportunities by Job Source</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Proportion of discovered positions across supported platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1 text-gray-700 font-medium">
                    <span>LinkedIn Jobs</span>
                    <span>35% (35 jobs)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full w-[35%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-gray-700 font-medium">
                    <span>Naukri.com</span>
                    <span>30% (30 jobs)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full w-[30%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-gray-700 font-medium">
                    <span>Internshala</span>
                    <span>25% (25 jobs)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-sky-500 h-2.5 rounded-full w-[25%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-gray-700 font-medium">
                    <span>Direct Company Portals</span>
                    <span>10% (10 jobs)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-emerald-500 h-2.5 rounded-full w-[10%]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Match Score Distribution */}
            <Card className="border-gray-200/90 shadow-2xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span>AI Match Score Distribution</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Categorized match confidence for BCA & Technical skillset
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1 text-gray-700 font-medium">
                    <span className="text-emerald-700 font-bold">90–100% (Excellent Match)</span>
                    <span>18 opportunities</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-emerald-500 h-2.5 rounded-full w-[18%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-gray-700 font-medium">
                    <span className="text-indigo-700 font-bold">80–89% (Strong Match)</span>
                    <span>24 opportunities</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full w-[24%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-gray-700 font-medium">
                    <span className="text-amber-700 font-bold">70–79% (Good Match)</span>
                    <span>36 opportunities</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-amber-500 h-2.5 rounded-full w-[36%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-gray-700 font-medium">
                    <span className="text-gray-500 font-bold">Below 70% (Low Priority)</span>
                    <span>22 opportunities</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-gray-300 h-2.5 rounded-full w-[22%]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
