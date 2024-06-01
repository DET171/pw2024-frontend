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
				img.onload = () => {
					ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);

					const event = new CustomEvent('new-image', { detail: { img } });
					window.dispatchEvent(event);
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
		const interval = setInterval(() => updateTempData(ctx), 1000 * 60 * 10);

		return () => clearInterval(interval);
	}
	, []);

	return (
		<div className="flex flex-col h-screen overflow-hidden">
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
					<div className="aspect-video bg-gray-700 rounded-lg">
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