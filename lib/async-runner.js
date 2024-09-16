const EventEmitter = require('events');
const crypto = require('crypto');

class AsyncRunner extends EventEmitter {
    constructor(opts = {}) {
        super();
        this.tasks = [];
        this.results = [];
        this.errors = [];
        this.running = 0;
        this.index = 0;
        this.completed = 0;
        this.options = {
            maxThreads: opts.maxThreads || 10,
            stopOnError: opts.stopOnError || false,
        };
    }

    add(task) {
        if (Array.isArray(task)) {
            task.forEach((t) => this._addTask(t));
        } else {
            this._addTask(task);
        }
    }

    _addTask(task) {
        let taskFunction;
        let taskName = null;

        if (typeof task === 'function') {
            taskFunction = task;
        } else if (typeof task === 'object' && typeof task.task === 'function') {
            taskFunction = task.task;
            taskName = task.name || null;
        } else {
            throw new Error('Invalid task format. Task must be a function or an object with a task function.');
        }

        const taskString = taskFunction.toString();
        const taskHash = crypto.createHash('sha256').update(taskString).digest('hex');

        this.tasks.push({
            taskFunction,
            taskHash,
            taskName,
        });
    }

    async run() {
        return new Promise((resolve, reject) => {
            const totalTasks = this.tasks.length;
            if (totalTasks === 0) {
                this.emit('done', this.results);
                return resolve(this.results);
            }

            const runNext = () => {
                while (
                    this.running < this.options.maxThreads &&
                    this.index < totalTasks
                ) {
                    const currentIndex = this.index++;
                    const { taskFunction, taskHash, taskName } = this.tasks[currentIndex];
                    this.running++;

                    // Emit 'next' event before executing the task
                    this.emit('next', taskFunction, taskHash, taskName);

                    (async () => {
                        try {
                            const result = await taskFunction();
                            this.results[currentIndex] = result;
                        } catch (error) {
                            this.errors[currentIndex] = error;
                            if (this.options.stopOnError) {
                                this.emit('error', error);
                                return reject(error);
                            }
                        } finally {
                            this.running--;
                            this.completed++;
                            if (this.completed === totalTasks) {
                                if (this.errors.length > 0) {
                                    this.emit('done', this.results, this.errors);
                                    return resolve(this.results);
                                } else {
                                    this.emit('done', this.results);
                                    return resolve(this.results);
                                }
                            } else {
                                runNext();
                            }
                        }
                    })();
                }
            };

            runNext();
        });
    }
}

module.exports = AsyncRunner;
