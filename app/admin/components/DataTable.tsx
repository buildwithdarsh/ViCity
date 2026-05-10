"use client";

import { useState } from "react";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onSort?: (key: string, dir: "asc" | "desc") => void;
  loading?: boolean;
  emptyMessage?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField = "id",
  page = 1,
  totalPages = 1,
  onPageChange,
  onSort,
  loading,
  emptyMessage = "No data found",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    const dir = sortKey === key && sortDir === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortDir(dir);
    onSort?.(key, dir);
  };

  if (loading) {
    return (
      <div className="border border-zinc-200 rounded overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-zinc-100" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 border-t border-zinc-100 flex items-center px-4 gap-4">
              {columns.map((_, j) => (
                <div key={j} className="h-4 bg-zinc-100 rounded flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="border border-zinc-200 rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left font-medium text-zinc-600 whitespace-nowrap ${col.sortable ? "cursor-pointer select-none hover:text-zinc-900" : ""}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <span className="ml-1">{sortDir === "asc" ? "\u2191" : "\u2193"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-zinc-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={String(row[keyField])} className="border-t border-zinc-100 hover:bg-zinc-50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                      {col.render ? col.render(row) : String(row[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-zinc-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="px-3 py-1.5 text-sm border border-zinc-200 rounded disabled:opacity-40 hover:bg-zinc-50"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="px-3 py-1.5 text-sm border border-zinc-200 rounded disabled:opacity-40 hover:bg-zinc-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
