var wfi = require('./wav-file-info.js');

wfi.infoByFilename('./test.wav', function(err, info){
  if (err) throw err ;
  console.log(err, info);
})
