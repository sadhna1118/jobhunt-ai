"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lock, ArrowRight, ShieldCheck, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("sadhanakumari181106@gmail.com");
  const [password, setPassword] = useState("sadhna123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await apiClient.login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.demoLogin();
      router.push("/dashboard");
    } catch (err) {
      router.push("/dashboard");
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
          <p className="text-xs text-gray-500">Log in to manage candidate automation for Sadhna</p>
        </div>

        <Card className="border-gray-200/90 shadow-md bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-gray-900">Welcome Back</CardTitle>
            <CardDescription className="text-xs">
              Access your personalized job matching and CRM hub
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            {/* Quick 1-Click Demo Access */}
            <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900">Sadhna's Demo Profile</span>
                <Badge variant="secondary" className="text-[10px] font-bold">1-Click Access</Badge>
              </div>
              <p className="text-[11px] text-gray-600">
                Instant access with preloaded BCA candidate profile and 100 discovered jobs.
              </p>
              <Button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-8 shadow-xs"
              >
                Launch Dashboard as Sadhna &rarr;
              </Button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gray-200" />
              <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-gray-400">Or sign in manually</span>
              <div className="flex-grow border-t border-gray-200" />
            </div>

            <form onSubmit={handleLogin} className="space-y-3 text-xs">
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
                className="w-full bg-gray-900 hover:bg-black text-white font-semibold text-xs h-9 mt-2"
              >
                {loading ? "Authenticating..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center pt-2 text-[11px] text-gray-500">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-indigo-600 font-semibold hover:underline">
                Create account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
