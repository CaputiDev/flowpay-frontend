import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    const result = cn("class1", "class2");
    expect(result).toBe("class1 class2");
  });

  it("should handle conditional class names", () => {
    const isActive = true;
    const isHidden = false;
    const result = cn("base-class", isActive && "active", isHidden && "hidden");
    expect(result).toBe("base-class active");
  });

  it("should merge tailwind conflict classes properly", () => {
    const result = cn("p-4", "p-2", "text-red-500", "text-blue-500");
    expect(result).toBe("p-2 text-blue-500");
  });

  it("should filter out undefined, null, and boolean falsy values", () => {
    const result = cn("base", undefined, null, false, "");
    expect(result).toBe("base");
  });

  it("should return empty string when no arguments are passed", () => {
    const result = cn();
    expect(result).toBe("");
  });
});
