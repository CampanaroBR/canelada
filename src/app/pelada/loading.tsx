import { BottomNav } from "@/components/layout/BottomNav";
import { Skeleton } from "@/ds/components/Skeleton";

export default function PeladaLoading() {
  return (
    <div style={{ minHeight: "100dvh", background: "#08080a", paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: "#0a0e0e", border: "1px solid #2c2c2c", borderRadius: "0 0 40px 40px", paddingTop: "calc(env(safe-area-inset-top, 0px) + 96px)", paddingBottom: 20, paddingLeft: 16, paddingRight: 16, boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 8 }}>
          <Skeleton width={180} height={20} />
          <Skeleton width={240} height={14} />
        </div>
      </div>
      {/* Form card */}
      <div style={{ padding: "16px 8px 0", boxSizing: "border-box" }}>
        <div style={{ background: "#171717", border: "1px solid #2c2c2c", borderRadius: 32, padding: "24px 9px 17px", display: "flex", flexDirection: "column", gap: 16 }}>
          <Skeleton height={36} radiusToken="md" />
          <Skeleton width={160} height={16} />
          <div style={{ display: "flex", gap: 8 }}>
            {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={56} radiusToken="md" />)}
          </div>
          <Skeleton height={120} radiusToken="lg" />
          <Skeleton height={54} radiusToken="lg" />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
