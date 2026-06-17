from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Settings:
    database_url: str
    kafka_bootstrap_servers: str
    appointment_events_topic: str
    kafka_consumer_group: str

    @classmethod
    def from_environment(cls) -> "Settings":
        return cls(
            database_url=os.getenv(
                "DB_URL",
                "postgresql://healthcare:healthcare@localhost:5432/healthcare_appointments",
            ),
            kafka_bootstrap_servers=os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092"),
            appointment_events_topic=os.getenv("APPOINTMENT_EVENTS_TOPIC", "appointment.events"),
            kafka_consumer_group=os.getenv("KAFKA_CONSUMER_GROUP", "appointment-worker"),
        )
