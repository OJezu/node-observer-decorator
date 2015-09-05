/* jshint mocha : true */
/* jshint -W030 */
"use strict";

var expect = require("chai").use(require("chai-as-promised")).expect;
var when = require("when");

var observableDecorator = require("../src/observer-decorator.js");

describe("observer-decorator", function(){

	describe("observer-decorator/observable", function(){
		it("should add registerObserver method to observed object", function(){
			var obj = {};
			observableDecorator(obj);

			expect(obj).to.have.property("registerObserver");
			expect(obj.registerObserver).to.be.instanceof(Function);
		});

		it("should add removeObserver method to observed object's prototype", function(){
			var obj = {};
			observableDecorator(obj);

			expect(obj).to.have.property("removeObserver");
			expect(obj.removeObserver).to.be.instanceof(Function);
		});

		it("should add _notifyObservers method to observed object's prototype", function(){
			var obj = {};
			observableDecorator(obj);

			expect(obj).to.have.property("_notifyObservers");
			expect(obj._notifyObservers).to.be.instanceof(Function);
		});
	});

	describe("observer-decorator#registerObserver", function(){
		it("should add `_from_decorator__event_observers` property to object if needed", function(){
			var obj = {};
			observableDecorator(obj, ["test-event"]);

			obj.registerObserver("test-event", function(){});

			expect(obj).to.have.property("_from_decorator__event_observers");
		});

		it("should throw an error if registering observer of event not in observed_events", function(){
			var obj = {};
			observableDecorator(obj, ["test-event"]);

			expect(obj.registerObserver.bind(obj, "not-existing", function(){}))
				.to.throw(Error, /Unknown event/i);
		});

		it("should throw an error if registering observer is not a function", function(){
			var obj = {};
			observableDecorator(obj, ["test-event"]);

			expect(obj.registerObserver.bind(obj, "test-event", true))
				.to.throw(Error, /observer must be a function/i);
		});

		it("should add registered observers to `_from_decorator__event_observers`", function(){
			var obj = {};
			function observer(){};
			observableDecorator(obj, ["test-event"]);

			obj.registerObserver("test-event", observer);

			expect(obj).to.have.property("_from_decorator__event_observers").that.is.an("object");
			expect(obj._from_decorator__event_observers).to.have.property("test-event").that.is.an("array");
			expect(obj._from_decorator__event_observers["test-event"]).to.include(observer);
		});
	});

	describe("observer-decorator#removeObserver", function(){
		it("should throw an error if removing observer of event not in observed_events", function(){
			var obj = {};
			observableDecorator(obj, ["test-event"]);

			expect(obj.removeObserver.bind(obj, "not-existing", function(){}))
				.to.throw(Error, /Unknown event/i);
		});

		it("should remove observers from `_from_decorator__event_observers`", function(){
			var obj = {};
			function observer(){};
			observableDecorator(obj, ["test-event"]);

			obj.registerObserver("test-event", observer);
			obj.removeObserver("test-event", observer);

			expect(obj).to.have.property("_from_decorator__event_observers").that.is.an("object");
			expect(obj._from_decorator__event_observers).to.have.property("test-event").that.is.an("array");
			expect(obj._from_decorator__event_observers["test-event"]).to.not.include(observer);
		});

		it("should return true if observer is already not in `_from_decorator__event_observers`", function(){
			var obj = {};
			function observer(){};
			observableDecorator(obj, ["test-event"]);

			expect(obj.removeObserver("test-event", observer)).to.be.true;
		});
	});

	describe("observer-decorator#_notifyObservers", function(){
		it("should return a promise", function(){
			var obj = {};

			observableDecorator(obj, ["test-event"]);

			expect(when.isPromiseLike(obj._notifyObservers("test-event"))).to.be.true;
		});

		it("should reject if notifying observers of event not in observed_events", function(){
			var obj = {};
			observableDecorator(obj, ["test-event"]);

			expect(obj._notifyObservers("not-existing", function(){}))
				.to.be.rejectedWith(Error, /Unknown event/i);
		});

		it("should call all observers for event", function(){
			var obj = {};
			var count = 0;
			function observer(){
				++count;
			};
			observableDecorator(obj, ["test-event"]);

			obj.registerObserver("test-event", observer);
			obj.registerObserver("test-event", observer);
			obj.registerObserver("test-event", observer);

			return obj._notifyObservers("test-event")
				.then(function(){
					expect(count).to.be.equal(3);
				});
		});

		it("should reject if any of observers reject", function(){
			var obj = {};
			var count = 0;
			function observer(){
				++count;
			};
			observableDecorator(obj, ["test-event"]);

			obj.registerObserver("test-event", observer);
			obj.registerObserver("test-event", function(){
				return when.reject(new Error("Test error 2jke4dg4"));
			});
			obj.registerObserver("test-event", observer);

			return expect(obj._notifyObservers("test-event"))
				.to.be.rejectedWith(Error, /2jke4dg4/);
		});

		it("should call observers for event with all the arguments past first one", function(){
			var obj = {};
			function observer(arg1, arg2, arg3){
				expect(Array.prototype.slice.call(arguments)).to.be.deep.equal([1,2,3]);
			};
			observableDecorator(obj, ["test-event"]);

			obj.registerObserver("test-event", observer);

			return obj._notifyObservers("test-event", 1, 2, 3);
		});

		it("should wait with resolution until all observers resolve", function(){
			var obj = {};
			var count = 0;
			function observer(){
				return when().delay(5).tap(function(){++count;});
			};
			observableDecorator(obj, ["test-event"]);

			obj.registerObserver("test-event", observer);
			obj.registerObserver("test-event", observer);
			obj.registerObserver("test-event", observer);

			return obj._notifyObservers("test-event")
				.then(function(){
					expect(count).to.be.equal(3);
				});
		});

		it("should resolve with an array of observer's resolution values", function(){
			var obj = {};
			var count = 0;
			function observer(val){
				return ++count;
			};
			observableDecorator(obj, ["test-event"]);

			obj.registerObserver("test-event", observer);
			obj.registerObserver("test-event", observer);
			obj.registerObserver("test-event", observer);

			return obj._notifyObservers("test-event")
				.then(function(res){
					expect(res).to.be.an("array");
					expect(res.sort()).to.be.deep.equal([1,2,3]);
				});
		});
	});
});
