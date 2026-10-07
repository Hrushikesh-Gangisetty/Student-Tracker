// Quick self-check for the attendance maths. Run with: node src/services/helpers.check.js
import assert from 'node:assert';
import { attendanceHint, attendancePercent } from './helpers.js';

const subject = (attendedClasses, totalClasses) => ({ attendedClasses, totalClasses });

assert.equal(attendancePercent(subject(0, 0)), null);
assert.equal(attendancePercent(subject(20, 25)), 80);
assert.equal(attendanceHint(subject(0, 0)), '');
assert.equal(attendanceHint(subject(15, 25)), 'Attend the next 15 classes to reach 75%'); // 30/40 = 75%
assert.equal(attendanceHint(subject(2, 3)), 'Attend the next 1 class to reach 75%'); // 3/4 = 75%
assert.equal(attendanceHint(subject(3, 4)), 'Cannot miss the next class'); // exactly 75%
assert.equal(attendanceHint(subject(34, 40)), 'Can miss 5 more classes'); // 34/45 = 75.6%
assert.equal(attendanceHint(subject(4, 4)), 'Can miss 1 more class'); // 4/5 = 80%

console.log('helpers OK');
