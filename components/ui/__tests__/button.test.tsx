import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button, buttonVariants } from "../button";

describe("Button component", () => {
  it("should render with default variant and size", () => {
    render(<Button>Clique aqui</Button>);
    const button = screen.getByRole("button", { name: /clique aqui/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-slot", "button");
    expect(button).toHaveAttribute("data-variant", "default");
    expect(button).toHaveAttribute("data-size", "default");
    expect(button.className).toContain("bg-primary");
  });

  it("should render outline variant", () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole("button", { name: /outline/i });
    expect(button).toHaveAttribute("data-variant", "outline");
    expect(button.className).toContain("border-border");
  });

  it("should render secondary variant", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole("button", { name: /secondary/i });
    expect(button).toHaveAttribute("data-variant", "secondary");
    expect(button.className).toContain("bg-secondary");
  });

  it("should render ghost variant", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole("button", { name: /ghost/i });
    expect(button).toHaveAttribute("data-variant", "ghost");
  });

  it("should render destructive variant", () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole("button", { name: /delete/i });
    expect(button).toHaveAttribute("data-variant", "destructive");
    expect(button.className).toContain("text-destructive");
  });

  it("should render link variant", () => {
    render(<Button variant="link">Link</Button>);
    const button = screen.getByRole("button", { name: /link/i });
    expect(button).toHaveAttribute("data-variant", "link");
    expect(button.className).toContain("underline-offset-4");
  });

  it("should support size variations", () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    let button = screen.getByRole("button", { name: /small/i });
    expect(button).toHaveAttribute("data-size", "sm");
    expect(button.className).toContain("h-7");

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole("button", { name: /large/i });
    expect(button).toHaveAttribute("data-size", "lg");
    expect(button.className).toContain("h-9");

    rerender(<Button size="xs">Extra Small</Button>);
    button = screen.getByRole("button", { name: /extra small/i });
    expect(button).toHaveAttribute("data-size", "xs");
    expect(button.className).toContain("h-6");

    rerender(<Button size="icon">Icon</Button>);
    button = screen.getByRole("button", { name: /icon/i });
    expect(button).toHaveAttribute("data-size", "icon");
    expect(button.className).toContain("size-8");
  });

  it("should merge custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole("button", { name: /custom/i });
    expect(button.className).toContain("custom-class");
  });

  it("should render as child component when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/dashboard">Link Button</a>
      </Button>
    );
    const link = screen.getByRole("link", { name: /link button/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/dashboard");
    expect(link).toHaveAttribute("data-slot", "button");
  });

  it("should generate classes directly with buttonVariants helper", () => {
    const classes = buttonVariants({ variant: "destructive", size: "sm" });
    expect(classes).toContain("text-destructive");
    expect(classes).toContain("h-7");
  });
});
