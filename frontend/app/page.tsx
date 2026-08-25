"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Send,
  Kanban,
  Bot,
  Search,
  Lock,
  Layers,
  Award,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleDemoAccess = async () => {
    try {
      setLoadingDemo(true);
      await apiClient.demoLogin();
      router.push("/dashboard");
    } catch (e) {
      router.push("/dashboard");
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
        <span>JOBHUNT AI 2.0 is live for <strong>Sadhna</strong> (BCA Entry-Level & Internships)</span>
        <span className="hidden sm:inline bg-indigo-700/60 px-2 py-0.5 rounded-full text-[10px]">IST Timezone: Asia/Kolkata</span>
      </div>

      {/* Navigation */}
      <nav className="border-b border-gray-200/80 bg-white/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-gray-900">
                JOBHUNT <span className="text-indigo-600">AI</span>
              </span>
              <span className="text-xs text-gray-500 ml-2 hidden md:inline">Career Automation</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                Log In
              </Button>
            </Link>
            <Button
              onClick={handleDemoAccess}
              disabled={loadingDemo}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium gap-1.5"
            >
              <span>{loadingDemo ? "Accessing..." : "Launch Dashboard"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),theme(colors.slate.50))]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700 mb-6 shadow-2xs">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            <span>100% Policy-Compliant • Human-in-the-Loop Human Oversight</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
            Autonomous Career Search Designed for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600">Sadhna</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Runs daily at <strong>5:00 AM & 9:00 PM IST</strong> across LinkedIn, Naukri, Internshala, and Company portals. Checks BCA eligibility, prevents duplicate applications, calculates 0–100 match scores, and prepares personalized recruiter outreach.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              size="lg"
              onClick={handleDemoAccess}
              disabled={loadingDemo}
              className="h-12 px-8 text-base bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-200 rounded-xl gap-2 w-full sm:w-auto"
            >
              <span>{loadingDemo ? "Loading Career Dashboard..." : "Open Candidate Dashboard"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Link href="/jobs" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="h-12 px-6 text-base font-semibold border-gray-300 rounded-xl w-full">
                Explore Discovered Jobs (100+)
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border border-gray-200/80 shadow-xs">
              <p className="text-xs font-medium text-gray-500">Scheduled Runs</p>
              <p className="text-xl font-extrabold text-indigo-900 mt-1">5 AM & 9 PM</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Asia/Kolkata (IST)</p>
            </div>
            <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border border-gray-200/80 shadow-xs">
              <p className="text-xs font-medium text-gray-500">Daily Limits</p>
              <p className="text-xl font-extrabold text-indigo-900 mt-1">10 Apps • 5 Emails</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Anti-Spam Protected</p>
            </div>
            <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border border-gray-200/80 shadow-xs">
              <p className="text-xs font-medium text-gray-500">Target Level</p>
              <p className="text-xl font-extrabold text-indigo-900 mt-1">BCA / Freshers</p>
              <p className="text-[11px] text-indigo-600 font-medium mt-0.5">Internship & Entry</p>
            </div>
            <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border border-gray-200/80 shadow-xs">
              <p className="text-xs font-medium text-gray-500">Deduplication</p>
              <p className="text-xl font-extrabold text-emerald-600 mt-1">100% Active</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Cross-Platform Lock</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflow Pillars */}
      <section className="py-16 bg-white border-y border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">
              Autonomous 11-Step Engine
            </h2>
            <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Built with Safety, Truthfulness, and Precision
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-gray-200/90 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
                  <Search className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg font-bold">1. Discovery & Normalization</CardTitle>
                <CardDescription>
                  Aggregates opportunities from LinkedIn, Naukri, Internshala, and direct career portals into a unified format.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-gray-600 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Stipend, salary, location, skills extraction</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Cross-platform duplicate elimination</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200/90 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-3">
                  <Bot className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg font-bold">2. AI Eligibility & Match Scoring</CardTitle>
                <CardDescription>
                  Evaluates BCA degree acceptance, skills overlap (Python, SQL, React, Power BI, AI/ML), and generates a 0-100 score.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-gray-600 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Eligible, Possibly Eligible, Not Eligible tags</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Default minimum match score: 75%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200/90 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg font-bold">3. Recruiter CRM & Outreach</CardTitle>
                <CardDescription>
                  Tracks recruiter contact history, enforces 30-day cooldowns, and generates personalized morning/evening messages.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-gray-600 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Good morning (5 AM) / Good evening (9 PM)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Do Not Contact safety lock protection</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Candidate Profile Details Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 shadow-sm">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Badge variant="secondary" className="mb-4">Pre-Configured Profile</Badge>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">
                  Sadhna's Verified Career Dossier
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  Derived directly from Sadhna's resume (BCA, Maharishi Dayanand University, Expected 2027). The system never invents missing information or fabricates experience.
                </p>

                <div className="space-y-3 text-xs text-gray-700">
                  <div className="flex items-start gap-2">
                    <Award className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Accolade:</strong> 2nd Prize Winner, National AI Make-a-thon (Dell Technologies)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Layers className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Featured Project:</strong> FemCare – Women's Health & Wellness App (Flutter, Dart, Firebase, AI/ML)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Core Skills:</strong> Python, SQL, React, Flask, Django, Power BI, Pandas, NumPy, Flutter, Firebase</span>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <Link href="/profile">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                      View & Edit Full Profile
                    </Button>
                  </Link>
                  <Link href="/approval-center">
                    <Button variant="outline" className="text-xs">
                      Approval Center
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl p-6 text-slate-200 font-mono text-xs shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
                  <span>automation_config.json</span>
                  <span className="text-emerald-400">● Live</span>
                </div>
                <pre className="mt-4 leading-relaxed overflow-x-auto text-[11px] text-indigo-300">
{`{
  "candidate": "Sadhna",
  "degree": "Bachelor of Computer Applications (BCA)",
  "daily_runs": ["05:00 AM IST", "09:00 PM IST"],
  "timezone": "Asia/Kolkata",
  "limits": {
    "max_applications_per_day": 10,
    "max_new_hr_emails_per_run": 5
  },
  "deduplication": {
    "exact_job_id": true,
    "fuzzy_company_role": true,
    "recruiter_cooldown_days": 30
  },
  "compliance": {
    "passwordless_auth": true,
    "human_approval_mode": "DEFAULT"
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <p className="font-semibold text-gray-700">JOBHUNT AI — Personal Career Automation Platform for Sadhna</p>
          <p>Built with Next.js, FastAPI, PostgreSQL, and strict anti-spam compliance standards.</p>
        </div>
      </footer>
    </div>
  );
}
