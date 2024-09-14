# AsyncRunner v2.0.0

AsyncRunner is a Node.js utility for managing and executing asynchronous tasks with controlled concurrency. Version 2.0.0 introduces modern JavaScript features (`async/await`), task hashing, task naming, and enhanced event handling.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic Usage](#basic-usage)
  - [Adding Tasks](#adding-tasks)
  - [Event Handling](#event-handling)
- [Concurrency Control](#concurrency-control)
- [Task Execution Order](#task-execution-order)
- [API Reference](#api-reference)
  - [Constructor](#constructor)
  - [add(task)](#addtask)
  - [run()](#run)
  - [Events](#events)
- [Examples](#examples)
  - [Simple Example](#simple-example)
  - [Using Task Names and Hashes](#using-task-names-and-hashes)
- [Version History](#version-history)
- [License](#license)

---

## Features

- **Asynchronous Task Management**: Manage a queue of asynchronous tasks using `async/await`.
- **Controlled Concurrency**: Limit the number of tasks running concurrently.
- **Task Hashing**: Automatically assign a unique hash to each task based on its function code.
- **Task Naming**: Assign names to tasks for better identification.
- **Event Emission**: Emit events (`'next'`, `'done'`, `'error'`) to track task execution.
- **Result Collection**: Collect results and errors, maintaining the order of tasks added.
- **Error Handling**: Optionally stop execution upon encountering an error.

## Installation

You can install AsyncRunner via npm:

```bash
npm install async-runner
```

Or add the `async-runner.js` file to your project.

## Usage

### Basic Usage

```javascript
const AsyncRunner = require('async-runner');

const runner = new AsyncRunner({ maxThreads: 5, stopOnError: false });

runner.add([
  async function () {
    // Your async code here
  },
  // ... more tasks
]);

runner.run().then((results) => {
  console.log('Results:', results);
});
```

### Adding Tasks

Tasks can be added as functions or as objects with a `task` function and an optional `name`:

```javascript
// Adding a single task function
runner.add(async function () {
  // Task code
});

// Adding tasks with names
runner.add([
  {
    task: async function () {
      // Task code
    },
    name: 'Task One',
  },
  {
    task: async function () {
      // Task code
    },
    name: 'Task Two',
  },
]);
```

### Event Handling

You can listen to various events emitted by the runner:

```javascript
runner.on('next', (taskFunction, taskHash, taskName) => {
  console.log(`Starting task: ${taskName || 'Unnamed Task'}`);
  console.log(`Task Hash: ${taskHash}`);
});

runner.on('done', (results, errors) => {
  console.log('All tasks completed.');
  console.log('Results:', results);
  if (errors && errors.length > 0) {
    console.log('Errors:', errors);
  }
});

runner.on('error', (err) => {
  console.error('Execution halted due to error:', err);
});
```

## Concurrency Control

The `maxThreads` option controls the maximum number of tasks that can run concurrently. Adjust it according to your needs:

```javascript
const runner = new AsyncRunner({ maxThreads: 3 });
```

- **Note**: Setting `maxThreads` to `1` will execute tasks sequentially.

## Task Execution Order

- **Task Start Order**: Tasks are started in the order they are added.
- **Task Completion Order**: Tasks may complete out of order due to their asynchronous nature.
- **Result Storage Order**: Results are stored in the order of tasks added, regardless of completion order.

## API Reference

### Constructor

```javascript
new AsyncRunner(options)
```

- **options**: An object with the following properties:
  - `maxThreads` (number, default `10`): Maximum number of concurrent tasks.
  - `stopOnError` (boolean, default `false`): Stop execution upon encountering an error.

### add(task)

Add tasks to the runner.

- **task**: A function, an array of functions, an object, or an array of objects. Each object can have:
  - `task` (function): The task function to execute.
  - `name` (string, optional): A name for the task.

**Example:**

```javascript
runner.add(async function () {
  // Task code
});

runner.add([
  {
    task: async function () {
      // Task code
    },
    name: 'Task Name',
  },
]);
```

### run()

Execute the tasks.

- Returns a `Promise` that resolves with the results array or rejects with an error if `stopOnError` is `true`.

**Example:**

```javascript
runner.run().then((results) => {
  // Handle results
}).catch((error) => {
  // Handle error
});
```

### Events

- **'next'**: Emitted before a task starts execution.
  - **Listener Parameters**:
    - `taskFunction` (function): The task function.
    - `taskHash` (string): Unique hash of the task.
    - `taskName` (string or null): Name of the task.

- **'done'**: Emitted when all tasks have completed.
  - **Listener Parameters**:
    - `results` (array): Array of results from tasks.
    - `errors` (array): Array of errors (if any).

- **'error'**: Emitted when an error occurs and `stopOnError` is `true`.
  - **Listener Parameters**:
    - `error` (Error): The error that occurred.

**Example:**

```javascript
runner.on('next', (taskFunction, taskHash, taskName) => {
  // Handle event
});

runner.on('done', (results, errors) => {
  // Handle completion
});

runner.on('error', (err) => {
  // Handle error
});
```

## Examples

### Simple Example

```javascript
const AsyncRunner = require('async-runner');

const runner = new AsyncRunner({ maxThreads: 2, stopOnError: false });

runner.add([
  async function () {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return 'Result 1';
  },
  async function () {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return 'Result 2';
  },
]);

runner.run().then((results) => {
  console.log('Results:', results);
});
```

### Using Task Names and Hashes

```javascript
const AsyncRunner = require('async-runner');

const runner = new AsyncRunner({ maxThreads: 2, stopOnError: false });

runner.add([
  {
    task: async function () {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return 'Result 1';
    },
    name: 'Fetch Data',
  },
  {
    task: async function () {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return 'Result 2';
    },
    name: 'Process Data',
  },
]);

runner.on('next', (taskFunction, taskHash, taskName) => {
  console.log(`Starting task: ${taskName}`);
  console.log(`Task Hash: ${taskHash}`);
});

runner.on('done', (results, errors) => {
  console.log('All tasks completed.');
  console.log('Results:', results);
});

runner.run();
```

## Version History

- **v2.0.0**
  - Rewritten using `async/await` for modern Node.js support.
  - Tasks are assigned unique hashes based on their function code.
  - Tasks can be given names for identification.
  - Added `'next'` event emitted before each task execution.

## License

This project is licensed under the MIT License.

---

Enjoy using AsyncRunner v2.0.0! If you have any questions or need assistance, feel free to reach out.
