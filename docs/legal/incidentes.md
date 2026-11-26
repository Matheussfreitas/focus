# Plano de resposta a incidentes de segurança — Focus

Referência: LGPD art. 48 e Resolução CD/ANPD 15/2024 (comunicação em até 3 dias úteis).

1. **Detectar e registrar** — anotar data/hora da descoberta, o que aconteceu, quais sistemas (Vercel, Neon, repositório).
2. **Conter** — revogar credenciais expostas (`BETTER_AUTH_SECRET`, `DATABASE_URL`/senha Neon, tokens Vercel), invalidar sessões (`DELETE FROM session`), derrubar deploy comprometido (rollback na Vercel), restaurar banco por branch/ponto no tempo do Neon se houver alteração indevida.
3. **Avaliar** — quais dados e quantos titulares; se há risco ou dano relevante (ex.: e-mails + hashes vazados = sim).
4. **Comunicar** (se risco relevante), em até 3 dias úteis:
   - ANPD: formulário de comunicação de incidente no site gov.br/anpd.
   - Titulares: e-mail com descrição, dados afetados, riscos, medidas tomadas e recomendações (ex.: trocar senha onde ela foi reutilizada).
5. **Corrigir e documentar** — causa raiz, correção, e guardar o registro do incidente (mesmo que não comunicado) por no mínimo 5 anos.
