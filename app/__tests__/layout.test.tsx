import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

// Mock das fontes do Next.js
vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono" }),
  JetBrains_Mono: () => ({ variable: "--font-mono" }),
}));

import RootLayout, { metadata } from "../layout";

describe("RootLayout Component", () => {
  it("should have valid metadata export", () => {
    expect(metadata).toBeDefined();
    expect(metadata.title).toBe("FlowPay - Gestão de Filas");
    expect(metadata.description).toBe("Gerenciamento e monitoramento de filas de atendimento em tempo real");
    expect(metadata.icons).toEqual({
      icon: "/ubots-icon.png",
      shortcut: "/ubots-icon.png",
      apple: "/ubots-icon.png",
    });
  });

  it("should render children inside layout structure", () => {
    const { getByText } = render(
      <RootLayout>
        <div data-testid="child-element">Conteúdo de Teste</div>
      </RootLayout>,
      { container: document }
    );

    expect(getByText("Conteúdo de Teste")).toBeInTheDocument();
  });
});
