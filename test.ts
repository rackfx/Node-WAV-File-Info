import { infoByFilename } from './'

infoByFilename('./test.wav', (err, data) => {
	if (err) {
		return void console.error(err.header);
	}
	return void console.log(data);
});