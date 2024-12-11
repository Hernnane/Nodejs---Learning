// Importa o módulo Express, que será usado para criar o servidor e gerenciar rotas
const express = require('express');
// Importa o módulo 'path', usado para lidar com caminhos de arquivos/diretórios
const path = require('path');
// Importa o módulo BodyParser, usado no Express para fazer o parsing (processamento) dos dados no corpo da requisição HTTP
var bodyparser = require('body-parser');
// Importa o módulo Mongoose, usado para se conectar com o banco de dados MongoDB
const mongoose = require('mongoose');

/******************************************************************************************************************************************************** */
// Cria uma instância da aplicação Express, representando o servidor
const app = express();

// Importa o MÓDULO Posts do arquivo Posts.js que criamos e determinamos o Schema("tabela")
const Posts = require('./Posts.js');

// String de conexão
const uri = 'mongodb+srv://root:dqRAzK6CiJg3FaiU@cluster0.odf59.mongodb.net/Hernnane?retryWrites=true&w=majority';

// Conectando ao MongoDB
mongoose.connect(uri)
  .then(() => {
    console.log('Conectado com sucesso');
  })
  .catch(err => {
    console.log('Erro ao conectar ao MongoDB:', err.message);
  });

// Configura o body-parser para processar dados JSON
// Quando o cliente enviar dados no formato JSON, o Express os converte em um objeto JavaScript
app.use(bodyparser.json());

// Configura o body-parser para processar dados de formulários HTML
// Isso transforma dados do tipo 'application/x-www-form-urlencoded' em um objeto JavaScript
// 'extended: true' permite objetos mais complexos (arrays e objetos dentro do formulário)
app.use(bodyparser.urlencoded({
    extended: true
}));

// Configura o motor de visualização para renderizar arquivos HTML com o EJS
// O EJS é um motor de templates que permite incluir lógica em arquivos HTML
app.engine('html', require('ejs').renderFile);

// Define o motor de visualização padrão como 'html'
// Isso diz ao Express para usar HTML como formato principal para renderizar as views
app.set('view engine', 'html');

// Configura a pasta de arquivos estáticos (como CSS, JavaScript e imagens)
// Aqui, a URL '/public' será mapeada para a pasta local 'public'
app.use('/public', express.static(path.join(__dirname, 'public')));

// Define o diretório onde as views (arquivos HTML/EJS) estão localizadas
// __dirname refere-se ao diretório atual, e '/views' é a pasta onde os templates ficam
app.set('views', path.join(__dirname, '/pages'));

/******************************************************************************************************************************************************** */
/* CONFUGURAÇÃO DAS ROTAS DO SITE */

// Rota principal
app.get('/', async (req, res) => {
    try { // Bloco main
        if (req.query.busca == null) { // Verifica se existe um filtro de pesquisa na página
            // Busca todos os posts no banco de dados e os ordena pelo _id em ordem decrescente
            const posts = await Posts.find({}).sort({ '_id': -1 });
            // Busca todos os posts no banco de dados, ordena pela view em ordem decrescente e limita o máximo de posts a serem exibidos
            const postsTop = await Posts.find({}).sort({'views': -1}).limit(3);

            // Mapeia (atualiza/adapta) os posts para adicionar uma descrição curta
            const formattedPosts = posts.map(val => ({
                titulo: val.titulo,
                conteudo: val.conteudo,
                descricaoCurta: val.conteudo.substring(0, 100), // Substring para pegar os primeiros 100 caracteres
                imagem: val.imagem,
                slug: val.slug,
                categoria: val.categoria
            }));

            // Mapeia (atualiza/adapta) os postsTop para adicionar uma descrição curta
            const orderedPosts = postsTop.map(val => ({
                titulo: val.titulo,
                conteudo: val.conteudo,
                descricaoCurta: val.conteudo.substring(0, 100), // Substring para pegar os primeiros 100 caracteres
                imagem: val.imagem,
                slug: val.slug,
                categoria: val.categoria,
                views: val.views
            }));

            // Renderiza a página 'home' com os posts formatados
            res.render('home', { posts: formattedPosts, postsTop: orderedPosts });
        } else {

            // Renderiza a página de busca caso o parâmetro de busca seja enviado
            // Pode-se criar uma página de erro

            // Procura no banco de dados os posts que tenham o título igual o conteúdo pesquisado / &regex => operador  de buscas por expressões / $options => define se será case sensitive-insensitive
            const postsPesquisa = await Posts.find({titulo: {$regex: req.query.busca, $options: "i"}});       

            //Mapeia (atualiza/adapta) os postsPesquisa para adicionar uma descrição mais curta
            const postsP = postsPesquisa.map(val => ({
                titulo: val.titulo,
                conteudo: val.conteudo,
                descricaoCurta: val.conteudo.substring(0, 300), // Substring para pegar os primeiros 100 caracteres
                imagem: val.imagem,
                slug: val.slug,
                categoria: val.categoria,
                views: val.views
            }));

            // Exibe no console os posts que correspondem à pesquisa do usuário
            console.log(postsPesquisa);
            // Envia os postsPesquisa para a página HTML 'busca'
            res.render('busca', { postsPesquisa: postsP, contagem: postsPesquisa.length });

        }
    } catch (err) {
        console.error('Erro ao buscar posts:', err);
        res.status(500).send('Erro interno no servidor');
    }
});


// Rota para exibir o post individual baseado no 'slug'
app.get('/:slug', async (req, res) => {
    try {
        // Busca o post baseado no slug e incrementa a contagem de visualizações
        const post = await Posts.findOneAndUpdate(
            { slug: req.params.slug }, // Critério de busca
            { $inc: { views: 1 } },   // Incrementa a contagem de visualizações
            { new: true }             // Retorna o documento atualizado
        );

        // Verifica se o post foi encontrado
        if (!post) {
            return res.status(404).send('Post não encontrado');
        }

        // Enviando as noticias mais lidas pra tela individual
        const postsML = await Posts.find({}).sort({'views': -1}).limit(3);

        const postMaisLidas = postsML.map(val => ({
            titulo: val.titulo,
                conteudo: val.conteudo,
                descricaoCurta: val.conteudo.substring(0, 100), // Substring para pegar os primeiros 100 caracteres
                imagem: val.imagem,
                slug: val.slug,
                categoria: val.categoria,
                views: val.views
        }));

        // Renderiza a página 'single' com os dados do post
        res.render('single', { noticia: post, postsML: postMaisLidas });
    } catch (err) {
        console.error('Erro ao buscar o post:', err);
        res.status(500).send('Erro interno no servidor');
    }
});


/************************************************************************************************************************************************************ */
// Inicia o servidor na porta 5000
// Quando o servidor estiver rodando, ele imprime a mensagem no console
app.listen(5000, () => {
    console.log('Servidor rodando!');
});
