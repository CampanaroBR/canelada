import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Form, FormActions } from "./Form";
import { PasswordInput } from "./PasswordInput";
import { Button } from "./Button";

const meta: Meta = {
  title: "Forms/Form/Senha",
  parameters: { layout: "padded" },
  decorators: [(S) => <div style={{ width: 360 }}><S /></div>],
};
export default meta;
type Story = StoryObj;

export const DefinirSenha: Story = {
  render: () => {
    const [s1, setS1] = useState("");
    const [s2, setS2] = useState("");
    const mismatch = s2.length > 0 && s1 !== s2;
    return (
      <Form title="Definir senha" onSubmit={() => {}}>
        <PasswordInput label="Nova senha" required strength value={s1} onChange={(e) => setS1(e.target.value)} placeholder="••••••••" />
        <PasswordInput
          label="Confirmar senha"
          required
          value={s2}
          onChange={(e) => setS2(e.target.value)}
          placeholder="••••••••"
          error={mismatch ? "As senhas não coincidem." : undefined}
        />
        <FormActions>
          <Button type="submit" fullWidth>Salvar senha</Button>
        </FormActions>
      </Form>
    );
  },
};

export const Login: Story = {
  render: () => {
    const [pw, setPw] = useState("");
    return (
      <Form title="Entrar" onSubmit={() => {}}>
        <PasswordInput label="Senha" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Sua senha" />
        <FormActions>
          <Button type="submit" fullWidth>Entrar</Button>
        </FormActions>
      </Form>
    );
  },
};
