"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { apiClient } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Users2,
  Building2,
  Mail,
  Send,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  X,
  AlertTriangle,
} from "lucide-react";

export default function RecruitersPage() {
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRecruiter, setSelectedRecruiter] = useState<any>(null);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageType, setMessageType] = useState("linkedin");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);

  const fetchRecruiters = async () => {
    try {
      setLoading(true);
      const res = await apiClient.listRecruiters(statusFilter !== "all" ? statusFilter : undefined);
      setRecruiters(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiters();
  }, [statusFilter]);

  const handleOpenMessageModal = (rec: any) => {
    setSelectedRecruiter(rec);
    // Dynamic greeting based on current IST hour
    const hour = new Date().getHours();
    const greeting = hour >= 4 && hour < 12 ? "morning" : hour >= 12 && hour < 17 ? "afternoon" : "evening";

    const salutation = rec.name && !rec.name.toLowerCase().includes("hr") ? `Hi ${rec.name},` : `Good ${greeting},`;

    const sampleMsg = `${salutation}

I hope you're doing well. I wanted to reach out and ask if there are any internship or entry-level opportunities available in technical/IT roles at ${rec.company}.

As a fresher with a BCA background (Python, SQL, React, Power BI, AI/ML), I am eager to start my career and would truly appreciate any guidance you can share.

Thank you.

Best regards,
Sadhna`;

    setMessageText(sampleMsg);
    setMessageModalOpen(true);
  };

  const handleSendMessage = async () => {
    if (!selectedRecruiter) return;
    try {
      setSendingMessage(true);
      await apiClient.sendRecruiterMessage(selectedRecruiter.id, {
        message_type: messageType,
        content: messageText,
      });
      setActionFeedback(`Message recorded & sent to ${selectedRecruiter.name} at ${selectedRecruiter.company}!`);
      setMessageModalOpen(false);
      fetchRecruiters();
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      setActionFeedback(err.response?.data?.detail || "Could not send message. Please check safety restrictions.");
      setTimeout(() => setActionFeedback(null), 4000);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleToggleDoNotContact = async (rec: any) => {
    const newStatus = rec.status === "do_not_contact" ? "not_contacted" : "do_not_contact";
    try {
      await apiClient.updateRecruiter(rec.id, { status: newStatus });
      fetchRecruiters();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onTriggerRun={fetchRecruiters} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Users2 className="h-6 w-6 text-indigo-600" />
                <span>Recruiter CRM</span>
              </h1>
              <p className="text-xs text-gray-500">
                Track HR interactions, prevent recruiter message spam, enforce cooldowns, and manage outreach.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs bg-indigo-50 text-indigo-700 font-semibold">
                Limit: 5 New Emails/Run
              </Badge>
              <Badge variant="outline" className="text-xs text-gray-600 bg-white">
                30-Day Cooldown Active
              </Badge>
            </div>
          </div>

          {actionFeedback && (
            <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 px-4 py-3 rounded-xl text-xs flex items-center gap-2 font-medium animate-fade-in">
              <Sparkles className="h-4 w-4 text-indigo-600 flex-shrink-0" />
              <span>{actionFeedback}</span>
            </div>
          )}

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {["all", "not_contacted", "contacted", "replied", "interview", "do_not_contact"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition-all border ${
                  statusFilter === st
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Recruiters List / Grid */}
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-500">
              <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>Loading recruiter CRM database...</span>
            </div>
          ) : recruiters.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-gray-300">
              <p className="text-sm font-semibold text-gray-700">No recruiters found</p>
              <p className="text-xs text-gray-500 mt-1">Run automation or seed demo jobs to discover relevant recruiters.</p>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recruiters.map((rec) => {
                const isDoNotContact = rec.status === "do_not_contact";
                return (
                  <Card
                    key={rec.id}
                    className={`border-gray-200/90 shadow-2xs hover:shadow-xs transition-all ${
                      isDoNotContact ? "bg-red-50/40 border-red-200" : "bg-white hover:border-indigo-300"
                    }`}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h2 className="font-bold text-sm text-gray-900 leading-tight">{rec.name}</h2>
                          <p className="text-xs text-gray-500">{rec.role}</p>
                        </div>
                        <Badge
                          variant={
                            isDoNotContact
                              ? "destructive"
                              : rec.status === "replied"
                              ? "successLight"
                              : rec.status === "contacted"
                              ? "purple"
                              : "secondary"
                          }
                          className="text-[10px] font-bold capitalize"
                        >
                          {rec.status.replace("_", " ")}
                        </Badge>
                      </div>

                      <div className="text-xs text-gray-600 space-y-1 pt-1 border-t border-gray-100">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-gray-400" />
                          <span className="font-semibold text-gray-900">{rec.company}</span>
                        </div>
                        {rec.email && (
                          <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            <span>{rec.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          <span>Last contact: {rec.last_contact_date ? new Date(rec.last_contact_date).toLocaleDateString() : "Never"}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <Button
                          size="sm"
                          onClick={() => handleOpenMessageModal(rec)}
                          disabled={isDoNotContact}
                          className="flex-1 text-xs h-7 bg-indigo-600 hover:bg-indigo-700 text-white font-medium gap-1"
                        >
                          <Send className="h-3 w-3" />
                          <span>Outreach</span>
                        </Button>
                        <Button
                          size="sm"
                          variant={isDoNotContact ? "default" : "outline"}
                          onClick={() => handleToggleDoNotContact(rec)}
                          className={`text-xs h-7 px-2 font-medium ${
                            isDoNotContact ? "bg-red-600 hover:bg-red-700 text-white" : "text-gray-600 hover:text-red-600"
                          }`}
                          title={isDoNotContact ? "Remove Do Not Contact" : "Mark as Do Not Contact"}
                        >
                          {isDoNotContact ? "Unblock" : "Do Not Contact"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Outreach Modal */}
          {messageModalOpen && selectedRecruiter && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 shadow-2xl animate-fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Personalized Outreach to {selectedRecruiter.name}
                    </h2>
                    <p className="text-xs text-gray-500">{selectedRecruiter.company} • {selectedRecruiter.role}</p>
                  </div>
                  <button
                    onClick={() => setMessageModalOpen(false)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Channel:</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMessageType("linkedin")}
                        className={`px-3 py-1 rounded-lg font-semibold border ${
                          messageType === "linkedin"
                            ? "bg-blue-50 text-blue-700 border-blue-300"
                            : "bg-white text-gray-600 border-gray-200"
                        }`}
                      >
                        LinkedIn Message
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessageType("email")}
                        className={`px-3 py-1 rounded-lg font-semibold border ${
                          messageType === "email"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                            : "bg-white text-gray-600 border-gray-200"
                        }`}
                      >
                        Gmail Outreach
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      Message Content (Truth-Preserving & Personalized):
                    </label>
                    <Textarea
                      rows={8}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="font-mono text-[11px] leading-relaxed"
                    />
                  </div>

                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Compliance Lock:</strong> This message will be recorded in your CRM and deduplication database. Re-messaging this contact within 30 days is automatically restricted.
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <Button variant="outline" size="sm" onClick={() => setMessageModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={sendingMessage}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5"
                  >
                    <Send className="h-3 w-3" />
                    <span>{sendingMessage ? "Sending..." : "Send & Record in CRM"}</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
