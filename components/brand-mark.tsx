import Image from "next/image";
import Link from "next/link";

type BrandMarkProps = {
  variant?: "red" | "black" | "white";
  className?: string;
  priority?: boolean;
};

export default function BrandMark({
  variant = "red",
  className = "",
  priority = false,
}: BrandMarkProps) {
  const image = variant === "red" ? "/brand/nest-logo-red.svg" : "/brand/nest-logo-black.svg";

  return (
    <Link href="/" className={`brand-mark brand-mark--${variant} ${className}`.trim()} aria-label="NEST Creative Delivery — inicio">
      <Image
        src={image}
        alt="NEST"
        width={249}
        height={86}
        priority={priority}
        unoptimized
      />
    </Link>
  );
}
