# ShimORM

ShimORM is a lightweight, TypeScript-based Object-Relational Mapping (ORM) library designed for browser-based
applications. It provides an elegant ActiveRecord-style interface for working with IndexedDB, bringing Laravel-inspired
model patterns and lifecycle events to client-side data persistence.

## What is ShimORM?

ShimORM abstracts the complexity of IndexedDB operations behind an intuitive model-based API. Instead of writing verbose
IndexedDB transactions, you define models that automatically handle CRUD operations, relationships, and data validation.

## What is it used for?

- **Progressive Web Apps (PWAs)**: Store and manage offline data with a familiar ORM pattern
- **Client-side data management**: Build complex browser applications with structured local storage
- **Offline-first applications**: Persist user data locally with automatic synchronization capabilities
- **Browser-based tools**: Create rich client-side applications without backend dependencies

## How to Use It

### Installation

Install ShimORM using npm:

```bash
npm install shimorm
```

### Basic Usage

#### Defining Models

Create a model by extending the `Model` class:

```typescript
import {Model} from 'shimorm';

class User extends Model {
    constructor() {
        super();
    }
}

export default User;
```

#### CRUD Operations

**Create a new record:**

```typescript
const user = new User();
user.name = 'John Doe';
user.email = 'john@example.com';
await user.save();
```

**Find records:**

```typescript
// Find by ID
const user = await User.find(1);

// Find all records
const users = await User.all();

// Find with conditions
const activeUsers = await User.where('active', true).get();
```

**Update a record:**

```typescript
const user = await User.find(1);
user.name = 'Jane Doe';
await user.save();
```

**Delete a record:**

```typescript
const user = await User.find(1);
await user.delete();
```
