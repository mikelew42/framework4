describe("core.utils", function(){
	var utils = core && core.utils,
		is = core.is;

	it("should exist", function(){
		expect(utils).toBeDefined();
		expect(is).toBeDefined();
	});

	describe("is.arr", function(){
		it("should identify an array", function(){
			expect(is.arr([])).toBe(true);
			expect(is.arr({})).toBe(false);
		});
	});
	
	describe("is.obj", function(){
		it("should identify an object", function(){
			expect(is.obj({})).toBe(true);
			expect(is.obj([])).toBe(false);
			expect(is.obj(function(){})).toBe(false);
		});
	});

	describe("is.fn", function(){
		it("should identify a function", function(){
			expect(is.fn(function(){})).toBe(true);
			expect(is.fn({})).toBe(false);
		});
	});

	describe("is.val", function(){
		it("should identify a bool, num, or string", function(){
			expect(is.val(true)).toBe(true);
			expect(is.val(false)).toBe(true);
			expect(is.val(3)).toBe(true);
			expect(is.val("yep")).toBe(true);
			expect(is.val({})).toBe(false);
			expect(is.val([])).toBe(false);
			expect(is.val(function(){})).toBe(false);
		});
	});

	describe("is.mod", function(){
		it("should identify a module that has a .Base", function(){
			expect(is.mod({Base: 1})).toBe(true);
		});
	});

	describe("parentalClone", function(){
		it("should recreate prefs", function(){
			var pclone = utils.parentalClone;
			expect(pclone).toBeDefined();

			var p = { pProp: 1, pRef: { pRefProp: 2 } };
			p.sub = { parent: p, prop: 5, ref: {refProp: 6}};
			p.sub.ref.parent = p.sub;

			var klone = pclone(p);

			expect(klone).toEqual(p);
			expect(klone).not.toBe(p);
			expect(klone.pProp).toBe(1);
			expect(klone.pRef).not.toBe(p.pRef);
			expect(klone.pRef).toEqual(p.pRef);

			// here's the magic
			expect(klone.sub.parent).toBe(klone);
			expect(klone.sub.prop).toBe(5);
			expect(klone.sub.ref).toEqual(p.sub.ref);
			expect(klone.sub.ref).not.toBe(p.sub.ref);

			// recursively reassign prefs
			expect(klone.sub.ref.parent).toBe(klone.sub);
		});

		it("should recreate gparent refs", function(){
			var pclone = utils.parentalClone;

			var gp = {
				p: {
					gc: {}
				}
			};

			gp.p.parent = gp;
			gp.p.gc.parent = gp;

			// here, the grand child references grand parent as parent

			expect(gp.p.gc.parent).toBe(gp);

			gpclone = pclone(gp);
			expect(gpclone.p.gc.parent).toBe(gpclone);
			
			expect(gp.p.gc.parent).toBe(gp);

		});
	});

	describe("Cloner", function(){
		it("should return a self-cloning module", function(){
			var cloner = utils.Cloner();
			expect(cloner.invoke).toBe(cloner.clone);
			cloner.prop = 5;
			var clonered = cloner();
			expect(clonered.prop).toBe(5);
		});
	});

	describe("extend", function(){
		var extend = core.utils.extend;

		it("should be defined", function(){
			expect(extend).toBeDefined();
		});

		it("should return anything if base is value", function(){
			expect(extend(2, 3)).toBe(3);
			expect(extend(2, 3, 4, 5, "six")).toBe("six");

			var fn = function(){};
			expect(extend(2, fn)).toBe(fn);
			var obj = { test: 123 };
			expect(extend(2, obj)).toBe(obj);
			// note, to prevent assignment of object, just set it to an existing object:

			expect(extend({ prop: 1 }, { prop: obj }).prop).toBe(obj);
			expect(extend({ prop: {} }, { prop: obj }).prop).toEqual(obj);
			expect(extend({ prop: {} }, { prop: obj }).prop).not.toBe(obj);
		});

		it("should invoke functions", function(){
			var check = false, fn = function(arg){ check = arg; expect(this).toBe(fn); };
			extend(fn, 5);
			expect(check).toBe(5);
		});

		it("should invoke functions with parent context, when possible", function(){
			var check = false, obj = {
				fn: function(arg){
					check = arg;
					expect(this).toBe(obj);
				}
			};
			extend(obj, { fn: "str" });
			expect(check).toBe("str");

			var fn2 = function(){};
			// apply fn2
			extend(obj, { fn: [fn2] });
			expect(check).toBe(fn2);

			// override with fn2
			extend(obj, { fn: fn2 });
			expect(obj.fn).toBe(fn2);
		});
	});

	describe("Module", function(){
		var Module = utils.Module;

		it("Module should return a self-cloning Factory module", function(){
			var obj = { test: 123}, MyModule = Module({
				prop: 1,
				objProp: obj
			});
			
			expect(Module.invoke).toBe(Module.clone);

			expect(MyModule.invoke).toBe(MyModule.clone);
			expect(MyModule.prop).toBe(1);
			expect(MyModule.objProp).toBe(obj);

			var myMod = MyModule({
				invoke: "extend"
			});
			expect(myMod).not.toBe(MyModule);
			expect(myMod.invoke).toBe(myMod.extend);
			expect(myMod.prop).toBe(1);
			expect(myMod.objProp).not.toBe(obj);
			expect(myMod.objProp).toEqual(obj);

			// extend Factories with .clone
			var MyMod = MyModule.clone({
				prop2: 2
			});

			expect(MyMod.invoke).toBe(MyMod.clone);
			expect(MyMod.prop2).toBe(2);
			expect(MyMod.prop).toBe(1);
			expect(MyMod.objProp).not.toBe(obj);
			expect(MyMod.objProp).toEqual(obj);

			var myMod2 = MyMod({
				invoke: "extend",
				prop2: 3
			});
			expect(myMod2.invoke).toBe(myMod2.extend);
			expect(myMod2.prop2).toBe(3);
			myMod2({prop2: 4});
			expect(myMod2.prop2).toBe(4);
		});
	});

	describe("Q", function(){
		var Q = utils.Q;
		it("should be defined", function(){
			expect(Q).toBeDefined();
		});
		it("should accept cbs, and execute them", function(){
			var check = 0, q = Q();

			q(function(){
				check ++;
			});

			q(function(){
				check++;
			});

			q.dnc(function(){
				expect(this).toBe(q);
			});

			expect(check).toBe(0);

			q();

			expect(check).toBe(2);

			var r = q.clone();
			expect(check).toBe(2);
			r();
			expect(check).toBe(4);
			
			r.dnc(function(){
				check = check + 10;
				expect(this).toBe(r);
			});

			r();
			expect(check).toBe(16);

			var s = r.clone();
			expect(check).toBe(16);
			s();
			expect(check).toBe(18);
		});

		it("should be installable by providing a pref", function(){
			var check = 0, mod = utils.Module({
				invoke: "extend"
			});
			mod.q = Q({parent: mod});
			expect(mod.q.parent).toBe(mod);
			mod.q.dnc(function(){
				expect(this).toBe(mod);
				check ++;
			});
			mod.q(function(){
				check++;
			});
			expect(check).toBe(0);
			mod.q();
			expect(check).toBe(2);

			var mod2 = mod.clone();
			expect(mod2.q.parent).toBe(mod2);
			expect(check).toBe(2);
			mod2.q();
			expect(check).toBe(3);
		});

		xit("could be used for config and init Qing", function(){
			var Mod = utils.Module({ _name: "Mod", log: true });
			
			console.log("created Mod, adding Mod.init:");
			Mod.init = Q({parent: Mod, _name:"init", condition: function(){ return this.execCount > 0; } });
			
			console.log("added Mod.init, calling Mod.init():");
			Mod.init();

			console.log("called Mod.init(), adding Mod.init(cb):");
			Mod.init(function(){
				console.log(this._name + ".init");
			});

			console.log("added Mod.init(cb), creating mod = Mod()");
			var mod = Mod({ _name: "mod" });

			console.log("created mod = Mod(), creating Sub = Mod()");
			var Sub = Mod({ 
				_name: "Sub",
				config: function(){
					console.group(this._name + ".config");
					console.log(this.parent);
					this.init();
					console.groupEnd();
				}
			});
			Sub.parent = utils.GetSet();
			console.log(Sub.parent);
			expect(Sub.parent()).not.toBeDefined();
			debugger;
			mod.sub1 = Sub({ _name: "sub1", parent: mod });
			// the problem here, is that the parent property isn't cloned, and so
			// when it comes time to extend it, it appears as an undefined property.


			expect(mod.sub1.parent()).toBe(mod);
			mod.sub2 = Sub({ _name: "sub2" });
			console.log('+++');
			var mod2 = mod();

		});
	});

});


describe("core.clone", function(){
	var clone = core.clone;
	it("should be defined", function(){
		expect(clone).toBeDefined();
	});

	it("should clone objects", function(){
		var obj1 = core.utils.tests.obj();

		expect(clone(obj1)).toEqual(obj1);
	});

	describe("clone.custom", function(){
		var clone = core.clone.custom;
		it("should be defined", function(){
			expect(clone.invoke).toBe(clone.custom);
		});

		it("should use value.clone if available, recursively", function(){
			var obj = {
				// clone: function(){ return false; }, // comparing to clone.skip, uncomment to show this doesn't work
				prop: {
					clone: function(){ return 6; }
				}
			};
			expect(clone(obj).prop).toBe(6);
		});
	});

	describe("clone.skip", function(){
		var clone = core.clone.skip;
		it("should be defined", function(){
			expect(clone.invoke).toBe(clone.simple);
		});
		it("should skip custom clone only for first pass", function(){
			var obj = {
				clone: function(){ return false; },
				prop: {
					clone: function(){ return 6; }
				}
			};
			expect(clone(obj).prop).toBe(6);
		});
	});

	describe("clone.oo", function(){
		var clone = core.clone.oo;
		it("should be defined", function(){
			expect(clone.invoke).toBe(clone.oo);
		});
		it("should be installable using pref", function(){
			var obj = {
				prop: {
					clone: function(){ return 6; }
				},
				test: 123
			};
			obj.clone = clone.clone({parent: obj});
			expect(obj.clone().prop).toBe(6);
			// expect(obj.clone()).toEqual({ prop: 6, test: 123 }); // doesn't work, because we're not doing a parental clone
			expect(obj.clone().clone).not.toBe(obj.clone);
			// expect(obj.clone().clone.parent).toBeDefined();

			var c = obj.clone();
			expect(c.test).toBe(123);
			// doesn't work, because c.clone.parent hasn't been relinked.
			// var d = c.clone();


		});
	});
});