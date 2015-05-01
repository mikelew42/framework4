describe("Collection", function(){
	var Collection = core && core.Collection;

	it("should exist", function(){
		expect(Collection).toBeDefined();
	});

	it("should return a collection with append/prepend functions", function(){
		var coll = Collection();
		expect(coll.append).toBeDefined();
	});

	it("should be installable on a base", function(){
		var base = {},
			coll = Collection(base);

		expect(coll).toBe(base);
	});

	it("#append should accept items, and attach them based on anon count or id", function(){
		var coll = Collection(),
			items = [1, 'two', false, { id: 'swanson' }],
			itemCheck = [];

		coll.append.apply(coll, items);

		coll.each(function(v, i, n){
			itemCheck.push(v);
			console.log(v, i, n);
		});

		expect(itemCheck).toEqual(items);


	});
});