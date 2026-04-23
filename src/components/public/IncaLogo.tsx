import Image from "next/image";

export function IncaLogo({ size = 84, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/assets/inca-logo.svg"
      alt="Logo do Inca Bar"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
