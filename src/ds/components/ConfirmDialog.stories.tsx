import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { Button } from "./Button";

const meta: Meta<typeof ConfirmDialog> = { title: "Overlays/ConfirmDialog", component: ConfirmDialog, tags: ["!autodocs"], parameters: { layout: "centered" } };
export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const ExcluirConta: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>Excluir conta</Button>
        <ConfirmDialog
          open={open}
          onClose={() => setOpen(false)}
          title="Excluir conta?"
          description="Isso apaga permanentemente seu perfil, votos, personagens e badges. Não dá pra desfazer."
          confirmLabel={loading ? "Excluindo…" : "Excluir"}
          loading={loading}
          onConfirm={() => { setLoading(true); setTimeout(() => { setLoading(false); setOpen(false); }, 900); }}
        />
      </>
    );
  },
};

export const ComErro: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Remover Arthur?"
        description="Tira Arthur do grupo e apaga votos, personagens e badges desse jogador. Não dá pra desfazer."
        error="Não foi possível remover agora. Tente novamente."
        confirmLabel="Remover"
        onConfirm={() => {}}
      />
    );
  },
};
