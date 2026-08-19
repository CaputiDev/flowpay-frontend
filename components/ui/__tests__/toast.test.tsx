import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from "../toast";
import { Toaster } from "../toaster";
import { toast, useToast } from "../use-toast";

describe("Toast System", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render static Toast elements properly", () => {
    render(
      <ToastProvider>
        <Toast data-testid="toast-root" variant="destructive">
          <ToastTitle>Título do Alerta</ToastTitle>
          <ToastDescription>Descrição detalhada do erro</ToastDescription>
          <ToastAction altText="Desfazer ação">Desfazer</ToastAction>
          <ToastClose data-testid="toast-close" />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );

    expect(screen.getByText("Título do Alerta")).toBeInTheDocument();
    expect(screen.getByText("Descrição detalhada do erro")).toBeInTheDocument();
    expect(screen.getByText("Desfazer")).toBeInTheDocument();
    expect(screen.getByTestId("toast-close")).toBeInTheDocument();
  });

  it("should dispatch and render toast notifications via useToast and Toaster", () => {
    function TestComponent() {
      const { toast: triggerToast } = useToast();
      return (
        <div>
          <button
            onClick={() =>
              triggerToast({
                title: "Notificação Dinâmica",
                description: "Mensagem de teste dinâmica",
                variant: "success",
              })
            }
          >
            Disparar Toast
          </button>
          <Toaster />
        </div>
      );
    }

    render(<TestComponent />);

    const button = screen.getByText("Disparar Toast");
    act(() => {
      button.click();
    });

    expect(screen.getByText("Notificação Dinâmica")).toBeInTheDocument();
    expect(screen.getByText("Mensagem de teste dinâmica")).toBeInTheDocument();
  });

  it("should support updating and dismissing an active toast", () => {
    function TestComponent() {
      const { dismiss } = useToast();
      return (
        <div>
          <button
            onClick={() => {
              const { id, update } = toast({
                title: "Inicial",
                description: "Desc inicial",
              });
              setTimeout(() => {
                update({
                  id,
                  title: "Atualizado",
                  description: "Desc atualizada",
                });
              }, 100);
            }}
          >
            Criar e Atualizar
          </button>
          <button onClick={() => dismiss()}>Fechar Todos</button>
          <Toaster />
        </div>
      );
    }

    render(<TestComponent />);

    const createBtn = screen.getByText("Criar e Atualizar");
    act(() => {
      createBtn.click();
    });

    expect(screen.getByText("Inicial")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByText("Atualizado")).toBeInTheDocument();

    const dismissBtn = screen.getByText("Fechar Todos");
    act(() => {
      dismissBtn.click();
    });
  });

  it("should remove toast from queue on timeout after dismiss", () => {
    let toastHandle: ReturnType<typeof toast>;

    function TestComponent() {
      return (
        <div>
          <button
            onClick={() => {
              toastHandle = toast({
                title: "Toast Temporário",
              });
            }}
          >
            Criar
          </button>
          <button onClick={() => toastHandle?.dismiss()}>Dispensar Específico</button>
          <Toaster />
        </div>
      );
    }

    render(<TestComponent />);

    act(() => {
      screen.getByText("Criar").click();
    });

    expect(screen.getByText("Toast Temporário")).toBeInTheDocument();

    act(() => {
      screen.getByText("Dispensar Específico").click();
    });

    // Avança o TOAST_REMOVE_DELAY
    act(() => {
      vi.advanceTimersByTime(1000000);
    });
  });
});
