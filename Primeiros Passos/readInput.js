const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin, 
    output: process.stdout
});

rl.question('Qual o seu nome?', (name)=>{
    console.log('O nome do usuário é: ' +name);
    rl.question('Qual sua idade?', (idade)=>{
        console.log('A idade do ' +name+ ' é: ' +idade)
    });
});

rl.on('close', ()=>{
    console.log('Adeus!');
    process.exit(0);
})