import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  variant?: "default" | "light";
}

export default function Logo({ className = "", showText = true, size = "md", variant = "default" }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
    xl: "h-60 w-60",
    "2xl": "h-32 w-32 sm:h-40 sm:w-40",
    "3xl": "h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64",
    "4xl": "h-72 w-72 sm:h-80 sm:w-80 md:h-96 md:w-96",
    "5xl": "h-96 w-96 sm:h-[28rem] sm:w-[28rem] md:h-[32rem] md:w-[32rem]",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-4xl",
    "2xl": "text-5xl",
    "3xl": "text-6xl sm:text-7xl",
    "4xl": "text-7xl sm:text-8xl md:text-9xl",
    "5xl": "text-8xl sm:text-9xl md:text-[10rem]",
  };

  const textColor = variant === "light" ? "text-white" : "text-gray-900";
  const logoWidth = size === "sm" ? 32 : size === "md" ? 40 : size === "lg" ? 56 : size === "xl" ? 240 : size === "2xl" ? 160 : size === "3xl" ? 256 : size === "4xl" ? 384 : size === "5xl" ? 512 : 64;
  const logoHeight = size === "sm" ? 32 : size === "md" ? 40 : size === "lg" ? 56 : size === "xl" ? 240 : size === "2xl" ? 160 : size === "3xl" ? 256 : size === "4xl" ? 384 : size === "5xl" ? 512 : 64;

  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/Maflipp-recortada.png"
        alt="Maflipp Logo"
        width={logoWidth}
        height={logoHeight}
        className={`${sizeClasses[size]} object-contain`}
        quality={100}
        priority
        unoptimized={size === "xl"}
        sizes={size === "xl" ? "240px" : size === "lg" ? "56px" : size === "md" ? "40px" : "32px"}
      />
      {showText && (
        <span className={`font-bold ${textColor} ${textSizes[size]} drop-shadow-md`}>
          Maflipp
        </span>
      )}
    </Link>
  );
}

