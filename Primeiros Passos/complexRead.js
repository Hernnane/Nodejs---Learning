const fs = require('fs');

fs.readFile('gah.txt', function(err, data){
    let str = data.toString();

    //let newStr = str.split('/');

    let newStr = str.substr(1,3); //Indica a partir de qual caracter começa a exibir (índice, quantidade)

    console.log(newStr);
})