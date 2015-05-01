describe("core.extend", function(){
	var extend = core && core.extend && core.extend;

	it("should exist", function(){
		expect(extend).toBeDefined();
	});

	it("should mimic assign", function(){
		var obj = {};

		expect(extend(obj, { a: 1, b: { two: "three" }}))
			.toEqual({a: 1, b: {two: "three"}});
	});

	it("should work with create and .parent ref", function(){
		var obj = { b: {} }, obj2 = { prop: 11 };
		obj.extend = core.extend.clone({parent: obj});
		obj.extend({ a: 1, b: obj2 });
		expect(obj.a).toBe(1);
		expect(obj.b).toEqual(obj2);
		expect(obj.b).not.toBe(obj2);
	});

	it("should call functions with values, extend functions with objects, and override functions with functions", function(){

		var obj = {},
			last,
			fn = function(a){
				last = a;
			};

		obj.fn = fn;	
		obj.extend = core.extend.clone({parent: obj});

		obj.extend({fn: 5});
		expect(last).toBe(5);

		obj.extend({fn: 'str'});
		expect(last).toBe('str');

		obj.extend({fn: false});
		expect(last).toBe(false);

		obj.extend({fn: {prop: 5}});
		expect(obj.fn.prop).toBe(5);

		expect(obj.fn).toBe(fn);
		obj.extend({fn: function(){}});
		expect(obj.fn).not.toBe(fn);
	});
});