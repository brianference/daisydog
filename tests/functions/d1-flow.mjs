/**
 * End-to-end flow against a running Pages runtime backed by D1.
 * Run: node tests/functions/d1-flow.mjs http://127.0.0.1:8799
 * Writes real rows to whatever database the runtime is bound to, so point it
 * at a local `wrangler pages dev` only.
 */
import assert from 'node:assert/strict';

const BASE = process.argv[2];
if (!BASE) throw new Error('usage: node d1-flow.mjs <base-url>');
const FN = `${BASE}/.netlify/functions`;
const RUN = Date.now();
const PASSWORD = 'correct-horse-9';
let passed = 0;

/**
 * POST/GET a function and return {status, body}.
 * @param {string} name function name
 * @param {object} options query, body, token, method
 * @returns {Promise<{status:number, body:any}>}
 */
async function call(name, { query = '', body, token, method } = {}) {
  const response = await fetch(`${FN}/${name}${query}`, {
    method: method || (body === undefined ? 'GET' : 'POST'),
    headers: {
      'content-type': 'application/json',
      // Locally, a distinct client IP per run keeps the link-code limiter from carrying over between runs.
      // Cloudflare rejects requests that send this header from outside (HTTP 403), so never send it to
      // a deployed site; there, reruns within 10 minutes share a limiter bucket.
      ...(BASE.startsWith('http://127.0.0.1') ? { 'cf-connecting-ip': `198.51.100.${RUN % 250}` } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let parsed;
  try { parsed = JSON.parse(text); } catch { parsed = text; }
  return { status: response.status, body: parsed };
}

/**
 * Runs one named check and prints the result.
 * @param {string} name check name
 * @param {Function} fn async assertion body
 */
async function check(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`PASS  ${name}`);
  } catch (error) {
    console.log(`FAIL  ${name}\n      ${error.message.split('\n')[0]}`);
    process.exitCode = 1;
  }
}

const emailA = `parent-a-${RUN}@example.com`;
const emailB = `parent-b-${RUN}@example.com`;
let tokenA; let tokenB; let childId; let linkCode; let childToken; let lessonId;

await check('signup returns a token and parent', async () => {
  const r = await call('parent-auth', { body: { action: 'signup', email: emailA, password: PASSWORD } });
  assert.equal(r.status, 201, JSON.stringify(r.body).slice(0, 200));
  assert.ok(r.body.token);
  tokenA = r.body.token;
});
await check('duplicate signup is rejected', async () => {
  const r = await call('parent-auth', { body: { action: 'signup', email: emailA, password: PASSWORD } });
  assert.ok(r.status >= 400 && r.status < 500, `status ${r.status}`);
});
await check('short password is rejected', async () => {
  const r = await call('parent-auth', { body: { action: 'signup', email: `x${RUN}@example.com`, password: 'short' } });
  assert.equal(r.status, 400);
});
await check('login with the right password works', async () => {
  const r = await call('parent-auth', { body: { action: 'login', email: emailA, password: PASSWORD } });
  assert.equal(r.status, 200, JSON.stringify(r.body).slice(0, 200));
  assert.ok(r.body.token);
});
await check('login with a wrong password is 401', async () => {
  const r = await call('parent-auth', { body: { action: 'login', email: emailA, password: 'wrong-password-1' } });
  assert.equal(r.status, 401);
});
await check('verify-token accepts the signup token', async () => {
  const r = await call('parent-auth', { body: { action: 'verify-token', token: tokenA } });
  assert.equal(r.status, 200, JSON.stringify(r.body).slice(0, 200));
});
await check('dashboard without a token is 401', async () => {
  const r = await call('dashboard-api', { query: '?action=get-children', body: {} });
  assert.equal(r.status, 401);
});
await check('dashboard with a forged token is 401', async () => {
  const r = await call('dashboard-api', { query: '?action=get-children', body: {}, token: 'eyJhbGciOiJIUzI1NiJ9.eyJwYXJlbnRJZCI6IjEifQ.bad' });
  assert.equal(r.status, 401);
});
await check('add-child creates a child (new account grace period)', async () => {
  const r = await call('dashboard-api', { query: '?action=add-child', token: tokenA, body: { nickname: 'Pip', ageRange: '8-12', avatarColor: 'blue' } });
  assert.equal(r.status, 201, JSON.stringify(r.body).slice(0, 200));
  assert.equal(r.body.child.nickname, 'Pip');
  assert.equal(r.body.child.is_active, true, 'is_active must decode to boolean true');
  childId = r.body.child.id;
});
await check('get-children lists it', async () => {
  const r = await call('dashboard-api', { query: '?action=get-children', token: tokenA, body: {} });
  assert.equal(r.status, 200);
  assert.equal(r.body.children.length, 1);
});
await check('update-child changes only supplied fields', async () => {
  const r = await call('dashboard-api', { query: '?action=update-child', token: tokenA, body: { childId, nickname: 'Pippa' } });
  assert.equal(r.status, 200, JSON.stringify(r.body).slice(0, 200));
  assert.equal(r.body.child.nickname, 'Pippa');
  assert.equal(r.body.child.age_range, '8-12');
});
await check('generate-link-code returns a 6 digit code', async () => {
  const r = await call('dashboard-api', { query: '?action=generate-link-code', token: tokenA, body: { childId } });
  assert.equal(r.status, 200, JSON.stringify(r.body).slice(0, 200));
  assert.match(r.body.code, /^\d{6}$/);
  linkCode = r.body.code;
});
await check('child-link exchanges the code for a child token', async () => {
  const r = await call('child-link', { body: { code: linkCode } });
  assert.equal(r.status, 200, JSON.stringify(r.body).slice(0, 200));
  childToken = r.body.token;
  assert.ok(childToken);
});
await check('the same code cannot be used twice', async () => {
  const r = await call('child-link', { body: { code: linkCode } });
  assert.ok(r.status >= 400 && r.status < 500, `status ${r.status}`);
});
await check('a made-up code is rejected', async () => {
  const r = await call('child-link', { body: { code: '000000' } });
  assert.ok(r.status >= 400 && r.status < 500, `status ${r.status}`);
});
await check('lessons list returns the 9 seeded lessons', async () => {
  const r = await call('lessons-api', { query: '?action=get-lessons&limit=50' });
  assert.equal(r.status, 200);
  assert.equal(r.body.lessons.length, 9);
  assert.ok(Array.isArray(r.body.lessons[0].objectives), 'objectives must decode to an array');
  lessonId = r.body.lessons[0].id;
});
await check('lessons filter by topic is case-insensitive', async () => {
  const r = await call('lessons-api', { query: '?action=get-lessons&topic=creation' });
  assert.equal(r.status, 200);
  assert.ok(r.body.lessons.length >= 1);
});
await check('lessons multi-filter works', async () => {
  const r = await call('lessons-api', { query: '?action=get-lessons&topic=creation&type=Bible%20Story' });
  assert.equal(r.status, 200);
  assert.ok(r.body.lessons.length >= 1);
});
await check('lesson detail embeds its activities as objects', async () => {
  const r = await call('lessons-api', { path: '', query: '?action=get-lessons' });
  const withActivities = await fetch(`${FN}/lessons-api/lessons/${lessonId}`).then((x) => x.json());
  assert.ok(Array.isArray(withActivities.lesson.activities), 'activities must decode to an array');
  assert.ok(r.status === 200);
});
await check('topics endpoint returns counts', async () => {
  const r = await call('lessons-api', { query: '?action=get-topics' });
  assert.equal(r.status, 200);
  assert.ok(r.body.types.length > 0);
});
await check('current liturgical season is found for today', async () => {
  const r = await call('lessons-api', { query: '?action=get-current-season' });
  assert.equal(r.status, 200);
  assert.ok(r.body.season && r.body.season.season, `no season for today: ${JSON.stringify(r.body)}`);
});
await check('child can start and complete a lesson', async () => {
  const start = await call('lessons-api', { query: '?action=start-lesson', token: childToken, body: { lessonId } });
  assert.equal(start.status, 200, JSON.stringify(start.body).slice(0, 200));
  const again = await call('lessons-api', { query: '?action=start-lesson', token: childToken, body: { lessonId } });
  assert.equal(again.status, 200, 'restarting must upsert, not fail');
  const done = await call('lessons-api', { query: '?action=complete-lesson', token: childToken, body: { lessonId, timeSpentMinutes: 12, notes: 'liked it' } });
  assert.equal(done.status, 200, JSON.stringify(done.body).slice(0, 200));
});
await check('start-lesson without a child token is 401', async () => {
  const r = await call('lessons-api', { query: '?action=start-lesson', body: { childId, lessonId } });
  assert.equal(r.status, 401);
});
await check('parent reads the progress with correct stats', async () => {
  const r = await call('lessons-api', { query: '?action=get-progress', token: tokenA, body: { childId } });
  assert.equal(r.status, 200, JSON.stringify(r.body).slice(0, 200));
  assert.equal(r.body.progress.length, 1);
  assert.equal(Number(r.body.stats.completed_lessons), 1);
  assert.equal(Number(r.body.stats.total_minutes), 12);
});
await check('a second parent cannot read the first parent\'s child (403)', async () => {
  const signup = await call('parent-auth', { body: { action: 'signup', email: emailB, password: PASSWORD } });
  tokenB = signup.body.token;
  const r = await call('lessons-api', { query: '?action=get-progress', token: tokenB, body: { childId } });
  assert.equal(r.status, 403);
});
await check('a second parent cannot see or edit the first parent\'s child', async () => {
  const list = await call('dashboard-api', { query: '?action=get-children', token: tokenB, body: {} });
  assert.equal(list.body.children.length, 0);
  const edit = await call('dashboard-api', { query: '?action=update-child', token: tokenB, body: { childId, nickname: 'Hacked' } });
  assert.equal(edit.status, 404);
});
await check('settings upsert and read back with decoded booleans and JSON', async () => {
  const put = await call('dashboard-api', { query: '?action=update-settings', token: tokenA, body: { emailReportsEnabled: false, safetyAlertsEnabled: true, contentFilterLevel: 'strict', dailyTimeLimitMinutes: 45, bedtimeStart: '20:00', bedtimeEnd: '07:00', allowedFeatures: { games: true, chat: false, prayers: true } } });
  assert.equal(put.status, 200, JSON.stringify(put.body).slice(0, 200));
  const get = await call('dashboard-api', { query: '?action=get-settings', token: tokenA, body: {} });
  assert.equal(get.body.settings.email_reports_enabled, false);
  assert.equal(get.body.settings.content_filter_level, 'strict');
  assert.equal(get.body.settings.allowed_features.chat, false);
});
await check('log-activity then get-activity (with nested child filter) returns the session', async () => {
  const log = await call('dashboard-api', { query: '?action=log-activity', token: childToken, body: { childId, sessionId: `session_${RUN}` } });
  assert.equal(log.status, 200, JSON.stringify(log.body).slice(0, 200));
  await call('dashboard-api', { query: '?action=log-activity', token: childToken, body: { sessionId: `session_${RUN}` } });
  const r = await call('dashboard-api', { query: '?action=get-activity', token: tokenA, body: { childId } });
  assert.equal(r.status, 200, JSON.stringify(r.body).slice(0, 200));
  assert.equal(r.body.sessions.length, 1);
  assert.equal(r.body.sessions[0].interactions_count, 2, 'second log must increment, not duplicate');
  assert.equal(r.body.sessions[0].is_linked_account, true);
});
await check('safety event is logged and shows for the owning parent only', async () => {
  const log = await call('dashboard-api', { query: '?action=log-safety-event', token: childToken, body: { sessionId: `session_${RUN}`, category: 'drug_safety', message: 'test trigger', aiResponse: 'talk to a trusted adult' } });
  assert.equal(log.status, 200, JSON.stringify(log.body).slice(0, 200));
  const mine = await call('dashboard-api', { query: '?action=get-safety-events', token: tokenA, body: {} });
  assert.equal(mine.body.events.length, 1);
  const theirs = await call('dashboard-api', { query: '?action=get-safety-events', token: tokenB, body: {} });
  assert.equal(theirs.body.events.length, 0);
});
await check('log-activity and log-safety-event without a child token are 401', async () => {
  for (const action of ['log-activity', 'log-safety-event']) {
    const r = await call('dashboard-api', { query: `?action=${action}`, body: { childId, sessionId: 'session_forged_12345', category: 'x', message: 'forged' } });
    assert.equal(r.status, 401, action);
  }
});
await check('a parent token cannot be used for child logging', async () => {
  const r = await call('dashboard-api', { query: '?action=log-activity', token: tokenA, body: { childId, sessionId: 'session_x_123456' } });
  assert.equal(r.status, 401);
});
await check('child token with a different childId in the body is 403', async () => {
  const r = await call('dashboard-api', { query: '?action=log-activity', token: childToken, body: { childId: 'someone-else', sessionId: 'session_y_123456' } });
  assert.equal(r.status, 403);
});
await check('a child token cannot call parent actions', async () => {
  const r = await call('dashboard-api', { query: '?action=get-children', token: childToken, body: {} });
  assert.equal(r.status, 401);
});
await check('another parent cannot mint a link code for this child (IDOR)', async () => {
  const r = await call('dashboard-api', { query: '?action=generate-link-code', token: tokenB, body: { childId } });
  assert.equal(r.status, 404);
});
await check('another parent cannot delete this child', async () => {
  const r = await call('dashboard-api', { query: '?action=delete-child', token: tokenB, body: { childId } });
  assert.equal(r.status, 404);
  const list = await call('dashboard-api', { query: '?action=get-children', token: tokenA, body: {} });
  assert.equal(list.body.children.length, 1, 'child must still exist');
});
await check('bad child fields are rejected (type and length)', async () => {
  const longName = await call('dashboard-api', { query: '?action=add-child', token: tokenA, body: { nickname: 'x'.repeat(51), ageRange: '8-12' } });
  assert.equal(longName.status, 400);
  const objectName = await call('dashboard-api', { query: '?action=add-child', token: tokenA, body: { nickname: { a: 1 }, ageRange: '8-12' } });
  assert.equal(objectName.status, 400);
  const stringBool = await call('dashboard-api', { query: '?action=update-child', token: tokenA, body: { childId, isActive: 'false' } });
  assert.equal(stringBool.status, 400);
});
await check('lessons limit is clamped (negative gives 1, huge gives all)', async () => {
  const neg = await call('lessons-api', { query: '?action=get-lessons&limit=-1' });
  assert.equal(neg.body.lessons.length, 1);
  const big = await call('lessons-api', { query: '?action=get-lessons&limit=100000' });
  assert.equal(big.body.lessons.length, 9);
});
await check('database errors do not leak table or column names', async () => {
  const r = await call('lessons-api', { query: '?action=start-lesson', token: childToken, body: { lessonId: 987654 } });
  assert.doesNotMatch(JSON.stringify(r.body), /D1_ERROR|SQLITE|constraint|lesson_progress/i);
});
await check('delete-child removes it and its progress (cascade)', async () => {
  const r = await call('dashboard-api', { query: '?action=delete-child', token: tokenA, body: { childId } });
  assert.equal(r.status, 200);
  const list = await call('dashboard-api', { query: '?action=get-children', token: tokenA, body: {} });
  assert.equal(list.body.children.length, 0);
});

await check('link code guessing is rate limited (429 within 12 attempts)', async () => {
  const statuses = [];
  for (let i = 0; i < 12; i += 1) statuses.push((await call('child-link', { body: { code: String(100000 + i) } })).status);
  assert.ok(statuses.includes(429), `no 429 in ${statuses}`);
});

console.log(`\n${passed} passed${process.exitCode ? ', SOME FAILED' : ''}`);
