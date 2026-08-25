"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { apiClient } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Settings as SettingsIcon,
  Clock,
  ShieldCheck,
  Zap,
  Save,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({
    is_enabled: true,
    morning_time: "05:00",
    evening_time: "21:00",
    daily_application_limit: 10,
    daily_email_limit: 5,
    min_match_score: 75.0,
    auto_apply_enabled: false,
    auto_message_enabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getAutomationSettings();
      if (res) setSettings(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await apiClient.updateAutomationSettings(settings);
      setActionFeedback("Automation schedule and limits updated successfully!");
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onTriggerRun={fetchSettings} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <SettingsIcon className="h-6 w-6 text-indigo-600" />
                <span>Automation Schedule & Safety Settings</span>
              </h1>
              <p className="text-xs text-gray-500">
                Configure dual run times, daily application & email quotas, and match score thresholds for Sadhna.
              </p>
            </div>

            <Button
              size="sm"
              onClick={handleSaveSettings}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs gap-1.5 shadow-sm"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? "Saving..." : "Save Settings"}</span>
            </Button>
          </div>

          {actionFeedback && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs flex items-center gap-2 font-medium animate-fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>{actionFeedback}</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Schedule Card */}
            <Card className="border-gray-200/90 shadow-2xs bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  <span>Daily Execution Schedule (IST)</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Timezone: Asia/Kolkata (Asia/Kolkata UTC+5:30)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-gray-200">
                  <div>
                    <p className="font-bold text-gray-900">Automation Enabled</p>
                    <p className="text-[11px] text-gray-500">Runs twice daily automatically</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.is_enabled}
                    onChange={(e) => setSettings({ ...settings, is_enabled: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 rounded"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Morning Run Time (IST)</label>
                    <Input
                      type="text"
                      value={settings.morning_time || "05:00"}
                      onChange={(e) => setSettings({ ...settings, morning_time: e.target.value })}
                      placeholder="05:00"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Greeting: "Good morning"</p>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Evening Run Time (IST)</label>
                    <Input
                      type="text"
                      value={settings.evening_time || "21:00"}
                      onChange={(e) => setSettings({ ...settings, evening_time: e.target.value })}
                      placeholder="21:00"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Greeting: "Good evening"</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quotas & Thresholds */}
            <Card className="border-gray-200/90 shadow-2xs bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Safety Limits & Thresholds</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Prevents platform rate-limit violations and spam
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Daily Application Limit</label>
                    <Input
                      type="number"
                      value={settings.daily_application_limit || 10}
                      onChange={(e) => setSettings({ ...settings, daily_application_limit: parseInt(e.target.value) })}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Default: Max 10 applications/day</p>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Daily Recruiter Email Limit</label>
                    <Input
                      type="number"
                      value={settings.daily_email_limit || 5}
                      onChange={(e) => setSettings({ ...settings, daily_email_limit: parseInt(e.target.value) })}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Default: Max 5 new emails/run</p>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Minimum AI Match Score Threshold: <span className="text-indigo-600 font-bold">{settings.min_match_score}%</span>
                  </label>
                  <input
                    type="range"
                    min={50}
                    max={95}
                    step={5}
                    value={settings.min_match_score || 75}
                    onChange={(e) => setSettings({ ...settings, min_match_score: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>50% (Broad)</span>
                    <span className="font-bold text-indigo-600">75% (Recommended)</span>
                    <span>95% (Strict)</span>
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
