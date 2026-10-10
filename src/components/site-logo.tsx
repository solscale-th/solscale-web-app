import Image from "next/image";
import logo from "@/assets/solscale-horizontal-color.png";

const SIZES = {
  sm: { width: 115, height: 28 },
  md: { width: 148, height: 36 },
} as const;

export default function SiteLogo({
  size = "md",
  priority = false,
  className,
}: {
  size?: keyof typeof SIZES;
  priority?: boolean;
  className?: string;
}) {
  const { width, height } = SIZES[size];

  return (
    <Image
      src={logo}
      alt="Solscale"
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}
