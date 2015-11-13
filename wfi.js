var wavFileInfo= require('./wav-file-info.js');

var filename = process.argv[2];

wavFileInfo.infoByFilename(filename, function(err, info){
    console.log(err, info);
  if (err) throw err ;
})
