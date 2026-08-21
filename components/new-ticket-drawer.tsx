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
        className="w-[95vw] max-w-md sm:max-w-lg p-5 sm:p-6 rounded-2xl bg-card border shadow-xl"
        aria-describedby="new-ticket-description"
      >
        <DialogHeader className="text-left mb-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#015193]/10 text-[#015193] flex items-center justify-center border border-[#015193]/20 shrink-0">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Novo Atendimento
              </DialogTitle>
              <DialogDescription id="new-ticket-description" className="text-xs text-muted-foreground mt-0.5">
                Preencha o assunto do chamado para roteamento automático entre as equipes.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form id="new-ticket-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="subject" className="font-medium text-xs sm:text-sm text-foreground">
              Assunto da solicitação <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject"
              placeholder="Ex: Dúvida sobre fatura do Cartão"
              {...register("subject")}
              aria-invalid={!!errors.subject}
              aria-describedby={errors.subject ? "subject-error" : undefined}
              disabled={isSubmitting}
              className="w-full h-10 text-sm focus-visible:ring-[#015193]/20 focus-visible:border-[#015193]"
              autoFocus
            />
            {errors.subject && (
              <p id="subject-error" role="alert" className="text-xs text-destructive">
                {errors.subject.message}
              </p>
            )}
          </div>
        </form>

        <DialogFooter className="mt-4 flex flex-row justify-end gap-2 border-t border-border/40 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
            className="h-9 px-4 text-xs font-medium"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="new-ticket-form"
            disabled={isSubmitting}
            className="gap-2 h-9 px-4 text-xs font-semibold bg-[#015193] hover:bg-[#015193]/90 text-white shadow-xs transition-all"
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
