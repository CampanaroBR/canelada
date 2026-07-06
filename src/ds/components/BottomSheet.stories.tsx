import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { BottomSheet } from "./BottomSheet";
import { Button } from "./Button";

const meta: Meta<typeof BottomSheet> = { title: "Overlays/BottomSheet", component: BottomSheet, tags: ["!autodocs"], parameters: { layout: "centered" } };
export default meta;
type Story = StoryObj<typeof BottomSheet>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Abrir sheet</Button>
        <BottomSheet open={open} onClose={() => setOpen(false)}>
          <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 16 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "#fff" }}>Título do sheet</span>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 14, color: "#7a7a7a" }}>
              Arraste o handle pra baixo ou toque fora pra fechar.
            </p>
            <Button fullWidth onClick={() => setOpen(false)}>Fechar</Button>
          </div>
        </BottomSheet>
      </>
    );
  },
};

export const CorCustomizada: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>Abrir sheet (bg custom)</Button>
        <BottomSheet open={open} onClose={() => setOpen(false)} bg="#171717" boxShadow="0px 0px 64px 6px rgba(226,196,133,0.35)">
          <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 16 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "#fff" }}>Fundo e sombra customizados</span>
            <Button fullWidth onClick={() => setOpen(false)}>Fechar</Button>
          </div>
        </BottomSheet>
      </>
    );
  },
};
