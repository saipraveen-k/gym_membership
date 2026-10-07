/**
 * End-to-end API test suite for the Gym Membership backend.
 * Run with:  npm test   (server must already be running on PORT)
 *
 * Covers: auth, validation, security, memberships, applications,
 * admin CRUD, status lifecycle and dashboard stats.
 */

const BASE = process.env.API_URL || 'http://localhost:5000/api';

let passed = 0;
let failed = 0;
const failures = [];

const check = (name, cond, extra = '') => {
  if (cond) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    failures.push(name);
    console.log(`  FAIL  ${name}${extra ? ` -- ${extra}` : ''}`);
  }
};

const req = async (method, path, { body, token } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let json = null;
  try {
    json = await res.json();
  } catch (_) {
    /* non-json */
  }
  return { status: res.status, body: json };
};

const stamp = Date.now();

const run = async () => {
  console.log(`\n=== Gym Membership API Tests (${BASE}) ===\n`);

  // ---------- Health ----------
  console.log('Health');
  {
    const r = await req('GET', '/health');
    check('health endpoint returns success', r.status === 200 && r.body?.success === true);
    check('health reports database connected', r.body?.database === 'connected');
  }

  // ---------- Register ----------
  console.log('\nAuth: Register');
  const userEmail = `student${stamp}@college.edu`;
  let userToken;

  {
    const r = await req('POST', '/auth/register', {
      body: {
        name: 'Test Student',
        email: userEmail,
        phone: '9876543210',
        password: 'Pass@123',
        confirmPassword: 'Pass@123',
      },
    });
    check('register returns 201 with token', r.status === 201 && !!r.body?.data?.token);
    check('register returns user without password', !JSON.stringify(r.body?.data?.user || {}).includes('password'));
    userToken = r.body?.data?.token;
  }

  {
    const r = await req('POST', '/auth/register', {
      body: {
        name: 'Test Student',
        email: userEmail,
        phone: '9876543210',
        password: 'Pass@123',
      },
    });
    check('duplicate email returns 409', r.status === 409, `got ${r.status}`);
  }

  {
    const r = await req('POST', '/auth/register', {
      body: {
        name: 'X',
        email: 'not-an-email',
        phone: 'abc',
        password: '123',
      },
    });
    check('invalid register data returns 400', r.status === 400, `got ${r.status}`);
  }

  {
    const r = await req('POST', '/auth/register', {
      body: {
        name: 'Mismatch Person',
        email: `mismatch${stamp}@test.com`,
        phone: '9876543210',
        password: 'Pass@123',
        confirmPassword: 'Pass@999',
      },
    });
    check('mismatched passwords return 400', r.status === 400, `got ${r.status}`);
  }

  // ---------- Login ----------
  console.log('\nAuth: Login');
  {
    const r = await req('POST', '/auth/login', {
      body: { email: userEmail, password: 'Pass@123' },
    });
    check('valid login returns 200 + token', r.status === 200 && !!r.body?.data?.token);
  }
  {
    const r = await req('POST', '/auth/login', {
      body: { email: userEmail, password: 'WrongPass1' },
    });
    check('wrong password returns 401', r.status === 401, `got ${r.status}`);
  }
  {
    const r = await req('POST', '/auth/login', {
      body: { email: `nobody${stamp}@test.com`, password: 'Pass@123' },
    });
    check('unknown email returns 401', r.status === 401, `got ${r.status}`);
  }

  // ---------- Token / me ----------
  console.log('\nAuth: Token handling');
  {
    const r = await req('GET', '/auth/me', { token: userToken });
    check('GET /auth/me with token returns user', r.status === 200 && r.body?.data?.email === userEmail.toLowerCase());
  }
  {
    const r = await req('GET', '/auth/me');
    check('GET /auth/me without token returns 401', r.status === 401, `got ${r.status}`);
  }
  {
    const r = await req('GET', '/auth/me', { token: 'garbage.token.here' });
    check('GET /auth/me with invalid token returns 401', r.status === 401, `got ${r.status}`);
  }

  // ---------- Profile ----------
  console.log('\nAuth: Profile');
  {
    const r = await req('PUT', '/auth/profile', {
      token: userToken,
      body: { name: 'Test Student Updated', phone: '9123456780' },
    });
    check('profile update succeeds', r.status === 200 && r.body?.data?.name === 'Test Student Updated');
    check('profile update keeps role as user', r.body?.data?.role === 'user');
  }
  {
    const r = await req('PUT', '/auth/profile', {
      token: userToken,
      body: { name: 'Hacker', role: 'admin' },
    });
    check('role cannot be changed via profile update', r.body?.data?.role === 'user');
  }

  // ---------- Public memberships ----------
  console.log('\nMemberships');
  let memberships = [];
  {
    const r = await req('GET', '/memberships');
    memberships = r.body?.data || [];
    check('GET /memberships returns seeded plans', r.status === 200 && memberships.length >= 5, `got ${memberships.length}`);
    check('memberships include categories for filters', (r.body?.meta?.categories || []).length >= 3);
  }
  {
    const r = await req('GET', '/memberships?search=gold');
    check('search by name works', r.status === 200 && r.body?.data?.length === 1 && /gold/i.test(r.body.data[0].name), `got ${r.body?.data?.length}`);
  }
  {
    const r = await req('GET', '/memberships?category=Basic');
    check('category filter works', r.status === 200 && r.body?.data?.every((m) => m.category === 'Basic'));
  }
  {
    const r = await req('GET', '/memberships?maxPrice=3000');
    check('price filter works', r.status === 200 && r.body?.data?.every((m) => m.price <= 3000) && r.body?.data?.length > 0);
  }
  {
    const r = await req('GET', '/memberships?sort=price_asc');
    const prices = (r.body?.data || []).map((m) => m.price);
    const sorted = [...prices].sort((a, b) => a - b);
    check('sort price low to high works', r.status === 200 && JSON.stringify(prices) === JSON.stringify(sorted));
  }
  {
    const r = await req('GET', '/memberships?sort=price_desc');
    const prices = (r.body?.data || []).map((m) => m.price);
    const sorted = [...prices].sort((a, b) => b - a);
    check('sort price high to low works', r.status === 200 && JSON.stringify(prices) === JSON.stringify(sorted));
  }

  const someMembership = memberships[0];
  {
    const r = await req('GET', `/memberships/${someMembership._id}`);
    check('GET membership by id works', r.status === 200 && r.body?.data?._id === someMembership._id);
  }
  {
    const r = await req('GET', '/memberships/64b000000000000000000000');
    check('unknown membership id returns 404', r.status === 404, `got ${r.status}`);
  }
  {
    const r = await req('GET', '/memberships/not-an-id');
    check('invalid membership id returns 400', r.status === 400, `got ${r.status}`);
  }

  // ---------- Applications (user) ----------
  console.log('\nApplications (user)');
  let applicationId;
  {
    const r = await req('POST', '/applications', {
      body: { membershipId: someMembership._id },
    });
    check('unauthenticated application returns 401', r.status === 401, `got ${r.status}`);
  }
  {
    const r = await req('POST', '/applications', {
      token: userToken,
      body: { membershipId: someMembership._id },
    });
    applicationId = r.body?.data?._id;
    check('apply for membership returns 201', r.status === 201 && !!applicationId, `got ${r.status}`);
    check('new application is pending + unpaid', r.body?.data?.status === 'pending' && r.body?.data?.paymentStatus === 'unpaid');
    check('application success message', r.body?.message === 'Membership application submitted successfully.');
  }
  {
    const r = await req('POST', '/applications', {
      token: userToken,
      body: { membershipId: someMembership._id },
    });
    check('duplicate application returns 409', r.status === 409, `got ${r.status}`);
  }
  {
    const r = await req('POST', '/applications', {
      token: userToken,
      body: { membershipId: 'not-an-id' },
    });
    check('invalid membership id returns 400', r.status === 400, `got ${r.status}`);
  }
  {
    const r = await req('POST', '/applications', {
      token: userToken,
      body: { membershipId: '64b000000000000000000000' },
    });
    check('nonexistent membership returns 404', r.status === 404, `got ${r.status}`);
  }
  {
    const r = await req('GET', '/applications/my', { token: userToken });
    check('GET /applications/my returns own applications', r.status === 200 && r.body?.data?.length === 1);
    check('my applications populate membership', !!r.body?.data?.[0]?.membership?.name);
  }
  {
    const r = await req('GET', `/applications/${applicationId}`, { token: userToken });
    check('owner can view own application', r.status === 200 && r.body?.data?._id === applicationId);
  }

  // ---------- Admin security ----------
  console.log('\nSecurity: admin routes');
  {
    const r = await req('GET', '/admin/users', { token: userToken });
    check('normal user blocked from admin API (403)', r.status === 403, `got ${r.status}`);
  }
  {
    const r = await req('GET', '/admin/dashboard/stats', { token: userToken });
    check('normal user blocked from admin stats (403)', r.status === 403, `got ${r.status}`);
  }
  {
    const r = await req('GET', '/admin/applications');
    check('admin API without token returns 401', r.status === 401, `got ${r.status}`);
  }

  // ---------- Admin login ----------
  console.log('\nAuth: Admin');
  let adminToken;
  {
    const r = await req('POST', '/auth/login', {
      body: { email: 'admin@gym.com', password: 'Admin@123' },
    });
    adminToken = r.body?.data?.token;
    check('admin seed login works', r.status === 200 && r.body?.data?.user?.role === 'admin');
  }

  // ---------- Admin dashboard ----------
  console.log('\nAdmin: Dashboard');
  let stats;
  {
    const r = await req('GET', '/admin/dashboard/stats', { token: adminToken });
    stats = r.body?.data;
    check('admin stats returns 200', r.status === 200);
    check('stats has real totalUsers >= 1', Number.isInteger(stats?.totalUsers) && stats.totalUsers >= 1);
    check('stats has totalMemberships >= 5', Number.isInteger(stats?.totalMemberships) && stats.totalMemberships >= 5);
    check('stats has totalApplications >= 1', Number.isInteger(stats?.totalApplications) && stats.totalApplications >= 1);
    check('stats has pendingApplications >= 1', stats?.pendingApplications >= 1);
    check('stats byStatus is an array', Array.isArray(stats?.byStatus));
  }

  // ---------- Admin users ----------
  console.log('\nAdmin: Users');
  let usersList;
  {
    const r = await req('GET', '/admin/users', { token: adminToken });
    usersList = r.body?.data || [];
    check('admin users list returns users', r.status === 200 && usersList.length >= 2);
    check('users list has no passwords', !JSON.stringify(usersList).includes('"password"'));
    check('users list includes application counts', usersList.some((u) => u.applications > 0));
  }
  const targetUser = usersList.find((u) => u.email === userEmail.toLowerCase());
  {
    const r = await req('GET', `/admin/users/${targetUser._id}`, { token: adminToken });
    check('admin can view a single user with applications', r.status === 200 && Array.isArray(r.body?.data?.applications) && r.body.data.applications.length === 1);
  }

  // ---------- Admin membership CRUD ----------
  console.log('\nAdmin: Membership CRUD');
  let newMembershipId;
  const newPlan = {
    name: 'Weekend Warrior',
    description: 'A short plan for members who only train on weekends.',
    price: 1499,
    duration: 2,
    durationUnit: 'weeks',
    category: 'Basic',
    features: ['Weekend Access', 'Cardio Area'],
    isActive: true,
  };
  {
    const r = await req('POST', '/admin/memberships', { token: adminToken, body: newPlan });
    newMembershipId = r.body?.data?._id;
    check('admin creates membership (201)', r.status === 201 && !!newMembershipId, `got ${r.status}`);
  }
  {
    const r = await req('POST', '/admin/memberships', {
      token: adminToken,
      body: { name: 'Bad', description: 'x', price: -5, duration: 0, category: '' },
    });
    check('invalid membership data returns 400', r.status === 400, `got ${r.status}`);
  }
  {
    const r = await req('GET', `/memberships/${newMembershipId}`);
    check('new membership visible on public API', r.status === 200 && r.body?.data?.name === 'Weekend Warrior');
  }
  {
    const r = await req('PUT', `/admin/memberships/${newMembershipId}`, {
      token: adminToken,
      body: { ...newPlan, name: 'Weekend Warrior Pro', price: 1799 },
    });
    check('admin updates membership (200)', r.status === 200 && r.body?.data?.price === 1799, `got ${r.status}`);
  }
  {
    const r = await req('GET', `/memberships/${newMembershipId}`);
    check('update persisted', r.body?.data?.name === 'Weekend Warrior Pro');
  }
  {
    // This membership has no subscriptions -> hard delete expected
    const r = await req('DELETE', `/admin/memberships/${newMembershipId}`, { token: adminToken });
    check('admin deletes unused membership', r.status === 200, `got ${r.status}`);
    const g = await req('GET', `/memberships/${newMembershipId}`);
    check('deleted membership no longer exists (404)', g.status === 404, `got ${g.status}`);
  }
  {
    // Membership WITH a subscription -> deactivation instead
    const r = await req('DELETE', `/admin/memberships/${someMembership._id}`, { token: adminToken });
    check('membership with subscriptions is deactivated instead', r.status === 200 && /deactivat/i.test(r.body?.message || ''), r.body?.message);
    const g = await req('GET', `/memberships/${someMembership._id}`);
    check('deactivated membership hidden from public API', g.status === 404);
    // reactivate so later steps keep working (asserted so seeded plans never leak as inactive)
    const back = await req('PUT', `/admin/memberships/${someMembership._id}`, {
      token: adminToken,
      body: { isActive: true },
    });
    check('reactivation of seeded plan succeeds', back.status === 200 && back.body?.data?.isActive === true, `got ${back.status}`);
  }
  {
    const r = await req('DELETE', '/admin/memberships/64b000000000000000000000', { token: adminToken });
    check('deleting unknown membership returns 404', r.status === 404, `got ${r.status}`);
  }

  // ---------- Admin application lifecycle ----------
  console.log('\nAdmin: Application lifecycle');
  {
    const r = await req('GET', '/admin/applications', { token: adminToken });
    check('admin applications list works', r.status === 200 && r.body?.data?.length >= 1);
    check('applications populate user and membership', !!r.body?.data?.[0]?.user?.email && !!r.body?.data?.[0]?.membership?.name);
  }
  {
    // invalid transition: pending -> active is not allowed (must approve first)
    const r = await req('PUT', `/admin/applications/${applicationId}/status`, {
      token: adminToken,
      body: { status: 'active' },
    });
    check('invalid transition pending->active returns 409', r.status === 409, `got ${r.status}`);
  }
  {
    const r = await req('PUT', `/admin/applications/${applicationId}/status`, {
      token: adminToken,
      body: { status: 'approved' },
    });
    check('approve pending application works', r.status === 200 && r.body?.data?.status === 'approved', `got ${r.status}`);
  }
  {
    const r = await req('PUT', `/admin/applications/${applicationId}/status`, {
      token: adminToken,
      body: { status: 'active' },
    });
    const app = r.body?.data || {};
    check('activate approved application works', r.status === 200 && app.status === 'active', `got ${r.status}`);
    check('activation sets startDate', !!app.startDate);
    check('activation sets endDate after startDate', !!app.endDate && new Date(app.endDate) > new Date(app.startDate));
  }
  {
    const r = await req('PUT', `/admin/applications/${applicationId}/payment`, {
      token: adminToken,
      body: { paymentStatus: 'paid' },
    });
    check('mark payment as paid works', r.status === 200 && r.body?.data?.paymentStatus === 'paid');
  }
  {
    const r = await req('PUT', `/admin/applications/${applicationId}/status`, {
      token: adminToken,
      body: { status: 'approved' },
    });
    check('invalid transition active->approved returns 409', r.status === 409, `got ${r.status}`);
  }
  {
    const r = await req('PUT', '/admin/applications/64b000000000000000000000/status', {
      token: adminToken,
      body: { status: 'approved' },
    });
    check('status update on unknown application returns 404', r.status === 404, `got ${r.status}`);
  }
  {
    const r = await req('PUT', `/admin/applications/${applicationId}/status`, {
      token: adminToken,
      body: { status: 'dancing' },
    });
    check('invalid status value returns 400', r.status === 400, `got ${r.status}`);
  }
  {
    // Second user cannot view someone else's application
    const email2 = `second${stamp}@college.edu`;
    await req('POST', '/auth/register', {
      body: { name: 'Second User', email: email2, phone: '9111111111', password: 'Pass@123' },
    });
    const login = await req('POST', '/auth/login', { body: { email: email2, password: 'Pass@123' } });
    const r = await req('GET', `/applications/${applicationId}`, { token: login.body?.data?.token });
    check('other user blocked from viewing application (403)', r.status === 403, `got ${r.status}`);
    const adminView = await req('GET', `/applications/${applicationId}`, { token: adminToken });
    check('admin can view any application', adminView.status === 200);
  }
  {
    // Payment recalculation: revenue should now include the paid plan
    const r = await req('GET', '/admin/dashboard/stats', { token: adminToken });
    check('revenue reflects paid application', (r.body?.data?.revenue || 0) >= someMembership.price, `revenue=${r.body?.data?.revenue}`);
    check('active memberships count updated', r.body?.data?.activeMemberships >= 1);
  }

  // ---------- Summary ----------
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) {
    console.log('Failed tests:');
    failures.forEach((f) => console.log(`  - ${f}`));
    process.exit(1);
  }
  process.exit(0);
};

run().catch((err) => {
  console.error('Test suite crashed:', err);
  process.exit(1);
});
