# Museu Virtual dos Livros — Prazeres Interrompidos

Protótipo navegável 3D em Three.js, preparado para publicação no GitHub Pages.

## Correções desta versão
- As setas têm a orientação física correta: **↑ avança, ↓ recua, ← vira/desloca para a esquerda, → vira/desloca para a direita**.
- O joystick mantém **cima = avançar** e **baixo = recuar**.
- A colisão usa um raio de segurança à volta do visitante e impede atravessar paredes.
- As portas principais têm aberturas reais na geometria, em vez de serem apenas elementos visuais.
- A câmara inicia virada para o edifício.


## Navegação
- Computador: apenas as setas **← ↑ → ↓**.
- Rato: arrastar para olhar em redor.
- Telemóvel/tablet: joystick; **para cima = avançar** e **para baixo = recuar**.
- A circulação é limitada por paredes e só é possível atravessar as portas.
- As salas mantêm o seu nome fixo nas paredes.

## Conteúdo
- Entrada com fachada fotorealista baseada na imagem de referência do Museu.
- Átrio aberto ao céu, com bancos, árvores, flores e a escultura espiralada de livros.
- Galerias com iluminação quente, paredes, teto e painéis visuais.
- As capas E001–E100 continuam na pasta `CAPAS`.
- O áudio pode ser carregado a partir da pasta `EPISÓDIOS PARA O MUSEU` do repositório principal do projeto.

## GitHub Pages
O projeto não precisa de um servidor próprio: pode ser publicado diretamente pela branch `main` e pela pasta raiz `/ (root)`.
