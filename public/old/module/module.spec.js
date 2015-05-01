describe("Module", function(){
	var Module = core && core.Module;

	it("should exist", function(){
		expect(Module).toBeDefined();
	});

	it("should return a module with clone and assign functions", function(){
		var mod = Module();
		expect(typeof mod).toBe('function');
		expect(typeof mod.assign).toBe('function');
		expect(typeof mod.clone).toBe('function');
	});

	it("should create a factory which creates instances", function(){
		var Factory = Module();
		expect(Module.invoke).toBe(Module.create);
	});

	it("should assign incoming props onto itself, and invoke the .invoke fn", function(){
		var check = false, mod = Module({
			invoke: function(){
				check = true;
				expect(this).toBe(mod);
			},
			prop: 5
		}), obj = {mod: mod};

		expect(mod.prop).toBe(5);

		expect(check).toBe(false);
		obj.mod();
		expect(check).toBe(true);

	});

	it("should accept the invoke fn in the first argument position", function(){
		var check = false, mod = Module(function(){
			check = true;
		}, {

		});
		mod();
		expect(check).toBe(true);
	});

	it("should init itself", function(){
		var check = false, mod = Module({
			init: function(){
				check = true;
			}
		});

		expect(check).toBe(true);
	});

	it("should be able to reference itself", function(){
		var mod = Module({
			init: function(){
				expect(this).not.toBe(mod); // mod isn't defined as of init
			},
			check: function(){
				expect(this).toBe(mod);
			}
		});
		mod.check();
	});

	it("should be able to clone itself", function(){
		var check = 0,
			mod = Module(function(){
				check++;
			}),
			mod2 = mod.create();
			mod2();
		expect(check).toBe(1);
	});

	it("could be used with q as then", function(){
		var check = [], 
			Q = core.Q,
			mod = Module(function(){
				this.then();
			}, {
				init: function(){
					expect(true).toBe(true);
					this.then = this.then || Q.installer(this);
				}
			});

		mod.then(function(){
			check.push(1);
		});

		mod();

		expect(check).toEqual([1]);

		var mod2 = mod.create();
		mod2();

		expect(check).toEqual([1,1])
	});

	it("could use Q for init", function(){
		var Q = core.Q,
			Init = Module.clone(),
			Mod = Module.clone();

		Init.assign({
			_name: "Init",
			init: function(){
				console.log('init.init');
				this.fn = this.fn || this.invoke;
				this.invoke = this.exec;
				this.then = this.then || Q.installer(this.parent);
			},
			exec: function(){
				console.dir(this);
				if (this.fn)
					this.fn.apply(this.parent, arguments);
				this.then.exec.apply(this.then, arguments);
				// this.then.aply(arguments);
			}
		});

		Mod.assign({
			_name: "Mod"
		});

		expect(Mod.invoke.parent).toBe(Mod);
		expect(Mod.invoke).toBe(Mod.create);
		Mod.init = Init(function(){console.log('mod.init')}, {parent: Mod});
		// Mod.init.parent = Mod;
		// Mod.init = function(){console.log('mod.init')};
		Mod.init.then(function(){console.log('mod.init.then')});
		Mod.init.then(function(){console.log('mod.init.then')});
		Mod.init.then(function(){console.log('mod.init.then')});
		var mod1 = Mod();
		var mod2 = Mod();

		var Mod2 = Mod.clone();
		var mod22 = Mod2();
	});

	xit("can be cloned to stay in Factory form", function(){
		var Item = Module.clone();
		Item.assign({

		});

		var Module2 = window.Module2 = Module.clone();
		Module2.type = 'Module2';
		Module2._name = 'Module2';

			var Thenable = Module.clone();
			Thenable.assign({
				// invoke is still create
				type: 'Thenable',
				_name: "Thenable",
				ctx: 'self',
				init: function(/*fn, parent*/){
					// console.log('thenable.init');
					// console.dir(this);
					// if (fn)
					// 	this.fn = fn;

					// if (parent)
					// 	this.parent = parent;

					this.cbs = this.cbs || []; // brand new for brand new, reuse for clones

					this.invoke = this.thenExecSwitch;
				},
				thenExecSwitch: function(cb){
					// console.dir(this);
					if (typeof cb === 'function')
						this.then(cb);
					else
						this.exec.apply(this, arguments);
				},
				then: function(cb){
					this.cbs.push(cb);
				},
				exec: function(){
					// note:  thenable is self bound, with reference to parent
					// at this point, we change ctx to parent
					if (this.fn)
						this.fn.apply(this.parent, arguments);
					for (var i = 0; i < this.cbs.length; i++){
						this.cbs[i].apply(this.parent, arguments);
					}
				},
				deleteCtx: false
			});

			// Thenable();

		Module2.thenable = function(name, fn){
			// this[name] = Thenable(fn, this);
			this[name] = Thenable({ fn: fn, parent: this, _name: name });
				// conversion from init(fn, parent) signature (which was just assigning anyway)
				// to using auto-assign with named args
					// this second way is much more cohesive to iterative cloning when we can't
					// pass args to init in the same way (the args need to already be there) <--
		};

		Module2.thenable('init', function(){
			// console.log('Module2.init');
		});

		Module2.init.then(function(){
			// console.log('init.then');
		});

		
		Module2.sub = Module.clone();
		Module2.sub.parent = Module2;
		Module2.sub.init = function(){ 
			// console.log('Module2.sub.init');
		};

		Module2.thenable('test', function(){
			// console.dir(this);
		});

		var m2 = Module2.create({ _name: "m2" });
		var obj = { _name: 'obj', test: m2.test };
		obj.test.then(function(){
			expect(this).toBe(m2);
			// console.dir(this);
		});
		obj.test();

		m3 = Module2.clone();
		m3.thenable('init', function(){
			expect(this).toBe(m3);
		});
		m3.init.then(function(){
			// console.log('m3.init.then');
			expect(this).toBe(m3);
		});
		m3.init();

		/*
		thenables need special treatment for cloning
			a) to recreate DVBs
			b) to bind to parent
				and if bind to parent, do it automatically

				if sub.parent = this, clone it, reassign parent to new clone

		Also, auto init by Module is a little annoying... 
		*/
	});

	xit("could be used for thenable?", function(){
		var thenable = function(fn){
			var t = Module(function(cb){
				if (typeof cb === 'function')
					t.then(cb);
				else
					t.exec.apply(this, arguments);
			}, {
				then: function(cb){
					t.cbs.push(cb);
				},
				exec: function(){
					if (t.fn)
						t.fn.apply(this, arguments);
					for (var i = 0; i < t.cbs.length; i++){
						t.cbs[i].apply(this, arguments);
					}
				}
			});

			// meh - DVBs aren't cloneable!!!

			t.cbs = [];

			if (fn)
				t.fn = fn;

			return t;
		};

		var check = false, mod = Module({
			init: thenable(function(){
				console.log('mod.init');
				check = true;
				// expect(this).toBe(mod);
			}),
			check1: function(){
				expect(this).toBe(mod);
			},
			check2: function(){
				expect(this).toBe(mod2);
			}
		});

		mod.sub = Module(function(){
			expect(this).toBe(mod.sub);
		}, {
			ctx: mod,
			parent: mod,
			init: function(){
				console.log('mod.sub.init');
			}
		});

		expect(check).toBe(true);
		mod.check1();

		check = false;
		var mod2 = mod.create();
		expect(check).toBe(true);
		mod2.check2();
	});

	xit("should allow subs", function(){
		var invoked = false,
			sub = false,
			sib = false,
			subMod = false,
			subModSub = false,
			backRef = false,
			mod = Module(function(){
				expect(this).toBe(mod);
				invoked = true;
				this.sub();
			}, {
				ctx: 'self',
				sub: function(){
					sub = true;
					this.sib();
				},
				sib: function(){
					sib = true;
					this.subMod();
				},
				subMod: Module(function(){
						subMod = true;
						expect(this).toBe(mod.subMod);
						expect(this.parent).toBe(mod);
						this.subModSub();
					}, {
						ctx: 'self',
						subModSub: function(){
							subModSub = true;
							this.parent.backRef();
						},
						parent: mod // PROBLEM: mod is undefined here
				}),
				backRef: function(){
					backRef = true;
				}
			});

			mod.subMod.parent = mod;

		mod();
		expect(invoked).toBe(true);
		expect(sub).toBe(true);
		expect(sib).toBe(true);
		expect(subMod).toBe(true);
		expect(subModSub).toBe(true);
		expect(backRef).toBe(true);


		mod.assign({
			sub: function(){
				sub = false;
			}
		});

		mod();

		expect(sub).toBe(false);
	});

	xit("should clone itself", function(){
		var Mod1 = Module(function(){
			console.log(this._name);
			this.a();
			this.b();
			this.c();
		}, {
			ctx: "self",
			a: function(){
				console.log('a');
			},
			b: function(){
				console.log('b');
			},
			c: function(){
				console.log('c');
			}
		});

		var mod1 = Mod1.clone();
		mod1._name = 'yo';
		mod1();

		var Mod2 = Mod1.clone();
		Mod2.assign({
			_name: "Mod2",
			b: function(){
				console.log('b replaced');
			}
		});
		Mod2();
	});

	
});