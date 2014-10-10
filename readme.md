Run asynchronous tasks in a queued order.

```
npm install node-async-runner
```

**options**
----

* **loop [int]**

  repeat the stack of tasks *n* times, default = 0

* **delay [int] or false**
  
  Wait for *n* millisecond, before starting a new task in the stack. Default = false;

*  **logging [boolean]**

   Set this to true to turn on logging

*  **continuous [boolean]**

   If this option is set to true, new tasks added with myAsyncRunner.addTask will keep the runner going. This is useful for handling al sorts of server requests in a FIFO order.

**Task**
myAsyncRunner.addTask(fn:Function,data:Object);
   
   
Each task (fn) function gets 3 params:

``` js
function(callback, index, data) {}
```




* **callback [Object]**

  - callback.next
  - callback.getExecutionTime
  - callback.pause
  - callback.resume

* **index [Int]**

  The sequence index of the current task
  
* **data [Object]**

  The data passed to myAsyncRunner.addTask as second parameter. This data is passed when executing a task.
  
----

``` js
var AsyncRunner = require("node-async-runner").AsyncRunner;

var myAsyncRunner = new AsyncRunner({
            loop: 3,
            delay: false,
            logging: false
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
        callback.next()
    }
    // simulate a time consuming task
    setTimeout(ready, 1000);
}, {
    text: "goodbye world !"
});

myAsyncRunner.executeAll();
```
