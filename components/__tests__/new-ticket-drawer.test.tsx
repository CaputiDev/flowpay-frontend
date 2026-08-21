import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewTicketDrawer } from "../new-ticket-drawer";

describe("NewTicketDrawer", () => {
  it("should validate required subject field with minimum length", async () => {
    const user = userEvent.setup();
    const onSubmitTicket = vi.fn().mockResolvedValue({});
    const onOpenChange = vi.fn();

    render(
      <NewTicketDrawer
        open={true}
        onOpenChange={onOpenChange}
        onSubmitTicket={onSubmitTicket}
      />
    );

    const submitButton = screen.getByRole("button", { name: /adicionar à fila/i });
    await user.click(submitButton);

    expect(
      await screen.findByText(/o assunto é obrigatório e deve ter no mínimo 3 caracteres/i)
    ).toBeInTheDocument();
    expect(onSubmitTicket).not.toHaveBeenCalled();
  });

  it("should submit valid ticket form and reset", async () => {
    const user = userEvent.setup();
    const onSubmitTicket = vi.fn().mockResolvedValue({});
    const onOpenChange = vi.fn();

    render(
      <NewTicketDrawer
        open={true}
        onOpenChange={onOpenChange}
        onSubmitTicket={onSubmitTicket}
      />
    );

    const subjectInput = screen.getByLabelText(/assunto/i);
    await user.type(subjectInput, "Solicitação de reembolso");

    const submitButton = screen.getByRole("button", { name: /adicionar à fila/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmitTicket).toHaveBeenCalledWith({
        subject: "Solicitação de reembolso",
      });
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("should submit valid ticket form with custom chatRef", async () => {
    const user = userEvent.setup();
    const onSubmitTicket = vi.fn().mockResolvedValue({});
    const onOpenChange = vi.fn();

    render(
      <NewTicketDrawer
        open={true}
        onOpenChange={onOpenChange}
        onSubmitTicket={onSubmitTicket}
      />
    );

    const subjectInput = screen.getByLabelText(/assunto/i);
    await user.type(subjectInput, "Problema no aplicativo");

    const chatRefInput = screen.getByLabelText(/referência do chat/i);
    await user.type(chatRefInput, "chat-custom-12345");

    const submitButton = screen.getByRole("button", { name: /adicionar à fila/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmitTicket).toHaveBeenCalledWith({
        subject: "Problema no aplicativo",
        chatRef: "chat-custom-12345",
      });
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("should handle error when submission fails", async () => {
    const user = userEvent.setup();
    const onSubmitTicket = vi.fn().mockRejectedValue(new Error("Falha ao salvar"));
    const onOpenChange = vi.fn();

    render(
      <NewTicketDrawer
        open={true}
        onOpenChange={onOpenChange}
        onSubmitTicket={onSubmitTicket}
      />
    );

    const subjectInput = screen.getByLabelText(/assunto/i);
    await user.type(subjectInput, "Falha de pagamento");

    const submitButton = screen.getByRole("button", { name: /adicionar à fila/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmitTicket).toHaveBeenCalled();
      // Não fecha a gaveta em caso de erro
      expect(onOpenChange).not.toHaveBeenCalledWith(false);
    });
  });
});
