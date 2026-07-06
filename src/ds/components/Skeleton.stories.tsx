import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./Skeleton";
import { Card } from "./Card";

const meta: Meta<typeof Skeleton> = { title: "Feedback/Skeleton", component: Skeleton, tags: ["!autodocs"] };
export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Anatomia: Story = { args: { width: 240, height: 16 }, decorators: [(S) => <div style={{ width: 280 }}><S /></div>] };

export const Tipos: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 280 }}>
      <Skeleton circle height={40} />
      <Skeleton width="80%" />
      <Skeleton width="60%" />
      <Skeleton height={80} radiusToken="lg" />
    </div>
  ),
};

export const CardCarregando: Story = {
  render: () => (
    <Card tone="surface" padding={16} style={{ width: 320 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Skeleton circle height={42} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <Skeleton width="55%" height={14} />
          <Skeleton width="35%" height={12} />
        </div>
      </div>
    </Card>
  ),
};
