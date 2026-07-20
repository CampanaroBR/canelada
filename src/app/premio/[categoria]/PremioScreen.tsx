"use client";

import { useRouter } from "next/navigation";
import { ShareArtCard } from "@/ds";
import { personagemBgSrc, personagemMascotSrc, personagemTitleColor } from "@/lib/personagemArt";

interface Props {
  slug: string;
  title: string;
  nameColor: string;
  footerBorder: string;
  descricao: string | null;
  vencedorNome: string;
  vencedorQtd: number;
  categoriaLabel: string;
  grupoNome: string;
  data: string;
}

export function PremioScreen({
  slug, title, nameColor, footerBorder, descricao,
  vencedorNome, vencedorQtd, categoriaLabel, grupoNome, data,
}: Props) {
  const router = useRouter();
  return (
    <ShareArtCard
      slug={slug}
      bgSrc={personagemBgSrc(slug)}
      mascotSrc={personagemMascotSrc(slug)}
      title={title.toUpperCase()}
      titleColor={personagemTitleColor(slug)}
      altText={title}
      onClose={() => router.back()}
      descricao={descricao}
      shareText={`${vencedorNome} foi eleito o ${categoriaLabel} do jogo por ${vencedorQtd} jogadores do ${grupoNome}! ⚽`}
      sentence={
        <>
          <span style={{ color: nameColor }}>{vencedorNome}</span>
          {" foi eleito o "}
          <span style={{ color: nameColor }}>{categoriaLabel}</span>
          {` do jogo por ${vencedorQtd} jogadores do ${grupoNome}.`}
        </>
      }
      footerText={`CONCLUÍDO · ${data}`}
      footerBorder={footerBorder}
    />
  );
}
