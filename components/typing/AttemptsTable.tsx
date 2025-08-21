"use client";

import type { Attempt } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

type Props = {
  rows: Attempt[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
};

export default function AttemptsTable({
  rows,
  total,
  page,
  pageSize,
  onPageChange,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Adj. WPM</TableHead>
              <TableHead>Accuracy</TableHead>
              <TableHead className="hidden sm:table-cell">Snippet</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="whitespace-nowrap">
                  {new Date(a.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>{a.timerSec}s</TableCell>
                <TableCell>{a.adjustedWpm}</TableCell>
                <TableCell>{Math.round(a.accuracy * 100)}%</TableCell>
                <TableCell className="hidden sm:table-cell truncate max-w-[200px]">
                  {a.snippetId}
                </TableCell>
                <TableCell>
                  <Link
                    className="text-primary underline"
                    href={`/results/${a.id}`}
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end gap-2">
        <button
          className="text-sm underline disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </button>
        <span className="text-xs text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <button
          className="text-sm underline disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
