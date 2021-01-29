// Hi Welcome to WFI by David Jones / RackFX, LLC
var fs = require('fs');
var wfi = {}
var headerSize = 44;

wfi.infoByFilename = function (filename, cb) {
    var stats = fs.statSync(filename)
    var buffer = Buffer.alloc(headerSize);  // first 44 bytes are RIFF header
    fs.open(filename, 'r', function (err, fd) {
        if (err) return cb(err);  // error probably TODO:check this!

        // ex error -
        // { [Error: ENOENT: no such file or directory, open './test.wav'] errno: -2, code: 'ENOENT', syscall: 'open', path: './test.wav' }
        var read_result = {}

        // this a list of sequenced bytes in the 44 byte header. This builds the read_result object.
        // Property name / Data type / Length
        var props = [
            ['riff_head', 'string', 4],
            ['chunk_size', 'uint32', 4],
            ['wave_identifier', 'string', 4],
            ['fmt_identifier', 'string', 4],
            ['sub_chunk_size', 'uint32', 4],
            ['audio_format', 'uint16', 2],
            ['num_channels', 'uint16', 2],
            ['sample_rate', 'uint32', 4],
            ['byte_rate', 'uint32', 4],
            ['block_align', 'uint16', 2],
            ['bits_per_sample', 'uint16', 2],
            ['data_identifier', 'string', 4],
            ['sub_chunk2_size', 'uint32', 4],

        ];
        fs.read(fd, buffer, 0, headerSize, 0, function (err, num) {
            var pointer = 0;

            try {
                for (var i = 0; i < props.length; i++) {
                    var prop = props[i];
                    var name = prop[0];
                    var type = prop[1];
                    var size = prop[2];

                    if (type === 'uint16') {
                        read_result[name] = buffer.readUInt16LE(pointer)
                    } else if (type === 'uint32') {
                        read_result[name] = buffer.readUInt32LE(pointer)
                    } else {
                        read_result[name] = buffer.toString('ascii', pointer, pointer + size);
                    }
                    pointer += size;
                }
            } catch (e) {
                return void cb(e);
            }

            fs.close(fd, post_process);
        });

        function post_process() {
            var error = false;
            var invalid_reasons = []

            if (read_result.riff_head != "RIFF") invalid_reasons.push("Expected \"RIFF\" string at 0")
            if (read_result.wave_identifier != "WAVE") invalid_reasons.push("Expected \"WAVE\" string at 4")
            if (read_result.fmt_identifier != "fmt ") invalid_reasons.push("Expected \"fmt \" string at 8")
            if (
                (read_result.audio_format != 1) &&        // Wav PCM
                (read_result.audio_format != 65534) &&   // Extensible PCM
                (read_result.audio_format != 2) &&       // Wav
                (read_result.audio_format != 6) &&        // Wav ALAW
                (read_result.audio_format != 7) &&        // Wav MULAW
                (read_result.audio_format != 22127) &&   // Vorbis ?? (issue #11)
                (read_result.audio_format != 3))          // Wav
                invalid_reasons.push("Unknown format: " + read_result.audio_format)
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
