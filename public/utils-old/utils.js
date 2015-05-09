;(function(){
	var core = window.core = window.core || {};
	
	var is = core.is = {
		arr: function(value){
			return toString.call(value) === '[object Array]';
		},
		obj: function(value){
			return typeof value === "object" && !is.arr(value);
		},
		val: function(value){
			return ['boolean', 'number', 'string'].indexOf(typeof value) > -1;
		},
		str: function(value){
			return typeof value === "string";
		},
		fn: function(value){
			return typeof value === 'function';
		},
		def: function(value){
			return typeof value !== 'undefined';
		},
		und: function(value){
			return typeof value === 'undefined';
		},
		mod: function(value){
			return !!value.Base;
		},
		simple: function(value){
			return is.val(value) || !is.def(value); // null, NaN, or other non-referential values?
		},
		plainFn: function(value){
			return is.fn(value) && !is.mod(value);
		},
		referential : function(){},
		clonable: function(){}
	};

	var utils = core.utils = {
		assign: function(base, ass1, ass2){
			var arg;
			for (var j = 1; j < arguments.length; j++){
				arg = arguments[j];
				for (var i in arg)
					base[i] = arg[i];
			}
			return base;
		},
		Selfie: function(){
			var fn = function(){
				if (fn.debug)
					debugger;
				return fn.invoke.apply(fn, arguments);
			};
			fn.Base = utils.Selfie;
			return fn;
		},
		returnable: function(value){
			return !is.def(value) || is.val(value) || (is.fn(value) && !value.Base);
		},
		simpleClone: function(value, base, skipCustom){
			if (!skipCustom && value && value.clone)
				return value.clone(base);

			if (utils.returnable(value))
				return value;
			
			base = base || utils.getCloneBase(value);

			for (var i in value){
				if (i !== 'parent'){
					base[i] = utils.simpleClone(value[i]);
				}
			}

			return base;
		},
		getCloneBase: function(value){
			return (value.Base && value.Base()) || 
					(is.obj(value) && {}) || 
					(is.arr(value) && []);
		},
		parentalClone: function(value, base, skipCustom){
			var child, nthParent;
			if (!skipCustom && value && value.clone)
				return value.clone(base);

			if (utils.returnable(value))
				return value;
			
			base = 	base || utils.getCloneBase(value);

			// consider copying all first, then doing the inits
			// this means mod.clone can't init... 
			// or, we use mod.copy to dupe without init, and then come back and instantiate later
			if (value.config){
				if (value.config.clone)
					base.config = value.config.clone({parent: base});
				else
					base.config = value.config;
			}
			if (value.init){
				if (value.init.clone)
					base.init = value.init.clone({parent: base});
				else
					base.init = value.init;
			}

			for (var i in value){
				if (i === 'parent' || i === "init" || i === 'config' || i === 'invoke')
					continue;
				child = value[i];
				if (child && child.parent){
					if (child.parent.getSet && child.parent.invoke === child.parent.combo){
						if (child.parent() === value){
							base[i] = child.clone({parent: base});
						} else if (nthP = utils.nthParentGetSet(child, value)){
							base[i] = child.clone({parent: utils.getNthParent(base, nthP)});
						}
					}
					// this is an embedded child, recreate the pref
					if (child.parent === value){
						if (child.clone){
							base[i] = child.clone({parent: base});
						} else {
							// base[i] = utils.parentalClone(child);
							base[i] = utils.getCloneBase(child);
							base[i].parent = base;
							utils.parentalClone(child, base[i]);
						}
					// this child has a different parent, reassign the reference
					} else if (nthP = utils.nthParent(child, value)){
						// n = 2
						if (child.clone){
							base[i] = child.clone({parent: utils.getNthParent(base, nthP)});
						} else {
							base[i] = utils.getCloneBase(child);
							base[i].parent = utils.getNthParent(base, nthP);
							utils.parentalClone(child, base[i]);
						}
					} else  {
						base[i] = child;
					}
				} else {
					base[i] = utils.parentalClone(child);
				}
			}

				// this.cloneChild(value, i, base);

			return base;
		},
		getNthParent: function(mod, n){
			var parent = mod;
			for (var i = 1; i < n; i++){
				parent = parent.parent.getSet ? parent.parent() : parent.parent;
			}
			return parent;
		},
		nthParent: function(child, parent){
			var nthP = 1;
			while(parent){
				if (child.parent === parent || (child.parent.getSet && child.parent() === parent))
					return nthP;
				else {
					if (parent.parent){
						parent = parent.parent.getSet ? parent.parent() : parent.parent;
						nthP++;
					}
					else return false;
				}
			}
		},
		tests: {
			obj: function(){
				return {
					propTrue: true,
					propFalse: false,
					propString: "str",
					propNum: 123,
					propObj: {
						propObjSub: 456
					},
					propArr: [7, "eight", false],
					propFn: function(){ return arguments; },
					propUnd: undefined
				};
			}
		},
		extend: function(base, ext1, ext2){
			var args;
			if (base && base.extend){
				args = Array.prototype.slice.call(arguments, 1);
				return base.extend.apply(base, args);
			}
			for (var i = 1; i < arguments.length; i++){
				base = utils.singleExtend(base, arguments[i]);
			}
			return base;
		},
		extendOO: function(base, ext1, ext2){
			for (var i = 1; i < arguments.length; i++){
				base = utils.singleExtend(base, arguments[i]);
			}
			return base;
		},
		invokeOnExtend: function(ext1, ext2){
			for (var i = 0; i < arguments.length; i++){
				base = utils.invokeOnExtendSingle(this, arguments[i]);
			}
			return base;
		},
		invokeOnExtendSingle: function(base, ext, baseP, extP){
			if (is.und(base) || is.val(base))
				return ext;
			else if (is.obj(ext))
				return utils.iterativeExtend(base, ext);
			else if (is.fn(base))
				return utils.invokeOnExtendFnExtend(base, ext, baseP, extP);
			else
				return ext;
		},
		invokeOnExtendFnExtend: function(base, ext, baseP, extP){
			if (is.fn(ext)){
				base.call(baseP || base, ext);
				return base;
			} else if (is.arr(ext)){
				base.apply(baseP || base, ext);
				return base;
			} else if (is.val(ext)){
				base.call(baseP || base, ext);
				return base;
			} else
				return ext;
		},
		singleExtend: function(base, ext, baseP, extP){
			if (is.und(base) || is.val(base))
				return ext;
			else if (is.obj(ext))
				return utils.iterativeExtend(base, ext);
			else if (is.fn(base))
				return utils.fnExtend(base, ext, baseP, extP);
			else
				return ext;
		},
		singleExtendCustom: function(base, ext, baseP, extP){
			if (base && base.extend)
				return base.extend.call(base, ext);
			else if (is.und(base) || is.val(base))
				return ext;
			else if (is.obj(ext))
				return utils.iterativeExtend(base, ext);
			else if (is.fn(base))
				return utils.fnExtend(base, ext, baseP, extP);
			else
				return ext;	
		},
		fnExtend: function(base, ext, baseP, extP){
			if (is.fn(ext))
				return ext;
			else if (is.arr(ext)){
				base.apply(baseP || base, ext);
				return base;
			} else if (is.val(ext)){
				base.call(baseP || base, ext);
				return base;
			} else
				return ext;
		},
		iterativeExtend: function(base, ext){
			for (var i in ext){
				base[i] = utils.singleExtendCustom(base[i], ext[i], base, ext);
				if (base[i] && base[i]._autoAdopt){
					if (base[i].parent && base[i].parent.getSet)
						base[i].parent(base);
					else
						base[i].parent = base;
					base[i]._name = i;
				}
			}
			return base;
		},
		ooclone: function(){
			var c = utils.getCloneBase(this);
			// assign parent reference before anything else, to allo ancestor lookup
			
				// this doesn't work if .parent is GetSet

			// if (arguments[0] && arguments[0].parent){
			// 	c.parent = arguments[0].parent;
			// 	delete arguments[0].parent;
			// }

			// clone/iterate
			c = utils.parentalClone(this, c, true);
			if (c.cloned) c.cloned.apply(c, arguments);
			if (arguments.length && c.extend) c.extend.apply(c, arguments);
			if (c.configInvoke) c.configInvoke();
			if (c.instantiate) c.instantiate.apply(c, arguments);
			return c;
		},
		ooconfigInvoke: function(){
			var _invoke, invoke;
			if (is.str(this.invoke)){
				this._invoke = this.invoke;
				this.invoke = this[this.invoke];
			}
			else if (is.str(this._invoke))
				this.invoke = this[this._invoke];
		},
		Cloner: function(){
			var cloner = utils.Selfie();

			cloner.invoke = cloner.clone = utils.ooclone;

			cloner.cloned = function(){
				this.invoke = this.clone;
			};

			return cloner;
		},
		ooextend: function(){
			var args = Array.prototype.slice.call(arguments, 0);
			args.unshift(this);
			utils.extendOO.apply(this, args);
			return this;
		},
		Extender: function(){
			var extender = utils.Cloner();
			extender.extend = utils.ooextend;
			extender.cloned = function(){ this.invoke = this.extend; };
			return extender;
		},
		ooinstantiate: function(){
			// this.invoke = this.extend;
			if (this.parent){
				if (this.config){
					if (this.parent.config && this.parent.config.dnc)
						this.parent.config.dnc(this.config);
					else
						this.config.apply(this, arguments);
				} else if (this.init){
					if (this.parent.init && this.parent.init.dnc)
						this.parent.init.dnc(this.init);
					else
						this.init.apply(this, arguments);
				}
			} else {
				if (this.config)
					this.config.apply(this, arguments);
				else
					this.init && this.init.apply(this, arguments);
			}
		},
		FFclone: function(){}
	};

	var Module = utils.Module = utils.Selfie();
	Module.clone = utils.ooclone;
	Module.clone = function(){
		var ret;
		if (this.log){
			console.group(this._name + ".clone");
			ret = utils.ooclone.apply(this, arguments);
			console.groupEnd();	
			return ret;	
		} else {
			return utils.ooclone.apply(this, arguments);
		}
	};
	Module.extend = utils.ooextend;
	Module.instantiate = utils.ooinstantiate;
	Module.invoke = "clone";
	Module.configInvoke = utils.ooconfigInvoke;
	Module.configInvoke();

	var assign = utils.assign;

	assign.installer = function(base){
		base.assign = function(){
			var args = Array.prototype.slice.call(arguments, 0);
			args.unshift(this);
			assign.apply(this, args);
			return this;
		};
		// base.assign.clone = assign.installer;
	};

	var clone = core.clone = Module({
		_name: "clone",
		invoke: "simple",
		simple: function(value, base){
			if (this.returnable(value))
				return value;
			
			base = base || this.getBase(value);

			this.iterate(value, base);

			return base;
		},
		iterate: function(value, base){
			for (var i in value)
				// if (i !== 'parent')
					// base[i] = this.invoke(value[i]);
					base[i] = this.simple(value[i]);
		},
		getBase: function(value){
			return (value.Base && value.Base()) || 
					(is.obj(value) && {}) || 
					(is.arr(value) && []);
		},
		returnable: function(value){
			return !is.def(value) || is.val(value) || (is.fn(value) && !value.Base);
		}
	});

	clone.custom = clone.clone({
		_name: "clone.custom",
		invoke: "custom",
		custom: function(value, base){
			if (value && value.clone)
				return value.clone(base);

			if (this.returnable(value))
				return value;

			base = base || this.getBase(value);

			this.iterate(value, base);

			return base;
		},
		iterate: function(value, base){
			for (var i in value)
				// if (i !== 'parent')
					base[i] = this.custom(value[i]);
		}
	});

	// this might not even be important for clone.oo
	clone.skip = clone.custom.clone({
		_name: "clone.skip",
		invoke: "simple"
		// note: iterate uses custom, because we're cloning the custom module here
	});

	clone.parental = clone.custom.clone({
		_name: "clone.parental",
		invoke: "parental",
		parental: function(value, base){
			if (value && value.clone)
				return value.clone(base);

			if (this.returnable(value))
				return value;
			
			base = 	base || this.getBase(value);

			this.iterate(value, base);

			return base;
		},
		iterate: function(value, base){
			var child, nthP;
			for (var i in value){
				if (i === 'parent' /* || i === "init" || i === 'config' || i === 'invoke' */)
					continue;
				child = value[i];
				if (child && child.parent){
					if (nthP = this.nthParent(child, value)){
						// n = 2
						if (child.clone){
							base[i] = child.clone({parent: this.getNthParent(base, nthP)});
						} else {
							base[i] = this.getBase(child);
							base[i].parent = this.getNthParent(base, nthP);
							this.parental(child, base[i]);
						}
					} else  {
						base[i] = child;
					}
				} else {
					base[i] = this.parental(child);
				}
			}
		},
		getNthParent: function(mod, n){
			var parent = mod;
			for (var i = 1; i < n; i++){
				parent = parent.parent;
			}
			return parent;
		},
		nthParent: function(child, parent){
			var nthP = 1;
			while(parent){
				if (child.parent === parent)
					return nthP;
				else {
					if (parent.parent){
						parent = parent.parent;
						nthP++;
					}
					else return false;
				}
			}
		}
	});

	// clone.parental.skip = clone.parental.clone({});
	// clone.parental.oo = clone.parental.skip.clone?

	clone.oo = clone.parental.clone({
		_name: "clone.oo",
		invoke: "oo",
		oo: function(){
			this.log && console.group(this._name + ".clone");
			var c = this.getBase(this.parent);
			// c = this.parentalClone(this, c, true);
			this.iterate(this.parent, c);
			// if (arguments.length && c.extend) c.extend.apply(c, arguments);
			if (c.configInvoke) c.configInvoke();
			// if (c.instantiate) c.instantiate.apply(c, arguments);
			// if (c.cloned) c.cloned.apply(c, arguments);
			return c;
		}
	});

	var Mod = utils.Selfie();
	Mod.clone = clone.oo.clone({parent: Mod});
	Mod.configInvoke = utils.ooconfigInvoke;
	Mod.invoke = "clone";
	Mod.configInvoke();

	utils.Mod = Mod;

	var Q = utils.Q = Module({
		_name: "Q",
		_autoAdopt: true,
		// invoke: 'combo', // not what we want - we want a delayed invoke --> combo
		init: function(){
			this._invoke = "combo"; // this allows invoke to remain .clone, and then queues it to be switched to "combo"
			this.then = this.append;
			this.execCount = 0;
			this.ccbs = this.ccbs || [];
			this.cbs = utils.parentalClone(this.ccbs);
		},
		combo: function(cb){
			if (typeof cb === 'function')
				return this.append(cb);
			else
				return this.exec.apply(this, arguments);
		},
		dnc: function(cb){
			return this.appendCB.apply(this, arguments);
		},
		appendCB: function(cb){
			var q = this;
			
			this.cbs.push(cb);

			if (this.condition && this.condition())
				this.applyCB(cb);

			return {
				remove: function(){
					q.remove(cb);
				},
				then: q.then
			};
		},
		append: function(cb){
			// defaults to clonable cb, use dnc for do not clone
			this.ccbs.push(cb);
			return this.appendCB(cb);
		},
		remove: function(cb){
			var i = this.cbs.indexOf(cb), j = this.ccbs.indexOf(cb);
			if (i > -1)
				this.cbs.splice(i, 1);
			if (j > -1)
				this.ccbs.splice(j, 1);
		},
		exec: function(){
			var last;
			if (this.fn)
				this.applyCB(this.fn, arguments);
			for (var i = 0; i < this.cbs.length; i++){
					// could append last to the args as { last: last }
				// last = this.cbs[i].apply(this.parent || this, arguments);
				last = this.applyCB(this.cbs[i], arguments);
			}
			this.execCount++;
			return last;
		},
		applyCB: function(cb, args){
			return cb.apply(this.parent || this, args);
		},
		aply: function(){
			return this.exec.apply(this, arguments);
		},
		extend: {
			// this could be set as the "oo" handler, if argument loop were kept..
			// but, you need a special flag for when to use this one during the iteration
			// 	  .. you wouldn't want all mods with .extend.oo to use that instead of doing a normal extend...
				// which wouldn't work for extend(value).
			oocustom: function(arg){
				if (isFunction(arg))
					this.parent.append(arg);
				else if (isObject(arg))
					this.single(this.parent, arg);
			}
		} // can't set this here, because this is an extender, and so extend-->invoke-->extend... is loop of death
	});

	var GetSet = utils.GetSet = Module({
		value: undefined,
		_name: "GetSet",
		_autoAdopt: true,
		config: function(){
			this._invoke = 'getSet';
			// careful, this needs to be run here and down there
			// this also means this.then shouldn't be cloned
			// this.then = this.change;
		},
		getSet: function(val){
			if (typeof val !== "undefined"){
				return this.set.apply(this, arguments);
			} else {
				return this.get.apply(this, arguments);
			}
		},
		get: function(){
			return this.value;
		},
		set: function(val){
			var old;
			if (this.value !== val){
				old = this.value;
				this.value = val;
				this.change({val: val, old: old}); // careful! don't pass a fn when trying to execute... val can be a fn!!
				if (this.parent && this.parent.change)
					this.parent.change();
				return true;
			}
			return false;
		},
		change: Q(),
		boot: Q({ condition: function(){ return typeof this.parent.value !== "undefined" } }),
		extend: utils.invokeOnExtend
	});

	GetSet.change.append(function(args){
		this.boot();
	});

	var Item = Module({
		_name: "Item"
	});

	var Sub = Module({
		_autoAdopt: true
	});

$(function(){

	var ListView = Module({
		_name:"ListView",
		_autoAdopt: true,
		cloned: function(){
			// this needs to be here before extend.. but if its before extend, its not
			// present when Module is cloned right now.
			this.parent = GetSet();
		},
		init: function(){
			var self = this;
			// see note above, cloned doesn't run on first pass
			this.parent = this.parent || GetSet();

			this.parent.boot(function(){
				self.initParent();
			});
			// if (this.parent && this.parent())
			// 	this.initParent();
			// else if (this.parent){
			// 	this.parent.change(function(){ self.initParent(); });
			// }
		},
		initParent: function(){
			var self = this;
			self.$el = $("<ul></ul>").prependTo("body");
			var items = this.parent().items;

			for (var i in items){
				self.$el.append("<li>" + items[i] + "</li>");
			}
			self.parent().change.dnc(function(val){
				self.$el.append("<li>" + val + "</li>");
			});
		}
	});

	var List = core.List = Module({
		_name:"List",
		items: [],
		append: function(val){
			this.items.push(val);
			this.change(val);
		},
		change: Q(),
		view: ListView() // comment to toggle view
	});

	List.append("xyz");

});


})();