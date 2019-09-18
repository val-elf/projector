export class Defer {
	constructor(){
		this.promise = new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}

	resolve(...props){
		this.resolve(props);
	}

	reject(...props){
		this.reject(props);
	}

}

module.exports = {
	defer: function(){
		return new Defer();
	},
	isPromise: function(promise){
		return !!promise.then;
	},
	when: function(promise, resolver, rejecter ){
		var res = new Defer();
		if(this.isPromise(promise)){
			promise.then((result)=>{
				resolver && resolver(result);
				res.resolve(result);
			}, (error)=>{
				rejecter && rejecter(error);
				res.reject(error);
			});
		} else {
			if(promise) resolver(promise);
			else rejecter(promise);
		}
		return res.promise;
	},
	all: function(promises){

	}
}

