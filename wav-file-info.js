// Hi Welcome to WFI by David Jones / RackFX, LLC
var fs = require('fs');


var wfi = {}

wfi.infoByFilename = function(filename, cb){
  var buffer = new Buffer(40);  // first 40 bytes are RIFF header
  fs.open(filename, 'r', function(status, fd) {
    if(status) return cb(status);  // error probably TODO:check this!
    console.log('status',status);
    // ex error -
    // { [Error: ENOENT: no such file or directory, open './test.wav'] errno: -2, code: 'ENOENT', syscall: 'open', path: './test.wav' }
    var read_result = {}
    var reads = [
      ['riff_head', 'string', 4],
      ['chunk_size','integer', 4],
      ['wavefmt', 'string', 8],
      ['subchunk_size','integer',4],
      ['audio_format','integer',2],
      ['num_channels','integer',2],
      ['sample_rate','integer',4],
      ['byte_rate','integer',4],
      ['block_align','integer',2],
      ['bits_per_sample','integer',2]
    ]
    fs.read(fd, buffer, 0, 40, 0, function(err, num) {

      var i=0;
      var pointer = 0;
      function read_wav(){
        var read = reads[i];


        i++;
        if(read[1]=='string'){
          read_result[read[0]] = buffer.toString('ascii', pointer , pointer + read[2]);
          //console.log(buffer[pointer], buffer[pointer+1], buffer[pointer+2].toString)
          pointer = pointer + read[2];   // pointer = pointer plus # bytes
          if(i < reads.length) {read_wav()}
          else { post_process(); }

        }
        else if(read[1]=='integer'){
          read_result[read[0]] = buffer.readIntLE(pointer, read[2])
          pointer = pointer + read[2];
          if(i < reads.length) { read_wav() }
          else { post_process();}
        }

      }
      read_wav();
    }); // end fs.read

    function post_process(){
      cb(null, read_result);
    }

  });
}


module.exports = wfi;


wfi.infoByFilename('./test.wav', function(err, info){
  console.log(info);
})
