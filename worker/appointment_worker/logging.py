import logging


class CorrelationIdFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        if not hasattr(record, "correlation_id"):
            record.correlation_id = "none"
        return True


def configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s [correlationId:%(correlation_id)s] %(name)s - %(message)s",
    )
    logging.getLogger().addFilter(CorrelationIdFilter())
