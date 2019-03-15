const assert = require('assert');
const { Given, Then } = require('cucumber');

Given('I am testing extended debugging on webpage', async function test() {
	await this.browser.url('https://www.saucedemo.com/');
	const username = await this.browser.$('[data-test="username"]');
	await username.setValue(process.env.PERF_USERNAME || 'standard_user');
	const password = await this.browser.$('[data-test="password"]');
	await password.setValue('secret_sauce');
	const login = await this.browser.$('.btn_action');
	await login.click();
	await this.browser.url('https://www.saucedemo.com/inventory.html');
});

Then('I check for sauce:performance logs', async function test() {
	const performanceLogs = await this.browser.getLogs('sauce:performance');
	const metrics = [
		'load',
		'speedIndex',
		'pageWeight',
		'pageWeightEncoded',
		'timeToFirstByte',
		'timeToFirstInteractive',
		'firstContentfulPaint',
		'perceptualSpeedIndex',
		'domContentLoaded',
	];
	metrics.forEach(metric => assert.ok(metric in performanceLogs, `${metric} metric is missing`));
});

Then('I assert that pageLoad is not degraded using sauce:performance custom command', async function test() {
	const metric = 'load';
	const output = await this.browser.execute('sauce:performance', {
		name: this.testName,
		metrics: [metric],
	});
	assert.equal(output.result, 'pass', output.reason);
});

Then('I assert that timeToFirstInteractive is not degraded using sauce:performance custom command', async function test() {
	const metric = 'timeToFirstInteractive';
	const output = await this.browser.execute('sauce:performance', {
		name: this.testName,
		metrics: [metric],
	});
	const { reason, result, details } = output;
	if (result !== 'pass') {
		assert.equal(details[metric].actual < 5000, true, reason);
		return;
	}
	assert(result, 'pass');
});
