// Hi Welcome to WFI by David Jones / RackFX, LLC
var fs = require('fs');
var wfi = {}

wfi.infoByFilename = function(filename, cb) {
   var stats = fs.statSync(filename)
   var buffer = new Buffer(80);  // first 40 bytes are RIFF header
   fs.open(filename, 'r', function(err, fd) {
      if (err) return cb(err);  // error probably TODO:check this!

      // ex error -
      // { [Error: ENOENT: no such file or directory, open './test.wav'] errno: -2, code: 'ENOENT', syscall: 'open', path: './test.wav' }
      var read_result = {}


      // this a list of sequenced bytes in the 40 byte header. This builds the read_result object.
      //  Property name / Data type / Length
      var reads = [
         ['riff_head', 'string', 4],
         ['chunk_size', 'uinteger', 4],
         ['wave_identifier', 'string', 4],
         ['fmt_identifier', 'string', 4],
         ['subchunk_size', 'integer', 4],
         ['audio_format', 'integer', 2],
         ['num_channels', 'integer', 2],
         ['sample_rate', 'uinteger', 4],
         ['byte_rate', 'integer', 4],
         ['block_align', 'integer', 2],
         ['bits_per_sample', 'integer', 2],
         //['uhm','integer',2],
         ['data_identifier', 'string', 4],
         //['sub_chunk2_size', 'integer', 4],

      ];
      
      
      fs.read(fd, buffer, 0, 80, 0, function(err, num) {

         var i = 0;
         var pointer = 0;
         function read_wav() {
            var read = reads[i];

            i++;
            
            switch (read[1]) {
               case 'string':
                  read_result[read[0]] = buffer.toString('ascii', pointer, pointer + read[2]);
                  pointer += read[2];   // pointer = pointer plus # bytes
                  break;
               case 'integer':
                  read_result[read[0]] = buffer.readUInt16LE(pointer, read[2])
                  pointer += read[2];
                  
                  // move past the JUNK chunk and backup our index in the reads process to properly get the next chunk
                  if (read_result.fmt_identifier === 'JUNK' && read[0] == 'subchunk_size') {
                     // JUNK chunk is the subchunk size + 1 unused byte when the subchunk size is an odd number
                     pointer += read_result.subchunk_size + (read_result.subchunk_size % 2);
                     // backup, backup
                     i--;
                     i--;
                  }
                  break;
               case 'uinteger':
                  read_result[read[0]] = buffer.readInt32LE(pointer, read[2])
                  pointer += read[2];
                  break;
            }
               
            if (i < reads.length) {
               return read_wav(); 
            }
            else {
               return post_process();
            }

         }
         //console.log(i)
         read_wav();
      }); // end fs.read

      function post_process() {
         var error = false;
         var invalid_reasons = []

         if (read_result.riff_head != "RIFF") invalid_reasons.push("Expected \"RIFF\" string at 0")
         if (read_result.wave_identifier != "WAVE") invalid_reasons.push("Expected \"WAVE\" string at 4")
         if (read_result.fmt_identifier != "fmt ") invalid_reasons.push("Expected \"fmt \" string at 8")
         if ((read_result.audio_format != 1) && (read_result.audio_format != 3)) invalid_reasons.push("Unknwon format: " + read_result.audio_format)
         if ((read_result.chunk_size + 8) !== stats.size) invalid_reasons.push("chunk_size does not match file size")
         //if ((read_result.data_identifier) != "data") invalid_reasons.push("Expected data identifier at the end of the header")

         if (invalid_reasons.length > 0) error = true;

         if (error) return cb({
            error: true,
            invalid_reasons: invalid_reasons,
            header: read_result,
            stats: stats
         });

         cb(null, {
            header: read_result,
            stats: stats,
            duration: ((read_result.chunk_size) / (read_result.sample_rate * read_result.num_channels * (read_result.bits_per_sample / 8)))
         });
      }
   });
}
module.exports = wfi;
