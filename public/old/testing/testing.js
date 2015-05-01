;(function($){

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
	Extender = core.Extender,
	module = core.module,
	Module = core.Module,
	GetSet = core.GetSet,
	View = core.View;

	var Item = Module({
		view: {}
	});

	Item.view.parent = Item;

	// Item.view.

	
	$(function(){
		var $container = $("<div></div>").appendTo("body");
		
	});

})(jQuery);