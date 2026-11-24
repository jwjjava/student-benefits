import { EmptyState } from "@/components/ui/EmptyState";
import { SearchIcon } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col">
      <EmptyState
        icon={<SearchIcon size={52} strokeWidth={2.4} />}
        title="찾는 혜택이 없어요"
        description="종료되었거나 주소가 바뀌었을 수 있어요."
        action={{ href: "/", label: "혜택 둘러보기" }}
      />
    </main>
  );
}
