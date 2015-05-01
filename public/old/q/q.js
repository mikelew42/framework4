;(function(){
	var core = window.core = window.core || {};
	
	var clone = core.Clone(),
		Clone = core.Clone.clone();

	Clone.skipThenable = true;

	var Selfie = function(){
		var fn = function(){
			if (fn.debug)
				debugger;
			return fn.invoke.apply(fn, arguments);
		};
		fn.Base = Selfie;
		return fn;
	};

	// This standalone isn't really "then", its just a queue/series/fn.

	var Q = core.Q = Selfie();
	
	Q.clone = Clone.installer(Q);

	Q.installer = function(parent){
		var c = this.clone();
		c.parent = parent;
		c.init();
		return c;
	};



	Q.create = function(){
		var c = this.clone();
		c.init();
		return c;
	};

	Q.invoke = Q.create;

	Q.init = function(){
		this.cbs = this.cbs || [];
		this.invoke = this.combo;
	};

	Q.combo = function(cb){
		if (typeof cb === 'function')
			return this.append(cb);
		else
			return this.exec.apply(this, arguments);
	};

	Q.append = function(cb){
		var q = this;
		this.cbs.push(cb);
		return {
			remove: function(){
				q.remove(cb);
			}
		};
	};

	Q.remove = function(cb){
		var i = this.cbs.indexOf(cb);
		if (i > -1)
			this.cbs.splice(i, 1);
	};

	Q.exec = function(){
		var last;
		for (var i = 0; i < this.cbs.length; i++){
				// could append last to the args as { last: last }
			last = this.cbs[i].apply(this.parent || this, arguments);
		}
		return last;
	};

	Q.aply = function(){
		return this.exec.apply(this, arguments);
	};
})();