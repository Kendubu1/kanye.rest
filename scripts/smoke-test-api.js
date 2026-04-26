const BASE_URL = process.env.SEAN_REST_BASE_URL || 'http://127.0.0.1:8787';

const ROUTES = [
	{ path: '/', expectStatus: 200 },
	{ path: '/?format=text', expectStatus: 200, expectText: true },
	{ path: '/top', expectStatus: 200 },
	{ path: '/projects', expectStatus: 200 },
	{ path: '/project/detroit', expectStatus: 200 },
	{ path: '/level/blue-cheese', expectStatus: 200 },
	{ path: '/pungency/60', expectStatus: 200 },
	{ path: '/health', expectStatus: 200 }
];

async function smokeTest() {
	const failures = [];

	for (const route of ROUTES) {
		const url = `${BASE_URL}${route.path}`;
		try {
			const response = await fetch(url);
			const body = await response.text();

			if (response.status !== route.expectStatus) {
				failures.push(`${route.path}: expected status ${route.expectStatus}, got ${response.status}`);
				continue;
			}

			if (!body.trim()) {
				failures.push(`${route.path}: response body was empty`);
				continue;
			}

			if (!route.expectText) {
				try {
					JSON.parse(body);
				} catch (error) {
					failures.push(`${route.path}: expected JSON response`);
				}
			}

			console.log(`OK ${route.path} ${response.status}`);
		} catch (error) {
			failures.push(`${route.path}: ${error.message}`);
		}
	}

	if (failures.length) {
		console.error(`Smoke test failed with ${failures.length} issue(s):`);
		failures.forEach((failure) => console.error(`- ${failure}`));
		process.exit(1);
	}

	console.log(`Smoke test passed against ${BASE_URL}`);
}

smokeTest();
