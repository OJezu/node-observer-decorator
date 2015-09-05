# observer-decorator

## Usage:
```js
var observerDecorator = require("observer-decorator");

var my_object = {};

// turns my object into observable object
observerDecorator(my_object, ["event_name"]);

// registers observer
my_object.registerObserver("event_name", function(argument_1, argument_2, ...){
	// (...)
});

// returns a promise
my_object._notifyObservers("event_name", argument_1, argument_2, ...)
	.then(function(observer_responses_array){
		// (...)
	});
```

## Available methods:

#### `observerDecorator(decorated_object, array_of_event_names)`

Turns `decorated_object` into object observable for events named as listed in
`array_of_event_names`

#### `decorated_object.registerObserver(event_name, func)`

Registers `func` as observing event named `event_name` emitted from
`decorated_object`. If `func` is not a function or `event_name` was not in array
of event names passed to `observerDecorator`, `registerObserver` will throw an
error.

#### `decorated_object.removeObserver(event_name, func)`

Removes `func` from observers of event named `event_name` emitted from
`decorated_object`. If `func` is not a function or `event_name` was not in array
of event names passed to `observerDecorator`, `registerObserver` will throw an
error.

If `func` was registered more than once on observed object, all instances will
be removed.

#### `decorated_object._notifyObservers(event_name, argument1, argument2, ...)`

Calls all observers registered on observed object on event named `event_name`.
Returns promise resolving to array with all the return values of all called
observers.

Passes all arguments past the first one to the observing functions.

If observer returns a promise, it will be resolved in array returned from
`_notifyObservers`.

If any of the observers throws exception or returns rejected promise,
`_notifyObservers` will return promise rejected with one of the values rejected
(or thrown) from the observers.
