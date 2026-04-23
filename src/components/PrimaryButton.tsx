import type { ButtonHTMLAttributes } from "react";

export function PrimaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-2xl bg-gradient-to-r from-wine via-clay to-amber px-5 py-4 text-base font-bold text-white shadow-card transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 ${
        props.className ?? ""
      }`}
    />
  );
}
