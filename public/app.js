/** ----- ffmpeg stuff ----- */
button.addEventListener('click', async () => {
	button.disabled = color.disabled = text.disabled = true;

	const ffmpeg = FFmpeg.createFFmpeg({ log: true });
	await ffmpeg.load();

	for (let i = 0; i <= 100; i += 1) {
		await frame();
		render(i);

		const blob = await snapshot(canvas);

		ffmpeg.FS(
			'writeFile',
			`frame_${pad(i, 4)}.png`,
			new Uint8Array(await blob.arrayBuffer())
		);
	}

	const output = 'video.mp4';
	const command = `-r 60 -f image2 -s ${canvas.width}x${canvas.height} -i frame_%04d.png -vcodec libx264 -vb 1024k -minrate 1024k -maxrate 1024k -bufsize 1024k -pix_fmt yuv420p -strict experimental ${output}`;

	await ffmpeg.run(...command.split(' '));

	const data = ffmpeg.FS('readFile', output);
	const blob = new Blob([data.buffer], { type: 'video/mp4' });
	video.src = URL.createObjectURL(blob);

	button.disabled = color.disabled = text.disabled = false;
});

function snapshot(canvas) {
	return new Promise((fulfil) => canvas.toBlob(fulfil));
}

/** ----- everything else ----- */
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

function render(i) {
	ctx.save();

	ctx.fillStyle = 'white';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = color.value;
	ctx.font = `normal 64px sans-serif`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	ctx.translate(canvas.width / 2, canvas.height / 2);
	ctx.rotate(quintInOut(i / 100) * Math.PI * 2);

	ctx.fillText(text.value, 0, 0);

	ctx.restore();
}

function quintInOut(t) {
	if ((t *= 2) < 1) return 0.5 * t * t * t * t * t;
	return 0.5 * ((t -= 2) * t * t * t * t + 2);
}

function frame() {
	return new Promise((fulfil) => requestAnimationFrame(fulfil));
}

function pad(n, len) {
	let string = String(n);
	while (string.length < len) string = '0' + string;
	return string;
}

text.addEventListener('input', () => render(0));
color.addEventListener('input', () => render(0));
render(0);
