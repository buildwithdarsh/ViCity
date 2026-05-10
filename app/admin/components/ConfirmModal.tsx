"use client";

import Modal from "./Modal";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  loading?: boolean;
}

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  destructive = false,
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-zinc-200 rounded hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm rounded text-white disabled:opacity-50 ${destructive ? "bg-red-600 hover:bg-red-700" : "bg-zinc-900 hover:bg-zinc-800"}`}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-zinc-600">{message}</p>
    </Modal>
  );
}
