import { test as base, expect } from "@playwright/test";
import { PetApi } from "../helpers/pet.api";

export type CustomFixtures = {
  petApi: PetApi;
};

export const test = base.extend<CustomFixtures>({
  petApi: async ({ request }, use) => {
    await use(new PetApi(request));
  },
});

export { expect };
