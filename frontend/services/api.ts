import axios, { AxiosInstance, AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor to attach token if available
    this.client.interceptors.request.use((config) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("jobhunt_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Soft error handling
        return Promise.reject(error);
      }
    );
  }

  // Health
  async health() {
    return this.client.get("/api/health/");
  }

  // Auth
  async register(email: string, username: string, password: string, full_name?: string) {
    const res = await this.client.post("/api/users/register", {
      email,
      username,
      password,
      full_name,
    });
    if (res.data?.access_token && typeof window !== "undefined") {
      localStorage.setItem("jobhunt_token", res.data.access_token);
      localStorage.setItem("jobhunt_user", JSON.stringify(res.data));
    }
    return res.data;
  }

  async login(email: string, password: string) {
    const res = await this.client.post("/api/users/login", { email, password });
    if (res.data?.access_token && typeof window !== "undefined") {
      localStorage.setItem("jobhunt_token", res.data.access_token);
      localStorage.setItem("jobhunt_user", JSON.stringify(res.data));
    }
    return res.data;
  }

  async demoLogin() {
    return this.login("sadhanakumari181106@gmail.com", "sadhna123");
  }

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("jobhunt_token");
      localStorage.removeItem("jobhunt_user");
    }
  }

  async getCurrentUser() {
    const res = await this.client.get("/api/users/me");
    return res.data;
  }

  // Profile
  async getProfile() {
    const res = await this.client.get("/api/users/profile");
    return res.data;
  }

  async updateProfile(data: any) {
    const res = await this.client.put("/api/users/profile", data);
    return res.data;
  }

  // Resume
  async uploadResume(file: File, versionName: string = "Software Developer") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("version_name", versionName);
    const res = await this.client.post("/api/users/resume/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }

  async listResumes() {
    const res = await this.client.get("/api/users/resumes");
    return res.data;
  }

  // Connected Accounts
  async getConnectedAccounts() {
    const res = await this.client.get("/api/users/connected-accounts");
    return res.data;
  }

  async connectAccount(platform: string, account_email?: string) {
    const res = await this.client.post(`/api/users/connected-accounts/${platform}/connect`, {
      platform,
      account_email,
    });
    return res.data;
  }

  async disconnectAccount(platform: string) {
    const res = await this.client.post(`/api/users/connected-accounts/${platform}/disconnect`);
    return res.data;
  }

  // Jobs
  async searchJobs(params?: {
    q?: string;
    source?: string;
    job_type?: string;
    location?: string;
    min_score?: number;
    eligible_only?: boolean;
    page?: number;
    limit?: number;
  }) {
    const res = await this.client.get("/api/jobs/search", { params });
    return res.data;
  }

  async getJob(jobId: number) {
    const res = await this.client.get(`/api/jobs/${jobId}`);
    return res.data;
  }

  async getJobMatch(jobId: number) {
    const res = await this.client.get(`/api/jobs/${jobId}/match`);
    return res.data;
  }

  async getTrendingJobs() {
    const res = await this.client.get("/api/jobs/trending");
    return res.data;
  }

  async seedDemoJobs() {
    const res = await this.client.post("/api/jobs/seed-demo");
    return res.data;
  }

  // Applications
  async listApplications(status?: string) {
    const res = await this.client.get("/api/applications/", { params: { status } });
    return res.data;
  }

  async getApplicationsByStatus() {
    const res = await this.client.get("/api/applications/status/by-status");
    return res.data;
  }

  async applyToJob(jobId: number, data?: { cover_letter?: string; notes?: string; status?: string }) {
    const res = await this.client.post(`/api/applications/${jobId}`, data || {});
    return res.data;
  }

  async getApplication(appId: number) {
    const res = await this.client.get(`/api/applications/${appId}`);
    return res.data;
  }

  async updateApplication(appId: number, data: { status?: string; notes?: string; response_text?: string }) {
    const res = await this.client.put(`/api/applications/${appId}`, data);
    return res.data;
  }

  // Recruiters CRM
  async listRecruiters(status?: string) {
    const res = await this.client.get("/api/recruiters/", { params: { status } });
    return res.data;
  }

  async getRecruiter(recruiterId: number) {
    const res = await this.client.get(`/api/recruiters/${recruiterId}`);
    return res.data;
  }

  async updateRecruiter(recruiterId: number, data: any) {
    const res = await this.client.put(`/api/recruiters/${recruiterId}`, data);
    return res.data;
  }

  async getRecruiterMessages(recruiterId: number) {
    const res = await this.client.get(`/api/recruiters/${recruiterId}/messages`);
    return res.data;
  }

  async sendRecruiterMessage(recruiterId: number, data: { message_type?: string; subject?: string; content: string }) {
    const res = await this.client.post(`/api/recruiters/${recruiterId}/message`, data);
    return res.data;
  }

  // Automation & Approval
  async getAutomationSettings() {
    const res = await this.client.get("/api/automation/settings");
    return res.data;
  }

  async updateAutomationSettings(data: any) {
    const res = await this.client.put("/api/automation/settings", data);
    return res.data;
  }

  async triggerAutomationRun(run_time: string = "manual") {
    const res = await this.client.post("/api/automation/run", null, { params: { run_time } });
    return res.data;
  }

  async getAutomationRuns() {
    const res = await this.client.get("/api/automation/runs");
    return res.data;
  }

  async getApprovalQueue() {
    const res = await this.client.get("/api/automation/approval-queue");
    return res.data;
  }

  async approveAction(itemId: number) {
    const res = await this.client.post(`/api/automation/approval-queue/${itemId}/approve`);
    return res.data;
  }

  async rejectAction(itemId: number) {
    const res = await this.client.post(`/api/automation/approval-queue/${itemId}/reject`);
    return res.data;
  }

  async editApprovalItem(itemId: number, payload: any) {
    const res = await this.client.post(`/api/automation/approval-queue/${itemId}/edit`, payload);
    return res.data;
  }

  async getDailyReport() {
    const res = await this.client.get("/api/automation/daily-report");
    return res.data;
  }

  async getDashboardStats() {
    const res = await this.client.get("/api/automation/stats");
    return res.data;
  }

  // AI Assistant
  async queryAssistant(query: string) {
    const res = await this.client.post("/api/automation/assistant/query", { query });
    return res.data;
  }
}

export const apiClient = new APIClient();
