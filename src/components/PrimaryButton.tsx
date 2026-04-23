import type { ButtonHTMLAttributes } from "react";

export function PrimaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-2xl bg-leaf px-5 py-4 text-base font-bold text-white shadow-card transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60 ${
        props.className ?? ""
      }`}
    />
  );
}
