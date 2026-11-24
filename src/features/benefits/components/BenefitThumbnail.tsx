import Image from "next/image";
import { cn } from "@/lib/utils";

const PLACEHOLDER_BG: Record<string, string> = {
  food: "bg-[#FBEBDD]",
  subscription: "bg-[#FDF5E6]",
  it: "bg-[#E6E2FB]",
  beauty: "bg-[#E2F0E5]",
};

type BenefitThumbnailProps = {
  imageUrl: string | null;
  provider: string;
  categoryId: string;
  closed?: boolean;
  closedLabel?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/** 혜택 대표 이미지. 이미지가 없으면 분야 색 바탕에 제공처 이름을 보여 준다. */
export function BenefitThumbnail({
  imageUrl,
  provider,
  categoryId,
  closed = false,
  closedLabel = "종료",
  sizes,
  priority,
  className,
}: BenefitThumbnailProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        imageUrl ? "bg-field" : (PLACEHOLDER_BG[categoryId] ?? "bg-field"),
        className,
      )}
    >
      {imageUrl ? (
        <Image src={imageUrl} alt="" fill sizes={sizes} priority={priority} className="object-cover" />
      ) : closed ? null : (
        <div className="absolute inset-0 flex items-center justify-center p-3">
          <span className="text-center text-lg font-extrabold tracking-title text-ink/70">
            {provider}
          </span>
        </div>
      )}
      {closed ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#232632]/60">
          <span className="text-[15px] font-bold text-white">{closedLabel}</span>
        </div>
      ) : null}
    </div>
  );
}
