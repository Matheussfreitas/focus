# Registro das Operações de Tratamento (ROPA) — Focus

Controlador: Matheus Freitas (pessoa física). Contato: ver `CONTACT_EMAIL` em `src/lib/legal.ts`.
Regime: agente de tratamento de pequeno porte (Resolução CD/ANPD 2/2022), dispensado de indicar encarregado, mas mantém canal de comunicação com titulares.
Revisado em: 2026-11-26.

| Operação            | Dados                                     | Titulares                        | Finalidade                     | Base legal                                               | Onde fica                                                             | Retenção                                    | Operadores   |
| ------------------- | ----------------------------------------- | -------------------------------- | ------------------------------ | -------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------- | ------------ |
| Cadastro e login    | nome, e-mail, hash bcrypt da senha        | usuários                         | criar e autenticar conta       | execução de contrato (art. 7º V)                         | tabelas `user`, `account`                                             | até a exclusão da conta                     | Vercel, Neon |
| Sessão              | token, IP, user agent                     | usuários                         | manter login                   | execução de contrato                                     | tabela `session`                                                      | 24 h (expira) / apagada com a conta         | Vercel, Neon |
| Conteúdo do usuário | tarefas, tags, sessões de foco            | usuários                         | prestar o serviço              | execução de contrato                                     | `task`, `tags`, `focus_session`                                       | até a exclusão da conta                     | Neon         |
| Aceite dos termos   | data/hora, versão aceita                  | usuários                         | comprovar aceite               | execução de contrato; exercício regular de direitos (VI) | colunas `termsAcceptedAt`, `termsVersion`, `privacyVersion` em `user` | até a exclusão da conta                     | Neon         |
| Registro de acesso  | userId, evento, IP, user agent, data/hora | usuários (inclusive ex-usuários) | Marco Civil art. 15; segurança | obrigação legal (II); legítimo interesse (IX)            | tabela `access_log`                                                   | 183 dias (limpeza automática em cada login) | Neon         |
| Preferências        | layout, paleta, filtros, tema             | visitantes e usuários            | personalizar a interface       | legítimo interesse                                       | cookies / localStorage no navegador                                   | 1 ano                                       | —            |

Transferência internacional: Vercel e Neon (AWS us-east-2) — EUA. Base: cláusulas contratuais dos fornecedores (art. 33).
Não há dados sensíveis, dados de menores, marketing ou analytics.
