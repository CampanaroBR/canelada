import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tooltip } from "./Tooltip";
import { Button } from "./Button";

const meta: Meta<typeof Tooltip> = { title: "Feedback/Tooltip", component: Tooltip, parameters: { layout: "centered" } };
export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Top: Story = {
  render: () => (
    <Tooltip label="Compartilhar card">
      <Button variant="ghost" size="sm">Passe o mouse</Button>
    </Tooltip>
  ),
};

export const Bottom: Story = {
  render: () => (
    <Tooltip label="Personagem da semana" placement="bottom">
      <Button variant="secondary" size="sm">Embaixo</Button>
    </Tooltip>
  ),
};
