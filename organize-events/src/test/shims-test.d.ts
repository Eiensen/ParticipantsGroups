import "@testing-library/jest-dom";
import { Component } from "vue";
import type { mount } from "@vue/test-utils";

declare global {
  namespace Vi {
    interface JestMatchers<T> {
      toBeInTheDocument(): boolean;
      toHaveClass(className: string): boolean;
    }
  }
}

declare module "@vue/test-utils" {
  interface Wrapper {
    emitted<T = any>(eventName?: string): Record<string, T[]>;
  }
}

export {};
