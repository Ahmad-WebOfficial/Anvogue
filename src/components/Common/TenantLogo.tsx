"use client";

import Image from "next/image";
import Link from "next/link";
import { useLandingPage } from "@/hooks/useLandingPage";
import { isLandingImageEnabled } from "@/lib/tenant-landing";

interface TenantLogoProps {
  className?: string;
  textClassName?: string;
  imageClassName?: string;
  href?: string;
}

const TenantLogo = ({
  className = "",
  textClassName = "heading4",
  imageClassName = "h-9 w-9 object-contain",
  href = "/",
}: TenantLogoProps) => {
  const landing = useLandingPage();
  const logoSrc =
    landing &&
    isLandingImageEnabled(landing.HeaderImageRequest) &&
    landing.HeaderImagePath
      ? landing.HeaderImagePath
      : null;

  return (
    <Link href={href} className={`flex items-center gap-2 ${className}`}>
      {logoSrc && (
        <Image
          src={logoSrc}
          alt="Anvogue logo"
          width={36}
          height={36}
          className={imageClassName}
          priority
        />
      )}
      <span className={textClassName}>Anvogue</span>
    </Link>
  );
};

export default TenantLogo;
