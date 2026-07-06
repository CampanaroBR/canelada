import type { Meta, StoryObj } from "@storybook/react-vite";
import { Resizable } from "./Resizable";
import { Text } from "./Text";

const meta: Meta<typeof Resizable> = {
  title: "Layout/Resizable",
  component: Resizable,
  tags: ["!autodocs"],
  parameters: { layout: "padded" },
  decorators: [(S) => <div style={{ width: 520 }}><S /></div>],
};
export default meta;
type Story = StoryObj<typeof Resizable>;

export const Default: Story = {
  render: () => (
    <Resizable
      left={<Text variant="title-md">Sidebar</Text>}
      right={<Text variant="title-md">Conteúdo</Text>}
    />
  ),
};
