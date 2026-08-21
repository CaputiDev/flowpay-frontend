"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, PlusCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-[95vw] max-w-md sm:max-w-lg p-5 sm:p-6"
        aria-describedby="new-ticket-description"
      >
        <DialogHeader className="text-left mb-2">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            Novo Atendimento
          </DialogTitle>
          <DialogDescription id="new-ticket-description">
            Preencha o assunto do chamado para roteamento automático entre as equipes.
          </DialogDescription>
        </DialogHeader>

        <form id="new-ticket-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="subject" className="font-medium text-xs sm:text-sm">
              Assunto da solicitação <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject"
              placeholder="Ex: Dúvida sobre fatura do Cartão"
              {...register("subject")}
              aria-invalid={!!errors.subject}
              aria-describedby={errors.subject ? "subject-error" : undefined}
              disabled={isSubmitting}
              className="w-full h-10"
              autoFocus
            />
            {errors.subject && (
              <p id="subject-error" role="alert" className="text-xs text-destructive">
                {errors.subject.message}
              </p>
            )}
          </div>
        </form>

        <DialogFooter className="mt-4 flex flex-row justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
            className="h-9 text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="new-ticket-form"
            disabled={isSubmitting}
            className="gap-2 h-9 text-xs font-medium"
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Alias export
export const NewTicketModal = NewTicketDrawer;
