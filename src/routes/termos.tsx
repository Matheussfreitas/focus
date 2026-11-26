import { createFileRoute, Link } from '@tanstack/react-router'
import { LegalPage } from '#/components/legal/LegalPage.tsx'
import { CONTACT_EMAIL, CONTROLLER_NAME, TERMS_VERSION } from '#/lib/legal.ts'

export const Route = createFileRoute('/termos')({
  head: () => ({ meta: [{ title: 'Termos de Uso · Focus' }] }),
  component: TermsPage,
})

function TermsPage() {
  return (
    <LegalPage title="Termos de Uso" version={TERMS_VERSION}>
      <p>
        Estes termos regem o uso do Focus, aplicação web de produtividade
        (kanban, timer pomodoro e dashboard) mantida por {CONTROLLER_NAME}{' '}
        (pessoa física). Ao criar uma conta você declara ter lido e aceito estes
        termos e a <Link to="/privacidade">Política de Privacidade</Link>.
      </p>

      <h2>1. O serviço</h2>
      <p>
        O Focus é oferecido gratuitamente, &quot;no estado em que se
        encontra&quot;. Funcionalidades podem ser alteradas, suspensas ou
        encerradas a qualquer momento, com aviso prévio razoável sempre que
        possível.
      </p>

      <h2>2. Conta</h2>
      <ul>
        <li>Você precisa ter 18 anos ou mais para criar uma conta.</li>
        <li>Informe dados verdadeiros e mantenha sua senha em sigilo.</li>
        <li>Você é responsável pelas atividades realizadas na sua conta.</li>
        <li>
          Você pode excluir a conta a qualquer momento em{' '}
          <Link to="/conta">Minha conta</Link>.
        </li>
      </ul>

      <h2>3. Uso aceitável</h2>
      <p>Não é permitido:</p>
      <ul>
        <li>usar o serviço para fins ilícitos;</li>
        <li>tentar acessar contas ou dados de outras pessoas;</li>
        <li>
          sobrecarregar, atacar ou tentar contornar mecanismos de segurança da
          aplicação;
        </li>
        <li>automatizar cadastros ou acessos de forma abusiva.</li>
      </ul>
      <p>O descumprimento pode levar à suspensão ou exclusão da conta.</p>

      <h2>4. Seu conteúdo</h2>
      <p>
        Tarefas, tags e demais conteúdos que você cria continuam sendo seus.
        Você nos autoriza apenas a armazená-los e processá-los para prestar o
        serviço. Você pode exportá-los a qualquer momento.
      </p>

      <h2>5. Responsabilidade</h2>
      <p>
        Empregamos esforços razoáveis para manter o serviço disponível e seguro,
        mas não garantimos funcionamento ininterrupto ou livre de erros.
        Mantenha cópias do que for importante para você. Na máxima extensão
        permitida pela lei, não respondemos por danos indiretos decorrentes do
        uso ou da indisponibilidade do serviço gratuito.
      </p>

      <h2>6. Alterações</h2>
      <p>
        Estes termos podem ser atualizados. A versão vigente fica no topo desta
        página e, quando houver mudança, pediremos um novo aceite no próximo
        acesso.
      </p>

      <h2>7. Lei e foro</h2>
      <p>
        Aplica-se a lei brasileira. Fica eleito o foro do domicílio do usuário
        para resolver qualquer controvérsia.
      </p>

      <h2>8. Contato</h2>
      <p>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </LegalPage>
  )
}
