var AsyncRunner = require("../lib/async-runner").AsyncRunner;

var myAsyncRunner = new AsyncRunner({
	loop:3,
	logging:true,
	delay:3000
});

myAsyncRunner.addStatusChangeListener(
	function(event) {
		switch (event.type) {
			case AsyncRunner.FINISHED:
				console.log("Event " + AsyncRunner.FINISHED);
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
			callback.next();
		},1000);
	}
	// simulate a time consuming task
	setTimeout(ready, 1000);
}, {
	text: "goodbye world !"
});

myAsyncRunner.executeAll();