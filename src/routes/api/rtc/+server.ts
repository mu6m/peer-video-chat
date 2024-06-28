import { client } from '$lib/helpers/redis';
import { v4 as uuidv4 } from 'uuid';
import { json, error, redirect } from '@sveltejs/kit';

export async function POST({ request, params, cookies }: any) {
	const body = await request.json();
	let id = body?.id;
	if (!id) {
		id = uuidv4();
	}
	await client.set(id, body);
	return json({
		id
	});
}
