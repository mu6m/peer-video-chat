import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*'
	}
});

function usersinroom(roomID: string) {
	let clients = io.sockets.adapter.rooms.get(roomID);
	return clients ? clients.size : 0;
}
io.on('connection', (socket) => {
	socket.on('join', async () => {
		socket.join('wait');
		if (usersinroom('wait') > 1) {
			let other = Array.from(io.sockets.adapter.rooms.get('wait'))[0];
			io.sockets.sockets.get(other).leave('wait');
			socket.leave('wait');
			socket.emit('init', { id: other });
		}
	});
	socket.on('pc_offer', async ({ id, pc_offer }) => {
		io.to(id).emit('pc_answer', { id: socket.id, offer: pc_offer });
	});
	socket.on('pc_trigger', async ({ id, offer }) => {
		io.to(id).emit('pc_trigger', offer);
	});
});

server.listen(3000, () => {
	console.log('listening on *:3000');
});
