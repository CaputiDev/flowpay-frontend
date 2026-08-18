import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "../table";

describe("Table components", () => {
  it("should render full table structure with correct data slots and content", () => {
    const { container } = render(
      <Table className="custom-table">
        <TableCaption className="custom-caption">Lista de Atendimentos</TableCaption>
        <TableHeader className="custom-header">
          <TableRow className="custom-row">
            <TableHead className="custom-head">Protocolo</TableHead>
            <TableHead>Assunto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="custom-body">
          <TableRow>
            <TableCell className="custom-cell">TCK-100</TableCell>
            <TableCell>Dúvida</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter className="custom-footer">
          <TableRow>
            <TableCell colSpan={2}>Total: 1</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    const tableContainer = container.querySelector("[data-slot='table-container']");
    expect(tableContainer).toBeInTheDocument();

    const table = screen.getByRole("table");
    expect(table).toHaveAttribute("data-slot", "table");
    expect(table.className).toContain("custom-table");

    const caption = container.querySelector("[data-slot='table-caption']");
    expect(caption).toBeInTheDocument();
    expect(caption?.textContent).toBe("Lista de Atendimentos");

    const header = container.querySelector("[data-slot='table-header']");
    expect(header).toBeInTheDocument();

    const rows = container.querySelectorAll("[data-slot='table-row']");
    expect(rows.length).toBe(3);

    const headCells = screen.getAllByRole("columnheader");
    expect(headCells.length).toBe(2);
    expect(headCells[0]?.textContent).toBe("Protocolo");

    const body = container.querySelector("[data-slot='table-body']");
    expect(body).toBeInTheDocument();

    const cells = screen.getAllByRole("cell");
    expect(cells.length).toBe(3);
    expect(cells[0]?.textContent).toBe("TCK-100");

    const footer = container.querySelector("[data-slot='table-footer']");
    expect(footer).toBeInTheDocument();
  });
});
