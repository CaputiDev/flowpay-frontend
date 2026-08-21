import { describe, it, expect, vi } from "vitest";
import RootPage from "../page";
import * as navigationModule from "next/navigation";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("Root Page", () => {
  it("should redirect from root '/' to '/dashboard'", () => {
    RootPage();
    expect(navigationModule.redirect).toHaveBeenCalledWith("/dashboard");
  });
});
