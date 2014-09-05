var events = require('events');

(function(scope) {

	if (scope === null) {
		var scope = module.exports;
	}

	var StatusChangeEvent = function() {
		this.type = "";
	}

	var AsyncRunner = function(o) {

		var options = (o || {
			loop: 0,
			delay: false,
			logging: false
		});

		var states = ["INACTIVE", "RUNNING", "PAUSE", "RESUME", "FINISHED", "ABORT"];

		var INACTIVE = 0;
		var RUNNING = 1;
		var PAUSE = 2;
		var RESUME = 3;
		var FINISHED = 4;
		var ABORT = 5;
		var loopCount = (options.loop || 0);
		var stack = [];
		var loopStack = [];
		var isExecuting = false;
		var taskCounter = 0;
		var status = states[INACTIVE];
		var startTime;
		var eventEmitter = new events.EventEmitter();

		return {
			addStatusChangeListener: function(_statusCallback) {
				eventEmitter.on('statusChange', _statusCallback);
			},
			getStatus: function() {
				return status;
			},
			setStatus: function(_state) {
				status = states[_state];
				var statusChangeEvent = new StatusChangeEvent();
				statusChangeEvent.type = status;
				eventEmitter.emit('statusChange', statusChangeEvent);
			},
			isEmpty: function() {
				return (stack.length == 0);
			},
			addTask: function(_task, _data) {
				var taskWrapper = new Wrapper();
				taskWrapper.setTask(_task);

				if (this.getStatus() == states[INACTIVE] || this.getStatus() == states[FINISHED]) {
					taskWrapper.setCallBack(this.next);
					stack[stack.length] = [taskWrapper, _data];
					taskCounter = taskCounter + 1;
					return this;
				} else {
					return 0;
				}
			},
			setStartTime: function(_startTime) {
				startTime = _startTime;
			},
			getStartTime: function() {
				return startTime;
			},
			getExecutionTime: function() {
				var end = new Date().getTime();
				return this.millisecondsToStr(end - this.getStartTime());
			},
			millisecondsToStr: function(milliseconds) {
				// http://stackoverflow.com/questions/8211744/convert-milliseconds-or-seconds-into-human-readable-form
				var seconds = milliseconds / 1000;
				var numyears = Math.floor(seconds / 31536000);
				if (numyears) {
					return numyears + ' year' + ((numyears > 1) ? 's' : '');
				}
				var numdays = Math.floor((seconds % 31536000) / 86400);
				if (numdays) {
					return numdays + ' day' + ((numdays > 1) ? 's' : '');
				}
				var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
				if (numhours) {
					return numhours + ' hour' + ((numhours > 1) ? 's' : '');
				}
				var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
				if (numminutes) {
					return numminutes + ' minute' + ((numminutes > 1) ? 's' : '');
				}
				var numseconds = (((seconds % 31536000) % 86400) % 3600) % 60;
				if (numseconds) {
					return numseconds + ' second' + ((numseconds > 1) ? 's' : '');
				}
				return 'less then a 0.001 millisecond';
			},
			executeAll: function() {
				if (this.getStatus() == states[INACTIVE]) {
					this.setStatus(RUNNING);
					if (options.logging) {
						console.log("EXECUTE ALL TASKS");
					}
					this.next();
				}
			},
			pause: function() {
				this.setStatus(PAUSE);
			},
			resume: function() {
				this.setStatus(RESUME);
			},
			abort: function() {
				this.setStatus(ABORT);
			},
			nextTimeout: function() {
				isExecuting = false;

				if (this.getStatus() == states[ABORT]) {
					stack = [];
					this.setStatus(INACTIVE);
					return;
				}
				if (this.isEmpty() || (status == states[PAUSE])) {

					if (status != states[PAUSE]) {
						if (options.loop > 1) {

							stack = loopStack;

							loopStack = [];
							var nextCommand = stack.shift();
							loopStack.push(nextCommand);

							if (options.logging) {
								console.log(status);
								console.log(nextCommand[1]);
							}

							var t = this;
							setTimeout(function() {
								nextCommand[0].execute(t, taskCounter - stack.length, nextCommand[1]);
								isExecuting = true;
							}, options.loopDelay);

							options.loop -=1;

						} else {
							this.setStatus(INACTIVE);
							if (stack.length == 0) {
								this.setStatus(FINISHED);
							}
						}

					} else {
						this.setStatus(FINISHED);
					}

					if (options.logging) {
						console.log(status);
						console.log(stack.length)
					}
				} else {

					var nextCommand = stack.shift();
					loopStack.push(nextCommand);

					if (options.logging) {
						console.log(status);
						console.log(nextCommand[1]);
					}
					nextCommand[0].execute(this, taskCounter - stack.length, nextCommand[1]);

					isExecuting = true;
				}
			},
			next: function() {
				var t = this;
				if (options.delay > 0) {
					if (options.logging === true) {
						console.log("EXECUTION DELAY OF " + t.millisecondsToStr(options.delay));
					}
					setTimeout(this.nextTimeout.bind(this), options.delay);
				} else {
					t.nextTimeout();
				}
			}
		}

	};

	AsyncRunner.INACTIVE = "INACTIVE";
	AsyncRunner.RUNNING = "RUNNING";
	AsyncRunner.PAUSE = "PAUSE";
	AsyncRunner.RESUME = "RESUME";
	AsyncRunner.FINISHED = "FINISHED";


	var Wrapper = function() {
		var callback;
		var task;
		return {
			getTask: function() {
				return task;
			},
			setTask: function(_task) {
				task = _task;
			},
			getCallBack: function() {
				return callback;
			},
			setCallBack: function(_callback) {
				callback = _callback;
				return this;
			},
			execute: function(_callback, l, data) {
				return function(_callback, _task, l, _data) {
					_callback.setStartTime(new Date().getTime());
					_task.call(_callback, _callback, l, _data);
				}(_callback, this.getTask(), l, data)
			}
		}
	};

	scope.AsyncRunner = AsyncRunner;
	scope.Wrapper = Wrapper;

})(this);