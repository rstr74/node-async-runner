var AsyncRunner = require("../lib/async-runner");

var myAsyncRunner = new AsyncRunner({
	loop:3,
	logging:false,
	delay:3000
});

myAsyncRunner.addStatusChangeListener(
	function(event) {
		switch (event.type) {
			case AsyncRunner.INACTIVE:
				console.log(AsyncRunner.INACTIVE);
			break;
			case AsyncRunner.RUNNING:
				console.log(AsyncRunner.RUNNING);
			break;
			case AsyncRunner.PAUSE:
				console.log(AsyncRunner.PAUSE);
			break;
			case AsyncRunner.RESUME:
				console.log(AsyncRunner.RESUME);
			break;
			case AsyncRunner.ABORT:
				console.log(AsyncRunner.ABORT);
			break;
		}
	}
);

myAsyncRunner.addTask(function(callback, index, data) {
	ready = function() {
		console.log("Task " +index+" "+  data.text + " >FINISHED IN " + callback.getExecutionTime());
		callback.next();
	}
	//simulate a time consuming task
	setTimeout(ready, 500);
}, {
	text: "hello world !"
});


myAsyncRunner.addTask(function(callback, index, data) {
	ready = function() {
		console.log("Task " +index+" "+  data.text + " >FINISHED IN " + callback.getExecutionTime());
		callback.pause();
		console.log("Pause for 1000 ms");
		setTimeout(function(){
			callback.resume();
			callback.abort();
			//callback.next();
		},1000);
	}
	// simulate a time consuming task
	setTimeout(ready, 1000);
}, {
	text: "goodbye world !"
});

myAsyncRunner.executeAll();