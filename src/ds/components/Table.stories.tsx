import type { Meta, StoryObj } from "@storybook/react-vite";
import { Table } from "./Table";
import { Badge } from "./Badge";

const meta: Meta = { title: "Data/Table", parameters: { layout: "padded" } };
export default meta;
type Story = StoryObj;

type Row = { pos: React.ReactNode; jogador: React.ReactNode; pts: React.ReactNode };

export const Classificacao: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <Table<Row>
        height="tall"
        columns={[
          { key: "pos", label: "#", width: 48 },
          { key: "jogador", label: "Jogador" },
          { key: "pts", label: "Pontos", align: "right" },
        ]}
        rows={[
          { pos: "1", jogador: "Arthur", pts: <Badge tone="accent" variant="soft">30</Badge> },
          { pos: "2", jogador: "Alala", pts: <Badge tone="neutral" variant="soft">26</Badge> },
          { pos: "3", jogador: "Robben", pts: <Badge tone="gold" variant="soft">22</Badge> },
          { pos: "4", jogador: "Maestro", pts: "15" },
        ]}
      />
    </div>
  ),
};
