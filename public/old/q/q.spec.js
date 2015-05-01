describe("core.Q", function(){
	var Q = core && core.Q;

	it("should exist", function(){
		expect(Q).toBeDefined();
	});

	it("should create an instance of then, which takes cbs, and execs them", function(){
		var q = Q(),
			check = [];

		q(function(){
			expect(this).toBe(q);
			check.push(1);
		});

		q(function(){
			check.push("two");
		});

		q();

		expect(check).toEqual([1, 'two']);
	});

	it("should be installable onto an obj", function(){
		var obj = {},
			check = [];

		obj.test = Q.installer(obj);

		obj.test(function(){
			expect(this).toBe(obj);
			expect(arguments[0]).toEqual(1);
			expect(arguments[1]).toEqual('two');
			check.push(1);
		});

		obj.test(function(){
			expect(arguments[0]).toEqual(1);
			expect(arguments[1]).toEqual('two');
			check.push(2);
		});

		obj.test(1, 'two');

		expect(check).toEqual([1,2]);
	});

	it("should create removeable cbs", function(){
		var obj = {};
		obj.test = Q.installer(obj);

		var removeMe = function(){
			expect(false).toBe(true); // make sure this doesn't run
		};

		// add this fn as cb, but store a handle to the fn
		var removeMe2 = obj.test(removeMe);

		// obj.test(); // uncomment to ensure fail

		// remove via splice
		obj.test.remove(removeMe);

		// make sure its removed
		obj.test();


		// add it again
		obj.test(removeMe);

		// obj.test(); // uncomment to ensure fail
		removeMe2.remove(); // comment this to fail

		obj.test();
		expect(true).toBe(true);
	});
});