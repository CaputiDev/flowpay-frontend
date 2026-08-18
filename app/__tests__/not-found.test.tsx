import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "../not-found";

describe("NotFound Page", () => {
  it("should render 404 message and navigation link to dashboard", () => {
    render(<NotFound />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(
      screen.getByText("Ops! O caminho que você tentou acessar não existe.")
    ).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /voltar para o dashboard/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });
});
