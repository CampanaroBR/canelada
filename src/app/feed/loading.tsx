import { BottomNav } from "@/components/layout/BottomNav";
import { Skeleton } from "@/ds/components/Skeleton";

export default function FeedLoading() {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)" }}>
      <header style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
        <Skeleton width={110} height={18} />
        <Skeleton width={36} height={36} radiusToken="md" />
      </header>
      <main style={{ padding: "16px 16px calc(104px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 10 }}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} height={104} radiusToken="lg" />
        ))}
      </main>
      <BottomNav />
    </div>
  );
}
