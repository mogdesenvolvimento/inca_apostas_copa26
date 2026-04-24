import Image from "next/image";

type IncaLogoVariant = "header" | "hero" | "compact";

type IncaLogoProps = {
  variant?: IncaLogoVariant;
  className?: string;
  priority?: boolean;
};

const variantClasses: Record<IncaLogoVariant, { frame: string; image: string; sizes: string }> = {
  header: {
    frame:
      "h-[88px] w-[88px] rounded-[1.5rem] border border-white/20 bg-white/10 p-3 backdrop-blur-[2px] sm:h-[96px] sm:w-[96px]",
    image: "h-full w-full",
    sizes: "(max-width: 640px) 88px, 96px"
  },
  hero: {
    frame:
      "h-[96px] w-[96px] rounded-[1.75rem] bg-white/96 p-3.5 shadow-sm ring-1 ring-black/5 sm:h-[118px] sm:w-[118px] sm:p-4",
    image: "h-full w-full",
    sizes: "(max-width: 640px) 96px, 118px"
  },
  compact: {
    frame: "h-[60px] w-[60px] rounded-[1.15rem] bg-white/96 p-2 shadow-sm ring-1 ring-black/5",
    image: "h-full w-full",
    sizes: "60px"
  }
};

export function IncaLogo({ variant = "header", className = "", priority = false }: IncaLogoProps) {
  const config = variantClasses[variant];

  return (
    <div className={`flex shrink-0 items-center justify-center ${config.frame} ${className}`}>
      <Image
        src="/assets/inca-logo.png"
        alt="Logo do Inca Bar"
        width={256}
        height={256}
        sizes={config.sizes}
        unoptimized
        priority={priority}
        className={`block aspect-square object-contain object-center ${config.image}`}
      />
    </div>
  );
}
