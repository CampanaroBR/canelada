import type { Meta, StoryObj } from "@storybook/react-vite";
import { Trophy, SoccerBall, UsersThree, BellSlash, MedalMilitary } from "@phosphor-icons/react";
import { EmptyState } from "./EmptyState";
import { Button } from "./Button";

const meta: Meta<typeof EmptyState> = {
  title: "Patterns/EmptyState",
  component: EmptyState,
  tags: ["!autodocs"],
  decorators: [(S) => <div style={{ width: 380 }}><S /></div>],
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

const ic = (I: typeof Trophy) => <I size={26} weight="regular" />;

export const Anatomia: Story = {
  args: {
    icon: ic(Trophy),
    title: "Título do estado vazio",
    description: "Uma linha curta explicando o porquê e o próximo passo.",
    action: <Button size="sm">Ação principal</Button>,
    link: <Button variant="link" size="sm">Saiba mais</Button>,
  },
};

export const SemClassificacao: Story = {
  args: {
    icon: ic(Trophy),
    title: "Sem classificação ainda",
    description: "Nenhuma rodada encerrada nesta semana.",
  },
};

export const ComAcao: Story = {
  args: {
    icon: ic(SoccerBall),
    title: "Nenhuma rodada criada",
    description: "Crie a primeira rodada pra começar a votação do baba.",
    action: <Button size="sm">Criar Rodada</Button>,
    link: <Button variant="link" size="sm">Como funciona?</Button>,
  },
};

export const SemMembros: Story = {
  args: {
    icon: ic(UsersThree),
    title: "Grupo vazio",
    description: "Convide a galera pra entrar no baba.",
    action: (
      <>
        <Button size="sm">Convidar</Button>
        <Button size="sm" variant="secondary">Copiar link</Button>
      </>
    ),
  },
};

export const SemBadges: Story = {
  args: {
    icon: ic(MedalMilitary),
    title: "Nenhuma badge ainda",
    description: "Jogue e vote pra desbloquear suas primeiras conquistas.",
    action: <Button size="sm" variant="secondary">Ver badges</Button>,
  },
};

export const SemNotificacoes: Story = {
  args: {
    icon: ic(BellSlash),
    title: "Sem notificações",
    description: "Tudo em dia! Novos avisos aparecem aqui.",
  },
};
