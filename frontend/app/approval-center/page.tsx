"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { apiClient } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Edit3,
  SkipForward,
  Sparkles,
  Building2,
  Send,
  FileText,
  Clock,
  Layers,
  AlertTriangle,
  X,
} from "lucide-react";

export default function ApprovalCenterPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"approval" | "automation">("approval");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editText, setEditText] = useState("");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchApprovalQueue = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getApprovalQueue();
      setItems(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalQueue();
  }, []);

  const handleApprove = async (itemId: number) => {
    try {
      await apiClient.approveAction(itemId);
      setActionFeedback("Action approved and dispatched!");
      setTimeout(() => setActionFeedback(null), 3000);
      fetchApprovalQueue();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (itemId: number) => {
    try {
      await apiClient.rejectAction(itemId);
      setActionFeedback("Action rejected.");
      setTimeout(() => setActionFeedback(null), 3000);
      fetchApprovalQueue();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBatchApprove = async () => {
    try {
      for (const item of items) {
        await apiClient.approveAction(item.id);
      }
      setActionFeedback(`Batch approved all ${items.length} pending actions!`);
      setTimeout(() => setActionFeedback(null), 4000);
      fetchApprovalQueue();
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEdit = (item: any) => {
    setSelectedItem(item);
    setEditText(item.data?.cover_letter || item.data?.message || JSON.stringify(item.data, null, 2));
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;
    try {
      const payloadKey = selectedItem.action_type === "application" ? "cover_letter" : "message";
      await apiClient.editApprovalItem(selectedItem.id, { [payloadKey]: editText });
      setActionFeedback("Item edited and updated!");
      setSelectedItem(null);
      fetchApprovalQueue();
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onTriggerRun={fetchApprovalQueue} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-amber-500" />
                <span>Human-in-the-Loop Approval Center</span>
              </h1>
              <p className="text-xs text-gray-500">
                Review and approve AI-generated applications and recruiter outreach before anything is sent.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-3">
              <div className="bg-white border border-gray-200 rounded-xl p-1 flex items-center shadow-2xs text-xs font-semibold">
                <button
                  onClick={() => setMode("approval")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    mode === "approval" ? "bg-amber-500 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Approval Mode (Default)
                </button>
                <button
                  onClick={() => setMode("automation")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    mode === "automation" ? "bg-indigo-600 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Automation Mode
                </button>
              </div>

              {items.length > 0 && (
                <Button
                  size="sm"
                  onClick={handleBatchApprove}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Approve All ({items.length})
                </Button>
              )}
            </div>
          </div>

          {actionFeedback && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs flex items-center gap-2 font-medium animate-fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>{actionFeedback}</span>
            </div>
          )}

          {/* Pending Queue List */}
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-500">
              <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>Loading pending approvals...</span>
            </div>
          ) : items.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-gray-300">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-base font-bold text-gray-900">All Clear! No Pending Actions</p>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                All scheduled applications and recruiter messages have been reviewed. Next items will be prepared during the 5:00 AM & 9:00 PM automation runs.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="border-gray-200/90 shadow-2xs hover:border-amber-300 transition-all bg-white"
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Item Details */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={item.action_type === "hr_message" ? "purple" : "secondary"}
                            className="text-xs font-bold capitalize"
                          >
                            {item.action_type === "hr_message" ? "HR Recruiter Outreach" : "Job Application"}
                          </Badge>
                          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                            Score: {item.priority}%
                          </span>
                          <span className="text-[11px] text-gray-400">
                            Queued {item.created_at ? new Date(item.created_at).toLocaleTimeString() : "Today"}
                          </span>
                        </div>

                        <h2 className="text-base font-bold text-gray-900">
                          {item.job?.role || item.data?.role || "Developer Role"} at{" "}
                          <span className="text-indigo-600">{item.job?.company || item.data?.company || "Tech Corp"}</span>
                        </h2>

                        {/* Content Snippet */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 font-mono text-[11px] text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {item.data?.cover_letter || item.data?.message || JSON.stringify(item.data)}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap md:flex-col items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(item.id)}
                          className="w-full text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Approve & Send</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEdit(item)}
                          className="w-full text-xs h-8 font-medium text-gray-700 gap-1.5"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Edit Text</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(item.id)}
                          className="w-full text-xs h-8 font-medium text-red-600 hover:bg-red-50 gap-1.5"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Edit Modal */}
          {selectedItem && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl animate-fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Edit {selectedItem.action_type === "hr_message" ? "Outreach Message" : "Cover Letter"}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {selectedItem.job?.role || selectedItem.data?.role} at {selectedItem.job?.company || selectedItem.data?.company}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <Textarea
                  rows={10}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="font-mono text-xs leading-relaxed"
                />

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <Button variant="outline" size="sm" onClick={() => setSelectedItem(null)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveEdit} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                    Save Changes
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
