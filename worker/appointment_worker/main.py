from appointment_worker.config import Settings
from appointment_worker.consumer import AppointmentEventConsumer
from appointment_worker.db import create_connection_factory
from appointment_worker.logging import configure_logging
from appointment_worker.processor import AppointmentEventProcessor


def main() -> None:
    configure_logging()
    settings = Settings.from_environment()
    connection_factory = create_connection_factory(settings.database_url)
    processor = AppointmentEventProcessor(connection_factory)
    consumer = AppointmentEventConsumer(settings, processor)
    consumer.run()


if __name__ == "__main__":
    main()
