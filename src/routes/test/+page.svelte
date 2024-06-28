<script lang="ts">
	//simple testfile for webrtc
	import { onMount } from 'svelte';

	let localVideo: any = undefined;
	let remoteVideo: any = undefined;
	let peerConnection: any = undefined;

	let pc_offer: any = undefined;
	let pc_answer: any = undefined;

	onMount(async () => {
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
	});
	async function createOffer() {
		peerConnection.onicecandidate = async (event) => {
			if (event.candidate) {
				pc_offer = JSON.stringify(peerConnection.localDescription);
			}
		};

		const offer = await peerConnection.createOffer();
		await peerConnection.setLocalDescription(offer);
	}

	async function createAnswer() {
		let offer = JSON.parse(pc_offer);

		peerConnection.onicecandidate = async (event) => {
			//Event that fires off when a new answer ICE candidate is created
			if (event.candidate) {
				pc_answer = JSON.stringify(peerConnection.localDescription);
			}
		};

		await peerConnection.setRemoteDescription(offer);

		let answer = await peerConnection.createAnswer();
		await peerConnection.setLocalDescription(answer);
	}
	async function triggerCall() {
		let answer = JSON.parse(pc_answer);
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
<button class="btn btn-primary" on:click={createOffer}>call</button>
<button class="btn btn-primary" on:click={createAnswer}>answer</button>
<button class="btn btn-primary" on:click={triggerCall}>bind offers</button>

<textarea bind:value={pc_offer}></textarea>
<textarea bind:value={pc_answer}></textarea>
