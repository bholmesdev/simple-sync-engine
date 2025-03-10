# Simple Sync Engine

This is a simple, not-so-production-ready implementation of a sync engine. We use SQLite on the client and server, and use a simplified version of [Replicache's "push" and "pull" model](https://doc.replicache.dev/concepts/how-it-works#sync-details) to sync changes.

## Purpose

This project is a teaching tool, _not_ the bedrock of your next side hustle. I hope it becomes your springboard to implement a robust sync engine of your own!

## Run the project

Ensure you have [Node.js v20 or later](https://nodejs.org) installed on your machine, along with [pnpm](https://pnpm.io) for package management.

Then, install dependencies and start the development server:

```sh
pnpm install
pnpm dev
```

## Project Structure

These are the primary files that drive the sync engine:

```text
/
├── src/
│   ├── lib/ # Utilities to query the server and client databases
│   ├── pages/
│   │   ├── api/
│   │   │   ├── push.ts # Push mutations to the server
│   │   │   └── pull.ts # Pull updates from the server
│   ├── App.tsx # The client-side app
│   ├── migrations.ts # Migrations to initialize the database
│   └── queries.ts # Queries to read and write data on the server and client
```

## How it works

This project uses a simplified version of [Replicache's "push" and "pull" model](https://doc.replicache.dev/concepts/how-it-works#sync-details) to sync changes.

### Queries

The `queries.ts` file contains all of the queries and mutations that the client can perform. When a mutation is performed, the client will send the name of the mutation along with its arguments to the server.

### Push

`push` is triggered by the client when the user performs runs a mutation (say, `createIssue()`). The client sends the name and arguments of the mutation to the server, which then executes the mutation against its own database. The server will also add a `mutation_log` entry to store a running history of mutations that have been performed.

### Pull

`pull` is run periodically by the client to sync changes from the server. The client will send a pull request to the server, which will return a list of mutations that have been performed since the client last pulled. The client will then execute these mutations against its own database.

To track which mutations have been performed, the server maintains a `mutation_log` table and a `lastLogId` cookie attached to each request. The server will check for any new logs since the `lastLogId`, return them to the client, and update the `lastLogId` to the end of the log.

### Apply pull responses to the client database

The client will receive two important pieces of information when it performs a "pull":

1. `mutations`: A list of mutations to apply to the client database
2. `flushCount`: The number of mutations sent by the client that the server has "acknowledged" since the last pull

To apply these changes, the client will perform a "rebase" of its local state on top of the latest server state. The client tracks two separate databases to perform this safely: a base `db` modeled against the server state, and an `optimisticDb` where all client mutations are applied.

When the client receives a "pull" response, it will:

1. Update the base `db` with the list of `mutations` from the server
2. Flush acknowledged mutations from the client's running log of mutations
3. Overwrite the `optimisticDb` with the updated `db`
4. Replay any mutations that were _not_ acknowledged by the server (aka the remaining mutations from step 2) on top of the `optimisticDb`

[See `lib/client.ts` for the full implementation.](https://github.com/bholmesdev/simple-sync-engine/blob/main/src/lib/client.ts)

## Assumptions

To make this project simple, we made _a lot_ of assumptions. You'll definitely need to address these before using this in production!

- **All data is accessible to the user,** once you implement an authentication system. Organization-level and row-level permissions are another can of worms that frameworks like [Zero](https://zero.rocicorp.dev/docs/introduction) can help you solve.

- **The user is online** for the duration of the session. `push` is called whenever the client makes a change, and we _don't_ implement any retry logic if it fails. You'll likely want a queue backed up by your SQLite database to ensure the client can retry after a network error.

- **Breaking database migrations will cause data loss.** We don't handle database migrations in this project, and suggest using the `DB_RESET` environment variable to force reset your database. To handle database changes properly, we suggest using the expand and contract model with a "versioning" system for your database schema. [Zero](https://zero.rocicorp.dev/docs/migrations) provides a robust implementation of this.

## Deploy to production

This project can be deployed as a standalone server. We use [Astro with the Node.js adapter](https://docs.astro.build/en/deploy/node/), though you can use Astro's adapter system to deploy to other runtimes like [Deno](https://docs.astro.build/en/guides/deploy/deno/) or [Bun](https://docs.astro.build/en/recipes/bun/).

Run a production build with `pnpm build` and start the production server with `pnpm start`. You can also use `pnpm preview` to run the production server locally.

### Data storage with SQLite

Be sure to update your `.env.prod` file with a path to wherever you would like your SQLite database to be stored. The example `.env.prod` file assumes you will use `/data/database.sqlite3` as the database path.

### Example: Deploy to Railway

Here is a step-by-step guide to deploy to Railway:

1. Clone this project to a new GitHub repository
2. [Create a new Railway project](https://docs.railway.com/quick-start) from this repository using the default settings (`pnpm build` to build and `pnpm start` to run)
3. From the project dashboard, hit `cmd + k` and search for "Services -> Volumes"
4. Create a new volume and use the path `/data/`
