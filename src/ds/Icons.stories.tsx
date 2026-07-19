import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Football, Trophy, Medal, Medal2, ChartBar, Ranking, Crown, Fire, Lightning,
  Bell, House, User, UserCircle, Users3, UserAdd, UserMinus, Star, ShieldStar, ShieldCheck,
  Clock, Calendar, Check, CheckCircle, X, XCircle, CaretRight, CaretLeft, ChevronDown, ChevronUp,
  List, Plus, Minus, Edit, Trash, Export, Share, Camera, Image as ImageIcon,
  Heart, ThumbsUp, ThumbsDown, Gear, Logout2, Lock, Eye, EyeSlash, Magnifier,
  Confetti, Smileys, Warning, Information, Bookmark, Note, Chat, MoreCircle,
  type IconComponent,
} from "reicon-react";
import { colors, font } from "./tokens";

const meta: Meta = { title: "Foundations/Iconografia", parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj;

const ICONS: [string, IconComponent][] = [
  ["Football", Football], ["Trophy", Trophy], ["Medal", Medal], ["Medal2", Medal2],
  ["ChartBar", ChartBar], ["Ranking", Ranking], ["Crown", Crown], ["Fire", Fire], ["Lightning", Lightning],
  ["Bell", Bell], ["House", House], ["User", User], ["UserCircle", UserCircle], ["Users3", Users3],
  ["UserAdd", UserAdd], ["UserMinus", UserMinus], ["Star", Star], ["ShieldStar", ShieldStar], ["ShieldCheck", ShieldCheck],
  ["Clock", Clock], ["Calendar", Calendar], ["Check", Check], ["CheckCircle", CheckCircle],
  ["X", X], ["XCircle", XCircle], ["CaretRight", CaretRight], ["CaretLeft", CaretLeft], ["ChevronDown", ChevronDown], ["ChevronUp", ChevronUp],
  ["List", List], ["Plus", Plus], ["Minus", Minus], ["Edit", Edit], ["Trash", Trash],
  ["Export", Export], ["Share", Share], ["Camera", Camera], ["Image", ImageIcon],
  ["Heart", Heart], ["ThumbsUp", ThumbsUp], ["ThumbsDown", ThumbsDown], ["Gear", Gear], ["Logout2", Logout2],
  ["Lock", Lock], ["Eye", Eye], ["EyeSlash", EyeSlash], ["Magnifier", Magnifier],
  ["Confetti", Confetti], ["Smileys", Smileys], ["Warning", Warning], ["Information", Information], ["Bookmark", Bookmark],
  ["Note", Note], ["Chat", Chat], ["MoreCircle", MoreCircle],
];

export const Iconografia: Story = {
  render: () => (
    <div style={{ padding: 32, background: colors.bg.base, minHeight: "100vh" }}>
      <h2 style={{ fontFamily: font.display, fontWeight: 900, fontSize: 22, color: "#fff", margin: "0 0 6px" }}>Iconografia</h2>
      <p style={{ fontFamily: font.body, fontSize: 13, color: colors.text.muted, maxWidth: 560, margin: "0 0 24px" }}>
        Biblioteca <strong style={{ color: "#fff" }}>Reicon</strong> (reicon-react), peso padrão <strong style={{ color: "#9fe870" }}>Outline</strong> —
        nunca fill. Catálogo completo em reicon.dev. Cor padrão branca; verde para destaque/ação.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 8 }}>
        {ICONS.map(([name, Ic]) => (
          <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 8px", background: colors.bg.card, border: `1px solid ${colors.bg.border}`, borderRadius: 12 }}>
            <Ic size={26} weight="Outline" color={colors.text.primary} />
            <span style={{ fontFamily: font.body, fontSize: 10, color: colors.text.muted, textAlign: "center", wordBreak: "break-word" }}>{name}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Cores: Story = {
  render: () => (
    <div style={{ padding: 32, background: colors.bg.base, display: "flex", gap: 16 }}>
      {([["primary", colors.text.primary], ["accent", colors.accent.default], ["muted", colors.text.muted], ["danger", colors.semantic.danger]] as const).map(([n, c]) => (
        <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Football size={32} weight="Outline" color={c} />
          <span style={{ fontFamily: font.body, fontSize: 11, color: colors.text.muted }}>{n}</span>
        </div>
      ))}
    </div>
  ),
};
