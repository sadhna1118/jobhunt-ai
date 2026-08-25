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
  UserCircle,
  Award,
  BookOpen,
  Briefcase,
  FileText,
  Upload,
  Plus,
  X,
  CheckCircle2,
  Sparkles,
  Layers,
  Save,
} from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newRole, setNewRole] = useState("");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profRes, resumesRes] = await Promise.allSettled([
        apiClient.getProfile(),
        apiClient.listResumes(),
      ]);
      if (profRes.status === "fulfilled") setProfile(profRes.value);
      if (resumesRes.status === "fulfilled") setResumes(resumesRes.value || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await apiClient.updateProfile(profile);
      setActionFeedback("Candidate profile successfully updated!");
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.trim() || !profile) return;
    const current = profile.skills || [];
    if (!current.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...current, newSkill.trim()] });
    }
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      skills: (profile.skills || []).filter((s: string) => s !== skillToRemove),
    });
  };

  const handleAddRole = () => {
    if (!newRole.trim() || !profile) return;
    const current = profile.target_roles || [];
    if (!current.includes(newRole.trim())) {
      setProfile({ ...profile, target_roles: [...current, newRole.trim()] });
    }
    setNewRole("");
  };

  const handleRemoveRole = (roleToRemove: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      target_roles: (profile.target_roles || []).filter((r: string) => r !== roleToRemove),
    });
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await apiClient.uploadResume(file, "Software Developer & Data Analyst");
      setActionFeedback(`Resume '${file.name}' uploaded and parsed as source of truth!`);
      fetchProfileData();
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar />
          <main className="flex-1 p-12 text-center text-xs text-gray-500">
            <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading Sadhna's candidate dossier...</span>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onTriggerRun={fetchProfileData} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <UserCircle className="h-6 w-6 text-indigo-600" />
                <span>Candidate Profile & Resume</span>
              </h1>
              <p className="text-xs text-gray-500">
                Verified candidate background used as the single source of truth for all matching and applications.
              </p>
            </div>

            <Button
              size="sm"
              onClick={handleSaveProfile}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs gap-1.5 shadow-sm"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? "Saving..." : "Save Profile"}</span>
            </Button>
          </div>

          {actionFeedback && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs flex items-center gap-2 font-medium animate-fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>{actionFeedback}</span>
            </div>
          )}

          {/* Profile Overview Card */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Left 2 Cols: Form Fields */}
            <div className="md:col-span-2 space-y-6">
              <Card className="border-gray-200/90 shadow-2xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-gray-900">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Full Name</label>
                      <Input
                        value={profile.full_name || ""}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Email</label>
                      <Input
                        value={profile.email || ""}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Phone</label>
                      <Input
                        value={profile.phone || ""}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">City / Location</label>
                      <Input
                        value={profile.city || ""}
                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Degree</label>
                      <Input
                        value={profile.degree || ""}
                        onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">College / University</label>
                      <Input
                        value={profile.college || ""}
                        onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Graduation Year</label>
                      <Input
                        type="number"
                        value={profile.graduation_year || 2027}
                        onChange={(e) => setProfile({ ...profile, graduation_year: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Professional Summary / About</label>
                    <Textarea
                      rows={3}
                      value={profile.about || ""}
                      onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Target Roles Manager */}
              <Card className="border-gray-200/90 shadow-2xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-gray-900">Target Roles & Preferences</CardTitle>
                  <CardDescription className="text-xs">Add or remove roles for automated discovery matching</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom target role (e.g. AI Engineer Intern)..."
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="text-xs"
                    />
                    <Button type="button" size="sm" onClick={handleAddRole} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Role
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {(profile.target_roles || []).map((role: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5"
                      >
                        <span>{role}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRole(role)}
                          className="text-indigo-400 hover:text-indigo-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Technical Skills Tag Cloud */}
              <Card className="border-gray-200/90 shadow-2xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-gray-900">Verified Technical Skills</CardTitle>
                  <CardDescription className="text-xs">Skills evaluated against job descriptions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add new skill (e.g. FastAPI, Docker, TailwindCSS)..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="text-xs"
                    />
                    <Button type="button" size="sm" onClick={handleAddSkill} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Skill
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {(profile.skills || []).map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-slate-100 border border-slate-200 text-slate-800 text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-gray-400 hover:text-gray-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right 1 Col: Resume Versions & Accolades */}
            <div className="space-y-6">
              {/* Resume Upload & Versions Card */}
              <Card className="border-gray-200/90 shadow-2xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    <span>Resume Versions</span>
                  </CardTitle>
                  <CardDescription className="text-xs">Uploaded resume acts as the source of truth</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {resumes.map((r) => (
                    <div key={r.id} className="p-3 bg-slate-50 rounded-xl border border-gray-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">{r.version_name || "General Version"}</span>
                        {r.is_default && <Badge variant="successLight" className="text-[10px]">Active</Badge>}
                      </div>
                      <p className="text-[11px] text-gray-500">{r.filename}</p>
                    </div>
                  ))}

                  <label className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-xl p-4 text-center block cursor-pointer bg-indigo-50/40 transition-colors">
                    <Upload className="h-5 w-5 text-indigo-600 mx-auto mb-1" />
                    <span className="font-semibold text-indigo-700 text-xs block">Upload New Resume (PDF)</span>
                    <span className="text-[10px] text-gray-500">PDF or DOCX up to 5MB</span>
                    <input type="file" accept=".pdf,.docx" onChange={handleResumeUpload} className="hidden" />
                  </label>
                </CardContent>
              </Card>

              {/* Accolades & Certifications */}
              <Card className="border-amber-100 bg-amber-50/40 shadow-2xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-amber-950 flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-600" />
                    <span>Verified Certifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-amber-900">
                  <div className="p-2 bg-white rounded-lg border border-amber-200/80">
                    <p className="font-bold">2nd Prize Winner, National AI Make-a-thon</p>
                    <p className="text-[11px] text-gray-500">Dell Technologies & Learning Links Foundation</p>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-amber-200/80">
                    <p className="font-bold">Artificial Intelligence Certification</p>
                    <p className="text-[11px] text-gray-500">Infosys Springboard (2026)</p>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-amber-200/80">
                    <p className="font-bold">AI & Employability Skills</p>
                    <p className="text-[11px] text-gray-500">Dell Technologies (2025)</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
