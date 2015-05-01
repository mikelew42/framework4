;(function(){
	var core = window.core = window.core || {};
	var utils = core && core.utils,
		isArray = utils.isArray,
		isObject = utils.isObject,
		isValue = utils.isValue,
		isFunction = utils.isFunction,
		isDefined = utils.isDefined,
		assign = utils.assign,
		Selfie = utils.Selfie,
		parentalClone = utils.parentalClone;


	var isModule = core.isModule = function(value){
		return !!value.Base;
	};

	var isSimpleFunction = core.isSimpleFunction = function(value){
		return isFunction(value) && !isModule(value);
	};

	var Extend = Selfie();

	var simpleClone = function(value, base, skipCustom){
		if (!skipCustom && value && value.clone)
			return value.clone(base);

		if (!isDefined(value) || isValue(value) || (isFunction(value) && !value.Base))
			return value;
		
		base = 	base || 
				(value.Base && value.Base()) || 
				(isObject(value) && {}) || 
				(isArray(value) && []);

		for (var i in value){
			if (i !== 'parent'){
				base[i] = simpleClone(value[i]);
			}
		}

		return base;
	};

	Extend.clone = function(){
		var c = simpleClone(this, false, true);
		if (c.cloned)
			c.cloned.apply(c, arguments);
		return c;
	};

	Extend.cloned = function(){
		var args = Array.prototype.slice.call(arguments, 0);
		args.unshift(this);
		// if (ext && ext.parent)
			// this.parent = ext.parent;
		Extend.std.apply(this, args);
		if (this.parent)
			this.invoke = this.oo;

		switch (this.mode){
			case "assign":
				this.single = this.assign;
				break;
			case "deep":
				this.single = this.deep;
				break;
			case undefined:
			default:
				this.single = this.magic;
		}
	};
	Extend.invoke = Extend.custom = function(base){
		if (base.extend)
			return base.extend.apply(base, arguments);
		else
			return this.std.apply(this, arguments);
	};

	Extend.std = function(base, ext1, ext2){
		var ret = base;
		for (var i = 1; i < arguments.length; i++){
			this.single(base, arguments[i]);
		}
		return base;
	};

	Extend.oo = function(ext1, ext2){
		var args;
		// if (this.invokeOnExtend) return this.parent.apply(this.parent, arguments);
		args = Array.prototype.slice.call(arguments, 0);
		args.unshift(this.parent);
		this.std.apply(this, args);
		return this.parent; // for chaining?
	};

	Extend.assign = function(base, ext){
		for (var i in ext)
			base[i] = ext[i];
	};

	Extend.deep = function(base, ext){
		for (var i in ext)
			if (isObject(ext[i]) && (isObject(base[i]) || isFunction(base[i]) || isArray(base[i])))
				this.custom(base[i], ext[i]);
			else
				base[i] = ext[i];
	};

	Extend.magic = function(base, ext){
		var baseValue, extValue;
		for (var i in ext){
			baseValue = base[i];
			extValue = ext[i];

			// check if POJO, and clone it.  currently, this just assigns objects, which may lead to unintentional object sharing
			// for example, if you extend multiple objects with the same config object, they'll all get a reference

			// but, what if we expect extend to assign our object? like, a jQuery object?
			// there really needs to be multiple implementations that build on each other...

			// it might be wise to use mod.extend({settings: clone(settings) })
			// rather than auto clone all incoming objects...
			if (!isDefined(baseValue) || isValue(baseValue)){
				// for now, lets assume assign, and we can clone externally for more control
				// if (isObject(extValue) && i !== 'parent')
					// base[i] = parentalClone(extValue);
				// else
					base[i] = extValue;
			} else if (isObject(extValue)){
				// base must be obj, arr, fn at this point?
				this.custom(base[i], extValue);
			} else if (isFunction(baseValue)){
				// if base has its own extend, we could use that.. however, 
				// if its a default extend, then it would just override
				// however, if its an 'invokeOnExtend', then we'd want to invoke
				// rather than assign...
				if(baseValue.extend && baseValue.extend.oocustom)
					baseValue.extend.oocustom(extValue);
				else if(isFunction(extValue))
					base[i] = extValue;
				else if (isArray(extValue))
					baseValue.apply(base, extValue);
				else
					baseValue.call(base, extValue);
			}
		}
	};

	// Clone it here to run the .cloned cb, setting up the invoke link
	core.extend = Extend.clone();
	
/*
	var _Simple = core._Simple = Selfie();

	assign.installer(_Simple);

	_Simple.clone = function(base){
		return simpleClone(this, base, true);
	};

	_Simple.invoke = function(){
		var c = this.clone();
		c.invoke = function(){
			var c = this.clone();
			// c.extend.apply(c, arguments);
			c.invoke = c.fn;
			c.init && c.init();
			return c;
		};
		// c.extend.apply(c, arguments);
		return c;
	};

	_Simple.fn = function(){};

	var _Installer = core._Installer = _Simple.clone();
	_Installer.installer = function(parent){
		var c = this.clone();
		if (parent)
			c.parent = parent;
		c.init && c.init();
		return c;
	};


	var Extend = core.Extend = _Simple();
	Extend.std = function(base, ext1, ext2){
		for (var i = 1; i < arguments.length; i++){
			this.single(base, arguments[i]);
		}
	};

	Extend.single = function(base, ext){
		for (var i in ext)
			this.prop(base, i, ext);
	};

	Extend.prop = function(base, i, ext){
		var baseValue = base[i],
			extValue = ext[i];

		if (!isDefined(baseValue) || isValue(baseValue)){
			base[i] = ext[i];
		} else if (isFunction(baseValue)){
			if(!isModule(baseValue)){
				// normal function
				if (!isDefined(extValue) || isValue(extValue)){

				}
			}
		}
	};

	var OOExtend = _Installer();
	OOExtend.init = function(){
		if (this.parent)
			this.invoke = this.oo;
		else
			this.invoke = this.std;
	};
	*/
})();