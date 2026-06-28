import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

const meta: Meta<typeof Modal> = { title: "Overlays/Modal", component: Modal, parameters: { layout: "centered" } };
export default meta;
type Story = StoryObj<typeof Modal>;

export const Confirmacao: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Abrir modal</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Excluir conta?"
          subtitle="Essa ação é permanente."
          confirmLabel="Excluir"
          confirmVariant="danger"
          onConfirm={() => setOpen(false)}
        >
          Isso apaga seu perfil, votos, personagens e badges. Não dá pra desfazer.
        </Modal>
      </>
    );
  },
};

export const ComInfo: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>Abrir</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Criar rodada" info="15 jogadores" confirmLabel="Confirmar" onConfirm={() => setOpen(false)}>
          Confirme os participantes do baba antes de abrir a votação.
        </Modal>
      </>
    );
  },
};
