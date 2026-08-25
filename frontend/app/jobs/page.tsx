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
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  MapPin,
  Building2,
  Calendar,
  Send,
  FileText,
  X,
  AlertCircle,
} from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [matchDetails, setMatchDetails] = useState<any>(null);
  const [applyingJobId, setApplyingJobId] = useState<number | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.searchJobs({
        q: searchQuery || undefined,
        source: sourceFilter !== "all" ? sourceFilter : undefined,
        job_type: typeFilter !== "all" ? typeFilter : undefined,
        eligible_only: eligibleOnly ? true : undefined,
      });
      setJobs(res.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [sourceFilter, typeFilter, eligibleOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleViewMatch = async (job: any) => {
    setSelectedJob(job);
    try {
      const matchRes = await apiClient.getJobMatch(job.id);
      setMatchDetails(matchRes);
    } catch (e) {
      setMatchDetails(null);
    }
  };

  const handleApply = async (jobId: number) => {
    try {
      setApplyingJobId(jobId);
      const res = await apiClient.applyToJob(jobId, { status: "applied" });
      setActionFeedback(res.message || "Application successfully tracked!");
      setTimeout(() => setActionFeedback(null), 4000);
      fetchJobs();
    } catch (err: any) {
      setActionFeedback(err.response?.data?.detail || "Application already recorded or daily limit reached.");
      setTimeout(() => setActionFeedback(null), 4000);
    } finally {
      setApplyingJobId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onTriggerRun={fetchJobs} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Job Discovery & Matching
              </h1>
              <p className="text-xs text-gray-500">
                Discovered across LinkedIn, Naukri, Internshala, and Company portals. Deduplicated and scored for Sadhna.
              </p>
            </div>
            <Badge variant="secondary" className="self-start text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700">
              {jobs.length} Opportunities Discovered
            </Badge>
          </div>

          {actionFeedback && (
            <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 px-4 py-3 rounded-xl text-xs flex items-center gap-2 animate-fade-in font-medium">
              <Sparkles className="h-4 w-4 text-indigo-600 flex-shrink-0" />
              <span>{actionFeedback}</span>
            </div>
          )}

          {/* Search & Filter Bar */}
          <Card className="border-gray-200/90 shadow-2xs">
            <CardContent className="p-4 space-y-3">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by role, company, or skills (e.g. Python, SQL, React, Data Analyst)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4">
                  Search
                </Button>
              </form>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-gray-400 text-[11px] font-semibold flex items-center gap-1 mr-1">
                  <Filter className="h-3 w-3" /> Filters:
                </span>

                {/* Source Filter */}
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="all">All Sources</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="naukri">Naukri</option>
                  <option value="internshala">Internshala</option>
                  <option value="company">Company Portals</option>
                </select>

                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="all">All Job Types</option>
                  <option value="internship">Internships Only</option>
                  <option value="fresher">Fresher Roles Only</option>
                </select>

                {/* Eligible Only Toggle */}
                <button
                  type="button"
                  onClick={() => setEligibleOnly(!eligibleOnly)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors border ${
                    eligibleOnly
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  ✓ BCA Eligible Only
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Job Listings */}
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-500">
              <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>Scanning and ranking opportunities...</span>
            </div>
          ) : jobs.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-gray-300">
              <p className="text-sm font-semibold text-gray-700">No matching jobs found</p>
              <p className="text-xs text-gray-500 mt-1">Try broadening your search query or filters.</p>
            </Card>
          ) : (
            <div className="grid gap-3.5">
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  className="border-gray-200/90 hover:border-indigo-300 transition-all shadow-2xs hover:shadow-xs"
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Left: Job Info */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-bold text-gray-900 hover:text-indigo-600 transition-colors">
                            {job.role}
                          </h2>
                          <Badge
                            variant={job.match_score >= 90 ? "successLight" : job.match_score >= 75 ? "secondary" : "outline"}
                            className="text-xs font-bold"
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            {job.match_score || 80}% Match
                          </Badge>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold text-gray-500 bg-gray-50">
                            {job.source}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1 font-semibold text-gray-900">
                            <Building2 className="h-3.5 w-3.5 text-gray-400" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                            {job.location || "Remote"}
                          </span>
                          {job.stipend_min > 0 && (
                            <span className="font-semibold text-emerald-700">
                              ₹{job.stipend_min.toLocaleString()} - ₹{(job.stipend_max || job.stipend_min).toLocaleString()}/month
                            </span>
                          )}
                          {job.salary_min > 0 && (
                            <span className="font-semibold text-emerald-700">
                              ₹{(job.salary_min / 100000).toFixed(1)} - ₹{((job.salary_max || job.salary_min) / 100000).toFixed(1)} LPA
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>

                        {/* Skill Badges */}
                        {job.skills_required && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {job.skills_required.map((skill: string, idx: number) => (
                              <span
                                key={idx}
                                className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex md:flex-col items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleApply(job.id)}
                          disabled={applyingJobId === job.id}
                          className="w-full text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5 shadow-xs"
                        >
                          <Send className="h-3 w-3" />
                          <span>{applyingJobId === job.id ? "Applying..." : "Quick Apply"}</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewMatch(job)}
                          className="w-full text-xs h-8 font-medium text-gray-700 hover:text-indigo-600"
                        >
                          AI Match Breakdown
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Match Breakdown Modal */}
          {selectedJob && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-bold">
                        {selectedJob.match_score}% Match
                      </Badge>
                      <Badge variant="successLight" className="text-xs font-semibold capitalize">
                        {matchDetails?.eligibility_status?.replace("_", " ") || "Eligible"}
                      </Badge>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mt-2">{selectedJob.role}</h2>
                    <p className="text-xs text-gray-500">{selectedJob.company} • {selectedJob.location}</p>
                  </div>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Score Breakdown Bar */}
                {matchDetails?.breakdown && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-gray-200/80 space-y-2 text-xs">
                    <p className="font-bold text-gray-900">Match Scoring Matrix:</p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                      <div>Skills Match: <strong>{matchDetails.breakdown.skill_match}%</strong></div>
                      <div>Role Alignment: <strong>{matchDetails.breakdown.role_match}%</strong></div>
                      <div>Education (BCA): <strong>{matchDetails.breakdown.education_match}%</strong></div>
                      <div>Fresher Eligibility: <strong>{matchDetails.breakdown.experience_match}%</strong></div>
                    </div>
                  </div>
                )}

                {/* AI Reasoning */}
                {matchDetails?.ai_analysis && (
                  <div className="space-y-3 text-xs">
                    <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 space-y-2">
                      <p className="font-bold text-indigo-950 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-indigo-600" />
                        AI Strengths & Strategic Positioning:
                      </p>
                      <ul className="list-disc list-inside text-indigo-900 space-y-1 pl-1 text-[11px]">
                        {matchDetails.ai_analysis.strengths?.map((s: string, idx: number) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <Button variant="outline" size="sm" onClick={() => setSelectedJob(null)}>
                    Close
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      handleApply(selectedJob.id);
                      setSelectedJob(null);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                  >
                    Apply Now &rarr;
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
