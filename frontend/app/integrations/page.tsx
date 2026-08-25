"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { apiClient } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Link2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Mail,
  Lock,
  Sparkles,
} from "lucide-react";

interface PlatformInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  authMethod: string;
  connected: boolean;
  accountEmail?: string;
}

export default function IntegrationsPage() {
  const [accounts, setAccounts] = useState<PlatformInfo[]>([
    {
      id: "linkedin",
      name: "LinkedIn",
      category: "Job Source & HR InMail",
      description: "Discovers tech internships & generates personalized outreach messages.",
      authMethod: "OAuth 2.0 / Browser Session",
      connected: true,
      accountEmail: "sadhna@linkedin.com",
    },
    {
      id: "gmail",
      name: "Gmail (Google Workspace)",
      category: "HR Email Outreach",
      description: "Sends maximum 5 new verified recruiter emails per run using candidate's template.",
      authMethod: "Google OAuth 2.0",
      connected: true,
      accountEmail: "sadhanakumari181106@gmail.com",
    },
    {
      id: "naukri",
      name: "Naukri.com",
      category: "Fresher Job Discovery",
      description: "Scans Indian IT openings for BCA/B.Tech freshers & entry-level roles.",
      authMethod: "Compliant Session",
      connected: false,
    },
    {
      id: "internshala",
      name: "Internshala",
      category: "Internship Discovery",
      description: "Aggregates technical internships with verified stipends and immediate joining.",
      authMethod: "Compliant Session",
      connected: false,
    },
  ]);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      const res = await apiClient.getConnectedAccounts();
      if (res && res.length > 0) {
        setAccounts((prev) =>
          prev.map((p) => {
            const found = res.find((r: any) => r.platform === p.id);
            if (found) {
              return { ...p, connected: found.is_connected, accountEmail: found.account_email || p.accountEmail };
            }
            return p;
          })
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAccounts();
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "gmail") {
      setActionFeedback("Successfully connected Gmail via secure OAuth 2.0!");
      setTimeout(() => setActionFeedback(null), 3000);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleToggleConnect = async (platform: PlatformInfo) => {
    try {
      setConnectingId(platform.id);
      if (platform.connected) {
        await apiClient.disconnectAccount(platform.id);
        setActionFeedback(`Disconnected ${platform.name}.`);
        fetchAccounts();
      } else {
        if (platform.id === "gmail") {
          // Secure OAuth 2.0 flow
          window.location.href = "http://localhost:8000/api/auth/gmail/login";
          return;
        }
        await apiClient.connectAccount(platform.id, "sadhanakumari181106@gmail.com");
        setActionFeedback(`Successfully connected ${platform.name} via secure authorization!`);
        fetchAccounts();
      }
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setConnectingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Link2 className="h-6 w-6 text-indigo-600" />
                <span>Connected Platforms & Integrations</span>
              </h1>
              <p className="text-xs text-gray-500">
                Secure authentication without password storage. Official OAuth & compliant sessions only.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="successLight" className="text-xs font-semibold">
                <Lock className="h-3 w-3 mr-1" />
                Zero Password Storage
              </Badge>
            </div>
          </div>

          {actionFeedback && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs flex items-center gap-2 font-medium animate-fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>{actionFeedback}</span>
            </div>
          )}

          {/* Platform Cards Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {accounts.map((plat) => (
              <Card
                key={plat.id}
                className="border-gray-200/90 shadow-2xs hover:shadow-xs transition-all bg-white"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-base text-gray-900">{plat.name}</h2>
                        <Badge
                          variant={plat.connected ? "successLight" : "outline"}
                          className="text-[10px] font-bold uppercase"
                        >
                          {plat.connected ? "Connected" : "Disconnected"}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{plat.category}</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {plat.description}
                  </p>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-100 text-[11px] text-gray-600 space-y-1">
                    <div><strong>Auth Method:</strong> {plat.authMethod}</div>
                    {plat.connected && plat.accountEmail && (
                      <div><strong>Active Account:</strong> {plat.accountEmail}</div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                    <Button
                      size="sm"
                      variant={plat.connected ? "outline" : "default"}
                      onClick={() => handleToggleConnect(plat)}
                      disabled={connectingId === plat.id}
                      className={`text-xs h-8 font-semibold ${
                        plat.connected ? "text-gray-700 hover:text-red-600" : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                    >
                      {connectingId === plat.id
                        ? "Updating..."
                        : plat.connected
                        ? "Disconnect"
                        : plat.id === "gmail"
                        ? "Connect with Google"
                        : "Connect"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Compliance & Safety Guarantee */}
          <div className="bg-gradient-to-r from-indigo-900 to-violet-900 rounded-3xl p-6 sm:p-8 text-white space-y-3 shadow-md">
            <h2 className="text-base font-bold flex items-center gap-2 text-indigo-100">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span>Strict Platform Safety Guarantees</span>
            </h2>
            <ul className="text-xs text-indigo-200 space-y-1.5 list-disc list-inside">
              <li>Passwords are never requested, stored, or processed anywhere in the platform.</li>
              <li>Rate limits, MFA, and CAPTCHA challenges are never bypassed.</li>
              <li>Recruiter outreach strictly respects individual 30-day cooldowns and "DO NOT CONTACT" flags.</li>
              <li>Human approval is required by default before messages or applications are sent.</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
