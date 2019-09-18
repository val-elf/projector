module.exports = {
	alphas: ['a','e','i','o','u','y'],
	betas: ['b','c','d','f','g','h','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],

	genName: function(minLength, maxLength, cap){
		minLength = minLength || 3;
		maxLength = maxLength || minLength + 10;
		var length = Math.round(Math.random() * (maxLength - minLength)) + minLength, res = "", btc = true, btcCount = 0;

		for(var i = 0; i< length; i++){
			if( Math.random() * 100 > (20 - btcCount) ) {
				btcCount = 0;
				btc = !btc
			} else
				btcCount ++;

			var arr = btc? this.betas : this.alphas;

			if(btc) btcCount++; else btcCount = 0;
			res += arr[Math.floor(Math.random() * arr.length)];

			if(!i && cap) res = res.toUpperCase();
		}
		return res;
	},

	genPhrase: function(minWords, maxWords, maxLength, cap){
		minWords = minWords || 1;
		maxWords = maxWords || 1;
		var rwords = Math.round(Math.random() * (maxWords - minWords)) + minWords, res = [];
		for(var i = 0; i< rwords; i++) {
			res.push(this.genName(3, maxLength, !i && cap));
		}
		return res.join(' ');
	}
}