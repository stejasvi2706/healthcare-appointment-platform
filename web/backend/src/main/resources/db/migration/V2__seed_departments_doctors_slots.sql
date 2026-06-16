INSERT INTO departments (id, name)
VALUES
    (1, 'Cardiology'),
    (2, 'Dermatology'),
    (3, 'Neurology'),
    (4, 'Orthopedics'),
    (5, 'General Medicine')
ON CONFLICT (id) DO NOTHING;

INSERT INTO doctors (id, department_id, name, specialization)
VALUES
    (1, 1, 'Dr. Asha Mehta', 'Interventional Cardiology'),
    (2, 1, 'Dr. Rajiv Nair', 'Preventive Cardiology'),
    (3, 2, 'Dr. Neha Kapoor', 'Clinical Dermatology'),
    (4, 3, 'Dr. Arjun Rao', 'General Neurology'),
    (5, 4, 'Dr. Kavita Iyer', 'Sports Orthopedics'),
    (6, 5, 'Dr. Sameer Khan', 'Family Medicine')
ON CONFLICT (id) DO NOTHING;

SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments));
SELECT setval('doctors_id_seq', (SELECT MAX(id) FROM doctors));

INSERT INTO appointment_slots (doctor_id, start_datetime, end_datetime)
SELECT
    doctor.id,
    slot_start,
    slot_start + INTERVAL '30 minutes'
FROM doctors doctor
CROSS JOIN generate_series(
    (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '9 hours')::timestamptz,
    (CURRENT_DATE + INTERVAL '14 days' + INTERVAL '16 hours 30 minutes')::timestamptz,
    INTERVAL '30 minutes'
) AS slot_start
WHERE EXTRACT(ISODOW FROM slot_start) BETWEEN 1 AND 5
  AND slot_start::time >= TIME '09:00'
  AND slot_start::time < TIME '17:00'
ON CONFLICT (doctor_id, start_datetime, end_datetime) DO NOTHING;
