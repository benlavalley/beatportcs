import {JSDOM} from "jsdom"
import https from 'https';
import fs from 'fs';
import { HttpsProxyAgent } from 'https-proxy-agent';
function genRandName()
{
	let text="";
	let alphabet="abcdefghijklmnopqrstuvwxyz"
	for(let i=0; i<10; i++)
		text +=alphabet.charAt(Math.floor(Math.random()*alphabet.length))
	return text;
}

const baseUrl = 'www.beatport.com';
const chartRandomName = genRandName();
const baseNum = 778948;
const maxIterate = 1000;
const finalIterate = baseNum + maxIterate;
let filename = `${baseNum}_to_${baseNum+maxIterate}.csv`;
filename = filename.split('.').join('-' + Date.now() + '.');

// if not using a proxy set to false.

const useProxy = true;
const proxyUrl = `http://proxy9:8888`
const agent = useProxy && proxyUrl && proxyUrl.length && new HttpsProxyAgent(proxyUrl);
let iterateUrlNum = 0;

function callAPIs(i) {
	return new Promise((resolve, reject) => {
		iterateUrlNum = baseNum + i;
		const path = `/chart/${chartRandomName}/${iterateUrlNum}`;
		const requestObj = {
			host: baseUrl,
			path
		};
		if (useProxy && proxyUrl && proxyUrl.length && agent) {
			requestObj.agent = agent;
		}
		try {
			https.get(requestObj, (response) => {
				let data = '';
				response.on('error', (err) => {
					console.log('error requesting url with requestObj ', requestObj,' error is: ', err);
					resolve();
				});
				response.on('data', (chunk) => {
					data += chunk;
				});
				response.on('end', () => {
					try {
						if (response.statusCode !== 404) {
							const beatportDom = new JSDOM(data);
							const parsedJson = JSON.parse(beatportDom.window.document.getElementById("__NEXT_DATA__").textContent);
							const chart = parsedJson.props.pageProps.dehydratedState.queries[0].state.data;
							const chartArtist = chart && chart.artist;
							if (chartArtist && chartArtist.id === 45) {
								if (chart.name.startsWith('Best New')) {
									const chartGenres = chart && chart.genres;
									const genre1 = chartGenres && chartGenres[0] && chartGenres[0].name;
									const genre2 = chartGenres && chartGenres[1] && chartGenres[1].name;
									const reconstructedUrl = `https://${baseUrl}/chart/${chart.slug}/${chart.id}`;
									let newLine = []
									newLine.push(reconstructedUrl);
									newLine.push(chart.name);
									newLine.push(chart.publish_date);
									newLine.push(new Date());
									newLine.push(genre1);
									newLine.push(genre2);
									console.log('writing '+reconstructedUrl);
									fs.writeFileSync(filename,newLine.join(',')+ '\n', {flag: 'a'});
									resolve();
								} else {
									resolve();
								}
							} else {
								resolve();
							}
						} else {
							resolve();
						}
					} catch (e) {
						console.log('error parsing page with  iterateUrlNum: '+iterateUrlNum+' -- error: ', e);
						resolve(e);
					}
				});
			});
		} catch (e) {
			console.log('error attempting to make request - requestObj: ', requestObj,' || error: ', e);
			resolve();
		}
	});
}

const headerLine = []
headerLine.push('url');
headerLine.push('chart name');
headerLine.push('publish date');
headerLine.push('collect date');
headerLine.push('chart genre 1');
headerLine.push('chart genre 2');
fs.writeFileSync(filename,headerLine.join(',')+ '\n');

console.log('** Beatport "Best New" list collection beginning for '+baseNum+' and running '+maxIterate+' times...');

for (let i = 0; i < maxIterate; i++) {
	const percentComplete = iterateUrlNum && (i / maxIterate) * 100;
	if (iterateUrlNum && percentComplete  % 1 === 0) {
		console.log(percentComplete+'% complete at iteration '+iterateUrlNum);
	}
	await callAPIs(i);
}

console.log('** Beatport "Best New" list collection done - began at '+baseNum+' and finished at '+iterateUrlNum);
