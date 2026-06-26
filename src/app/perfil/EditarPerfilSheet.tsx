"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, UserCircle, CaretDown } from "@phosphor-icons/react";
import { BottomSheet } from "@/components/BottomSheet";
import { atualizarPerfil, uploadFoto } from "./actions";

const POSICOES = ["Goleiro", "Zagueiro", "Lateral", "Volante", "Meio-Campo", "Atacante"];
const PES = ["Direito", "Esquerdo", "Ambidestro"];

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "#fff", marginBottom: 8, display: "block" }}>
      {children}
      {required && <span style={{ color: "#e56767", marginLeft: 3 }}>*</span>}
    </label>
  );
}

export interface PerfilInitial {
  nome: string;
  sobrenome: string;
  apelido: string;
  posicao: string;
  peDominante: string;
  foto: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  initial: PerfilInitial;
}

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return (p.length >= 2 ? p[0][0] + p[1][0] : name.slice(0, 2)).toUpperCase();
}

const inputStyle: React.CSSProperties = {
  width: "100%", height: 48, boxSizing: "border-box",
  background: "#0a0e0e", border: "1px solid #2c2c2c", borderRadius: 12,
  padding: "0 14px", color: "#fff", fontFamily: "var(--font-body)", fontSize: 15, outline: "none",
};
const selectWrap: React.CSSProperties = { position: "relative", width: "100%" };
const selectStyle: React.CSSProperties = {
  ...inputStyle, appearance: "none", WebkitAppearance: "none", MozAppearance: "none",
  paddingRight: 36, cursor: "pointer",
};
const caretStyle: React.CSSProperties = {
  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none",
};

export function EditarPerfilSheet({ open, onClose, initial }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nome, setNome] = useState(initial.nome);
  const [sobrenome, setSobrenome] = useState(initial.sobrenome);
  const [apelido, setApelido] = useState(initial.apelido);
  const [posicao, setPosicao] = useState(initial.posicao);
  const [pe, setPe] = useState(initial.peDominante);
  const [foto, setFoto] = useState(initial.foto);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setNome(initial.nome); setSobrenome(initial.sobrenome); setApelido(initial.apelido);
      setPosicao(initial.posicao); setPe(initial.peDominante); setFoto(initial.foto);
      setError(null);
    }
  }, [open, initial]);

  async function onPickFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadFoto(fd);
    setUploading(false);
    if (!res.ok) { setError(res.error ?? "Falha no upload."); return; }
    if (res.url) { setFoto(res.url); router.refresh(); }
  }

  async function salvar() {
    setSaving(true); setError(null);
    const res = await atualizarPerfil({ nome, sobrenome, apelido, posicao, peDominante: pe });
    setSaving(false);
    if (!res.ok) { setError(res.error ?? "Erro ao salvar."); return; }
    onClose();
    if (res.apelido && res.apelido !== initial.apelido) router.push(`/perfil/${encodeURIComponent(res.apelido)}`);
    else router.refresh();
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1c1c1c", border: "1px solid #383838", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <UserCircle size={20} color="#9fe870" weight="fill" />
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, letterSpacing: "0.04em", textTransform: "uppercase", color: "#fff" }}>Editar perfil</span>
        </div>

        {/* Foto */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <button type="button" onClick={() => fileRef.current?.click()} style={{ position: "relative", width: 112, height: 112, borderRadius: "50%", border: "2px solid #9fe870", background: "#0a0e0e", padding: 0, cursor: uploading ? "default" : "pointer", overflow: "hidden", WebkitTapHighlightColor: "transparent" }}>
            {foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: uploading ? 0.5 : 1 }} />
            ) : (
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 40, color: "#9fe870", opacity: uploading ? 0.5 : 1 }}>{initials(apelido || initial.apelido)}</span>
            )}
            <span style={{ position: "absolute", right: 2, bottom: 2, width: 28, height: 28, borderRadius: "50%", background: "#9fe870", border: "2px solid #171717", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Camera size={15} color="#0a1a06" weight="fill" />
            </span>
          </button>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12, color: "#7a7a7a" }}>{uploading ? "Enviando…" : "Toque pra trocar a foto"}</span>
          <input ref={fileRef} type="file" accept="image/*" onChange={onPickFoto} style={{ display: "none" }} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <Label>Nome</Label>
            <input style={inputStyle} value={nome} onChange={e => setNome(e.target.value)} placeholder="Arthur" maxLength={40} />
          </div>
          <div style={{ flex: 1 }}>
            <Label>Sobrenome</Label>
            <input style={inputStyle} value={sobrenome} onChange={e => setSobrenome(e.target.value)} placeholder="Sena" maxLength={40} />
          </div>
        </div>

        <div>
          <Label>Apelido no baba</Label>
          <input style={inputStyle} value={apelido} onChange={e => setApelido(e.target.value)} placeholder="Craque" maxLength={24} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <Label required>Posição</Label>
            <div style={selectWrap}>
              <select style={selectStyle} value={posicao} onChange={e => setPosicao(e.target.value)}>
                <option value="">—</option>
                {POSICOES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <CaretDown size={16} color="#9fe870" weight="bold" style={caretStyle} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <Label required>Pé Preferido</Label>
            <div style={selectWrap}>
              <select style={selectStyle} value={pe} onChange={e => setPe(e.target.value)}>
                <option value="">—</option>
                {PES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <CaretDown size={16} color="#9fe870" weight="bold" style={caretStyle} />
            </div>
          </div>
        </div>

        {error && <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, color: "#ef6b6b" }}>{error}</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
          <button onClick={salvar} disabled={saving} style={{ width: "100%", height: 56, borderRadius: 16, cursor: saving ? "default" : "pointer", background: "#9fe870", border: "none", opacity: saving ? 0.6 : 1, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "#000" }}>{saving ? "Salvando…" : "Salvar"}</button>
          <button onClick={onClose} disabled={saving} style={{ width: "100%", height: 56, borderRadius: 16, cursor: "pointer", background: "#0a0e0e", border: "1px solid #424242", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#fff" }}>Cancelar</button>
        </div>
      </div>
    </BottomSheet>
  );
}
