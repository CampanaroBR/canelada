import { BottomNav } from "@/components/layout/BottomNav";
import { Skeleton } from "@/ds/components/Skeleton";

export default function RankingLoading() {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <header style={{ height: 56, display: "flex", alignItems: "center", padding: "0 20px" }}>
        <Skeleton width={120} height={18} />
      </header>

      <main style={{ flex: 1, padding: "24px 16px calc(104px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* toggle */}
        <div style={{ display: "flex", gap: 8 }}>
          <Skeleton height={38} radiusToken="pill" />
          <Skeleton height={38} radiusToken="pill" />
        </div>
        {/* pódio */}
        <Skeleton height={120} radiusToken="xl" style={{ marginTop: 8 }} />
        {/* linhas */}
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height={64} radiusToken="lg" />
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
