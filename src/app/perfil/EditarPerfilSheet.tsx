"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PencilSimple, Camera } from "@phosphor-icons/react";
import { BottomSheet } from "@/components/BottomSheet";
import { atualizarPerfil, uploadFoto } from "./actions";

const POSICOES = ["Goleiro", "Zagueiro", "Lateral", "Volante", "Meia", "Atacante"];
const PES = ["Direito", "Esquerdo", "Ambidestro"];

interface Props {
  initial: {
    nome: string;
    sobrenome: string;
    apelido: string;
    posicao: string;
    peDominante: string;
    foto: string;
  };
}

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return (p.length >= 2 ? p[0][0] + p[1][0] : name.slice(0, 2)).toUpperCase();
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12,
  letterSpacing: "0.04em", textTransform: "uppercase", color: "#7a7a7a", marginBottom: 6, display: "block",
};
const inputStyle: React.CSSProperties = {
  width: "100%", height: 48, boxSizing: "border-box",
  background: "#0a0e0e", border: "1px solid #2c2c2c", borderRadius: 12,
  padding: "0 14px", color: "#fff", fontFamily: "var(--font-body)", fontSize: 15,
  outline: "none",
};

export function EditarPerfilSheet({ initial }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
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

  function abrir() {
    setNome(initial.nome); setSobrenome(initial.sobrenome); setApelido(initial.apelido);
    setPosicao(initial.posicao); setPe(initial.peDominante); setFoto(initial.foto);
    setError(null); setOpen(true);
  }

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
    setOpen(false);
    if (res.apelido && res.apelido !== initial.apelido) {
      router.push(`/perfil/${encodeURIComponent(res.apelido)}`);
    } else {
      router.refresh();
    }
  }

  return (
    <>
      <button
        onClick={abrir}
        aria-label="Editar perfil"
        style={{
          display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0,
          background: "#171717", border: "1px solid #2c2c2c", borderRadius: 9999,
          padding: "8px 14px", cursor: "pointer", WebkitTapHighlightColor: "transparent",
        }}
      >
        <PencilSimple size={16} color="#9fe870" weight="bold" />
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#fff" }}>Editar</span>
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>
            Editar perfil
          </h2>

          {/* Foto */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{ position: "relative", width: 96, height: 96, borderRadius: "50%", border: "2px solid #9fe870", background: "#0a0e0e", padding: 0, cursor: uploading ? "default" : "pointer", overflow: "hidden", WebkitTapHighlightColor: "transparent" }}
            >
              {foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: uploading ? 0.5 : 1 }} />
              ) : (
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 34, color: "#9fe870", opacity: uploading ? 0.5 : 1 }}>{initials(apelido || initial.apelido)}</span>
              )}
              <span style={{ position: "absolute", right: 2, bottom: 2, width: 28, height: 28, borderRadius: "50%", background: "#9fe870", border: "2px solid #171717", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Camera size={15} color="#0a1a06" weight="fill" />
              </span>
            </button>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12, color: "#7a7a7a" }}>
              {uploading ? "Enviando…" : "Toque pra trocar a foto"}
            </span>
            <input ref={fileRef} type="file" accept="image/*" onChange={onPickFoto} style={{ display: "none" }} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Nome</label>
              <input style={inputStyle} value={nome} onChange={e => setNome(e.target.value)} placeholder="Arthur" maxLength={40} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Sobrenome</label>
              <input style={inputStyle} value={sobrenome} onChange={e => setSobrenome(e.target.value)} placeholder="Silva" maxLength={40} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Apelido no baba</label>
            <input style={inputStyle} value={apelido} onChange={e => setApelido(e.target.value)} placeholder="Craque" maxLength={24} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Posição</label>
              <select style={{ ...inputStyle, appearance: "none" }} value={posicao} onChange={e => setPosicao(e.target.value)}>
                <option value="">—</option>
                {POSICOES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Pé preferido</label>
              <select style={{ ...inputStyle, appearance: "none" }} value={pe} onChange={e => setPe(e.target.value)}>
                <option value="">—</option>
                {PES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, color: "#ef6b6b" }}>{error}</p>
          )}

          <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
            <button onClick={() => setOpen(false)} disabled={saving} style={{
              flex: 1, height: 52, borderRadius: 16, cursor: "pointer",
              background: "#0a0e0e", border: "1px solid #424242",
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#fff",
            }}>Cancelar</button>
            <button onClick={salvar} disabled={saving} style={{
              flex: 1, height: 52, borderRadius: 16, cursor: saving ? "default" : "pointer",
              background: "#9fe870", border: "none", opacity: saving ? 0.6 : 1,
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "#000",
            }}>{saving ? "Salvando…" : "Salvar"}</button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
