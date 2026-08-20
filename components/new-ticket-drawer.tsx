"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, PlusCircle } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { CreateAtendimentoInput } from "@/app/hooks/useQueues";

const ticketFormSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, { message: "O assunto é obrigatório e deve ter no mínimo 3 caracteres." }),
});

type TicketFormData = z.infer<typeof ticketFormSchema>;

interface NewTicketDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitTicket: (data: CreateAtendimentoInput) => Promise<unknown>;
}

export function NewTicketDrawer({
  open,
  onOpenChange,
  onSubmitTicket,
}: NewTicketDrawerProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      subject: "",
    },
  });

  const onSubmit = async (data: TicketFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmitTicket({
        subject: data.subject,
      });

      toast({
        title: "Chamado criado com sucesso!",
        description: `O atendimento "${data.subject}" foi processado e roteado.`,
        variant: "default",
      });

      reset();
      onOpenChange(false);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido ao criar chamado.";
      toast({
        title: "Erro ao abrir chamado",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
    }
    onOpenChange(isOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col justify-between"
        aria-describedby="new-ticket-description"
      >
        <div>
          <SheetHeader className="text-left mb-6">
            <SheetTitle className="text-lg font-bold flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              Novo Atendimento
            </SheetTitle>
            <SheetDescription id="new-ticket-description">
              Preencha os dados do chamado para roteamento automático entre as equipes.
            </SheetDescription>
          </SheetHeader>

          <form id="new-ticket-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="subject" className="font-medium">
                Assunto <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject"
                placeholder="Ex: Dúvida sobre fatura do Cartão"
                {...register("subject")}
                aria-invalid={!!errors.subject}
                aria-describedby={errors.subject ? "subject-error" : undefined}
                disabled={isSubmitting}
                className="w-full"
                autoFocus
              />
              {errors.subject && (
                <p id="subject-error" role="alert" className="text-xs text-destructive">
                  {errors.subject.message}
                </p>
              )}
            </div>
          </form>
        </div>

        <SheetFooter className="mt-6 flex flex-row justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="new-ticket-form"
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4" />
                Adicionar à Fila
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
