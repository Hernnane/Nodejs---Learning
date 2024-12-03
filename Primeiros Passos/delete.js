const fs = require('fs');
const read = require('readline');

fs.unlink('hernnane.txt', function(err){
    console.log('Arquivo deletado!');
})