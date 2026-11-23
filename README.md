# Detecção de EPIs: dataset anotado + explorador em Angular

Teste técnico para a vaga de estágio (Anotação de Dados + Angular).

O projeto tem duas partes:

1. **Dataset:** 33 imagens de pessoas em ambientes de obra e indústria, anotadas com *bounding boxes* para detecção de EPIs (equipamentos de proteção individual).
2. **Aplicação Angular:** carrega o arquivo COCO JSON exportado na Parte 1 e permite explorar o dataset: galeria, imagem com as caixas desenhadas, filtro por classe e estatísticas.

## Status

- [x] 33 imagens anotadas (166 anotações) e exportadas em COCO JSON e YOLO
- [x] Galeria com miniaturas, nome do arquivo e quantidade de anotações
- [x] Visualização da imagem com caixas coloridas por classe
- [x] Filtro por classe
- [x] Estatísticas (total de imagens, total de anotações, quantidade por classe e média por imagem)
- [x] Carregamento do JSON por `public/` e por upload de arquivo, com mensagem amigável em caso de erro
- [x] Prettier configurado e `ng lint` sem erros
- [ ] Testes automatizados (veja "O que eu faria de diferente")

## Estrutura do repositório

```
/
├── dataset/
│   ├── images/                 # as 33 imagens
│   ├── annotations_coco.json   # anotações em COCO JSON
│   └── annotations_yolo/       # anotações em YOLO (um .txt por imagem + classes.txt)
├── app/                        # projeto Angular
├── tools/
│   └── yolo-to-coco.mjs        # script que converte as anotações YOLO em COCO
└── README.md
```

## Como rodar o projeto

Pré-requisito: Node.js com npm (o projeto foi desenvolvido e testado com Node 24).

```bash
cd app
npm install
npm start
```

Depois abra `http://localhost:4200` no navegador.

Outros comandos, também dentro de `app/`:

| Comando | O que faz |
|---|---|
| `npm run format` | Formata o código com Prettier |
| `ng lint` | Roda o ESLint |
| `npm run build` | Gera o build de produção |

### Como a aplicação lê o dataset

Ao abrir, a aplicação carrega `app/public/dataset/annotations_coco.json`. Também é possível escolher outro arquivo COCO JSON pelo botão de upload no topo da página.

`app/public/dataset/` contém uma **cópia** de `dataset/images/` e de `dataset/annotations_coco.json`, porque o navegador só consegue servir arquivos que estão dentro de `public/`. As versões em `dataset/` são as originais do trabalho de anotação.

## Parte 1: anotação de imagens

### Ferramenta e formatos

- Ferramenta: [makesense.ai](https://www.makesense.ai), modo *Object Detection* com retângulos (*bounding boxes*).
- O makesense.ai exporta **YOLO** para retângulos, mas **não exporta COCO JSON** para eles (a opção só aparece para polígonos, e o arquivo sai vazio). Por isso o COCO foi gerado a partir do YOLO com o script `tools/yolo-to-coco.mjs` (Node, sem dependências), que lê o tamanho real de cada imagem e converte as caixas relativas do YOLO para pixels no formato `[x, y, largura, altura]`.

Para regenerar o COCO depois de alterar as anotações, na raiz do repositório:

```bash
node tools/yolo-to-coco.mjs
```

Depois, copie o novo `dataset/annotations_coco.json` para `app/public/dataset/`.

### Classes

| Classe | O que foi marcado | O que não foi marcado |
|---|---|---|
| `pessoa` | Toda pessoa visível, inclusive parcialmente (só a parte visível) | Pessoa muito pequena ao fundo ou coberta em mais de 80% |
| `capacete` | Capacete de segurança sendo usado | Capacete na mão, no chão ou pendurado |
| `colete` | Colete refletivo sendo usado | Colete em cabide, dobrado ou fora do corpo |
| `sem_capacete` | Cabeça de uma pessoa sem capacete de segurança | Cabeça que não está visível o suficiente para decidir |

Total no dataset: 166 anotações (`pessoa` 67, `capacete` 50, `sem_capacete` 17, `colete` 32).

### Critérios adotados

- **Caixa justa:** a caixa envolve o objeto inteiro, sem cortar partes e sem sobrar muito fundo. Para objetos parcialmente visíveis, marca-se só a parte visível.
- **Objetos muito pequenos:** ignorados quando têm menos de ~20 px de altura.
- **Oclusão:** ignorados os objetos cobertos em mais de 80%.
- **Capacete quase todo coberto:** se mais de 80% do capacete estiver escondido, não se marca `capacete` nem `sem_capacete` (não é possível saber se a pessoa usa capacete); marca-se apenas `pessoa`. Com pelo menos 20% visível e reconhecível, marca-se `capacete` só na parte visível.
- **`sem_capacete`:** só quando a cabeça estiver claramente visível. Na dúvida, não se marca.
- **Boné, capuz ou gorro:** classificados como `sem_capacete`, pois não são capacetes de segurança.
- **Consistência:** a anotação foi feita por classe (uma classe por vez, percorrendo as imagens), para aplicar a mesma regra de forma uniforme.

### Revisão das anotações

Depois de anotar, usei a própria aplicação (filtro por classe e visualizador) para revisar as caixas. Também rodei uma verificação estrutural simples: para cada pessoa, procurei uma cabeça marcada (`capacete` ou `sem_capacete`) dentro da caixa dela, e vice-versa..


### Dificuldades encontradas

**Na ferramenta e no processo**

- O makesense.ai não exporta COCO para retângulos; a solução foi o script de conversão YOLO para COCO descrito acima.
- O makesense.ai não salva o projeto na nuvem: ao fechar a aba, as anotações se perdem, então exportei com frequência.
- Na tela de anotação, toda caixa nova recebe a label que está ativa na lista, e a primeira (`pessoa`) vem ativa por padrão. Para reduzir trocas de label, anotei uma classe por vez em todas as imagens.


### Origem das imagens

As imagens vêm de bancos públicos e gratuitos.

-> Todas as imagens foram tiradas do pexels, plataforma de compartilhamento de foto, fotos compartilhadas por autores públicos!


## Parte 2: aplicação Angular

### Funcionalidades

1. **Carregamento:** do arquivo em `public/` ao abrir, ou por upload de um COCO JSON.
2. **Galeria:** grade com miniaturas, nome do arquivo e quantidade de anotações.
3. **Visualização:** ao clicar numa imagem, ela é exibida com as caixas por cima e uma cor por classe, com legenda.
4. **Filtro por classe:** mostra apenas as imagens que contêm a classe escolhida.
5. **Estatísticas:** total de imagens, total de anotações, quantidade por classe e média por imagem.
6. **Tratamento de erros:** mensagem amigável se o JSON for inválido, estiver com formato errado ou não carregar.

### Estrutura do código

```
app/src/app/
├── core/
│   ├── models/      # interfaces: estrutura COCO, item da galeria, caixas, estatísticas
│   ├── services/    # DatasetService: carrega o dataset e expõe os dados derivados
│   └── utils/       # validador do COCO e cores por classe
└── features/
    ├── gallery/     # galeria de miniaturas
    ├── viewer/      # imagem com as caixas e legenda
    ├── filter/      # filtro por classe
    ├── stats/       # painel de estatísticas
    └── upload/      # upload do arquivo COCO JSON
```

### Principais decisões técnicas

| Decisão | Por quê |
|---|---|
| Componentes standalone (Angular 22) | Padrão atual do Angular e exigido no teste |
| Interfaces TypeScript para a estrutura COCO, sem `any` | Tipagem forte; erros de campo aparecem na compilação |
| Validador do JSON em tempo de execução (`coco-validator.ts`) | Os tipos do TypeScript não existem em tempo de execução; o validador confere a estrutura real do arquivo e permite exibir uma mensagem amigável |
| `DatasetService` com signals e `computed` | O serviço cuida de dados e lógica; os componentes só apresentam. Galeria, caixas por imagem e estatísticas são calculadas uma única vez, e não em métodos chamados pelo template |
| Componentes pequenos que se comunicam por `input()` e `output()` | Reuso e testabilidade; nenhuma lógica de negócio nos templates |
| `ChangeDetectionStrategy.OnPush` em todos os componentes | Menos ciclos de detecção de mudanças |
| `track` nos `@for` e `loading="lazy"` nas miniaturas | Renderização eficiente de listas e carregamento sob demanda das imagens |
| Caixas desenhadas em **SVG** com `viewBox` do tamanho original da imagem | O SVG escala junto com a imagem, então as caixas (em pixels originais) ficam alinhadas sem cálculo de proporção |
| `vector-effect: non-scaling-stroke` nas caixas | A espessura da linha fica constante mesmo com a imagem reduzida |
| CSS puro | Menos dependências e projeto simples |
| Dataset copiado para `app/public/` | O navegador só serve arquivos de `public/` (o equivalente ao antigo `assets/`) |
| Script em Node para converter YOLO em COCO (`tools/`) | O makesense.ai não exporta COCO para retângulos; o script não precisa de dependências |
| Prettier e ESLint (`angular-eslint`) | Código formatado e sem erros de lint |

### Limitações conhecidas

- As imagens originais são grandes e usadas direto como miniaturas, então a galeria pode demorar a preencher. Optei por não redimensioná-las, para não mexer nas anotações, que estão em pixels da imagem original.
- O dataset foi copiado para `app/public/`: se as anotações forem alteradas, é preciso copiar o novo JSON manualmente.
- Não há testes automatizados. Removi o teste padrão gerado pelo Angular, que deixou de fazer sentido com o código atual.

## O que eu faria de diferente com mais tempo

- **Testes automatizados** para o validador do COCO e para o `DatasetService` (eles concentram a lógica).
- **Miniaturas leves**, geradas por um script, e uso de `NgOptimizedImage`, para a galeria carregar rápido sem alterar as imagens originais.
- **Sincronizar a cópia do dataset automaticamente**, com um script antes do `npm start`, para eliminar a duplicação manual.
- **Revisão cruzada das anotações** por uma segunda pessoa e **mais imagens** com mais variedade (iluminação, ângulo, distância), para o dataset ficar mais robusto.
- **Edição de anotações** na própria aplicação, com exportação do COCO atualizado.
