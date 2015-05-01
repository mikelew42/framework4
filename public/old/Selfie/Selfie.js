;(function(){
	var core = window.core = window.core || {};
	
	var Selfie = core.Selfie = function(){
		var fn = function(){
			if (fn.debug)
				debugger;
			return fn.invoke.apply(fn, arguments);
		};
		fn.Base = Selfie;
		return fn;
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

			if (fn.debug)
				debugger;

			// fn.ret.apply(ctx, fn.invoke.apply(ctx, fn.args.apply(ctx, arguments)));
			return fn.invoke.apply(ctx, arguments);
		};
		fn.Base = Invoker;
		return fn;
	};

})();