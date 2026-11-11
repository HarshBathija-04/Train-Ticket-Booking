import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/overview', async (_req, res) => {
  const stats = await pool.query(`
    SELECT count(*) FILTER (WHERE booking_status = 'CONFIRMED')::int AS "confirmedBookings",
           count(*) FILTER (WHERE booking_status = 'CANCELLED')::int AS "cancelledBookings",
           COALESCE(sum(total_fare) FILTER (WHERE booking_status = 'CONFIRMED'), 0)::float AS revenue,
           COALESCE(sum(no_of_seats) FILTER (WHERE booking_status = 'CONFIRMED'), 0)::int AS "seatsSold",
           (SELECT count(*)::int FROM users) AS users
    FROM bookings`);
  const recent = await pool.query(`
    SELECT b.pnr, b.booking_status AS "bookingStatus", b.total_fare AS "totalFare", b.no_of_seats AS "noOfSeats",
           b.booking_date AS "bookingDate", u.name AS "userName", u.email AS "userEmail",
           t.train_number AS "trainNumber", t.train_name AS "trainName", sc.class_code AS "classCode",
           s.journey_date AS "journeyDate", t.source AS "from", t.destination AS "to"
    FROM bookings b
    JOIN users u ON u.id = b.user_id
    JOIN schedule_classes sc ON sc.id = b.schedule_class_id
    JOIN train_schedules s ON s.id = sc.schedule_id
    JOIN trains t ON t.train_number = s.train_number
    ORDER BY b.booking_date DESC LIMIT 50`);
  res.json({ stats: stats.rows[0], recent: recent.rows });
});
