;(function(){
	var core = window.core = window.core || {};
	
	var clone = core && core.Clone(),
		Clone = core.Clone;

	var assign = function(base, ass1, ass2){
		var arg;
		for (var j = 1; j < arguments.length; j++){
			arg = arguments[j];
			for (var i in arg)
				base[i] = arg[i];
		}
		return base;
	};

	assign.installer = function(base){
		base.assign = function(){
			var args = Array.prototype.slice.call(arguments, 0);
			args.unshift(this);
			assign.apply(this, args);
			return this;
		};
		// base.assign.clone = assign.installer;
	};

	var Invoker = function(){
		var fn = function(){
			var ctx;
			if (fn.ctx){
				if (fn.ctx === 'this')
					ctx = this;
				else if (fn.ctx === 'self')
					ctx = fn;
				else
					ctx = fn.ctx
			} else {
				ctx = this;
			}
			// fn.ret.apply(ctx, fn.invoke.apply(ctx, fn.args.apply(ctx, arguments)));
			return fn.invoke.apply(ctx, arguments);
		};
		fn.Base = Invoker;
		return fn;
	};

	var Module = core.Module = Invoker();

	Module._name = "Module";
	Module.ctx = "self";
	assign.installer(Module);
	Clone.installer(Module);

	Module.create = function(){
		var c = this.clone();
		c.init && c.init.apply(c, arguments);
		return c;
	};

	Module.invoke = Module.create;

	Module.init = function(fn, ass1, ass2){
		var args;

		this.init.resetCtx.call(this);
		
		if (typeof fn === 'function'){
			this.invoke = fn;
			args = Array.prototype.slice.call(arguments, 1);
			if (args.length)
				this.assign.apply(this, args);
		} else if (arguments.length) {
			this.assign.apply(this, arguments);
		}
		return this;
	};

	Module.init.resetCtx = function(mod){
		delete this.ctx;
	};

	Module.sub = function(name){
		var args = Array.prototype.slice.call(arguments, 1);
		args.push({ parent: this, ctx: 'self' });
		this[name] = Module.apply(Module, args);
		return this;
	};

	Module.sub('init', function(){
		this.resetCtx();
		this.handleArgs.apply(this, arguments);
		return this.parent;
	}, {
		resetCtx: function(){
			console.log(this.parent);
			delete this.parent.ctx;
		},
		handleArgs: function(fn, ass1, ass2){
			if (typeof fn === 'function'){
				this.invoke = fn;
				args = Array.prototype.slice.call(arguments, 1);
				if (args.length)
					this.assign.apply(this, args);
			} else if (arguments.length) {
				this.assign.apply(this, arguments);
			}
		}
	});

	Module.init = Module(function(fn, ass1, ass2){
		var args;

		this.resetCtx();

	}, {
		ctx: 'self',
		init: function(){

		}
	});

	var Module2 = core.Module2 = function(fn, ass1, ass2){
		var mod = Invoker(), args;
		assign.installer(mod);
		mod.clone = OOClone();


		if (typeof fn === 'function'){
			mod.invoke = fn;
			args = Array.prototype.slice.call(arguments, 1);
			if (args.length)
				mod.assign.apply(mod, args);
		} else if (arguments.length) {
			mod.assign.apply(mod, arguments);
		}
		return mod;
	};



	var Factory = core.Factory = function(){

	};
})();