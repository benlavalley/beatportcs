import { HttpsProxyAgent } from 'https-proxy-agent';
import genRandName from './genRandName.js';
import callAPIs from './callAPIs.js';
export const baseUrl = 'www.beatport.com';
export const chartRandomName = genRandName();
const delayMs = 100; // delay each request by 100ms so we dont totally flood Beatport... even though these are sequential I want to be a good client!
export const baseNum = 776986;
const maxIterate = 10;
export let filename = `${baseNum}_to_${baseNum+maxIterate}.csv`;
filename = filename.split('.').join('-' + Date.now() + '.');
export const useProxy = true; // if not using a proxy set to false.
export const proxyUrl = `http://proxy9:8888`
export const agent = useProxy && proxyUrl && proxyUrl.length && new HttpsProxyAgent(proxyUrl);
export const iterateUrlObj = {};
iterateUrlObj.iterateUrlNum	= 0;

console.log('** Beatport "Best New" list collection beginning for '+baseNum+' and running '+maxIterate+' times...');

for (let i = 0; i < maxIterate; i++) {
	const percentComplete = iterateUrlObj.iterateUrlNum && (i / maxIterate) * 100;
	if (iterateUrlObj.iterateUrlNum && percentComplete  % 1 === 0) {
		console.log(percentComplete+'% complete at iteration '+iterateUrlObj.iterateUrlNum);
	}
	try {
		await new Promise(r => setTimeout(r, delayMs)); // one-line delay so we dont hammer the webserver...
		await callAPIs(i);
	} catch (e) {
		console.log('error processing request for iteration '+iterateUrlObj.iterateUrlNum+' - error is : ', e);
	}
}

console.log('** Beatport "Best New" list collection done - began at '+baseNum+' and finished at '+iterateUrlObj.iterateUrlNum);
