export const infoByFilename: (
	fileName: string,
	cb:
		| ((err: IInfoByFilenameError | Error, data: null | undefined) => any)
		| ((err: null | undefined, data: IInfoByFilenameData) => any)
) => void;

export interface IInfoByFilenameHeader {
	/* Marks the file as a riff file. Characters are each 1 byte long. */
	riff_head: string;
	/** Size of the overall file - 8 bytes, in bytes (32-bit integer). Typically, you’d fill this in after creation. */
	chunk_size: number;
	/** File Type Header. For our purposes, it always equals “WAVE”. */
	wave_identifier: string;
	/** Format chunk marker. Includes trailing null */
	fmt_identifier: string;
	/** Length of format data as listed above */
	sub_chunk_size: number;
	/** Type of format (1 is PCM) - 2 byte integer */
	audio_format: number;
	/** Number of Channels - 2 byte integer */
	num_channels: number;
	/** Sample Rate - 32 byte integer. Common values are 44100 (CD), 48000 (DAT). Sample Rate = Number of Samples per second, or Hertz. */
	sample_rate: number;
	/** (Sample Rate * BitsPerSample * Channels) / 8. */
	byte_rate: number;
	/** (BitsPerSample * Channels) / 8.1 - 8 bit mono2 - 8 bit stereo/16 bit mono4 - 16 bit stereo */
	block_align: number;
	/** Bits per sample */
	bits_per_sample: number;
	/** “data” chunk header. Marks the beginning of the data section. */
	data_identifier: string;
	/** Size of the data section. */
	sub_chunk2_size: number;
}
export interface IInfoByFilenameError {
	error: true,
	invalid_reasons: Array<string>;
	header: IInfoByFilenameHeader;
	stats: any;
}
export interface IInfoByFilenameData {
	header: IInfoByFilenameHeader;
	stats: any;
	duration: number;
}