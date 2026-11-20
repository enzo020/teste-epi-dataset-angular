# Detecção de EPIs: dataset anotado + explorador em Angular

Teste técnico para a vaga de estágio (Anotação de Dados + Angular).

O projeto tem duas partes:

1. **Dataset:** imagens de pessoas em ambientes de obra e indústria, anotadas com *bounding boxes* para detecção de EPIs (equipamentos de proteção individual).
2. **Aplicação Angular:** carrega o arquivo COCO JSON exportado na Parte 1 e permite explorar o dataset (galeria, caixas desenhadas sobre a imagem, filtro por classe e estatísticas).

## Status atual

- [x] Repositório criado e estruturado
- [x] Imagens coletadas e renomeadas em `dataset/images/` (`img_001`, `img_002`...)
- [ ] Anotação de todas as imagens no makesense.ai
- [ ] Exportação em COCO JSON e YOLO
- [ ] Aplicação Angular (`app/`)
- [ ] Preenchimento das seções de dificuldades, decisões técnicas e melhorias futuras

## Estrutura do repositório

```
/
├── dataset/
│   ├── images/                 # imagens usadas no treino
│   ├── annotations_coco.json   # anotações em COCO JSON (usado pela app)
│   └── annotations_yolo/       # anotações em formato YOLO
├── app/                        # projeto Angular
└── README.md
```

## Como rodar o projeto

> A aplicação ainda está em desenvolvimento. Esta seção será confirmada quando o projeto Angular estiver pronto.

Pré-requisitos: Node.js e npm instalados.

```bash
cd app
npm install
npm start
```

Depois abra `http://localhost:4200` no navegador.

## Parte 1: anotação de imagens

### Ferramenta e formatos

- Ferramenta: [makesense.ai](https://www.makesense.ai), modo *Object Detection* com retângulos (*bounding boxes*).
- Exportações: **COCO JSON** (`dataset/annotations_coco.json`) e **YOLO** (`dataset/annotations_yolo/`).

### Classes

| Classe | O que foi marcado | O que não foi marcado |
|---|---|---|
| `pessoa` | Toda pessoa visível, inclusive parcialmente (só a parte visível) | Pessoa muito pequena ao fundo ou coberta em mais de 80% |
| `capacete` | Capacete de segurança sendo usado | Capacete na mão, no chão ou pendurado |
| `colete` | Colete refletivo sendo usado | Colete em cabide, dobrado ou fora do corpo |
| `sem_capacete` | Cabeça de uma pessoa sem capacete de segurança | Cabeça que não está visível o suficiente para decidir |

### Critérios adotados

- **Caixa justa:** a caixa envolve o objeto inteiro, sem cortar partes e sem sobrar muito fundo. Para objetos parcialmente visíveis, marca-se só a parte visível.
- **Objetos muito pequenos:** ignorados quando têm menos de ~20 px de altura.
- **Oclusão:** ignorados os objetos cobertos em mais de 80%.
- **Capacete quase todo coberto:** se mais de 80% do capacete estiver escondido, não se marca `capacete` nem `sem_capacete` (não é possível saber se a pessoa usa capacete); marca-se apenas `pessoa`. Com pelo menos 20% visível e reconhecível, marca-se `capacete` só na parte visível.
- **`sem_capacete`:** só quando a cabeça estiver claramente visível. Na dúvida, não se marca.
- **Boné, capuz ou gorro:** classificados como `sem_capacete`, pois não são capacetes de segurança.
- **Consistência:** a anotação foi feita por classe (uma classe por vez, percorrendo as imagens) para aplicar a mesma regra de forma uniforme.

### Dificuldades encontradas

> Preencher com casos reais que apareceram durante a anotação. Exemplos do que registrar:

> - o makesense.ai não exporta COCO para retângulos, e por isso foi usado um script de conversão;
> - casos ambíguos (boné, capuz, capacete na altura do ombro);
> - oclusões (pessoas atrás de máquinas, outras pessoas ou estruturas);
> - pessoas muito pequenas ou desfocadas ao fundo;
> - como cada caso foi decidido e por quê.

- (preencher)

### Origem das imagens

Todas as imagens vêm de bancos públicos e gratuitos ou são fotos próprias. Total: 33 imagens.

| Arquivo |
-----------------
| img_001.jpg 
| img_002.jpg 
| img_003.jpg 
| img_004.jpg 
| img_005.jpg 
| img_006.jpg 
| img_007.jpg 
| img_008.jpg 
| img_009.jpg 
| img_010.jpg 
| img_011.jpg 
| img_012.jpg 
| img_013.jpg 
| img_014.jpg 
| img_015.jpg 
| img_016.jpg 
| img_017.jpg 
| img_018.jpg 
| img_019.jpg 
| img_020.jpg 
| img_021.jpg 
| img_022.jpg 
| img_023.jpg 
| img_024.jpg 
| img_025.jpg 
| img_026.jpg 
| img_027.jpg 
| img_028.jpg 
| img_029.jpg 
| img_030.jpg 
| img_031.jpg 
| img_032.jpg 
| img_033.jpg 

