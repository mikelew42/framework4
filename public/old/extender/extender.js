;(function(){
	var core = window.core = window.core || {};
	
	var utils = core && core.utils,
		isArray = utils.isArray,
		isObject = utils.isObject,
		isValue = utils.isValue,
		isFunction = utils.isFunction,
		isDefined = utils.isDefined,
		Selfie = utils.Selfie,
		assign = utils.assign,
		extend = core.extend,
		parentalClone = utils.parentalClone;

	var Base = Selfie() || {};
	Base.invoke = Base.clone = function(){
		// var c = utils.parentalClone(this, false, true);
		var c = utils.getCloneBase(this);
		if (arguments[0] && arguments[0].parent){
			c.parent = arguments[0].parent;
			delete arguments[0].parent;
		}
		c = utils.parentalClone(this, c, true);
		if (arguments.length && c.extend) c.extend.apply(c, arguments);
		if (c.cloned) c.cloned.apply(c, arguments);
		return c;
	};
	Base.extend = extend.clone({parent: Base});
	Base.cloned = function(){
		this.invoke = this.clone;
		// this.extend.apply(this, arguments);
	}; 

	var extender = core.extender = Base();
	extender.cloned = function(){
		this.invoke = this.extend;
		// this.extend.apply(this, arguments);
	};

	var Extender = core.Extender = Base({ _name: "Extender" });
		// at this point, Extender.invoke = clone
	Extender.cloned = function(){
		this.cloned = function(){
			// console.log(this._name + " cloned");
			this.invoke = this.extend;
			// this.extend.apply(this, arguments);
		};
		// this.extend.apply(this, arguments);
	};
	// returns an ExtenderFactory


// down here, Extender.clone is called first, then these args are extended onto the clone,
// and then the cloned function runs.

// so, the above Extender.cloned doesn't run below... in fact, there's no reason to use Extender for Q...
// however, if I want to extend Q2... what needs to happen?

// Q2.clone vs ...?
// After Q2 is created, its invoke would be.. clone
// But, if we clone Q2, then it will run its cloned function, unless we override it..


	var Q2 = core.Q2 = Extender({
		_name: "Q2",
		cloned: function(){ // this runs after Extender is cloned, before Q2 is invoked
			// console.log(this._name + " cloned");
			this.cloned = this.instantiate;
		},
		instantiate: function(){
			this.invoke = this.combo;
			this.then = this.append;
			this.init && this.init.apply(this, arguments);
		},
		init: function(){
			this.execCount = 0;
			this.ccbs = this.ccbs || [];
			this.cbs = parentalClone(this.ccbs);
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


	// here, init is a Q
	// alternatively, init could have a Q (init.then) which maps to a similar API
	var Init = core.Init = Q2.clone({
		_name: "Init",
		cloned: function(){
			this.cloned = this.instantiate;
		},
		condition: function(){
			return this.execCount > 0;
		}
	});

	var Once = core.Once = Init.clone({
		_name: "Once",
		cloned: function(){ this.cloned = this.instantiate; }
	});

})();