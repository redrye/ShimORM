
# ShimORM

ShimORM is a TypeScript project built with Vite for building ORM-style data access and related utilities. It is structured around a modular source layout with support for database connections, configuration, events, macros, and shared helpers.

## Features

- TypeScript 5.9
- Vite-powered development and build workflow
- ES module package
- Alias-based imports using `@`
- Modular source structure
- IndexedDB-oriented connection layer
- Model lifecycle event support
- Utility helpers for strings and shared behavior

## Project Structure

## Prerequisites

- Node.js
- npm

## Installation

## Prerequisites

- Node.js
- npm

## Installation

## Development

Start the development server:

## Build

Compile the project and create a production build:

## Preview

Preview the production build locally:

## Preview

Preview the production build locally:

## Import Alias

The project uses `@` as an alias for the `src` directory.

Example:

## Public API

The package entry point exports library modules such as:

- `Connection`
- `User`

## Database Layer

The database layer is built around table definitions and connection-related logic. A table definition may include:

- table name
- key path
- auto-increment behavior
- indexes

This suggests the project is intended to work with structured storage and ORM-like abstractions.

## Model Events

The project defines lifecycle-style model events including:

- booting
- booted
- creating
- created
- updating
- updated
- deleting
- deleted
- forceDeleting
- forceDeleted
- restoring
- restored
- fetching
- fetched

## Utility Helpers

The project includes string helper functionality such as:

- `afterLast(subject, search)`

This helper returns the portion of a string after the last occurrence of the given search value.

## TypeScript Configuration

The project is configured for:

- ES2023 target
- DOM support
- strictness relaxed for development flexibility
- bundler-style module resolution
- no emitted output from TypeScript, since Vite handles bundling

## Dependencies

### Runtime

- `@traits-ts/core`

### Development

- `typescript`
- `vite`
- `bootstrap`
- `jquery`
- `@types/node`

## Notes

- This repository is currently a foundation for a larger ORM or data-access library.
- Expand this README as models, database adapters, and APIs become more complete.

## License

Add your chosen license here.


## Public API

The package entry point exports library modules such as:

- `Connection`
- `User`

## Database Layer

The database layer is built around table definitions and connection-related logic. A table definition may include:

- table name
- key path
- auto-increment behavior
- indexes

This suggests the project is intended to work with structured storage and ORM-like abstractions.

## Model Events

The project defines lifecycle-style model events including:

- booting
- booted
- creating
- created
- updating
- updated
- deleting
- deleted
- forceDeleting
- forceDeleted
- restoring
- restored
- fetching
- fetched

## Utility Helpers

The project includes string helper functionality such as:

- `afterLast(subject, search)`

This helper returns the portion of a string after the last occurrence of the given search value.

## TypeScript Configuration

The project is configured for:

- ES2023 target
- DOM support
- strictness relaxed for development flexibility
- bundler-style module resolution
- no emitted output from TypeScript, since Vite handles bundling

## Dependencies

### Runtime

- `@traits-ts/core`

### Development

- `typescript`
- `vite`
- `bootstrap`
- `jquery`
- `@types/node`

## Notes

- This repository is currently a foundation for a larger ORM or data-access library.
- Expand this README as models, database adapters, and APIs become more complete.

## License

Add your chosen license here.