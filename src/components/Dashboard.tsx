import ky from 'ky';
import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { round } from '../utils/round';
import type { DB } from 'kysely-codegen';
import { ResponsiveLine } from '@nivo/line';


// import * as tf from '@tensorflow/tfjs';
// import cocossd from '@tensorflow-models/coco-ssd';
// import '@tensorflow/tfjs-backend-cpu';
// import '@tensorflow/tfjs-backend-webgl';
// import '@tensorflow/tfjs-backend-webgpu';

export default function Component() {
	const [temp, setTemp] = useState<number[]>([30.0]);
	const [humidity, setHumidity] = useState<number[]>([70.00]);
	const [pressure, setPressure] = useState<number[]>([1013.00]);
	const [lastUpdated, setLastUpdated] = useState<string | null>(null);

	const canvasRef = useRef<HTMLCanvasElement>(null);


	const updateTempData = async (ctx: CanvasRenderingContext2D) => {
		try {
			const res: DB['temp_data'] = await ky.get('/api/get-newest-temp').json();

			console.log(res);

			setTemp((prev) => [...prev.slice(-9), round(res.temp)]);
			setHumidity((prev) => [...prev.slice(-9), round(res.humidity)]);
			setPressure((prev) => [...prev.slice(-9), round(res.pressure)]);
			setLastUpdated(dayjs(new Date(res.time as unknown as string)).format('hh:mm:ss a'));

			// check if res.img has protocol, if not, prepend JPEG data URL
			if (res.img && (!res.img.startsWith('data:') || !res.img.startsWith('http'))) {
				// setImgSrc(`data:image/jpeg;base64,${res.img}`);
				const img = new Image();
				img.src = `data:image/jpeg;base64,${res.img}`;
				img.onload = async () => {
					ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);

					// const event = new CustomEvent('new-image', { detail: { img } });
					// window.dispatchEvent(event);

					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const model = (window as any).model;
					console.log(model);
					const predictions = model ? await model.detect(img) : [];
					console.log(predictions);

					// send notifications
					const [latest_temp, latest_humidity, latest_pressure] = [
						temp[temp.length - 1],
						humidity[humidity.length - 1],
						pressure[humidity.length - 1],
					];

					console.log(latest_temp, latest_humidity, latest_pressure);

					if (latest_temp > 23) {
						new Notification('The temperature in the car is dangerously high!', {
							silent: false,
						});
					}

					if (latest_humidity > 85) {
						new Notification('The humidity in the car is dangerously high!', {
							silent: false,
						});
					}

					if (latest_pressure > 1150) {
						new Notification('The pressure in the car is dangerously high!', {
							silent: false,
						});
					}

					// draw predictions
					ctx.strokeStyle = 'red';
					ctx.lineWidth = 2;
					ctx.font = '16px \'Rethink Sans\', sans-serif';
					ctx.fillStyle = 'white';
					for (const prediction of predictions) {
						const [x, y, width, height] = prediction.bbox;
						const text = `${prediction.class} (${Math.round(prediction.score * 100)}%)`;
						const area = width * height;
						// TODO: Filter out areas that are far too small or too large
						if (area) {
							ctx.strokeText(text, x, y - 5);
							ctx.fillText(text, x, y - 5);
							ctx.strokeRect(x, y, width, height);
						}
					}

				};
			}
		}
		catch (e) {
			console.error(e);
		}
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		(async () => {
			await window.Notification.requestPermission();

			console.log('Notification' in window);

			Notification.requestPermission().then(() => {
				// alert(Notification.permission);
				if (Notification.permission === 'denied' || Notification.permission === 'default') {
					alert('Please enable notifications');
				}
				else {
					console.log('e');
					// new Notification('Hello there', {
					// 	silent: false,
					// });
				}
			});
		})();

		const ctx = canvas.getContext('2d');

		// set resolution
		canvas.width = 1280;
		canvas.height = 720;

		// write "Loading..." on canvas
		ctx.fillStyle = 'white';
		ctx.font = '20px \'Rethink Sans\'';
		ctx.textAlign = 'center';
		ctx.fillText('Loading...', canvas.width / 2, canvas.height / 2);


		// (async () => {
		// 	await tf.setBackend('webgl');
		// 	console.log(tf.getBackend());
		// 	// await tf.setBackend('webgpu');
		// })();


		updateTempData(ctx);
		const interval = setInterval(() => updateTempData(ctx), 1000 * 5);

		return () => clearInterval(interval);
	}
	, []);

	return (
		<div className="flex flex-col h-screen">
			<header className="bg-gray-900 text-white flex items-center justify-between px-6 py-4">
				<div className="text-lg font-bold">Dashboard</div>
				<div className="text-sm">
					{lastUpdated ? (
						<div>Last updated: {lastUpdated}</div>
					) : (
						<div>Loading...</div>
					)}
				</div>
			</header>
			<div className="flex flex-1">
				<div className="bg-gray-800 text-white p-6 flex-1">
					<div className="bg-gray-700 rounded-lg aspect-video">
						<canvas ref={canvasRef} className="object-cover w-full h-full rounded-lg" />
					</div>
				</div>
				<div className="bg-gray-900 text-white w-64 p-6 space-y-6">
					<div className="bg-gray-800 rounded-lg p-4 space-y-2">
						<div className="text-sm font-medium">Temperature</div>
						<div className="text-3xl font-bold">{temp[temp.length - 1]}°C</div>
						<div className="h-20 bg-gray-700 rounded-lg">
							<ResponsiveLine
								data={[{
									id: 'Temperature',
									data: temp.map((t, i) => ({ x: i, y: t })),
								}]}
								margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
								xScale={{ type: 'point' }}
								yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
								useMesh={true}
								enableGridX={false}
								tooltip={({ point }) => (
									<div className="bg-[#08005c] text-white text-sm p-2 rounded-lg relative right-20">
										<div>Temperature: {point.data.yFormatted}°C</div>
									</div>
								)}
							/>
						</div>
					</div>
					<div className="bg-gray-800 rounded-lg p-4 space-y-2">
						<div className="text-sm font-medium">Humidity</div>
						<div className="text-3xl font-bold">{humidity[humidity.length - 1]}%</div>
						<div className="h-20 bg-gray-700 rounded-lg">
							<ResponsiveLine
								data={[{
									id: 'Humidity',
									data: humidity.map((h, i) => ({ x: i, y: h })),
								}]}
								margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
								xScale={{ type: 'point' }}
								yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
								useMesh={true}
								enableGridX={false}
								tooltip={({ point }) => (
									<div className="bg-[#08005c] text-white text-sm p-2 rounded-lg relative right-20">
										<div>Humidity: {point.data.yFormatted}%</div>
									</div>
								)}
							/>
						</div>
					</div>
					<div className="bg-gray-800 rounded-lg p-4 space-y-2">
						<div className="text-sm font-medium">Pressure</div>
						<div className="text-3xl font-bold">{pressure[pressure.length - 1]} hPa</div>
						<div className="h-20 bg-gray-700 rounded-lg">
							<ResponsiveLine
								data={[{
									id: 'Pressure',
									data: pressure.map((p, i) => ({ x: i, y: p })),
								}]}
								margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
								xScale={{ type: 'point' }}
								yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
								useMesh={true}
								enableGridX={false}
								tooltip={({ point }) => (
									<div className="bg-[#08005c] text-white text-sm p-2 rounded-lg relative right-20">
										<div>Pressure: {point.data.yFormatted} hPa</div>
									</div>
								)}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}