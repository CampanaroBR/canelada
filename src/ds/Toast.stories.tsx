import type { Meta, StoryObj } from "@storybook/react-vite";
import { toast, Toaster } from "./toast";
import { Button } from "./components/Button";

const meta: Meta = { title: "Feedback/Toast", parameters: { layout: "centered" } };
export default meta;
type Story = StoryObj;

export const Tipos: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 260 }}>
      <Button onClick={() => toast.success("Perfil atualizado!")}>Success</Button>
      <Button variant="danger" onClick={() => toast.error("Não foi possível salvar.")}>Error</Button>
      <Button variant="secondary" onClick={() => toast.info("Votação abre às 22:30.")}>Info</Button>
      <Toaster />
    </div>
  ),
};
