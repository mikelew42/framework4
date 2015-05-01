describe("core.Module", function(){
	var Module = core && core.Module,
		module = core.module;

	it("should exist", function(){
		expect(Module).toBeDefined();
		expect(Module.invoke).toBe(Module.fork);
		expect(module.invoke).toBe(module.clone);
	});

	it("module should clone and initialize upon invocation", function(){
		var check, mod = module({
			init: function(){
				check = true;
			},
			prop: 5
		});
		expect(check).toBe(true);
		expect(mod.prop).toBe(5);
	});

	it("Module should clone to make a factory that then initializes", function(){
		var check = false, Mod = Module({
			init: function(){
				check = true;
			}
		});
		expect(check).toBe(false);
		var mod = Mod();
		expect(check).toBe(true);
	});

	it("returned Factory from Module should be cloneable", function(){
		var check = false, Mod = Module.clone({
			init: function(){ check = true; }
		});
		expect(check).toBe(false);
		var Mod2 = Mod.clone();
	});

	it("should be forkable by sidestepping the cloned fn", function(){
		var check, Mod = Module({
			init: function(){
				check = true;
			}
		});

		expect(check).not.toBe(true);
		expect(Mod.invoke).toBe(Mod.clone);
		var mod = Mod();
		expect(mod.invoke).toBe(mod.extend);
		expect(mod.cloned).toBe(mod.instantiate);
		expect(check).toBe(true);
	});

	it("should not clone cbs added with dnc", function(){
		var Mod = Module();


		var mod = Mod(), check = 0;
		mod.init.then(function(){
			check++;
			// console.log('clone me');
		});
		mod.init.dnc(function(){
			check++;
			// console.log('do not clone me');
		});
		expect(check).toBe(2);
		var mod2 = mod.clone();
		expect(check).toBe(3);
	});

	it("should allow sub modules", function(){
		var MyBase = Module({
			_name: "MyBase",
			init: function(){
				// console.log('MyBase.init');
			}
		});

		var check = 0;
		MyBase.sub1 = Module({
			parent: MyBase,
			_name: "MyBase.sub1",
			init: function MyBase_sub1_init(){
				// console.log('sub1.init');
				check++;
			}
		});
		expect(check).toBe(0);

		var myBase = MyBase();
		expect(check).toBe(1);

		MyBase.sub2 = Module({
			parent: MyBase,
			_name: "MyBase.sub2",
			init: function MyBase_sub2_init(){
				// console.log('sub2.init');
			}
		});

		MyBase.sub1.config.fn = function(){
			if (this.parent && this.parent.sub2)
				this.parent.sub2.init.dnc(this.init);
		};
		var myBase2 = MyBase();
		expect(myBase2({prop: 72}).prop).toBe(72);
// console.log("+++++++++++");
		var myBase2_clone = myBase2.clone();
	});
});

describe("core.GetSet", function(){
	var GetSet = core.GetSet,
	module = core.module;

	it("should be defined", function(){
		expect(GetSet).toBeDefined();
	});

	it("should get and set its value", function(){
		var getset = GetSet();

		expect(getset()).toBe(undefined);
		getset(5);
		expect(getset()).toBe(5);
		getset("str");
		expect(getset()).toBe("str");
	});

	it("should have a change event", function(){
		var getset = GetSet(), check = 0;

		getset.change(function(){
			check++;
			expect(this).toBe(getset);
		});

		expect(check).toBe(0);
		getset(5);
		expect(check).toBe(1);
		getset(5);
		expect(check).toBe(1);
	});

	it("should invoke upon extend", function(){
		var mod = module({
			val: GetSet()
		});

		mod.val(5);
		expect(mod.val()).toBe(5);
		mod({val: 6});
		expect(mod.val()).toBe(6);
	});
});

$(function(){
	describe("View", function(){
		var $container = $("<div></div>").appendTo("body"),
			View = core.View;
		it("should be defined", function(){
			expect(View).toBeDefined();
		});
		
		it("lets create a data-view link", function(){
			var data = core.module({
				view: {},
				content: core.GetSet({value: 25})
			});
			data.view.parent = data;
			data.view.single = View({
				parent: data,
				$insertion: $container,
				init: function(){
					var self = this;
					if (this.$el && this.parent.content.change)
						this.parent.content.change.dnc(function(){
							self.$el.html(this.value);
						});
				}
			});

			data.content('24');
			window.data = data;

			var data2 = data.clone();
			data2.content("yee haw");
			expect(data2.view.parent).toBe(data2);
			expect(data2.view.single.parent).toBe(data2);
			expect(data.view.single).not.toBe(data2.view.single);
			expect(data.view.single.$el).not.toBe(data2.view.single.$el);
		});
	});
});