describe("core.extender", function(){
	var extender = core && core.extender,
		Extender = core && core.Extender,
		_Extender = core && core.Extender;

	it("should exist", function(){
		expect(extender).toBeDefined();
		expect(Extender).toBeDefined();
	});

	it("should have an instance, for cloning, or a factory, for auto cloning", function(){
		var myExtender = extender(),
			MyExtender = Extender({test: 123});

		expect(MyExtender.invoke).toBe(MyExtender.clone);
		expect(MyExtender.test).toBe(123);

		expect(myExtender.invoke).toBe(myExtender.extend);

		var obj = { prop: 1, objProp: { two: "three" }};

		var myExt1 = MyExtender(obj);
		expect(myExt1.test).toBe(123);
		expect(myExt1.prop).toBe(1);
		expect(myExt1.objProp).toEqual(obj.objProp);
		// expect(myExt1.objProp).not.toBe(obj.objProp); // fails, fix?

		myExt1({prop: 2});
		expect(myExt1.prop).toBe(2);

		var myExt1clone = myExt1.clone();
		expect(myExt1clone.prop).toBe(2);

		var myExt2 = MyExtender(obj);
		expect(myExt2.prop).toBe(1);

		expect(myExt1).not.toBe(myExt2);
	});

	it("should extend itself when invoked", function(){
		// we don't want to extend the Extender itself, so we clone it first
		var MyExtenderModule = core.extender.clone(),
			myObj = { prop: 5 },
			last;

		MyExtenderModule({
			a: 1,
			b: myObj,
			c: function(i){
				last = i;
			}
		});

		expect(true).toBe(true);

		expect(MyExtenderModule.a).toBe(1);
		expect(MyExtenderModule.b).toBe(myObj); // changed this behavior.. then changed it back...
		// expect(MyExtenderModule.b).toEqual(myObj);

		MyExtenderModule({c: 4});
		expect(last).toBe(4);

		MyExtenderModule({c: [{prop: 9}]});
		expect(last).toEqual({prop: 9});

		MyExtenderModule({c: { prop: 9 }});
		expect(MyExtenderModule.c.prop).toEqual(9);

		var Klone = MyExtenderModule.clone();
		expect(Klone.a).toBe(1);
		expect(Klone.b).toEqual(myObj);
		expect(Klone.b).not.toBe(myObj);
		expect(Klone.c).toBe(MyExtenderModule.c);

		// these are somewhat arbitrary - just making sure its working as I expect
		expect(Klone.clone).toBe(MyExtenderModule.clone);
		expect(Klone.extend).not.toBe(MyExtenderModule.extend);
		expect(Klone.extend.parent).toBe(Klone);
	});
});

describe("Q2", function(){
	var Q2 = core.Q2;
	it("should be defined", function(){
		expect(Q2).toBeDefined();
	});

	it("should accept cbs, and call them upon execution", function(){
		var q = Q2(), check = 0, handle;

		handle = q(function(){ check++; expect(this).toBe(q); });
		q(function(){ check++; });
		q();

		expect(check).toBe(2);
		q();
		expect(check).toBe(4);

		handle.remove();
		q();
		expect(check).toBe(5);

		var r = q.clone();
		r();
		expect(check).toBe(6);
	});

	it("should be installable by assigning a parent reference", function(){
		var Mod = core.Extender({
			prop: 5,
			cloned: function(){
				expect(this.prop).toBe(5);
				this.cloned = function(){
					this.invoke = this.extend;
					this.init && this.init.apply(this, arguments);
				};
			}
		});

		var check = 0;
		Mod.init = core.Init({parent: Mod});
		// expect(Mod.init).toBe(Q2);
		Mod.init(function(args){
			// console.log(arguments);
			check++;
			expect(args.test).toBe(123);
		});
		expect(check).toBe(0);

		Mod.extend({
			init: function(args){
				check++;
				expect(args.test).toBe(123);
				ctx = this;
			}
		});
		expect(check).toBe(0);

		// Mod.init = function(){}; // overrides
		

		var ctx;
		// add initializer with array
		// Mod.extend({
		// 	init: [function(){
		// 		console.log('init 2');
		// 		check++;
		// 		ctx = this;
		// 	}]
		// });

		expect(check).toBe(0);
		var mod = Mod({test: 123});
		expect(check).toBe(2);
		expect(ctx).toBe(mod);

		mod({test2: 456});
		expect(mod.test2).toBe(456);

		mod({init: function(){
			check++;
			// expect(this).toBe(mod);
		}});
		expect(check).toBe(3);
		mod.init({test: 123});
		expect(check).toBe(6);

		var mod2 = mod.clone({test: 123});
		expect(check).toBe(9);
	});
});