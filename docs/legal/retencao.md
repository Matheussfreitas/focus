# Política de retenção e eliminação — Focus

| Dado                                          | Prazo                                  | Como é eliminado                                                       |
| --------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------- |
| Conta, tarefas, tags, sessões de foco, aceite | enquanto a conta existir               | exclusão em `/conta` (better-auth `deleteUser` + `onDelete: Cascade`)  |
| Sessões de login                              | 24 h                                   | expiram; apagadas com a conta                                          |
| `access_log`                                  | 183 dias (`ACCESS_LOG_RETENTION_DAYS`) | `purgeExpiredAccessLogs()` em `src/server/access-log.ts`, a cada login |
| Backups do Neon                               | janela de restauração do plano Neon    | sobrescritos automaticamente pelo provedor                             |
| Cookies/localStorage                          | até 1 ano                              | expiram no navegador                                                   |

Pedidos de eliminação por e-mail: atender em até 15 dias, removendo a conta pelo banco se o titular não conseguir acessar `/conta`. O `access_log` é mantido até o fim do prazo legal (LGPD art. 16, I).
