import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "../card";

describe("Card components", () => {
  it("should render Card with default size and slots", () => {
    const { container } = render(
      <Card className="custom-card">
        <CardHeader className="custom-header">
          <CardTitle className="custom-title">Título do Card</CardTitle>
          <CardDescription className="custom-desc">Descrição do Card</CardDescription>
          <CardAction className="custom-action">Ação</CardAction>
        </CardHeader>
        <CardContent className="custom-content">Conteúdo</CardContent>
        <CardFooter className="custom-footer">Rodapé</CardFooter>
      </Card>
    );

    const card = container.querySelector("[data-slot='card']");
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute("data-size", "default");
    expect(card?.className).toContain("custom-card");

    const header = container.querySelector("[data-slot='card-header']");
    expect(header).toBeInTheDocument();
    expect(header?.className).toContain("custom-header");

    const title = container.querySelector("[data-slot='card-title']");
    expect(title).toBeInTheDocument();
    expect(title?.textContent).toBe("Título do Card");

    const desc = container.querySelector("[data-slot='card-description']");
    expect(desc).toBeInTheDocument();
    expect(desc?.textContent).toBe("Descrição do Card");

    const action = container.querySelector("[data-slot='card-action']");
    expect(action).toBeInTheDocument();
    expect(action?.textContent).toBe("Ação");

    const content = container.querySelector("[data-slot='card-content']");
    expect(content).toBeInTheDocument();
    expect(content?.textContent).toBe("Conteúdo");

    const footer = container.querySelector("[data-slot='card-footer']");
    expect(footer).toBeInTheDocument();
    expect(footer?.textContent).toBe("Rodapé");
  });

  it("should support sm size on Card", () => {
    const { container } = render(<Card size="sm">Conteúdo Small</Card>);
    const card = container.querySelector("[data-slot='card']");
    expect(card).toHaveAttribute("data-size", "sm");
  });
});
