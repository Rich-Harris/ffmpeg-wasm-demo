import polka from 'polka';
import sirv from 'sirv';

polka()
	.use((req, res, next) => {
		// this enables cross-origin isolation, which is necessary
		// for SharedArrayBuffer (which ffmpeg-wasm uses)
		res.setHeader('cross-origin-embedder-policy', 'require-corp');
		res.setHeader('cross-origin-opener-policy', 'same-origin');
		next();
	})
	.use(sirv('public', { dev: true }))
	.listen(3000, () => {
		console.log('listening on localhost:3000');
	});
