import "@testing-library/jest-dom";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

// Extend Jest matchers with accessibility testing
expect.extend(toHaveNoViolations);

// Automatically clean up after each test
afterEach(() => {
  cleanup();
});

// Re-export testing utilities for convenience
export * from "@testing-library/react";
export * from "@testing-library/user-event";
export { axe };
