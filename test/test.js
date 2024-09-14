const AsyncRunner = require('../lib/async-runner');

// Create an instance with custom options
const runner = new AsyncRunner({ maxThreads: 1, stopOnError: false });

// Define asynchronous tasks with names
const tasks = [
    {
        task: async function () {
            // Simulate async operation
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return 'Result 1';
        },
        name: 'Task One',
    },
    {
        task: async function () {
            // Simulate async operation with error
            await new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Error in Task 2')), 500)
            );
        },
        name: 'Task Two',
    },
    async function () {
        // Simulate async operation
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return 'Result 3';
    },
];

// Add tasks to the runner
runner.add(tasks);

// Handle 'next' event
runner.on('next', (taskFunction, taskHash, taskName) => {
    console.log(`Starting task: ${taskName || 'Unnamed Task'}`);
    console.log(`Task Hash: ${taskHash}`);
});

// Handle 'done' event
runner.on('done', (results, errors) => {
    console.log('All tasks completed.');
    console.log('Results:', results);
    if (errors && errors.length > 0) {
        console.log('Errors:', errors);
    }
});

// Handle 'error' event
runner.on('error', (err) => {
    console.error('Task execution halted due to error:', err);
});

// Run tasks
runner
    .run()
    .then((results) => {
        console.log('Execution completed successfully:', results);
    })
    .catch((err) => {
        console.error('Execution stopped with error:', err);
    });
