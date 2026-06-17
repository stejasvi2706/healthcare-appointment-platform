from datetime import datetime, timezone
import unittest
from uuid import UUID

from appointment_worker.models import AppointmentEvent
from appointment_worker.processor import AppointmentEventProcessor


EVENT_ID = UUID("11111111-1111-1111-1111-111111111111")


class FakeCursor:
    def __init__(self, connection):
        self.connection = connection
        self.next_result = None

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return False

    def execute(self, sql, params):
        normalized_sql = " ".join(sql.split())
        self.connection.executed.append((normalized_sql, params))

        if normalized_sql.startswith("INSERT INTO processed_events"):
            if self.connection.event_already_processed:
                self.next_result = None
            else:
                self.connection.processed_events.append(params)
                self.next_result = (params[0],)
            return

        if normalized_sql.startswith("SELECT status FROM appointments"):
            status = self.connection.appointments.get(params[0])
            self.next_result = None if status is None else (status,)
            return

        if normalized_sql.startswith("UPDATE appointments"):
            new_status, appointment_id = params
            self.connection.appointments[appointment_id] = new_status
            return

        if normalized_sql.startswith("INSERT INTO appointment_event_logs"):
            self.connection.event_logs.append(params)

    def fetchone(self):
        return self.next_result


class FakeTransaction:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return False


class FakeConnection:
    def __init__(self, status="CREATED", event_already_processed=False):
        self.appointments = {123: status}
        self.event_already_processed = event_already_processed
        self.processed_events = []
        self.event_logs = []
        self.executed = []

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return False

    def cursor(self):
        return FakeCursor(self)

    def transaction(self):
        return FakeTransaction()


def created_event():
    return AppointmentEvent(
        event_id=EVENT_ID,
        correlation_id="correlation-123",
        appointment_id=123,
        user_id=456,
        event_type="APPOINTMENT_CREATED",
        timestamp=datetime.now(timezone.utc),
    )


class AppointmentEventProcessorTest(unittest.TestCase):
    def test_created_event_marks_processed_and_confirms_appointment(self):
        connection = FakeConnection()
        processor = AppointmentEventProcessor(lambda: connection)

        result = processor.process(created_event())

        self.assertEqual("processed", result)
        self.assertEqual("CONFIRMED", connection.appointments[123])
        self.assertEqual([(EVENT_ID, "APPOINTMENT_CREATED", 123)], connection.processed_events)
        self.assertEqual(2, len(connection.event_logs))
        self.assertEqual("PROCESSING", connection.event_logs[0][5])
        self.assertEqual("CONFIRMED", connection.event_logs[1][5])
        self.assertEqual("correlation-123", connection.event_logs[0][3])

    def test_duplicate_event_skips_side_effects(self):
        connection = FakeConnection(event_already_processed=True)
        processor = AppointmentEventProcessor(lambda: connection)

        result = processor.process(created_event())

        self.assertEqual("duplicate", result)
        self.assertEqual("CREATED", connection.appointments[123])
        self.assertEqual([], connection.processed_events)
        self.assertEqual([], connection.event_logs)

    def test_event_parser_accepts_backend_payload_shape(self):
        event = AppointmentEvent.from_dict(
            {
                "eventId": "11111111-1111-1111-1111-111111111111",
                "correlationId": "correlation-123",
                "appointmentId": 123,
                "userId": 456,
                "eventType": "APPOINTMENT_CREATED",
                "timestamp": "2026-06-17T04:29:29Z",
            }
        )

        self.assertEqual(EVENT_ID, event.event_id)
        self.assertEqual("correlation-123", event.correlation_id)
        self.assertEqual(123, event.appointment_id)
        self.assertEqual(456, event.user_id)
        self.assertEqual("APPOINTMENT_CREATED", event.event_type)

    def test_event_parser_accepts_numeric_epoch_timestamp_from_kafka(self):
        event = AppointmentEvent.from_dict(
            {
                "eventId": "11111111-1111-1111-1111-111111111111",
                "correlationId": "correlation-123",
                "appointmentId": 123,
                "userId": 456,
                "eventType": "APPOINTMENT_CREATED",
                "timestamp": 1781675632.8853087,
            }
        )

        self.assertEqual(2026, event.timestamp.year)
        self.assertEqual(timezone.utc, event.timestamp.tzinfo)


if __name__ == "__main__":
    unittest.main()
