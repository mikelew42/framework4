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

	it("should assign incoming props onto itself, and invoke the .invoke fn", function(){
		var check = false, mod = Module({
			invoke: function(){
				check = true;
				expect(this).toBe(obj);
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

	it("should allow subs", function(){
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