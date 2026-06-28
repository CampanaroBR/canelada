import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Form, FormField, FormRow, FormActions } from "./Form";
import { Input } from "./Input";
import { Select } from "./Select";
import { Toggle } from "./Toggle";
import { Button } from "./Button";

const meta: Meta = {
  title: "Forms/Form",
  parameters: { layout: "padded" },
  decorators: [(S) => <div style={{ width: 360 }}><S /></div>],
};
export default meta;
type Story = StoryObj;

export const EditarPerfil: Story = {
  render: () => {
    const [pos, setPos] = useState("MEI");
    const [pe, setPe] = useState("Direito");
    const [notif, setNotif] = useState(true);
    return (
      <Form title="Editar perfil" onSubmit={() => {}}>
        <FormRow>
          <Input label="Nome" value="Arthur" disabled />
          <Input label="Sobrenome" value="Sena" disabled />
        </FormRow>
        <Input label="Apelido no baba" placeholder="Craque" />
        <FormRow>
          <Select label="Posição" required value={pos} onChange={setPos} options={[{ value: "MEI", label: "Meio-Campo" }, { value: "ATA", label: "Atacante" }]} />
          <Select label="Pé Preferido" required value={pe} onChange={setPe} options={[{ value: "Direito", label: "Direito" }, { value: "Esquerdo", label: "Esquerdo" }]} />
        </FormRow>
        <FormField label="Notificações" hint="Avisos de votação e badges">
          <Toggle checked={notif} onChange={setNotif} />
        </FormField>
        <FormActions>
          <Button type="submit" fullWidth>Salvar</Button>
          <Button type="button" variant="secondary" fullWidth>Cancelar</Button>
        </FormActions>
      </Form>
    );
  },
};

export const ComErro: Story = {
  render: () => (
    <Form title="Criar grupo">
      <Input label="Nome do grupo" value="x" error="O nome deve ter entre 2 e 40 caracteres." />
      <FormActions direction="row">
        <Button variant="secondary" fullWidth>Cancelar</Button>
        <Button fullWidth>Criar</Button>
      </FormActions>
    </Form>
  ),
};
