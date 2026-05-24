-- ============================================================================
-- One-shot cleanup: removes the demo data that earlier versions of
-- DataInitializer seeded (John Doe, Jane Smith, Mike Johnson, Emily Davis,
-- Chris Wilson, the demo admin/student users, and the 15 sample rooms).
--
-- Safe to run multiple times. Uses email/roll-number/room-number markers to
-- avoid touching real data you have entered.
--
-- HOW TO RUN
--   mysql -u root -p hostel_db < V1__remove_demo_data.sql
-- or paste into MySQL Workbench against the hostel_db schema.
--
-- After running, restart the backend. The new DataInitializer will create a
-- fresh bootstrap admin (admin@hostel.local / ChangeMe@123) which you should
-- log in with and then change the password immediately.
-- ============================================================================

-- Delete child rows first to respect foreign keys (if present).
DELETE f FROM fees f
  JOIN students s ON f.student_id = s.id
 WHERE s.email IN (
    'john.doe@student.hostel.com',
    'jane.smith@student.hostel.com',
    'mike.johnson@student.hostel.com',
    'emily.davis@student.hostel.com',
    'chris.wilson@student.hostel.com'
 );

DELETE a FROM attendance a
  JOIN students s ON a.student_id = s.id
 WHERE s.email IN (
    'john.doe@student.hostel.com',
    'jane.smith@student.hostel.com',
    'mike.johnson@student.hostel.com',
    'emily.davis@student.hostel.com',
    'chris.wilson@student.hostel.com'
 );

DELETE c FROM complaints c
  JOIN students s ON c.student_id = s.id
 WHERE s.email IN (
    'john.doe@student.hostel.com',
    'jane.smith@student.hostel.com',
    'mike.johnson@student.hostel.com',
    'emily.davis@student.hostel.com',
    'chris.wilson@student.hostel.com'
 );

-- Demo students (matched by their seeded email pattern).
DELETE FROM students
 WHERE email IN (
    'john.doe@student.hostel.com',
    'jane.smith@student.hostel.com',
    'mike.johnson@student.hostel.com',
    'emily.davis@student.hostel.com',
    'chris.wilson@student.hostel.com'
 );

-- Demo users (admin@hostel.com and student@hostel.com).
DELETE FROM users
 WHERE email IN ('admin@hostel.com', 'student@hostel.com');

-- Demo rooms (block A, floors 1..3, room numbers 101-105, 201-205, 301-305)
-- — only delete rooms that are still vacant so we never drop a room that
-- you have since assigned a real student to.
DELETE FROM rooms
 WHERE block = 'A'
   AND room_number IN (
       '101','102','103','104','105',
       '201','202','203','204','205',
       '301','302','303','304','305'
   )
   AND occupied = 0;

-- Sanity check: how many demo rows remain (should all be 0).
SELECT 'students_remaining' AS metric, COUNT(*) AS value FROM students
 WHERE email LIKE '%@student.hostel.com'
UNION ALL
SELECT 'demo_users_remaining', COUNT(*) FROM users
 WHERE email IN ('admin@hostel.com', 'student@hostel.com')
UNION ALL
SELECT 'demo_rooms_remaining', COUNT(*) FROM rooms
 WHERE block = 'A'
   AND room_number IN (
       '101','102','103','104','105',
       '201','202','203','204','205',
       '301','302','303','304','305'
   )
   AND occupied = 0;
