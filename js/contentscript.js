/*
 * Copyright (c) 2010 The Chromium Authors. All rights reserved.  Use of this
 * source code is governed by a BSD-style license that can be found in the
 * LICENSE file.
 */
/*var regex = /sandwich/;

// Test the text of the body element against our regular expression.
if (regex.test(document.body.innerText)) {
  // The regular expression produced a match, so notify the background page.
  alert("~~~~~~" + $("a").length);
  chrome.extension.sendRequest({}, function(response) {});
} else {
  // No match was found.
}*/
//alert(window.location.href);
//		$.get("/mine/",function(){mine = window.location.href;alert(mine)});
chrome.extension.sendRequest({eventName:"normal"}, function(response) {
	$("#google_ads_slot_group_home_top_right").hide();	
	var backupNames = {};
	if(localStorage.doubanBackupNames){
		backupNames = JSON.parse(localStorage.doubanBackupNames);
	}

	var groupClassify = {};
	if(localStorage.doubanGroupClassify){
		groupClassify = JSON.parse(localStorage.doubanGroupClassify);
	}

	function groupClassifyShow(){
		$(".aside .indent:not(.obssin)").after("<div id='classify'></div>");		
		$.get("/group/mine/", function(dat){
			var t=0;
			for(var name in groupClassify){
				
				$("#classify").append("<h2>" + name +  "</h2><div id='myclassify_" + t + "' class='indent obssin'></div></div><div class='clear'>");				
				for(var i=0; i<groupClassify[name].length; i++){
					var node = $('dl dd a[href="' + groupClassify[name][i] + '"]',dat)[0].parentNode.parentNode;
					$("#myclassify_" + t).append(node);
				}
				t++;
			}
		});
	}

	function groupClassifyConfigure(){
		$(".article").prepend("<div id='classify'></div>").
			prepend("<h2>我的小组分类 &nbsp; ·&nbsp;·&nbsp;·&nbsp;·&nbsp;·&nbsp;·&nbsp;" 
				+ " <a id='addClassify' href='javascript:void(0)'>( 添加分类 )</a> "
				+ "<a href='javascript:void(0)' id='saveBtn'>( 保存 )</a><span>请在小组分类设置完毕后点击保存，否则你就白忙活啦！</span></h2>");
		
		var t = 0;
		for(var name in groupClassify){

			$("#classify").append("<div><span class='newName' style='position: relative; bottom:-20px;left:10px;background-color: White'>" + name +  "</span><span class='closeGroup' style='position: relative; float:right;bottom:-20px;cursor:pointer'>x </span><div id='myclassify_" + t + "'  class='groupClassify indent obssin' style='text-align: center; padding:10px;min-height:100px;margin-top:10px; border:1px solid #ccc;'><span style='line-height: 100px;'>&nbsp;</span></div></div><div class='clear'></div>");
			
			
			$("#myclassify_" + t)[0].style.height = parseInt(groupClassify[name].length/7+1)*100 + "px";
			for(var i=0; i<groupClassify[name].length; i++){
				var node = $('dl dd a[href="' + groupClassify[name][i] + '"]')[0].parentNode.parentNode;
				$("#myclassify_" + t).append(node);
			}
			t++;
		}
		
		var modifyGroupName = function(){
			var preValue = this.innerHTML;
			this.innerHTML = "";
			var input = document.createElement("input");
			input.type="text";
			$(input).blur(function(){
				for(var i=0; i<groupClassify.length; i++){
					if(groupClassify[this.value]){
						alert("已经存在同样名称的分组。");
						return;
					}
				}
				if(this.value != ""){					
					groupClassify[this.value] = groupClassify[preValue]?groupClassify[preValue]:[];
					delete groupClassify[preValue];
					this.parentNode.innerHTML = this.value;
					//alert(this.value + ": " + JSON.stringify(groupClassify[this.value]));
				}else{
					this.parentNode.innerHTML = preValue;
				}
				
			});
			$(this).append(input);
			//.innerHTML = "<input type='text' onblur='alert(this.value);' />";
		};

		var closeGroup = function(){
			if(confirm("你确定要删除本分类，并让分类下的所有小组回到原来的位置吗？【注意：同样要保存后方生效】")){
				$(".groupClassify dl", this.parentNode).appendTo($(".indent.obssin:last"));	
				$(this.parentNode).remove();
			}
		}

		var setDroppable = function(){
			$( ".indent.obssin" ).droppable({
				activeClass: "ui-state-default",
				hoverClass: "ui-state-hover",
				accept: ":not(.ui-sortable-helper)",
				drop: function( event, ui ) {				
					$( this ).find( ".placeholder" ).remove();
					ui.draggable.appendTo( this );
					var name = $(this.parentNode).find(".newName").text();
					//groupClassify[name].push(ui.draggable.find("a").attr("href"));
					
					var incre = (parseInt($("dl", this).length/7+1)*100) + "px";						
					this.style.height = incre;
					
				}
			});
		}

		
		$(".newName").dblclick(modifyGroupName);
		$(".closeGroup").click(closeGroup);
		$("#addClassify").click(function(){
			//localStorage.a = 100;
			
			$("#classify").append("<div><span class='newName' style='position: relative; bottom:-20px;left:10px;background-color: White'>双击修改分类名称</span><span class='closeGroup' style='position: relative; float:right;bottom:-20px;cursor:pointer'>x </span><div class='groupClassify indent obssin' style='text-align: center; border:1px solid #ccc;min-height:100px;margin-top:10px;padding:10px;'><span class='placeholder' style='line-height: 100px;'>请把小组拉到这个框里</span> </div></div><div class='clear'></div>");
			
			$(".newName:last").dblclick(modifyGroupName);
			$(".closeGroup:last").click(closeGroup);
			setDroppable();

		});
		


		$("#saveBtn").click(function(){
			groupClassify = {};
			$(".groupClassify").each(function(){
				var name = $(this.parentNode).find(".newName").text();
				if(!groupClassify[name]){
					groupClassify[name] = [];
				}
				$("dl", this).each(function(){
					groupClassify[name].push($("a:first", this).attr("href"));
				});
			});
			localStorage.doubanGroupClassify = JSON.stringify(groupClassify);
			alert("分类设置保存成功！");
		});

		
		setDroppable();
		$(".indent:last")[0].style.height = "500px";

		$("dl.ob").draggable({
			cancel: "a.ui-icon", // clicking an icon won't initiate dragging
			revert: "invalid", // when not dropped, the item will revert back to its initial position
			containment: "document", // stick to demo-frame if present
			helper: "clone",
			cursor: "move"
		});

	}

	function groupTopicCustomize(){
		if(JSON.parse(response.showLZBtn) && /topic/.test(location.href)){
			var onlyLZ = function(){
				u=$(".topic-content .user-face a").attr("href");
				a=window.location.href.match(/\/(\d+)\//)[1];
				$("li.clearfix:not(:has(h4 a[href="+u+"]))").hide();
				h=$(".paginator");j=h.find(">a:last").text();
				k=1;
				$a=new Array;
				c=new Array;
				for(i=1;i<j;i++){
					$.ajax({
						url:"/group/topic/"+a+"/?start="+(i*100),
						success:function(data){
							d=$(data);
							n=d.find(".thispage").text()-1;
							$a[n]=d.find("li.clearfix:has(h4 a[href="+u+"])");
							c[n]=d.find(".paginator").html();
							if(n==k){
								do{
									$a[k].appendTo($(".topic-reply"));
									h.html(c[k]);k++;
								}while($a[k]!=undefined);
							}
						}
					});
				}
			}

			var a = document.createElement("a");
			a.href="javascript:void(0)";
			a.onclick = onlyLZ;
			a.innerHTML = "楼主";
			a.setAttribute("class", ".j a_rec_btn");	
			if($(".rec-sec").length){
				$(".rec-sec").append(a);
			}else if($(".topic-opt").length){
				$(".topic-opt").append(a);
			}
		}
		//------------
		if(JSON.parse(response.showFloor)){
			//显示楼层
			var i=$(".paginator .thispage").text();
			i=i==""?0:(i-1)*100;
			$("h4").each(function(){
				$(this).append("<span style='float:right'>"+(++i)+"楼 </span>");
			});
			
			//添加按钮
//			$(".ln-report").css("position", "relative");
//			$(".comment-report").css("position", "relative");
			var quote = $("<a href='javascript:void(0)' class='__quote gact'>&nbsp; @ &nbsp;</a>");
			quote.css("float","right");
			var onlyShow = $("<a href='javascript:void(0)' class='__only gact'> Only </a>");
			onlyShow.css("float","right");
//			if($(".group_banned").length){
//				$(".group_banned").append(">").append(quote).append(onlyShow);
//			}
			if($(".operation_div").length){
//				$(".operation_div").css("display","block");
//				$(".operation_div .comment-report").css("visibility","visible");
				$(".operation_div").append(">").append(quote).append(onlyShow);
			}
			
			if($(".wr tr td:nth-child(2)").length) {
				$(".wr tr td:nth-child(2)").append(quote).append(onlyShow);
				
			}
			var re_f = $("#re_f");
					
			re_f = document.createElement('div');
			re_f.id = 're_f';
			re_f.style.cssText = 'position:fixed;top:25%;border:1px solid #ccc;display:none';
			
			var action = /group|widget/.test(location.href)?'add_comment':'?post=ok#last';

			$('.aside').append(re_f);
			$(".__only").click(function(){
//				var selector = "a:has(img .pil)";
				var selector = ".bg-img-green";
				if(/alphatown/.test(location.href)){
					selector = ".pic a";
				}
				if($(this).text() == "Only "){
					var curHref= $("a:first",this.parentNode.parentNode).attr("href");	
					$(selector).each(function(index){				
						$(this.parentNode.parentNode).hide();						
						var curPage = $(".paginator .thispage").text();
						curPage=curPage==""?1:curPage;
						if($(this).find("a").attr("href") == curHref){
							$(this.parentNode.parentNode).show();
						}
						
					});
					$(".__only").text("Back ");
				}else{
					$(selector).parent().parent().show();
					$(".__only").text("Only ");
				}
			});
			
			
			
			
			$(".__quote").click(function(){
				ck_value=$(".top-nav-info a:last")[0].href.split("=")[1];
				var quoteValue=$("h4",this.parentNode.parentNode).text();
				$("h4 span",this.parentNode.parentNode).text();
//				alert(quoteValue.length - $("h4 span",this.parentNode.parentNode).text().length);
				quoteValue = quoteValue.substring(0, quoteValue.length - $("h4 span",this.parentNode.parentNode).text().length);		     
				quoteValue += $("p",this.parentNode.parentNode).text();		                                                       
				quoteValue = quoteValue.replace(/^\s*/g, "").replace(/(\d+:\d+:\d+)\s*/,"$1 ").replace(/\)\s*(\d+楼\s*)/, ")\n");
				quoteValue += "\n---------------------------------------\n" ;
//				alert(quoteValue);
				var authorName = $("a:first", this.parentNode.parentNode).text();
				re_f.innerHTML = '\
					<input type="button" value="@' + authorName + '" id="_replyBtn" />\
					<input type="button" value="引用' + authorName + '说的内容" id="_quoteBtn" />\
					<form name="comment_form" method="post" action="'+ action +'" >\
						<input name="ck" value='+ ck_value +' type="hidden">\
						<textarea id="re_text" name="rv_comment" rows="20" style="font-size:12px;width:310px;border:0px;border-bottom:1px solid #ccc;">@'+authorName+'\n</textarea><br>\
						<input value="加上去" type="submit">\
						<input value="清空" type="button" onClick="document.getElementById(\'re_text\').value=\'\';document.getElementById(\'re_text\').focus();">\
						\
						<input value="取消" type="button" onClick="document.getElementById(\'re_f\').style.display=\'none\'">\
						</form>';
				re_f.style.display = "block";
				$("#_quoteBtn").click(function(){
					$("#re_text").val(quoteValue);
				});
				$("#_replyBtn").click(function(){
					$("#re_text").val("@" + authorName + "\n");
				});
				
			});
			
		}
	}

	//bug:未修复，现在貌似改了post方式，一次只能传一张
	function uploadFileCustomize(){
		
		
		var btn = document.createElement("input");
		btn.type = "button";
		btn.onclick = function(){
			var len = $("#photos-upload span").length;
			alert(len);
			for(i=0;i<5;i++){
				$("#photos-upload").append(
					"<input name='file' style='width:220px' id='img" 
					+ (i+len) + "' type='file'><span id='info"					
					+ (i+len) + "' class='attn'></span>");
			}
			$(".bn-flat input").append("<script>n_photo+=5;</script>")
		}
		btn.value = "增加5个文件";
		$(".bn-flat").prepend(btn);		
/*		
		var btn = document.createElement("input");
		btn.type = "button";
		btn.onclick = function(){
			var len = $("#album_up span").length;
			for(i=0;i<5;i++){
				$("#album_up").append(
					"<input name='file' style='width:220px' id='img" 
					+ (i+len) + "' type='file'><span id='info"					
					+ (i+len) + "' class='attn'></span>");
			}
			$("#btns").append("<script>n_photo+=5;</script>")
		}
		btn.value = "增加5个文件";
		$("#btns").prepend(btn);
		*/
	}

	function downloadFileCustomize(){
		var a = document.createElement("a");
		a.innerHTML = "本相册所有图片大图链接地址";
		a.href = "javascript:void(0)";
		a.onclick = function(){
			var textarea = $("<textarea rows='10' cols='100'></textarea>");
			textarea.click(function(){
				this.focus();
				this.select();
			});
			
			var sum=parseInt($(".wr span.pl").text());
			t = location.href.split("?");
			var i = 0;
			var perPage;
			var selector = ".photo_wrap a img";
			if(/online/.test(location.href)){
				perPage = 30;				
			}else if(/movie\.douban\.com/.test(location.href)){
				perPage = 40;
				var tmp = $("#photos_filter .current")
				sum = parseInt(tmp.text().split("(")[1]);
				selector = "li .cover img";
			}else if(/photos/.test(location.href)){
				perPage = 18;
			}else if(/site/.test(location.href)){
				var tmp = $(".album-info").text().split("推荐");
				sum = parseInt(tmp[tmp.length-1]);
				perPage = 30;
				selector = ".album_photo img";
			}
			
			
			if(t.length>1){
				i = parseInt(location.href.split("start=")[1])/perPage;
				if(isNaN(i)){
					i = 0;
				}
			}
			var pages = 0;
			pages = (sum / perPage - i)> 10 ? i+10 : sum/perPage;
			$(".photitle").append("<br/>以下是从第"+(i+1)+"页开始到第"+((sum / perPage - i)> 10?i+10 : parseInt(sum/perPage + 1))+"页的大图图片URL地址。").append(textarea);
			if(/movie/.test(location.href)){				
				$(".opt-bar-line").append("<br/>以下是从第"+(i+1)+"页开始到第"+((sum / perPage - i)> 10?i+10 : parseInt(sum/perPage + 1))+"页的大图图片URL地址。").append(textarea);
			}
			for(;i<pages;i++){
				albumUrl = t[0]+"/?start="+i*perPage;
				if(/movie/.test(location.href)){	
					if(/start=\d+/.test(location.href)){
						albumUrl = location.href.replace(/start=\d+/, "start="+i*perPage)					
					}else{
						albumUrl = location.href + "&start=" +i*perPage;
					}
				}
				
				$.get(albumUrl, function(data){
					$(selector, data).each(function(){
						v=$(this).attr("src").replace("thumb","photo");
						textarea.append(v + "\n");
					});
				});
			}

		};
		
		$(".photitle").prepend(a).prepend("> ");
		if(/movie/.test(location.href)){
			$(".opt-bar-line").append(" · ").append(a);
		}
	}

	function searchMoviesCustomize(){
		n=$("h1 span:first").text().split(" ")[0];
		$("#info").append("<br><span class='pl'  style='color:red'>VeryCD搜索: </span><a target='_blank' href='http://www.verycd.com/search/folders/"+n+"'>"+n+"</a>");
		$("#info").append("<br><span class='pl'  style='color:red'>迅雷搜索: </span><a target='_blank' href='http://www.gougou.com/search?search="+n+"'>"+n+"</a>");
	}

	function peopleCustomize(){
		var userid = location.href.split(/people|\//)[5];
		if($(".user-opt").length == 0){
			ck=$(".top-nav-info a:last")[0].href.split("=")[1];
			
			var i = 0;
			$("li.mbtrdot").each(function(){
				i++;
				var action = $(this).find("a").attr("href");
				//$.post(\"" + action + "\",{ck:\"" + ck +"\", bp_text:\"test\", bp_submit:\"留言\"})})()
				$(this).append("<br><a href='javascript:document.getElementById(\"mydiv_"+i+"\").style.display=\"block\"'>快捷回复至TA的留言板 </a>"
				 + "<div id='mydiv_"+i+"' style='display:none'>"				 
				 + "<input name='bp_text' id='bp_text_" + i + "' size='70'>"
				 + "<input type='button' value='回复' onclick='this.disabled=true;obj=$(\"#bp_text_\"+"
				 + i + ")[0];bp_text=obj.value;$.post(\""
				 + action + "\",{ck:\""
				 + ck +"\", bp_text:bp_text, bp_submit:\"留言\"},function(){$(obj).hide();alert(\"提交成功\");});'/></div>");
			});

			//----列出所有看过的电影
			
		}else{
			//加备注
						
			$(".user-info .pl").append("<br /><span style='color:red' class='backupName'>" + (backupNames[userid]?backupNames[userid]:"") + "</span>");

			//bug:备注此人在读书页面不管用
			var a = $('<a href="javascript:void(0)">备注此人</a>');
			a.click(function(){
				var backup = $("<a href='javascript:void(0)'>备注好友</a>");
				backup.click(function(){
					if(localStorage.doubanBackupNames){
						backupNames = JSON.parse(localStorage.doubanBackupNames);
					}
					var newName = $("#backup").val();
					$(".backupName").html( newName );
					
					backupNames[userid] = newName;
					localStorage["doubanBackupNames"] = JSON.stringify(backupNames);
					$(this).remove();
					alert("备注成功");
				});
				$(".backupName").html("<input type='text' size='10' id='backup' style='border:1px solid #ccc'/><br />").append(backup);
			});
			
			$(".user-group-list").prepend(a);
		}
	}

	function exportTextCustomize(){
		var a = $("<a class='backupText' href='javascript:void(0)'>(备份文本)</a>");		
		$("#db-book-mine h2 .pl").append(a);
		$(".backupText").click(function(){
			//var userid = $("#db-usr-profile a:first").attr("href").split(/\//)[4];
			var userid = $("#db-book-mine h2 .pl a").attr("href").split(/\//)[4];
			var textarea = $("<textarea rows='10' cols='100'></textarea>");
			textarea.click(function(){
				this.focus();
				this.select();
			});
			
			//this = ".backupText"
			$(this.parentNode.parentNode).after(textarea);
			total = parseInt($("a:first", this.parentNode).text());
			var type = $("a:first", this.parentNode).attr("href").split(/\//)[5];
			for(var i=0; i<total/15+1;i++){
				$.get("/people/" + userid + "/"+type+"?start="+(i*15), function(dat){
					$(".item",dat).each(function(){
						var href=$(".title a",this).attr("href");
						title=($(".title a",this).text().split(/\//)[0]).replace(/\s+/g, "");;
						comment=$("li:nth-child(4)",this).text().replace(/\s+/g, " ");
						comment=/修改\s删除/.test(comment)?" ": comment;
						level=parseInt($("li:nth-child(3) span:first",this).attr("class").split(/rating|-/)[1]);
						textarea.append("链接：【" + href+"】,个人评分：【" + level + "】, 片名：【" + title + "】, 个人短评：【" + comment + "】\n");
					});
				})
			}
		});
	}

	//主页改版了，和以前不一样了
	function frontpageCustomize(){
		var span = $("<span style='float:right'>只看：</span>");
		var recommend = $("<a href='javascript:void(0)' regexp='^推荐'>友邻推荐</a>");
		var curpage = $(".thispage").text();
		var perReq = response.pagePerRequest == undefined ? 5 : response.pagePerRequest;
		

		var onclickFunction = function(){
			var regexp = new RegExp($(this).attr("regexp"));
			$(".mbtr,.mbtl").hide();
			var arr = [];
			var k=1;
			for(var idx=(curpage-1)*perReq;idx<perReq*curpage;idx++){
				$.get("/?start="+(idx*20), function(dat){
					
					var i=0;
					var cur = $(".thispage", dat).text() - (curpage-1)*perReq;
					arr[cur] = [];
					$(".mbtr",dat).each(function(){
						if(regexp.test($(".pl",this).text())){
							
							arr[cur].push($($(".mbtl",dat)[i]));
							arr[cur].push($(this));								
						}
						i++;
					});					
					if(cur == k){
						for(var tmp=1;tmp<=k;tmp++){
							if(arr[tmp]!=undefined && arr[tmp].length > 0){								
								for(var t=0; t<arr[tmp].length;t++){
									arr[tmp][t].attr("generated","true");
									$(".mbt").append(arr[tmp][t]);
								}
								arr[tmp] = undefined;
								k++;
							}
						}
					}

					
				});
			}
		}

		var restore = $("<a href='javascript:void(0)'>还原</a>");	
		var say = $("<a href='javascript:void(0)' regexp='说：$'>友邻说</a>");

		restore.click(function(){
			$(".mbtr,.mbtl").show();
			$("li[generated]").hide();
		});
		recommend.click(onclickFunction);		
		say.click(onclickFunction);
		span.append(recommend).append(" | ").append(say).append(" | ").append(restore);
		$("#db-timeline-hd").append(span);

		if(response.syncToSina){
			$(".bn-flat").before("<input type='checkbox' id='synchToSina' />同步到新浪微博&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");

			$(".bn-flat input[type=submit]").click(function(){
				if($("#synchToSina")[0].checked){
					chrome.extension.sendMessage({eventName:"synchToSina", eventParameter:$(".item textarea").val()}, function(response) {});
				}
			});
		}
	}
	
	function groupSearch(){
		var box = $('<div class="bd nav-srh">\
			<input id="search_group_text" type="text" title="" size="22" maxlength="60" value="" >\
			');
		
		
		var btn = $('<input class="bn-srh" size=40 type="button" value="搜">');
		btn.click(function(){
			alert($("#search_group_text").val());
		});
		box.append(btn);
		$(".infobox").append(box);
	

	}

	//groupSearch();
	

	if(/group\/(\?start=\d+)?$/.test(location.href)){		
		groupClassifyShow();
	}
	if(location.href.match(/group\/mine/)) {
		groupClassifyConfigure();
	}
	//if(location.href.match(/.*group\/topic.*/)){		
		groupTopicCustomize();
	//}
	if(location.href.match(/.*photos\/album\/\d+\/upload.*/)){	
		uploadFileCustomize();
	} 
	//if(location.href.match(/.*photos\/album\/\d+\/.*/)){
		downloadFileCustomize();
	//}
	if(location.href.match(/.*subject\/\d+.*/)){
		searchMoviesCustomize();
	}
	if(location.href.match(/.*\/people\/.*/)){
		peopleCustomize();
	}	
	if(/((movie)|(book)|(music))\.douban\.com/.test(location.href)){		
		exportTextCustomize();		
	}
	if(/com(\/\?|\/$)/.test(location.href)){
		frontpageCustomize();
	}

	if(/contacts\/list/.test(location.href)){
		var ck=$(".top-nav-info a:last")[0].href.split("=")[1];
		$(".menu-list").append("<li><a href='javascript:void(0)' id='backupPeople'>我备注过的人</a></li>")
		
		$("#backupPeople").click(function(){
			$(".menu-list li").each(function(){
				if($(this).hasClass("on")){
					$(this).removeClass("on");					
				}
			});
			$(this).parent().addClass("on");
			

			$(".user-list li").hide();
			$(".paginator").hide();
			for(var t in backupNames){
				var li = $("<li></li>");
				li.append("<a target='_blank' href='http://www.douban.com/people/" + t +"'>"+backupNames[t]+"</a>" );
				li.append("<a style='float:right' href='javascript:void(0)' class='deleteBackup' name='" + t + "'>删除备注</a>");
				$(".user-list").append(li);
			}
			var li = $("<li><textarea id='reply_content' rows='5' cols='60'>{nickname}</textarea><br /></li>");
			var submitBtn = $("<input type='button' value='留言板群发' />");
			submitBtn.click(function(){				
				for(var t in backupNames){
					$.post("http://www.douban.com/people/" + t + "/",{
						ck:ck, 
						bp_text:$("#reply_content").val().replace("{nickname}", backupNames[t]), 
						bp_submit:"留言"
					});
				}
			});
			$(".user-list").append(li.append(submitBtn).append(" <p class='pl'>PS：<b>{nickname}</b>将被自动替换成你备注的好友昵称。<br>PPS：如果因大量刷留言板被关小黑板俺可不负责啊。</p>"));

			$(".deleteBackup").click(function(){
				delete(backupNames[$(this).attr("name")]);
				localStorage["doubanBackupNames"] = JSON.stringify(backupNames);
				$(this).parent().remove();
			});
		});
		
	}
	
	if(/douban\.com\/service\/auth\/authorize\?oauth_token/.test(location.href)){
		$("input[name=confirm]").click(function(){
			chrome.extension.sendRequest({eventName:"authToDouban"}, function(response) {});
		});
	}
	/*if(/api\.t\.sina\.com\.cn/.test(location.href)){
		$(".newbbtngrn").click(function(){
			chrome.extension.sendRequest({eventName:"authToSina"}, function(response) {});
		});
	}*/
	/*else if(window.location.href.match(/.*group\//)){
		var a = document.createElement("a");
		a.href = "javascript:void(0)";
		a.innerHTML = "我关注的话题";
		a.onclick = function(){
			$("tr.pl").each(function(){$(this).hide()});
			
		}
		$(".zbar.clearfix div").append(a);

		
		$("tr.pl").each(function(){
			var attention = document.createElement("a");
			attention.href="javascript:alert('已关注')";
			attention.innerHTML = "关注";
			attention.onclick = function(){
				var tr = $(attention).parent();
				var thread = {};
				thread.title = $($("td", tr)[0]).text();
				thread.titleHref = $($("td", tr)[0]).find(":nth-child(1)").attr("href");
				thread.group = $($("td", tr)[1]).text();
				thread.groupHref = $($("td", tr)[1]).find(":nth-child(1)").attr("href");
				thread.author = $($("td", tr)[2]).text();
				thread.reply = $($("td", tr)[3]).text();
				thread.lastPost = $($("td", tr)[4]).text();
				chrome.extension.sendRequest({eventName:"saveData", eventValue:thread}, function(response) {});
			}
			$(this).append(attention);
		});
	}*/
});
