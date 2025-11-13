Avaliação prática da IA do Exame-900: Conceitos básicos da IA do Microsoft Azure

Introdução aos conceitos de pesquisa visual computacional  
A pesquisa visual computacional é uma das principais áreas de IA (inteligência artificial) e se concentra na criação de soluções que permitem que aplicativos de IA processem informações visuais.

Considere estes cenários:

Um veículo autônomo precisa detectar e responder ao tráfego e aos pedestres.  
Uma loja usa check-outs inteligentes com câmeras para determinar os produtos na cesta de um cliente.  
Uma câmera de campainha é usada para detectar pessoas na porta da frente.  
Esses casos de uso, e muitos outros, dependem da visão computacional.

É claro que os computadores não têm olhos biológicos que funcionam como os nossos, mas são capazes de processar imagens; de um feed de câmera ao vivo ou de fotografias digitais ou vídeos. Essa capacidade de processar imagens é a chave para a criação de software que pode emular a percepção visual humana. Neste módulo, examinaremos os blocos de construção que estão por trás de soluções modernas de visão computacional.

 Observação

Reconhecemos que pessoas diferentes gostam de aprender de maneiras diferentes. Você pode optar por concluir este módulo em formato baseado em vídeo ou ler o conteúdo como texto e imagens. O texto contém mais detalhes do que os vídeos, portanto, em alguns casos, talvez você queira se referir a ele como material complementar à apresentação de vídeo.  
O termo "pesquisa visual computacional" refere-se a uma variedade de tarefas e técnicas nas quais o software de IA processa a entrada visual; normalmente, de imagens, vídeos ou transmissões de câmera ao vivo. A pesquisa visual computacional é um campo bem estabelecido de IA e as técnicas usadas para extrair informações da entrada visual evoluíram significativamente ao longo dos anos.

Classificação de imagens  
Uma das soluções de pesquisa visual computacional mais antigas é uma técnica chamada classificação de imagem, na qual um modelo treinado com um grande número de imagens é usado para prever um rótulo de texto com base no conteúdo de uma imagem.

Por exemplo, suponha que um supermercado queira implementar um sistema de check-out inteligente que identifique os produtos automaticamente. Por exemplo, o cliente pode colocar frutas ou legumes em uma escala no check-out, e um aplicativo de IA conectado a uma câmera poderia identificar automaticamente os tipos de produtos (maçã, laranja, banana e assim por diante) e cobrar a quantidade apropriada com base em seu peso. Para que essa solução funcione, um modelo precisaria ser treinado com um grande volume de imagens, cada uma rotulada com o nome correto. O resultado é um modelo que pode usar os recursos visuais de uma imagem para prever seu assunto principal.

Fotografias de laranja, maçã e banana.

Detecção de objetos  
Suponha que o supermercado queira um sistema mais sofisticado, no qual o caixa possa escanear vários itens de uma vez e identificar cada um deles. Uma abordagem comum para esse tipo de problema é chamada de "detecção de objeto". Os modelos de detecção de objetos examinam várias regiões em uma imagem para localizar objetos individuais e seus locais. A previsão resultante do modelo inclui quais objetos foram detectados e as regiões específicas da imagem em que aparecem , indicadas pelas coordenadas da caixa delimitadora retangular.

Fotografia de laranja, maçã e banana com caixas delimitadoras.

Segmentação semântica  
Outra maneira mais sofisticada de detectar objetos em uma imagem é chamada de "segmentação semântica". Nessa abordagem, um modelo é treinado para localizar objetos e classificar pixels individuais na imagem com base no objeto ao qual pertencem. O resultado desse processo é uma previsão muito mais precisa do local dos objetos na imagem.

Fotografia de laranja, maçã e banana com máscaras sobrepostas.

Análise de imagem contextual  
Os modelos de visão computacional multimodal mais recentes são treinados para encontrar relações contextuais entre objetos em imagens e o texto que os descreve. O resultado é uma capacidade de interpretar semanticamente uma imagem para determinar quais objetos e atividades ela ilustra; e gere descrições apropriadas ou sugira marcas relevantes.

Foto de uma pessoa comendo uma maçã.

Uma pessoa comendo uma maçã.

Imagens e processamento de imagens

Para um computador, uma imagem é uma matriz de valores numéricos de pixel . Por exemplo, considere a seguinte matriz:

 0   0   0   0   0   0   0    
 0   0   0   0   0   0   0  
 0   0  255 255 255  0   0  
 0   0  255 255 255  0   0  
 0   0  255 255 255  0   0  
 0   0   0   0   0   0   0  
 0   0   0   0   0   0   0  
A matriz consiste em sete linhas e sete colunas, representando os valores de pixel para uma imagem de 7 x 7 pixels (que é conhecida como resolução da imagem). Cada pixel tem um valor entre 0 (preto) e 255 (branco); com valores entre esses limites que representam tons de cinza. A imagem representada por essa matriz é semelhante à seguinte imagem (ampliada):

Diagrama de uma imagem em escala de cinza.

A matriz de valores de pixel para essa imagem é bidimensional (representando linhas e colunas, ou coordenadas x e y ) e define um único retângulo de valores de pixel. Uma única camada de valores de pixel como este representa uma imagem em escala de cinza. Na realidade, a maioria das imagens digitais são multidimensionais e consistem em três camadas (conhecidas como canais) que representam tons de cor vermelho, verde e azul (RGB). Por exemplo, poderíamos representar uma imagem de cor definindo três canais de valores de pixel que criam a mesma forma quadrada que o exemplo de escala de cinza anterior:

Red:  
 150  150  150  150  150  150  150    
 150  150  150  150  150  150  150  
 150  150  255  255  255  150  150  
 150  150  255  255  255  150  150  
 150  150  255  255  255  150  150  
 150  150  150  150  150  150  150  
 150  150  150  150  150  150  150

Green:  
 0    0    0    0    0    0    0            
 0    0    0    0    0    0    0  
 0    0   255  255  255   0    0  
 0    0   255  255  255   0    0  
 0    0   255  255  255   0    0  
 0    0    0    0    0    0    0  
 0    0    0    0    0    0    0

Blue:  
 255  255  255  255  255  255  255    
 255  255  255  255  255  255  255  
 255  255   0    0    0   255  255  
 255  255   0    0    0   255  255  
 255  255   0    0    0   255  255  
 255  255  255  255  255  255  255  
 255  255  255  255  255  255  255  
Esta é a imagem resultante:

Diagrama de uma imagem colorida.

Os quadrados roxos são representados pela combinação:

Red: 150   
Green: 0   
Blue: 255   
Os quadrados amarelos no centro são representados pela combinação:

Red: 255  
Green: 255  
Blue: 0  
Filtros  
Uma maneira comum de executar tarefas de processamento de imagem é aplicar filtros que modificam os valores de pixel da imagem para criar um efeito visual. Um filtro é definido por uma ou mais matrizes de valores de pixel, chamadas kernels de filtro. Por exemplo, você pode definir o filtro com um kernel 3x3, conforme mostrado neste exemplo:

\-1 \-1 \-1  
\-1  8 \-1  
\-1 \-1 \-1  
Em seguida, o kernel é envolvido em toda a imagem, calculando uma soma ponderada para cada patch de 3x3 de pixels e atribuindo o resultado a uma nova imagem. É mais fácil entender como a filtragem funciona explorando um exemplo passo a passo.

Vamos começar com a imagem em tons de cinza que exploramos anteriormente.

 0   0   0   0   0   0   0    
 0   0   0   0   0   0   0  
 0   0  255 255 255  0   0  
 0   0  255 255 255  0   0  
 0   0  255 255 255  0   0  
 0   0   0   0   0   0   0  
 0   0   0   0   0   0   0  
Primeiro, aplicamos o kernel de filtro ao patch superior esquerdo da imagem, multiplicando cada valor de pixel pelo valor de peso correspondente no kernel e adicionando os resultados:

(0 x \-1) \+ (0 x \-1) \+ (0 x \-1) \+  
(0 x \-1) \+ (0 x 8\) \+ (0 x \-1) \+  
(0 x \-1) \+ (0 x \-1) \+ (255 x \-1) \= \-255  
O resultado (-255) torna-se o primeiro valor em uma nova matriz. Em seguida, movemos o kernel de filtro ao longo de um pixel para a direita e repetimos a operação:

(0 x \-1) \+ (0 x \-1) \+ (0 x \-1) \+  
(0 x \-1) \+ (0 x 8\) \+ (0 x \-1) \+  
(0 x \-1) \+ (255 x \-1) \+ (255 x \-1) \= \-510  
Novamente, o resultado é adicionado à nova matriz, que agora contém dois valores:

\-255  \-510  
O processo é repetido até que o filtro tenha sido convolvido em toda a imagem, conforme mostrado nesta animação:

Diagrama de um filtro.

O filtro é convolvido na imagem, calculando uma nova matriz de valores. Alguns dos valores podem estar fora do intervalo de valores de 0 a 255 pixels, portanto, os valores são ajustados para se ajustarem a esse intervalo. Devido à forma do filtro, a borda externa dos pixels não é calculada, portanto, um valor de preenchimento (geralmente 0\) é aplicado. A matriz resultante representa uma nova imagem na qual o filtro transformou a imagem original. Nesse caso, o filtro teve o efeito de realçar as bordas de formas na imagem.

Para ver o efeito do filtro com mais clareza, veja um exemplo do mesmo filtro aplicado a uma imagem real:

Imagem original	Imagem filtrada  
Foto de um cachorro.	Fotografia de um cachorro com um filtro Laplace aplicado.  
Como o filtro é convolvido na imagem, esse tipo de manipulação de imagem geralmente é conhecido como filtragem convolucional . O filtro usado neste exemplo é um tipo específico de filtro (chamado de filtro Laplace ) que realça as bordas em objetos em uma imagem. Há muitos outros tipos de filtro que você pode usar para criar desfoque, nitidez, inversão de cores e outros efeitos.

Redes neurais convolucionais  
A capacidade de usar filtros para aplicar efeitos a imagens é útil em tarefas de processamento de imagem, como você pode executar com o software de edição de imagem. No entanto, o objetivo da pesquisa visual computacional é, muitas vezes, extrair significado, ou pelo menos insights acionáveis, de imagens; que requer a criação de modelos de machine learning treinados para reconhecer recursos com base em grandes volumes de imagens existentes.

 Dica

Esta unidade pressupõe que você esteja familiarizado com os princípios fundamentais do aprendizado de máquina e que você tenha conhecimento conceitual do aprendizado profundo com redes neurais. Se você não estiver familiarizado com o aprendizado de máquina, considere concluir o módulo Introdução aos conceitos de aprendizado de máquina no Microsoft Learn.

Uma das arquiteturas de modelo de aprendizado de máquina mais comuns para visão computacional é uma rede neural convolucional (CNN), um tipo de arquitetura de aprendizado profundo. As CNNs usam filtros para extrair mapas de características numéricas de imagens e, em seguida, inserem os valores das características em um modelo de aprendizado profundo para gerar uma predição de rótulo. Por exemplo, em um cenário de classificação de imagem , o rótulo representa o assunto principal da imagem (em outras palavras, do que se trata essa imagem?). Você pode treinar um modelo da CNN com imagens de diferentes tipos de frutas (como maçã, banana e laranja) para que o rótulo previsto seja o tipo de fruta em uma determinada imagem.

No processo de treinamento de uma CNN, os kernels de filtro são inicialmente definidos usando valores de peso gerados aleatoriamente. Em seguida, conforme o processo de treinamento progride, as previsões de modelos são avaliadas em relação aos valores de rótulo conhecidos e os pesos de filtro são ajustados para melhorar a precisão. Eventualmente, o modelo treinado para classificação de imagens de frutas usa os pesos dos filtros que melhor extraem recursos, ajudando na identificação de diferentes tipos de frutas.

O diagrama a seguir ilustra como funciona uma CNN para um modelo de classificação de imagem:

Diagrama de uma rede neural convolucional.

Imagens com rótulos conhecidos (por exemplo, 0: maçã, 1: banana ou 2: laranja) são alimentadas na rede para treinar o modelo.  
Uma ou mais camadas de filtros são usadas para extrair recursos de cada imagem conforme ela é alimentada pela rede. Os kernels de filtro começam com pesos atribuídos aleatoriamente e geram matrizes de valores numéricos chamados mapas de recursos. Camadas adicionais podem agregar ou reduzir o tamanho dos mapas de características para criar matrizes menores que enfatizam as principais características visuais extraídas pelos filtros.  
Os mapas de recursos são mesclados em uma única matriz dimensional de valores de recurso.  
Os valores das características são inseridos em uma rede neural totalmente conectada.  
A camada de saída da rede neural usa uma softmax ou função semelhante para produzir um resultado que contenha um valor de probabilidade para cada classe possível, por exemplo \[0,2, 0,5, 0,3\].  
Durante o treinamento, as probabilidades de saída são comparadas com o rótulo de classe real – por exemplo, uma imagem de uma banana (classe 1\) deve ter o valor \[0,0, 1,0, 0,0\]. A diferença entre as pontuações de classe previstas e reais é usada para calcular a perda no modelo. Em seguida, os pesos na rede neural totalmente conectada e os kernels de filtro nas camadas de extração de recursos são modificados para reduzir essa perda.

O processo de treinamento é repetido em várias épocas até que um conjunto ideal de pesos seja aprendido. Em seguida, os pesos são salvos e o modelo pode ser usado para prever rótulos para novas imagens para as quais o rótulo é desconhecido.

 Observação

As arquiteturas da CNN geralmente incluem várias camadas de filtro convolucional e camadas adicionais para reduzir o tamanho dos mapas de recursos, restringir os valores extraídos e manipular os valores de recurso. Essas camadas foram omitidas neste exemplo simplificado para se concentrar no conceito de chave, que é que os filtros são usados para extrair recursos numéricos de imagens, que são então usados em uma rede neural para prever rótulos de imagem.

Transformadores de visão e modelos multimodais

As CNNs estão no centro das soluções de visão computacional há muitos anos. Embora sejam comumente usados para resolver problemas de classificação de imagem, conforme descrito anteriormente, eles também são a base para modelos de pesquisa visual computacional mais complexos. Por exemplo, modelos de detecção de objetos combinam camadas de extração de características de CNN com a identificação de regiões de interesse em imagens para localizar múltiplas classes de objetos na mesma imagem. Muitos avanços na visão computacional ao longo das décadas foram impulsionados por melhorias nos modelos baseados na CNN.

No entanto, em outra disciplina de IA \- NLP (processamento de linguagem natural), outro tipo de arquitetura de rede neural, chamada transformador, possibilitou o desenvolvimento de modelos especializados para a linguagem.

Modelagem semântica para idioma – Transformadores  
Os transformers funcionam processando grandes volumes de dados, codificando tokens de linguagem (que representam palavras ou frases individuais) como incorporações baseadas em vetores (matrizes de valores numéricos). Uma técnica chamada atenção é usada para atribuir valores de inserção que refletem diferentes aspectos de como cada token é usado no contexto de outros tokens. Você pode pensar nas inserções como vetores no espaço multidimensional, no qual cada dimensão insere um atributo linguístico de um token com base em seu contexto no texto de treinamento, criando relações semânticas entre tokens. Tokens que normalmente são usados em contextos semelhantes definem vetores mais alinhados do que palavras não relacionadas.

Diagrama de vetores de token em um espaço 3D.

Tokens semanticamente semelhantes são codificados em direções semelhantes, criando um modelo de linguagem semântica que possibilita a criação de soluções NLP sofisticadas para análise de texto, tradução, geração de idioma e outras tarefas.

 Observação

Na realidade, codificadores em redes transformadores criam vetores com muito mais dimensões, definindo relações semânticas complexas entre tokens com base em cálculos algébricos lineares. A matemática envolvida é complexa, assim como a arquitetura de um modelo de transformador. Nosso objetivo aqui é apenas fornecer uma compreensão conceitual de como a codificação cria um modelo que encapsula as relações entre entidades.

Modelo semântico para imagens – Transformadores de visão  
O sucesso dos transformadores como forma de criar modelos de linguagem levou os pesquisadores de IA a considerar se a mesma abordagem seria eficaz para dados de imagem. O resultado é o desenvolvimento de modelos vit ( transformador de visão ), em que um modelo é treinado usando um grande volume de imagens. Em vez de codificar tokens baseados em texto, o transformador extrai da imagem patches de valores de pixel e gera um vetor linear a partir desses valores.

Diagrama de uma foto com patches atribuídos a vetores.

A mesma técnica de atenção usada em modelos de linguagem para incorporar relações contextuais entre tokens é usada para determinar relações contextuais entre os patches. A principal diferença é que, em vez de codificar características linguísticas nos vetores de inserção, os valores inseridos são baseados em recursos visuais, como cor, forma, contraste, textura e assim por diante. O resultado é um conjunto de vetores de inserção que cria um "mapa" multidimensional de recursos visuais com base em como eles são comumente vistos nas imagens de treinamento.

Diagrama de inserções de visão.

Assim como acontece com os modelos de linguagem, as inserções resultam em recursos visuais que são usados em contexto semelhante recebendo direções de vetor semelhantes. Por exemplo, os recursos visuais comuns em um chapéu podem estar contextualmente relacionados aos recursos visuais que são comuns em uma cabeça; porque as duas coisas são muitas vezes vistas juntas. O modelo não entende o que é um "chapéu" ou uma "cabeça"; mas pode inferir uma relação semântica entre as características visuais.

Reunindo todos os elementos \- modelos multimodais  
Um transformador de linguagem cria inserções que definem um vocabulário linguístico que codifica relações semânticas entre palavras. Um transformador de visão cria um vocabulário visual que realiza a mesma função para características visuais. Quando os dados de treinamento incluem imagens com descrições de texto associadas, podemos combinar os codificadores de ambos os transformadores em um modelo multimodal e usamos uma técnica chamada atenção cruzada entre modelos para definir uma representação espacial unificada das incorporações, assim.

Diagrama de um modelo multi modal que combina inserções de linguagem e visão.

Essa combinação de inserções de linguagem e visão permite que o modelo discerna relações semânticas entre recursos visuais e de linguagem. Essa funcionalidade, por sua vez, permite que o modelo preveja descrições complexas para imagens que ele não viu anteriormente, reconhecendo os recursos visuais e pesquisando o espaço de vetor compartilhado em busca de linguagem associada.

Foto de uma pessoa em um parque com um chapéu e uma mochila.

Uma pessoa em um parque com um chapéu e uma mochila  
Geração de imagem  
A mesma arquitetura de modelo multimodal que permite que a IA crie respostas de linguagem natural à entrada visual também pode ser usada para habilitá-la para criar imagens em resposta a prompts de linguagem natural. Ao identificar os recursos visuais associados à linguagem, um modelo de síntese de imagem pode pegar uma descrição de uma imagem ou vídeo desejado e gerá-la.

A maioria dos modelos modernos de geração de imagens usa uma técnica chamada difusão, na qual um prompt é usado para identificar um conjunto de recursos visuais relacionados que podem ser combinados para criar uma imagem. Em seguida, a imagem é criada iterativamente, começando com um conjunto aleatório de valores de pixel e removendo "ruído" para criar estrutura. Após cada iteração, o modelo avalia a imagem até agora para compará-la com o prompt, até que uma imagem final que ilustra a cena desejada seja produzida.

Por exemplo, o prompt "Um cão carregando uma vara na boca" pode resultar em um processo de difusão com as seguintes iterações:  
Alguns modelos podem aplicar um processo semelhante à geração de vídeo. O processo de geração de vídeo usa a mesma técnica para identificar recursos visuais associados a tokens de linguagem, mas também leva em conta fatores como o comportamento físico de objetos no mundo real (como garantir que um cão ande com os pés no chão) e a progressão temporal (para que o vídeo retrata uma sequência lógica de atividade).

Introdução à pesquisa visual computacional no Azure

A pesquisa visual computacional é um campo de IA (inteligência artificial) que permite que os computadores interpretem e entendam informações visuais do mundo, como imagens, vídeos e feeds de câmera ao vivo. Os recursos de pesquisa visual computacional dão suporte à automação de tarefas com uso intensivo de tempo e permitem possibilidades que não existiam antes.

Considere alguns desses aplicativos de pesquisa visual computacional:

Fabricação – Detecção de Defeitos: os sistemas de visão de IA inspecionam produtos em linhas de assembly em tempo real. Eles detectam defeitos de superfície, desalinhamentos ou componentes ausentes usando a detecção de objetos e a segmentação de imagem, reduzindo o desperdício e melhorando o controle de qualidade.

Saúde – Análise de Imagens Médicas: a pesquisa visual computacional ajuda os radiologistas a analisar raios-X, ressonâncias magnéticas e tomografias. Os modelos de IA podem destacar anomalias como tumores ou fraturas, auxiliar no diagnóstico precoce e reduzir o erro humano.

Varejo – Monitoramento de prateleira: os varejistas usam a visão de IA para monitorar as prateleiras das lojas. As câmeras detectam quando os produtos estão sem estoque ou perdidos, permitindo atualizações de inventário em tempo real e melhorando a experiência do cliente.

Transporte – Veículos Autônomos: os carros autônomos dependem da pesquisa visual computacional para reconhecer placas de trânsito, sinalizações de pista, pedestres e outros veículos. Isso permite a navegação segura e a tomada de decisões em ambientes dinâmicos.

Os sistemas de visão de IA podem ser criados usando um intervalo de serviços de IA do Azure. Neste módulo, exploraremos a Visão de IA do Microsoft Azure, um serviço de nuvem que os desenvolvedores podem usar para criar uma ampla gama de soluções de pesquisa visual computacional.

Entender os serviços de IA do Azure para pesquisa visual computacional  
A IA do Azure fornece uma ampla gama de serviços baseados em nuvem para várias tarefas de IA, incluindo pesquisa visual computacional. O serviço Azure AI Vision da Microsoft fornece modelos de pesquisa visual computacional predefinidos e personalizáveis baseados em modelos de aprendizado profundo e fornecem vários recursos. A Visão de IA do Azure fornece funcionalidade "off-the-shelf" para muitos cenários comuns de visão computacional, mantendo a capacidade de criar modelos personalizados usando suas próprias imagens.

O serviço Azure AI Vision contém vários produtos. No Azure AI Vision, há serviços que lidam com conjuntos específicos de tarefas, incluindo:

Serviço de Análise de Imagem da Visão de IA do Azure: detecta objetos comuns em imagens, marca recursos visuais, gera legendas e dá suporte ao OCR (reconhecimento óptico de caracteres).

Serviço de detecção facial de IA do Azure: detecta, reconhece e analisa rostos humanos em imagens. Fornece modelos específicos para análise facial que vão além do que está disponível com a análise de imagem. Captura de tela do exemplo de detecção facial do Azure AI Foundry.

Há muitos aplicativos para a análise de imagem do Azure AI Vision e detecção facial , análise e reconhecimento. Por exemplo:

Otimização do mecanismo de pesquisa – usando marcação de imagem e legenda para melhorias essenciais na classificação de pesquisa.  
Moderação de conteúdo – usando a detecção de imagens para ajudar a monitorar a segurança das imagens postadas online.  
Segurança – o reconhecimento facial pode ser usado na criação de aplicativos de segurança e em sistemas operacionais para desbloquear dispositivos.  
Mídia social – o reconhecimento do rosto pode ser usado para marcar automaticamente os amigos conhecidos em fotos.  
Pessoas desaparecidas – usando sistemas de câmeras públicas, o reconhecimento do rosto pode ser usado para identificar se uma pessoa desaparecida está no quadro da imagem.  
Validação de identidade – útil em portas de quiosques de entrada em que uma pessoa tem uma permissão de entrada especial.  
Gerenciamento de arquivos do museu \- usando o reconhecimento óptico de caracteres para preservar informações de documentos de papel.  
 Observação

Muitas soluções de visão modernas são criadas com uma combinação de funcionalidades. Por exemplo, os recursos de análise de vídeo são compatíveis com o indexador de vídeo de IA do Azure. O indexador de vídeo de IA do Azure é criado em vários serviços de IA do Azure, como Detecção Facial, Tradutor, Análise de Imagem e Fala.

Em seguida, vamos dar uma olhada em alguns recursos básicos da Análise de Imagem da Visão de IA do Azure.

Entender os recursos de Análise de Imagem da Visão de IA do Azure  
Os recursos de análise de imagem da Visão de IA do Azure podem ser usados com ou sem personalização. Alguns dos recursos que não exigem personalização incluem:

Descrevendo uma imagem com legendas  
Detectando objetos comuns em uma imagem  
Marcando recursos visuais  
Reconhecimento óptico de caracteres  
Descrevendo uma imagem com legendas  
A Visão de IA do Azure tem a capacidade de analisar uma imagem, avaliar os objetos nela e gerar uma descrição legível por humanos da imagem. Por exemplo, considere a seguinte imagem:

Diagrama de uma pessoa andando de skate.

A Visão de IA do Azure retorna a seguinte legenda para esta imagem:

Uma pessoa pulando em cima de um skate

Detectando objetos comuns em uma imagem  
A Visão de IA do Azure pode identificar milhares de objetos comuns em imagens. Por exemplo, quando usada para detectar objetos na imagem do skatista discutida anteriormente, a Visão de IA do Azure retorna as seguintes previsões:

Skate (90,40%)  
Pessoa (95,5%)  
As previsões incluem uma pontuação de confiança que indica o quão confiante é o modelo de que o que ele descreve é o que realmente está na imagem.

Além dos rótulos de objeto detectados e suas probabilidades, a Visão de IA do Azure retorna coordenadas de caixa delimitadoras que indicam a parte superior, esquerda, largura e altura do objeto detectado. Você pode usar essas coordenadas para determinar onde na imagem cada objeto foi detectado, desta forma:

Diagrama de um skatista com caixas delimitadoras ao redor dos objetos detectados.

Marcando recursos visuais  
A Visão de IA do Azure pode sugerir marcas para uma imagem com base em seu conteúdo. Tags são associadas a imagens como metadados. As etiquetas resumem atributos da imagem. Você pode usar marcas para indexar uma imagem junto com um conjunto de termos-chave para uma solução de pesquisa.

Por exemplo, as etiquetas retornadas para a imagem do skatista (com pontuações de confiança associadas) incluem:

esporte (99,60%)  
pessoa (99,56%)  
calçado (98,05%)  
patinação (96,27%)  
esporte com prancha (95,58%)  
equipamento de skate (94,43%)  
roupas (94,02%)  
parede (93,81%)  
skateboarding (93,78%)  
skatista (93,25%)  
esportes individuais (92,80%)  
acrobacias de rua (90,81%)  
saldo (90,81%)  
pular (89,87%)  
equipamentos esportivos (88,61%)  
esporte extremo (88,35%)  
kickflip (88,18%)  
manobra (87.27%)  
skate (86,87%)  
praticante de acrobacias (85,83%)  
joelho (85,30%)  
esportes (85,24%)  
longboard (84,61%)  
longboarding (84,45%)  
andando (73.37%)  
skate (67,27%)  
ar (64,83%)  
young (63.29%)  
ao ar livre (61,39%)  
Reconhecimento óptico de caracteres  
O serviço de Visão de IA do Azure pode usar recursos de OCR (reconhecimento óptico de caracteres) para detectar texto em imagens. Por exemplo, considere a seguinte imagem de um rótulo de nutrição em um produto em um supermercado:

Diagrama de um rótulo de nutrição.

O serviço Azure AI Vision pode analisar essa imagem e extrair o seguinte texto:

Nutrition Facts Amount Per Serving  
Serving size:1 bar (40g)  
Serving Per Package: 4  
Total Fat 13g  
Saturated Fat 1.5g  
Amount Per Serving  
Trans Fat 0g  
calories 190  
Cholesterol 0mg  
ories from Fat 110  
Sodium 20mg  
ntDaily Values are based on  
Vitamin A 50  
calorie diet  
Treinamento de modelos personalizados  
Se os modelos internos fornecidos pela Visão de IA do Azure não atenderem às suas necessidades, você poderá usar o serviço para treinar um modelo personalizado para classificação de imagem ou detecção de objetos. A Visão de IA do Azure cria modelos personalizados no modelo de fundação pré-treinado, o que significa que você pode treinar modelos sofisticados usando relativamente poucas imagens de treinamento.

Classificação de imagens  
Um modelo de classificação de imagem é usado para prever a categoria ou classe de uma imagem. Por exemplo, você pode treinar um modelo para determinar qual tipo de fruta é mostrado em uma imagem, como esta:

Maçã	Banana	Laranja  
Diagrama de uma maçã.	Diagrama de uma banana.	Diagrama de uma laranja.  
Detecção de objetos  
Os modelos de detecção de objetos detectam e classificam objetos em uma imagem, retornando coordenadas de caixa delimitadora para localizar cada objeto. Além dos recursos internos de detecção de objetos na Visão de IA do Azure, você pode treinar um modelo de detecção de objetos personalizado com suas próprias imagens. Por exemplo, você pode usar fotografias de frutas para treinar um modelo que detecta várias frutas em uma imagem, como esta:

Diagrama de várias frutas detectadas em uma imagem.

 Observação

Os detalhes de como usar a Visão de IA do Azure para treinar um modelo personalizado estão além do escopo deste módulo. Você pode encontrar informações sobre o treinamento de modelo personalizado na documentação da Visão de IA do Azure.

Entender os recursos do serviço de Detecção Facial da Visão de IA do Azure

Como um produto dentro da Visão de IA do Azure, o Azure AI Face dá suporte a casos de uso específicos, como verificação de identidade do usuário, detecção de atividade, controle de acesso sem toque e redação facial. Vários conceitos, incluindo detecção e reconhecimento facial, são essenciais para trabalhar com o Face.

Detecção facial  
A Detecção Facial envolve a identificação de regiões de uma imagem que contenham um rosto humano, geralmente retornando coordenadas da caixa delimitadora que formam um retângulo ao redor do rosto, como a seguir:

Fotografia de dois rostos realçados em retângulos.

Com o Face, os recursos faciais podem ser usados para treinar modelos de machine learning para retornar outras informações, como características faciais, como nariz, olhos, sobrancelhas, lábios e outros.

Captura de tela da imagem de pontos de referência faciais mostrando dados sobre as características faciais.

Reconhecimento facial  
Uma outra aplicação de análise facial é treinar um modelo de machine learning para identificar indivíduos conhecidos com base nos traços do rosto deles. Isso é conhecido como Reconhecimento da Detecção Facial e usa várias imagens de um indivíduo para treinar o modelo. Isso treina o modelo para que ele possa detectar esses indivíduos em novas imagens nas quais não foi treinado.

Fotografia de uma pessoa identificada como 

Quando usado com responsabilidade, o reconhecimento facial é uma tecnologia importante e útil que pode melhorar a eficiência, a segurança e as experiências do cliente.

Funcionalidades do serviço de Detecção Facial de IA do Azure  
O serviço de Detecção Facial da IA do Azure pode retornar as coordenadas do retângulo para qualquer rosto humano encontrado em uma imagem, bem como uma série de atributos relacionados:

Acessórios: indica se o rosto fornecido tem acessórios. Esse atributo retorna possíveis acessórios, incluindo chapéus, óculos e máscaras, com uma pontuação de confiança entre zero e um para cada acessório.  
Desfoque: como o rosto está desfocado, o que pode ser uma indicação da probabilidade de o rosto ser o foco principal da imagem.  
Exposição: como, por exemplo, se a imagem está subexposta ou superexposta. Isso se aplica ao rosto na imagem e não à exposição geral da imagem.  
Óculos: se a pessoa está ou não usando óculos.  
Pose da cabeça: a orientação do rosto em um espaço tridimensional.  
Máscara: indica se o rosto está usando uma máscara.  
Ruído: refere-se ao ruído visual na imagem. Se você tiver tirado uma foto com uma configuração ISO alta para um ambiente mais escuro, observará esse ruído na imagem. A imagem parece granulada ou cheia de pequenos pontos que tornam a imagem menos nítida.  
Oclusão: determina se existem objetos bloqueando o rosto na imagem.  
Qualidade para reconhecimento: uma classificação alta, média ou baixa que reflete se a imagem é de qualidade suficiente para tentar o reconhecimento facial.  
Uso responsável de IA  
 Importante

Para dar suporte ao Padrão de IA Responsável da Microsoft, a Detecção Facial de IA do Azure e o Visão de IA do Azure têm uma política de Acesso Limitado.

Qualquer pessoa pode usar o serviço de Detecção Facial para:

Detectar a localização de rostos em uma imagem.  
Determinar se a pessoa está usando óculos.  
Determinar se existe oclusão, desfoque, ruído ou exposição excessiva ou insuficiente em qualquer um dos rostos.  
Retornar as coordenadas da pose da cabeça para cada rosto em uma imagem.  
A política de Acesso Limitado exige que os clientes enviem um formulário de admissão para acessar recursos adicionais do serviço de Detecção Facial da IA do Azure, incluindo:

Verificação de detecção facial: a capacidade de comparar rostos para similaridade.  
Identificação de detecção facial: a capacidade de identificar indivíduos nomeados em uma imagem.Introdução ao portal do Azure AI Foundry

Detecção de dinâmica: a capacidade de detectar e atenuar instâncias de conteúdo recorrente e/ou comportamentos que indicam uma violação de políticas (por exemplo, como se o fluxo de vídeo de entrada fosse real ou falso).  
Em seguida, vamos dar uma olhada em como você pode começar a usar a Visão de IA do Azure.

Introdução ao portal do Azure AI Foundry  
A Visão de IA do Azure fornece os blocos de construção para incorporar recursos de visão em aplicativos. Como um dos muitos serviços de IA do Azure, você pode criar soluções com o Azure AI Vision de várias maneiras, incluindo:

O portal do Azure AI Foundry  
Um SDK (software development kit) ou API REST  
Recursos do Azure para o serviço Azure AI Vision  
Para usar a Visão de IA do Azure, você precisa criar um recurso para ele em sua assinatura do Azure. Você pode usar qualquer um dos seguintes tipos de recurso:

Visão de IA do Azure: um recurso específico para o serviço de Visão de IA do Azure. Use esse tipo de recurso se você não pretende usar outros serviços de IA do Azure ou se quiser controlar a utilização e os custos do recurso da Visão de IA do Azure separadamente.  
Serviços de IA do Azure: um recurso geral que inclui a Visão de IA do Azure juntamente com muitos outros serviços de IA do Azure; como a Linguagem de IA do Azure, a Visão Personalizada da IA do Azure, o Tradutor de IA do Azure e outros. Use esse tipo de recurso se você planeja usar vários serviços de IA e quiser simplificar a administração e o desenvolvimento.  
 Observação

Há várias maneiras de criar recursos com o Azure. Você pode usar uma interface do usuário para criar recursos ou escrever um script. O portal do Azure e o portal do Azure AI Foundry fornecem interfaces de usuário para a criação de recursos. Escolha o portal do Azure AI Foundry quando você também quiser ver exemplos de serviços de IA do Azure em ação.

Introdução ao portal do Azure AI Foundry  
Captura de tela do portal do Azure AI Foundry.

A Fábrica de IA do Azure fornece uma plataforma unificada para as operações de IA corporativa, construtores de modelos e desenvolvimento de aplicativos. O portal do Azure AI Foundry fornece uma interface do usuário baseada em hubs e projetos. Para usar qualquer um dos serviços de IA do Azure, incluindo o Azure AI Vision, crie um projeto no Azure AI Foundry, que também criará um recurso de serviços de IA do Azure para você.

Projetos no Azure AI Foundry ajudam você a organizar seu trabalho e recursos com eficiência. Os projetos atuam como contêineres para conjuntos de dados, modelos e outros recursos, facilitando o gerenciamento e a colaboração em soluções de IA.

No portal do Azure AI Foundry, você tem a capacidade de experimentar recursos de serviço testando com imagens de exemplo ou carregando suas próprias.

Captura de tela da página Visão da Fábrica de IA do Azure.

Em seguida, vamos experimentar a Visão de IA do Azure no portal do Azure AI Foundry.

O Azure AI Vision é um serviço baseado em nuvem que oferece modelos de pesquisa visual computacional predefinidos e personalizáveis alimentados pelo aprendizado profundo. Ele dá suporte a uma variedade de tarefas, incluindo detecção de objetos, marcação de imagem, geração de legenda e OCR (reconhecimento óptico de caracteres). O serviço é dividido em componentes especializados:

Análise de Imagem: Detecta objetos, marca recursos, gera legendas e executa o OCR.  
Serviço de Detecção Facial: detecta e analisa rostos humanos com funcionalidades avançadas de reconhecimento facial.  
Essas ferramentas são usadas em aplicativos do mundo real, como otimização de SEO, moderação de conteúdo, sistemas de segurança, marcação de mídia social, validação de identidade e arquivamento digital. Você pode começar a usar a Visão de IA do Azure no portal do Azure AI Foundry.

Entender a extração de dados de imagens

A extração de informações alimentadas por IA substitui a necessidade de inspecionar manualmente cada parte do conteúdo em busca de insights. A pesquisa visual computacional pode extrair insights de imagens para descrever as pessoas, os lugares, as coisas e as palavras que elas retratam.

visão computacional é possibilitada por modelos de aprendizado de máquina treinados para reconhecer características com base em grandes volumes de imagens existentes. Modelos de machine learning processam imagens transformando as imagens em informações numéricas. Em sua essência, os modelos de visão executam cálculos nas informações numéricas, o que resulta em previsões do que está nas imagens.  
O OCR (Reconhecimento Óptico de Caracteres) ajuda os computadores a reconhecer que um elemento em uma imagem contém texto. O OCR é a base do processamento de texto em imagens e usa modelos de machine learning treinados para reconhecer formas individuais como letras, numerais, pontuação ou outros elementos de texto. Grande parte do trabalho inicial na implementação desse tipo de funcionalidade foi realizado pelos serviços postais para dar suporte à classificação automática de emails com base em códigos postais. Desde então, o estado da arte para leitura de texto seguiu em frente e temos modelos que detectam texto impresso ou manuscrito em uma imagem e o digitalizam linha por linha e palavra por palavra.

 Observação

Os conceitos de aprendizado de máquina associados à visão são abordados detalhadamente em Introdução aos conceitos de pesquisa visual computacional.

Em seguida, vamos ver como os dados são extraídos de formulários com técnicas que se baseiam no OCR.

Entender a extração de dados de formulários  
Formulários e outros documentos têm dados de texto com significado semântico. O significado semântico refere-se ao significado ou à interpretação pretendida de palavras, frases ou símbolos em um determinado contexto. O significado semântico vai além apenas da definição literal de uma palavra (sintaxe) e se concentra no que a palavra ou frase realmente transmite.

A inteligência de documento descreve os recursos de IA que processam texto e anexam significado semântico ao texto extraído. Como uma extensão do OCR (reconhecimento óptico de caracteres), a inteligência de documento automatiza o processo de extração e compreensão de informações.

Considere uma organização que precisa processar um grande número de recibos para declarações de despesas, custos de projeto e outras finalidades de contabilidade. Usando a inteligência do documento, a empresa pode tirar uma imagem digitalizada de um recibo, digitalizar o texto com OCR e extrair significado semântico. O significado semântico dos dados em formulários pode ser descrito em pares de valor de campo.

O nome do campo é a chave ou tipo de entrada de dados.  
A descrição do campo é a definição do que o nome do campo representa.  
O valor corresponde ao nome do campo e é os dados específicos do conteúdo.  
Por exemplo, em uma fatura, os campos reconhecidos podem incluir:

Nome, endereço e número de telefone do comerciante  
Data e hora da compra  
Nome, quantidade e preço de cada item comprado  
Total, subtotais e valores de impostos  
Os dados em formulários são reconhecidos com caixas de delimitação.

Captura de tela de um recibo digitalizado para a compra de um Surface Pro e uma Caneta Surface.

Por exemplo, as informações de endereço no recibo são salvas como um field name, address e um value, 123 Main Street com coordenadas \[4.1, 2.2\], \[4.3, 2.2\], \[4.3, 2.4\], \[4.1, 2.4\]. Os modelos de aprendizado de máquina podem interpretar os dados em um documento ou formulário porque são treinados para reconhecerem padrões nos locais de coordenadas de caixa delimitadora.

Os resultados da extração de dados são associados a níveis de confiança para cada campo e par de dados. Esse nível de confiança é uma porcentagem entre 0 e 1, indicando o nível provável de precisão. Os dados extraídos com uma pontuação de confiança alta (mais próxima de 1\) podem ser confiados com mais confiança para realmente representar o que está no conteúdo original.

Entender a extração de dados multimodal  
Técnicas de extração de informações alimentadas por IA podem ser combinadas para executar a extração de dados em várias modalidades de conteúdo, de documentos a vídeo e áudio. O uso da extração de dados multimodal pode ajudar no gerenciamento de ativos digitais, automação de fluxo de trabalho, geração de insights adicionais e muito mais.

A orquestração de técnicas de extração pode incluir visão e inteligência de documentos, e outras, incluindo:

O processamento de linguagem natural pode ser usado para localizar frases-chave, entidades, sentimento etc. em linguagem escrita ou falada.  
 Observação

Os conceitos de aprendizado de máquina associados ao NLP são abordados detalhadamente em Introdução aos conceitos de processamento de linguagem natural.

O reconhecimento de fala usa a palavra falada e a converte em dados que podem ser processados, muitas vezes transcrevendo-a em texto. As palavras faladas poderão estar no formato de uma voz gravada em um arquivo de áudio ou em um áudio ao vivo de um microfone.  
 Observação

O reconhecimento de fala é abordado em Introdução à fala no Azure.

A IA generativa pode adicionar ao processo de extração de dados, permitindo que os usuários identifiquem seus próprios campos e descrições de campo. Pode ser particularmente útil ao lidar com conteúdo não estruturado. Um exemplo é o campo adicionado pelo usuário de "resumo". O valor associado ao campo deve ser gerado com base nos dados no conteúdo.  
 Observação

Os conceitos de IA generativa são abordados detalhadamente em Introdução à IA generativa no Azure.

O fluxo de processamento de conteúdo para extração de informações multimodais pode incluir camadas dessas técnicas de extração. Um exemplo da saída do pipeline são insights estruturados e conteúdo gerado adicional.

Captura de tela dos possíveis componentes da extração de informações multimodal.

Entender a extração de dados para mineração de conhecimento  
As soluções de mineração de conhecimento fornecem extração automatizada de informações de grandes volumes de dados muitas vezes não estruturados. Uma solução de mineração de conhecimento fundamental é a pesquisa, o processo de recuperação de informações relevantes de um grande conjunto de dados em resposta a uma consulta de usuário. A extração de informações alimentadas por IA dá suporte a melhorias no que é pesquisável em um índice de pesquisa.  
Na extração de informações de IA para pesquisa, o conteúdo passa primeiro pela Quebra de documento. A quebra de documento descreve a abertura de formatos de documento, como PDFs, para extrair o conteúdo como texto ASCII para análise e indexação.  
Em seguida, o conteúdo passa pelo enriquecimento de IA, que implementa a IA em seu conteúdo original para extrair mais informações. Exemplos de enriquecimento de IA incluem a adição de legendas a uma foto e a avaliação do sentimento do texto. O conteúdo enriquecido com IA pode ser enviado para um repositório de conhecimento, que persiste a saída de um pipeline de enriquecimento de IA para análise independente ou processamento downstream.  
Os dados resultantes são serializados como dados JSON. O JSON preenche o índice de pesquisa. O índice de pesquisa populado pode ser explorado por meio de consultas. Quando os usuários fazem uma consulta de pesquisa, como "café", o mecanismo de pesquisa procura essas informações no índice de pesquisa. Um índice de pesquisa tem uma estrutura semelhante a uma tabela, conhecida como esquema do índice. Um esquema de índice de pesquisa típico contém campos, o tipo de dados do campo (como cadeia de caracteres) e atributos de campo. Os campos armazenam textos pesquisáveis e os atributos de campo permitem ações como filtragem e classificação. Abaixo está um exemplo de um esquema de índice de pesquisa:  
![Uma captura de tela da estrutura de um esquema de índice em JSON, incluindo frases-chave e rótulos de imagem.][image1]  
Um resultado é uma solução de pesquisa que normalmente inclui os seguintes componentes:

| Componente | Função |
| :---- | :---- |
| Camada de API | Aceita consultas de usuário e as roteia para o mecanismo de pesquisa. |
| Processador de Consultas | Analisa e interpreta a consulta. |
| Estratégias de pesquisa | Determina como pesquisar , por exemplo, palavra-chave, semântica, vetor ou híbrido. |
| Mecanismo de execução | Executa a consulta no índice de pesquisa. A extração de informações impulsionadas por IA se adiciona aos dados pesquisáveis. |
| Agregador de resultados | Combina resultados de várias fontes em uma lista unificada. |
| Mecanismo de classificação | Classifica os resultados com base na relevância, no frescor, na popularidade ou nos sinais de IA. |
| Formatador de resposta | Formata os resultados para exibição na interface do usuário. |

[image1]: <data:image/png;base64,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>