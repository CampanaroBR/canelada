import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "./Separator";
import { Text } from "./Text";

const meta: Meta<typeof Separator> = {
  title: "Core/Separator",
  component: Separator,
  decorators: [(S) => <div style={{ width: 320 }}><S /></div>],
};
export default meta;
type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  render: () => (
    <div>
      <Text variant="paragraph-m">Acima</Text>
      <Separator />
      <Text variant="paragraph-m">Abaixo</Text>
    </div>
  ),
};

export const ComRotulo: Story = {
  render: () => (
    <div>
      <Text variant="paragraph-m">Entrar com Google</Text>
      <Separator label="ou" />
      <Text variant="paragraph-m">Entrar com e-mail</Text>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", height: 40 }}>
      <Text variant="label">12 jogos</Text>
      <Separator orientation="vertical" spacing={12} />
      <Text variant="label">3 MVPs</Text>
      <Separator orientation="vertical" spacing={12} />
      <Text variant="label">1 bagre</Text>
    </div>
  ),
};
