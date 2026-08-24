from pathlib import Path
import re
import sys
from html import escape

ROOT = Path(__file__).resolve().parents[1]
TODAY = '2026-08-24'
REVIEW_LABEL = 'Revisado em 24 de agosto de 2026'

AD_BLOCK = re.compile(r'<aside\b[^>]*class=["\'][^"\']*\bad\b[^"\']*["\'][^>]*>.*?</aside>', re.I | re.S)

DYNAMIC = {
    'salario-liquido': {
        'title':'Salário líquido 2026',
        'purpose':'Estimar quanto do salário bruto permanece disponível depois das retenções e dos descontos informados.',
        'use':'Use quando quiser comparar uma proposta CLT, entender a diferença entre bruto e líquido ou conferir a ordem de grandeza de um holerite.',
        'method':'A estimativa parte do salário bruto, calcula a contribuição previdenciária de forma progressiva, estima o IRRF mensal conforme as regras usadas pelo QuantoLab e subtrai outros descontos informados por você.',
        'example':'Se duas propostas têm salários brutos próximos, a comparação pelo líquido ajuda a enxergar a renda mensal disponível. Benefícios e remunerações variáveis devem ser avaliados separadamente.',
        'limits':'O holerite real pode incluir adicionais, faltas, pensão, coparticipações, benefícios, convenções coletivas e ajustes de folha que não estão automaticamente reproduzidos na ferramenta.',
        'faq': [('O resultado substitui o holerite?', 'Não. Ele é uma estimativa para planejamento e comparação. O documento da folha continua sendo a referência do pagamento realizado.'), ('Por que o líquido não é simplesmente o bruto menos uma porcentagem?', 'Porque contribuições e imposto podem usar bases, faixas e deduções diferentes. A ferramenta organiza essas etapas separadamente.')],
        'guide':'salario-liquido-2026'
    },
    'ferias': {
        'title':'Férias 2026',
        'purpose':'Estimar a remuneração de férias a partir do salário e das escolhas informadas, incluindo o adicional constitucional de um terço.',
        'use':'Use para planejar o recebimento de férias, testar a venda de dias quando aplicável e entender a composição antes do período de descanso.',
        'method':'A ferramenta calcula a remuneração correspondente aos dias de férias informados, acrescenta o terço constitucional e considera as opções disponíveis no formulário.',
        'example':'Uma pessoa pode usar a estimativa para separar o que é remuneração do período de descanso do valor adicional de um terço e evitar tratar todo o recebimento como renda extra recorrente.',
        'limits':'Médias de horas extras, comissões, adicionais, descontos, férias coletivas e situações contratuais específicas podem alterar a folha real.',
        'faq': [('O adicional de um terço está incluído?', 'Sim, quando aplicável ao cenário informado. A composição aparece no detalhamento do resultado.'), ('A venda de férias é sempre possível?', 'Não necessariamente. A ferramenta simula a opção quando informada, mas a aplicação depende das regras e do caso concreto.')],
        'guide':'ferias-2026'
    },
    'decimo-terceiro': {
        'title':'13º salário 2026',
        'purpose':'Estimar o décimo terceiro proporcional aos meses elegíveis e visualizar a referência por parcela.',
        'use':'Use para planejamento anual, comparação de propostas e organização de despesas de fim de ano.',
        'method':'A referência bruta é proporcional aos meses elegíveis informados. O motor considera a regra de mês elegível usada na metodologia do QuantoLab e apresenta a composição disponível.',
        'example':'Quem começou a trabalhar durante o ano pode comparar o valor de doze meses com o valor proporcional ao período efetivamente elegível.',
        'limits':'Médias de remuneração variável, afastamentos, ajustes de folha e eventos específicos podem mudar o valor final pago pelo empregador.',
        'faq': [('Quem trabalhou menos de doze meses recebe valor proporcional?', 'Em geral, a referência é proporcional aos meses elegíveis. Informe o período correto para obter a estimativa.'), ('O cálculo mostra exatamente cada parcela?', 'Ele oferece uma referência de planejamento. A folha real pode aplicar retenções e ajustes em momentos diferentes.')],
        'guide':'decimo-terceiro-2026'
    },
    'fgts': {
        'title':'FGTS 2026',
        'purpose':'Estimar depósitos de FGTS a partir da remuneração informada e visualizar uma referência acumulada.',
        'use':'Use para conferir a ordem de grandeza dos depósitos mensais ou apoiar uma análise de rescisão e planejamento profissional.',
        'method':'Para vínculo CLT comum, a ferramenta usa a alíquota geral documentada na metodologia e aplica a referência sobre as bases escolhidas pelo usuário.',
        'example':'A estimativa ajuda a distinguir salário líquido de depósito fundiário: o FGTS não é um desconto retirado do líquido do trabalhador.',
        'limits':'O saldo oficial depende dos depósitos efetivamente realizados, atualização da conta, saques, vínculos e eventos registrados. Consulte o extrato oficial para valores reais.',
        'faq': [('FGTS é descontado do salário líquido?', 'Não. A referência calculada representa depósito do empregador para a conta vinculada, e não desconto direto do salário líquido.'), ('O valor calculado é igual ao saldo do aplicativo FGTS?', 'Não necessariamente. O saldo oficial inclui histórico de depósitos, atualização e movimentações que a calculadora não conhece.')],
        'guide':'fgts-e-rescisao'
    },
    'seguro-desemprego': {
        'title':'Seguro desemprego 2026',
        'purpose':'Estimar valor de parcela e quantidade potencial de parcelas a partir das informações fornecidas.',
        'use':'Use como referência inicial depois de um desligamento, antes de conferir a elegibilidade nos canais oficiais.',
        'method':'A ferramenta usa a média salarial informada, as faixas de 2026 documentadas na metodologia e o histórico de solicitações para construir uma estimativa.',
        'example':'Duas pessoas com a mesma média salarial podem ter cenários diferentes se o tempo de trabalho e o histórico de solicitações forem diferentes.',
        'limits':'A calculadora não decide elegibilidade. Requisitos, vínculos, prazos, impedimentos e dados governamentais precisam ser confirmados no atendimento oficial.',
        'faq': [('A calculadora confirma que tenho direito?', 'Não. Ela estima um cenário financeiro. A concessão depende da análise oficial dos requisitos.'), ('Qual salário devo informar?', 'Use os valores pedidos pelo formulário conforme sua documentação. A ferramenta calcula a média necessária a partir deles quando previsto.')],
        'guide':'rescisao-clt-2026'
    },
    'hora-extra': {
        'title':'Hora extra 2026',
        'purpose':'Transformar salário e jornada em valor de hora e aplicar adicionais de horas extras informados.',
        'use':'Use para conferir uma estimativa de horas adicionais, comparar escalas ou entender como o adicional altera o valor da hora.',
        'method':'A conta deriva o valor da hora normal pelo divisor informado e aplica o percentual de adicional correspondente às horas registradas.',
        'example':'A mesma quantidade de horas extras pode gerar valores diferentes quando salário, divisor ou percentual de adicional mudam.',
        'limits':'Reflexos em descanso semanal, férias, décimo terceiro, FGTS, adicional noturno e regras de convenção coletiva não são automaticamente presumidos quando não aparecem no formulário.',
        'faq': [('O divisor de horas é sempre o mesmo?', 'Não. O divisor depende da jornada e do contexto. Por isso a ferramenta expõe a referência usada e permite ajuste quando previsto.'), ('A ferramenta inclui todos os reflexos trabalhistas?', 'Não. O resultado principal foca a hora extra informada e explicita os limites da estimativa.')],
        'guide':'salario-liquido-2026'
    },
    'inss': {
        'title':'INSS 2026',
        'purpose':'Estimar a contribuição previdenciária mensal conforme a modalidade disponível na ferramenta.',
        'use':'Use para entender a contribuição progressiva e apoiar cálculos de salário líquido ou pró labore.',
        'method':'Para empregado, o motor aplica as faixas progressivas usadas na metodologia, de modo que cada faixa incide apenas sobre a parcela correspondente da base.',
        'example':'Uma remuneração que ultrapassa uma faixa não faz toda a base passar a usar a alíquota da faixa seguinte. A progressividade é aplicada por parcelas.',
        'limits':'Outras categorias de segurado, vínculos simultâneos, teto, ajustes e competências específicas podem exigir tratamento diferente do cenário simplificado.',
        'faq': [('A maior alíquota incide sobre todo o salário?', 'Não no modelo progressivo usado para empregado. Cada faixa incide sobre sua parcela da base.'), ('Posso usar o resultado para recolher contribuição?', 'Use como estimativa. Para recolhimento ou regularização, confirme a categoria e a competência nos canais oficiais.')],
        'guide':'salario-liquido-2026'
    },
    'irrf': {
        'title':'IRRF 2026',
        'purpose':'Estimar a retenção mensal do imposto de renda a partir da base e das deduções informadas.',
        'use':'Use para compreender o impacto do IRRF no salário líquido e testar como dependentes ou deduções disponíveis alteram a estimativa.',
        'method':'O motor calcula a base mensal, compara as alternativas de dedução previstas na metodologia do QuantoLab e aplica a tabela e a redução de 2026 quando cabíveis.',
        'example':'A retenção mensal pode ser zero em um cenário e positiva em outro mesmo com salários próximos, porque base tributável e deduções também influenciam a conta.',
        'limits':'Retenção na fonte não é a mesma coisa que imposto anual definitivo. Outras rendas, despesas dedutíveis, ajuste anual e situações pessoais não estão integralmente representados.',
        'faq': [('IRRF mensal é igual ao imposto da declaração anual?', 'Não. A retenção é uma antecipação mensal. O ajuste anual considera um conjunto mais amplo de informações.'), ('A ferramenta escolhe a dedução mais favorável?', 'Ela compara as alternativas previstas no modelo implementado e mostra a estimativa correspondente, conforme a metodologia publicada.')],
        'guide':'salario-liquido-2026'
    },
    'pj-clt-equivalente': {
        'title':'PJ para CLT equivalente',
        'purpose':'Converter uma renda PJ em uma referência anual comparável a um pacote CLT.',
        'use':'Use quando quiser entender quanto uma renda PJ representa ao considerar componentes anuais que não aparecem no salário mensal CLT.',
        'method':'A ferramenta organiza a renda anual PJ e a compara com uma referência de pacote CLT composta pelos itens descritos na metodologia, como salário, décimo terceiro, férias e FGTS.',
        'example':'Uma proposta PJ mensal maior pode não manter a mesma diferença quando o cálculo passa para a visão anual e inclui períodos sem faturamento, tributos e custos.',
        'limits':'Equivalência financeira não significa equivalência jurídica, de estabilidade, benefícios, risco, rotina ou proteção social.',
        'faq': [('Um valor equivalente significa que CLT e PJ são iguais?', 'Não. O cálculo compara dinheiro e componentes selecionados. Os modelos de contratação continuam diferentes.'), ('Devo comparar pelo mês ou pelo ano?', 'A visão anual costuma revelar componentes que não aparecem todo mês e é a base mais útil para a comparação proposta pela ferramenta.')],
        'guide':'clt-ou-pj'
    },
    'impostos-pj': {
        'title':'Impostos PJ',
        'purpose':'Estimar quanto do faturamento permanece depois da alíquota efetiva e dos custos recorrentes informados.',
        'use':'Use para transformar faturamento bruto em uma referência mais realista de disponibilidade financeira da pessoa jurídica.',
        'method':'O QuantoLab não presume regime tributário. Você informa a alíquota efetiva e os custos que deseja considerar, e a ferramenta aplica esses parâmetros ao faturamento.',
        'example':'Duas empresas com o mesmo faturamento podem ter disponibilidades diferentes quando alíquota efetiva, contador, ferramentas e outros custos mudam.',
        'limits':'Regime tributário, anexo, fator R, retenções, município, atividade, créditos e obrigações acessórias exigem análise contábil específica.',
        'faq': [('A ferramenta escolhe meu regime tributário?', 'Não. A alíquota é informada por você justamente para evitar inferir um enquadramento que pode estar errado.'), ('Posso usar o resultado como apuração fiscal?', 'Não. Ele serve para planejamento e comparação. A apuração deve seguir sua escrituração e orientação contábil.')],
        'guide':'mei-e-custos-pj'
    },
    'mei-das': {
        'title':'DAS MEI 2026',
        'purpose':'Consultar uma referência mensal do DAS MEI conforme a atividade selecionada.',
        'use':'Use para planejamento de custo fixo do MEI e para diferenciar as referências de comércio, serviço e atividades combinadas.',
        'method':'A ferramenta usa os valores de referência de 2026 documentados na metodologia e seleciona a composição conforme a atividade escolhida.',
        'example':'Quem presta serviço e quem atua no comércio pode ter referências mensais diferentes porque a composição do documento varia pela atividade.',
        'limits':'Enquadramento, débitos, parcelamentos, excesso de receita, desenquadramento e obrigações específicas devem ser verificados no Portal do Empreendedor e com apoio contábil quando necessário.',
        'faq': [('O valor do DAS é igual para toda atividade?', 'Não. A composição pode variar. Escolha a atividade correspondente ao cenário que deseja consultar.'), ('A calculadora emite o DAS?', 'Não. Ela apenas apresenta uma referência. A emissão e a situação fiscal devem ser conferidas nos canais oficiais.')],
        'guide':'mei-e-custos-pj'
    },
    'pro-labore': {
        'title':'Pró labore',
        'purpose':'Estimar o valor líquido de um pró labore depois das retenções consideradas pelo modelo.',
        'use':'Use para separar remuneração do sócio de faturamento da empresa e planejar o caixa pessoal e empresarial.',
        'method':'A ferramenta parte do pró labore bruto, estima a contribuição previdenciária e o IRRF aplicáveis no modelo implementado e mostra o líquido de referência.',
        'example':'Faturar dez mil reais não significa receber dez mil reais como pró labore. São grandezas diferentes e devem ser planejadas separadamente.',
        'limits':'Encargos da empresa, distribuição de lucros, regime tributário, escrituração e demais obrigações não são resolvidos por esta simulação.',
        'faq': [('Pró labore é igual ao faturamento da empresa?', 'Não. Faturamento é receita da pessoa jurídica; pró labore é remuneração do sócio pelo trabalho.'), ('A ferramenta calcula distribuição de lucros?', 'Não. Ela foca o pró labore e suas retenções estimadas.')],
        'guide':'mei-e-custos-pj'
    },
    'custo-funcionario': {
        'title':'Custo de funcionário',
        'purpose':'Organizar salário, benefícios, provisões e encargos informados em uma estimativa de custo mensal.',
        'use':'Use para orçamento de contratação, formação de preço ou comparação entre crescimento de equipe e outras alternativas operacionais.',
        'method':'A ferramenta soma o salário e os componentes informados e aplica as taxas configuradas pelo usuário, sem presumir automaticamente o enquadramento da empresa.',
        'example':'O salário contratado é apenas uma parte do custo. Benefícios, provisões e encargos podem alterar a necessidade de caixa mensal.',
        'limits':'Convenções, benefícios específicos, RAT, terceiros, regime tributário, afastamentos e particularidades da folha podem modificar o custo real.',
        'faq': [('O resultado é o custo contábil exato?', 'Não. Ele é uma estimativa configurável para planejamento.'), ('Por que algumas taxas são editáveis?', 'Porque o custo patronal depende do enquadramento e do contexto da empresa. Deixar a premissa visível é mais seguro do que assumir uma taxa universal.')],
        'guide':'mei-e-custos-pj'
    },
    'clientes-necessarios': {
        'title':'Clientes necessários',
        'purpose':'Converter uma meta de faturamento em quantidade mínima de clientes a partir do ticket médio.',
        'use':'Use para testar se sua meta comercial cabe na capacidade disponível e decidir se precisa elevar ticket, volume ou ambos.',
        'method':'A meta mensal é dividida pelo ticket médio e a quantidade é arredondada para cima, porque uma fração de cliente não resolve a meta inteira.',
        'example':'Se a quantidade necessária ultrapassa sua capacidade de atendimento, o problema não é só vender mais. Pode ser necessário revisar preço, escopo ou produtividade.',
        'limits':'A conta não prevê churn, sazonalidade, inadimplência, descontos, aquisição de clientes ou capacidade operacional além do que você analisa separadamente.',
        'faq': [('Por que a quantidade é arredondada para cima?', 'Porque atingir a meta exige clientes inteiros. Arredondar para baixo deixaria parte do faturamento sem cobertura.'), ('Ticket médio maior sempre é melhor?', 'Não isoladamente. Preço, proposta de valor, capacidade e mercado precisam permanecer coerentes.')],
        'guide':'valor-hora-e-preco'
    },
    'margem-lucro': {
        'title':'Margem de lucro',
        'purpose':'Separar receita, custos, lucro em reais e margem percentual.',
        'use':'Use para entender quanto de uma venda ou projeto realmente permanece depois dos custos considerados.',
        'method':'A ferramenta subtrai os custos da receita para obter lucro e divide o lucro pela receita para calcular a margem percentual.',
        'example':'Dois projetos podem gerar o mesmo faturamento e margens diferentes se um exigir mais horas, fornecedores ou despesas.',
        'limits':'Custos indiretos, impostos, pró labore, aquisição de clientes e despesas compartilhadas precisam ser incluídos quando forem relevantes ao cenário.',
        'faq': [('Lucro e margem são a mesma coisa?', 'Não. Lucro é um valor em reais; margem mostra esse lucro como proporção da receita.'), ('Uma margem positiva garante um bom negócio?', 'Não sozinha. Prazo, risco, capacidade e custo de oportunidade também influenciam a decisão.')],
        'guide':'valor-hora-e-preco'
    },
    'renda-anual': {
        'title':'Renda anual',
        'purpose':'Transformar renda mensal, meses recebidos, décimo terceiro e bônus informados em uma visão anual.',
        'use':'Use para comparar propostas que têm estruturas mensais diferentes ou para planejar metas anuais de renda.',
        'method':'A ferramenta soma os componentes informados no período e apresenta uma referência anual, evitando comparar apenas um mês isolado.',
        'example':'Uma proposta com salário mensal menor pode ter pacote anual mais competitivo quando existem pagamentos adicionais relevantes, e o inverso também pode ocorrer.',
        'limits':'Benefícios não monetários, impostos, reajustes, variáveis incertas e eventos futuros não informados ficam fora da projeção.',
        'faq': [('Por que comparar renda anual?', 'Porque pagamentos que não ocorrem todo mês podem alterar a comparação entre propostas.'), ('Bônus esperado deve ser tratado como garantido?', 'Não. Se o bônus é incerto, teste cenários com e sem ele.')],
        'guide':'clt-ou-pj'
    },
    'faturamento-anual': {
        'title':'Faturamento anual',
        'purpose':'Projetar receita bruta anual e disponibilidade estimada depois de impostos e custos informados.',
        'use':'Use para orçamento de um negócio, planejamento de meta e comparação entre meses ativos e períodos sem faturamento.',
        'method':'A ferramenta multiplica a receita mensal pelos meses ativos e aplica os percentuais e custos informados para organizar uma visão anual.',
        'example':'Planejar doze meses de custos com apenas dez ou onze meses faturáveis pode revelar uma meta mensal maior do que a média anual simples sugeriria.',
        'limits':'Sazonalidade, inadimplência, crescimento, custos variáveis e mudanças tributárias não são previstos automaticamente.',
        'faq': [('Faturamento é a mesma coisa que renda disponível?', 'Não. Faturamento é receita bruta do negócio. Custos, tributos e retiradas precisam ser considerados separadamente.'), ('Preciso usar doze meses ativos?', 'Não. Informe um cenário coerente com sua operação e períodos efetivamente faturáveis.')],
        'guide':'valor-hora-e-preco'
    },
    'reserva-emergencia': {
        'title':'Reserva de emergência',
        'purpose':'Converter gastos essenciais mensais em uma meta de reserva para determinada quantidade de meses.',
        'use':'Use para definir um número objetivo antes de escolher onde manter a reserva ou como distribuir aportes.',
        'method':'A meta é o gasto essencial mensal multiplicado pela quantidade de meses escolhida. A ferramenta também pode mostrar o caminho até a meta conforme os aportes informados.',
        'example':'Uma pessoa com renda variável pode testar uma quantidade maior de meses e comparar o esforço de poupança necessário antes de assumir novas obrigações.',
        'limits':'O número ideal de meses depende de estabilidade de renda, dependentes, seguros, acesso a crédito e tolerância a risco. A ferramenta não prescreve uma quantidade universal.',
        'faq': [('Existe uma quantidade de meses correta para todo mundo?', 'Não. A reserva precisa refletir o risco e as despesas essenciais do contexto de cada pessoa.'), ('Devo incluir todos os gastos mensais?', 'O foco é começar pelos gastos essenciais que precisariam continuar sendo pagos em uma emergência.')],
        'guide':'reserva-de-emergencia'
    },
    'juros-compostos': {
        'title':'Juros compostos',
        'purpose':'Projetar a evolução de um valor inicial e de aportes recorrentes ao longo do tempo.',
        'use':'Use para visualizar o efeito combinado de prazo, taxa e aportes em metas de médio e longo prazo.',
        'method':'A taxa anual informada é convertida para uma taxa mensal equivalente no modelo e os rendimentos são incorporados ao saldo a cada período da simulação.',
        'example':'Aumentar o prazo ou o aporte pode ter efeito tão importante quanto aumentar a taxa. Testar cenários ajuda a separar o que está sob seu controle do que é apenas hipótese.',
        'limits':'É uma projeção matemática. Rentabilidade de mercado, impostos, taxas, inflação e volatilidade podem fazer o resultado real divergir bastante.',
        'faq': [('A taxa informada é uma previsão?', 'Não. É uma hipótese de simulação.'), ('Por que o crescimento acelera com o tempo?', 'Porque rendimentos passam a incidir também sobre rendimentos acumulados, além dos aportes e do valor inicial.')],
        'guide':'juros-compostos'
    },
    'rendimento-cdi': {
        'title':'Rendimento CDI',
        'purpose':'Simular um investimento que rende um percentual do CDI usando uma taxa de referência informada.',
        'use':'Use para comparar produtos atrelados ao CDI sob a mesma hipótese de taxa e prazo.',
        'method':'Você informa o CDI de referência e o percentual do CDI do produto. A ferramenta transforma esses parâmetros em uma taxa de simulação e projeta o saldo.',
        'example':'Dois produtos que pagam percentuais diferentes do CDI podem ser comparados com o mesmo valor e prazo antes de considerar liquidez, imposto e risco.',
        'limits':'O CDI muda ao longo do tempo e não é consultado em tempo real. A simulação também não substitui a análise de tributação, garantia, emissor e liquidez.',
        'faq': [('O CDI mostrado é atualizado automaticamente?', 'Não. A taxa fica editável justamente para você usar a referência que deseja avaliar.'), ('Maior percentual do CDI significa sempre melhor investimento?', 'Não. Liquidez, risco, imposto, prazo e condições do produto também importam.')],
        'guide':'juros-compostos'
    },
    'comparar-investimentos': {
        'title':'Comparar investimentos',
        'purpose':'Colocar dois cenários de rentabilidade lado a lado usando a mesma base de valor e prazo.',
        'use':'Use para entender o impacto matemático de taxas diferentes antes de comparar características qualitativas dos produtos.',
        'method':'Os dois cenários usam a mesma base de capital e prazo. A ferramenta aplica cada taxa e destaca a diferença estimada ao final.',
        'example':'Uma diferença pequena de taxa pode parecer irrelevante no curto prazo e ganhar peso em prazos longos. A simulação ajuda a quantificar essa diferença.',
        'limits':'Risco, liquidez, imposto, taxas, garantias, volatilidade e qualidade do emissor não cabem em uma comparação baseada apenas em rentabilidade.',
        'faq': [('A ferramenta indica qual investimento devo escolher?', 'Não. Ela compara cenários matemáticos, não recomenda produtos.'), ('Posso comparar taxas com bases diferentes?', 'Para uma comparação coerente, normalize as taxas para a mesma base e confirme as condições de cada produto.')],
        'guide':'juros-compostos'
    },
    'metas-financeiras': {
        'title':'Meta financeira',
        'purpose':'Estimar quanto tempo uma combinação de saldo inicial, aporte e rentabilidade levaria para alcançar uma meta.',
        'use':'Use para transformar um objetivo abstrato em prazo, aporte e hipótese de retorno que possam ser ajustados.',
        'method':'A simulação evolui o saldo por períodos sucessivos, acrescentando os aportes e a rentabilidade informada até atingir a meta.',
        'example':'Se o prazo estimado estiver muito longo, você pode testar um aporte maior ou uma meta diferente sem depender de uma rentabilidade irrealista.',
        'limits':'A rentabilidade é hipótese, não promessa. Impostos, inflação, variação de aportes e desempenho real podem alterar o prazo.',
        'faq': [('A data calculada é garantida?', 'Não. Ela depende integralmente das premissas usadas na simulação.'), ('Qual variável é mais segura para ajustar?', 'Aporte e meta estão mais sob seu controle do que a rentabilidade futura, que deve ser tratada como hipótese.')],
        'guide':'reserva-de-emergencia'
    },
    'inflacao': {
        'title':'Impacto da inflação',
        'purpose':'Visualizar como uma taxa anual hipotética reduz o poder de compra de um valor ao longo do tempo.',
        'use':'Use para não confundir crescimento nominal com ganho real em planejamento de longo prazo.',
        'method':'A ferramenta aplica a inflação anual informada ao horizonte escolhido para mostrar a equivalência aproximada de poder de compra.',
        'example':'Uma meta de longo prazo pode precisar ser maior em reais futuros para representar o mesmo padrão de consumo de hoje.',
        'limits':'A inflação futura é desconhecida e pode variar muito entre períodos e categorias de consumo. A taxa usada é cenário, não previsão.',
        'faq': [('A taxa de inflação é uma previsão do QuantoLab?', 'Não. É um parâmetro informado para simulação.'), ('Minha inflação pessoal pode ser diferente?', 'Sim. O padrão de consumo de cada pessoa pode variar em relação aos índices gerais.')],
        'guide':'juros-compostos'
    },
}

MANUAL = {
    'valor-hora': {
        'title':'Valor por hora', 'purpose':'Construir uma referência de cobrança que conecte renda desejada, custos, tempo disponível, impostos e margem.',
        'use':'Use antes de precificar projetos ou revisar uma tabela de serviços. O objetivo é descobrir o valor mínimo sustentável do seu tempo faturável.',
        'method':'A conta transforma a necessidade mensal em faturamento alvo e distribui esse valor pelas horas que podem realmente ser cobradas, em vez de tratar toda hora de trabalho como faturável.',
        'example':'Quem trabalha quarenta horas por semana pode ter muito menos horas faturáveis depois de considerar comercial, administração, estudo e comunicação. Ignorar essa diferença tende a subestimar o preço.',
        'limits':'O valor final de um projeto também depende de escopo, risco, propriedade intelectual, urgência, complexidade e valor gerado. A hora é uma referência, não uma tabela universal.',
        'faq':[('Devo cobrar todos os projetos por hora?', 'Não. A referência por hora pode ser usada internamente para formar preços fechados.'), ('Por que considerar tempo não faturável?', 'Porque atividades necessárias ao negócio consomem capacidade mesmo quando não aparecem na fatura ao cliente.')], 'guide':'valor-hora-e-preco'
    },
    'preco-projeto': {
        'title':'Preço de projeto', 'purpose':'Transformar horas estimadas, valor por hora, custos e reservas em uma referência de preço fechado.',
        'use':'Use depois de estimar escopo e esforço, principalmente quando o cliente precisa de um preço total em vez de cobrança horária.',
        'method':'A ferramenta parte do custo do tempo, acrescenta custos diretos e aplica as reservas ou fatores informados de forma visível no detalhamento.',
        'example':'Dois projetos de vinte horas podem ter preços diferentes se um exigir fornecedor, maior incerteza, mais revisões ou responsabilidade adicional.',
        'limits':'A precisão depende da qualidade da estimativa de escopo e horas. Mudanças de escopo devem ser tratadas no processo comercial, não escondidas dentro da margem.',
        'faq':[('Preço fechado elimina a necessidade de estimar horas?', 'Não. Mesmo quando o cliente não vê horas, estimar esforço ajuda a testar sustentabilidade.'), ('Devo incluir custos externos?', 'Sim quando fazem parte da entrega. A ferramenta permite separar custo de trabalho e outros componentes.')], 'guide':'valor-hora-e-preco'
    },
    'meta-faturamento': {
        'title':'Meta de faturamento', 'purpose':'Converter renda desejada, custos, impostos e reserva em uma meta mensal de faturamento.',
        'use':'Use para planejar capacidade comercial, quantidade de projetos e ticket necessário para sustentar o negócio.',
        'method':'A conta reconstrói o faturamento necessário a partir do que precisa sobrar depois dos custos e percentuais informados e distribui a meta entre projetos ou períodos.',
        'example':'Uma meta de renda pessoal não pode ser usada como meta de faturamento sem considerar custos e tributos. A ferramenta explicita essa diferença.',
        'limits':'Sazonalidade, inadimplência, meses sem faturamento e crescimento de custos exigem cenários adicionais além de uma média mensal.',
        'faq':[('Meta de faturamento é o mesmo que salário?', 'Não. Faturamento é receita bruta do negócio; a renda disponível vem depois dos itens considerados.'), ('Vale trabalhar com uma única meta?', 'É mais seguro testar cenários conservador, base e ambicioso quando a receita varia bastante.')], 'guide':'valor-hora-e-preco'
    },
    'comparador-profissional': {
        'title':'CLT x PJ', 'purpose':'Comparar uma proposta CLT com o valor PJ necessário para compensar componentes anuais e custos selecionados.',
        'use':'Use quando a decisão envolve trocar de modelo de contratação ou negociar uma proposta PJ a partir de um pacote CLT conhecido.',
        'method':'A ferramenta leva o cenário CLT para uma visão anual, considera os componentes exibidos no detalhamento e calcula o faturamento PJ necessário depois da alíquota e custos informados.',
        'example':'Comparar apenas R$ 8 mil CLT com R$ 10 mil PJ ignora componentes que não aparecem igualmente no mês. A visão anual reduz essa distorção.',
        'limits':'A conta não transforma direitos, estabilidade, risco de contratação, benefícios subjetivos, rotina, previdência e custo de oportunidade em uma única verdade financeira.',
        'faq':[('O maior valor mensal é sempre a melhor proposta?', 'Não. Compare o pacote anual e também fatores não financeiros.'), ('A ferramenta recomenda CLT ou PJ?', 'Não. Ela quantifica componentes para apoiar sua decisão, mas a escolha depende do contexto.')], 'guide':'clt-ou-pj'
    },
    'simulador': {
        'title':'Rescisão CLT', 'purpose':'Estimar as principais verbas de um desligamento a partir de salário, datas, motivo e opções do contrato.',
        'use':'Use para planejamento antes ou depois de uma rescisão e para entender quais componentes merecem conferência no termo oficial.',
        'method':'A ferramenta calcula os itens compatíveis com o cenário escolhido e organiza saldo de salário, férias, décimo terceiro, aviso e referências de FGTS quando aplicáveis ao modelo.',
        'example':'A mesma data de saída pode gerar resultados muito diferentes conforme o motivo do desligamento e o tratamento do aviso prévio.',
        'limits':'Acordos, estabilidade, convenção coletiva, adicionais, médias, faltas, descontos, decisões judiciais e histórico real de FGTS podem alterar o valor efetivo.',
        'faq':[('O resultado substitui o TRCT?', 'Não. Use a simulação para conferência inicial e compare com os documentos oficiais do desligamento.'), ('O saldo de FGTS calculado é oficial?', 'Não. O extrato oficial da conta vinculada é a referência para saldo e movimentações.')], 'guide':'rescisao-clt-2026'
    },
}

GUIDES = {
'salario-liquido-2026': ('Como entender seu salário líquido em 2026', 'Trabalho', [('Do bruto ao disponível', 'Salário bruto é o valor contratual antes das retenções. Salário líquido é o que permanece depois das contribuições, do imposto quando houver e dos demais descontos da folha. Comparar propostas apenas pelo bruto pode esconder diferenças relevantes no orçamento mensal.'),('Por que o cálculo acontece em etapas', 'INSS e IRRF não funcionam como uma única porcentagem aplicada ao salário inteiro. A contribuição previdenciária do empregado usa faixas progressivas e o imposto parte de uma base própria, com deduções e regras mensais. Por isso uma estimativa transparente precisa mostrar cada etapa separadamente.'),('O que conferir no holerite', 'Depois de simular, compare a base de INSS, a base de IRRF, dependentes, benefícios com desconto, pensão, faltas, adicionais e qualquer verba variável. Se o valor real divergir, procure primeiro qual componente mudou em vez de assumir que uma alíquota está errada.'),('Como usar a calculadora em uma proposta', 'Para uma decisão de carreira, use o líquido como uma das camadas. Compare também benefícios, décimo terceiro, férias, FGTS, bônus e estabilidade. O QuantoLab separa essas ferramentas porque misturar tudo em um único número pode dar uma falsa sensação de precisão.'),('Limites da estimativa', 'A calculadora não conhece a folha da sua empresa, convenções coletivas nem todos os eventos do mês. Ela foi desenhada para planejamento e conferência inicial, com premissas públicas na metodologia.')]),
'clt-ou-pj': ('CLT ou PJ: como comparar sem olhar só o valor mensal', 'Carreira', [('Comece pela visão anual', 'A comparação mensal é intuitiva, mas incompleta. No CLT existem componentes que aparecem em outros momentos do ano. No PJ existem impostos, custos operacionais e períodos sem faturamento que também precisam entrar na conta.'),('Separe dinheiro de contrato', 'Uma equivalência financeira não transforma um contrato PJ em CLT nem o contrário. Risco de desligamento, previsibilidade, autonomia, benefícios, férias e proteção social têm naturezas diferentes e não devem ser reduzidos a uma porcentagem arbitrária.'),('Monte o cenário CLT', 'Liste salário, benefícios recorrentes e componentes anuais que realmente fazem parte da proposta. Evite incluir vantagens hipotéticas. O objetivo é chegar a uma base verificável para comparar com o cenário PJ.'),('Monte o cenário PJ', 'Use faturamento, alíquota efetiva, contador, ferramentas, seguros, períodos sem faturamento e uma retirada coerente. Se você ainda não conhece sua alíquota real, teste mais de um cenário em vez de assumir o melhor caso.'),('Decisão final', 'Depois do ponto de equilíbrio financeiro, registre quais fatores não financeiros mudariam sua escolha. Isso impede que uma diferença pequena em reais domine uma decisão de carreira muito maior.')]),
'valor-hora-e-preco': ('Valor por hora e preço de projeto: uma base sustentável para cobrar', 'Freelancer', [('Hora trabalhada não é hora faturável', 'Atendimento, propostas, organização, estudo e administração consomem tempo necessário ao negócio, mas nem sempre podem ser cobrados diretamente. Uma referência sustentável precisa distribuir a meta de faturamento apenas sobre a capacidade realmente faturável.'),('Comece pelo que precisa entrar', 'Some renda desejada, custos recorrentes, impostos e reservas que fazem parte da operação. Esse valor é diferente do que você quer receber pessoalmente e ajuda a evitar preços que parecem bons no mês, mas não sustentam o ano.'),('Transforme referência em projeto', 'Depois de encontrar um valor por hora interno, estime o esforço do projeto, custos externos e incerteza. O preço fechado pode ser apresentado ao cliente sem expor toda a matemática interna.'),('Revisões e mudança de escopo', 'Preço não deve compensar um escopo indefinido. Registre o que está incluído, quantidade de revisões, prazos e condições de mudança. Isso protege margem e também deixa a relação comercial mais clara.'),('Use cenários', 'Se a estimativa de horas é incerta, simule um cenário base e um conservador. O objetivo da calculadora é tornar premissas visíveis, não produzir um preço universal para qualquer profissional.')]),
'rescisao-clt-2026': ('Rescisão CLT em 2026: como ler uma estimativa antes de conferir os documentos', 'Trabalho', [('O motivo do desligamento muda a conta', 'Pedido de demissão, dispensa sem justa causa, acordo e outras situações podem ter tratamentos diferentes. Por isso a primeira informação de uma simulação de rescisão é o motivo selecionado.'),('Datas determinam proporções', 'Admissão, último dia trabalhado e tratamento do aviso influenciam saldo de salário, férias e décimo terceiro proporcionais. Pequenas diferenças de datas podem alterar avos e dias considerados.'),('Separe verbas de saldo de FGTS', 'As verbas do termo de rescisão e o saldo de uma conta vinculada de FGTS não são a mesma coisa. Para saldo e depósitos efetivos, o extrato oficial deve ser a referência.'),('Como conferir o resultado', 'Compare cada linha da estimativa com o termo recebido, e não apenas o total. Uma divergência localizada é muito mais fácil de investigar do que uma diferença global sem decomposição.'),('Quando buscar ajuda', 'Se houver estabilidade, acidente, gestação, convenção coletiva, remuneração variável relevante, descontos contestados ou outra condição específica, a simulação não substitui orientação profissional.')]),
'ferias-2026': ('Férias em 2026: remuneração, adicional de um terço e planejamento', 'Trabalho', [('Férias não são apenas um salário antecipado', 'O período de descanso tem remuneração própria e adicional constitucional de um terço. Para planejamento, vale separar o que substitui a renda do período do que representa valor adicional.'),('Dias e período importam', 'A quantidade de dias, o momento do gozo e situações como venda de parte das férias afetam a composição. Use na calculadora apenas opções que correspondam ao seu caso.'),('Médias podem mudar o valor', 'Quem recebe comissões, horas extras ou adicionais habituais pode ter médias incorporadas conforme a situação. Uma ferramenta genérica não consegue reproduzir toda folha sem esses dados.'),('Planejamento de caixa', 'Como parte do valor recebido cobre um período em que normalmente haveria salário, tratar tudo como renda extra pode comprometer o orçamento do mês seguinte.'),('Conferência', 'Use a decomposição da calculadora para entender a lógica e compare o pagamento real com o recibo de férias e as regras aplicáveis ao seu vínculo.')]),
'decimo-terceiro-2026': ('13º salário em 2026: proporcionalidade e uso no planejamento anual', 'Trabalho', [('A lógica proporcional', 'O décimo terceiro é uma remuneração anual que pode ser proporcional aos meses elegíveis. Quem entra ou sai durante o ano não deve simplesmente multiplicar o salário por um fator fixo sem considerar o período.'),('Meses elegíveis', 'A contagem depende dos dias trabalhados em cada mês conforme a regra utilizada. A calculadora expõe a quantidade de meses para que a premissa possa ser conferida.'),('Parcelas e retenções', 'O pagamento pode ocorrer em parcelas e as retenções podem não ser distribuídas da mesma forma entre elas. Por isso a estimativa deve ser usada para planejamento, não como reprodução literal da folha.'),('Renda variável', 'Comissões, adicionais e outras parcelas habituais podem exigir médias ou ajustes. Se esse componente for relevante no seu caso, compare a estimativa com os documentos da empresa.'),('Como usar no orçamento', 'Como é um recebimento anual, o décimo terceiro pode financiar despesas anuais, reserva ou objetivos específicos sem ser confundido com aumento permanente da renda mensal.')]),
'reserva-de-emergencia': ('Reserva de emergência: como transformar risco em uma meta objetiva', 'Dinheiro', [('Comece pelas despesas essenciais', 'A reserva existe para preservar despesas que não podem simplesmente parar quando a renda cai. Moradia, alimentação, saúde, transporte e obrigações essenciais são uma base melhor do que todos os gastos do mês sem distinção.'),('Meses de proteção são uma escolha de contexto', 'Não existe um número universal. Renda variável, dependentes, estabilidade profissional, seguros e possibilidade de reduzir despesas mudam a necessidade de proteção.'),('Meta antes do produto', 'Primeiro defina quanto precisa estar disponível. Depois avalie onde manter o dinheiro, considerando liquidez, segurança e acesso. A calculadora separa a meta financeira da escolha de investimento.'),('Construa por etapas', 'Se a meta total parece distante, acompanhe marcos de um, dois ou três meses de despesas. Um processo gradual é mais útil do que esperar condições perfeitas para começar.'),('Revise quando sua vida mudar', 'A reserva precisa acompanhar aluguel, dependentes, mudança de emprego, renda e novas obrigações. Recalcular periodicamente mantém a meta conectada à realidade.')]),
'juros-compostos': ('Juros compostos: como ler uma projeção sem confundir com promessa', 'Dinheiro', [('O que compõe o resultado', 'Valor inicial, aportes, taxa e tempo trabalham juntos. A projeção fica mais útil quando você consegue identificar quanto veio dos seus aportes e quanto veio da rentabilidade hipotética.'),('Taxa é hipótese', 'Uma taxa usada na calculadora não é previsão de mercado. Para decisões conservadoras, teste mais de um cenário e não dependa de uma taxa alta para que a meta funcione.'),('Tempo tem efeito acumulativo', 'Em juros compostos, os rendimentos passam a fazer parte da base dos períodos seguintes. Esse mecanismo aumenta a diferença entre cenários à medida que o horizonte cresce.'),('Aporte é variável controlável', 'Rentabilidade futura não está sob seu controle. Aporte, frequência e prazo são variáveis que você consegue ajustar diretamente e merecem destaque no planejamento.'),('Do nominal ao real', 'Inflação, imposto, taxas e volatilidade podem reduzir o ganho percebido. Uma projeção nominal é um ponto de partida e não substitui a análise completa do investimento.')]),
'mei-e-custos-pj': ('MEI e custos PJ: do faturamento à renda realmente disponível', 'Trabalho', [('Faturamento não é renda pessoal', 'O dinheiro que entra na empresa precisa cobrir tributos, ferramentas, contador quando houver, períodos sem faturamento e outras despesas antes de virar retirada pessoal.'),('MEI tem regras próprias', 'O DAS do MEI tem composição definida para a atividade, mas o enquadramento também depende dos requisitos do regime. A calculadora ajuda no valor de referência, não decide se a empresa pode permanecer como MEI.'),('Quando a alíquota é desconhecida', 'Para uma empresa fora do MEI, não escolha uma porcentagem genérica apenas para fechar a conta. Use sua alíquota efetiva conhecida ou teste intervalos até confirmar o enquadramento com contabilidade.'),('Custos invisíveis', 'Software, equipamento, taxas bancárias, seguro, aquisição de clientes e horas administrativas podem reduzir a renda disponível mesmo sem aparecer como imposto.'),('Compare com visão anual', 'Quando a renda é usada para comparar CLT e PJ, inclua meses sem faturamento e custos anuais. Isso evita uma equivalência baseada apenas em um mês ideal.')]),
'fgts-e-rescisao': ('FGTS e rescisão: o que é depósito, saldo e estimativa', 'Trabalho', [('Depósito mensal', 'O FGTS é formado por depósitos vinculados ao contrato de trabalho. Para um vínculo CLT comum, a calculadora usa a referência geral documentada na metodologia para estimar novos depósitos.'),('Saldo não é apenas salário vezes meses', 'O saldo oficial depende do histórico real de depósitos, atualização e movimentações. Por isso uma estimativa acumulada não deve substituir o extrato oficial.'),('FGTS na rescisão', 'Dependendo do tipo de desligamento, o FGTS pode participar da análise de formas diferentes. A ferramenta de rescisão mantém as linhas separadas para evitar misturar verbas pagas diretamente com saldo de conta vinculada.'),('Como conferir', 'Abra o extrato oficial, confira competências e compare com a remuneração de cada período. Se houver ausência de depósitos, a diferença não é resolvida alterando a calculadora.'),('Planejamento', 'Para decisões de troca de emprego, use o FGTS como um dos componentes anuais do pacote, mas não como renda mensal disponível.')]),
}

GUIDE_TOOL = {'salario-liquido-2026':'/salario-liquido','clt-ou-pj':'/comparador-profissional','valor-hora-e-preco':'/valor-hora','rescisao-clt-2026':'/simulador','ferias-2026':'/ferias','decimo-terceiro-2026':'/decimo-terceiro','reserva-de-emergencia':'/reserva-emergencia','juros-compostos':'/juros-compostos','mei-e-custos-pj':'/impostos-pj','fgts-e-rescisao':'/fgts'}
SOURCE_LINKS = {'salario-liquido-2026':[('INSS: tabela de contribuição mensal','https://www.gov.br/inss/pt-br/direitos-e-deveres/inscricao-e-contribuicao/tabela-de-contribuicao-mensal'),('Receita Federal: tabelas de 2026','https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/2026')],'rescisao-clt-2026':[('FGTS: recolhimento do empregado','https://www.fgts.gov.br/Paginas/subpaginas/recolhimento-empregado.aspx')],'ferias-2026':[('Constituição Federal: direitos sociais','https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm')],'decimo-terceiro-2026':[('Legislação federal no Planalto','https://www.planalto.gov.br/')],'mei-e-custos-pj':[('Portal do Empreendedor: contribuição mensal','https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/perguntas-frequentes/pagamento-da-contribuicao-mensal-carne-mensal/qual-o-valor-das-contribuicoes')],'juros-compostos':[('Banco Central: Calculadora do Cidadão','https://www3.bcb.gov.br/CALCIDADAO/publico/exibirFormCorrecaoValores.do?method=exibirFormCorrecaoValores')],'fgts-e-rescisao':[('FGTS: portal oficial','https://www.fgts.gov.br/')],}

def read(path): return (ROOT / path).read_text(encoding='utf-8')
def write(path, content):
    p=ROOT/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(content,encoding='utf-8')
def strip_ads(html):
    previous=None
    while previous!=html: previous=html;html=AD_BLOCK.sub('',html)
    return re.sub(r'\s*<!--\s*Sem publicidade[^>]*?-->\s*','',html,flags=re.I)
def add_guides_css(html):
    if '/guides.css' not in html and '</head>' in html: html=html.replace('</head>','<link rel="stylesheet" href="/guides.css"></head>',1)
    return html
def add_nav_footer(html):
    if 'class="navlinks"' in html and 'href="/guias"' not in html: html=re.sub(r'(<nav class="navlinks"[^>]*>)(.*?)(</nav>)',lambda m:m.group(1)+m.group(2)+'<a href="/guias">Guias</a>'+m.group(3),html,count=1,flags=re.S)
    if 'class="footer-links"' in html and 'href="/politica-editorial"' not in html: html=re.sub(r'(<div class="footer-links">)(.*?)(</div>)',lambda m:m.group(1)+m.group(2)+'<a href="/politica-editorial">Política editorial</a>'+m.group(3),html,count=1,flags=re.S)
    return html
def set_robots(html,value):
    if re.search(r'<meta\s+name="robots"',html,flags=re.I): html=re.sub(r'<meta\s+name="robots"\s+content="[^"]*">',f'<meta name="robots" content="{value}">',html,count=1,flags=re.I)
    else: html=html.replace('</title>',f'</title><meta name="robots" content="{value}">',1)
    return html
def editorial_section(slug,data):
    faq=''.join(f'<details class="guide-faq"><summary>{escape(q)}</summary><p>{escape(a)}</p></details>' for q,a in data['faq'])
    return f'<section class="editorial-depth" data-editorial-depth="{slug}"><div class="shell"><div class="editorial-meta"><span>Conteúdo editorial QuantoLab</span><span>{REVIEW_LABEL}</span></div><div class="editorial-grid"><article class="editorial-main"><h2>O que esta ferramenta ajuda a responder</h2><p>{escape(data["purpose"])}</p><h2>Quando usar</h2><p>{escape(data["use"])}</p><h2>Como a estimativa é construída</h2><p>{escape(data["method"])}</p><h2>Como interpretar o resultado</h2><p>{escape(data["example"])}</p><h2>Limites importantes</h2><p>{escape(data["limits"])}</p><h2>Perguntas frequentes</h2>{faq}</article><aside class="editorial-aside"><strong>Para conferir</strong><a href="/guias/{data["guide"]}">Leia o guia relacionado</a><a href="/metodologia">Metodologia e fontes</a><a href="/politica-editorial">Como revisamos o conteúdo</a><p>Os cálculos são informativos e não substituem documentação oficial ou orientação profissional quando o caso exigir.</p></aside></div></div></section>'
def inject_editorial(path,slug,data):
    html=add_guides_css(add_nav_footer(strip_ads(read(path))))
    if 'data-editorial-depth=' not in html: html=html.replace('</main>',editorial_section(slug,data)+'</main>',1)
    write(path,html)
def header(title,description,canonical,schema):
    return f'<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{escape(title)} | QuantoLab</title><meta name="description" content="{escape(description)}"><link rel="canonical" href="https://quantolab.com.br{canonical}"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"><meta name="theme-color" content="#D9FF66"><meta property="og:locale" content="pt_BR"><meta property="og:type" content="article"><meta property="og:site_name" content="QuantoLab"><meta property="og:title" content="{escape(title)} | QuantoLab"><meta property="og:description" content="{escape(description)}"><meta property="og:url" content="https://quantolab.com.br{canonical}"><meta name="twitter:card" content="summary"><script type="application/ld+json">{schema}</script><script src="/theme.js"></script><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/theme.css"><link rel="stylesheet" href="/platform.css"><link rel="stylesheet" href="/guides.css"></head>'
NAV='<header class="header"><div class="shell nav"><a class="brand" href="/" aria-label="QuantoLab"><img src="/quantolab-logo.svg" alt="QuantoLab" width="333" height="51"></a><nav class="navlinks" aria-label="Navegação principal"><a href="/ferramentas">Ferramentas</a><a href="/guias">Guias</a><a href="/metodologia">Metodologia</a><a href="/sobre">Sobre</a></nav></div></header>'
FOOT='<footer class="footer"><div class="shell footer-grid"><div class="footer-brand"><img src="/quantolab-logo.svg" alt="QuantoLab" width="333" height="51"><span>Ferramentas claras para decisões profissionais.</span></div><div class="footer-links"><a href="/ferramentas">Ferramentas</a><a href="/guias">Guias</a><a href="/metodologia">Metodologia</a><a href="/sobre">Sobre</a><a href="/politica-de-privacidade">Privacidade</a><a href="/termos">Termos</a><a href="/politica-editorial">Política editorial</a></div></div></footer>'
def guide_html(slug,title,category,sections):
    description=sections[0][1];schema='{"@context":"https://schema.org","@type":"Article","headline":"'+title.replace('"','\\"')+'","dateModified":"'+TODAY+'","datePublished":"2026-08-24","author":{"@type":"Organization","name":"QuantoLab","url":"https://quantolab.com.br/sobre"},"publisher":{"@type":"Organization","name":"QuantoLab","url":"https://quantolab.com.br/"},"mainEntityOfPage":"https://quantolab.com.br/guias/'+slug+'"}'
    body=''.join(f'<section><h2>{escape(h)}</h2><p>{escape(p)}</p></section>' for h,p in sections);sources=SOURCE_LINKS.get(slug,[]);source_html=''
    if sources: source_html='<section><h2>Fontes para conferência</h2><ul>'+''.join(f'<li><a href="{u}" rel="noopener noreferrer">{escape(n)}</a></li>' for n,u in sources)+'</ul><p>As fontes oficiais complementam a explicação editorial. A metodologia do QuantoLab registra as referências usadas nos cálculos.</p></section>'
    tool=GUIDE_TOOL[slug]
    return f'<!doctype html><html lang="pt-BR">{header(title,description,"/guias/"+slug,schema)}<body>{NAV}<main><section class="guide-hero"><div class="shell"><div class="breadcrumbs"><a href="/">QuantoLab</a> / <a href="/guias">Guias</a> / {escape(category)}</div><span class="home-section-label">{escape(category)}</span><h1>{escape(title)}</h1><p class="lead">{escape(description)}</p><div class="guide-byline"><span>Por QuantoLab</span><span>{REVIEW_LABEL}</span></div></div></section><div class="shell guide-layout"><article class="guide-article">{body}{source_html}<section><h2>Próximo passo</h2><p>Use a explicação acima para revisar suas premissas e então teste seu próprio cenário na ferramenta relacionada.</p><p><a class="btn guide-cta" href="{tool}">Abrir a ferramenta relacionada</a></p></section></article><aside class="guide-aside"><strong>Transparência editorial</strong><p>Este guia foi produzido para explicar como interpretar uma decisão antes de usar a calculadora. Não é recomendação individual.</p><a href="/politica-editorial">Política editorial</a><a href="/metodologia">Metodologia e fontes</a></aside></div></main>{FOOT}</body></html>'
def make_guides():
    cards=[]
    for slug,(title,cat,sections) in GUIDES.items(): write(f'guias/{slug}.html',guide_html(slug,title,cat,sections));cards.append(f'<a class="guide-card" href="/guias/{slug}"><span>{escape(cat)}</span><h2>{escape(title)}</h2><p>{escape(sections[0][1])}</p></a>')
    schema='{"@context":"https://schema.org","@type":"CollectionPage","name":"Guias QuantoLab","url":"https://quantolab.com.br/guias"}'
    write('guias.html',f'<!doctype html><html lang="pt-BR">{header("Guias","Conteúdo editorial para entender decisões de trabalho, carreira e dinheiro antes de usar as calculadoras.","/guias",schema)}<body>{NAV}<main><section class="guide-hero"><div class="shell"><span class="home-section-label">Conteúdo editorial</span><h1>Entenda a decisão antes de fazer a conta</h1><p class="lead">Guias próprios do QuantoLab conectam contexto, premissas, limitações e ferramentas para você saber o que cada número realmente significa.</p><div class="guide-byline"><span>Conteúdo produzido e revisado pelo QuantoLab</span><span>{REVIEW_LABEL}</span></div></div></section><section class="section"><div class="shell"><div class="guide-grid">{"".join(cards)}</div></div></section><section class="section guide-principles"><div class="shell"><h2>Como estes guias são produzidos</h2><div class="home-principles"><div class="home-principle"><strong>Problema real</strong><p>Cada guia começa por uma decisão que existe nas ferramentas.</p></div><div class="home-principle"><strong>Premissas visíveis</strong><p>Se uma regra depende de contexto, isso é explicado em vez de escondido.</p></div><div class="home-principle"><strong>Fonte identificada</strong><p>Regras oficiais usadas nos cálculos são ligadas à metodologia.</p></div><div class="home-principle"><strong>Revisão datada</strong><p>Conteúdo sensível a mudanças recebe data de revisão.</p></div></div></div></section></main>{FOOT}</body></html>')
def make_editorial_policy():
    schema='{"@context":"https://schema.org","@type":"WebPage","name":"Política editorial do QuantoLab","url":"https://quantolab.com.br/politica-editorial","about":{"@type":"Organization","name":"QuantoLab"}}'
    write('politica-editorial.html',f'<!doctype html><html lang="pt-BR">{header("Política editorial","Como o QuantoLab pesquisa, escreve, revisa e atualiza calculadoras e guias.","/politica-editorial",schema)}<body>{NAV}<main><section class="legal-hero"><div class="shell"><div class="breadcrumbs"><a href="/">QuantoLab</a> / Política editorial</div><h1>Política editorial</h1><p class="lead">Critérios públicos para transformar regras, fórmulas e hipóteses em ferramentas que possam ser conferidas.</p><p class="metric-note">{REVIEW_LABEL}</p></div></section><div class="shell"><article class="article editorial-policy"><h2>Responsabilidade</h2><p>O conteúdo é publicado pelo QuantoLab. O objetivo é apoiar decisões de trabalho, carreira e dinheiro com explicações próprias, calculadoras auditáveis e links para fontes primárias quando uma regra externa é relevante.</p><h2>Como escolhemos fontes</h2><p>Priorizamos órgãos públicos, legislação, documentação institucional e fontes diretamente responsáveis pela regra. Conteúdo secundário pode ajudar na compreensão, mas não substitui a fonte primária quando ela existe.</p><h2>Como uma calculadora é revisada</h2><p>Primeiro definimos o problema que a ferramenta precisa responder. Depois documentamos entradas, fórmula, premissas e limites. Regras anuais são revisadas quando uma nova referência entra em vigor. Mudanças importantes devem atualizar a metodologia e a data exibida no conteúdo relacionado.</p><h2>O que não fazemos</h2><p>Não escondemos hipóteses importantes, não tratamos simulações como garantia e não transformamos uma estimativa em orientação jurídica, contábil, previdenciária ou de investimento. Quando o caso depende de informações que a ferramenta não possui, essa limitação deve aparecer na página.</p><h2>Correções</h2><p>Se uma inconsistência for identificada, a prioridade é corrigir a regra ou o texto, revisar páginas relacionadas e registrar a nova data de revisão. Resultados históricos gerados no navegador não são armazenados pelo QuantoLab.</p><h2>Conteúdo e automação</h2><p>Automação pode apoiar estrutura, testes e consistência técnica. A responsabilidade editorial continua sendo do QuantoLab, e páginas públicas precisam ter propósito próprio, revisão e conteúdo útil além do formulário de cálculo.</p><h2>Publicidade</h2><p>Durante esta fase de revisão editorial, o produto não exibe inventário publicitário. Qualquer monetização futura deve preservar a leitura, a confiança e a separação clara entre conteúdo e publicidade.</p><div class="notice"><strong>Escopo:</strong> esta política descreve o processo editorial do produto. Para tratamento de dados, consulte a Política de privacidade. Para regras de uso, consulte os Termos.</div></article></div></main>{FOOT}</body></html>')
def enhance_static():
    for p in ROOT.rglob('*.html'):
        rel=p.relative_to(ROOT).as_posix()
        if rel.startswith('guias/'): continue
        p.write_text(add_guides_css(add_nav_footer(strip_ads(p.read_text(encoding='utf-8')))),encoding='utf-8')
    home=read('index.html')
    if 'data-home-editorial=' not in home:
        block='<section class="section home-editorial" data-home-editorial="true"><div class="shell"><div class="section-head home-section-head"><div><span class="home-section-label">Guias e contexto</span><h2>Uma boa decisão precisa de mais do que uma resposta numérica.</h2></div><p>As calculadoras mostram a conta. Os guias explicam o que entra, o que fica de fora e como interpretar o resultado antes de agir.</p></div><div class="guide-grid guide-grid--home"><a class="guide-card" href="/guias/salario-liquido-2026"><span>Trabalho</span><h3>Entenda o salário líquido</h3><p>Veja por que bruto, INSS, IRRF e descontos precisam ser lidos em etapas.</p></a><a class="guide-card" href="/guias/clt-ou-pj"><span>Carreira</span><h3>Compare CLT e PJ com visão anual</h3><p>Separe equivalência financeira de diferenças contratuais e de risco.</p></a><a class="guide-card" href="/guias/valor-hora-e-preco"><span>Freelancer</span><h3>Construa preço com capacidade real</h3><p>Conecte meta, custos, horas faturáveis e escopo de projeto.</p></a></div><div class="home-tools-footer"><a class="home-link home-link--primary" href="/guias">Ver todos os guias <span aria-hidden="true">→</span></a><a class="home-link" href="/politica-editorial">Como produzimos e revisamos</a></div></div></section>'
        home=home.replace('</main>',block+'</main>',1)
    if '"publisher"' not in home: home=home.replace('"inLanguage":"pt-BR"}','"inLanguage":"pt-BR","publisher":{"@type":"Organization","name":"QuantoLab","url":"https://quantolab.com.br/"}}',1)
    write('index.html',home)
    metodologia=read('metodologia.html')
    if 'data-method-review=' not in metodologia:
        block='<section data-method-review="true"><h2>Como pesquisamos e revisamos</h2><p>Cada ferramenta começa por uma pergunta concreta. As entradas e a fórmula são implementadas separadamente do texto editorial para que o resultado possa ser testado. Quando uma regra vem de fonte externa, priorizamos a publicação do órgão responsável e mantemos a referência nesta página.</p><p>Referências anuais são revisadas quando uma nova tabela ou valor oficial entra em vigor. Taxas que mudam com frequência e não são consultadas ao vivo permanecem editáveis. As páginas também registram limitações para deixar claro quando uma estimativa não conhece dados suficientes do caso real.</p><p><a href="/politica-editorial">Leia a política editorial completa</a>.</p></section>'
        metodologia=metodologia.replace('<h2>Princípios das ferramentas</h2>',block+'<h2>Princípios das ferramentas</h2>',1)
    write('metodologia.html',metodologia)
    sobre=read('sobre.html')
    if 'data-about-editorial=' not in sobre:
        block='<section data-about-editorial="true"><h2>Produto, conteúdo e responsabilidade</h2><p>O QuantoLab é uma plataforma independente de apoio à decisão. As ferramentas são desenvolvidas para tornar fórmulas e premissas verificáveis, enquanto os guias explicam o contexto que uma calculadora sozinha não consegue representar.</p><p>O produto não exige cadastro para usar as calculadoras e não transforma resultados em recomendação individual. Regras trabalhistas, tributárias, previdenciárias e financeiras sensíveis a mudanças são ligadas a fontes e a uma metodologia pública.</p><h2>Como mantemos qualidade</h2><p>Alterações de cálculo passam por testes automatizados de regressão, segurança e responsividade. Conteúdo editorial recebe propósito, limitações, data de revisão e conexão com a ferramenta relacionada. A <a href="/politica-editorial">Política editorial</a> detalha os critérios.</p></section>'
        sobre=sobre.replace('</article>',block+'</article>',1) if '</article>' in sobre else sobre.replace('</main>','<div class="shell"><article class="article">'+block+'</article></div></main>',1)
    write('sobre.html',sobre)
def noindex_thin():
    for path in ['meus-numeros.html','incorporar.html','contato.html']+[f'valor-hora/{s}.html' for s in ['designer','desenvolvedor','copywriter','social-media','fotografo','arquiteto']]:
        if (ROOT/path).exists(): write(path,set_robots(read(path),'noindex,follow'))
def css_file():
    write('guides.css','''.editorial-depth{margin-top:clamp(54px,7vw,88px);padding:clamp(46px,6vw,76px) 0;border-top:1px solid var(--border);background:var(--surface-muted)}
.editorial-meta,.guide-byline{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 18px;margin-bottom:24px;color:var(--muted-2);font-size:11px;font-weight:650}.editorial-grid{display:grid;grid-template-columns:minmax(0,760px) minmax(220px,300px);justify-content:space-between;gap:clamp(30px,6vw,70px);align-items:start}.editorial-main h2{margin:34px 0 10px;font-size:clamp(24px,2.8vw,32px)}.editorial-main h2:first-child{margin-top:0}.editorial-main p,.guide-article p,.editorial-policy p{color:var(--muted);font-size:15px;line-height:1.75;text-wrap:pretty}.editorial-aside,.guide-aside{position:sticky;top:92px;display:grid;gap:12px;padding:20px;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--surface);box-shadow:var(--shadow-sm)}.editorial-aside strong,.guide-aside strong{font-size:13px}.editorial-aside a,.guide-aside a{font-size:12px;font-weight:720;text-decoration:underline;text-underline-offset:3px}.editorial-aside p,.guide-aside p{margin:4px 0 0;color:var(--muted);font-size:11.5px;line-height:1.55}.guide-faq{margin:10px 0;border:1px solid var(--border);border-radius:14px;background:var(--surface);overflow:hidden}.guide-faq summary{min-height:48px;display:flex;align-items:center;padding:12px 15px;font-size:13px;font-weight:700;cursor:pointer}.guide-faq p{margin:0;padding:0 15px 15px;font-size:13.5px}.guide-hero{padding:clamp(64px,8vw,96px) 0 clamp(32px,4vw,48px)}.guide-hero h1{max-width:900px;font-size:clamp(42px,5.6vw,68px)}.guide-hero .lead{max-width:820px}.guide-byline{justify-content:flex-start;margin:22px 0 0}.guide-layout{display:grid;grid-template-columns:minmax(0,760px) minmax(220px,300px);justify-content:space-between;gap:clamp(32px,6vw,72px);align-items:start;padding-bottom:40px}.guide-article{min-width:0}.guide-article section{padding:28px 0;border-top:1px solid var(--border)}.guide-article section:first-child{border-top:0}.guide-article h2{font-size:clamp(25px,3vw,34px)}.guide-article ul{padding-left:20px}.guide-article li{margin:8px 0;color:var(--muted);line-height:1.6}.guide-article a:not(.btn){text-decoration:underline;text-underline-offset:3px}.guide-cta{display:inline-flex;width:auto;align-items:center;justify-content:center;margin-top:6px}.guide-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.guide-grid--home{grid-template-columns:repeat(3,minmax(0,1fr))}.guide-card{display:block;padding:24px;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--surface);box-shadow:var(--shadow-sm)}.guide-card>span{display:block;margin-bottom:14px;color:var(--muted-2);font-size:10px;font-weight:760;text-transform:uppercase;letter-spacing:.08em}.guide-card h2,.guide-card h3{margin:0 0 10px;font-size:20px;line-height:1.25}.guide-card p{margin:0;color:var(--muted);font-size:13px;line-height:1.6}.guide-principles{border-top:1px solid var(--border)}.home-editorial{border-top:1px solid var(--border)}:root[data-resolved-theme="dark"] .editorial-depth{background:var(--surface-muted)}@media(max-width:900px){.editorial-grid,.guide-layout{grid-template-columns:1fr}.editorial-aside,.guide-aside{position:static}.guide-grid--home{grid-template-columns:1fr 1fr}}@media(max-width:700px){.guide-grid,.guide-grid--home{grid-template-columns:1fr}.editorial-depth{padding:38px 0}.editorial-main p,.guide-article p,.editorial-policy p{font-size:14px}.guide-hero{padding-top:48px}.guide-hero h1{font-size:clamp(36px,10vw,48px)}}
''')
def sitemap():
    manual=['valor-hora','preco-projeto','meta-faturamento','comparador-profissional','simulador'];core=['','ferramentas','guias','metodologia','sobre','politica-editorial','politica-de-privacidade','termos'];urls=[]
    for u in core+manual+list(DYNAMIC)+[f'guias/{s}' for s in GUIDES]:
        if u not in urls: urls.append(u)
    write('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+'\n'.join(f'  <url><loc>https://quantolab.com.br/{u}</loc><lastmod>{TODAY}</lastmod></url>' for u in urls)+'\n</urlset>\n');write('robots.txt','User-agent: *\nAllow: /\nDisallow: /embed/\n\nSitemap: https://quantolab.com.br/sitemap.xml\n')
def patch_generator():
    path='scripts/generate-platform.py';s=read(path);s=AD_BLOCK.sub('',s);s=re.sub(r'<aside class=\\?"ad ad--[^<]+?</aside>','',s,flags=re.S)
    if 'prepare-adsense-review.py' not in s: s+="\n# Keep generated pages aligned with the public editorial and AdSense readiness policy.\nif __name__ == '__main__':\n import subprocess, sys\n subprocess.run([sys.executable, str(R/'scripts'/'prepare-adsense-review.py'), '--post-generate'], check=True)\n"
    write(path,s)
def patch_qa():
    q='scripts/qa.mjs';s=read(q);start=s.find("if(!css.includes('.ad--leaderboard')");end=s.find("const headers=read('_headers');",start)
    if start!=-1 and end!=-1: s=s[:start]+"for(const file of htmlFiles){\n  const html=read(file);\n  if(/data-ad-slot=|Espaço publicitário|aria-label=[\\\"']Publicidade[\\\"']/i.test(html))fail(`${file}: inventário publicitário deve permanecer removido durante a revisão do AdSense.`);\n}\n\n"+s[end:]
    s=s.replace("const indexablePages=['index.html','valor-hora.html','preco-projeto.html','meta-faturamento.html','comparador-profissional.html','simulador.html','sobre.html','metodologia.html','politica-de-privacidade.html','termos.html'];","const indexablePages=['index.html','ferramentas.html','guias.html','valor-hora.html','preco-projeto.html','meta-faturamento.html','comparador-profissional.html','simulador.html','sobre.html','metodologia.html','politica-editorial.html','politica-de-privacidade.html','termos.html'];");s=re.sub(r"if\(!css\.includes\('\.ads-ready \.ad\{display:block\}'\).*?;\n","",s);s=s.replace('2026-08-14',TODAY).replace('2026-08-16',TODAY);write(q,s)
    p='scripts/platform-qa.mjs';s=read(p);old="for(const slug of [...existing,...newTools,'ferramentas','meus-numeros','incorporar',...professions.map(p=>`valor-hora/${p}`)])if(!sitemap.includes(`https://quantolab.com.br/${slug}`))fail(`Sitemap sem ${slug}.`);";new="for(const slug of [...existing,...newTools,'ferramentas','guias','politica-editorial'])if(!sitemap.includes(`https://quantolab.com.br/${slug}`))fail(`Sitemap sem ${slug}.`);\nfor(const slug of ['meus-numeros','incorporar',...professions.map(p=>`valor-hora/${p}`)])if(sitemap.includes(`https://quantolab.com.br/${slug}`))fail(`Sitemap não deve indexar ${slug}.`);";s=s.replace(old,new);s=re.sub(r"if\(!sitemap\.includes\('<lastmod>[^<]+</lastmod>'\)\)fail\('Sitemap não foi atualizado para [^']+'\);",f"if(!sitemap.includes('<lastmod>{TODAY}</lastmod>'))fail('Sitemap não foi atualizado para {TODAY}.');",s);write(p,s)
    qa='.github/workflows/qa.yml';s=read(qa);s=s.replace('python -m py_compile scripts/generate-platform.py','python -m py_compile scripts/generate-platform.py scripts/prepare-adsense-review.py');s=s.replace("          sed -i 's/2026-08-14/2026-08-16/g' /tmp/qa.mjs\n",'')
    if 'Run AdSense readiness QA' not in s: s+='\n      - name: Run AdSense readiness QA\n        shell: bash\n        run: |\n          set -euo pipefail\n          node scripts/adsense-readiness-qa.mjs\n'
    write(qa,s)
def readiness_qa():
    write('scripts/adsense-readiness-qa.mjs',r'''import fs from 'node:fs';import path from 'node:path';const fail=[];const root=process.cwd();const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);const html=walk(root).filter(f=>f.endsWith('.html')&&!f.includes('/.git/'));for(const f of html){const s=fs.readFileSync(f,'utf8');if(/data-ad-slot=|Espaço publicitário|aria-label=["']Publicidade["']/i.test(s))fail.push(`${path.relative(root,f)} ainda contém inventário publicitário`);if(/effectivecpmnetwork|adsterra/i.test(s))fail.push(`${path.relative(root,f)} contém referência de rede removida`);}for(const f of ['.github/workflows/stress-900-until-2000.yml','.github/workflows/synthetic-traffic-test.yml','tools/quantolab_ci_traffic.py','tools/quantolab_stress_900.py'])if(fs.existsSync(f))fail.push(`${f} deve estar removido antes da revisão`);for(const f of ['guias.html','politica-editorial.html','guides.css'])if(!fs.existsSync(f))fail.push(`${f} ausente`);const guides=fs.existsSync('guias')?fs.readdirSync('guias').filter(f=>f.endsWith('.html')):[];if(guides.length<10)fail.push(`Guias insuficientes: ${guides.length}`);const tools=['salario-liquido','ferias','decimo-terceiro','fgts','seguro-desemprego','hora-extra','inss','irrf','pj-clt-equivalente','impostos-pj','mei-das','pro-labore','custo-funcionario','clientes-necessarios','margem-lucro','renda-anual','faturamento-anual','reserva-emergencia','juros-compostos','rendimento-cdi','comparar-investimentos','metas-financeiras','inflacao','valor-hora','preco-projeto','meta-faturamento','comparador-profissional','simulador'];for(const slug of tools){const f=`${slug}.html`;if(!fs.existsSync(f)){fail.push(`${f} ausente`);continue;}const s=fs.readFileSync(f,'utf8');if(!s.includes('data-editorial-depth='))fail.push(`${f} sem profundidade editorial`);const text=s.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();if(text.length<1800)fail.push(`${f} continua curto para a política editorial (${text.length} caracteres)`);}const noindex=['meus-numeros.html','incorporar.html','contato.html','valor-hora/designer.html','valor-hora/desenvolvedor.html','valor-hora/copywriter.html','valor-hora/social-media.html','valor-hora/fotografo.html','valor-hora/arquiteto.html'];for(const f of noindex){if(!fs.existsSync(f))continue;const s=fs.readFileSync(f,'utf8');if(!/name="robots" content="noindex,follow"/.test(s))fail.push(`${f} deveria ser noindex,follow`);}const sitemap=fs.readFileSync('sitemap.xml','utf8');for(const f of noindex.map(x=>x.replace(/\.html$/,''))){if(sitemap.includes(`https://quantolab.com.br/${f}`))fail.push(`sitemap inclui página noindex ${f}`);}for(const g of guides.map(x=>x.replace(/\.html$/,''))){if(!sitemap.includes(`https://quantolab.com.br/guias/${g}`))fail.push(`sitemap sem guia ${g}`);}if(!sitemap.includes('<lastmod>2026-08-24</lastmod>'))fail.push('sitemap sem data de revisão atual');const index=fs.readFileSync('index.html','utf8');if(!index.includes('google-adsense-account'))fail.push('meta de associação do AdSense ausente na home');if(!fs.existsSync('ads.txt'))fail.push('ads.txt ausente');if(fail.length){console.error(`AdSense readiness QA falhou com ${fail.length} problema(s):`);for(const m of fail)console.error(`- ${m}`);process.exit(1);}console.log(`AdSense readiness QA aprovado: ${tools.length} ferramentas com conteúdo editorial, ${guides.length} guias, inventário de anúncios removido e páginas finas fora do sitemap.`);''')
def remove_synthetic():
    for f in ['.github/workflows/stress-900-until-2000.yml','.github/workflows/synthetic-traffic-test.yml','tools/quantolab_ci_traffic.py','tools/quantolab_stress_900.py','tools/traffic-requirements.txt','tools/TRAFFIC_TEST_SETUP.md']:
        p=ROOT/f
        if p.exists(): p.unlink()
def checklist():
    write('.github/ADSENSE_REVIEW_CHECKLIST.md',f'''# Checklist para nova revisão do AdSense\n\nAtualizado em {TODAY}.\n\n## Alterações concluídas no produto\n\n- Inventário e placeholders de publicidade removidos das páginas públicas.\n- Scripts e workflows de tráfego sintético contra produção removidos.\n- 28 ferramentas com conteúdo editorial estático, limitações, FAQ, guia relacionado e data de revisão.\n- Área Guias com 10 conteúdos próprios conectados às ferramentas.\n- Política editorial pública criada.\n- Metodologia e Sobre reforçados com processo de revisão e responsabilidade.\n- Páginas utilitárias e páginas profissionais curtas configuradas como noindex,follow e removidas do sitemap.\n- Sitemap reconstruído com rotas canônicas e lastmod {TODAY}.\n- Meta de associação do AdSense e ads.txt preservados.\n\n## Antes de solicitar revisão\n\n1. Confirmar que o deploy de main está no domínio quantolab.com.br.\n2. Abrir /guias e /politica-editorial em produção.\n3. Confirmar que /sitemap.xml mostra lastmod {TODAY}.\n4. Confirmar que não existe texto Publicidade ou Espaço publicitário no HTML público.\n5. No Google Search Console, reenviar sitemap.xml.\n6. Solicitar indexação da home, /ferramentas, /guias, /metodologia e das principais ferramentas.\n7. Esperar o Google recapturar as páginas principais.\n8. Só então marcar que os problemas foram resolvidos e solicitar nova revisão no AdSense.\n\nNão existe garantia de aprovação. A decisão final é do Google.\n''')
def run():
    enhance_static()
    for slug,data in DYNAMIC.items(): inject_editorial(f'{slug}.html',slug,data)
    for slug,data in MANUAL.items(): inject_editorial(f'{slug}.html',slug,data)
    noindex_thin();make_guides();make_editorial_policy();css_file();sitemap();readiness_qa();patch_qa();patch_generator();remove_synthetic();checklist()
    for p in ROOT.rglob('*.html'): p.write_text(add_guides_css(add_nav_footer(strip_ads(p.read_text(encoding='utf-8')))),encoding='utf-8')
if __name__=='__main__': run()
