const fs = require('fs');

fs.readFile('gah.txt', function(err, data){
    console.log(data.toString());
})