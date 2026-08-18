"use client"; // Necessário para usarmos o useState na Sidebar

import { useState } from "react";
import { Menu, LayoutDashboard, PlusCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">

      {/* 
        Sidebar Expansível 
        Controlamos a largura (w-64 vs w-16) com base no estado.
      */}
      <aside
        className={`${isSidebarOpen ? "w-64" : "w-16"
          } transition-all duration-300 border-r bg-card flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b h-16">
          {isSidebarOpen && <span className="font-bold text-lg whitespace-nowrap">Menu Ubots</span>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={!isSidebarOpen ? "mx-auto" : ""}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 p-2 space-y-2 overflow-hidden">
          <Button variant="secondary" className={`w-full justify-start ${!isSidebarOpen ? "px-2" : ""}`}>
            <LayoutDashboard className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="ml-3">Dashboard</span>}
          </Button>

          <Button variant="ghost" className={`w-full justify-start ${!isSidebarOpen ? "px-2" : ""}`}>
            <PlusCircle className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="ml-3">Abrir Chamado</span>}
          </Button>

          <Button variant="ghost" className={`w-full justify-start ${!isSidebarOpen ? "px-2" : ""}`}>
            <CheckCircle className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="ml-3">Histórico / Fechados</span>}
          </Button>
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-8 flex flex-col w-full overflow-hidden">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">FlowPay MVP</h1>
          <p className="text-muted-foreground">
            Gerenciamento de Filas em Tempo Real
          </p>
        </header>

        {/* Container Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Lado Esquerdo: Fila Ativa */}
          <Card>
            <CardHeader>
              <CardTitle>Fila Ativa (Processando)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Protocolo</TableHead>
                    <TableHead>Assunto</TableHead>
                    <TableHead>Tempo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs text-muted-foreground">TCK-991</TableCell>
                    <TableCell className="font-medium">Dúvida sobre faturamento</TableCell>
                    <TableCell>15:15</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Lado Direito: Fila de Espera */}
          <Card>
            <CardHeader>
              <CardTitle>Fila de Espera (Aguardando)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Protocolo</TableHead>
                    <TableHead>Assunto</TableHead>
                    <TableHead>Tempo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs text-muted-foreground">TCK-992</TableCell>
                    <TableCell className="font-medium">Problema de acesso</TableCell>
                    <TableCell>15:20</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}