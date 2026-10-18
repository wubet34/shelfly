const test = require('node:test');
const assert = require('node:assert/strict');
const { owner } = require('../middleware/authenticate');

function response() {
  return { statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}

test('owner access middleware allows owners', () => {
  let continued = false;
  owner({ user: { role: 'OWNER' } }, response(), () => { continued = true; });
  assert.equal(continued, true);
});

test('owner access middleware rejects employees', () => {
  let continued = false;
  const res = response();
  owner({ user: { role: 'EMPLOYEE' } }, res, () => { continued = true; });
  assert.equal(continued, false);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.error, 'Owner permission required');
});
