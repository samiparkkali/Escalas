"""Administrative commands.

python -m app.cli init-db
python -m app.cli create-user USERNAME            # prompts for the password
python -m app.cli create-user USERNAME --password-stdin
"""

import argparse
import getpass
import sys

from .config import load_settings
from .db import create_tables, make_engine, make_sessionmaker
from .repositories import UserRepository
from .security import hash_password


def _read_password(from_stdin: bool) -> str:
    if from_stdin:
        return sys.stdin.readline().rstrip("\n")
    first = getpass.getpass("Password: ")
    if first != getpass.getpass("Repeat password: "):
        raise ValueError("Passwords do not match.")
    return first


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(prog="python -m app.cli")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("init-db", help="create the database tables")
    create = sub.add_parser("create-user", help="create a login")
    create.add_argument("username")
    create.add_argument("--password-stdin", action="store_true", help="read the password from stdin")
    args = parser.parse_args(argv)

    engine = make_engine(load_settings().database_url)
    create_tables(engine)
    if args.command == "init-db":
        print("Tables are ready.")
        return 0

    username = args.username.strip()
    if not username or len(username) > 64:
        print("Username must be 1 to 64 characters.", file=sys.stderr)
        return 1
    try:
        password_hash = hash_password(_read_password(args.password_stdin))
    except ValueError as error:
        print(error, file=sys.stderr)
        return 1

    with make_sessionmaker(engine)() as db:
        users = UserRepository(db)
        if users.get_by_username(username):
            print(f"User '{username}' already exists.", file=sys.stderr)
            return 1
        users.create(username, password_hash)
    print(f"User '{username}' created.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
