import { BottomNav } from "@/components/layout/BottomNav";
import { Skeleton } from "@/ds/components/Skeleton";

export default function VotacaoLoading() {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)" }}>
      <header style={{ height: 56, display: "flex", alignItems: "center", padding: "0 20px" }}>
        <Skeleton width={90} height={18} />
      </header>
      <main style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* progresso */}
        <div style={{ display: "flex", gap: 4 }}>
          {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={4} radiusToken="pill" />)}
        </div>
        {/* pergunta */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Skeleton width={90} height={22} radiusToken="pill" />
          <Skeleton width={200} height={36} />
        </div>
        {/* grid de jogadores */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={96} radiusToken="md" />)}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
