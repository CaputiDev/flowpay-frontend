import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorComponent from "../error";

describe("Error Boundary Component", () => {
  it("should render error message and trigger reset callback on button click", async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const resetMock = vi.fn();
    const testError = new Error("Falha no componente");

    render(<ErrorComponent error={testError} reset={resetMock} />);

    expect(screen.getByText("Algo deu errado!")).toBeInTheDocument();
    expect(
      screen.getByText("A nossa interface sofreu uma falha inesperada de renderização.")
    ).toBeInTheDocument();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Erro capturado pelo Error Boundary:",
      testError
    );

    const tryAgainButton = screen.getByRole("button", { name: /tentar novamente/i });
    expect(tryAgainButton).toBeInTheDocument();

    await user.click(tryAgainButton);
    expect(resetMock).toHaveBeenCalledTimes(1);

    consoleSpy.mockRestore();
  });
});
