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
	clone = utils.parentalClone,
	Init = core.Init,
	Q = core.Q2,
	Extender = core.Extender;

	var Module = core.Module = Extender({
		// runs immediately
		cloned: function(){
			// sets Module.invoke = .fork, which overrides .cloned
			this.invoke = this.fork;
			// but, if Module.clone, then we instantiate..? that doesn't make sense...
			this.cloned = this.instantiate;
		},
		forkClonedHandler: function(){
			this.invoke = this.clone;
			this.cloned = this.instantiate;
		},
		fork: function(){
			var c = clone(this, false, true);
			c.cloned = c.forkClonedHandler;
			if (arguments.length && c.extend) c.extend.apply(c, arguments);
			if (c.cloned) c.cloned.apply(c, arguments);
			return c;
		},
		instantiate2: function(){
			this.invoke = this.extend;
			if (this.parent){
				if (this.config){
					if (this.parent.config && this.parent.config.then)
						this.parent.config.then(this.config);
					else
						this.config.apply(this, arguments);
				} else if (this.init){
					if (this.parent.init && this.parent.init.then)
						this.parent.init.then(this.init);
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
		instantiate: function(){
			this.invoke = this.extend;
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
		}
	});

	Module.init = Init({parent: Module});
	Module.config = core.Once({ 
		_name: "Config",
		parent: Module,
		fn: function(){
			this.init && this.init.apply(this, arguments);
		}
	});

	var module = core.module = Module({
		cloned: function(){
			this.invoke = this.clone;
			this.cloned = this.instantiate;
		}
	});

	var GetSet = core.GetSet = Module({
		value: undefined,
		_name: "GetSet",
		config: function(){
			this.invoke = this.getSet;
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
			if (this.value !== val){
				this.value = val;
				this.change();
				if (this.parent && this.parent.change)
					this.parent.change();
				return true;
			}
			return false;
		},
		extend: {
			oocustom: function(arg){
				if (isObject(arg))
					this.single(this.parent, arg);
				else
					this.parent.getSet(arg);
			}
		}
	});

	GetSet.change = Q({parent: GetSet});

	var View = core.View = Module({
		tag: "div",
		type: "View",
		init: function(){
			this.render();
		},
		render: function(){
			this.$el = $("<div>" + this.parent.content() + "</div>").appendTo(this.$insertion);
		}
	});


})();