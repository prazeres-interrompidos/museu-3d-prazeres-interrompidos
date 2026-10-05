# Museu 3D Prazeres Interrompidos

Primeiro protótipo navegável do Museu Virtual dos Livros — Prazeres Interrompidos.

## Navegação
- Computador: WASD/setas para andar; arrastar o rato para olhar.
- Telemóvel/tablet: joystick para andar; arrastar o dedo para olhar.
- Clicar/tocar numa capa abre o episódio.
- O botão "Ouvir episódio" procura o MP3 correspondente em `EPISÓDIOS PARA O MUSEU/`.

## Estrutura
- `index.html` — entrada do museu.
- `css/museu.css` — interface.
- `js/museu.js` — ambiente 3D, navegação e interação.
- `CAPAS/` — capas reais dos livros.
- `EPISÓDIOS PARA O MUSEU/` — áudios.
- `assets/Dream.mp3` — música ambiente (copiar manualmente para esta pasta).

Este protótipo usa Three.js através de CDN. A primeira versão contém capas gráficas de demonstração geradas no próprio navegador; elas serão substituídas pelas capas reais.
