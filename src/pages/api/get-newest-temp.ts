import { db } from '../../db';

export async function GET() {
	try {
		const res = await db
			.selectFrom('temp_data')
			.selectAll()
			.orderBy('temp_data.time desc')
			.executeTakeFirst();

		return new Response(JSON.stringify(res), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	}
	catch (e) {
		console.error(e);
		return new Response(JSON.stringify(
			{ error: 'An error occurred while fetching the newest temperature data' },
		), { status: 500, statusText: 'Internal Server Error' });
	}
}