import logging
from typing import Any

from appointment_worker.db import ConnectionFactory, transaction
from appointment_worker.models import AppointmentEvent


APPOINTMENT_CREATED = "APPOINTMENT_CREATED"
APPOINTMENT_CANCELLED = "APPOINTMENT_CANCELLED"
STATUS_UPDATED = "STATUS_UPDATED"
NOTIFICATION_PROCESSED = "NOTIFICATION_PROCESSED"

CREATED = "CREATED"
PROCESSING = "PROCESSING"
CONFIRMED = "CONFIRMED"
CANCELLED = "CANCELLED"
FAILED = "FAILED"

TERMINAL_STATUSES = {CONFIRMED, CANCELLED, FAILED}


class AppointmentEventProcessor:
    def __init__(self, connection_factory: ConnectionFactory) -> None:
        self.connection_factory = connection_factory
        self.logger = logging.getLogger(__name__)

    def process(self, event: AppointmentEvent) -> str:
        with self.connection_factory() as connection:
            with transaction(connection):
                if not self._mark_event_processed(connection, event):
                    self.logger.info(
                        "Skipping duplicate event",
                        extra={"correlation_id": event.correlation_id or "none"},
                    )
                    return "duplicate"

                if event.event_type == APPOINTMENT_CREATED:
                    self._advance_created_appointment(connection, event)
                    return "processed"

                if event.event_type == APPOINTMENT_CANCELLED:
                    self.logger.info(
                        "Cancellation event recorded; status was already updated by backend",
                        extra={"correlation_id": event.correlation_id or "none"},
                    )
                    return "processed"

                self.logger.warning(
                    "Unsupported appointment event type: %s",
                    event.event_type,
                    extra={"correlation_id": event.correlation_id or "none"},
                )
                return "ignored"

    def _mark_event_processed(self, connection: Any, event: AppointmentEvent) -> bool:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO processed_events (event_id, event_type, appointment_id)
                VALUES (%s, %s, %s)
                ON CONFLICT (event_id) DO NOTHING
                RETURNING event_id
                """,
                (event.event_id, event.event_type, event.appointment_id),
            )
            return cursor.fetchone() is not None

    def _advance_created_appointment(self, connection: Any, event: AppointmentEvent) -> None:
        current_status = self._lock_appointment(connection, event.appointment_id)

        if current_status in TERMINAL_STATUSES:
            self.logger.info(
                "Appointment already terminal with status %s",
                current_status,
                extra={"correlation_id": event.correlation_id or "none"},
            )
            return

        if current_status == CREATED:
            self._update_status(connection, event, CREATED, PROCESSING)
            current_status = PROCESSING

        if current_status == PROCESSING:
            self._update_status(connection, event, PROCESSING, CONFIRMED)
            self._record_notification_processed(connection, event)

    def _lock_appointment(self, connection: Any, appointment_id: int) -> str:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT status FROM appointments WHERE id = %s FOR UPDATE",
                (appointment_id,),
            )
            row = cursor.fetchone()

        if row is None:
            raise ValueError(f"Appointment {appointment_id} was not found")

        return row[0]

    def _update_status(
        self,
        connection: Any,
        event: AppointmentEvent,
        old_status: str,
        new_status: str,
    ) -> None:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE appointments
                SET status = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                """,
                (new_status, event.appointment_id),
            )
            cursor.execute(
                """
                INSERT INTO appointment_event_logs (
                    appointment_id,
                    event_type,
                    event_id,
                    correlation_id,
                    old_status,
                    new_status,
                    message
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    event.appointment_id,
                    STATUS_UPDATED,
                    event.event_id,
                    event.correlation_id,
                    old_status,
                    new_status,
                    f"Worker updated appointment status from {old_status} to {new_status}",
                ),
            )
        self.logger.info(
            "Updated appointment %s from %s to %s",
            event.appointment_id,
            old_status,
            new_status,
            extra={"correlation_id": event.correlation_id or "none"},
        )

    def _record_notification_processed(
        self,
        connection: Any,
        event: AppointmentEvent,
    ) -> None:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO appointment_event_logs (
                    appointment_id,
                    event_type,
                    event_id,
                    correlation_id,
                    old_status,
                    new_status,
                    message
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    event.appointment_id,
                    NOTIFICATION_PROCESSED,
                    event.event_id,
                    event.correlation_id,
                    CONFIRMED,
                    CONFIRMED,
                    "Worker processed appointment notification for the confirmed booking",
                ),
            )
        self.logger.info(
            "Processed notification for appointment %s",
            event.appointment_id,
            extra={"correlation_id": event.correlation_id or "none"},
        )
