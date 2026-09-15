# Consentimento de Termos

- O painel global é exibido quando a versão `2026-08-16` ainda não foi aceita neste navegador.
- Termos e Privacidade permanecem acessíveis sem aceite e nunca exibem o próprio painel de consentimento.
- O componente é um painel fixo compacto, não um modal fullscreen.
- Usa `role="region"`, título e descrição associados; não usa `aria-modal`, contenção de foco nem bloqueio de rolagem.
- O visitante pode navegar e ler o produto antes de aceitar.
- Executar uma calculadora exige ação explícita de aceite enquanto a versão atual não estiver registrada.
- Se o usuário tentar calcular antes do aceite, a ação é interrompida, uma mensagem é anunciada em `aria-live` e o foco vai para `Aceitar e continuar`.
- Não existe aceite implícito, botão pré-marcado ou fechamento silencioso.
- O aceite é armazenado localmente e contém apenas a versão aceita; valores digitados nas calculadoras não fazem parte desse registro.
- Uma nova versão relevante deve usar uma nova chave de versão para solicitar novo aceite.
