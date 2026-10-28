import { type APIRequestContext, type APIResponse } from "@playwright/test";

export interface Category {
  id?: number;
  name?: string;
}

export interface Tag {
  id?: number;
  name?: string;
}

export interface PetPayload {
  id?: number;
  category?: Category;
  name: string;
  photoUrls: string[];
  tags?: Tag[];
  status?: "available" | "pending" | "sold" | string;
}

export class PetApi {
  constructor(private readonly request: APIRequestContext) {}

  async createPet(payload: any, options?: { headers?: Record<string, string> }): Promise<APIResponse> {
    return await this.request.post("/v2/pet", {
      data: payload,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  }

  async findByStatus(status: string | string[]): Promise<APIResponse> {
    const statusParam = Array.isArray(status) ? status.join(",") : status;
    return await this.request.get(`/v2/pet/findByStatus`, {
      params: {
        status: statusParam,
      },
    });
  }

  async getPetById(petId: number | string): Promise<APIResponse> {
    return await this.request.get(`/v2/pet/${petId}`);
  }

  async deletePet(petId: number | string, apiKey?: string): Promise<APIResponse> {
    const headers: Record<string, string> = {};
    if (apiKey) {
      headers["api_key"] = apiKey;
    }
    return await this.request.delete(`/v2/pet/${petId}`, {
      headers,
    });
  }
}
