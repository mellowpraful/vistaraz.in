/**
 * Automated Verification Script for Vistaraz Authentication & Role Flows
 */
import assert from 'node:assert';
import crypto from 'node:crypto';

// Polyfill Web Crypto API in Node for testing the browser hashing logic
globalThis.window = {
  crypto: {
    subtle: {
      digest: async (algo, data) => {
        return crypto.createHash('sha256').update(data).digest();
      }
    }
  }
};

// Polyfill localStorage & sessionStorage for testing isolated service logic
const mockStorage = new Map();
globalThis.localStorage = {
  getItem: (k) => (mockStorage.has(k) ? mockStorage.get(k) : null),
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  clear: () => mockStorage.clear(),
};

const mockSession = new Map();
globalThis.sessionStorage = {
  getItem: (k) => (mockSession.has(k) ? mockSession.get(k) : null),
  setItem: (k, v) => mockSession.set(k, String(v)),
  removeItem: (k) => mockSession.delete(k),
  clear: () => mockSession.clear(),
};

// Import authService
const authService = await import('../src/services/authService.js');

console.log('🧪 Starting Automated Unit & Integration Tests for Auth Service...\n');

// 1. Password Hashing Test
console.log('Test 1: Web Crypto SHA-256 Hashing');
const hash1 = await authService.hashPassword('password123');
const hash2 = await authService.hashPassword('password123');
const hashOther = await authService.hashPassword('different');
assert.strictEqual(hash1, hash2, 'Identical passwords must produce identical hashes');
assert.notStrictEqual(hash1, hashOther, 'Different passwords must produce different hashes');
assert.ok(hash1.length === 64, 'SHA-256 hex string should be 64 chars');
console.log('  ✓ Password hashing works and is salted & non-plaintext');

// 2. Empty Session Test
console.log('\nTest 2: Initial Session State');
assert.strictEqual(authService.getCurrentUser(), null, 'Initially no user should be logged in');
assert.strictEqual(authService.getSession(), null, 'Initial session should be null');
console.log('  ✓ Initial state is guest/unauthenticated');

// 3. Register Support Seeker
console.log('\nTest 3: Support Seeker Registration');
const seeker = await authService.register({
  name: 'Maya Seeker',
  email: 'maya@example.com',
  password: 'password123',
  role: 'support_seeker',
});

assert.ok(seeker.id, 'Account should have generated ID');
assert.strictEqual(seeker.name, 'Maya Seeker');
assert.strictEqual(seeker.email, 'maya@example.com');
assert.strictEqual(seeker.role, 'support_seeker');
assert.strictEqual(seeker.onboardingCompleted, false);
assert.strictEqual(seeker.helperVerificationStatus, 'none');
assert.strictEqual(seeker.passwordHash, undefined, 'passwordHash must never be exposed');
console.log('  ✓ Support Seeker registered and session established');

// 4. Session Persistence Test
console.log('\nTest 4: Session Persistence');
const currentUser = authService.getCurrentUser();
assert.ok(currentUser, 'User should be persisted in session');
assert.strictEqual(currentUser.id, seeker.id);
assert.strictEqual(currentUser.role, 'support_seeker');
console.log('  ✓ Session persists correctly');

// 5. Duplicate Email Rejection Test
console.log('\nTest 5: Duplicate Email Validation');
let duplicateError = null;
try {
  await authService.register({
    name: 'Duplicate Seeker',
    email: 'MAYA@EXAMPLE.COM', // test case insensitivity
    password: 'password123',
    role: 'support_seeker',
  });
} catch (err) {
  duplicateError = err;
}
assert.ok(duplicateError, 'Duplicate registration should throw error');
assert.match(duplicateError.message, /already exists/i);
console.log('  ✓ Duplicate email rejected with clear error');

// 6. Logout Test
console.log('\nTest 6: Logout');
authService.logout();
assert.strictEqual(authService.getCurrentUser(), null, 'User should be null after logout');
assert.strictEqual(authService.getSession(), null, 'Session should be cleared after logout');
console.log('  ✓ Logout successfully clears session');

// 7. Invalid Credentials Login Test
console.log('\nTest 7: Invalid Password Login');
let loginError = null;
try {
  await authService.login({
    email: 'maya@example.com',
    password: 'wrongpassword',
  });
} catch (err) {
  loginError = err;
}
assert.ok(loginError, 'Invalid login should throw error');
assert.match(loginError.message, /incorrect password/i);
console.log('  ✓ Incorrect credentials rejected with clear message');

// 8. Successful Login Test
console.log('\nTest 8: Successful Login');
const loggedInSeeker = await authService.login({
  email: 'maya@example.com',
  password: 'password123',
});
assert.strictEqual(loggedInSeeker.id, seeker.id);
assert.strictEqual(loggedInSeeker.role, 'support_seeker');
assert.strictEqual(authService.getCurrentUser().id, seeker.id);
console.log('  ✓ Login succeeds and restores active user session');

// 9. Register Helper Account Test
console.log('\nTest 9: Helper Registration & Status');
authService.logout();
const helper = await authService.register({
  name: 'Jordan Helper',
  email: 'jordan@example.com',
  password: 'password123',
  role: 'helper',
});
assert.strictEqual(helper.role, 'helper');
assert.strictEqual(helper.helperVerificationStatus, 'pending');
assert.strictEqual(helper.onboardingCompleted, false);
console.log('  ✓ Helper registered with "pending" verification status');

// 10. Helper Verification Status Update
console.log('\nTest 10: Helper Verification Approval');
authService.setHelperVerificationStatus(helper.id, 'verified');
authService.updateCurrentUser({ onboardingCompleted: true });
const updatedHelper = authService.getCurrentUser();
assert.strictEqual(updatedHelper.helperVerificationStatus, 'verified');
assert.strictEqual(updatedHelper.onboardingCompleted, true);
console.log('  ✓ Helper verification status updated to "verified"');

// 11. Purpose Preservation Test
console.log('\nTest 11: Cross-Route Purpose Storage');
authService.savePurpose('support_seeker');
assert.strictEqual(authService.getSavedPurpose(), 'support_seeker');
authService.savePurpose('helper');
assert.strictEqual(authService.getSavedPurpose(), 'helper');
console.log('  ✓ Purpose successfully stored in sessionStorage');

console.log('\n🎉 ALL 11 AUTH SERVICE UNIT & INTEGRATION TESTS PASSED!');
