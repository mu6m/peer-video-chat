<script lang="ts">
	import { onMount } from 'svelte';
	import { io } from 'socket.io-client';

	let localVideo: any = undefined;
	let remoteVideo: any = undefined;
	let peerConnection: any = undefined;
	let socket: any = undefined;

	let pc_offer: any = undefined;
	let pc_answer: any = undefined;

	onMount(async () => {
		await init();
		socket.on('connect', () => {
			console.log(`connect ${socket.id}`);
			socket.emit('join');
		});
		socket.on('init', async ({ id }: any) => {
			console.log('creator');
			await createOffer(id);
		});
		socket.on('pc_answer', async ({ id, offer }: any) => {
			if (pc_answer == undefined) {
				pc_answer = offer;
				offer = JSON.parse(offer);
				console.log('answer', typeof offer);
				await createAnswer(id, offer);
			}
		});
		socket.on('pc_trigger', async (offer: any) => {
			if (pc_answer == undefined) {
				pc_answer = offer;
				offer = JSON.parse(offer);
				console.log('trigger', typeof offer);
				await triggerCall(offer);
			}
		});
	});
	async function init() {
		let localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
		let remoteStream = new MediaStream();
		peerConnection = new RTCPeerConnection();

		localVideo.srcObject = localStream;
		remoteVideo.srcObject = remoteStream;

		localStream.getTracks().forEach((track) => {
			peerConnection.addTrack(track, localStream);
		});

		peerConnection.ontrack = (event) => {
			event.streams[0].getTracks().forEach((track) => {
				remoteStream.addTrack(track);
			});
		};

		socket = io('http://localhost:3000', {
			reconnection: true,
			reconnectionDelay: 500,
			reconnectionAttempts: 10
		});
	}
	async function createOffer(id: string) {
		peerConnection.onicecandidate = async (event) => {
			//Event that fires off when a new offer ICE candidate is created
			if (event.candidate) {
				pc_offer = JSON.stringify(peerConnection.localDescription);
				socket.emit('pc_offer', { id, pc_offer });
			}
		};

		const offer = await peerConnection.createOffer();
		await peerConnection.setLocalDescription(offer);
	}

	async function createAnswer(id: string, offer: any) {
		peerConnection.onicecandidate = async (event) => {
			//Event that fires off when a new answer ICE candidate is created
			if (event.candidate) {
				pc_answer = JSON.stringify(peerConnection.localDescription);
				socket.emit('pc_trigger', { id, offer: pc_answer });
			}
		};

		await peerConnection.setRemoteDescription(offer);

		let answer = await peerConnection.createAnswer();
		await peerConnection.setLocalDescription(answer);
	}
	async function triggerCall(answer: any) {
		if (!peerConnection.currentRemoteDescription) {
			peerConnection.setRemoteDescription(answer);
		}
	}
</script>

<main>
	<div class="flex flex-col md:flex-row gap-8 py-8">
		<span>
			<h3>Local Stream</h3>
			<video class="bg-slate-500" bind:this={localVideo} muted playsinline autoplay></video>
		</span>
		<span>
			<h3>Remote Stream</h3>
			<video class="bg-slate-500" bind:this={remoteVideo} muted playsinline autoplay></video>
		</span>
	</div>
</main>
<button
	class="btn btn-primary"
	on:click={async () => {
		socket = undefined;
		pc_offer = undefined;
		pc_answer = undefined;
		peerConnection = undefined;
		await init();
		await socket.emit('join');
	}}>call</button
>
