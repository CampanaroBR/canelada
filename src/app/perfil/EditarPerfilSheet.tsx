"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, UserCircle, CaretDown } from "@phosphor-icons/react";
import { BottomSheet } from "@/components/BottomSheet";
import { atualizarPerfil, uploadFoto } from "./actions";
import { toast } from "@/ds/toast";
import { Button } from "@/ds";

const POSICOES = ["Goleiro", "Zagueiro", "Lateral", "Volante", "Meio-Campo", "Atacante"];
const PES = ["Direito", "Esquerdo", "Ambidestro"];

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, lineHeight: "20px", color: "#f5f5f5", marginBottom: 6, display: "block" }}>
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
  background: "#0a0e0e", border: "1px solid #2c2c2c", borderRadius: 16,
  padding: "0 16px", color: "#fff", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, outline: "none",
};
const disabledStyle: React.CSSProperties = {
  ...inputStyle, background: "#171717", color: "#666", cursor: "not-allowed", opacity: 1,
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
    if (!res.ok) { setError(res.error ?? "Falha no upload."); toast.error(res.error ?? "Falha no upload."); return; }
    if (res.url) { setFoto(res.url); router.refresh(); toast.success("Foto atualizada!"); }
  }

  async function salvar() {
    setSaving(true); setError(null);
    const res = await atualizarPerfil({ nome, sobrenome, apelido, posicao, peDominante: pe });
    setSaving(false);
    if (!res.ok) { setError(res.error ?? "Erro ao salvar."); toast.error(res.error ?? "Erro ao salvar."); return; }
    onClose();
    toast.success("Perfil atualizado!");
    if (res.apelido && res.apelido !== initial.apelido) router.push(`/perfil/${encodeURIComponent(res.apelido)}`);
    else router.refresh();
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "#171717", border: "1px solid #2c2c2c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <UserCircle size={24} color="#9fe870" weight="regular" />
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", textTransform: "uppercase", color: "#fff" }}>Editar perfil</span>
        </div>

        {/* Foto */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <button type="button" onClick={() => fileRef.current?.click()} style={{ position: "relative", width: 96, height: 96, padding: 0, background: "none", border: "none", cursor: uploading ? "default" : "pointer", WebkitTapHighlightColor: "transparent" }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 96, height: 96, borderRadius: "50%", border: "2px solid #424242", background: "#090909", overflow: "hidden" }}>
              {foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: uploading ? 0.5 : 1 }} />
              ) : (
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 34, color: "#9fe870", opacity: uploading ? 0.5 : 1 }}>{initials(apelido || initial.apelido)}</span>
              )}
            </span>
            <span style={{ position: "absolute", right: 0, bottom: 0, width: 24, height: 24, borderRadius: "50%", background: "#9fe870", border: "2px solid #090909", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Camera size={12} color="#0a1a06" weight="fill" />
            </span>
          </button>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12, color: "#7a7a7a" }}>{uploading ? "Enviando…" : "Toque pra trocar a foto"}</span>
          <input ref={fileRef} type="file" accept="image/*" onChange={onPickFoto} style={{ display: "none" }} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <Label>Nome</Label>
            <input style={disabledStyle} value={nome} disabled readOnly placeholder="Arthur" />
          </div>
          <div style={{ flex: 1 }}>
            <Label>Sobrenome</Label>
            <input style={disabledStyle} value={sobrenome} disabled readOnly placeholder="Sena" />
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

        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}>
          <Button fullWidth size="lg" onClick={salvar} disabled={saving}>{saving ? "Salvando…" : "Salvar"}</Button>
          <Button fullWidth size="lg" variant="secondary" onClick={onClose} disabled={saving}>Cancelar</Button>
        </div>
      </div>
    </BottomSheet>
  );
}
