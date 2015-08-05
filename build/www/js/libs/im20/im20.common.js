/**
 * JS Listener class
 */
var ImListener = {
	hooks:{},
	check:function( type ){
		if( !this.hooks[type] ){
			this.hooks[type] = [];
		}
	},

	/**
	 * 注册事件
	 * @para type	事件名
	 * @para func	事件回调函数
	 * @para para	回调预置参数
	 * @para once	是否只执行一次
	 */
	add:function( type, func, para, once ){
		this.check( type );
		if( !func ) return false;
		var obj = {
			'func':func,
			'para':para ? para : {},
			'once':once == undefined ? true : once
		};
		this.hooks[type].push( obj );
	},

	/**
	 * 移除事件
	 * @para type	事件名
	 * @para func	事件回调函数
	 */
	remove:function( type, func ){
		this.check( type );
		if( !type ){
			for( var i in this.hooks ){
				this.hooks[i] = [];
			}
		}else{
			if( func ){
				var tmpH = [];
				for( var i=0; i<this.hooks[type].length; i++ ){
					if( this.hooks[type][i].func == func )
						continue;
					tmpH.push( this.hooks[type][i] );
				}
				this.hooks[type] = tmpH;
				//this.hooks[type] = [];
			}else{
				this.hooks[type] = [];
			}
		}
	},

	/**
	 * 移除事件
	 * @para type	事件名
	 * @para res	回调参数
	 */
	dispatch:function( type, res ){
		if( !type || !this.hooks[type] ) return;
		for( var i=0; i<this.hooks[type].length; i++ ){
			var func = this.hooks[type][i].func;
			var para = this.hooks[type][i].para;
			var once = this.hooks[type][i].once;
			func.call( null, res, para );
			if( once ){
				this.remove( type, func );
			}
		}
	}
};


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
			Util.printR(e);
			Dialog.close();
		};
		$.ajax({
			url: this.baseUrl+act,
			type:'POST',
			data:post,
			dataType:'json',
			success: function( msg ){ if( msg.errorspecific && parseInt(msg.errorspecific.error_code)==10022 ){ location.href='/tmall.html'; return; } success.call( null, msg, para, post ); },
			error: function(e, jqxhr, settings, exception){ error.call( null, e, jqxhr, settings, exception, para, post ); }
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
		var ret = jQuery.md5( toCode.join( '_' ) );
		return ret;
	},
	cTime:function(){
		return parseInt( Date.parse(new Date()) / 1000 );
	},
	key:'R5a39A0dK3c66O4Z'
};


/**
 * Dialog class
 */
var Dialog = {
	zIndex:101,

	/**
	 * 初始化弹出框类（必须，需放在所有调用之前）
	 */
	init:function(){
		Util.autoScroll();

		$('.dialogCloseBt,.close-btn').on( 'click', function(){
			Dialog.close();
			//console.log($(this));
		});
	},

	/**
	 * 生成弹出框
	 * @para id		弹出框ID
	 * @para _html	弹出框HTML
	 * @para _style	自定CSS
	 * @para _class	自定Class
	 */
	build:function( id, _html, _style, _class ){
		if( !$('#'+id).attr('id') ){
			$('body').append( '<div id="'+id+'" class="commonDialog '+_class+'" style="'+_style+'"></div>' );
		}
		$('#'+id).html( _html );
	},

	/**
	 * 显示弹出框
	 * @para id			弹出框ID
	 * @para _width		宽度
	 * @para _height	高度
	 * @para func		弹出框显示时回调函数
	 */
	show:function( id, _width, _height, func ){
		$('#'+id).show();
		this.showCover();

		if( !_width ) _width = 500;
		if( !_height ) _height = $('#'+id).height();
		var _left = ($(window).width() - _width) / 2;
		var _top = this.fixTop( id );
		$('#'+id).css( 'top', _top );
		$('#'+id).css( 'left', _left );
		$('#'+id).css( 'position', 'absolute' );
		var zindex = $('#'+id).css( 'z-index');
		if( !zindex || zindex == 'auto' ) $('#'+id).css( 'z-index', this.zIndex );
		//$('#'+id).css( 'width', _width );
		//$('#'+id).fadeIn( 100 );

		ImListener.add( 'autoScroll', function( res ){
			$('#'+id).css( 'top', Dialog.fixTop( id ) );
		}, {}, false);

		if( func ) func.call();

		this.zIndex++;
	},
	showCover:function(){
		if( !$('#dialogCover').attr('id') ){
			$('body').append( '<div id="dialogCover" style="position:absolute; background-color:#000000; filter:alpha(opacity=50);moz-opacity:0.5;opacity:0.5; top:0; left:0; width:100%; height:'+$(document).height()+'px; z-index:100"></div>' );
		}
		$('#dialogCover').show();
	},

	/**
	 * 关闭弹出框
	 * @para func		弹出框关闭时回调函数
	 */
	close:function( func ){
		$('.commonDialog,.dialog').fadeOut( 100 );
		this.closeCover();
		if( func ) func.call();
	},
	closeCover:function(){
		$('#dialogCover').fadeOut( 100 );
	},

	fixTop:function( id ){
		var _top = ( $(window).height() - $('#'+id).height() ) / 2 + $(window).scrollTop();
		return _top;
	},

	/**
	 * 自定Alert弹出框
	 * @para title	标题
	 * @para msg	内容
	 * @para sec	自动关闭时间
	 * @para func	关闭回调
	 */
	dAlert:function( title, msg, sec, func ){
		title = title ? title : '发生错误!';
		padding = 'padding:80px 40px 0;';
		if( msg )
			padding = 'padding:70px 40px 0;';
		else
			msg = '';
		var html = '<div class="dialog_box2 pngpic"><div class="close_box"><a href="javascript:void(0)" class="alertCloseBt"><img src="'+DIR_PUBLIC+'images/pop/close_box.jpg" /></a></div><div style="'+padding+'"><div style="font-size:20px;color:#eee;padding:0 0 20px">'+title+'</div><div style="font-size:14px;color:#eee;line-height:20px;">'+msg+'</div></div></div>';
		this.build( 'alertDiv', html, '', '' );
		this.show( 'alertDiv', 564 );
		$('#alertDiv').css( 'z-index', 1000 );

		if( sec && func ){
			$('.alertCloseBt').click( func );
			setTimeout( func, sec * 1000 );
		}else if(sec){
			func = function(){ Dialog.close(); };
			$('.alertCloseBt').click( func );
			setTimeout( func, sec * 1000 );
		}else{
			$('.alertCloseBt').click( function(){ Dialog.close(); } );
		}
	}
};


var Template = {

	leftDelimiter:'{',
	rightDelimiter:'}',
	variableStart:'$',

	fetch:function( tpl, vars ){
	},

	parse:function( tpl ){
	}
};




/**
 * 工具类
 */
var Util = {
	loadJs:function( path ){
		document.write( '' );
	},

	/**
	 * 将两个对象合并
	 */
	marginObj: function( objs, objd ){
		if(!objs) objs = {};
		if(!objd) objd = {};
		for( var i in objd ){
			objs[i] = objd[i];
		}
		return objs;
	},

	/**
	 * 打印对象内容
	 */
	printR:function( obj ){
		var str  = '';
		var type = Util.getType(obj);
		if( type == 'string' || type == 'number' || type == 'undefined' || type == 'boolean' ){
			str += '' + obj + "<br>\n";
		}else{
			for( var i in obj ){
				var tp = Util.getType(obj[i]);
				if( tp == 'function' ) continue;
				str += '' + i + ' - ' + obj[i] + "<br>\n";
			}
		}
		$('body').append( str );
	},

	getType:function( o ) {
	    var _toS = Object.prototype.toString;
	    var _types = {
	        'undefined': 'undefined',
	        'number': 'number',
	        'boolean': 'boolean',
	        'string': 'string',
	        '[object Function]': 'function',
	        '[object RegExp]': 'regexp',
	        '[object Array]': 'array',
	        '[object Date]': 'date',
	        '[object Error]': 'error'
	    };
	    return _types[typeof o] || _types[_toS.call(o)] || (o ? 'object' : 'null');
	},

	autoScroll:function(){
		$(window).scroll( function(){
			var res = {top:$(this).scrollTop(), left:$(this).scrollLeft()};
			ImListener.dispatch( 'autoScroll', res );
		} );
	}
};

Dialog.init();


/**
 * 复制到剪贴板
 */
var copytoclip=1;
function copyToClipboard(theField,isalert) {
	var tempval=document.getElementById(theField);//不能用$否则会发生冲突
	if (navigator.appVersion.match(/\bMSIE\b/)){
		tempval.select();
		if (copytoclip==1){
			therange	=	tempval.createTextRange();
			therange.execCommand("Copy");
			if(isalert!=false)alert("复制成功。");
		}
		return;
	}else{
		alert("您使用的浏览器不支持此复制功能，请使用Ctrl+C或鼠标右键。");
		tempval.select();
	}
}


//新窗口弹出
function openWind(url) {
	var top = (document.body.clientHeight - 420) / 2;
	var left = (document.body.clientWidth - 520) / 2;
	window.open(url,'window','height=420, width=680, toolbar =no, menubar=no, scrollbars=yes, resizable=no,top='
							+ top
							+ ',left='
							+ left
							+ ', location=no, status=no');
}

/**
 * 公用登陆接口 1:renren,2:sina微博,3:qq微博,4:豆瓣,5,kaixin001,
 */
function connectLogin(type) {
	openWind("/User/getAuthUrl/type/" + type);
}