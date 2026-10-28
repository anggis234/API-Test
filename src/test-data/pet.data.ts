import { PetPayload } from "../helpers/pet.api";

export function generateUniquePetId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

export function buildPetPayload(overrides?: Partial<PetPayload>): PetPayload {
  const uniqueId = generateUniquePetId();
  return {
    id: uniqueId,
    category: {
      id: 1,
      name: "Dogs",
    },
    name: `TestDog_${uniqueId}`,
    photoUrls: ["https://example.com/photos/dog1.jpg"],
    tags: [
      { id: 1, name: "playful" },
      { id: 2, name: "friendly" },
    ],
    status: "available",
    ...overrides,
  };
}

export const VALID_PET_STATUSES = ["available", "pending", "sold"] as const;

export const UNICODE_PET_DATA = {
  name: "🐶 Boba 🚀 <script>alert('xss')</script> ' OR '1'='1 --",
  photoUrls: ["https://example.com/photos/🐶_boba.png"],
};

export const BOUNDARY_PET_DATA = {
  maxSafeIntId: Number.MAX_SAFE_INTEGER,
};

export const INVALID_PET_DATA = {
  malformedType: {
    id: "not-a-valid-int64-id",
  },
  emptyObject: {},
  invalidStatus: "non_existent_status_12345",
  uppercaseStatus: "AVAILABLE",
};
