# Consentimento de Termos

- O painel global é exibido quando a versão `2026-08-16` ainda não foi aceita neste navegador.
- Termos e Privacidade permanecem acessíveis sem aceite e nunca exibem o próprio painel de consentimento.
- O componente é um rail/painel compacto inserido no fluxo da página logo após o header. Ele não sobrepõe conteúdo, controles ou ações.
- Não é modal fullscreen e não usa `aria-modal`, contenção de foco, overlay ou bloqueio de rolagem.
- O visitante pode navegar e ler o produto antes de aceitar.
- Executar uma calculadora exige ação explícita de aceite enquanto a versão atual não estiver registrada.
- Se o usuário tentar calcular antes do aceite, a ação é interrompida, uma mensagem é anunciada em `aria-live` e o foco retorna para `Aceitar e continuar`.
- Não existe aceite implícito, botão pré-marcado ou fechamento silencioso.
- O aceite é armazenado localmente e contém apenas a versão aceita; valores digitados nas calculadoras não fazem parte desse registro.
- Uma nova versão relevante deve usar uma nova chave de versão para solicitar novo aceite.
