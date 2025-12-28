const fs = require('fs');


fs.createReadStream('source.txt')
  .pipe(fs.createWriteStream('destination.txt'))
  .on('finish', () => {
    console.log('File copied successfully.');
  })
  .on('error', (err) => {
    console.error('Error during file copy:', err);
  });





