import type { Meta, StoryObj } from "@storybook/react-vite";
import { Alert } from "./Alert";

const meta: Meta<typeof Alert> = {
  title: "Feedback/Alert",
  component: Alert,
  decorators: [(S) => <div style={{ width: 360 }}><S /></div>],
};
export default meta;
type Story = StoryObj<typeof Alert>;

export const Todos: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 360 }}>
      <Alert tone="info" title="Votação abre às 22:30">Você será avisado quando começar.</Alert>
      <Alert tone="success" title="Rodada criada!">15 jogadores relacionados para o baba.</Alert>
      <Alert tone="warning" title="Pendentes ficam de fora">Quando criarem conta, o app vincula sozinho.</Alert>
      <Alert tone="danger" title="Não foi possível salvar" onClose={() => {}}>Tente novamente em instantes.</Alert>
    </div>
  ),
};
