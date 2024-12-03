const fs = require('fs');
const read = require('readline');

fs.rename('hernnane.txt', 'hernnane-gabriel.txt', (err)=>{
    console.log('Arquivo renomeado!');
})