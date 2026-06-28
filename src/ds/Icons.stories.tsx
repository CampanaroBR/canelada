import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  SoccerBall, Trophy, Medal, MedalMilitary, ChartBar, Ranking, Crown, Fire, Lightning,
  Bell, House, User, UserCircle, UsersThree, UserPlus, UserMinus, Star, ShieldStar, ShieldCheck,
  Clock, Calendar, CalendarBlank, Check, CheckCircle, X, XCircle, CaretRight, CaretLeft, CaretDown, CaretUp,
  List, Plus, Minus, PencilSimple, Trash, Export, ShareNetwork, Camera, Image as ImageIcon,
  Heart, ThumbsUp, ThumbsDown, Gear, SignOut, Lock, LockSimple, Eye, EyeSlash, MagnifyingGlass,
  Confetti, Smiley, Warning, Info, Bookmark, Note, ChatCircle, DotsThreeOutline,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { colors, font } from "./tokens";

const meta: Meta = { title: "Foundations/Iconografia", parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj;

const ICONS: [string, PhosphorIcon][] = [
  ["SoccerBall", SoccerBall], ["Trophy", Trophy], ["Medal", Medal], ["MedalMilitary", MedalMilitary],
  ["ChartBar", ChartBar], ["Ranking", Ranking], ["Crown", Crown], ["Fire", Fire], ["Lightning", Lightning],
  ["Bell", Bell], ["House", House], ["User", User], ["UserCircle", UserCircle], ["UsersThree", UsersThree],
  ["UserPlus", UserPlus], ["UserMinus", UserMinus], ["Star", Star], ["ShieldStar", ShieldStar], ["ShieldCheck", ShieldCheck],
  ["Clock", Clock], ["Calendar", Calendar], ["CalendarBlank", CalendarBlank], ["Check", Check], ["CheckCircle", CheckCircle],
  ["X", X], ["XCircle", XCircle], ["CaretRight", CaretRight], ["CaretLeft", CaretLeft], ["CaretDown", CaretDown], ["CaretUp", CaretUp],
  ["List", List], ["Plus", Plus], ["Minus", Minus], ["PencilSimple", PencilSimple], ["Trash", Trash],
  ["Export", Export], ["ShareNetwork", ShareNetwork], ["Camera", Camera], ["Image", ImageIcon],
  ["Heart", Heart], ["ThumbsUp", ThumbsUp], ["ThumbsDown", ThumbsDown], ["Gear", Gear], ["SignOut", SignOut],
  ["Lock", Lock], ["LockSimple", LockSimple], ["Eye", Eye], ["EyeSlash", EyeSlash], ["MagnifyingGlass", MagnifyingGlass],
  ["Confetti", Confetti], ["Smiley", Smiley], ["Warning", Warning], ["Info", Info], ["Bookmark", Bookmark],
  ["Note", Note], ["ChatCircle", ChatCircle], ["DotsThreeOutline", DotsThreeOutline],
];

export const Iconografia: Story = {
  render: () => (
    <div style={{ padding: 32, background: colors.bg.base, minHeight: "100vh" }}>
      <h2 style={{ fontFamily: font.display, fontWeight: 900, fontSize: 22, color: "#fff", margin: "0 0 6px" }}>Iconografia</h2>
      <p style={{ fontFamily: font.body, fontSize: 13, color: colors.text.muted, maxWidth: 560, margin: "0 0 24px" }}>
        Biblioteca <strong style={{ color: "#fff" }}>Phosphor</strong> (@phosphor-icons/react), peso padrão <strong style={{ color: "#9fe870" }}>regular</strong> (outline) —
        nunca fill. Catálogo completo em phosphoricons.com. Cor padrão branca; verde para destaque/ação.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 8 }}>
        {ICONS.map(([name, Ic]) => (
          <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 8px", background: colors.bg.card, border: `1px solid ${colors.bg.border}`, borderRadius: 12 }}>
            <Ic size={26} weight="regular" color={colors.text.primary} />
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
          <SoccerBall size={32} weight="regular" color={c} />
          <span style={{ fontFamily: font.body, fontSize: 11, color: colors.text.muted }}>{n}</span>
        </div>
      ))}
    </div>
  ),
};
