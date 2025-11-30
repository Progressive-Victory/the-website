# `seed-mongo`

A command-line tool for seeding a local MongoDB database with test data. It can populate permissions, roles, users, and user document update history using `mongo-seeding`, `faker`, and `cmd-ts`.

## Usage

Run via your package script:

```sh
pnpm run seed-db -- [options]
```

At least one of `--roles`, `--users`, or `--all` must be provided.

## Options

| Option            | Short | Type   | Default     | Description                                        |
| ----------------- | ----- | ------ | ----------- | -------------------------------------------------- |
| `--host`          | `-u`  | string | `127.0.0.1` | MongoDB host                                       |
| `--port`          | `-p`  | number | `27017`     | MongoDB port                                       |
| `--database-name` | —     | string | `test`      | Database name                                      |
| `--drop-database` | —     | flag   | `false`     | Drop the database before seeding                   |
| `--roles`         | `-r`  | flag   | `false`     | Seed permissions and roles                         |
| `--users`         | `-u`  | flag   | `false`     | Seed users and update history                      |
| `--all`           | `-a`  | flag   | `false`     | Seed roles, permissions, users, and update history |

## Examples

Seed only roles:

```sh
pnpm run seed-db -- --roles
```

Seed only users:

```sh
pnpm run seed-db -- --users
```

Seed everything:

```sh
pnpm run seed-db -- --all
```

Drop the database first:

```sh
pnpm run seed-db -- --all --drop-database
```

Use a custom MongoDB instance:

```sh
pnpm run seed-db -- --all --host my.server --port 28015 --database-name mydb
```

## What Gets Seeded

### Roles and Permissions

The script defines four permissions (`state_ping`, `ban_user`, `read`, `coding_buddies`) and several roles with predefined permission sets.

### Users

The script generates ten users with randomized names, emails, state, ZIP code, city, phone, onboarding stage, and up to three random roles.

### Document Update History

Each user receives zero to two synthetic update-history entries for the `firstName` field.
