;(function(){
	var core = window.core = window.core || {};
	
	var utils = core.utils = {
		isArray: function(value){
			return toString.call(value) === '[object Array]';
		},
		isObject: function(value){
			return typeof value === "object" && !utils.isArray(value);
		},
		isValue: function(value){
			return ['boolean', 'number', 'string'].indexOf(typeof value) > -1;
		},
		isFunction: function(value){
			return typeof value === 'function';
		},
		isDefined: function(value){
			return typeof value !== 'undefined';
		},
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
		simpleClone: function(value, base, skipCustom){
			if (!skipCustom && value && value.clone)
				return value.clone(base);

			if (!utils.isDefined(value) || utils.isValue(value) || (utils.isFunction(value) && !value.Base))
				return value;
			
			base = 	base || 
					(value.Base && value.Base()) || 
					(utils.isObject(value) && {}) || 
					(utils.isArray(value) && []);

			for (var i in value){
				if (i !== 'parent'){
					base[i] = utils.simpleClone(value[i]);
				}
			}

			return base;
		},
		getCloneBase: function(value){
			return (value.Base && value.Base()) || 
					(utils.isObject(value) && {}) || 
					(utils.isArray(value) && []);
		},
		parentalClone: function(value, base, skipCustom){
			var child, nthParent;
			if (!skipCustom && value && value.clone)
				return value.clone(base);

			if (!utils.isDefined(value) || utils.isValue(value) || (utils.isFunction(value) && !value.Base))
				return value;
			
			base = 	base || utils.getCloneBase(value);

			if (value.config)
				base.config = value.config.clone({parent: base});

			for (var i in value){
				if (i === 'parent' || i === 'config')
					continue;
				child = value[i];
				if (child && child.parent){
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
	};

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

})();