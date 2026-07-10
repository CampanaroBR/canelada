import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ShareArtCard } from "./ShareArtCard";
import { Button } from "./Button";

const meta: Meta<typeof ShareArtCard> = { title: "Overlays/ShareArtCard", component: ShareArtCard, tags: ["!autodocs"], parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj<typeof ShareArtCard>;

export const PremioMatador: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    if (!open) return <div style={{ padding: 24 }}><Button onClick={() => setOpen(true)}>Abrir card</Button></div>;
    return (
      <ShareArtCard
        slug="matador"
        artSrc="/premio/matador.jpg"
        altText="Matador"
        onClose={() => setOpen(false)}
        descricao="Especialista em finalizar jogadas e balançar as redes."
        shareText="Arthur foi eleito o Matador do jogo por 5 jogadores do Os Crias FC! ⚽"
        sentence={
          <>
            <span style={{ color: "#9fe870" }}>Arthur</span>
            {" foi eleito o "}
            <span style={{ color: "#9fe870" }}>Matador</span>
            {" do jogo por 5 jogadores do Os Crias FC."}
          </>
        }
        footerText="CONCLUÍDO · 09/07/2026"
        footerBorder="#42bace"
      />
    );
  },
};

export const PersonagemDaSemana: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    if (!open) return <div style={{ padding: 24 }}><Button onClick={() => setOpen(true)}>Abrir card</Button></div>;
    return (
      <ShareArtCard
        slug="gol-mais-bonito"
        artSrc="/premio/gol-mais-bonito.jpg"
        altText="Gol Mais Bonito"
        onClose={() => setOpen(false)}
        descricao="A pintura da noite."
        shareText="Arthur foi eleito o Gol Mais Bonito do jogo por 5 jogadores do Os Crias FC! ⚽"
        sentence={
          <>
            <span style={{ color: "#9fe870" }}>Arthur</span>
            {" foi eleito o "}
            <span style={{ color: "#9fe870" }}>Gol Mais Bonito</span>
            {" do jogo por 5 jogadores do Os Crias FC."}
          </>
        }
        footerText="5 VOTOS · PERSONAGEM DA SEMANA"
        footerBorder="rgba(255,255,255,0.25)"
      />
    );
  },
};
