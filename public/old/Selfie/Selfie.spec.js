describe("core.Selfie", function(){
	var Selfie = core && core.Selfie;

	it("should exist", function(){
		expect(Selfie).toBeDefined();
	});

	it("should return a function with base equal to Selfie", function(){
		var selfie = Selfie();
		expect(typeof selfie).toBe('function');
		expect(selfie.Base).toBe(Selfie);
	});

	it("should call invoke with self context when invoked", function(){
		var selfie = Selfie(), check = false;
		selfie.invoke = function(){ 
			check = true;
			expect(this).toBe(selfie);
		};
		selfie();
		expect(check).toBe(true);
	});
});