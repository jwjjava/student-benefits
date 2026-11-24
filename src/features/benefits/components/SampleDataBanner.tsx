/** Supabase가 연결되지 않아 샘플 데이터로 보일 때만 나오는 안내 */
export function SampleDataBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <p role="status" className="bg-[#FFF4D6] px-5 py-2 text-center text-xs text-[#7A5B00]">
      개발용 샘플 데이터예요. 검수 전 정보라 실제와 다를 수 있어요.
    </p>
  );
}
