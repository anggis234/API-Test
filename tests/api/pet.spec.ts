import { test, expect } from "../../src/fixtures/base.fixture";
import {
  buildPetPayload,
  generateUniquePetId,
  UNICODE_PET_DATA,
  BOUNDARY_PET_DATA,
  INVALID_PET_DATA,
} from "../../src/test-data/pet.data";

test.describe("Swagger Petstore API - Pet Management", () => {
  const createdPetIds: number[] = [];

  test.afterEach(async ({ petApi }) => {
    while (createdPetIds.length > 0) {
      const id = createdPetIds.pop();
      if (id) {
        try {
          await petApi.deletePet(id);
        } catch {
        }
      }
    }
  });

  test(
    "Successfully create a new pet with complete valid payload",
    { tag: ["@BE-01", "@Pet", "@api", "@regression"] },
    async ({ petApi }) => {
      const petPayload = buildPetPayload();
      createdPetIds.push(petPayload.id!);

      let responseStatus: number;
      let responseBody: any;

      await test.step("Send POST /v2/pet with valid payload", async () => {
        const response = await petApi.createPet(petPayload);
        responseStatus = response.status();
        responseBody = await response.json();
      });

      await test.step("Verify HTTP Status code is 200 OK", async () => {
        expect(responseStatus).toBe(200);
      });

      await test.step("Verify response body matches sent pet data", async () => {
        expect(responseBody).toBeDefined();
        expect(responseBody.id).toBe(petPayload.id);
        expect(responseBody.name).toBe(petPayload.name);
        expect(responseBody.status).toBe(petPayload.status);
        expect(responseBody.category?.name).toBe(petPayload.category?.name);
        expect(responseBody.photoUrls).toEqual(petPayload.photoUrls);
      });
    }
  );

  test(
    "Verify error response when POST /pet has malformed or empty payload",
    { tag: ["@BE-02", "@Pet", "@api", "@regression"] },
    async ({ petApi }) => {
      let responseStatus: number;
      let responseBody: any;

      await test.step("Send POST /v2/pet with malformed body", async () => {
        const response = await petApi.createPet("");
        responseStatus = response.status();
        responseBody = await response.json();
      });

      await test.step("Verify server returns error status code (400, 405, or 500)", async () => {
        expect([400, 405, 500]).toContain(responseStatus);
        expect(responseBody.message).toBeDefined();
      });
    }
  );

  test(
    "Query pets by status 'available' returns array of available pets",
    { tag: ["@BE-03", "@Pet", "@api", "@regression"] },
    async ({ petApi }) => {
      let responseStatus: number;
      let pets: any[];

      await test.step("Send GET /v2/pet/findByStatus?status=available", async () => {
        const response = await petApi.findByStatus("available");
        responseStatus = response.status();
        pets = await response.json();
      });

      await test.step("Verify HTTP status is 200 OK", async () => {
        expect(responseStatus).toBe(200);
      });

      await test.step("Verify response is a non-empty array", async () => {
        expect(Array.isArray(pets)).toBe(true);
        expect(pets.length).toBeGreaterThan(0);
      });

      await test.step("Validate that returned pets have status 'available'", async () => {
        const sample = pets.slice(0, 10);
        for (const pet of sample) {
          expect(pet.status).toBe("available");
        }
      });
    }
  );

  test(
    "BE-04: Query pets by multiple statuses (pending, sold)",
    { tag: ["@BE-04", "@Pet", "@Medium", "@api", "@regression"] },
    async ({ petApi }) => {
      let responseStatus: number;
      let pets: any[];

      await test.step("Send GET /v2/pet/findByStatus with multiple statuses", async () => {
        const response = await petApi.findByStatus(["pending", "sold"]);
        responseStatus = response.status();
        pets = await response.json();
      });

      await test.step("Verify HTTP status is 200 OK", async () => {
        expect(responseStatus).toBe(200);
      });

      await test.step("Verify response is an array containing valid status items", async () => {
        expect(Array.isArray(pets)).toBe(true);
        const sample = pets.slice(0, 10);
        for (const pet of sample) {
          expect(["pending", "sold"]).toContain(pet.status);
        }
      });
    }
  );

  test(
    "Query pets with unrecognized status returns empty array",
    { tag: ["@BE-05", "@Pet", "@api", "@regression"] },
    async ({ petApi }) => {
      let responseStatus: number;
      let pets: any[];

      await test.step("Send GET /v2/pet/findByStatus with non-existent status", async () => {
        const response = await petApi.findByStatus("non_existent_status_12345");
        responseStatus = response.status();
        pets = await response.json();
      });

      await test.step("Verify HTTP status is 200 OK and response is empty array", async () => {
        expect(responseStatus).toBe(200);
        expect(Array.isArray(pets)).toBe(true);
        expect(pets.length).toBe(0);
      });
    }
  );

  test(
    "Successfully delete an existing pet by ID",
    { tag: ["@BE-06", "@Pet", "@api", "@regression"] },
    async ({ petApi }) => {
      const pet = buildPetPayload();
      const petId = pet.id!;

      await test.step("Precondition: Create a pet via POST /v2/pet", async () => {
        const postRes = await petApi.createPet(pet);
        expect(postRes.status()).toBe(200);
      });

      await test.step("Send DELETE /v2/pet/{petId} with valid ID", async () => {
        const deleteRes = await petApi.deletePet(petId, "special-key");
        expect(deleteRes.status()).toBe(200);
      });

      await test.step("Verify pet is deleted by verifying GET /v2/pet/{petId} returns 404", async () => {
        const getRes = await petApi.getPetById(petId);
        expect(getRes.status()).toBe(404);
      });
    }
  );

  test(
    "Deleting non-existent pet returns 404 Not Found",
    { tag: ["@BE-07", "@Pet", "@api", "@regression"] },
    async ({ petApi }) => {
      const nonExistentId = generateUniquePetId() + 99999999;
      let deleteStatus: number;

      await test.step("Send DELETE /v2/pet/{petId} for non-existent ID", async () => {
        const response = await petApi.deletePet(nonExistentId, "special-key");
        deleteStatus = response.status();
      });

      await test.step("Verify HTTP Status is 404 Not Found", async () => {
        expect(deleteStatus).toBe(404);
      });
    }
  );

  test(
    "Deleting pet with non-numeric string ID returns error status",
    { tag: ["@BE-08", "@Pet", "@api", "@regression"] },
    async ({ petApi }) => {
      let deleteStatus: number;

      await test.step("Send DELETE /v2/pet/invalid-string-id", async () => {
        const response = await petApi.deletePet("invalid-string-id", "special-key");
        deleteStatus = response.status();
      });

      await test.step("Verify HTTP Status is error code (400 or 404 NumberFormatException)", async () => {
        expect([400, 404]).toContain(deleteStatus);
      });
    }
  );

  test(
    "Pet Lifecycle (Create -> Retrieve -> Delete -> Verify 404)",
    { tag: ["@BE-09", "@Pet", "@api", "@regression"] },
    async ({ petApi }) => {
      const pet = buildPetPayload({ status: "available" });
      const petId = pet.id!;

      await test.step("Step 1: Create a new pet via POST /v2/pet", async () => {
        const createRes = await petApi.createPet(pet);
        expect(createRes.status()).toBe(200);
        const body = await createRes.json();
        expect(body.id).toBe(petId);
      });

      await test.step("Step 2: Fetch and verify pet exists via GET /v2/pet/{petId}", async () => {
        const getRes = await petApi.getPetById(petId);
        expect(getRes.status()).toBe(200);
        const getBody = await getRes.json();
        expect(getBody.name).toBe(pet.name);
        expect(getBody.status).toBe("available");
      });

      await test.step("Step 3: Delete the created pet via DELETE /v2/pet/{petId}", async () => {
        const delRes = await petApi.deletePet(petId, "special-key");
        expect(delRes.status()).toBe(200);
      });

      await test.step("Step 4: Verify that the pet can no longer be retrieved (404 Not Found)", async () => {
        const verifyRes = await petApi.getPetById(petId);
        expect(verifyRes.status()).toBe(404);
      });
    }
  );

  test(
    "Strict Status Consistency - 100% of pets in findByStatus have identical queried status",
    { tag: ["@BE-10", "@Pet", "@api", "@regression"] },
    async ({ petApi }) => {
      for (const targetStatus of ["available", "pending", "sold"] as const) {
        await test.step(`Verify all pets for status '${targetStatus}' have status === '${targetStatus}'`, async () => {
          const response = await petApi.findByStatus(targetStatus);
          expect(response.status()).toBe(200);
          const pets: any[] = await response.json();
          expect(Array.isArray(pets)).toBe(true);

          const mismatches = pets.filter((pet) => pet.status !== targetStatus);
          expect(
            mismatches,
            `Expected 0 status mismatches for status '${targetStatus}', but found: ${JSON.stringify(mismatches.slice(0, 3))}`
          ).toHaveLength(0);
        });
      }
    }
  );

  test(
    "Data Reflection - Verify newly created pet is discoverable in findByStatus list",
    { tag: ["@BE-11", "@Pet", "@api", "@regression"] },
    async ({ petApi }) => {
      const pet = buildPetPayload({ status: "available" });
      const petId = pet.id!;
      createdPetIds.push(petId);

      await test.step("Create a new pet with unique ID", async () => {
        const createRes = await petApi.createPet(pet);
        expect(createRes.status()).toBe(200);
      });

      await test.step("Query findByStatus and confirm created pet exists in the returned list", async () => {
        const listRes = await petApi.findByStatus("available");
        expect(listRes.status()).toBe(200);
        const pets: any[] = await listRes.json();

        const found = pets.find((p) => p.id === petId);
        expect(found, `Pet with ID ${petId} should be present in findByStatus?status=available`).toBeDefined();
        expect(found.name).toBe(pet.name);
        expect(found.status).toBe("available");
      });
    }
  );

  test(
    "Special Characters & Unicode - Create pet with emojis and special characters in name",
    { tag: ["@BE-12", "@Pet", "@api", "@regression"] },
    async ({ petApi }) => {
      const pet = buildPetPayload({
        name: UNICODE_PET_DATA.name,
        photoUrls: UNICODE_PET_DATA.photoUrls,
      });
      const petId = pet.id!;
      createdPetIds.push(petId);

      let responseBody: any;
      await test.step("Send POST /v2/pet with Unicode/emoji and special characters in name", async () => {
        const response = await petApi.createPet(pet);
        expect(response.status()).toBe(200);
        responseBody = await response.json();
      });

      await test.step("Verify response retains exact Unicode emojis and special characters", async () => {
        expect(responseBody.name).toBe(UNICODE_PET_DATA.name);
        expect(responseBody.photoUrls).toEqual(UNICODE_PET_DATA.photoUrls);
      });

      await test.step("Retrieve pet by ID and verify data persistence without corruption", async () => {
        const getRes = await petApi.getPetById(petId);
        expect(getRes.status()).toBe(200);
        const fetchedPet = await getRes.json();
        expect(fetchedPet.name).toBe(UNICODE_PET_DATA.name);
      });
    }
  );

  test(
    "Boundary ID Testing - Verify pet creation with Number.MAX_SAFE_INTEGER boundary",
    { tag: ["@BE-13", "@Pet", "@api", "@regression"] },
    async ({ petApi }) => {
      const boundaryId = BOUNDARY_PET_DATA.maxSafeIntId;
      createdPetIds.push(boundaryId);

      const pet = buildPetPayload({ id: boundaryId, name: `BoundaryPet_${boundaryId}` });

      await test.step("Create pet with boundary integer ID", async () => {
        const response = await petApi.createPet(pet);
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.id).toBe(boundaryId);
      });

      await test.step("Retrieve boundary ID pet via GET /v2/pet/{petId}", async () => {
        const getRes = await petApi.getPetById(boundaryId);
        expect(getRes.status()).toBe(200);
        const getBody = await getRes.json();
        expect(getBody.id).toBe(boundaryId);
      });
    }
  );

  test(
    "Double DELETE Idempotency - Consecutive DELETE calls transition from 200 to 404",
    { tag: ["@BE-14", "@Pet", "@api", "@regression"] },
    async ({ petApi }) => {
      const pet = buildPetPayload();
      const petId = pet.id!;

      await test.step("Create pet via POST /v2/pet", async () => {
        const createRes = await petApi.createPet(pet);
        expect(createRes.status()).toBe(200);
      });

      await test.step("First DELETE returns 200 OK", async () => {
        const firstDel = await petApi.deletePet(petId, "special-key");
        expect(firstDel.status()).toBe(200);
      });

      await test.step("Second DELETE on the same petId immediately returns 404 Not Found", async () => {
        const secondDel = await petApi.deletePet(petId, "special-key");
        expect(secondDel.status()).toBe(404);
      });
    }
  );

  test(
    "Status Query Case-Sensitivity - Querying uppercase status (AVAILABLE) returns empty list",
    { tag: ["@BE-15", "@Pet", "@api", "@regression"] },
    async ({ petApi }) => {
      let responseStatus: number;
      let pets: any[];

      await test.step("Send GET /v2/pet/findByStatus?status=AVAILABLE", async () => {
        const response = await petApi.findByStatus(INVALID_PET_DATA.uppercaseStatus);
        responseStatus = response.status();
        pets = await response.json();
      });

      await test.step("Verify API treats status as case-sensitive and returns empty array", async () => {
        expect(responseStatus).toBe(200);
        expect(Array.isArray(pets)).toBe(true);
        expect(pets).toHaveLength(0);
      });
    }
  );
});
