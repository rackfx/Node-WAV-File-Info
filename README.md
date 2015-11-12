# WAV File Info for Node.JS
A lightweight module that parses WAV information data from a file into a Javascript Object.

### Usage

```
npm install wav-file-info --save
```

```javascript
var wavFileInfo = require('wav-file-info');

wavFileInfo.infoByFilename('./test.wav', function(err, info){
  if (err) throw err;
  console.log(info);
});
```

### Result

```
{ header:
   { riff_head: 'RIFF',
     chunk_size: 256660,
     wave: 'WAVE',
     fmt: 'fmt ',
     subchunk_size: 18,
     audio_format: 1,
     num_channels: 2,
     sample_rate: 44100,
     byte_rate: 264600,
     block_align: 6,
     bits_per_sample: 24 },
  stats:
   { dev: 16777220,
     mode: 33188,
     nlink: 1,
     uid: 501,
     gid: 20,
     rdev: 0,
     blksize: 4096,
     ino: 70857483,
     size: 256668,
     blocks: 504,
     atime: Wed Nov 11 2015 22:01:34 GMT-0700 (MST),
     mtime: Sun Nov 08 2015 22:50:00 GMT-0700 (MST),
     ctime: Wed Nov 11 2015 19:12:15 GMT-0700 (MST),
     birthtime: Sun Nov 08 2015 22:50:00 GMT-0700 (MST) } }
```

### Example errors

```
{ error: true,
  invalid_reasons:
   [ 'Expected "RIFF" string at 0',
     'Expected "WAVE" string at 4',
     'Expected "fmt " string at 8',
     'Unknwon format: 25711',
     'chunk_size does not match file size' ] }
```


References:
 http://soundfile.sapp.org/doc/WaveFormat/
