var wavFileInfo= require('./wav-file-info.js');

wavFileInfo.infoByFilename('./test.wav', function(err, info){
  if (err) throw err ;
  console.log(err, info);
})
