import { vi, beforeAll } from "vitest";
import "@testing-library/jest-dom";
import { config } from "@vue/test-utils";

// Configure Vue Test Utils
beforeAll(() => {
  config.global.stubs = {};
});

// Mock Firebase
vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(),
}));

vi.mock("firebase/database", () => ({
  getDatabase: vi.fn(),
  ref: vi.fn(),
  set: vi.fn(),
  onValue: vi.fn(),
}));

// Mock window.dataTransfer
beforeAll(() => {
  Object.defineProperty(window, "dataTransfer", {
    value: {
      setData: vi.fn(),
      getData: vi.fn(),
    },
  });
});
