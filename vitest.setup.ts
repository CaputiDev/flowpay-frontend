import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Limpa o DOM do testing library após cada teste
afterEach(() => {
  cleanup();
});
