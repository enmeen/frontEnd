function b(): Promise<number> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(1);
		}, 1000);
	});
}

function c() {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(1);
		}, 1000);
	});
}

// export async function a() {
// 	await b();
// 	await c();
// }

function* a(): any {
	let vb = yield b();
	yield c();
}

for (let k of a()) {
	console.log(k);
}
