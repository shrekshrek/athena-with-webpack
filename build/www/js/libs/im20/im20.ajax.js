$.md5 = require('md5');

/**
 * Communication class
 */
var Communication = {
	baseUrl:'',
	serverTime:0,
	offsetTime:0,
	inited:false,

	/**
	 * 初始化后台通信类（必须，需放在所有调用之前）
	 * @para url	域名地址
	 * @para stime	服务器时间
	 */
	init:function( url, stime ){
		this.baseUrl = url;
		if( stime ){
			this.inited = true;
			this.serverTime = stime;
		}else{
			$.ajax({
				url: this.baseUrl+'/getServerTime',
				type:'POST',
				data:{},
				success: function( msg ){
					Communication.inited = true;
					Communication.serverTime = msg;
					Communication.offsetTime = Communication.cTime() - Communication.serverTime;
				},
				error: function(e, jqxhr, settings, exception){
					Communication.inited = true;
					Communication.serverTime = Communication.cTime();
					Communication.offsetTime = 0;
				}
			});
		}
	},

	/**
	 * 调用后台数据
	 * @para action	接口地址
	 * @para post	POST至后台的参数
	 * @para success	成功回调
	 * @para error	错误回调
	 * @para para	回调传递参数
	 */
	run:function( act, post, success, error, para ){
		if( !this.inited ){
			setTimeout( function(){
				Communication.run( act, post, success, error, para )
			}, 1000 );
			return;
		}
		if( !post ) post = {};
		post.rnd = this.cTime() - this.offsetTime;
		post.mdk = this.makeMdk( post );
		if( !success ) success = function( msg ){};
		if( !error ) error = function( e, jqxhr, settings, exception, para ){
			alert( '网络超时，请稍候再试！' );
		};
		$.ajax({
			url: this.baseUrl+act,
			type:'POST',
			data:post,
			dataType:'json',
			success: function( msg ){
				success.call( null, msg, para, post );
			},
			error: function(e, jqxhr, settings, exception){
				error.call( null, e, jqxhr, settings, exception, para, post );
			}
		});
	},
	makeMdk:function( para ){
		var toSort = [];
		for( var i in para ){
			toSort.push( i );
		}
		toSort = toSort.sort( function(a, b){
			var res;
			if( a == b )
				res = 0;
			else if( a > b )
				res = 1;
			else
				res = -1;
			return res;
		});
		var toCode = [];
		for( i=0; i<toSort.length; i++ ){
			toCode.push( para[toSort[i]] );
		}
		toCode.push( this.key );
		var ret = $.md5( toCode.join( '_' ) );
		return ret;
	},
	cTime:function(){
		return parseInt( Date.parse(new Date()) / 1000 );
	},
	key:'b26d3576038e6ec1a00fc8daaad78b32'
};

module.exports = Communication;
