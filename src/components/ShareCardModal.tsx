"use client";

import { ShareArtCard } from "@/ds";
import { personagemBgSrc, personagemMascotSrc, personagemTitleColor } from "@/lib/personagemArt";

export type PersonagemSemana = {
  slug: string;
  nome: string;
  emoji: string | null;
  descricao: string | null;
  /** @deprecated arte assada antiga — o card agora compõe fundo+mascote+título ao vivo. */
  art?: string;
  vencedor: string;
  votos: number;
  /** true só no goleiro de verdade (camisa dourada); 5º slot de preenchimento = false. */
  isGoleiro?: boolean;
};

interface Props {
  personagem: PersonagemSemana;
  grupoNome: string;
  onClose: () => void;
}

/** Card premium full-screen do personagem da semana — arte bakeada + compartilhar. */
export function ShareCardModal({ personagem, grupoNome, onClose }: Props) {
  const { slug, nome, descricao, vencedor, votos } = personagem;
  return (
    <ShareArtCard
      slug={slug}
      bgSrc={personagemBgSrc(slug)}
      mascotSrc={personagemMascotSrc(slug)}
      title={nome.toUpperCase()}
      titleColor={personagemTitleColor(slug)}
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
