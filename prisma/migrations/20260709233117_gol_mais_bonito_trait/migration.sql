-- Trait novo (Gol Mais Bonito) já aplicado direto em prod via run_sql;
-- idempotente aqui pra não quebrar `prisma migrate deploy` nem outros ambientes.
INSERT INTO "Trait" (slug, nome, categoria, emoji, descricao, peso)
VALUES ('gol-mais-bonito', 'Gol Mais Bonito', 'FUTEBOL', '🎯', 'A pintura da noite. Marcou o gol mais bonito da rodada.', 2)
ON CONFLICT (slug) DO NOTHING;
