// Importa o módulo Express e instancia a aplicação na variável `app`
const app = require('express')();

// Importa o módulo HTTP do Node.js e cria um servidor utilizando a aplicação Express
const http = require('http').createServer(app);

// Importa o módulo Socket.IO e conecta ao servidor HTTP
const io = require('socket.io')(http);

// Cria um array vazio para armazenar os nomes dos usuários conectados
var usuarios = [];

// Cria um array vazio para armazenar os IDs dos sockets correspondentes aos usuários
var socketIds = [];

// Define uma rota GET para a página principal do site (rota '/')
app.get('/', (req, res) => {
    // Envia o arquivo `index.html` como resposta à requisição GET
    res.sendFile(__dirname + '/index.html');
});

// Configura um evento para executar sempre que um cliente se conectar ao servidor
io.on('connection', (socket) => {

    // Evento para tratar quando um novo usuário tenta se conectar
    socket.on('new user', function (data) {

        // Verifica se o nome do usuário já existe no array `usuarios`
        if (usuarios.indexOf(data) != -1) {
            // Se o nome já existe, informa ao cliente que a conexão não foi bem-sucedida
            socket.emit('new user', { success: false });
        } else {
            // Adiciona o novo nome de usuário no array `usuarios`
            usuarios.push(data);

            // Adiciona o ID do socket do usuário no array `socketIds`
            socketIds.push(socket.id);

            // Informa ao cliente que a conexão foi bem-sucedida
            socket.emit('new user', { success: true });

            // Emit pode ser usado para notificar outros usuários sobre o novo usuário ativo
            // socket.broadcast.emit("hello", "world");
        }
    });

    // Evento para tratar o envio de mensagens no chat
    socket.on('chat message', (obj) => {

        // Verifica se o nome do usuário e o ID do socket correspondem
        if (usuarios.indexOf(obj.nome) != -1 && usuarios.indexOf(obj.nome) == socketIds.indexOf(socket.id)) {
            // Se a validação for bem-sucedida, emite a mensagem para todos os clientes conectados
            io.emit('chat message', obj);
        } else {
            // Se a validação falhar, exibe uma mensagem de erro no console
            console.log('Erro: Você não tem permissão para executar a ação.');
        }
    });

    // Evento que é executado quando o cliente se desconecta do servidor
    socket.on('disconnect', () => {

        // Localiza o índice do ID do socket no array `socketIds`
        let id = socketIds.indexOf(socket.id);

        // Remove o ID do socket do array `socketIds`
        socketIds.splice(id, 1);

        // Remove o nome do usuário correspondente do array `usuarios`
        usuarios.splice(id, 1);

        // Exibe os arrays atualizados no console
        console.log(socketIds);
        console.log(usuarios);

        // Exibe no console que o usuário foi desconectado
        console.log('user disconnected');
    });

});

// Define a porta em que o servidor estará funcionando (porta 3000)
http.listen(3000, () => {
    // Exibe no console uma mensagem informando que o servidor está ativo
    console.log('listening on *:3000');
});