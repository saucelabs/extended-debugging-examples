const assert = require('assert');
const { config } = require('../conf.js');

describe('Performance Testing', () => {
	beforeAll(() => {
		browser.waitForAngularEnabled(false);
		browser.get('/');
		element(by.css('[data-test="username"]')).sendKeys(process.env.PERF_USERNAME || 'standard_user');
		element(by.css('[data-test="password"]')).sendKeys('secret_sauce');
		element(by.css('.btn_action')).click();
		browser.get('/inventory.html');
	});

	it('log (sauce:performance) should check speedIndex', async () => {
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
		const performance = await browser.executeScript('sauce:log', { type: 'sauce:performance' });
		metrics.forEach(metric => assert.ok(metric in performance, `${metric} metric is missing`));
	});

	it('(sauce:performance) custom command should assert performance has not regressed', async () => {
		const metric = 'load';
		const output = await browser.executeScript('sauce:performance', {
			name: config.capabilities.name,
			metrics: [metric],
		});
		const { reason, result, details } = output;
		// it the test returns a failure, make sure the timeToFirstInteractive is not over 5s
		if (result !== 'pass') {
			assert.equal(details[metric].actual < 5000, true, reason);
			return;
		}
		assert(result, 'pass');
	});

	it('(sauce:performance) custom command should assert timeToFirstInteractive has not regressed', async () => {
		const metric = ['timeToFirstInteractive'];
		const output = await browser.executeScript('sauce:performance', {
			name: config.capabilities.name,
			metrics: [metric],
		});
		const { reason, result, details } = output;
		// it the test returns a failure, make sure the timeToFirstInteractive is not over 5s
		if (result !== 'pass') {
			assert.equal(details[metric].actual < 5000, true, reason);
			return;
		}
		assert(result, 'pass');
	});
});
