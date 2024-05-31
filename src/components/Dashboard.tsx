import ky from 'ky';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { round } from '../utils/round';
import type { DB } from 'kysely-codegen';


export default function Component() {
	const [temp, setTemp] = useState<number | null>(30.00);
	const [humidity, setHumidity] = useState<number | null>(70.00);
	const [pressure, setPressure] = useState<number | null>(1013.00);
	const [lastUpdated, setLastUpdated] = useState<string | null>(null);
	const [imgSrc, setImgSrc] = useState<string | null>(null);


	const updateTempData = async () => {
		try {
			const res: DB['temp_data'] = await ky.get('/api/get-newest-temp').json();

			console.log(res);

			setTemp(round(res.temp));
			setHumidity(round(res.humidity));
			setPressure(round(res.pressure, 1));
			setLastUpdated(dayjs(new Date(res.time as unknown as string)).format('hh:mm:ss a'));

			// check if res.img has protocol, if not, prepend JPEG data URL
			if (res.img && (!res.img.startsWith('data:') || !res.img.startsWith('http'))) {
				setImgSrc(`data:image/jpeg;base64,${res.img}`);
			}
		}
		catch (e) {
			console.error(e);
		}
	};

	useEffect(() => {
		updateTempData();
		const interval = setInterval(updateTempData, 5000);

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
					<div className="aspect-video bg-gray-700 rounded-lg">
						{imgSrc ? (
							<img src={imgSrc} alt="Camera feed" className="object-cover w-full h-full rounded-lg" />
						) : (
							<div className="flex items-center justify-center w-full h-full text-2xl font-bold">Loading...</div>
						)}
					</div>
				</div>
				<div className="bg-gray-900 text-white w-64 p-6 space-y-6">
					<div className="bg-gray-800 rounded-lg p-4 space-y-2">
						<div className="text-sm font-medium">Temperature</div>
						<div className="text-3xl font-bold">{temp}°C</div>
						<div className="h-20 bg-gray-700 rounded-lg" />
					</div>
					<div className="bg-gray-800 rounded-lg p-4 space-y-2">
						<div className="text-sm font-medium">Humidity</div>
						<div className="text-3xl font-bold">{humidity}%</div>
						<div className="h-20 bg-gray-700 rounded-lg" />
					</div>
					<div className="bg-gray-800 rounded-lg p-4 space-y-2">
						<div className="text-sm font-medium">Pressure</div>
						<div className="text-3xl font-bold">{pressure} hPa</div>
						<div className="h-20 bg-gray-700 rounded-lg" />
					</div>
				</div>
			</div>
		</div>
	);
}