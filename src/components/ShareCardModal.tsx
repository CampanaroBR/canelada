"use client";

import { ShareArtCard } from "@/ds";

export type PersonagemSemana = {
  slug: string;
  nome: string;
  emoji: string | null;
  descricao: string | null;
  art: string;
  vencedor: string;
  votos: number;
};

interface Props {
  personagem: PersonagemSemana;
  grupoNome: string;
  onClose: () => void;
}

/** Card premium full-screen do personagem da semana — arte bakeada + compartilhar. */
export function ShareCardModal({ personagem, grupoNome, onClose }: Props) {
  const { slug, nome, descricao, art, vencedor, votos } = personagem;
  return (
    <ShareArtCard
      slug={slug}
      artSrc={art}
      altText={nome}
      onClose={onClose}
      descricao={descricao}
      shareText={`${vencedor} foi eleito o ${nome} do jogo por ${votos} jogadores do ${grupoNome}! ⚽`}
      sentence={
        <>
          <span style={{ color: "#9fe870" }}>{vencedor}</span>
          {" foi eleito o "}
          <span style={{ color: "#9fe870" }}>{nome}</span>
          {` do jogo por ${votos} jogadores do ${grupoNome}.`}
        </>
      }
      footerText={`${votos} VOTOS · PERSONAGEM DA SEMANA`}
      footerBorder="rgba(255,255,255,0.25)"
    />
  );
}
