/**
 * One-off verification of two spec-required behaviors not covered by api.test.mjs:
 *   §13: admin reject  (pending -> rejected)
 * §25: lazy expiry (active with past endDate -> expired on read, persisted)
 * Run: node tests/lifecycle.check.mjs
 */
import mongoose from 'mongoose';

const BASE = process.env.API_URL || 'http://localhost:5000/api';
const stamp = Date.now();
let passed = 0, failed = 0;
const check = (name, cond, extra = '') => {
  if (cond) { passed += 1; console.log(`  PASS  ${name}`); }
  else { failed += 1; console.log(`  FAIL  ${name}${extra ? ` -- ${extra}` : ''}`); }
};

const req = async (method, path, { body, token } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch (_) { /* non-json */ }
  return { status: res.status, body: json };
};

const run = async () => {
  console.log('\n=== Lifecycle check: reject + lazy expiry ===\n');
  const email = `lifecycle${stamp}@college.edu`;

  // Register a fresh user
  const reg = await req('POST', '/auth/register', {
    body: { name: 'Lifecycle Tester', email, phone: '9876543210', password: 'Pass@123' },
  });
  const userToken = reg.body?.data?.token;
  check('fresh user registered', reg.status === 201 && !!userToken, `got ${reg.status}`);

  // Admin login
  const adminLogin = await req('POST', '/auth/login', {
    body: { email: 'admin@gym.com', password: 'Admin@123' },
  });
  const adminToken = adminLogin.body?.data?.token;
  check('admin logged in', adminLogin.status === 200 && !!adminToken);

  // Find two distinct active memberships from the public API
  const list = await req('GET', '/memberships');
  const plans = list.body?.data || [];
  check('public plans available', plans.length >= 2, `got ${plans.length}`);
  const [planA, planB] = plans;

  // ---------- §13: reject flow ----------
  console.log('\nReject flow (pending -> rejected)');
  const applyA = await req('POST', '/applications', {
    token: userToken, body: { membershipId: planA._id },
  });
  const appA = applyA.body?.data?._id;
  check('application created as pending', applyA.status === 201 && applyA.body?.data?.status === 'pending');

  const rejected = await req('PUT', `/admin/applications/${appA}/status`, {
    token: adminToken, body: { status: 'rejected' },
  });
  check('admin rejects pending application (200)', rejected.status === 200 && rejected.body?.data?.status === 'rejected', `got ${rejected.status} ${rejected.body?.message}`);
  check('reject message correct', /rejected/i.test(rejected.body?.message || ''));

  const reapprove = await req('PUT', `/admin/applications/${appA}/status`, {
    token: adminToken, body: { status: 'approved' },
  });
  check('rejected is terminal (approve again -> 409)', reapprove.status === 409, `got ${reapprove.status}`);

  // ---------- §25: lazy expiry ----------
  console.log('\nLazy expiry (active with past endDate -> expired)');
  const applyB = await req('POST', '/applications', {
    token: userToken, body: { membershipId: planB._id },
  });
  const appB = applyB.body?.data?._id;
  check('second application created', applyB.status === 201 && !!appB);

  await req('PUT', `/admin/applications/${appB}/status`, { token: adminToken, body: { status: 'approved' } });
  const activated = await req('PUT', `/admin/applications/${appB}/status`, {
    token: adminToken, body: { status: 'active' },
  });
  check('application activated with endDate', activated.status === 200 && !!activated.body?.data?.endDate, `got ${activated.status}`);

  // Backdate endDate to simulate time passing
  await mongoose.connect(process.env.MONGODB_URI);
  const subColl = mongoose.connection.db.collection('subscriptions');
  await subColl.updateOne({ _id: new mongoose.Types.ObjectId(appB) }, { $set: { endDate: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
  const beforeRead = await subColl.findOne({ _id: new mongoose.Types.ObjectId(appB) }, { projection: { status: 1 } });
  check('DB still active before read', beforeRead.status === 'active');

  // User reads own applications -> sweep should flip to expired
  const mine = await req('GET', '/applications/my', { token: userToken });
  const flipped = (mine.body?.data || []).find((a) => a._id === appB);
  check('read flips active -> expired', mine.status === 200 && flipped?.status === 'expired', `got ${flipped?.status}`);

  const afterRead = await subColl.findOne({ _id: new mongoose.Types.ObjectId(appB) }, { projection: { status: 1 } });
  check('expiry persisted in MongoDB', afterRead.status === 'expired', `got ${afterRead.status}`);

  // Admin stats should count it as expired
  const stats = await req('GET', '/admin/dashboard/stats', { token: adminToken });
  check('dashboard counts expired application', (stats.body?.data?.byStatus || []).some((s) => s.status === 'expired' && s.count >= 1), JSON.stringify(stats.body?.data?.byStatus));

  // Cleanup: remove this scenario's data so demo DB stays tidy
  await subColl.deleteMany({ user: (await mongoose.connection.db.collection('users').findOne({ email })) ._id });
  await mongoose.connection.db.collection('users').deleteOne({ email });

  await mongoose.disconnect();

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
};

run().catch((err) => { console.error('Lifecycle check crashed:', err); process.exit(1); });
