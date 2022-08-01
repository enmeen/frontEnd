function sleep(time) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve();
		}, time)
	})
}

async function getName() {
	await sleep(1000);
	console.log('getName');
}

getName();