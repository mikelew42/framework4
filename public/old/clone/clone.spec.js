describe("Clone", function(){
	var clone = core && core.Clone();
	// clone = clone.create();
	// console.dir(clone);

	it("should return a standard clone fn", function(){
		expect(typeof clone).toBe('function');
	});

	it("should clone (aka return) values", function(){
		expect(clone(5)).toBe(5);
		expect(clone('str')).toBe('str');
		expect(clone(false)).toBe(false);
	});

	it("should deep clone objects", function(){
		clone.log = true;
		var obj = {
				one: 1,
				objProp: {
					two: 2
				},
				arrProp: [1, 2, 3]
			},
			c = clone(obj);
		clone.log = false;
		expect(c).toEqual(obj);
		expect(c).not.toBe(obj);

		expect(c.objProp).toEqual(obj.objProp);
		expect(c.objProp).not.toBe(obj.objProp);
		
		expect(c.arrProp).toEqual(obj.arrProp);
		expect(c.arrProp).not.toBe(obj.arrProp);
	});

	it("should deep clone arrays", function(){
		var arr = [
				0,
				[1, 2, 3], 
				{ 
					four: 4, 
					five: { 
						six: 6 
					} 
				}
			],
			c = clone(arr);

		expect(c).toEqual(arr);
		expect(c).not.toBe(arr);

		expect(c[1]).toEqual(arr[1]);
		expect(c[1]).not.toBe(arr[1]);

		expect(c[2]).toEqual(arr[2]);
		expect(c[2]).not.toBe(arr[2]);
		expect(c[2].five).toEqual(arr[2].five);
		expect(c[2].five).not.toBe(arr[2].five);
	});

	it("should use the .Base()", function(){
		var Base = function(){
				var fn = function(){};
				fn.check = true;
				fn.Base = Base;
				return fn;
			},
			fn = Base(),
			c = clone(fn);

		expect(c).not.toBe(fn);
		expect(c.check).toEqual(fn.check);
		expect(c.Base).toBe(Base);
	});

	it("should recreate .parent references", function(){
		var p = { pProp: 1, pRef: { pRefProp: 2 } };
		p.sub = { parent: p, prop: 5, ref: {refProp: 6, clone: function(){ return this;} }};

		var parentalClone = clone.create();
		parentalClone.invoke = parentalClone.parental;
		var klone = parentalClone(p);

		expect(klone.pProp).toBe(1);
		expect(klone.pRef).not.toBe(p.pRef);
		expect(klone.pRef).toEqual(p.pRef);

		// here's the magic
		expect(klone.sub.parent).toBe(klone);
		expect(klone.sub.prop).toBe(5);

		// use custom clone fn to override deep cloning
		expect(klone.sub.ref).toBe(p.sub.ref);
		// expect(klone.sub.ref).not.toBe(p.sub.ref);
		// expect(klone.sub.ref).toEqual(p.sub.ref);
	});	

	it("should return a fn that doesn't have .Base or .clone", function(){
		var Fn = function(){
				return function(){};
			},
			fn = Fn(),
			fn2 = Fn(),
			fn3 = Fn();
		
		// without .Base or .clone, return the fn (nothing else can be done)
		expect(clone(fn)).toBe(fn);
		
		// use clone, if present
		fn2.clone = function(){ return 5; };
		expect(clone(fn2)).toBe(5);
		
		// use Base, if present, and iterate
		fn3.Base = Fn;
		fn3.prop = 28;
		expect(clone(fn3)).not.toBe(fn3);
		expect(typeof clone(fn3)).toBe('function');
		expect(clone(fn3).toString()).toBe("function (){}");
		expect(clone(fn3).prop).toBe(28);

		// use .clone over (.Base + iterate)
	});
});

describe("OOClone", function(){
	var Clone = core && core.Clone;

	it("should not be invoked initially", function(){
		expect(true).toBe(true);
	});

	it("should clone its host, including itself", function(){
		var obj = {
			prop: 5
		};

		obj.clone = Clone(obj);

		// expect(obj.clone()).toEqual(obj); // fails because the toEqual doesn't work with cloned fns
		expect(obj.clone().prop).toEqual(obj.prop);
		// expect(obj.clone().clone.toString()).toEqual(obj.clone.toString());
		expect(obj.clone().clone).not.toBe(obj.clone);
	});

	it("should allow custom overrides using base.clone.rules.propName", function(){
		var obj = {
			prop: 5
		};

		obj.clone = Clone(obj);

		expect(obj.clone().prop).toBe(5);

		obj.clone.rules.prop = function(value, base){
			base.prop = 6;
		};

		expect(obj.clone().prop).toBe(6);
	});

	it("should skip cloning if base.clone.rules.propName is set to false", function(){
		var obj = {
			prop: 5
		};

		obj.clone = Clone(obj);

		expect(obj.clone().prop).toBe(5);

		obj.clone.rules.prop = false;

		expect(obj.clone().prop).toBeUndefined();

		delete obj.clone.rules.prop;

		expect(obj.clone().prop).toBe(5);
	});

	it("should work with functions", function(){
		var Fn = function(){
				var fn = function(){
					return fn.invoke.apply(fn, arguments);
				};
				fn.Base = Fn;
				fn.clone = Clone(fn);
				return fn;
			},
			fn = Fn(),
			c;

		fn.prop = 'yo';
		fn.cloneMe = { prop: 123 };
		fn.myRef = { prop: 8910 };
		fn.clone.myRef = function(){
			return fn.myRef;
		};

		c = fn.clone();
		expect(c.prop).toBe('yo');

		expect(c.cloneMe).toEqual(fn.cloneMe);
		expect(c.cloneMe).not.toBe(fn.cloneMe);

		// expect(c.myRef).toBe(fn.myRef);
	});
});