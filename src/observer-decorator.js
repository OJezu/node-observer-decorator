"use strict";

var when = require("when");

module.exports = function makeObservable(decorated_object, observable_events){
	decorated_object.registerObserver = function(event_name, event_observer){
		if( observable_events.indexOf(event_name) === -1){
			throw new Error("Unknown event »"+event_name+"«");
			//TODO: Implement error classes
		}

		if( !("_from_decorator__event_observers" in this) ){
			this._from_decorator__event_observers = {};
		}

		if( !(event_name in this._from_decorator__event_observers) ){
			this._from_decorator__event_observers[event_name] = [];
		}

		if( !(event_observer instanceof Function) ){
			throw new Error("Event observer must be a function");
			//TODO: Implement error classes
		}

		this._from_decorator__event_observers[event_name].push(event_observer);
	};

	decorated_object.removeObserver = function(event_name, event_observer){
		if( observable_events.indexOf(event_name) === -1){
			throw new Error("Unknown event »"+event_name+"«");
			//TODO: Implement error classes
		}

		if(
			!("_from_decorator__event_observers" in this)
			|| !(event_name in this._from_decorator__event_observers)
		){
			return true;
		}

		this._from_decorator__event_observers[event_name] =
			this._from_decorator__event_observers[event_name]
			.filter(function(entry){
				return entry !== event_observer;
			});

		return true;
	};

	decorated_object._notifyObservers = function(event_name){
		var args = Array(arguments.length-1);
		var i, l;

		if( observable_events.indexOf(event_name) === -1){
			return when.reject(new Error("Unknown event »"+event_name+"«"));
			//TODO: Implement error classes
		}

		if(
			!("_from_decorator__event_observers" in this)
			|| !(event_name in this._from_decorator__event_observers)
		){
			return when([]);
		}

		//see "http"://jsperf.com/arguments-to-array/5
		for (i = 1, l = arguments.length; i < l; ++i) {
			args[i-1] = arguments[i];
		}

		return when.map(
			this._from_decorator__event_observers[event_name],
			function(event_observer){
				return event_observer.apply(null, args);
			}
		);
	};
};
