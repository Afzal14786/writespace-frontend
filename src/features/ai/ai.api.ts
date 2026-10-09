import api from "@/lib/api/api";

export interface PostAssistantRequest {
  title?: string;
  content: string;
  instruction?: string;
}

export interface PostAssistantResult {
  suggestedTitle: string;
  summary: string;
  topics: string[];
}

interface PostAssistantResponse {
  status: "success";
  data: PostAssistantResult;
}

export const AIAPI = {
  generatePostAssistant: async (
    payload: PostAssistantRequest,
  ): Promise<PostAssistantResult> => {
    const response = await api.post<PostAssistantResponse>(
      "/ai/post-assistant",
      payload,
    );

    return response.data.data;
  },
};
