import Image from "next/image";

type BrandMarkProps = {
  compact?: boolean;
  className?: string;
};

export default function BrandMark({ compact = false, className = "" }: BrandMarkProps) {
  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`}>
      <span className="brand-symbol" aria-hidden="true">
        <Image src="/wy-simbolo.png" alt="" width={44} height={41} priority />
      </span>
      {!compact && (
        <span className="min-w-0 leading-none">
          <span className="brand-name block truncate">WY Advocacia</span>
          <span className="brand-subtitle mt-1 block truncate">Previdenciária &amp; Trabalhista</span>
        </span>
      )}
    </div>
  );
}
