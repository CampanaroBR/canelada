import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { BottomNav } from "./BottomNav";

const meta: Meta<typeof BottomNav> = { title: "Patterns/BottomNav", component: BottomNav, parameters: { layout: "centered" } };
export default meta;
type Story = StoryObj<typeof BottomNav>;

const Ic = ({ d }: { d: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const items = [
  { value: "home", label: "Home", icon: <Ic d="M3 11l9-8 9 8M5 10v10h14V10" /> },
  { value: "baba", label: "Baba", icon: <Ic d="M12 3a9 9 0 100 18 9 9 0 000-18zM12 8v8M8 12h8" /> },
  { value: "votos", label: "Votos", icon: <Ic d="M9 12l2 2 4-4M12 3a9 9 0 100 18 9 9 0 000-18z" /> },
  { value: "ranking", label: "Ranking", icon: <Ic d="M5 20V10M12 20V4M19 20v-7" /> },
];

export const Default: Story = {
  render: () => {
    const [v, setV] = useState("baba");
    return <BottomNav items={items} value={v} onChange={setV} />;
  },
};
