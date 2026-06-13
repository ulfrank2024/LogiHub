import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "CAD"): string {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-CA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatWeight(kg: number): string {
  return kg >= 1 ? `${kg} kg` : `${kg * 1000} g`;
}

export function shipmentPriceCAD(weightKg: number, declaredValue: number): number {
  const base = 25;
  const perKg = 4.5;
  const insurance = declaredValue * 0.02;
  return Math.round((base + weightKg * perKg + insurance) * 100) / 100;
}
