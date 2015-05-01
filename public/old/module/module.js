;(function(){
	var core = window.core = window.core || {};
	
	var clone = core && core.Clone(),
		Clone = core.Clone.clone();

	var utils = core && core.utils,
		isArray = utils.isArray,
		isObject = utils.isObject,
		isValue = utils.isValue,
		isFunction = utils.isFunction,
		isDefined = utils.isDefined,
		Selfie = utils.Selfie,
		assign = utils.assign,
		extend = core.extend.clone(),
		clone = core.Clone.clone();


	var Base = {};
	Base.clone = 1;

	var Extender = Selfie();
	Extender.extend = extend.clone({parent: Extender});
	Extender.clone = function(){
		var c = utils.parentalClone(this, false, true);
		if (c.cloned) c.cloned.apply(c, arguments);
		return c;
	};
	Extender.cloned = function(){
		this.invoke = this.extend;
	};

	var Module = core.Module = Selfie();

	Module._name = "Module";
	// Module.ctx = "self";
	assign.installer(Module);
	Module.clone = Clone.installer(Module);
	// Module.clone.rules.invoke = false;

	Module.create = function(fn, ass1, ass2){
		var c = this.clone(), args;

		if (this.deleteCtx){
			delete c.ctx;
			delete c.deleteCtx;
		}

		if (typeof fn === 'function'){
			c.invoke = fn;
			args = Array.prototype.slice.call(arguments, 1);
		} else {
			args = arguments;
		}

		if (args.length) {
			c.assign.apply(c, args);
		}

		if (c._queueInitAfterParent){
			delete c._queueInitAfterParent;
			c.parent.init.then(function(){
				c.init.apply(c, args);
			});
		} else {
			c.init && c.init.apply(c, args);
		}
		return c;
	};

	var create = Module.create = Selfie();
	create.parent = Module;
	create.invoke = function(fn, ass1, ass2){
		var c = this.parent.clone(), args;
		if (typeof fn === 'function'){
			c.invoke = fn;
			args = Array.prototype.slice.call(arguments, 1);
		} else {
			args = arguments;
		}

		if (args.length) {
			c.assign.apply(c, args);
		}
		c.init && c.init();
		return c;
	};

	Module.clone.then(function(newClone, parent){
		if (parent.invoke === parent.create)
			newClone.invoke = newClone.create;
	});

	// maybe this can be Module.clone.then.uncloneable(fn);


	// Module.deleteCtx = true;

	// this needs to be in .init, but if we're creating a Factory, then 
	// we don't want to init...
	// what if we can use Module.clone.then(fn(){ this.parent.invoke = this.parent.create; })
	Module.invoke = Module.create;
/*

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
	*/
})();