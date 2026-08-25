"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("Sadhna");
  const [username, setUsername] = useState("sadhna");
  const [email, setEmail] = useState("sadhanakumari181106@gmail.com");
  const [password, setPassword] = useState("sadhna123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await apiClient.register(email, username, password, fullName);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Try logging in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-gray-900">
              JOBHUNT <span className="text-indigo-600">AI</span>
            </span>
          </Link>
          <p className="text-xs text-gray-500">Create candidate profile and enable career automation</p>
        </div>

        <Card className="border-gray-200/90 shadow-md bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-gray-900">Get Started</CardTitle>
            <CardDescription className="text-xs">
              Set up your career assistant with BCA graduation preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Full Name</label>
                <Input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Username</label>
                <Input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Email Address</label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Password</label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-xs"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 mt-2"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="text-center pt-2 text-[11px] text-gray-500">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-indigo-600 font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
