;(function(){
	var core = window.core = window.core || {};

	var clone = core.clone,
		Module = core.Module;
	
	var Collection = core.Collection = Module(function(){
		var coll = Module(function(){

		}, {

		});
	}, { 
		ctx: "self",
		PropNames: function(base){
			base = base || Module();
			base.items = [];
			base.__anon_count = 0;
			base.append = function(item1, item2){
				var item, name;
				for (var i = 0; i < arguments.length; i++){
					item = arguments[i];

					if (item.id)
						name = item.id;
					
					else 
						name = 'anon' + ++base.__anon_count;
					
					base[name] = item;
					base.items.push(name);
				}
			};
			base.prepend = function(){
				var item;
				for (var i = arguments.length - 1; i > -1; i--){
					item = arguments[i];
					base.items.unshift(item);
					if (item.id)
						base[item.id] = item;
				}
			};
			base.each = function(fn){
				for (var i = 0; i < base.items.length; i++){
					fn.apply(base, [base[base.items[i]], i, base.items[i]]);
				}
			};
			return base;
		}
	});

	Collection.invoke = Collection.PropNames;
})();