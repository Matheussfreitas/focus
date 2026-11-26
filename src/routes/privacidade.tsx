import { createFileRoute, Link } from '@tanstack/react-router'
import { LegalPage } from '#/components/legal/LegalPage.tsx'
import {
  ACCESS_LOG_RETENTION_DAYS,
  CONTACT_EMAIL,
  CONTROLLER_NAME,
  PRIVACY_VERSION,
} from '#/lib/legal.ts'

export const Route = createFileRoute('/privacidade')({
  head: () => ({ meta: [{ title: 'Política de Privacidade · Focus' }] }),
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <LegalPage title="Política de Privacidade" version={PRIVACY_VERSION}>
      <p>
        Esta política explica quais dados pessoais o Focus coleta, por que, por
        quanto tempo e quais são os seus direitos, conforme a Lei Geral de
        Proteção de Dados (Lei 13.709/2018 — LGPD) e o Marco Civil da Internet
        (Lei 12.965/2014).
      </p>

      <h2>1. Quem é o responsável</h2>
      <p>
        O Focus é um projeto pessoal mantido por{' '}
        <strong>{CONTROLLER_NAME}</strong> (pessoa física), controlador dos
        dados tratados aqui. Contato para qualquer assunto de privacidade,
        inclusive o exercício dos seus direitos:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>2. Dados coletados e para quê</h2>
      <table>
        <thead>
          <tr>
            <th>Dado</th>
            <th>Finalidade</th>
            <th>Base legal (LGPD art. 7º)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Nome, e-mail e senha (guardada só como hash bcrypt)</td>
            <td>Criar e acessar sua conta</td>
            <td>Execução de contrato (inciso V)</td>
          </tr>
          <tr>
            <td>Tarefas, tags e sessões de foco que você cria</td>
            <td>Prestar o serviço (kanban, pomodoro, dashboard)</td>
            <td>Execução de contrato (inciso V)</td>
          </tr>
          <tr>
            <td>Endereço IP, navegador (user agent), data e hora de acesso</td>
            <td>
              Manter a sessão segura e cumprir a guarda de registros de acesso
            </td>
            <td>
              Cumprimento de obrigação legal (inciso II, Marco Civil art. 15) e
              legítimo interesse em segurança (inciso IX)
            </td>
          </tr>
          <tr>
            <td>Data, hora e versão dos Termos e desta Política aceitos</td>
            <td>Comprovar o aceite</td>
            <td>
              Execução de contrato e exercício regular de direitos (inciso VI)
            </td>
          </tr>
          <tr>
            <td>Preferências (tema, paleta, layout, filtros)</td>
            <td>Lembrar como você prefere ver a aplicação</td>
            <td>Legítimo interesse (inciso IX), a pedido do próprio usuário</td>
          </tr>
        </tbody>
      </table>
      <p>
        Não usamos ferramentas de analytics ou publicidade, não vendemos dados e
        não enviamos e-mails de marketing. Não coletamos dados sensíveis. O
        serviço não é destinado a menores de 18 anos.
      </p>

      <h2>3. Com quem os dados são compartilhados</h2>
      <p>Apenas com os operadores necessários para o serviço funcionar:</p>
      <ul>
        <li>
          <strong>Vercel Inc.</strong> — hospedagem da aplicação.
        </li>
        <li>
          <strong>Neon</strong> — banco de dados PostgreSQL (AWS, região
          us-east-2).
        </li>
      </ul>
      <p>
        Esses fornecedores armazenam dados em servidores nos Estados Unidos, o
        que caracteriza transferência internacional (LGPD art. 33). Ela é
        amparada pelas cláusulas contratuais de proteção de dados desses
        fornecedores. Dados também podem ser fornecidos a autoridades mediante
        ordem judicial ou requisição legal.
      </p>

      <h2>4. Por quanto tempo guardamos</h2>
      <ul>
        <li>
          <strong>Dados da conta e conteúdo:</strong> enquanto a conta existir.
          Ao excluir a conta, são apagados imediatamente.
        </li>
        <li>
          <strong>Sessões de login:</strong> expiram em 24 horas.
        </li>
        <li>
          <strong>Registros de acesso (IP, data e hora):</strong>{' '}
          {ACCESS_LOG_RETENTION_DAYS} dias (6 meses), mesmo após a exclusão da
          conta, por obrigação legal. Depois disso são apagados automaticamente.
        </li>
        <li>
          <strong>Backups do provedor de banco:</strong> conforme a janela de
          retenção do provedor, após a qual são sobrescritos.
        </li>
      </ul>

      <h2>5. Seus direitos (LGPD art. 18)</h2>
      <p>Você pode, a qualquer momento:</p>
      <ul>
        <li>confirmar a existência de tratamento e acessar seus dados;</li>
        <li>corrigir dados incompletos, inexatos ou desatualizados;</li>
        <li>
          pedir anonimização, bloqueio ou eliminação de dados desnecessários;
        </li>
        <li>obter a portabilidade dos seus dados;</li>
        <li>eliminar seus dados e a conta;</li>
        <li>saber com quem seus dados são compartilhados;</li>
        <li>revogar consentimento e se opor a tratamentos.</li>
      </ul>
      <p>
        Na página <Link to="/conta">Minha conta</Link> você baixa todos os seus
        dados (JSON) e exclui a conta sozinho. Para os demais pedidos, escreva
        para <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
        respondemos em até 15 dias. Você também pode reclamar à Autoridade
        Nacional de Proteção de Dados (ANPD).
      </p>

      <h2>6. Segurança</h2>
      <p>
        Todo o tráfego usa HTTPS. Senhas são guardadas apenas como hash bcrypt.
        O banco é criptografado em repouso pelo provedor e o acesso a ele é
        restrito. Em caso de incidente de segurança que possa causar risco ou
        dano relevante, comunicaremos a ANPD e os titulares afetados no prazo
        legal.
      </p>

      <h2 id="cookies">7. Cookies e armazenamento local</h2>
      <p>
        O Focus usa apenas cookies próprios, essenciais ou de preferência. Não
        há cookies de terceiros, de analytics ou de publicidade, por isso eles
        não dependem de consentimento; você pode apagá-los nas configurações do
        navegador, mas o login deixará de funcionar.
      </p>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Para quê</th>
            <th>Duração</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>better-auth.session_token, better-auth.session_data</td>
            <td>Essencial</td>
            <td>Manter você logado</td>
            <td>24 horas</td>
          </tr>
          <tr>
            <td>layout, palette, done-range, todo-sort</td>
            <td>Preferência</td>
            <td>Lembrar layout, paleta e filtros escolhidos</td>
            <td>1 ano</td>
          </tr>
          <tr>
            <td>cookie-notice</td>
            <td>Essencial</td>
            <td>Lembrar que você já viu o aviso de cookies</td>
            <td>1 ano</td>
          </tr>
        </tbody>
      </table>
      <p>
        No armazenamento local do navegador (localStorage) guardamos: o tema
        claro/escuro, o estado do timer flutuante e se o tour guiado já foi
        visto. Esses dados não saem do seu navegador.
      </p>

      <h2>8. Mudanças nesta política</h2>
      <p>
        Quando esta política mudar, a versão no topo será atualizada e pediremos
        um novo aceite no próximo acesso.
      </p>
    </LegalPage>
  )
}
