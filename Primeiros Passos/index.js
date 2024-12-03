const http = require('http'); //Importa o módulo HTTP (permite criar um servidor web)
const fs = require('fs'); //Importa o módulo File System (permite manipular arquivos e diretórios)

const hostname = "127.0.0.1"; //O local onde esse servidor vai funcionar (localhost)

const port = 3000; //Porta de entrada para o servidor

//Criando o servidor 
const server = http.createServer((req, res)=>{ //A função "http.createServer" cria o servidor REQ = >Requisição / RES => Resposta do servidor (Callback)
   
/*  res.statusCode = 200; //Status HTTP da resposta do servidor (200 => tudo certo)
    res.setHeader('Content-Type', 'text/plain');// res.serHeader => define o tipo de conteúdo que o servidor vai enviar (text/plain => conteúdo simples/sem formatação)

    res.end("Salve do Hernnane"); //Finaliza a resposta e envia uma mensagem para o cliente*/

    if(req.url == '/hernnane'){ //req.url => o caminho que o cliente solicitou 

        fs.readFile('index.html', function(err,data){ //Pede para ler o arquivo index.html (se o arquivo existit salva em "data" / se não existir o erro é salvo em "err")
            res.writeHead(200,{'Content-Type':'text/html'}) //Define o cabeçalho da resposta HTTP (200 => tudo certo / Content-Type: 'text/html' = > servidor está enviando um arquivo HTML)
            res.write(data); //Escreve o conteúdo HTML na resposta
            return res.end(); //res.end() = > informa ao navegador que o servidor terminou de enviar dados / return => garante que o código pare aqui
        })

        //Cria novo arquivo
        fs.writeFile('hernnane.txt', 'teste-hernnane', function(err){ //fs.writeFile => cria arquivos (nomeArquivo, conteudoArquivo, tratamentoErro)
            if(err)throw err;
            console.log('Arquivo criado com sucesso!');
        })

        //Cria novo arquivo ou insere conteúdo depois do que ja existe
        fs.appendFile('hernnane.txt', '\nOutro conteudo', (err)=>{
            if (err) throw err;
            console.log('Salvo com sucesso!');
        });

    } 
    else {
        return res.end();
    }
});

//Iniciando o Servidor
server.listen(port, hostname, ()=>{
    console.log("servidor está rodando");
});