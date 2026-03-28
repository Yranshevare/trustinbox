import axios from "axios";

const getApiUrl = (): string => {
  return "http://localhost:3000";
};

export const apiClient = axios.create({
  baseURL: getApiUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

async function getAuthToken(): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(["authToken"], (result) => {
        resolve(result.authToken || null);
      });
    } else {
      resolve(null);
    }
  });
}

export const setAuthToken = (token: string) => {
  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.local.set({ authToken: token });
  }
};

export const clearAuthToken = () => {
  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.local.remove(["authToken"]);
  }
};

export interface AnalyzeEmailRequest {
  subject: string;
  sender: string;
  body: string;
  bodyHtml?: string;
}

export interface AnalyzeEmailResponse {
  score: number;
  riskLevel: "low" | "medium" | "high";
  threats: string[];
  recommendations: string;
  analyzedAt: string;
}

export const analyzeEmail = async (
  data: AnalyzeEmailRequest,
): Promise<AnalyzeEmailResponse> => {
  const response = await apiClient.post<AnalyzeEmailResponse>(
    "/api/analyse",
    data,
  );
  return response.data;
};

export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get("/api/health");
    return response.status === 200;
  } catch {
    return false;
  }
};
