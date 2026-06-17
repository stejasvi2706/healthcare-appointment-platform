from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any
from uuid import UUID


@dataclass(frozen=True)
class AppointmentEvent:
    event_id: UUID
    correlation_id: str | None
    appointment_id: int
    user_id: int
    event_type: str
    timestamp: datetime

    @classmethod
    def from_dict(cls, payload: dict[str, Any]) -> "AppointmentEvent":
        return cls(
            event_id=UUID(str(payload["eventId"])),
            correlation_id=payload.get("correlationId"),
            appointment_id=int(payload["appointmentId"]),
            user_id=int(payload["userId"]),
            event_type=str(payload["eventType"]),
            timestamp=parse_timestamp(payload["timestamp"]),
        )


def parse_timestamp(value: Any) -> datetime:
    if isinstance(value, int | float):
        return datetime.fromtimestamp(value, tz=timezone.utc)

    return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
