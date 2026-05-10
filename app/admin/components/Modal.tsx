"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) ref.current?.showModal();
    else ref.current?.close();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="fixed inset-0 z-50 m-auto w-full max-w-lg rounded border border-zinc-200 bg-white p-0 backdrop:bg-black/40"
    >
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 text-xl leading-none">&times;</button>
      </div>
      <div className="px-6 py-4">{children}</div>
      {footer && <div className="flex justify-end gap-2 border-t border-zinc-200 px-6 py-4">{footer}</div>}
    </dialog>
  );
}
