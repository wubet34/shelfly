const test = require('node:test');
const assert = require('node:assert/strict');
const { clearAuthCookies, csrf } = require('../middleware/authenticate');

test('clearing auth cookies expires both session and CSRF cookies', () => {
  const headers = [];
  const response = { append: (name, value) => headers.push([name, value]) };

  clearAuthCookies(response);

  assert.equal(headers.length, 2);
  assert.ok(headers.every(([name, value]) => name === 'Set-Cookie' && value.includes('Max-Age=0')));
});

test('CSRF middleware rejects malformed tokens without throwing', () => {
  let status;
  let body;
  const req = { csrf: 'a'.repeat(64), get: () => 'é'.repeat(64) };
  const res = {
    status(code) { status = code; return this; },
    json(value) { body = value; return this; },
  };

  csrf(req, res, () => assert.fail('invalid CSRF token should be rejected'));

  assert.equal(status, 403);
  assert.deepEqual(body, { error: 'Invalid CSRF token' });
});

test('CSRF middleware accepts the matching session token', () => {
  const token = 'a'.repeat(64);
  let called = false;

  csrf({ csrf: token, get: () => token }, {}, () => { called = true; });

  assert.equal(called, true);
});
