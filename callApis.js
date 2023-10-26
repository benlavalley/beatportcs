import https from 'https';
import {JSDOM} from 'jsdom';
import fs from 'fs';
import writeHeader from './writeHeader.js';
import { useProxy, proxyUrl, agent, filename, baseUrl, chartRandomName, baseNum, iterateUrlObj } from './index.js';


let writeOnce;

export default function callAPIs(i) {
	return new Promise((resolve, reject) => {
		iterateUrlObj.iterateUrlNum = baseNum + i;
		const path = `/chart/${chartRandomName}/${iterateUrlObj.iterateUrlNum}`;
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
							if (chartArtist && chartArtist.id === 45 && chart.name.startsWith('Best New')) {
								const chartGenres = chart && chart.genres;
								const genre1 = chartGenres && chartGenres[0] && chartGenres[0].name;
								const genre2 = chartGenres && chartGenres[1] && chartGenres[1].name;
								const reconstructedUrl = `https://${baseUrl}/chart/${chart.slug}/${chart.id}`;
								if (!writeOnce) {
									writeHeader(filename);
									writeOnce = true;
								}
								let newLine = []
								newLine.push(reconstructedUrl);
								newLine.push(chart.name);
								newLine.push(chart.publish_date);
								newLine.push(new Date());
								newLine.push(genre1);
								newLine.push(genre2);
								console.log('writing '+reconstructedUrl);
								fs.writeFileSync(filename,newLine.join(',')+ '\n', {flag: 'a'});
							}
						} else {
							// no need to log, we will get a lot of 404s.
							// console.log('404 error on url - full requestObj: ', requestObj);
						}
					} catch (e) {
						console.log('error parsing page with  iterateUrlNum: '+iterateUrlObj.iterateUrlNum+' -- error: ', e);
					}
					resolve();
				});
			});
		} catch (e) {
			console.log('error attempting to make request - requestObj: ', requestObj,' || error: ', e);
			resolve();
		}
	});
}
