;(function(){
	var core = window.core = window.core || {};

	var utils = core && core.utils,
		isArray = utils.isArray,
		isObject = utils.isObject,
		isValue = utils.isValue,
		isFunction = utils.isFunction,
		isDefined = utils.isDefined,
		Selfie = utils.Selfie;

	var StdClone = Selfie();

	StdClone.std = function(value, base){
		if (!this.isCloneable(value))
			return value;

		base = base || this.getBase(value);

		this.stdLoop(value, base);

		// base.init && base.init();
		return base;
	};

	StdClone.std2 = function(value, base, skipCustom){
		if (!skipCustom && value && value.clone)
			return value.clone(base);

		if (!isDefined(value) || isValue(value) || (this.isFunction(value) && !value.Base))
			return value;
		
		base = 	base || 
				(value.Base && value.Base()) || 
				(isObject(value) && {}) || 
				(isArray(value) && []);

		for (var i in value){
			if (i !== 'parent'){
				base[i] = StdClone.std2(value[i]);
			}
		}

		return base;
	};

	StdClone.parental = function(value, base){
		if (!this.isCloneable(value))
			return value;

		base = base || this.getBase(value);

		this.parentalLoop(value, base);

		return base;
	};

	StdClone.parentalLoop = function(value, base){
		for (var i in value)
			this.cloneChild(value, i, base);
	};

	StdClone.custom = function(value, base){
		if (this.hasOwnClone(value))
			return value.clone(base);
		// return this.std(value, base);
		return this.parental(value, base);
	};

	StdClone.stdLoop = function(value, base){
		for (var i in value)
			this.cloneProperty(value, i, base);
	};

	StdClone.cloneProperty = function(value, i, base){
		if (i === 'parent')
			return false;
		base[i] = this.custom(value[i]);
	};

	StdClone.cloneChild = function(parent, childName, newParent){
		var child = parent[childName];

		if (childName === 'parent')
			return false;

		// if child uses .parent reference
		if (child && child.parent){

			// and .parent references this parent
			if (this.childReferencesParent(parent, child)){

				// recreate .parent reference to new parent
				if (child.installer)
					newParent[childName] = child.installer(newParent);
				else
					this.genericInstaller(parent, childName, newParent);
			} else {
				newParent[childName] = child;
			}
		}
		// maybe we should only clone if child references parent?
		// this way, we can just set the parent reference to indicate we want to clone
		// otherwise, we need to make sure all non-cloneables have an existing parent reference, which might be ok also
		else
			newParent[childName] = this.custom(child);
	};

	StdClone.genericInstaller = function(parent, childName, newParent){
		var newChild = newParent[childName] = this.custom(parent[childName]);
		newChild.parent = newParent;
		newChild.init && newChild.init();
	};

	StdClone.childReferencesParent = function(parent, child){
		return !!(child && child.parent === parent);
	};

	StdClone.cloneChild.deepLog = true;

	StdClone.stdLoop.deepLog = true;

	StdClone.getBase = function(value){
		var base;
		if (this.hasOwnBase(value))
			base = value.Base();
		else if (this.isObject(value))
			base = {};
		else if (this.isArray(value))
			base = [];
		return base;
	};

	StdClone.getBase.deepLog = true;

	StdClone.hasOwnBase = function(value){
		return !!(value && value.Base);
	}

	StdClone.hasOwnClone = function(value){
		return !!(value && value.clone);
	};

	StdClone.isCloneable = function(value){
		return this.isDefined(value) && !this.isValue(value) && (!this.isFunction(value) || this.isCloneableFunction(value));
	};

	StdClone.isCloneable.deepLog = true;

	StdClone.isCloneableFunction = function(value){
		return !!value.Base;
	};

	StdClone.isDefined = function(value){
		return typeof value !== 'undefined';
	};

	StdClone.isObject = function(value){
		return typeof value === "object" && !this.isArray(value);
	};

	StdClone.isArray = function(value){
		return toString.call(value) === '[object Array]';
	};

	StdClone.isValue = function(value){
		return ['boolean', 'number', 'string'].indexOf(typeof value) > -1;
	};

	StdClone.isFunction = function(value){
		return typeof value === 'function';
	};

	StdClone.clone = function(){
		return this.std(this);
	};

	StdClone.create = function(){
		var c = this.clone();
		c.init();
		return c;
	};

	StdClone.init = function(){
		this.invoke = this.custom;
	};

	StdClone.invoke = StdClone.create;

	core.StdClone = StdClone.clone();





	var Clone = StdClone.clone();

	Clone.installer = function installer(parent){
		var c = this.clone();
		if (parent)
			c.parent = parent;
		c.init();
		return c;
	};

	Clone.init = function init(){
		// console.count('clone.init');
		// could clone the Clone module, and override init for a particular use case, like
		// skipping the Q...
		if(!this.skipThenable && core.Q && core.Q.installer){
			this.then = this.then || core.Q.installer(this);
		}
		if (this.parent)
			this.invoke = this.oo;
		else 
			this.invoke = this.custom;
	};

	Clone.oo = function oo(base){
		return this.oospecial(this.parent, base);
	};

	Clone.oospecial = function special(value, base){
		base = base || this.getBase(value) || Selfie();

		this.initFirst(value, base);
		this.cloneSecond(value, base);
		this.rulesThird(value, base);
		this.specialLoop(value, base);
		if (this.then)
			this.then.exec.apply(this.then, [base, value]);
		return base;
	};

	Clone.initFirst = function(value, base){
		if (value.init){
			if (value.init.installer)
				base.init = value.init.installer(base);
			else
				base.init = Clone.custom(value.init);
		}
	};

	Clone.cloneSecond = function(value, base){
		base.clone = this.installer(base);
	};

	Clone.rulesThird = function(value, base){
		var rule;
		this.propertiesToSkip = [];
		for (var i in this.rules){
			rule = this.rules[i];
			
			if (typeof rule === 'function')
				this.rules[i].apply(this, arguments);
			
			// console.log('custom rule for', i);
			this.propertiesToSkip.push(i);
		}
	};

	Clone.rules = {
		parent: false
	};

	Clone.specialLoop = function specialLoop(value, base){
		for (var i in value){
			// skip our custom rules
			if (this.propertiesToSkip.indexOf(i) > -1)
				continue;
			
			this.cloneChild(value, i, base);
		}
	};

	Clone.invoke = Clone.installer;

	core.Clone = Clone;

	var simpleClone = utils.simpleClone;

	var Clone2 = Selfie();
	Clone2.clone = function(){
		var c = simpleClone(this, false, true);
		if (c.cloned)
			c.cloned.apply(c, arguments);
		return c;
	};
	Clone2.cloned = function(){
		// extend and shit
		// set .invoke
	};
	Clone2.parentalClone = function(value, base, skipCustom){
		var child;
		if (!skipCustom && value && value.clone)
			return value.clone(base);

		if (!isDefined(value) || isValue(value) || (this.isFunction(value) && !value.Base))
			return value;
		
		base = 	base || 
				(value.Base && value.Base()) || 
				(isObject(value) && {}) || 
				(isArray(value) && []);

		for (var i in value){
			if (i === 'parent')
				continue;
			child = value[i];
			if (child && child.parent){
				// this is an embedded child, recreate the pref
				if (child.parent === value){
					if (child.clone){
						base[i] = child.clone({parent: base});
					} else {
						base[i] = Clone2.parental(child);
						base[i].parent = base;
					}
				// this child has a different parent, reassign the reference
				} else {
					base[i] = child;
				}
			} else {
				base[i] = Clone2.parental(child);
			}
		}

			// this.cloneChild(value, i, base);

		return base;
	};

	Clone2.cloneChild = function(parent, childName, newParent){
		var child = parent[childName];

		if (childName === 'parent')
			return false;

		// if child uses .parent reference
		if (child && child.parent){

			// and .parent references this parent
			if (this.childReferencesParent(parent, child)){

				// recreate .parent reference to new parent
				if (child.installer)
					newParent[childName] = child.installer(newParent);
				else
					this.genericInstaller(parent, childName, newParent);
			} else {
				newParent[childName] = child;
			}
		}
		// maybe we should only clone if child references parent?
		// this way, we can just set the parent reference to indicate we want to clone
		// otherwise, we need to make sure all non-cloneables have an existing parent reference, which might be ok also
		else
			newParent[childName] = this.custom(child);
	};
/* More gradually build up these clone recipes, and clearly document their usage */
	// Clone2.

})();