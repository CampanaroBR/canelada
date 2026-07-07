import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Server Actions limitam o corpo em 1MB por padrão — fotos de câmera de
    // celular passam disso fácil. Alinhado ao limite de 5MB validado em
    // uploadFoto (src/app/perfil/actions.ts), com folga pro overhead do multipart.
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
