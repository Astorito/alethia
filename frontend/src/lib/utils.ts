import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getGradeColor(grade: string): string {
  if (grade.startsWith("A")) return "text-emerald-500";
  if (grade.startsWith("B")) return "text-blue-500";
  if (grade.startsWith("C")) return "text-amber-500";
  return "text-red-500";
}

export function getGradeBgColor(grade: string): string {
  if (grade.startsWith("A")) return "bg-emerald-500/10";
  if (grade.startsWith("B")) return "bg-blue-500/10";
  if (grade.startsWith("C")) return "bg-amber-500/10";
  return "bg-red-500/10";
}