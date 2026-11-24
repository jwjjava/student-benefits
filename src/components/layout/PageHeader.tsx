import { cn } from "@/lib/utils";
import { BackButton } from "./BackButton";
import { MenuButton } from "./MenuDrawer";

type PageHeaderProps = {
  title: string;
  showMenu?: boolean;
  divider?: boolean;
};

/** 하위 화면 헤더: ‹ 제목 ≡ */
export function PageHeader({ title, showMenu = true, divider = false }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex h-14 items-center gap-3 bg-canvas/95 px-5 backdrop-blur",
        divider && "after:absolute after:inset-x-5 after:bottom-0 after:h-px after:bg-field",
      )}
    >
      <BackButton />
      <h1 className="flex-1 text-[17px] font-bold text-ink">{title}</h1>
      {showMenu ? <MenuButton /> : null}
    </header>
  );
}
