import fs from 'fs';

export default function writeHeader(filename) {
	const headerLine = []
	headerLine.push('url');
	headerLine.push('chart name');
	headerLine.push('publish date');
	headerLine.push('collect date');
	headerLine.push('chart genre 1');
	headerLine.push('chart genre 2');
	fs.writeFileSync(filename,headerLine.join(',')+ '\n');
};
