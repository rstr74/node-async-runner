Run asynchronous tasks in a persistent order.

``` js
var AsyncRunner = require("node-async-runner").AsyncRunner;

var myAsyncRunner = new AsyncRunner();


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
        callback.next()
    }
    // simulate a time consuming task
    setTimeout(ready, 1000);
}, {
    text: "goodbye world !"
});

myAsyncRunner.executeAll();
```