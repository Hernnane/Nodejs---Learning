// Importa o módulo Express, que será usado para criar o servidor e gerenciar rotas
const express = require('express');
// Importa o módulo 'path', usado para lidar com caminhos de arquivos/diretórios
const path = require('path');
// Importa o módulo BodyParser, usado no Express para fazer o parsing (processamento) dos dados no corpo da requisição HTTP
var bodyparser = require('body-parser');
/******************************************************************************************************************************************************** */

// Cria uma instância da aplicação Express, representando o servidor
const app = express();

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

app.get('/', (req, res)=>{
    console.log(req.query);

    if(req.query.busca == null){
        res.render('home',{});
    } else{
        res.render('single', {});
    }
});

app.get('/:slug', (req,res)=>{
    res.render('single', {});
});


/************************************************************************************************************************************************************ */
// Inicia o servidor na porta 5000
// Quando o servidor estiver rodando, ele imprime a mensagem no console
app.listen(5000, () => {
    console.log('Servidor rodando!');
});