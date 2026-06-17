from collections.abc import Callable
from contextlib import contextmanager
from typing import Any


ConnectionFactory = Callable[[], Any]


def create_connection_factory(database_url: str) -> ConnectionFactory:
    import psycopg

    def connect() -> Any:
        return psycopg.connect(database_url)

    return connect


@contextmanager
def transaction(connection: Any):
    transaction_manager = getattr(connection, "transaction", None)
    if callable(transaction_manager):
        with connection.transaction():
            yield connection
    else:
        yield connection
