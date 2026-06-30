import { BottomNav } from "@/components/layout/BottomNav";
import { Skeleton } from "@/ds/components/Skeleton";

export default function PerfilLoading() {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <header style={{ height: 56, display: "flex", alignItems: "center", padding: "0 20px" }}>
        <Skeleton width={100} height={18} />
      </header>
      <main style={{ flex: 1, padding: "32px 20px calc(104px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <Skeleton circle height={88} />
        <Skeleton width={140} height={32} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, width: "100%" }}>
          {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={80} radiusToken="md" />)}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
