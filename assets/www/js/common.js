$(document).bind("mobileinit", function(){
	$.extend($.mobile, {
		loadingMessage: '正在载入数据...',
		pageLoadErrorMessage: '数据载入错误',
		pageLoadErrorMessageTheme: 'a',
		defaultPageTransition: 'none',
		allowCrossDomainPages: true,
		//pushStateEnabled: false,
		touchOverflowEnabled: true
	});
	$.mobile.listview.prototype.options.headerTheme = 'a';
	$.lyricsData = null;
});

$('#home').live('pageshow', function(){
	$.mobile.hidePageLoadingMsg();
	$(this).find('ul[data-role="listview"] a').bind('tap', function(event){
		$.mobile.showPageLoadingMsg();
	});
});
$('#list').live('pageshow', function(event){
	if( $.lyricsData == null ){
		$.mobile.showPageLoadingMsg();
		var cont = $('#listCont');
		$.ajax({
			url: 'lyrics.xml',
			type: 'get',
			dataType: 'xml',
			success: function(xml){
				$.lyricsData = $(xml).find('lyrics');
				initList(cont);
				$.mobile.changePage(cont, {changeHash: false});
			},
			error: function(){
				alert('无法载入数据！');
			}
		});
	}
});
$('#author, #type').live('pageshow', function(event){
	if( $.lyricsData == null ){
		$.mobile.showPageLoadingMsg();
		var page = $(this), pid = page.attr('id');
		var cont = $('#' + pid + 'Cont');
		$.ajax({
			url: 'lyrics.xml',
			type: 'get',
			dataType: 'xml',
			success: function(xml){
				xml = $(xml);
				$.lyricsData = xml.find('lyrics');
				switch( pid ){
				case 'author':
					$.lyricsAuthor = xml.find('authors');
					initAuthor(cont);
					break;
				case 'type':
					$.lyricsType = xml.find('types');
					initType(cont);
					break;
				}
				$.mobile.changePage(cont, {changeHash: false});
			},
			error: function(){
				alert('无法载入数据！');
			}
		});
	}
});


$('#search').live('pageinit', function(){
	if( $.lyricsData == null ){
		$.ajax({
			url: 'lyrics.xml',
			type: 'get',
			dataType: 'xml',
			success: function(xml){
				$.lyricsData = $(xml).find('lyrics');
			},
			error: function(){
				alert('无法载入数据！');
			}
		});
	}
});
$('#searchSubmit').live('click', function(){
	var key = $.trim($('#searchKey').val());
	if( key.length >= 2 ){
		$.mobile.showPageLoadingMsg();
		$('#searchResult').remove();
		var result = $('#tempSearchResult').clone();
		result.attr('id', 'searchResult').appendTo('body');
		var type = $('input[name="search-type"]:checked').val();
		searchKey(key, type, $('ul[data-role="listview"]', result), function(){
			changePage($('#searchResult'));
		});
	}
});
function searchKey(key, type, ul, callback){
	if( $.lyricsData == null ){
		setTimeout(function(){
			searchKey(key, type, ul, callback);
		}, 200);
	} else {
		var r = 0;
		$.lyricsData.find('>lyric').each(function(){
			var ly = $(this), text = ly.find(type).text();
			if( text.indexOf(key) >= 0 ){
				appendLyricList(ly, ul);
				r ++;
			}
		});
		if( r == 0 ){
			ul.replaceWith('<p style="text-align:center;padding:10px;">没有查询到结果</p>');
		}
		if( $.isFunction(callback) ) callback();
	}
}

$('#detail').live('pagecreate', function(){
	var hash = location.hash.replace('#', '').split('_');
	var id = parseInt(hash[0]), from = hash[1];
	$(this).data('lyricID', id);
	if( $.lyricsData == null ){
		$.ajax({
			url: 'lyrics.xml',
			type: 'get',
			dataType: 'xml',
			success: function(xml){
				$.lyricsData = $(xml).find('lyrics');
				createDetail(id, from);
			},
			error: function(){
				alert('无法载入数据！');
			}
		});
	}
});
$('#detail').live('pageshow', function(){
	if( $.lyricsData == null ){
		$.mobile.showPageLoadingMsg();
	}
});
function createDetail(id, from){
	var lyric = $.lyricsData.find('>lyric[id=' + id + ']'), name = lyric.find('name').text();
	var html = '<div class="detail-block"><p><span style="float:right;">作者: ' + lyric.find('author').text() + '</span>' + lyric.find('type').text() + '</p></div>';
	html += '<h2>' + name + '</h2>', sname = lyric.find('sname').text();
	if( sname != '' ) html += '<h3 class="detail-title">' + sname + '</h3>';
	html += '<p class="detail-content">' + lyric.find('content').text().replace(/\n/g, '<br />') + '</p>';
	html += '<div class="detail-block"><h3>注解</h3><p>' + lyric.find('word').text().replace(/\n/g, '<br />') + '</p></div>';
	html += '<div class="detail-block"><h3>评析</h3><p>' + lyric.find('comment').text().replace(/\n/g, '<br />') + '</p></div>';
	html += '<div class="detail-block"><h3>白话译文</h3><p>' + lyric.find('meaning').text().replace(/\n/g, '<br />') + '</p></div>';
	var pic = '00' + lyric.find('image').text();
	html += '<div style="text-align:center;margin:0 -15px -15px -15px;"><img src="pic/' + pic.slice(pic.length - 3) + '1.jpg" alt="" /></div>';

	var page = $('#tempDetail').clone();
	page.attr('id', 'detail_' + id).find('.lyric-detail').append(html).end().find('h1').text(name);
	page.find('a[data-icon="grid"]').attr('href', from + '.html');
	page.appendTo('body');
	page.find('div[data-role="header"] a').bind('click', function(){
		$.mobile.showPageLoadingMsg();
	});
	changePage(page, {changeHash: false});
}

function changePage(page, options, delay){
	setTimeout(function(){
		$.mobile.changePage(page, options || {});
	}, delay || 50);
}

function appendLyricList(lyric, list, author){
	var id = lyric.attr('id'), page = list.attr('page') || '';
	var html = '<li><a href="detail.html#' + id + '_' + page + '" data-ajax="false"><h2>' + lyric.find('name').text() + '</h2>', sname = lyric.find('sname').text();
	if( sname != '' ) html += '<p>' + sname + '</p>';
	if( author !== false ) html += '<p class="ui-li-aside">' + lyric.find('author').text() + '</p>';
	html += '</a></li>';
	list.append(html);
}
function initList(cont, ctx){
	var list = $('ul[data-role="listview"]', cont);
	$.lyricsData.find('>lyric' + (ctx || '')).each(function(){
		appendLyricList($(this), list);
	});
}
function initType(cont){
	var list = $('ul[data-role="listview"]', cont);
	$.lyricsType.find('>type').each(function(i){
		var ly = $(this);
		list.append('<li><a href="#' + (i + 1) + '"><h2>' + ly.find('name').text() + '</h2></a></li>');
	});
	$('div[id^=typeList_]').live('pagehide', function(){
		$(this).remove();
	});
	list.find('a').bind('click', function(){
		$.mobile.showPageLoadingMsg();
		var a = $(this), id = a.attr('href').replace('#', '');
		var page = $('#typeList').clone().attr('id', 'typeList_' + id).appendTo('body');
		page.find('h1').text(a.text());
		initList(page, '[type="' + id + '"]');
		$('a[back]', page).bind('click', function(){
			$.mobile.showPageLoadingMsg();
			changePage($('#typeCont'), {changeHash: false});
		});
		changePage(page, {changeHash: false});
	});
}
function initAuthor(cont){
	var list = $('ul[data-role="listview"]', cont);
	$.lyricsAuthor.find('>author').each(function(i){
		var author = $(this);
		list.append('<li><a href="#' + (i + 1) + '"><h2>' + author.find('name').text() + '</h2><p class="ui-li-aside">' + author.find('year').text() + '</p></a></li>');
	});
	$('div[id^=authorList_]').live('pagehide', function(){
		$(this).remove();
	});
	list.find('a').bind('click', function(){
		$.mobile.showPageLoadingMsg();
		var a = $(this), id = a.attr('href').replace('#', ''), author = $.lyricsAuthor.find('author[id=' + id + ']');
		var page = $('#authorList').clone().attr('id', 'authorList_' + id).appendTo('body'), aname = author.find('name').text();
		page.find('h1').text(aname);
		page.find('.lyric-detail').append('<div class="detail-block"><h3>' + aname + '<small style="margin-left:0.8em;font-weight:normal;">' + author.find('year').text() + '时期诗人</small></h3>' +
			'<p>' + author.find('comment').text() + '</p></div>');
		initList(page, '[author="' + id + '"]');
		$('a[back]', page).bind('click', function(){
			$.mobile.showPageLoadingMsg();
			changePage($('#authorCont'), {changeHash: false});
		});
		changePage(page, {changeHash: false});
	});
}


// PhoneGap
$(function(){
	deviceReady();
});
function exitApp(){
    navigator.notification.confirm(
        '你确定要退出唐诗三百首吗？',
        function(buttonIndex){
        	if( buttonIndex == 2 ){
        		navigator.app.exitApp();
        	}
        },
        '提示',
        '取消,确定'
    );
}
function deviceReady(callback){
	document.addEventListener("deviceready", function(){
		document.addEventListener("menubutton", exitApp, false);
		document.addEventListener("backbutton", function(){
			var pn = $('body').attr('pageName');
			if( pn == 'home' ){
				exitApp();
			} else {
				$.mobile.showPageLoadingMsg();
				try{
					var back = $.mobile.activePage.find('a[data-icon="grid"]');
					if( back.length > 0 ){
						var href = back.attr('href');
						if( href.indexOf('#') == 0 ){
							back.trigger('click');
						} else {
							location.href = href;
						}
					} else {
						location.href = 'home.html';
					}
				} catch(e){
					location.href = 'home.html';
				}
			}
		}, false);
		document.addEventListener("searchbutton", function(){
			$.mobile.showPageLoadingMsg();
			location.href = 'search.html';
		}, false);
	}, false);
}
