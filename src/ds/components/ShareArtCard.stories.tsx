import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ShareArtCard } from "./ShareArtCard";
import { Button } from "./Button";
import { personagemBgSrc, personagemMascotSrc, personagemTitleColor } from "../../lib/personagemArt";

const meta: Meta<typeof ShareArtCard> = { title: "Overlays/ShareArtCard", component: ShareArtCard, tags: ["!autodocs"], parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj<typeof ShareArtCard>;

function Demo({ slug, nome, footerText, footerBorder }: { slug: string; nome: string; footerText: string; footerBorder: string }) {
  const [open, setOpen] = useState(true);
  if (!open) return <div style={{ padding: 24 }}><Button onClick={() => setOpen(true)}>Abrir card</Button></div>;
  return (
    <ShareArtCard
      slug={slug}
      bgSrc={personagemBgSrc(slug)}
      mascotSrc={personagemMascotSrc(slug)}
      title={nome.toUpperCase()}
      titleColor={personagemTitleColor(slug)}
      altText={nome}
      onClose={() => setOpen(false)}
      descricao={`${nome}: a definição da noite.`}
      shareText={`Arthur foi eleito o ${nome} do jogo por 5 jogadores do Os Crias FC! ⚽`}
      sentence={
        <>
          <span style={{ color: "#9fe870" }}>Arthur</span>
          {" foi eleito o "}
          <span style={{ color: "#9fe870" }}>{nome}</span>
          {" do jogo por 5 jogadores do Os Crias FC."}
        </>
      }
      footerText={footerText}
      footerBorder={footerBorder}
    />
  );
}

// Fundo claro → título preto automático.
export const FundoClaro: Story = {
  render: () => <Demo slug="frangueiro" nome="Frangueiro" footerText="5 VOTOS · PERSONAGEM DA SEMANA" footerBorder="rgba(255,255,255,0.25)" />,
};

// Fundo escuro → título branco automático.
export const FundoEscuro: Story = {
  render: () => <Demo slug="paredao" nome="Paredão" footerText="5 VOTOS · PERSONAGEM DA SEMANA" footerBorder="rgba(255,255,255,0.25)" />,
};

export const GolMaisBonito: Story = {
  render: () => <Demo slug="gol-mais-bonito" nome="Gol Mais Bonito" footerText="5 VOTOS · PERSONAGEM DA SEMANA" footerBorder="rgba(255,255,255,0.25)" />,
};
