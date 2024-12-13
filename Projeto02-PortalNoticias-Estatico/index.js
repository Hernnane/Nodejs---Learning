// Importa o módulo Express, que será usado para criar o servidor e gerenciar rotas
const express = require('express');
// Importa o módulo 'path', usado para lidar com caminhos de arquivos/diretórios
const path = require('path');
// Importa o módulo BodyParser, usado no Express para fazer o parsing (processamento) dos dados no corpo da requisição HTTP
var bodyparser = require('body-parser');
// Importa o módulo Mongoose, usado para se conectar com o banco de dados MongoDB
const mongoose = require('mongoose');
// Importa o módulo fileUpload
const fileUpload = require('express-fileupload');
// Importa o módulo FileSystem
const fs = require('fs');

/******************************************************************************************************************************************************** */
// Cria uma instância da aplicação Express, representando o servidor
const app = express();

// Importa o MÓDULO Posts do arquivo Posts.js que criamos e determinamos o Schema("tabela")
const Posts = require('./Posts.js');

// Importa o módulo express-session, usado para dados persistentes | armazena informações necessárias Ex: login/senha
var session = require('express-session');

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

// Configura o session dentro da aplicação express
app.use( session ({
    secret: 'keyboard cat',     // Define uma chave secreta usada para assinar a sessão
    //resave: false,              // A sessão somente será salva caso alguma alteração seja feita
    //saveUninitialized: true,    // Define que uma sessão não inicializada (sem dados) também será salva
    cookie: {maxAge: 60000}      // O cookie somente será enviado ao servidor se a conexão for segura
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

// Importa o módulo fileUpload que fará o processamento dos arquivos do projeto
app.use(fileUpload({
    useTempFiles: true, // Arquivos serão armazenados temporariamente no disco, e não somente na memória
    tempFileDir: path.join(__dirname, 'temp') // Define o diretório onde os arquivos serão mantidos temporariamente (seta o caminho do diretório)
}));

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

// Criando um array dee usuários (para o login sem bando de dados) *login/senha*
var usuarios = [
    {
        login: 'hernnane',
        senha: '123456'
    },

    {
        login: 'caioba',
        senha: '123456'
    },

    {
        login: 'guido',
        senha: '123456'
    },
];

// Rota de login (express-session) POST
app.post('/admin/login', (req,res)=>{
    usuarios.map(function(val){
        if(val.login == req.body.login && val.senha == req.body.senha){
            req.session.login = 'Hernnane';
        }
    })
    res.redirect('/admin/login');
});

// Rota de login (express-session) GET
app.get('/admin/login', async (req, res) => {
    try {
        // Aguarda a busca das notícias no banco de dados
        const posts = await Posts.find({}).sort({ '_id': -1 });

        // Remapeia/adapta o conteúdo dos posts
        const formattedPosts = posts.map(val => ({
            id: val._id,
            titulo: val.titulo,
            conteudo: val.conteudo,
            descricaoCurta: val.conteudo.substring(0, 100), // Substring para pegar os primeiros 100 caracteres
            imagem: val.imagem,
            slug: val.slug,
            categoria: val.categoria
        }));

        // Verifica se o usuário está logado
        if (req.session.login == null) {
            res.render('admin-login'); // Renderiza a página de login caso não esteja logado
        } else {
            res.render('admin-panel', { posts: formattedPosts }); // Renderiza o painel com os posts
        }
    } catch (err) {
        console.error('Erro ao carregar a página de login/admin:', err); // Log de erros no servidor
        res.status(500).send('Erro interno no servidor'); // Retorna uma mensagem de erro ao cliente
    }
});



// Rota de cadastro de notícias - POST
app.post('/admin/cadastro', (req,res)=>{
    //console.log(req.body);

    let formato = req.files.arquivo.name.split('.'); // Divide o caminho do arquivo recebido, separando o nome por '.'
    var imagem = new Date().getTime()+'.jpg';

    // Bloco if para saber se o arquivo tem extensão jpg
    if(formato[formato.length - 1] =="jpg"){ // formato.length -1 => pega a última posição do array gerado pela divisão de palavras salva na variável formatos 
        req.files.arquivo.mv(__dirname+'/public/images/'+imagem); // mv() => função para mover o arquivo para outro diretório | date().getTime() está sendo usado para adicionar um nome único para o arquivo salvo
    } else{
        fs.unlinkSync(req.files.arquivo.tempFilePath); // unlinkSync => função para excluir um arquivo | tempFilePath => seleciona o arquivo temporário que foi gerado anteriormente
    }

    Posts.create({
        titulo: req.body.titulo_noticia,
        imagem: 'http://localhost:5000/public/images/'+imagem,
        categoria: 'Nenhuma',
        conteudo: req.body.noticia,
        slug: req.body.slug,
        autor: 'Admin',
        views: 0
    });
    res.redirect("/admin/login");
});

app.get('/admin/deletar/:id', (req,res)=>{
    Posts.deleteOne({_id:req.params.id}).then(function(){
        res.redirect('/admin/login');
    });
});

/************************************************************************************************************************************************************ */
// Inicia o servidor na porta 5000
// Quando o servidor estiver rodando, ele imprime a mensagem no console
app.listen(5000, () => {
    console.log('Servidor rodando!');
});
