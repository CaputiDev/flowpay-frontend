import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton } from "../skeleton";
import { Badge } from "../badge";

describe("Skeleton & Badge Components", () => {
  it("should render skeleton with pulse animation and aria-hidden", () => {
    const { container } = render(<Skeleton className="h-4 w-20" />);
    const skeleton = container.querySelector("[data-slot='skeleton']");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveAttribute("aria-hidden", "true");
  });

  it("should render badge with status variant classes", () => {
    const { container } = render(<Badge variant="warning">Aguardando</Badge>);
    expect(container.textContent).toBe("Aguardando");
    expect(container.firstElementChild).toHaveClass("bg-amber-500/10");
  });
});
