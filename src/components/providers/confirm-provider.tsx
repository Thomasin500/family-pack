"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

type Resolver = (value: boolean) => void;

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [open, setOpen] = useState(false);
  const resolverRef = useRef<Resolver | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const resolveWith = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setOpen(false);
  }, []);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) resolveWith(false);
    },
    [resolveWith]
  );

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md" onEscapeKeyDown={() => resolveWith(false)}>
          <DialogHeader>
            <DialogTitle className="text-xl">{options?.title ?? ""}</DialogTitle>
            {options?.description && (
              <DialogDescription className="text-base pt-1">
                {options.description}
              </DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="lg" onClick={() => resolveWith(false)}>
              {options?.cancelLabel ?? "Cancel"}
            </Button>
            <Button
              type="button"
              size="lg"
              variant={options?.destructive ? "destructive" : "default"}
              onClick={() => resolveWith(true)}
              autoFocus
            >
              {options?.confirmLabel ?? "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx.confirm;
}
