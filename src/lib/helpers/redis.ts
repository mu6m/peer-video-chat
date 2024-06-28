import { REDIS_CONNECTION } from '$env/static/private';
import Redis from 'ioredis';

export const client = new Redis(REDIS_CONNECTION, {
	tls: {
		rejectUnauthorized: false
	}
});
