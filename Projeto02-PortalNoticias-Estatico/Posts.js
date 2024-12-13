// Importa o módulo Mongoose, usado para se conectar com o banco de dados MongoDB
const mongoose = require('mongoose');
// Importa a funcionalidade do Schema e bota na variável Schema (Schema define como os dados do banco serão estruturados)
const Schema = mongoose.Schema;

// Define um Schema específico de uma tabela e salva essa estrutura na variável postSchema
var postSchema = new Schema({
    titulo: String,
    imagem: String,
    categoria: String,
    conteudo: String,
    slug: String,
    autor: String,
    views: Number
}, {
    versionKey: false
    }, // Desativa o campo __v
 {collection:'posts'}) // Informa para o banco que é pra inserir esse Schema("tabela") em um BD já existente

// Cria um MODELO chamado Posts de acordo com o Schema postSchema feito anteriormente
var Posts = mongoose.model("Posts", postSchema);

// Exporta o MODELO Posts para que seja usado onde necessário dentro do sistema 
module.exports = Posts;