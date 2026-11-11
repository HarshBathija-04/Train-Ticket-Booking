import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'node:url';
import { config } from '../config.js';
import { addDays, todayIST } from '../lib/dates.js';
import { cancelBooking, createBooking } from '../routes/bookings.js';
import { ensureSchedules } from '../routes/trains.js';
import { pool } from './pool.js';

// Public demo account, shown on the login page on purpose.
export const DEMO_USER = { email: 'demo@raildesk.dev', password: 'Demo@1234', name: 'Aarav Sharma' };

const stations: [string, string, string, string][] = [
  ['NDLS', 'New Delhi', 'Delhi', 'Delhi'],
  ['BCT', 'Mumbai Central', 'Mumbai', 'Maharashtra'],
  ['CSMT', 'Chhatrapati Shivaji Maharaj Terminus', 'Mumbai', 'Maharashtra'],
  ['HWH', 'Howrah Junction', 'Kolkata', 'West Bengal'],
  ['MAS', 'MGR Chennai Central', 'Chennai', 'Tamil Nadu'],
  ['SBC', 'KSR Bengaluru City', 'Bengaluru', 'Karnataka'],
  ['SC', 'Secunderabad Junction', 'Hyderabad', 'Telangana'],
  ['BPL', 'Bhopal Junction', 'Bhopal', 'Madhya Pradesh'],
  ['LKO', 'Lucknow Charbagh', 'Lucknow', 'Uttar Pradesh'],
  ['JP', 'Jaipur Junction', 'Jaipur', 'Rajasthan'],
  ['ADI', 'Ahmedabad Junction', 'Ahmedabad', 'Gujarat'],
  ['PUNE', 'Pune Junction', 'Pune', 'Maharashtra'],
  ['CDG', 'Chandigarh', 'Chandigarh', 'Chandigarh'],
  ['ASR', 'Amritsar Junction', 'Amritsar', 'Punjab'],
  ['BSB', 'Varanasi Junction', 'Varanasi', 'Uttar Pradesh'],
  ['AGC', 'Agra Cantt', 'Agra', 'Uttar Pradesh'],
  ['GHY', 'Guwahati', 'Guwahati', 'Assam'],
  ['TVC', 'Thiruvananthapuram Central', 'Thiruvananthapuram', 'Kerala'],
  ['PNBE', 'Patna Junction', 'Patna', 'Bihar'],
];

const SEATS = { '1A': 18, '2A': 46, '3A': 64, SL: 72, CC: 78, EC: 56 } as const;
type Cls = keyof typeof SEATS;
type TrainRow = [string, string, string, string, string, string, string, number, Partial<Record<Cls, number>>];

const trains: TrainRow[] = [
  // the three trains from the original MySQL dump
  ['12001', 'Bhopal Shatabdi', 'Shatabdi', 'NDLS', 'BPL', '06:00', '14:25', 505, { EC: 2390, CC: 1185 }],
  [
    '12952',
    'Mumbai Rajdhani',
    'Rajdhani',
    'NDLS',
    'BCT',
    '16:30',
    '08:35',
    965,
    { '1A': 4755, '2A': 2860, '3A': 2045 },
  ],
  [
    '12229',
    'Lucknow Mail',
    'Superfast',
    'LKO',
    'NDLS',
    '22:00',
    '06:45',
    525,
    { '1A': 2210, '2A': 1340, '3A': 965, SL: 380 },
  ],
  ['12002', 'Bhopal Shatabdi', 'Shatabdi', 'BPL', 'NDLS', '15:15', '23:40', 505, { EC: 2390, CC: 1185 }],
  [
    '12156',
    'Bhopal Express',
    'Superfast',
    'NDLS',
    'BPL',
    '20:50',
    '07:25',
    635,
    { '1A': 2510, '2A': 1520, '3A': 1080, SL: 420 },
  ],
  [
    '12951',
    'Mumbai Rajdhani',
    'Rajdhani',
    'BCT',
    'NDLS',
    '17:00',
    '08:32',
    932,
    { '1A': 4755, '2A': 2860, '3A': 2045 },
  ],
  [
    '12904',
    'Golden Temple Mail',
    'Mail/Express',
    'NDLS',
    'BCT',
    '07:55',
    '07:00',
    1385,
    { '1A': 3620, '2A': 2190, '3A': 1545, SL: 595 },
  ],
  [
    '12230',
    'Lucknow Mail',
    'Superfast',
    'NDLS',
    'LKO',
    '22:00',
    '06:40',
    520,
    { '1A': 2210, '2A': 1340, '3A': 965, SL: 380 },
  ],
  [
    '12301',
    'Howrah Rajdhani',
    'Rajdhani',
    'HWH',
    'NDLS',
    '16:50',
    '10:00',
    1030,
    { '1A': 4950, '2A': 2955, '3A': 2110 },
  ],
  [
    '12302',
    'Howrah Rajdhani',
    'Rajdhani',
    'NDLS',
    'HWH',
    '16:55',
    '09:55',
    1020,
    { '1A': 4950, '2A': 2955, '3A': 2110 },
  ],
  [
    '12627',
    'Karnataka Express',
    'Superfast',
    'SBC',
    'NDLS',
    '19:20',
    '09:00',
    2260,
    { '2A': 3420, '3A': 2340, SL: 870 },
  ],
  [
    '12628',
    'Karnataka Express',
    'Superfast',
    'NDLS',
    'SBC',
    '20:20',
    '06:40',
    2060,
    { '2A': 3420, '3A': 2340, SL: 870 },
  ],
  ['12007', 'Mysuru Shatabdi', 'Shatabdi', 'MAS', 'SBC', '06:00', '10:55', 295, { EC: 1595, CC: 790 }],
  ['12008', 'Chennai Shatabdi', 'Shatabdi', 'SBC', 'MAS', '16:30', '21:25', 295, { EC: 1595, CC: 790 }],
  [
    '12723',
    'Telangana Express',
    'Superfast',
    'SC',
    'NDLS',
    '06:00',
    '07:40',
    1540,
    { '2A': 2750, '3A': 1900, SL: 715 },
  ],
  ['12015', 'Ajmer Shatabdi', 'Shatabdi', 'NDLS', 'JP', '06:10', '10:40', 270, { EC: 1700, CC: 845 }],
  ['12016', 'Ajmer Shatabdi', 'Shatabdi', 'JP', 'NDLS', '17:50', '22:40', 290, { EC: 1700, CC: 845 }],
  ['12009', 'Ahmedabad Shatabdi', 'Shatabdi', 'BCT', 'ADI', '06:25', '12:45', 380, { EC: 1925, CC: 965 }],
  ['12010', 'Mumbai Shatabdi', 'Shatabdi', 'ADI', 'BCT', '14:40', '21:20', 400, { EC: 1925, CC: 965 }],
  ['12123', 'Deccan Queen', 'Superfast', 'CSMT', 'PUNE', '17:10', '20:25', 195, { CC: 425 }],
  ['12124', 'Deccan Queen', 'Superfast', 'PUNE', 'CSMT', '07:15', '10:25', 190, { CC: 425 }],
  ['12011', 'Kalka Shatabdi', 'Shatabdi', 'NDLS', 'CDG', '07:40', '11:05', 205, { EC: 1545, CC: 760 }],
  ['12013', 'Amritsar Shatabdi', 'Shatabdi', 'NDLS', 'ASR', '16:30', '22:30', 360, { EC: 2040, CC: 1015 }],
  ['22435', 'Vande Bharat Express', 'Vande Bharat', 'NDLS', 'BSB', '06:00', '14:00', 480, { EC: 3355, CC: 1805 }],
  ['22436', 'Vande Bharat Express', 'Vande Bharat', 'BSB', 'NDLS', '15:00', '23:00', 480, { EC: 3355, CC: 1805 }],
  ['12050', 'Gatimaan Express', 'Gatimaan', 'NDLS', 'AGC', '08:10', '09:50', 100, { EC: 1545, CC: 790 }],
  [
    '12235',
    'Guwahati Rajdhani',
    'Rajdhani',
    'NDLS',
    'GHY',
    '16:20',
    '19:05',
    1605,
    { '1A': 6050, '2A': 3550, '3A': 2510 },
  ],
  ['12625', 'Kerala Express', 'Superfast', 'TVC', 'NDLS', '11:15', '13:25', 3010, { '2A': 4150, '3A': 2875, SL: 1080 }],
  [
    '12309',
    'Patna Rajdhani',
    'Rajdhani',
    'PNBE',
    'NDLS',
    '19:10',
    '07:40',
    750,
    { '1A': 3880, '2A': 2315, '3A': 1645 },
  ],
  [
    '12841',
    'Coromandel Express',
    'Superfast',
    'HWH',
    'MAS',
    '15:20',
    '17:00',
    1540,
    { '2A': 2650, '3A': 1820, SL: 690 },
  ],
];

const travellers = ['Priya Nair', 'Rohan Mehta', 'Ishita Banerjee', 'Kabir Singh', 'Ananya Iyer', 'Vikram Rao'];

async function upsertUser(name: string, email: string, password: string, role: 'USER' | 'ADMIN' = 'USER') {
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role RETURNING id`,
    [name, email, hash, role],
  );
  return rows[0].id;
}

async function scheduleId(train: string, date: string) {
  await ensureSchedules(pool, date);
  const { rows } = await pool.query('SELECT id FROM train_schedules WHERE train_number = $1 AND journey_date = $2', [
    train,
    date,
  ]);
  return rows[0].id as number;
}

const pax = (names: string[]) =>
  names.map((name, i) => ({ name, age: 24 + ((i * 13) % 40), gender: (i % 2 ? 'F' : 'M') as 'M' | 'F' }));

export async function seed() {
  for (const s of stations) {
    await pool.query(
      `INSERT INTO stations (code, name, city, state) VALUES ($1, $2, $3, $4)
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, city = EXCLUDED.city, state = EXCLUDED.state`,
      s,
    );
  }
  for (const [num, name, type, src, dst, dep, arr, dur, classes] of trains) {
    await pool.query(`INSERT INTO trains VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`, [
      num,
      name,
      type,
      src,
      dst,
      dep,
      arr,
      dur,
    ]);
    for (const [code, fare] of Object.entries(classes)) {
      await pool.query('INSERT INTO train_classes VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING', [
        num,
        code,
        fare,
        SEATS[code as Cls],
      ]);
    }
  }

  const demoId = await upsertUser(DEMO_USER.name, DEMO_USER.email, DEMO_USER.password);
  if (config.adminPassword) await upsertUser('RailDesk Admin', 'admin@raildesk.dev', config.adminPassword, 'ADMIN');

  const { rows } = await pool.query('SELECT count(*)::int AS n FROM bookings');
  if (rows[0].n > 0) return { bookings: 'kept existing' };

  // Other travellers cannot sign in: their password is a random throwaway.
  const otherIds: number[] = [];
  for (const name of travellers) {
    otherIds.push(await upsertUser(name, `${name.split(' ')[0].toLowerCase()}@example.com`, crypto.randomUUID()));
  }
  const routes = [
    ['12952', '3A'],
    ['12001', 'CC'],
    ['12007', 'CC'],
    ['12015', 'EC'],
    ['12904', 'SL'],
  ] as const;
  const today = todayIST();
  let k = 0;
  for (let day = 1; day <= 7; day++) {
    for (const [train, cls] of routes) {
      await createBooking(otherIds[k % otherIds.length], {
        scheduleId: await scheduleId(train, addDays(today, day)),
        classCode: cls,
        passengers: pax(travellers.slice(k % 4, (k % 4) + 1 + (k % 3))),
      });
      k++;
    }
  }

  await createBooking(demoId, {
    scheduleId: await scheduleId('12952', addDays(today, 5)),
    classCode: '3A',
    passengers: pax(['Aarav Sharma', 'Meera Sharma']),
  });
  await createBooking(demoId, {
    scheduleId: await scheduleId('12007', addDays(today, 12)),
    classCode: 'CC',
    passengers: pax(['Aarav Sharma']),
  });
  const cancelled = await createBooking(demoId, {
    scheduleId: await scheduleId('12015', addDays(today, 8)),
    classCode: 'EC',
    passengers: pax(['Aarav Sharma']),
  });
  await cancelBooking(demoId, cancelled.pnr);
  return { bookings: k + 3 };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  seed()
    .then((r) => console.log('seed complete', r))
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
