var wfi = require('./wav-file-info.js');

wfi.infoByFilename('./test.wav', function(err, info){
  if (err) THROW (err);
  console.log(err, info);
})
