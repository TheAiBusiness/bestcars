import { useCallback, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "./ui/alert-dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  onConfirm,
}: ConfirmDialogProps) {
  const handleConfirm = useCallback(() => {
    onConfirm();
    onOpenChange(false);
  }, [onConfirm, onOpenChange]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#0a0e17]/95 border-white/10 backdrop-blur-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-white/50">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={
              variant === "danger"
                ? "bg-red-500/20 border border-red-500/40 text-red-200 hover:bg-red-500/30"
                : "bg-blue-500/20 border border-blue-500/40 text-blue-200 hover:bg-blue-500/30"
            }
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface ConfirmState {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
}

const initialState: ConfirmState = { open: false, title: "", onConfirm: () => {} };

export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmState>(initialState);

  const confirm = useCallback(
    (opts: Omit<ConfirmState, "open">) => {
      setState({ ...opts, open: true });
    },
    []
  );

  const dialogProps: ConfirmDialogProps = {
    ...state,
    onOpenChange: (open: boolean) => setState((prev) => ({ ...prev, open })),
  };

  return { confirm, dialogProps };
}
