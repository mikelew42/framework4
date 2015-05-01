describe("core.utils", function(){
	var utils = core && core.utils,
		isArray = utils.isArray,
		isObject = utils.isObject,
		isValue = utils.isValue,
		isFunction = utils.isFunction,
		isDefined = utils.isDefined;

	it("should exist", function(){
		expect(utils).toBeDefined();
	});

	describe("isArray", function(){
		it("should identify an array", function(){
			expect(isArray([])).toBe(true);
			expect(isArray({})).toBe(false);
		});
	});
	
	describe("isObject", function(){
		it("should identify an object", function(){
			expect(isObject({})).toBe(true);
			expect(isObject([])).toBe(false);
			expect(isObject(function(){})).toBe(false);
		});
	});

	describe("isFunction", function(){
		it("should identify a function", function(){
			expect(isFunction(function(){})).toBe(true);
			expect(isFunction({})).toBe(false);
		});
	});

	describe("isValue", function(){
		it("should identify a bool, num, or string", function(){
			expect(isValue(true)).toBe(true);
			expect(isValue(false)).toBe(true);
			expect(isValue(3)).toBe(true);
			expect(isValue("yep")).toBe(true);
			expect(isValue({})).toBe(false);
			expect(isValue([])).toBe(false);
			expect(isValue(function(){})).toBe(false);
		});
	});

	describe("parentalClone", function(){
		it("should recreate prefs", function(){
			var pclone = utils.parentalClone;
			expect(pclone).toBeDefined();

			var p = { pProp: 1, pRef: { pRefProp: 2 } };
			p.sub = { parent: p, prop: 5, ref: {refProp: 6}};
			p.sub.ref.parent = p.sub;

			var klone = pclone(p);

			expect(klone.pProp).toBe(1);
			expect(klone.pRef).not.toBe(p.pRef);
			expect(klone.pRef).toEqual(p.pRef);

			// here's the magic
			expect(klone.sub.parent).toBe(klone);
			expect(klone.sub.prop).toBe(5);
			expect(klone.sub.ref).toEqual(p.sub.ref);
			expect(klone.sub.ref).not.toBe(p.sub.ref);

			// recursively reassign prefs
			expect(klone.sub.ref.parent).toBe(klone.sub);
		});
	});

});