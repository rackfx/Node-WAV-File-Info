/* eslint-disable no-inner-declarations */
const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.read);
const openFile = util.promisify(fs.open);

module.exports = {
    /** Read wav file infos asynchronously (use await infoByFilename() OR use the second param callback)
    * @param {String} filenameAbsolute 
    * @param {Function} callback (optionnal)
    * @returns {Object} {
        header: read_result,
        stats: stats,
        duration: ((read_result.chunk_size) / (read_result.sample_rate * read_result.num_channels * (read_result.bits_per_sample / 8)))
    }
    */
    async infoByFilename(filenameAbsolute, callback) {
        const totalAnalysedBytes = 1500;
        const stats = fs.statSync(filenameAbsolute);
        const buffer = new Buffer.alloc(totalAnalysedBytes);  // first 40 bytes are RIFF header
        const fd = await openFile(filenameAbsolute, 'r');
        await readFile(fd, buffer, 0, totalAnalysedBytes, 0);
        // ex error -
        // { [Error: ENOENT: no such file or directory, open './test.wav'] errno: -2, code: 'ENOENT', syscall: 'open', path: './test.wav' }
        const read_result = {};

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

        var i = 0;
        var pointer = 0;

        function readWavChunk() {
            var read = reads[i];
            const nbBytesActualChunk = typeof read[2] === 'function' ? read[2](read_result) : read[2];

            // dynamically find "fmt " chunk because JUNK and BEXT wav
            // format put a lot of metadata between wave_identifier AND fmt_identifier
            if (read[0] === 'fmt_identifier') pointer = buffer.indexOf('666d7420', pointer, 'hex'); // looks for the string "fmt " in the next bytes
            if (pointer < 0 || pointer >= totalAnalysedBytes) return;
            i++;
            //  if(pointer > 40) return;
            switch (read[1]) {
                case 'string':
                    read_result[read[0]] = buffer.toString('ascii', pointer, pointer + nbBytesActualChunk);
                    pointer += nbBytesActualChunk;   // pointer = pointer plus # bytes
                    break;
                case 'integer':
                    read_result[read[0]] = buffer.readUInt16LE(pointer, nbBytesActualChunk);
                    pointer += nbBytesActualChunk;
                    break;
                case 'uinteger':
                    read_result[read[0]] = buffer.readInt32LE(pointer, nbBytesActualChunk);
                    pointer += nbBytesActualChunk;
                    break;
            }
            if (i < reads.length) return readWavChunk();
        }

        readWavChunk();

        // POST PROCESS
        let error = false;
        let fileInfos;
        const invalid_reasons = [];

        if (read_result.riff_head != 'RIFF') invalid_reasons.push('Expected "RIFF" string at 0');
        if (read_result.wave_identifier != 'WAVE') invalid_reasons.push('Expected "WAVE" string at 4');
        if (read_result.fmt_identifier != 'fmt ') invalid_reasons.push('No "fmt " chunk found');
        if (read_result.audio_format != 1 && read_result.audio_format != 3) invalid_reasons.push('Unknwon format: ' + read_result.audio_format);
        if (read_result.chunk_size + 8 !== stats.size) invalid_reasons.push('chunk_size does not match file size');
        //if ((read_result.data_identifier) != "data") invalid_reasons.push("Expected data identifier at the end of the header")

        if (invalid_reasons.length > 0) {
            error = {
                error: true,
                invalid_reasons: invalid_reasons,
                header: read_result,
                stats: stats
            };
        } else {
            fileInfos = {
                header: read_result,
                stats: stats,
                duration: ((read_result.chunk_size) / (read_result.sample_rate * read_result.num_channels * (read_result.bits_per_sample / 8)))
            };
        }

        if (typeof callback === 'function') {
            // CALLBACK
            if (error) return callback(error);
            else return callback(null, fileInfos);
        } else {
            // ASYNC
            if (error) throw new Error(error);
            else return fileInfos;
        }
    }
};
