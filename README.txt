MUSEU VIRTUAL DOS LIVROS – PRAZERES INTERRUPIDOS
MODELO 3D NAVEGÁVEL – VERSÃO 0.2

Esta versão é uma evolução do protótipo anterior. Foi construída para ser independente do museu OpenVGal antigo, permitindo desenvolver a arquitectura e a navegação sem alterar o projecto anterior.

O QUE FOI ALTERADO
- Separação das Galerias IV, V e VI.
- Galeria Temática / Exposições Temporárias junto ao Jardim da Leitura.
- Aberturas reais nas paredes para entrada e saída das salas.
- Colisões: o visitante deixa de atravessar paredes.
- Navegação por teclado e rato no computador.
- Navegação por joystick e gesto de arrastar no telemóvel/tablet.
- Mapa com acesso directo às salas.
- Clique/toque numa capa para abrir a ficha da obra.
- Sistema preparado para procurar automaticamente o MP3 pelo código E###, ignorando o restante nome do ficheiro.
- Botão Play/Pausa para o episódio seleccionado.
- Sistema preparado para capas reais por código.
- Mantida a interface em português.

ÁUDIO
O código procura os episódios no repositório definido no início do index.html:

AUDIO_REPO = prazeres-interrompidos/museu-3d-prazeres-interrompidos
AUDIO_FOLDER = EPISÓDIOS PARA O MUSEU

O nome completo do MP3 não é relevante. O sistema procura o ficheiro cujo nome começa pelo código, por exemplo:
E544 (voz de Rodrigo Alves) – A História do Rei Artur...mp3

CAPAS
As capas podem ser colocadas na pasta CAPAS com nomes por código:
E001.jpg
E002.jpg
...
E544.jpg

Se uma capa ainda não existir, o museu mostra a capa de substituição gerada pelo próprio modelo.

IMPORTANTE
Esta versão não contém os MP3 nem as capas reais. Para os utilizar no GitHub, basta copiar esses ficheiros para as respectivas pastas. Não é necessário alterar a lógica do index.html.

PUBLICAÇÃO NO GITHUB PAGES
1. Criar/enviar os ficheiros deste pacote para a raiz do repositório.
2. Activar GitHub Pages para a branch main e a pasta /.
3. Colocar os MP3 em “EPISÓDIOS PARA O MUSEU”.
4. Colocar as capas em “CAPAS”.
5. Abrir a página publicada e testar primeiro E001 e depois E544.

NOTA SOBRE O ÁUDIO
Os navegadores podem impedir reprodução automática sem uma acção do visitante. Neste modelo o áudio só começa quando o visitante prime explicitamente “Ouvir episódio”, pelo que a reprodução respeita essa limitação.
