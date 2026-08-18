import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dashboard from "../page";

describe("Dashboard Page", () => {
  it("should render header and queue cards", () => {
    render(<Dashboard />);

    expect(screen.getByRole("heading", { name: "FlowPay MVP", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Gerenciamento de Filas em Tempo Real")).toBeInTheDocument();

    expect(screen.getByText("Fila Ativa (Processando)")).toBeInTheDocument();
    expect(screen.getByText("Fila de Espera (Aguardando)")).toBeInTheDocument();

    expect(screen.getByText("TCK-991")).toBeInTheDocument();
    expect(screen.getByText("Dúvida sobre faturamento")).toBeInTheDocument();

    expect(screen.getByText("TCK-992")).toBeInTheDocument();
    expect(screen.getByText("Problema de acesso")).toBeInTheDocument();
  });

  it("should toggle sidebar expansion when menu button is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<Dashboard />);

    const aside = container.querySelector("aside");
    expect(aside).toHaveClass("w-16");
    expect(screen.queryByText("Menu Ubots")).not.toBeInTheDocument();

    // Encontra o botão de alternância da sidebar (o primeiro botão da aside)
    const menuButton = aside?.querySelector("button");
    expect(menuButton).toBeInTheDocument();

    if (menuButton) {
      await user.click(menuButton);
      expect(aside).toHaveClass("w-64");
      expect(screen.getByText("Menu Ubots")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Abrir Chamado")).toBeInTheDocument();
      expect(screen.getByText("Histórico / Fechados")).toBeInTheDocument();

      await user.click(menuButton);
      expect(aside).toHaveClass("w-16");
      expect(screen.queryByText("Menu Ubots")).not.toBeInTheDocument();
    }
  });
});
