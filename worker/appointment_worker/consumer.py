import json
import logging

from appointment_worker.config import Settings
from appointment_worker.models import AppointmentEvent
from appointment_worker.processor import AppointmentEventProcessor


class AppointmentEventConsumer:
    def __init__(self, settings: Settings, processor: AppointmentEventProcessor) -> None:
        self.settings = settings
        self.processor = processor
        self.logger = logging.getLogger(__name__)

    def run(self) -> None:
        from confluent_kafka import Consumer, KafkaException

        consumer = Consumer(
            {
                "bootstrap.servers": self.settings.kafka_bootstrap_servers,
                "group.id": self.settings.kafka_consumer_group,
                "auto.offset.reset": "earliest",
                "enable.auto.commit": False,
            }
        )
        consumer.subscribe([self.settings.appointment_events_topic])

        self.logger.info(
            "Worker subscribed to %s",
            self.settings.appointment_events_topic,
            extra={"correlation_id": "none"},
        )

        try:
            while True:
                message = consumer.poll(1.0)
                if message is None:
                    continue
                if message.error():
                    raise KafkaException(message.error())

                payload = json.loads(message.value().decode("utf-8"))
                event = AppointmentEvent.from_dict(payload)
                self.processor.process(event)
                consumer.commit(message=message)
        finally:
            consumer.close()
