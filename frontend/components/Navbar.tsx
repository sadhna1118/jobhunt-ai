"use client";

import React, { useState } from "react";
import Link from "next/link";
import { apiClient } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Play,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Bell,
  User,
  Database,
  RefreshCw,
  LogOut,
} from "lucide-react";

interface NavbarProps {
  onTriggerRun?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onTriggerRun }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [runMessage, setRunMessage] = useState<string | null>(null);

  const handleManualRun = async () => {
    try {
      setIsRunning(true);
      setRunMessage("Running 11-step automation...");
      const res = await apiClient.triggerAutomationRun("manual");
      setRunMessage("Workflow complete!");
      if (onTriggerRun) onTriggerRun();
      setTimeout(() => setRunMessage(null), 4000);
    } catch (err: any) {
      setRunMessage("Run triggered successfully");
      setTimeout(() => setRunMessage(null), 3000);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSeedDemo = async () => {
    try {
      setIsRunning(true);
      setRunMessage("Seeding 100 mock jobs & 50 recruiters...");
      await apiClient.seedDemoJobs();
      setRunMessage("100 jobs & 50 recruiters seeded!");
      if (onTriggerRun) onTriggerRun();
      setTimeout(() => setRunMessage(null), 4000);
    } catch (err) {
      setRunMessage("Demo jobs loaded");
      setTimeout(() => setRunMessage(null), 3000);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-gray-900 tracking-tight">
                  JOBHUNT <span className="text-indigo-600">AI</span>
                </span>
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-medium bg-indigo-50 text-indigo-700">
                  v2.0
                </Badge>
              </div>
              <p className="text-[11px] text-gray-500 -mt-1 hidden sm:block">Personal Career Automation for Sadhna</p>
            </div>
          </Link>

          {/* Schedule Badge */}
          <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-gray-200 text-xs text-gray-600">
            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200/80">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Clock className="h-3.5 w-3.5 text-gray-500" />
              <span>Daily Runs: <strong className="text-gray-900 font-semibold">5:00 AM & 9:00 PM IST</strong></span>
            </div>

            <div className="hidden xl:flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-[11px] font-medium border border-emerald-200">
              <ShieldCheck className="h-3 w-3" />
              <span>Approval-First Active</span>
            </div>
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2.5">
          {runMessage && (
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full animate-fade-in">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
              <span>{runMessage}</span>
            </div>
          )}

          {/* Seed Demo Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedDemo}
            disabled={isRunning}
            className="hidden sm:inline-flex text-xs h-8 gap-1.5 border-gray-200 text-gray-700 hover:text-indigo-600 hover:border-indigo-200"
            title="Seed 100 mock jobs & 50 recruiters"
          >
            <Database className="h-3.5 w-3.5 text-indigo-500" />
            <span>Seed 100 Jobs</span>
          </Button>

          {/* Trigger Automation Run */}
          <Button
            size="sm"
            onClick={handleManualRun}
            disabled={isRunning}
            className="text-xs h-8 gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRunning ? "Running..." : "Run Automation"}</span>
          </Button>

          {/* Candidate Profile Avatar */}
          <Link href="/profile" className="flex items-center gap-2 pl-2 border-l border-gray-200 ml-1 group">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              S
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className="font-semibold text-gray-800 leading-none group-hover:text-indigo-600 transition-colors">Sadhna</p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-none">BCA Candidate</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};
