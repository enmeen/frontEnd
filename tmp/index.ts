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

export async function a() {
	await b();
	await c();
}

setTimeout(() => {
	console.log(1)
	Promise.resolve().then(()=>{ console.log('p1')})
}, 1000);

setTimeout(() => {
	console.log(2)
	Promise.resolve().then(()=>{ console.log('p2')})
}, 1000);