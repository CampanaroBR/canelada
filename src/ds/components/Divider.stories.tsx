import type { Meta, StoryObj } from "@storybook/react-vite";
import { Divider } from "./Divider";
import { Card } from "./Card";
import { Text } from "./Text";

const meta: Meta<typeof Divider> = {
  title: "Core/Divider",
  component: Divider,
  decorators: [(S) => <div style={{ width: 320 }}><S /></div>],
};
export default meta;
type Story = StoryObj<typeof Divider>;

export const EmLista: Story = {
  render: () => (
    <Card padding={0} style={{ overflow: "hidden" }}>
      <div style={{ padding: 14 }}><Text variant="label">Item um</Text></div>
      <Divider />
      <div style={{ padding: 14 }}><Text variant="label">Item dois</Text></div>
      <Divider inset={14} />
      <div style={{ padding: 14 }}><Text variant="label">Item três (inset)</Text></div>
    </Card>
  ),
};
