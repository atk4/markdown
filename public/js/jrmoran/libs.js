
// Showdown

var Attacklab=Attacklab||{};
Attacklab.showdown=Attacklab.showdown||{};
Attacklab.showdown.converter=function(){
	var g_urls;
	var g_titles;
	var g_html_blocks;
	var g_list_level=0;
	this.makeHtml=function(text){
		g_urls=new Array();
		g_titles=new Array();
		g_html_blocks=new Array();
		text=text.replace(/~/g,"~T");
		text=text.replace(/\$/g,"~D");
		text=text.replace(/\r\n/g,"\n");
		text=text.replace(/\r/g,"\n");
		text="\n\n"+text+"\n\n";
		text=_Detab(text);
		text=text.replace(/^[ \t]+$/mg,"");
		text=_HashHTMLBlocks(text);
		text=_StripLinkDefinitions(text);
		text=_RunBlockGamut(text);
		text=_UnescapeSpecialChars(text);
		text=text.replace(/~D/g,"$$");
		text=text.replace(/~T/g,"~");
		return text;
	}
	var _StripLinkDefinitions=function(text){
		var text=text.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+)/gm,
			function(wholeMatch,m1,m2,m3,m4){
				m1=m1.toLowerCase();
				g_urls[m1]=_EncodeAmpsAndAngles(m2);
				if(m3){
					return m3+m4;
				}else if(m4){
					g_titles[m1]=m4.replace(/"/g,"&quot;");
				}
				return"";
			}
		);
		return text;
	};
	var _HashHTMLBlocks=function(text){
		text=text.replace(/\n/g,"\n\n");
		var block_tags_a="p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del";
		var block_tags_b="p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math";
		text=text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm,hashElement);
		text=text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math)\b[^\r]*?.*<\/\2>[ \t]*(?=\n+)\n)/gm,hashElement);
		text=text.replace(/(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,hashElement);
		text=text.replace(/(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g,hashElement);
		text=text.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,hashElement);
		text=text.replace(/\n\n/g,"\n");
		return text;
	}
	var hashElement=function(wholeMatch,m1){
		var blockText=m1;
		blockText=blockText.replace(/\n\n/g,"\n");
		blockText=blockText.replace(/^\n/,"");
		blockText=blockText.replace(/\n+$/g,"");
		blockText="\n\n~K"+(g_html_blocks.push(blockText)-1)+"K\n\n";
		return blockText;
	};
	var _RunBlockGamut=function(text){
		text=_DoHeaders(text);
		var key=hashBlock("<hr />");
		text=text.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm,key);
		text=text.replace(/^[ ]{0,2}([ ]?-[ ]?){3,}[ \t]*$/gm,key);
		text=text.replace(/^[ ]{0,2}([ ]?_[ ]?){3,}[ \t]*$/gm,key);
		text=_DoLists(text);
		text=_DoCodeBlocks(text);
		text=_DoBlockQuotes(text);
		text=_HashHTMLBlocks(text);
		text=_FormParagraphs(text);
		return text;
	}
	var _RunSpanGamut=function(text){
		text=_DoCodeSpans(text);
		text=_EscapeSpecialCharsWithinTagAttributes(text);
		text=_EncodeBackslashEscapes(text);
		text=_DoImages(text);
		text=_DoAnchors(text);
		text=_DoAutoLinks(text);
		text=_EncodeAmpsAndAngles(text);
		text=_DoItalicsAndBold(text);
		text=text.replace(/  +\n/g," <br />\n");
		return text;
	}
	var _EscapeSpecialCharsWithinTagAttributes=function(text){
		var regex=/(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--.*?--\s*)+>)/gi;
		text=text.replace(regex,function(wholeMatch){
			var tag=wholeMatch.replace(/(.)<\/?code>(?=.)/g,"$1`");
			tag=escapeCharacters(tag,"\\`*_");
			return tag;
		});
		return text;
	}
	var _DoAnchors=function(text){
		text=text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,writeAnchorTag);
		text=text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?(.*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,writeAnchorTag);
		text=text.replace(/(\[([^\[\]]+)\])()()()()()/g,writeAnchorTag);
		return text;
	}
	var writeAnchorTag=function(wholeMatch,m1,m2,m3,m4,m5,m6,m7){
		if(m7==undefined)m7="";
		var whole_match=m1;
		var link_text=m2;
		var link_id=m3.toLowerCase();
		var url=m4;
		var title=m7;
		if(url==""){
			if(link_id==""){
				link_id=link_text.toLowerCase().replace(/ ?\n/g," ");
			}
			url="#"+link_id;
			if(g_urls[link_id]!=undefined){
				url=g_urls[link_id];
				if(g_titles[link_id]!=undefined){
					title=g_titles[link_id];
				}
			}
			else{
				if(whole_match.search(/\(\s*\)$/m)>-1){
					url="";
				}else{
					return whole_match;
				}
			}
		}
		url=escapeCharacters(url,"*_");
		var result="<a href=\""+url+"\"";
		if(title!=""){
			title=title.replace(/"/g,"&quot;");
			title=escapeCharacters(title,"*_");
			result+=" title=\""+title+"\"";
		}
		result+=">"+link_text+"</a>";
		return result;
	}
	var _DoImages=function(text){
		text=text.replace(/(!\[(.*?)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,writeImageTag);
		text=text.replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,writeImageTag);
		return text;
	}
	var writeImageTag=function(wholeMatch,m1,m2,m3,m4,m5,m6,m7){
		var whole_match=m1;
		var alt_text=m2;
		var link_id=m3.toLowerCase();
		var url=m4;
		var title=m7;
		if(!title)title="";
		if(url==""){
			if(link_id==""){
				link_id=alt_text.toLowerCase().replace(/ ?\n/g," ");
			}
			url="#"+link_id;
			if(g_urls[link_id]!=undefined){
				url=g_urls[link_id];
				if(g_titles[link_id]!=undefined){
					title=g_titles[link_id];
				}
			}
			else{
				return whole_match;
			}
		}
		alt_text=alt_text.replace(/"/g,"&quot;");
		url=escapeCharacters(url,"*_");
		var result="<img src=\""+url+"\" alt=\""+alt_text+"\"";
		title=title.replace(/"/g,"&quot;");
		title=escapeCharacters(title,"*_");
		result+=" title=\""+title+"\"";
		result+=" />";
		return result;
	}
	var _DoHeaders=function(text){
		text=text.replace(/^(.+)[ \t]*\n=+[ \t]*\n+/gm,
			function(wholeMatch,m1){return hashBlock("<h1>"+_RunSpanGamut(m1)+"</h1>");});
		text=text.replace(/^(.+)[ \t]*\n-+[ \t]*\n+/gm,
			function(matchFound,m1){return hashBlock("<h2>"+_RunSpanGamut(m1)+"</h2>");});
		text=text.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm,
			function(wholeMatch,m1,m2){
				var h_level=m1.length;
				return hashBlock("<h"+h_level+">"+_RunSpanGamut(m2)+"</h"+h_level+">");
			});
		return text;
	}
	var _ProcessListItems;
	var _DoLists=function(text){
		text+="~0";
		var whole_list=/^(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;
		if(g_list_level){
			text=text.replace(whole_list,function(wholeMatch,m1,m2){
				var list=m1;
				var list_type=(m2.search(/[*+-]/g)>-1)?"ul":"ol";
				list=list.replace(/\n{2,}/g,"\n\n\n");;
				var result=_ProcessListItems(list);
				result=result.replace(/\s+$/,"");
				result="<"+list_type+">"+result+"</"+list_type+">\n";
				return result;
			});
		}else{
			whole_list=/(\n\n|^\n?)(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/g;
			text=text.replace(whole_list,function(wholeMatch,m1,m2,m3){
				var runup=m1;
				var list=m2;
				var list_type=(m3.search(/[*+-]/g)>-1)?"ul":"ol";
				var list=list.replace(/\n{2,}/g,"\n\n\n");;
				var result=_ProcessListItems(list);
				result=runup+"<"+list_type+">\n"+result+"</"+list_type+">\n";
				return result;
			});
		}
		text=text.replace(/~0/,"");
		return text;
	}
	_ProcessListItems=function(list_str){
		g_list_level++;
		list_str=list_str.replace(/\n{2,}$/,"\n");
		list_str+="~0";
		list_str=list_str.replace(/(\n)?(^[ \t]*)([*+-]|\d+[.])[ \t]+([^\r]+?(\n{1,2}))(?=\n*(~0|\2([*+-]|\d+[.])[ \t]+))/gm,
			function(wholeMatch,m1,m2,m3,m4){
				var item=m4;
				var leading_line=m1;
				var leading_space=m2;
				if(leading_line||(item.search(/\n{2,}/)>-1)){
					item=_RunBlockGamut(_Outdent(item));
				}
				else{
					item=_DoLists(_Outdent(item));
					item=item.replace(/\n$/,"");
					item=_RunSpanGamut(item);
				}
				return"<li>"+item+"</li>\n";
			}
		);
		list_str=list_str.replace(/~0/g,"");
		g_list_level--;
		return list_str;
	}
	var _DoCodeBlocks=function(text){
		text+="~0";
		text=text.replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g,
			function(wholeMatch,m1,m2){
				var codeblock=m1;
				var nextChar=m2;
				codeblock=_EncodeCode(_Outdent(codeblock));
				codeblock=_Detab(codeblock);
				codeblock=codeblock.replace(/^\n+/g,"");
				codeblock=codeblock.replace(/\n+$/g,"");
				codeblock="<pre><code>"+codeblock+"\n</code></pre>";
				return hashBlock(codeblock)+nextChar;
			}
		);
		text=text.replace(/~0/,"");
		return text;
	}
	var hashBlock=function(text){
		text=text.replace(/(^\n+|\n+$)/g,"");
		return"\n\n~K"+(g_html_blocks.push(text)-1)+"K\n\n";
	}
	var _DoCodeSpans=function(text){
		text=text.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,
			function(wholeMatch,m1,m2,m3,m4){
				var c=m3;
				c=c.replace(/^([ \t]*)/g,"");
				c=c.replace(/[ \t]*$/g,"");
				c=_EncodeCode(c);
				return m1+"<code>"+c+"</code>";
			});
		return text;
	}
	var _EncodeCode=function(text){
		text=text.replace(/&/g,"&amp;");
		text=text.replace(/</g,"&lt;");
		text=text.replace(/>/g,"&gt;");
		text=escapeCharacters(text,"\*_{}[]\\",false);
		return text;
	}
	var _DoItalicsAndBold=function(text){
		text=text.replace(/(\*\*|__)(?=\S)([^\r]*?\S[\*_]*)\1/g,
			"<strong>$2</strong>");
		text=text.replace(/(\*|_)(?=\S)([^\r]*?\S)\1/g,
			"<em>$2</em>");
		return text;
	}
	var _DoBlockQuotes=function(text){
		text=text.replace(/((^[ \t]*>[ \t]?.+\n(.+\n)*\n*)+)/gm,
			function(wholeMatch,m1){
				var bq=m1;
				bq=bq.replace(/^[ \t]*>[ \t]?/gm,"~0");
				bq=bq.replace(/~0/g,"");
				bq=bq.replace(/^[ \t]+$/gm,"");
				bq=_RunBlockGamut(bq);
				bq=bq.replace(/(^|\n)/g,"$1  ");
				bq=bq.replace(
					/(\s*<pre>[^\r]+?<\/pre>)/gm,
					function(wholeMatch,m1){
						var pre=m1;
						pre=pre.replace(/^  /mg,"~0");
						pre=pre.replace(/~0/g,"");
						return pre;
					});
				return hashBlock("<blockquote>\n"+bq+"\n</blockquote>");
			});
		return text;
	}
	var _FormParagraphs=function(text){
		text=text.replace(/^\n+/g,"");
		text=text.replace(/\n+$/g,"");
		var grafs=text.split(/\n{2,}/g);
		var grafsOut=new Array();
		var end=grafs.length;
		for(var i=0;i<end;i++){
			var str=grafs[i];
			if(str.search(/~K(\d+)K/g)>=0){
				grafsOut.push(str);
			}
			else if(str.search(/\S/)>=0){
				str=_RunSpanGamut(str);
				str=str.replace(/^([ \t]*)/g,"<p>");
				str+="</p>"
				grafsOut.push(str);
			}
		}
		end=grafsOut.length;
		for(var i=0;i<end;i++){
			while(grafsOut[i].search(/~K(\d+)K/)>=0){
				var blockText=g_html_blocks[RegExp.$1];
				blockText=blockText.replace(/\$/g,"$$$$");
				grafsOut[i]=grafsOut[i].replace(/~K\d+K/,blockText);
			}
		}
		return grafsOut.join("\n\n");
	}
	var _EncodeAmpsAndAngles=function(text){
		text=text.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g,"&amp;");
		text=text.replace(/<(?![a-z\/?\$!])/gi,"&lt;");
		return text;
	}
	var _EncodeBackslashEscapes=function(text){
		text=text.replace(/\\(\\)/g,escapeCharacters_callback);
		text=text.replace(/\\([`*_{}\[\]()>#+-.!])/g,escapeCharacters_callback);
		return text;
	}
	var _DoAutoLinks=function(text){
		text=text.replace(/<((https?|ftp|dict):[^'">\s]+)>/gi,"<a href=\"$1\">$1</a>");
		text=text.replace(/<(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi,
			function(wholeMatch,m1){
				return _EncodeEmailAddress(_UnescapeSpecialChars(m1));
			}
		);
		return text;
	}
	var _EncodeEmailAddress=function(addr){
		function char2hex(ch){
			var hexDigits='0123456789ABCDEF';
			var dec=ch.charCodeAt(0);
			return(hexDigits.charAt(dec>>4)+hexDigits.charAt(dec&15));
		}
		var encode=[
			function(ch){return"&#"+ch.charCodeAt(0)+";";},
			function(ch){return"&#x"+char2hex(ch)+";";},
			function(ch){return ch;}
		];
		addr="mailto:"+addr;
		addr=addr.replace(/./g,function(ch){
			if(ch=="@"){
				ch=encode[Math.floor(Math.random()*2)](ch);
			}else if(ch!=":"){
				var r=Math.random();
				ch=(
					r>.9?encode[2](ch):
						r>.45?encode[1](ch):
							encode[0](ch)
					);
			}
			return ch;
		});
		addr="<a href=\""+addr+"\">"+addr+"</a>";
		addr=addr.replace(/">.+:/g,"\">");
		return addr;
	}
	var _UnescapeSpecialChars=function(text){
		text=text.replace(/~E(\d+)E/g,
			function(wholeMatch,m1){
				var charCodeToReplace=parseInt(m1);
				return String.fromCharCode(charCodeToReplace);
			}
		);
		return text;
	}
	var _Outdent=function(text){
		text=text.replace(/^(\t|[ ]{1,4})/gm,"~0");
		text=text.replace(/~0/g,"")
		return text;
	}
	var _Detab=function(text){
		text=text.replace(/\t(?=\t)/g,"    ");
		text=text.replace(/\t/g,"~A~B");
		text=text.replace(/~B(.+?)~A/g,
			function(wholeMatch,m1,m2){
				var leadingText=m1;
				var numSpaces=4-leadingText.length%4;
				for(var i=0;i<numSpaces;i++)leadingText+=" ";
				return leadingText;
			}
		);
		text=text.replace(/~A/g,"    ");
		text=text.replace(/~B/g,"");
		return text;
	}
	var escapeCharacters=function(text,charsToEscape,afterBackslash){
		var regexString="(["+charsToEscape.replace(/([\[\]\\])/g,"\\$1")+"])";
		if(afterBackslash){
			regexString="\\\\"+regexString;
		}
		var regex=new RegExp(regexString,"g");
		text=text.replace(regex,escapeCharacters_callback);
		return text;
	}
	var escapeCharacters_callback=function(wholeMatch,m1){
		var charCodeToEscape=m1.charCodeAt(0);
		return"~E"+charCodeToEscape+"E";
	}
}
var Showdown=Attacklab.showdown;
if(Attacklab.fileLoaded){
	Attacklab.fileLoaded("showdown.js");
}

// WMD

var Attacklab=Attacklab||{};
Attacklab.wmdBase=function(){
	var wmd=top.Attacklab;
	var doc=top.document;
	var re=top.RegExp;
	var nav=top.navigator;
	wmd.Util={};
	wmd.Position={};
	wmd.Command={};
	wmd.Global={};
	var util=wmd.Util;
	var position=wmd.Position;
	var command=wmd.Command;
	var global=wmd.Global;
	global.isIE=/msie/.test(nav.userAgent.toLowerCase());
	global.isIE_5or6=/msie 6/.test(nav.userAgent.toLowerCase())||/msie 5/.test(nav.userAgent.toLowerCase());
	global.isIE_7plus=global.isIE&&!global.isIE_5or6;
	global.isOpera=/opera/.test(nav.userAgent.toLowerCase());
	global.isKonqueror=/konqueror/.test(nav.userAgent.toLowerCase());
	var imageDialogText="<p style='margin-top: 0px'><b>Enter the image URL.</b></p><p>You can also add a title, which will be displayed as a tool tip.</p><p>Example:<br />http://wmd-editor.com/images/cloud1.jpg   \"Optional title\"</p>";
	var linkDialogText="<p style='margin-top: 0px'><b>Enter the web address.</b></p><p>You can also add a title, which will be displayed as a tool tip.</p><p>Example:<br />http://wmd-editor.com/   \"Optional title\"</p>";
	var imageDefaultText="http://";
	var linkDefaultText="http://";
	var imageDirectory="images/";
	var previewPollInterval=500;
	var pastePollInterval=100;
	var helpLink="http://wmd-editor.com/";
	var helpHoverTitle="WMD website";
	var helpTarget="_blank";
	wmd.PanelCollection=function(){
		this.buttonBar=doc.getElementById("wmd-button-bar");
		this.preview=doc.getElementById("wmd-preview");
		this.output=doc.getElementById("wmd-output");
		this.input=doc.getElementById("wmd-input");
	};
	wmd.panels=undefined;
	wmd.ieCachedRange=null;
	wmd.ieRetardedClick=false;
	util.isVisible=function(elem){
		if(window.getComputedStyle){
			return window.getComputedStyle(elem,null).getPropertyValue("display")!=="none";
		}
		else if(elem.currentStyle){
			return elem.currentStyle["display"]!=="none";
		}
	};
	util.addEvent=function(elem,event,listener){
		if(elem.attachEvent){
			elem.attachEvent("on"+event,listener);
		}
		else{
			elem.addEventListener(event,listener,false);
		}
	};
	util.removeEvent=function(elem,event,listener){
		if(elem.detachEvent){
			elem.detachEvent("on"+event,listener);
		}
		else{
			elem.removeEventListener(event,listener,false);
		}
	};
	util.fixEolChars=function(text){
		text=text.replace(/\r\n/g,"\n");
		text=text.replace(/\r/g,"\n");
		return text;
	};
	util.extendRegExp=function(regex,pre,post){
		if(pre===null||pre===undefined)
		{
			pre="";
		}
		if(post===null||post===undefined)
		{
			post="";
		}
		var pattern=regex.toString();
		var flags="";
		var result=pattern.match(/\/([gim]*)$/);
		if(result===null){
			flags=result[0];
		}
		else{
			flags="";
		}
		pattern=pattern.replace(/(^\/|\/[gim]*$)/g,"");
		pattern=pre+pattern+post;
		return new RegExp(pattern,flags);
	}
	util.createImage=function(img){
		var imgPath=imageDirectory+img;
		var elem=doc.createElement("img");
		elem.className="wmd-button";
		elem.src=imgPath;
		return elem;
	};
	util.prompt=function(text,defaultInputText,makeLinkMarkdown){
		var dialog;
		var background;
		var input;
		if(defaultInputText===undefined){
			defaultInputText="";
		}
		var checkEscape=function(key){
			var code=(key.charCode||key.keyCode);
			if(code===27){
				close(true);
			}
		};
		var close=function(isCancel){
			util.removeEvent(doc.body,"keydown",checkEscape);
			var text=input.value;
			if(isCancel){
				text=null;
			}
			else{
				text=text.replace('http://http://','http://');
				text=text.replace('http://https://','https://');
				text=text.replace('http://ftp://','ftp://');
				if(text.indexOf('http://')===-1&&text.indexOf('ftp://')===-1&&text.indexOf('https://')===-1){
					text='http://'+text;
				}
			}
			dialog.parentNode.removeChild(dialog);
			background.parentNode.removeChild(background);
			makeLinkMarkdown(text);
			return false;
		};
		var createBackground=function(){
			background=doc.createElement("div");
			background.className="wmd-prompt-background";
			style=background.style;
			style.position="absolute";
			style.top="0";
			style.zIndex="1000";
			if(global.isKonqueror){
				style.backgroundColor="transparent";
			}
			else if(global.isIE){
				style.filter="alpha(opacity=50)";
			}
			else{
				style.opacity="0.5";
			}
			var pageSize=position.getPageSize();
			style.height=pageSize[1]+"px";
			if(global.isIE){
				style.left=doc.documentElement.scrollLeft;
				style.width=doc.documentElement.clientWidth;
			}
			else{
				style.left="0";
				style.width="100%";
			}
			doc.body.appendChild(background);
		};
		var createDialog=function(){
			dialog=doc.createElement("div");
			dialog.className="wmd-prompt-dialog";
			dialog.style.padding="10px;";
			dialog.style.position="fixed";
			dialog.style.width="400px";
			dialog.style.zIndex="1001";
			var question=doc.createElement("div");
			question.innerHTML=text;
			question.style.padding="5px";
			dialog.appendChild(question);
			var form=doc.createElement("form");
			form.onsubmit=function(){return close(false);};
			style=form.style;
			style.padding="0";
			style.margin="0";
			style.cssFloat="left";
			style.width="100%";
			style.textAlign="center";
			style.position="relative";
			dialog.appendChild(form);
			input=doc.createElement("input");
			input.type="text";
			input.value=defaultInputText;
			style=input.style;
			style.display="block";
			style.width="80%";
			style.marginLeft=style.marginRight="auto";
			form.appendChild(input);
			var okButton=doc.createElement("input");
			okButton.type="button";
			okButton.onclick=function(){return close(false);};
			okButton.value="OK";
			style=okButton.style;
			style.margin="10px";
			style.display="inline";
			style.width="7em";
			var cancelButton=doc.createElement("input");
			cancelButton.type="button";
			cancelButton.onclick=function(){return close(true);};
			cancelButton.value="Cancel";
			style=cancelButton.style;
			style.margin="10px";
			style.display="inline";
			style.width="7em";
			if(/mac/.test(nav.platform.toLowerCase())){
				form.appendChild(cancelButton);
				form.appendChild(okButton);
			}
			else{
				form.appendChild(okButton);
				form.appendChild(cancelButton);
			}
			util.addEvent(doc.body,"keydown",checkEscape);
			dialog.style.top="50%";
			dialog.style.left="50%";
			dialog.style.display="block";
			if(global.isIE_5or6){
				dialog.style.position="absolute";
				dialog.style.top=doc.documentElement.scrollTop+200+"px";
				dialog.style.left="50%";
			}
			doc.body.appendChild(dialog);
			dialog.style.marginTop=-(position.getHeight(dialog)/2)+"px";
			dialog.style.marginLeft=-(position.getWidth(dialog)/2)+"px";
		};
		createBackground();
		top.setTimeout(function(){
			createDialog();
			var defTextLen=defaultInputText.length;
			if(input.selectionStart!==undefined){
				input.selectionStart=0;
				input.selectionEnd=defTextLen;
			}
			else if(input.createTextRange){
				var range=input.createTextRange();
				range.collapse(false);
				range.moveStart("character",-defTextLen);
				range.moveEnd("character",defTextLen);
				range.select();
			}
			input.focus();
		},0);
	};
	position.getTop=function(elem,isInner){
		var result=elem.offsetTop;
		if(!isInner){
			while(elem=elem.offsetParent){
				result+=elem.offsetTop;
			}
		}
		return result;
	};
	position.getHeight=function(elem){
		return elem.offsetHeight||elem.scrollHeight;
	};
	position.getWidth=function(elem){
		return elem.offsetWidth||elem.scrollWidth;
	};
	position.getPageSize=function(){
		var scrollWidth,scrollHeight;
		var innerWidth,innerHeight;
		if(self.innerHeight&&self.scrollMaxY){
			scrollWidth=doc.body.scrollWidth;
			scrollHeight=self.innerHeight+self.scrollMaxY;
		}
		else if(doc.body.scrollHeight>doc.body.offsetHeight){
			scrollWidth=doc.body.scrollWidth;
			scrollHeight=doc.body.scrollHeight;
		}
		else{
			scrollWidth=doc.body.offsetWidth;
			scrollHeight=doc.body.offsetHeight;
		}
		if(self.innerHeight){
			innerWidth=self.innerWidth;
			innerHeight=self.innerHeight;
		}
		else if(doc.documentElement&&doc.documentElement.clientHeight){
			innerWidth=doc.documentElement.clientWidth;
			innerHeight=doc.documentElement.clientHeight;
		}
		else if(doc.body){
			innerWidth=doc.body.clientWidth;
			innerHeight=doc.body.clientHeight;
		}
		var maxWidth=Math.max(scrollWidth,innerWidth);
		var maxHeight=Math.max(scrollHeight,innerHeight);
		return[maxWidth,maxHeight,innerWidth,innerHeight];
	};
	wmd.inputPoller=function(callback,interval){
		var pollerObj=this;
		var inputArea=wmd.panels.input;
		var lastStart;
		var lastEnd;
		var markdown;
		var killHandle;
		this.tick=function(){
			if(!util.isVisible(inputArea)){
				return;
			}
			if(inputArea.selectionStart||inputArea.selectionStart===0){
				var start=inputArea.selectionStart;
				var end=inputArea.selectionEnd;
				if(start!=lastStart||end!=lastEnd){
					lastStart=start;
					lastEnd=end;
					if(markdown!=inputArea.value){
						markdown=inputArea.value;
						return true;
					}
				}
			}
			return false;
		};
		var doTickCallback=function(){
			if(!util.isVisible(inputArea)){
				return;
			}
			if(pollerObj.tick()){
				callback();
			}
		};
		var assignInterval=function(){
			killHandle=top.setInterval(doTickCallback,interval);
		};
		this.destroy=function(){
			top.clearInterval(killHandle);
		};
		assignInterval();
	};
	wmd.undoManager=function(callback){
		var undoObj=this;
		var undoStack=[];
		var stackPtr=0;
		var mode="none";
		var lastState;
		var poller;
		var timer;
		var inputStateObj;
		var setMode=function(newMode,noSave){
			if(mode!=newMode){
				mode=newMode;
				if(!noSave){
					saveState();
				}
			}
			if(!global.isIE||mode!="moving"){
				timer=top.setTimeout(refreshState,1);
			}
			else{
				inputStateObj=null;
			}
		};
		var refreshState=function(){
			inputStateObj=new wmd.TextareaState();
			poller.tick();
			timer=undefined;
		};
		this.setCommandMode=function(){
			mode="command";
			saveState();
			timer=top.setTimeout(refreshState,0);
		};
		this.canUndo=function(){
			return stackPtr>1;
		};
		this.canRedo=function(){
			if(undoStack[stackPtr+1]){
				return true;
			}
			return false;
		};
		this.undo=function(){
			if(undoObj.canUndo()){
				if(lastState){
					lastState.restore();
					lastState=null;
				}
				else{
					undoStack[stackPtr]=new wmd.TextareaState();
					undoStack[--stackPtr].restore();
					if(callback){
						callback();
					}
				}
			}
			mode="none";
			wmd.panels.input.focus();
			refreshState();
		};
		this.redo=function(){
			if(undoObj.canRedo()){
				undoStack[++stackPtr].restore();
				if(callback){
					callback();
				}
			}
			mode="none";
			wmd.panels.input.focus();
			refreshState();
		};
		var saveState=function(){
			var currState=inputStateObj||new wmd.TextareaState();
			if(!currState){
				return false;
			}
			if(mode=="moving"){
				if(!lastState){
					lastState=currState;
				}
				return;
			}
			if(lastState){
				if(undoStack[stackPtr-1].text!=lastState.text){
					undoStack[stackPtr++]=lastState;
				}
				lastState=null;
			}
			undoStack[stackPtr++]=currState;
			undoStack[stackPtr+1]=null;
			if(callback){
				callback();
			}
		};
		var handleCtrlYZ=function(event){
			var handled=false;
			if(event.ctrlKey||event.metaKey){
				var keyCode=event.charCode||event.keyCode;
				var keyCodeChar=String.fromCharCode(keyCode);
				switch(keyCodeChar){
					case"y":
						undoObj.redo();
						handled=true;
						break;
					case"z":
						if(!event.shiftKey){
							undoObj.undo();
						}
						else{
							undoObj.redo();
						}
						handled=true;
						break;
				}
			}
			if(handled){
				if(event.preventDefault){
					event.preventDefault();
				}
				if(top.event){
					top.event.returnValue=false;
				}
				return;
			}
		};
		var handleModeChange=function(event){
			if(!event.ctrlKey&&!event.metaKey){
				var keyCode=event.keyCode;
				if((keyCode>=33&&keyCode<=40)||(keyCode>=63232&&keyCode<=63235)){
					setMode("moving");
				}
				else if(keyCode==8||keyCode==46||keyCode==127){
					setMode("deleting");
				}
				else if(keyCode==13){
					setMode("newlines");
				}
				else if(keyCode==27){
					setMode("escape");
				}
				else if((keyCode<16||keyCode>20)&&keyCode!=91){
					setMode("typing");
				}
			}
		};
		var setEventHandlers=function(){
			util.addEvent(wmd.panels.input,"keypress",function(event){
				if((event.ctrlKey||event.metaKey)&&(event.keyCode==89||event.keyCode==90)){
					event.preventDefault();
				}
			});
			var handlePaste=function(){
				if(global.isIE||(inputStateObj&&inputStateObj.text!=wmd.panels.input.value)){
					if(timer==undefined){
						mode="paste";
						saveState();
						refreshState();
					}
				}
			};
			poller=new wmd.inputPoller(handlePaste,pastePollInterval);
			util.addEvent(wmd.panels.input,"keydown",handleCtrlYZ);
			util.addEvent(wmd.panels.input,"keydown",handleModeChange);
			util.addEvent(wmd.panels.input,"mousedown",function(){
				setMode("moving");
			});
			wmd.panels.input.onpaste=handlePaste;
			wmd.panels.input.ondrop=handlePaste;
		};
		var init=function(){
			setEventHandlers();
			refreshState();
			saveState();
		};
		this.destroy=function(){
			if(poller){
				poller.destroy();
			}
		};
		init();
	};
	wmd.editor=function(previewRefreshCallback){
		if(!previewRefreshCallback){
			previewRefreshCallback=function(){};
		}
		var inputBox=wmd.panels.input;
		var offsetHeight=0;
		var editObj=this;
		var mainDiv;
		var mainSpan;
		var div;
		var creationHandle;
		var undoMgr;
		var doClick=function(button){
			inputBox.focus();
			if(button.textOp){
				if(undoMgr){
					undoMgr.setCommandMode();
				}
				var state=new wmd.TextareaState();
				if(!state){
					return;
				}
				var chunks=state.getChunks();
				var fixupInputArea=function(){
					inputBox.focus();
					if(chunks){
						state.setChunks(chunks);
					}
					state.restore();
					previewRefreshCallback();
				};
				var useDefaultText=true;
				var noCleanup=button.textOp(chunks,fixupInputArea,useDefaultText);
				if(!noCleanup){
					fixupInputArea();
				}
			}
			if(button.execute){
				button.execute(editObj);
			}
		};
		var setUndoRedoButtonStates=function(){
			if(undoMgr){
				setupButton(document.getElementById("wmd-undo-button"),undoMgr.canUndo());
				setupButton(document.getElementById("wmd-redo-button"),undoMgr.canRedo());
			}
		};
		var setupButton=function(button,isEnabled){
			var normalYShift="0px";
			var disabledYShift="-20px";
			var highlightYShift="-40px";
			if(isEnabled){
				button.style.backgroundPosition=button.XShift+" "+normalYShift;
				button.onmouseover=function(){
					this.style.backgroundPosition=this.XShift+" "+highlightYShift;
				};
				button.onmouseout=function(){
					this.style.backgroundPosition=this.XShift+" "+normalYShift;
				};
				if(global.isIE){
					button.onmousedown=function(){
						wmd.ieRetardedClick=true;
						wmd.ieCachedRange=document.selection.createRange();
					};
				}
				if(!button.isHelp)
				{
					button.onclick=function(){
						if(this.onmouseout){
							this.onmouseout();
						}
						doClick(this);
						return false;
					}
				}
			}
			else{
				button.style.backgroundPosition=button.XShift+" "+disabledYShift;
				button.onmouseover=button.onmouseout=button.onclick=function(){};
			}
		}
		var makeSpritedButtonRow=function(){
			var buttonBar=document.getElementById("wmd-button-bar");
			var normalYShift="0px";
			var disabledYShift="-20px";
			var highlightYShift="-40px";
			var buttonRow=document.createElement("ul");
			buttonRow.id="wmd-button-row";
			buttonRow=buttonBar.appendChild(buttonRow);
			var boldButton=document.createElement("li");
			boldButton.className="wmd-button";
			boldButton.id="wmd-bold-button";
			boldButton.title="Strong <strong> Ctrl+B";
			boldButton.XShift="0px";
			boldButton.textOp=command.doBold;
			setupButton(boldButton,true);
			buttonRow.appendChild(boldButton);
			var italicButton=document.createElement("li");
			italicButton.className="wmd-button";
			italicButton.id="wmd-italic-button";
			italicButton.title="Emphasis <em> Ctrl+I";
			italicButton.XShift="-20px";
			italicButton.textOp=command.doItalic;
			setupButton(italicButton,true);
			buttonRow.appendChild(italicButton);
			var spacer1=document.createElement("li");
			spacer1.className="wmd-spacer";
			spacer1.id="wmd-spacer1";
			buttonRow.appendChild(spacer1);
			var linkButton=document.createElement("li");
			linkButton.className="wmd-button";
			linkButton.id="wmd-link-button";
			linkButton.title="Hyperlink <a> Ctrl+L";
			linkButton.XShift="-40px";
			linkButton.textOp=function(chunk,postProcessing,useDefaultText){
				return command.doLinkOrImage(chunk,postProcessing,false);
			};
			setupButton(linkButton,true);
			buttonRow.appendChild(linkButton);
			var quoteButton=document.createElement("li");
			quoteButton.className="wmd-button";
			quoteButton.id="wmd-quote-button";
			quoteButton.title="Blockquote <blockquote> Ctrl+Q";
			quoteButton.XShift="-60px";
			quoteButton.textOp=command.doBlockquote;
			setupButton(quoteButton,true);
			buttonRow.appendChild(quoteButton);
			var codeButton=document.createElement("li");
			codeButton.className="wmd-button";
			codeButton.id="wmd-code-button";
			codeButton.title="Code Sample <pre><code> Ctrl+K";
			codeButton.XShift="-80px";
			codeButton.textOp=command.doCode;
			setupButton(codeButton,true);
			buttonRow.appendChild(codeButton);
			var imageButton=document.createElement("li");
			imageButton.className="wmd-button";
			imageButton.id="wmd-image-button";
			imageButton.title="Image <img> Ctrl+G";
			imageButton.XShift="-100px";
			imageButton.textOp=function(chunk,postProcessing,useDefaultText){
				return command.doLinkOrImage(chunk,postProcessing,true);
			};
			setupButton(imageButton,true);
			buttonRow.appendChild(imageButton);
			var spacer2=document.createElement("li");
			spacer2.className="wmd-spacer";
			spacer2.id="wmd-spacer2";
			buttonRow.appendChild(spacer2);
			var olistButton=document.createElement("li");
			olistButton.className="wmd-button";
			olistButton.id="wmd-olist-button";
			olistButton.title="Numbered List <ol> Ctrl+O";
			olistButton.XShift="-120px";
			olistButton.textOp=function(chunk,postProcessing,useDefaultText){
				command.doList(chunk,postProcessing,true,useDefaultText);
			};
			setupButton(olistButton,true);
			buttonRow.appendChild(olistButton);
			var ulistButton=document.createElement("li");
			ulistButton.className="wmd-button";
			ulistButton.id="wmd-ulist-button";
			ulistButton.title="Bulleted List <ul> Ctrl+U";
			ulistButton.XShift="-140px";
			ulistButton.textOp=function(chunk,postProcessing,useDefaultText){
				command.doList(chunk,postProcessing,false,useDefaultText);
			};
			setupButton(ulistButton,true);
			buttonRow.appendChild(ulistButton);
			var headingButton=document.createElement("li");
			headingButton.className="wmd-button";
			headingButton.id="wmd-heading-button";
			headingButton.title="Heading <h1>/<h2> Ctrl+H";
			headingButton.XShift="-160px";
			headingButton.textOp=command.doHeading;
			setupButton(headingButton,true);
			buttonRow.appendChild(headingButton);
			var hrButton=document.createElement("li");
			hrButton.className="wmd-button";
			hrButton.id="wmd-hr-button";
			hrButton.title="Horizontal Rule <hr> Ctrl+R";
			hrButton.XShift="-180px";
			hrButton.textOp=command.doHorizontalRule;
			setupButton(hrButton,true);
			buttonRow.appendChild(hrButton);
			var spacer3=document.createElement("li");
			spacer3.className="wmd-spacer";
			spacer3.id="wmd-spacer3";
			buttonRow.appendChild(spacer3);
			var undoButton=document.createElement("li");
			undoButton.className="wmd-button";
			undoButton.id="wmd-undo-button";
			undoButton.title="Undo - Ctrl+Z";
			undoButton.XShift="-200px";
			undoButton.execute=function(manager){
				manager.undo();
			};
			setupButton(undoButton,true);
			buttonRow.appendChild(undoButton);
			var redoButton=document.createElement("li");
			redoButton.className="wmd-button";
			redoButton.id="wmd-redo-button";
			redoButton.title="Redo - Ctrl+Y";
			if(/win/.test(nav.platform.toLowerCase())){
				redoButton.title="Redo - Ctrl+Y";
			}
			else{
				redoButton.title="Redo - Ctrl+Shift+Z";
			}
			redoButton.XShift="-220px";
			redoButton.execute=function(manager){
				manager.redo();
			};
			setupButton(redoButton,true);
			buttonRow.appendChild(redoButton);
			var helpButton=document.createElement("li");
			helpButton.className="wmd-button";
			helpButton.id="wmd-help-button";
			helpButton.XShift="-240px";
			helpButton.isHelp=true;
			var helpAnchor=document.createElement("a");
			helpAnchor.href=helpLink;
			helpAnchor.target=helpTarget
			helpAnchor.title=helpHoverTitle;
			helpButton.appendChild(helpAnchor);
			setupButton(helpButton,true);
			buttonRow.appendChild(helpButton);
			setUndoRedoButtonStates();
		}
		var setupEditor=function(){
			if(/\?noundo/.test(doc.location.href)){
				wmd.nativeUndo=true;
			}
			if(!wmd.nativeUndo){
				undoMgr=new wmd.undoManager(function(){
					previewRefreshCallback();
					setUndoRedoButtonStates();
				});
			}
			makeSpritedButtonRow();
			var keyEvent="keydown";
			if(global.isOpera){
				keyEvent="keypress";
			}
			util.addEvent(inputBox,keyEvent,function(key){
				if(key.ctrlKey||key.metaKey){
					var keyCode=key.charCode||key.keyCode;
					var keyCodeStr=String.fromCharCode(keyCode).toLowerCase();
					switch(keyCodeStr){
						case"b":
							doClick(document.getElementById("wmd-bold-button"));
							break;
						case"i":
							doClick(document.getElementById("wmd-italic-button"));
							break;
						case"l":
							doClick(document.getElementById("wmd-link-button"));
							break;
						case"q":
							doClick(document.getElementById("wmd-quote-button"));
							break;
						case"k":
							doClick(document.getElementById("wmd-code-button"));
							break;
						case"g":
							doClick(document.getElementById("wmd-image-button"));
							break;
						case"o":
							doClick(document.getElementById("wmd-olist-button"));
							break;
						case"u":
							doClick(document.getElementById("wmd-ulist-button"));
							break;
						case"h":
							doClick(document.getElementById("wmd-heading-button"));
							break;
						case"r":
							doClick(document.getElementById("wmd-hr-button"));
							break;
						case"y":
							doClick(document.getElementById("wmd-redo-button"));
							break;
						case"z":
							if(key.shiftKey){
								doClick(document.getElementById("wmd-redo-button"));
							}
							else{
								doClick(document.getElementById("wmd-undo-button"));
							}
							break;
						default:
							return;
					}
					if(key.preventDefault){
						key.preventDefault();
					}
					if(top.event){
						top.event.returnValue=false;
					}
				}
			});
			util.addEvent(inputBox,"keyup",function(key){
				if(!key.shiftKey&&!key.ctrlKey&&!key.metaKey){
					var keyCode=key.charCode||key.keyCode;
					if(keyCode===13){
						fakeButton={};
						fakeButton.textOp=command.doAutoindent;
						doClick(fakeButton);
					}
				}
			});
			if(global.isIE){
				util.addEvent(inputBox,"keydown",function(key){
					var code=key.keyCode;
					if(code===27){
						return false;
					}
				});
			}
			if(inputBox.form){
				var submitCallback=inputBox.form.onsubmit;
				inputBox.form.onsubmit=function(){
					convertToHtml();
					if(submitCallback){
						return submitCallback.apply(this,arguments);
					}
				};
			}
		};
		var convertToHtml=function(){
			if(wmd.showdown){
				var markdownConverter=new wmd.showdown.converter();
			}
			var text=inputBox.value;
			var callback=function(){
				inputBox.value=text;
			};
			if(!/markdown/.test(wmd.wmd_env.output.toLowerCase())){
				if(markdownConverter){
					inputBox.value=markdownConverter.makeHtml(text);
					top.setTimeout(callback,0);
				}
			}
			return true;
		};
		this.undo=function(){
			if(undoMgr){
				undoMgr.undo();
			}
		};
		this.redo=function(){
			if(undoMgr){
				undoMgr.redo();
			}
		};
		var init=function(){
			setupEditor();
		};
		this.destroy=function(){
			if(undoMgr){
				undoMgr.destroy();
			}
			if(div.parentNode){
				div.parentNode.removeChild(div);
			}
			if(inputBox){
				inputBox.style.marginTop="";
			}
			top.clearInterval(creationHandle);
		};
		init();
	};
	wmd.TextareaState=function(){
		var stateObj=this;
		var inputArea=wmd.panels.input;
		this.init=function(){
			if(!util.isVisible(inputArea)){
				return;
			}
			this.setInputAreaSelectionStartEnd();
			this.scrollTop=inputArea.scrollTop;
			if(!this.text&&inputArea.selectionStart||inputArea.selectionStart===0){
				this.text=inputArea.value;
			}
		}
		this.setInputAreaSelection=function(){
			if(!util.isVisible(inputArea)){
				return;
			}
			if(inputArea.selectionStart!==undefined&&!global.isOpera){
				inputArea.focus();
				inputArea.selectionStart=stateObj.start;
				inputArea.selectionEnd=stateObj.end;
				inputArea.scrollTop=stateObj.scrollTop;
			}
			else if(doc.selection){
				if(doc.activeElement&&doc.activeElement!==inputArea){
					return;
				}
				inputArea.focus();
				var range=inputArea.createTextRange();
				range.moveStart("character",-inputArea.value.length);
				range.moveEnd("character",-inputArea.value.length);
				range.moveEnd("character",stateObj.end);
				range.moveStart("character",stateObj.start);
				range.select();
			}
		};
		this.setInputAreaSelectionStartEnd=function(){
			if(inputArea.selectionStart||inputArea.selectionStart===0){
				stateObj.start=inputArea.selectionStart;
				stateObj.end=inputArea.selectionEnd;
			}
			else if(doc.selection){
				stateObj.text=util.fixEolChars(inputArea.value);
				var range;
				if(wmd.ieRetardedClick&&wmd.ieCachedRange){
					range=wmd.ieCachedRange;
					wmd.ieRetardedClick=false;
				}
				else{
					range=doc.selection.createRange();
				}
				var fixedRange=util.fixEolChars(range.text);
				var marker="\x07";
				var markedRange=marker+fixedRange+marker;
				range.text=markedRange;
				var inputText=util.fixEolChars(inputArea.value);
				range.moveStart("character",-markedRange.length);
				range.text=fixedRange;
				stateObj.start=inputText.indexOf(marker);
				stateObj.end=inputText.lastIndexOf(marker)-marker.length;
				var len=stateObj.text.length-util.fixEolChars(inputArea.value).length;
				if(len){
					range.moveStart("character",-fixedRange.length);
					while(len--){
						fixedRange+="\n";
						stateObj.end+=1;
					}
					range.text=fixedRange;
				}
				this.setInputAreaSelection();
			}
		};
		this.restore=function(){
			if(stateObj.text!=undefined&&stateObj.text!=inputArea.value){
				inputArea.value=stateObj.text;
			}
			this.setInputAreaSelection();
			inputArea.scrollTop=stateObj.scrollTop;
		};
		this.getChunks=function(){
			var chunk=new wmd.Chunks();
			chunk.before=util.fixEolChars(stateObj.text.substring(0,stateObj.start));
			chunk.startTag="";
			chunk.selection=util.fixEolChars(stateObj.text.substring(stateObj.start,stateObj.end));
			chunk.endTag="";
			chunk.after=util.fixEolChars(stateObj.text.substring(stateObj.end));
			chunk.scrollTop=stateObj.scrollTop;
			return chunk;
		};
		this.setChunks=function(chunk){
			chunk.before=chunk.before+chunk.startTag;
			chunk.after=chunk.endTag+chunk.after;
			if(global.isOpera){
				chunk.before=chunk.before.replace(/\n/g,"\r\n");
				chunk.selection=chunk.selection.replace(/\n/g,"\r\n");
				chunk.after=chunk.after.replace(/\n/g,"\r\n");
			}
			this.start=chunk.before.length;
			this.end=chunk.before.length+chunk.selection.length;
			this.text=chunk.before+chunk.selection+chunk.after;
			this.scrollTop=chunk.scrollTop;
		};
		this.init();
	};
	wmd.Chunks=function(){
	};
	wmd.Chunks.prototype.findTags=function(startRegex,endRegex){
		var chunkObj=this;
		var regex;
		if(startRegex){
			regex=util.extendRegExp(startRegex,"","$");
			this.before=this.before.replace(regex,
				function(match){
					chunkObj.startTag=chunkObj.startTag+match;
					return"";
				});
			regex=util.extendRegExp(startRegex,"^","");
			this.selection=this.selection.replace(regex,
				function(match){
					chunkObj.startTag=chunkObj.startTag+match;
					return"";
				});
		}
		if(endRegex){
			regex=util.extendRegExp(endRegex,"","$");
			this.selection=this.selection.replace(regex,
				function(match){
					chunkObj.endTag=match+chunkObj.endTag;
					return"";
				});
			regex=util.extendRegExp(endRegex,"^","");
			this.after=this.after.replace(regex,
				function(match){
					chunkObj.endTag=match+chunkObj.endTag;
					return"";
				});
		}
	};
	wmd.Chunks.prototype.trimWhitespace=function(remove){
		this.selection=this.selection.replace(/^(\s*)/,"");
		if(!remove){
			this.before+=re.$1;
		}
		this.selection=this.selection.replace(/(\s*)$/,"");
		if(!remove){
			this.after=re.$1+this.after;
		}
	};
	wmd.Chunks.prototype.addBlankLines=function(nLinesBefore,nLinesAfter,findExtraNewlines){
		if(nLinesBefore===undefined){
			nLinesBefore=1;
		}
		if(nLinesAfter===undefined){
			nLinesAfter=1;
		}
		nLinesBefore++;
		nLinesAfter++;
		var regexText;
		var replacementText;
		this.selection=this.selection.replace(/(^\n*)/,"");
		this.startTag=this.startTag+re.$1;
		this.selection=this.selection.replace(/(\n*$)/,"");
		this.endTag=this.endTag+re.$1;
		this.startTag=this.startTag.replace(/(^\n*)/,"");
		this.before=this.before+re.$1;
		this.endTag=this.endTag.replace(/(\n*$)/,"");
		this.after=this.after+re.$1;
		if(this.before){
			regexText=replacementText="";
			while(nLinesBefore--){
				regexText+="\\n?";
				replacementText+="\n";
			}
			if(findExtraNewlines){
				regexText="\\n*";
			}
			this.before=this.before.replace(new re(regexText+"$",""),replacementText);
		}
		if(this.after){
			regexText=replacementText="";
			while(nLinesAfter--){
				regexText+="\\n?";
				replacementText+="\n";
			}
			if(findExtraNewlines){
				regexText="\\n*";
			}
			this.after=this.after.replace(new re(regexText,""),replacementText);
		}
	};
	command.prefixes="(?:\\s{4,}|\\s*>|\\s*-\\s+|\\s*\\d+\\.|=|\\+|-|_|\\*|#|\\s*\\[[^\n]]+\\]:)";
	command.unwrap=function(chunk){
		var txt=new re("([^\\n])\\n(?!(\\n|"+command.prefixes+"))","g");
		chunk.selection=chunk.selection.replace(txt,"$1 $2");
	};
	command.wrap=function(chunk,len){
		command.unwrap(chunk);
		var regex=new re("(.{1,"+len+"})( +|$\\n?)","gm");
		chunk.selection=chunk.selection.replace(regex,function(line,marked){
			if(new re("^"+command.prefixes,"").test(line)){
				return line;
			}
			return marked+"\n";
		});
		chunk.selection=chunk.selection.replace(/\s+$/,"");
	};
	command.doBold=function(chunk,postProcessing,useDefaultText){
		return command.doBorI(chunk,2,"strong text");
	};
	command.doItalic=function(chunk,postProcessing,useDefaultText){
		return command.doBorI(chunk,1,"emphasized text");
	};
	command.doBorI=function(chunk,nStars,insertText){
		chunk.trimWhitespace();
		chunk.selection=chunk.selection.replace(/\n{2,}/g,"\n");
		chunk.before.search(/(\**$)/);
		var starsBefore=re.$1;
		chunk.after.search(/(^\**)/);
		var starsAfter=re.$1;
		var prevStars=Math.min(starsBefore.length,starsAfter.length);
		if((prevStars>=nStars)&&(prevStars!=2||nStars!=1)){
			chunk.before=chunk.before.replace(re("[*]{"+nStars+"}$",""),"");
			chunk.after=chunk.after.replace(re("^[*]{"+nStars+"}",""),"");
		}
		else if(!chunk.selection&&starsAfter){
			chunk.after=chunk.after.replace(/^([*_]*)/,"");
			chunk.before=chunk.before.replace(/(\s?)$/,"");
			var whitespace=re.$1;
			chunk.before=chunk.before+starsAfter+whitespace;
		}
		else{
			if(!chunk.selection&&!starsAfter){
				chunk.selection=insertText;
			}
			var markup=nStars<=1?"*":"**";
			chunk.before=chunk.before+markup;
			chunk.after=markup+chunk.after;
		}
		return;
	};
	command.stripLinkDefs=function(text,defsToAdd){
		text=text.replace(/^[ ]{0,3}\[(\d+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|$)/gm,
			function(totalMatch,id,link,newlines,title){
				defsToAdd[id]=totalMatch.replace(/\s*$/,"");
				if(newlines){
					defsToAdd[id]=totalMatch.replace(/["(](.+?)[")]$/,"");
					return newlines+title;
				}
				return"";
			});
		return text;
	};
	command.addLinkDef=function(chunk,linkDef){
		var refNumber=0;
		var defsToAdd={};
		chunk.before=command.stripLinkDefs(chunk.before,defsToAdd);
		chunk.selection=command.stripLinkDefs(chunk.selection,defsToAdd);
		chunk.after=command.stripLinkDefs(chunk.after,defsToAdd);
		var defs="";
		var regex=/(\[(?:\[[^\]]*\]|[^\[\]])*\][ ]?(?:\n[ ]*)?\[)(\d+)(\])/g;
		var addDefNumber=function(def){
			refNumber++;
			def=def.replace(/^[ ]{0,3}\[(\d+)\]:/,"  ["+refNumber+"]:");
			defs+="\n"+def;
		};
		var getLink=function(wholeMatch,link,id,end){
			if(defsToAdd[id]){
				addDefNumber(defsToAdd[id]);
				return link+refNumber+end;
			}
			return wholeMatch;
		};
		chunk.before=chunk.before.replace(regex,getLink);
		if(linkDef){
			addDefNumber(linkDef);
		}
		else{
			chunk.selection=chunk.selection.replace(regex,getLink);
		}
		var refOut=refNumber;
		chunk.after=chunk.after.replace(regex,getLink);
		if(chunk.after){
			chunk.after=chunk.after.replace(/\n*$/,"");
		}
		if(!chunk.after){
			chunk.selection=chunk.selection.replace(/\n*$/,"");
		}
		chunk.after+="\n\n"+defs;
		return refOut;
	};
	command.doLinkOrImage=function(chunk,postProcessing,isImage){
		chunk.trimWhitespace();
		chunk.findTags(/\s*!?\[/,/\][ ]?(?:\n[ ]*)?(\[.*?\])?/);
		if(chunk.endTag.length>1){
			chunk.startTag=chunk.startTag.replace(/!?\[/,"");
			chunk.endTag="";
			command.addLinkDef(chunk,null);
		}
		else{
			if(/\n\n/.test(chunk.selection)){
				command.addLinkDef(chunk,null);
				return;
			}
			var makeLinkMarkdown=function(link){
				if(link!==null){
					chunk.startTag=chunk.endTag="";
					var linkDef=" [999]: "+link;
					var num=command.addLinkDef(chunk,linkDef);
					chunk.startTag=isImage?"![":"[";
					chunk.endTag="]["+num+"]";
					if(!chunk.selection){
						if(isImage){
							chunk.selection="alt text";
						}
						else{
							chunk.selection="link text";
						}
					}
				}
				postProcessing();
			};
			if(isImage){
				util.prompt(imageDialogText,imageDefaultText,makeLinkMarkdown);
			}
			else{
				util.prompt(linkDialogText,linkDefaultText,makeLinkMarkdown);
			}
			return true;
		}
	};
	util.makeAPI=function(){
		wmd.wmd={};
		wmd.wmd.editor=wmd.editor;
		wmd.wmd.previewManager=wmd.previewManager;
	};
	util.startEditor=function(){
		if(wmd.wmd_env.autostart===false){
			util.makeAPI();
			return;
		}
		var edit;
		var previewMgr;
		var loadListener=function(){
			wmd.panels=new wmd.PanelCollection();
			previewMgr=new wmd.previewManager();
			var previewRefreshCallback=previewMgr.refresh;
			edit=new wmd.editor(previewRefreshCallback);
			previewMgr.refresh(true);
		};
		util.addEvent(top,"load",loadListener);
	};
	wmd.previewManager=function(){
		var managerObj=this;
		var converter;
		var poller;
		var timeout;
		var elapsedTime;
		var oldInputText;
		var htmlOut;
		var maxDelay=3000;
		var startType="delayed";
		var setupEvents=function(inputElem,listener){
			util.addEvent(inputElem,"input",listener);
			inputElem.onpaste=listener;
			inputElem.ondrop=listener;
			util.addEvent(inputElem,"keypress",listener);
			util.addEvent(inputElem,"keydown",listener);
			poller=new wmd.inputPoller(listener,previewPollInterval);
		};
		var getDocScrollTop=function(){
			var result=0;
			if(top.innerHeight){
				result=top.pageYOffset;
			}
			else
			if(doc.documentElement&&doc.documentElement.scrollTop){
				result=doc.documentElement.scrollTop;
			}
			else
			if(doc.body){
				result=doc.body.scrollTop;
			}
			return result;
		};
		var makePreviewHtml=function(){
			if(!wmd.panels.preview&&!wmd.panels.output){
				return;
			}
			var text=wmd.panels.input.value;
			if(text&&text==oldInputText){
				return;
			}
			else{
				oldInputText=text;
			}
			var prevTime=new Date().getTime();
			if(!converter&&wmd.showdown){
				converter=new wmd.showdown.converter();
			}
			if(converter){
				text=converter.makeHtml(text);
			}
			var currTime=new Date().getTime();
			elapsedTime=currTime-prevTime;
			pushPreviewHtml(text);
			htmlOut=text;
		};
		var applyTimeout=function(){
			if(timeout){
				top.clearTimeout(timeout);
				timeout=undefined;
			}
			if(startType!=="manual"){
				var delay=0;
				if(startType==="delayed"){
					delay=elapsedTime;
				}
				if(delay>maxDelay){
					delay=maxDelay;
				}
				timeout=top.setTimeout(makePreviewHtml,delay);
			}
		};
		var getScaleFactor=function(panel){
			if(panel.scrollHeight<=panel.clientHeight){
				return 1;
			}
			return panel.scrollTop/(panel.scrollHeight-panel.clientHeight);
		};
		var setPanelScrollTops=function(){
			if(wmd.panels.preview){
				wmd.panels.preview.scrollTop=(wmd.panels.preview.scrollHeight-wmd.panels.preview.clientHeight)*getScaleFactor(wmd.panels.preview);
				;
			}
			if(wmd.panels.output){
				wmd.panels.output.scrollTop=(wmd.panels.output.scrollHeight-wmd.panels.output.clientHeight)*getScaleFactor(wmd.panels.output);
				;
			}
		};
		this.refresh=function(requiresRefresh){
			if(requiresRefresh){
				oldInputText="";
				makePreviewHtml();
			}
			else{
				applyTimeout();
			}
		};
		this.processingTime=function(){
			return elapsedTime;
		};
		this.output=function(){
			return htmlOut;
		};
		this.setUpdateMode=function(mode){
			startType=mode;
			managerObj.refresh();
		};
		var isFirstTimeFilled=true;
		var pushPreviewHtml=function(text){
			var emptyTop=position.getTop(wmd.panels.input)-getDocScrollTop();
			if(wmd.panels.output){
				if(wmd.panels.output.value!==undefined){
					wmd.panels.output.value=text;
					wmd.panels.output.readOnly=true;
				}
				else{
					var newText=text.replace(/&/g,"&amp;");
					newText=newText.replace(/</g,"&lt;");
					wmd.panels.output.innerHTML="<pre><code>"+newText+"</code></pre>";
				}
			}
			if(wmd.panels.preview){
				wmd.panels.preview.innerHTML=text;
			}
			setPanelScrollTops();
			if(isFirstTimeFilled){
				isFirstTimeFilled=false;
				return;
			}
			var fullTop=position.getTop(wmd.panels.input)-getDocScrollTop();
			if(global.isIE){
				top.setTimeout(function(){
					top.scrollBy(0,fullTop-emptyTop);
				},0);
			}
			else{
				top.scrollBy(0,fullTop-emptyTop);
			}
		};
		var init=function(){
			setupEvents(wmd.panels.input,applyTimeout);
			makePreviewHtml();
			if(wmd.panels.preview){
				wmd.panels.preview.scrollTop=0;
			}
			if(wmd.panels.output){
				wmd.panels.output.scrollTop=0;
			}
		};
		this.destroy=function(){
			if(poller){
				poller.destroy();
			}
		};
		init();
	};
	command.doAutoindent=function(chunk,postProcessing,useDefaultText){
		chunk.before=chunk.before.replace(/(\n|^)[ ]{0,3}([*+-]|\d+[.])[ \t]*\n$/,"\n\n");
		chunk.before=chunk.before.replace(/(\n|^)[ ]{0,3}>[ \t]*\n$/,"\n\n");
		chunk.before=chunk.before.replace(/(\n|^)[ \t]+\n$/,"\n\n");
		useDefaultText=false;
		if(/(\n|^)[ ]{0,3}([*+-])[ \t]+.*\n$/.test(chunk.before)){
			if(command.doList){
				command.doList(chunk,postProcessing,false,true);
			}
		}
		if(/(\n|^)[ ]{0,3}(\d+[.])[ \t]+.*\n$/.test(chunk.before)){
			if(command.doList){
				command.doList(chunk,postProcessing,true,true);
			}
		}
		if(/(\n|^)[ ]{0,3}>[ \t]+.*\n$/.test(chunk.before)){
			if(command.doBlockquote){
				command.doBlockquote(chunk,postProcessing,useDefaultText);
			}
		}
		if(/(\n|^)(\t|[ ]{4,}).*\n$/.test(chunk.before)){
			if(command.doCode){
				command.doCode(chunk,postProcessing,useDefaultText);
			}
		}
	};
	command.doBlockquote=function(chunk,postProcessing,useDefaultText){
		chunk.selection=chunk.selection.replace(/^(\n*)([^\r]+?)(\n*)$/,
			function(totalMatch,newlinesBefore,text,newlinesAfter){
				chunk.before+=newlinesBefore;
				chunk.after=newlinesAfter+chunk.after;
				return text;
			});
		chunk.before=chunk.before.replace(/(>[ \t]*)$/,
			function(totalMatch,blankLine){
				chunk.selection=blankLine+chunk.selection;
				return"";
			});
		var defaultText=useDefaultText?"Blockquote":"";
		chunk.selection=chunk.selection.replace(/^(\s|>)+$/,"");
		chunk.selection=chunk.selection||defaultText;
		if(chunk.before){
			chunk.before=chunk.before.replace(/\n?$/,"\n");
		}
		if(chunk.after){
			chunk.after=chunk.after.replace(/^\n?/,"\n");
		}
		chunk.before=chunk.before.replace(/(((\n|^)(\n[ \t]*)*>(.+\n)*.*)+(\n[ \t]*)*$)/,
			function(totalMatch){
				chunk.startTag=totalMatch;
				return"";
			});
		chunk.after=chunk.after.replace(/^(((\n|^)(\n[ \t]*)*>(.+\n)*.*)+(\n[ \t]*)*)/,
			function(totalMatch){
				chunk.endTag=totalMatch;
				return"";
			});
		var replaceBlanksInTags=function(useBracket){
			var replacement=useBracket?"> ":"";
			if(chunk.startTag){
				chunk.startTag=chunk.startTag.replace(/\n((>|\s)*)\n$/,
					function(totalMatch,markdown){
						return"\n"+markdown.replace(/^[ ]{0,3}>?[ \t]*$/gm,replacement)+"\n";
					});
			}
			if(chunk.endTag){
				chunk.endTag=chunk.endTag.replace(/^\n((>|\s)*)\n/,
					function(totalMatch,markdown){
						return"\n"+markdown.replace(/^[ ]{0,3}>?[ \t]*$/gm,replacement)+"\n";
					});
			}
		};
		if(/^(?![ ]{0,3}>)/m.test(chunk.selection)){
			command.wrap(chunk,wmd.wmd_env.lineLength-2);
			chunk.selection=chunk.selection.replace(/^/gm,"> ");
			replaceBlanksInTags(true);
			chunk.addBlankLines();
		}
		else{
			chunk.selection=chunk.selection.replace(/^[ ]{0,3}> ?/gm,"");
			command.unwrap(chunk);
			replaceBlanksInTags(false);
			if(!/^(\n|^)[ ]{0,3}>/.test(chunk.selection)&&chunk.startTag){
				chunk.startTag=chunk.startTag.replace(/\n{0,2}$/,"\n\n");
			}
			if(!/(\n|^)[ ]{0,3}>.*$/.test(chunk.selection)&&chunk.endTag){
				chunk.endTag=chunk.endTag.replace(/^\n{0,2}/,"\n\n");
			}
		}
		if(!/\n/.test(chunk.selection)){
			chunk.selection=chunk.selection.replace(/^(> *)/,
				function(wholeMatch,blanks){
					chunk.startTag+=blanks;
					return"";
				});
		}
	};
	command.doCode=function(chunk,postProcessing,useDefaultText){
		var hasTextBefore=/\S[ ]*$/.test(chunk.before);
		var hasTextAfter=/^[ ]*\S/.test(chunk.after);
		if((!hasTextAfter&&!hasTextBefore)||/\n/.test(chunk.selection)){
			chunk.before=chunk.before.replace(/[ ]{4}$/,
				function(totalMatch){
					chunk.selection=totalMatch+chunk.selection;
					return"";
				});
			var nLinesBefore=1;
			var nLinesAfter=1;
			if(/\n(\t|[ ]{4,}).*\n$/.test(chunk.before)||chunk.after===""){
				nLinesBefore=0;
			}
			if(/^\n(\t|[ ]{4,})/.test(chunk.after)){
				nLinesAfter=0;
			}
			chunk.addBlankLines(nLinesBefore,nLinesAfter);
			if(!chunk.selection){
				chunk.startTag="    ";
				chunk.selection=useDefaultText?"enter code here":"";
			}
			else{
				if(/^[ ]{0,3}\S/m.test(chunk.selection)){
					chunk.selection=chunk.selection.replace(/^/gm,"    ");
				}
				else{
					chunk.selection=chunk.selection.replace(/^[ ]{4}/gm,"");
				}
			}
		}
		else{
			chunk.trimWhitespace();
			chunk.findTags(/`/,/`/);
			if(!chunk.startTag&&!chunk.endTag){
				chunk.startTag=chunk.endTag="`";
				if(!chunk.selection){
					chunk.selection=useDefaultText?"enter code here":"";
				}
			}
			else if(chunk.endTag&&!chunk.startTag){
				chunk.before+=chunk.endTag;
				chunk.endTag="";
			}
			else{
				chunk.startTag=chunk.endTag="";
			}
		}
	};
	command.doList=function(chunk,postProcessing,isNumberedList,useDefaultText){
		var previousItemsRegex=/(\n|^)(([ ]{0,3}([*+-]|\d+[.])[ \t]+.*)(\n.+|\n{2,}([*+-].*|\d+[.])[ \t]+.*|\n{2,}[ \t]+\S.*)*)\n*$/;
		var nextItemsRegex=/^\n*(([ ]{0,3}([*+-]|\d+[.])[ \t]+.*)(\n.+|\n{2,}([*+-].*|\d+[.])[ \t]+.*|\n{2,}[ \t]+\S.*)*)\n*/;
		var bullet="-";
		var num=1;
		var getItemPrefix=function(){
			var prefix;
			if(isNumberedList){
				prefix=" "+num+". ";
				num++;
			}
			else{
				prefix=" "+bullet+" ";
			}
			return prefix;
		};
		var getPrefixedItem=function(itemText){
			if(isNumberedList===undefined){
				isNumberedList=/^\s*\d/.test(itemText);
			}
			itemText=itemText.replace(/^[ ]{0,3}([*+-]|\d+[.])\s/gm,
				function(_){
					return getItemPrefix();
				});
			return itemText;
		};
		chunk.findTags(/(\n|^)*[ ]{0,3}([*+-]|\d+[.])\s+/,null);
		if(chunk.before&&!/\n$/.test(chunk.before)&&!/^\n/.test(chunk.startTag)){
			chunk.before+=chunk.startTag;
			chunk.startTag="";
		}
		if(chunk.startTag){
			var hasDigits=/\d+[.]/.test(chunk.startTag);
			chunk.startTag="";
			chunk.selection=chunk.selection.replace(/\n[ ]{4}/g,"\n");
			command.unwrap(chunk);
			chunk.addBlankLines();
			if(hasDigits){
				chunk.after=chunk.after.replace(nextItemsRegex,getPrefixedItem);
			}
			if(isNumberedList==hasDigits){
				return;
			}
		}
		var nLinesBefore=1;
		chunk.before=chunk.before.replace(previousItemsRegex,
			function(itemText){
				if(/^\s*([*+-])/.test(itemText)){
					bullet=re.$1;
				}
				nLinesBefore=/[^\n]\n\n[^\n]/.test(itemText)?1:0;
				return getPrefixedItem(itemText);
			});
		if(!chunk.selection){
			chunk.selection=useDefaultText?"List item":" ";
		}
		var prefix=getItemPrefix();
		var nLinesAfter=1;
		chunk.after=chunk.after.replace(nextItemsRegex,
			function(itemText){
				nLinesAfter=/[^\n]\n\n[^\n]/.test(itemText)?1:0;
				return getPrefixedItem(itemText);
			});
		chunk.trimWhitespace(true);
		chunk.addBlankLines(nLinesBefore,nLinesAfter,true);
		chunk.startTag=prefix;
		var spaces=prefix.replace(/./g," ");
		command.wrap(chunk,wmd.wmd_env.lineLength-spaces.length);
		chunk.selection=chunk.selection.replace(/\n/g,"\n"+spaces);
	};
	command.doHeading=function(chunk,postProcessing,useDefaultText){
		chunk.selection=chunk.selection.replace(/\s+/g," ");
		chunk.selection=chunk.selection.replace(/(^\s+|\s+$)/g,"");
		if(!chunk.selection){
			chunk.startTag="## ";
			chunk.selection="Heading";
			chunk.endTag=" ##";
			return;
		}
		var headerLevel=0;
		chunk.findTags(/#+[ ]*/,/[ ]*#+/);
		if(/#+/.test(chunk.startTag)){
			headerLevel=re.lastMatch.length;
		}
		chunk.startTag=chunk.endTag="";
		chunk.findTags(null,/\s?(-+|=+)/);
		if(/=+/.test(chunk.endTag)){
			headerLevel=1;
		}
		if(/-+/.test(chunk.endTag)){
			headerLevel=2;
		}
		chunk.startTag=chunk.endTag="";
		chunk.addBlankLines(1,1);
		var headerLevelToCreate=headerLevel==0?2:headerLevel-1;
		if(headerLevelToCreate>0){
			var headerChar=headerLevelToCreate>=2?"-":"=";
			var len=chunk.selection.length;
			if(len>wmd.wmd_env.lineLength){
				len=wmd.wmd_env.lineLength;
			}
			chunk.endTag="\n";
			while(len--){
				chunk.endTag+=headerChar;
			}
		}
	};
	command.doHorizontalRule=function(chunk,postProcessing,useDefaultText){
		chunk.startTag="----------\n";
		chunk.selection="";
		chunk.addBlankLines(2,1,true);
	}
};
Attacklab.wmd_env={};
Attacklab.account_options={};
Attacklab.wmd_defaults={version:1,output:"HTML",lineLength:40,delayLoad:false};
if(!Attacklab.wmd)
{
	Attacklab.wmd=function()
	{
		Attacklab.loadEnv=function()
		{
			var mergeEnv=function(env)
			{
				if(!env)
				{
					return;
				}
				for(var key in env)
				{
					Attacklab.wmd_env[key]=env[key];
				}
			};
			mergeEnv(Attacklab.wmd_defaults);
			mergeEnv(Attacklab.account_options);
			mergeEnv(top["wmd_options"]);
			Attacklab.full=true;
			var defaultButtons="bold italic link blockquote code image ol ul heading hr";
			Attacklab.wmd_env.buttons=Attacklab.wmd_env.buttons||defaultButtons;
		};
		Attacklab.loadEnv();
	};
	Attacklab.wmd();
	Attacklab.wmdBase();
	Attacklab.Util.startEditor();
};


// Textarea resizer
(function($){var textarea,staticOffset;var iLastMousePos=0;var iMin=32;var grip;$.fn.TextAreaResizer=function(){return this.each(function(){textarea=$(this).addClass('processed'),staticOffset=null;$(this).wrap('<div class="resizable-textarea"><span></span></div>').parent().append($('<div class="grippie"></div>').bind("mousedown",{el:this},startDrag));var grippie=$('div.grippie',$(this).parent())[0];grippie.style.marginRight=(grippie.offsetWidth-$(this)[0].offsetWidth)+'px'})};function startDrag(e){textarea=$(e.data.el);textarea.blur();iLastMousePos=mousePosition(e).y;staticOffset=textarea.height()-iLastMousePos;textarea.css('opacity',0.25);$(document).mousemove(performDrag).mouseup(endDrag);return false}function performDrag(e){var iThisMousePos=mousePosition(e).y;var iMousePos=staticOffset+iThisMousePos;if(iLastMousePos>=(iThisMousePos)){iMousePos-=5}iLastMousePos=iThisMousePos;iMousePos=Math.max(iMin,iMousePos);textarea.height(iMousePos+'px');if(iMousePos<iMin){endDrag(e)}return false}function endDrag(e){$(document).unbind('mousemove',performDrag).unbind('mouseup',endDrag);textarea.css('opacity',1);textarea.focus();textarea=null;staticOffset=null;iLastMousePos=0}function mousePosition(e){return{x:e.clientX+document.documentElement.scrollLeft,y:e.clientY+document.documentElement.scrollTop}}})(jQuery);


// zeroclipboard
// Simple Set Clipboard System
// Author: Joseph Huckaby

var ZeroClipboard = {

	version: "1.0.7",
	clients: {}, // registered upload clients on page, indexed by id
	moviePath: 'ZeroClipboard.swf', // URL to movie
	nextId: 1, // ID of next movie

	$: function(thingy) {
		// simple DOM lookup utility function
		if (typeof(thingy) == 'string') thingy = document.getElementById(thingy);
		if (!thingy.addClass) {
			// extend element with a few useful methods
			thingy.hide = function() { this.style.display = 'none'; };
			thingy.show = function() { this.style.display = ''; };
			thingy.addClass = function(name) { this.removeClass(name); this.className += ' ' + name; };
			thingy.removeClass = function(name) {
				var classes = this.className.split(/\s+/);
				var idx = -1;
				for (var k = 0; k < classes.length; k++) {
					if (classes[k] == name) { idx = k; k = classes.length; }
				}
				if (idx > -1) {
					classes.splice( idx, 1 );
					this.className = classes.join(' ');
				}
				return this;
			};
			thingy.hasClass = function(name) {
				return !!this.className.match( new RegExp("\\s*" + name + "\\s*") );
			};
		}
		return thingy;
	},

	setMoviePath: function(path) {
		// set path to ZeroClipboard.swf
		this.moviePath = path;
	},

	dispatch: function(id, eventName, args) {
		// receive event from flash movie, send to client
		var client = this.clients[id];
		if (client) {
			client.receiveEvent(eventName, args);
		}
	},

	register: function(id, client) {
		// register new client to receive events
		this.clients[id] = client;
	},

	getDOMObjectPosition: function(obj, stopObj) {
		// get absolute coordinates for dom element
		var info = {
			left: 0,
			top: 0,
			width: obj.width ? obj.width : obj.offsetWidth,
			height: obj.height ? obj.height : obj.offsetHeight
		};

		while (obj && (obj != stopObj)) {
			info.left += obj.offsetLeft;
			info.top += obj.offsetTop;
			obj = obj.offsetParent;
		}

		return info;
	},

	Client: function(elem) {
		// constructor for new simple upload client
		this.handlers = {};

		// unique ID
		this.id = ZeroClipboard.nextId++;
		this.movieId = 'ZeroClipboardMovie_' + this.id;

		// register client with singleton to receive flash events
		ZeroClipboard.register(this.id, this);

		// create movie
		if (elem) this.glue(elem);
	}
};

ZeroClipboard.Client.prototype = {

	id: 0, // unique ID for us
	ready: false, // whether movie is ready to receive events or not
	movie: null, // reference to movie object
	clipText: '', // text to copy to clipboard
	handCursorEnabled: true, // whether to show hand cursor, or default pointer cursor
	cssEffects: true, // enable CSS mouse effects on dom container
	handlers: null, // user event handlers

	glue: function(elem, appendElem, stylesToAdd) {
		// glue to DOM element
		// elem can be ID or actual DOM element object
		this.domElement = ZeroClipboard.$(elem);

		// float just above object, or zIndex 99 if dom element isn't set
		var zIndex = 99;
		if (this.domElement.style.zIndex) {
			zIndex = parseInt(this.domElement.style.zIndex, 10) + 1;
		}

		if (typeof(appendElem) == 'string') {
			appendElem = ZeroClipboard.$(appendElem);
		}
		else if (typeof(appendElem) == 'undefined') {
			appendElem = document.getElementsByTagName('body')[0];
		}

		// find X/Y position of domElement
		var box = ZeroClipboard.getDOMObjectPosition(this.domElement, appendElem);

		// create floating DIV above element
		this.div = document.createElement('div');
		var style = this.div.style;
		style.position = 'absolute';
		style.left = '' + box.left + 'px';
		style.top = '' + box.top + 'px';
		style.width = '' + box.width + 'px';
		style.height = '' + box.height + 'px';
		style.zIndex = zIndex;

		if (typeof(stylesToAdd) == 'object') {
			for (addedStyle in stylesToAdd) {
				style[addedStyle] = stylesToAdd[addedStyle];
			}
		}

		// style.backgroundColor = '#f00'; // debug

		appendElem.appendChild(this.div);

		this.div.innerHTML = this.getHTML( box.width, box.height );
	},

	getHTML: function(width, height) {
		// return HTML for movie
		var html = '';
		var flashvars = 'id=' + this.id +
			'&width=' + width +
			'&height=' + height;

		if (navigator.userAgent.match(/MSIE/)) {
			// IE gets an OBJECT tag
			var protocol = location.href.match(/^https/i) ? 'https://' : 'http://';
			html += '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="'+protocol+'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" width="'+width+'" height="'+height+'" id="'+this.movieId+'" align="middle"><param name="allowScriptAccess" value="always" /><param name="allowFullScreen" value="false" /><param name="movie" value="'+ZeroClipboard.moviePath+'" /><param name="loop" value="false" /><param name="menu" value="false" /><param name="quality" value="best" /><param name="bgcolor" value="#ffffff" /><param name="flashvars" value="'+flashvars+'"/><param name="wmode" value="transparent"/></object>';
		}
		else {
			// all other browsers get an EMBED tag
			html += '<embed id="'+this.movieId+'" src="'+ZeroClipboard.moviePath+'" loop="false" menu="false" quality="best" bgcolor="#ffffff" width="'+width+'" height="'+height+'" name="'+this.movieId+'" align="middle" allowScriptAccess="always" allowFullScreen="false" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="'+flashvars+'" wmode="transparent" />';
		}
		return html;
	},

	hide: function() {
		// temporarily hide floater offscreen
		if (this.div) {
			this.div.style.left = '-2000px';
		}
	},

	show: function() {
		// show ourselves after a call to hide()
		this.reposition();
	},

	destroy: function() {
		// destroy control and floater
		if (this.domElement && this.div) {
			this.hide();
			this.div.innerHTML = '';

			var body = document.getElementsByTagName('body')[0];
			try { body.removeChild( this.div ); } catch(e) {;}

			this.domElement = null;
			this.div = null;
		}
	},

	reposition: function(elem) {
		// reposition our floating div, optionally to new container
		// warning: container CANNOT change size, only position
		if (elem) {
			this.domElement = ZeroClipboard.$(elem);
			if (!this.domElement) this.hide();
		}

		if (this.domElement && this.div) {
			var box = ZeroClipboard.getDOMObjectPosition(this.domElement);
			var style = this.div.style;
			style.left = '' + box.left + 'px';
			style.top = '' + box.top + 'px';
		}
	},

	setText: function(newText) {
		// set text to be copied to clipboard
		this.clipText = newText;
		if (this.ready) this.movie.setText(newText);
	},

	addEventListener: function(eventName, func) {
		// add user event listener for event
		// event types: load, queueStart, fileStart, fileComplete, queueComplete, progress, error, cancel
		eventName = eventName.toString().toLowerCase().replace(/^on/, '');
		if (!this.handlers[eventName]) this.handlers[eventName] = [];
		this.handlers[eventName].push(func);
	},

	setHandCursor: function(enabled) {
		// enable hand cursor (true), or default arrow cursor (false)
		this.handCursorEnabled = enabled;
		if (this.ready) this.movie.setHandCursor(enabled);
	},

	setCSSEffects: function(enabled) {
		// enable or disable CSS effects on DOM container
		this.cssEffects = !!enabled;
	},

	receiveEvent: function(eventName, args) {
		// receive event from flash
		eventName = eventName.toString().toLowerCase().replace(/^on/, '');

		// special behavior for certain events
		switch (eventName) {
			case 'load':
				// movie claims it is ready, but in IE this isn't always the case...
				// bug fix: Cannot extend EMBED DOM elements in Firefox, must use traditional function
				this.movie = document.getElementById(this.movieId);
				if (!this.movie) {
					var self = this;
					setTimeout( function() { self.receiveEvent('load', null); }, 1 );
					return;
				}

				// firefox on pc needs a "kick" in order to set these in certain cases
				if (!this.ready && navigator.userAgent.match(/Firefox/) && navigator.userAgent.match(/Windows/)) {
					var self = this;
					setTimeout( function() { self.receiveEvent('load', null); }, 100 );
					this.ready = true;
					return;
				}

				this.ready = true;
				this.movie.setText( this.clipText );
				this.movie.setHandCursor( this.handCursorEnabled );
				break;

			case 'mouseover':
				if (this.domElement && this.cssEffects) {
					this.domElement.addClass('hover');
					if (this.recoverActive) this.domElement.addClass('active');
				}
				break;

			case 'mouseout':
				if (this.domElement && this.cssEffects) {
					this.recoverActive = false;
					if (this.domElement.hasClass('active')) {
						this.domElement.removeClass('active');
						this.recoverActive = true;
					}
					this.domElement.removeClass('hover');
				}
				break;

			case 'mousedown':
				if (this.domElement && this.cssEffects) {
					this.domElement.addClass('active');
				}
				break;

			case 'mouseup':
				if (this.domElement && this.cssEffects) {
					this.domElement.removeClass('active');
					this.recoverActive = false;
				}
				break;
		} // switch eventName

		if (this.handlers[eventName]) {
			for (var idx = 0, len = this.handlers[eventName].length; idx < len; idx++) {
				var func = this.handlers[eventName][idx];

				if (typeof(func) == 'function') {
					// actual function reference
					func(this, args);
				}
				else if ((typeof(func) == 'object') && (func.length == 2)) {
					// PHP style object + method, i.e. [myObject, 'myMethod']
					func[0][ func[1] ](this, args);
				}
				else if (typeof(func) == 'string') {
					// name of function
					window[func](this, args);
				}
			} // foreach event handler defined
		} // user defined handler for event
	}

};

// PRETTIFY

// Copyright (C) 2006 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * @fileoverview
 * some functions for browser-side pretty printing of code contained in html.
 * <p>
 *
 * For a fairly comprehensive set of languages see the
 * <a href="http://google-code-prettify.googlecode.com/svn/trunk/README.html#langs">README</a>
 * file that came with this source.  At a minimum, the lexer should work on a
 * number of languages including C and friends, Java, Python, Bash, SQL, HTML,
 * XML, CSS, Javascript, and Makefiles.  It works passably on Ruby, PHP and Awk
 * and a subset of Perl, but, because of commenting conventions, doesn't work on
 * Smalltalk, Lisp-like, or CAML-like languages without an explicit lang class.
 * <p>
 * Usage: <ol>
 * <li> include this source file in an html page via
 *   {@code <script type="text/javascript" src="/path/to/prettify.js"></script>}
 * <li> define style rules.  See the example page for examples.
 * <li> mark the {@code <pre>} and {@code <code>} tags in your source with
 *    {@code class=prettyprint.}
 *    You can also use the (html deprecated) {@code <xmp>} tag, but the pretty
 *    printer needs to do more substantial DOM manipulations to support that, so
 *    some css styles may not be preserved.
 * </ol>
 * That's it.  I wanted to keep the API as simple as possible, so there's no
 * need to specify which language the code is in, but if you wish, you can add
 * another class to the {@code <pre>} or {@code <code>} element to specify the
 * language, as in {@code <pre class="prettyprint lang-java">}.  Any class that
 * starts with "lang-" followed by a file extension, specifies the file type.
 * See the "lang-*.js" files in this directory for code that implements
 * per-language file handlers.
 * <p>
 * Change log:<br>
 * cbeust, 2006/08/22
 * <blockquote>
 *   Java annotations (start with "@") are now captured as literals ("lit")
 * </blockquote>
 * @requires console
 */

// JSLint declarations
/*global console, document, navigator, setTimeout, window */

/**
 * Split {@code prettyPrint} into multiple timeouts so as not to interfere with
 * UI events.
 * If set to {@code false}, {@code prettyPrint()} is synchronous.
 */
window['PR_SHOULD_USE_CONTINUATION'] = true;

/** the number of characters between tab columns */
window['PR_TAB_WIDTH'] = 8;

/** Walks the DOM returning a properly escaped version of innerHTML.
 * @param {Node} node
 * @param {Array.<string>} out output buffer that receives chunks of HTML.
 */
window['PR_normalizedHtml']

/** Contains functions for creating and registering new language handlers.
 * @type {Object}
 */
	= window['PR']

/** Pretty print a chunk of code.
 *
 * @param {string} sourceCodeHtml code as html
 * @return {string} code as html, but prettier
 */
	= window['prettyPrintOne']
/** Find all the {@code <pre>} and {@code <code>} tags in the DOM with
 * {@code class=prettyprint} and prettify them.
 * @param {Function?} opt_whenDone if specified, called when the last entry
 *     has been finished.
 */
	= window['prettyPrint'] = void 0;

/** browser detection. @extern @returns false if not IE, otherwise the major version. */
window['_pr_isIE6'] = function () {
	var ieVersion = navigator && navigator.userAgent &&
		navigator.userAgent.match(/\bMSIE ([678])\./);
	ieVersion = ieVersion ? +ieVersion[1] : false;
	window['_pr_isIE6'] = function () { return ieVersion; };
	return ieVersion;
};


(function () {
	// Keyword lists for various languages.
	var FLOW_CONTROL_KEYWORDS =
		"break continue do else for if return while ";
	var C_KEYWORDS = FLOW_CONTROL_KEYWORDS + "auto case char const default " +
		"double enum extern float goto int long register short signed sizeof " +
		"static struct switch typedef union unsigned void volatile ";
	var COMMON_KEYWORDS = C_KEYWORDS + "catch class delete false import " +
		"new operator private protected public this throw true try typeof ";
	var CPP_KEYWORDS = COMMON_KEYWORDS + "alignof align_union asm axiom bool " +
		"concept concept_map const_cast constexpr decltype " +
		"dynamic_cast explicit export friend inline late_check " +
		"mutable namespace nullptr reinterpret_cast static_assert static_cast " +
		"template typeid typename using virtual wchar_t where ";
	var JAVA_KEYWORDS = COMMON_KEYWORDS +
		"abstract boolean byte extends final finally implements import " +
		"instanceof null native package strictfp super synchronized throws " +
		"transient ";
	var CSHARP_KEYWORDS = JAVA_KEYWORDS +
		"as base by checked decimal delegate descending event " +
		"fixed foreach from group implicit in interface internal into is lock " +
		"object out override orderby params partial readonly ref sbyte sealed " +
		"stackalloc string select uint ulong unchecked unsafe ushort var ";
	var JSCRIPT_KEYWORDS = COMMON_KEYWORDS +
		"debugger eval export function get null set undefined var with " +
		"Infinity NaN ";
	var PERL_KEYWORDS = "caller delete die do dump elsif eval exit foreach for " +
		"goto if import last local my next no our print package redo require " +
		"sub undef unless until use wantarray while BEGIN END ";
	var PYTHON_KEYWORDS = FLOW_CONTROL_KEYWORDS + "and as assert class def del " +
		"elif except exec finally from global import in is lambda " +
		"nonlocal not or pass print raise try with yield " +
		"False True None ";
	var RUBY_KEYWORDS = FLOW_CONTROL_KEYWORDS + "alias and begin case class def" +
		" defined elsif end ensure false in module next nil not or redo rescue " +
		"retry self super then true undef unless until when yield BEGIN END ";
	var SH_KEYWORDS = FLOW_CONTROL_KEYWORDS + "case done elif esac eval fi " +
		"function in local set then until ";
	var ALL_KEYWORDS = (
		CPP_KEYWORDS + CSHARP_KEYWORDS + JSCRIPT_KEYWORDS + PERL_KEYWORDS +
			PYTHON_KEYWORDS + RUBY_KEYWORDS + SH_KEYWORDS);

	// token style names.  correspond to css classes
	/** token style for a string literal */
	var PR_STRING = 'str';
	/** token style for a keyword */
	var PR_KEYWORD = 'kwd';
	/** token style for a comment */
	var PR_COMMENT = 'com';
	/** token style for a type */
	var PR_TYPE = 'typ';
	/** token style for a literal value.  e.g. 1, null, true. */
	var PR_LITERAL = 'lit';
	/** token style for a punctuation string. */
	var PR_PUNCTUATION = 'pun';
	/** token style for a punctuation string. */
	var PR_PLAIN = 'pln';

	/** token style for an sgml tag. */
	var PR_TAG = 'tag';
	/** token style for a markup declaration such as a DOCTYPE. */
	var PR_DECLARATION = 'dec';
	/** token style for embedded source. */
	var PR_SOURCE = 'src';
	/** token style for an sgml attribute name. */
	var PR_ATTRIB_NAME = 'atn';
	/** token style for an sgml attribute value. */
	var PR_ATTRIB_VALUE = 'atv';

	/**
	 * A class that indicates a section of markup that is not code, e.g. to allow
	 * embedding of line numbers within code listings.
	 */
	var PR_NOCODE = 'nocode';

	/** A set of tokens that can precede a regular expression literal in
	 * javascript.
	 * http://www.mozilla.org/js/language/js20/rationale/syntax.html has the full
	 * list, but I've removed ones that might be problematic when seen in
	 * languages that don't support regular expression literals.
	 *
	 * <p>Specifically, I've removed any keywords that can't precede a regexp
	 * literal in a syntactically legal javascript program, and I've removed the
	 * "in" keyword since it's not a keyword in many languages, and might be used
	 * as a count of inches.
	 *
	 * <p>The link a above does not accurately describe EcmaScript rules since
	 * it fails to distinguish between (a=++/b/i) and (a++/b/i) but it works
	 * very well in practice.
	 *
	 * @private
	 */
	var REGEXP_PRECEDER_PATTERN = function () {
		var preceders = [
			"!", "!=", "!==", "#", "%", "%=", "&", "&&", "&&=",
			"&=", "(", "*", "*=", /* "+", */ "+=", ",", /* "-", */ "-=",
			"->", /*".", "..", "...", handled below */ "/", "/=", ":", "::", ";",
			"<", "<<", "<<=", "<=", "=", "==", "===", ">",
			">=", ">>", ">>=", ">>>", ">>>=", "?", "@", "[",
			"^", "^=", "^^", "^^=", "{", "|", "|=", "||",
			"||=", "~" /* handles =~ and !~ */,
			"break", "case", "continue", "delete",
			"do", "else", "finally", "instanceof",
			"return", "throw", "try", "typeof"
		];
		var pattern = '(?:^^|[+-]';
		for (var i = 0; i < preceders.length; ++i) {
			pattern += '|' + preceders[i].replace(/([^=<>:&a-z])/g, '\\$1');
		}
		pattern += ')\\s*';  // matches at end, and matches empty string
		return pattern;
		// CAVEAT: this does not properly handle the case where a regular
		// expression immediately follows another since a regular expression may
		// have flags for case-sensitivity and the like.  Having regexp tokens
		// adjacent is not valid in any language I'm aware of, so I'm punting.
		// TODO: maybe style special characters inside a regexp as punctuation.
	}();

	// Define regexps here so that the interpreter doesn't have to create an
	// object each time the function containing them is called.
	// The language spec requires a new object created even if you don't access
	// the $1 members.
	var pr_amp = /&/g;
	var pr_lt = /</g;
	var pr_gt = />/g;
	var pr_quot = /\"/g;
	/** like textToHtml but escapes double quotes to be attribute safe. */
	function attribToHtml(str) {
		return str.replace(pr_amp, '&amp;')
			.replace(pr_lt, '&lt;')
			.replace(pr_gt, '&gt;')
			.replace(pr_quot, '&quot;');
	}

	/** escapest html special characters to html. */
	function textToHtml(str) {
		return str.replace(pr_amp, '&amp;')
			.replace(pr_lt, '&lt;')
			.replace(pr_gt, '&gt;');
	}


	var pr_ltEnt = /&lt;/g;
	var pr_gtEnt = /&gt;/g;
	var pr_aposEnt = /&apos;/g;
	var pr_quotEnt = /&quot;/g;
	var pr_ampEnt = /&amp;/g;
	var pr_nbspEnt = /&nbsp;/g;
	/** unescapes html to plain text. */
	function htmlToText(html) {
		var pos = html.indexOf('&');
		if (pos < 0) { return html; }
		// Handle numeric entities specially.  We can't use functional substitution
		// since that doesn't work in older versions of Safari.
		// These should be rare since most browsers convert them to normal chars.
		for (--pos; (pos = html.indexOf('&#', pos + 1)) >= 0;) {
			var end = html.indexOf(';', pos);
			if (end >= 0) {
				var num = html.substring(pos + 3, end);
				var radix = 10;
				if (num && num.charAt(0) === 'x') {
					num = num.substring(1);
					radix = 16;
				}
				var codePoint = parseInt(num, radix);
				if (!isNaN(codePoint)) {
					html = (html.substring(0, pos) + String.fromCharCode(codePoint) +
						html.substring(end + 1));
				}
			}
		}

		return html.replace(pr_ltEnt, '<')
			.replace(pr_gtEnt, '>')
			.replace(pr_aposEnt, "'")
			.replace(pr_quotEnt, '"')
			.replace(pr_nbspEnt, ' ')
			.replace(pr_ampEnt, '&');
	}

	/** is the given node's innerHTML normally unescaped? */
	function isRawContent(node) {
		return 'XMP' === node.tagName;
	}

	var newlineRe = /[\r\n]/g;
	/**
	 * Are newlines and adjacent spaces significant in the given node's innerHTML?
	 */
	function isPreformatted(node, content) {
		// PRE means preformatted, and is a very common case, so don't create
		// unnecessary computed style objects.
		if ('PRE' === node.tagName) { return true; }
		if (!newlineRe.test(content)) { return true; }  // Don't care
		var whitespace = '';
		// For disconnected nodes, IE has no currentStyle.
		if (node.currentStyle) {
			whitespace = node.currentStyle.whiteSpace;
		} else if (window.getComputedStyle) {
			// Firefox makes a best guess if node is disconnected whereas Safari
			// returns the empty string.
			whitespace = window.getComputedStyle(node, null).whiteSpace;
		}
		return !whitespace || whitespace === 'pre';
	}

	function normalizedHtml(node, out, opt_sortAttrs) {
		switch (node.nodeType) {
			case 1:  // an element
				var name = node.tagName.toLowerCase();

				out.push('<', name);
				var attrs = node.attributes;
				var n = attrs.length;
				if (n) {
					if (opt_sortAttrs) {
						var sortedAttrs = [];
						for (var i = n; --i >= 0;) { sortedAttrs[i] = attrs[i]; }
						sortedAttrs.sort(function (a, b) {
							return (a.name < b.name) ? -1 : a.name === b.name ? 0 : 1;
						});
						attrs = sortedAttrs;
					}
					for (var i = 0; i < n; ++i) {
						var attr = attrs[i];
						if (!attr.specified) { continue; }
						out.push(' ', attr.name.toLowerCase(),
							'="', attribToHtml(attr.value), '"');
					}
				}
				out.push('>');
				for (var child = node.firstChild; child; child = child.nextSibling) {
					normalizedHtml(child, out, opt_sortAttrs);
				}
				if (node.firstChild || !/^(?:br|link|img)$/.test(name)) {
					out.push('<\/', name, '>');
				}
				break;
			case 3: case 4: // text
			out.push(textToHtml(node.nodeValue));
			break;
		}
	}

	/**
	 * Given a group of {@link RegExp}s, returns a {@code RegExp} that globally
	 * matches the union o the sets o strings matched d by the input RegExp.
	 * Since it matches globally, if the input strings have a start-of-input
	 * anchor (/^.../), it is ignored for the purposes of unioning.
	 * @param {Array.<RegExp>} regexs non multiline, non-global regexs.
	 * @return {RegExp} a global regex.
	 */
	function combinePrefixPatterns(regexs) {
		var capturedGroupIndex = 0;

		var needToFoldCase = false;
		var ignoreCase = false;
		for (var i = 0, n = regexs.length; i < n; ++i) {
			var regex = regexs[i];
			if (regex.ignoreCase) {
				ignoreCase = true;
			} else if (/[a-z]/i.test(regex.source.replace(
				/\\u[0-9a-f]{4}|\\x[0-9a-f]{2}|\\[^ux]/gi, ''))) {
				needToFoldCase = true;
				ignoreCase = false;
				break;
			}
		}

		function decodeEscape(charsetPart) {
			if (charsetPart.charAt(0) !== '\\') { return charsetPart.charCodeAt(0); }
			switch (charsetPart.charAt(1)) {
				case 'b': return 8;
				case 't': return 9;
				case 'n': return 0xa;
				case 'v': return 0xb;
				case 'f': return 0xc;
				case 'r': return 0xd;
				case 'u': case 'x':
				return parseInt(charsetPart.substring(2), 16)
					|| charsetPart.charCodeAt(1);
				case '0': case '1': case '2': case '3': case '4':
				case '5': case '6': case '7':
				return parseInt(charsetPart.substring(1), 8);
				default: return charsetPart.charCodeAt(1);
			}
		}

		function encodeEscape(charCode) {
			if (charCode < 0x20) {
				return (charCode < 0x10 ? '\\x0' : '\\x') + charCode.toString(16);
			}
			var ch = String.fromCharCode(charCode);
			if (ch === '\\' || ch === '-' || ch === '[' || ch === ']') {
				ch = '\\' + ch;
			}
			return ch;
		}

		function caseFoldCharset(charSet) {
			var charsetParts = charSet.substring(1, charSet.length - 1).match(
				new RegExp(
					'\\\\u[0-9A-Fa-f]{4}'
						+ '|\\\\x[0-9A-Fa-f]{2}'
						+ '|\\\\[0-3][0-7]{0,2}'
						+ '|\\\\[0-7]{1,2}'
						+ '|\\\\[\\s\\S]'
						+ '|-'
						+ '|[^-\\\\]',
					'g'));
			var groups = [];
			var ranges = [];
			var inverse = charsetParts[0] === '^';
			for (var i = inverse ? 1 : 0, n = charsetParts.length; i < n; ++i) {
				var p = charsetParts[i];
				switch (p) {
					case '\\B': case '\\b':
					case '\\D': case '\\d':
					case '\\S': case '\\s':
					case '\\W': case '\\w':
					groups.push(p);
					continue;
				}
				var start = decodeEscape(p);
				var end;
				if (i + 2 < n && '-' === charsetParts[i + 1]) {
					end = decodeEscape(charsetParts[i + 2]);
					i += 2;
				} else {
					end = start;
				}
				ranges.push([start, end]);
				// If the range might intersect letters, then expand it.
				if (!(end < 65 || start > 122)) {
					if (!(end < 65 || start > 90)) {
						ranges.push([Math.max(65, start) | 32, Math.min(end, 90) | 32]);
					}
					if (!(end < 97 || start > 122)) {
						ranges.push([Math.max(97, start) & ~32, Math.min(end, 122) & ~32]);
					}
				}
			}

			// [[1, 10], [3, 4], [8, 12], [14, 14], [16, 16], [17, 17]]
			// -> [[1, 12], [14, 14], [16, 17]]
			ranges.sort(function (a, b) { return (a[0] - b[0]) || (b[1]  - a[1]); });
			var consolidatedRanges = [];
			var lastRange = [NaN, NaN];
			for (var i = 0; i < ranges.length; ++i) {
				var range = ranges[i];
				if (range[0] <= lastRange[1] + 1) {
					lastRange[1] = Math.max(lastRange[1], range[1]);
				} else {
					consolidatedRanges.push(lastRange = range);
				}
			}

			var out = ['['];
			if (inverse) { out.push('^'); }
			out.push.apply(out, groups);
			for (var i = 0; i < consolidatedRanges.length; ++i) {
				var range = consolidatedRanges[i];
				out.push(encodeEscape(range[0]));
				if (range[1] > range[0]) {
					if (range[1] + 1 > range[0]) { out.push('-'); }
					out.push(encodeEscape(range[1]));
				}
			}
			out.push(']');
			return out.join('');
		}

		function allowAnywhereFoldCaseAndRenumberGroups(regex) {
			// Split into character sets, escape sequences, punctuation strings
			// like ('(', '(?:', ')', '^'), and runs of characters that do not
			// include any of the above.
			var parts = regex.source.match(
				new RegExp(
					'(?:'
						+ '\\[(?:[^\\x5C\\x5D]|\\\\[\\s\\S])*\\]'  // a character set
						+ '|\\\\u[A-Fa-f0-9]{4}'  // a unicode escape
						+ '|\\\\x[A-Fa-f0-9]{2}'  // a hex escape
						+ '|\\\\[0-9]+'  // a back-reference or octal escape
						+ '|\\\\[^ux0-9]'  // other escape sequence
						+ '|\\(\\?[:!=]'  // start of a non-capturing group
						+ '|[\\(\\)\\^]'  // start/emd of a group, or line start
						+ '|[^\\x5B\\x5C\\(\\)\\^]+'  // run of other characters
						+ ')',
					'g'));
			var n = parts.length;

			// Maps captured group numbers to the number they will occupy in
			// the output or to -1 if that has not been determined, or to
			// undefined if they need not be capturing in the output.
			var capturedGroups = [];

			// Walk over and identify back references to build the capturedGroups
			// mapping.
			for (var i = 0, groupIndex = 0; i < n; ++i) {
				var p = parts[i];
				if (p === '(') {
					// groups are 1-indexed, so max group index is count of '('
					++groupIndex;
				} else if ('\\' === p.charAt(0)) {
					var decimalValue = +p.substring(1);
					if (decimalValue && decimalValue <= groupIndex) {
						capturedGroups[decimalValue] = -1;
					}
				}
			}

			// Renumber groups and reduce capturing groups to non-capturing groups
			// where possible.
			for (var i = 1; i < capturedGroups.length; ++i) {
				if (-1 === capturedGroups[i]) {
					capturedGroups[i] = ++capturedGroupIndex;
				}
			}
			for (var i = 0, groupIndex = 0; i < n; ++i) {
				var p = parts[i];
				if (p === '(') {
					++groupIndex;
					if (capturedGroups[groupIndex] === undefined) {
						parts[i] = '(?:';
					}
				} else if ('\\' === p.charAt(0)) {
					var decimalValue = +p.substring(1);
					if (decimalValue && decimalValue <= groupIndex) {
						parts[i] = '\\' + capturedGroups[groupIndex];
					}
				}
			}

			// Remove any prefix anchors so that the output will match anywhere.
			// ^^ really does mean an anchored match though.
			for (var i = 0, groupIndex = 0; i < n; ++i) {
				if ('^' === parts[i] && '^' !== parts[i + 1]) { parts[i] = ''; }
			}

			// Expand letters to groupts to handle mixing of case-sensitive and
			// case-insensitive patterns if necessary.
			if (regex.ignoreCase && needToFoldCase) {
				for (var i = 0; i < n; ++i) {
					var p = parts[i];
					var ch0 = p.charAt(0);
					if (p.length >= 2 && ch0 === '[') {
						parts[i] = caseFoldCharset(p);
					} else if (ch0 !== '\\') {
						// TODO: handle letters in numeric escapes.
						parts[i] = p.replace(
							/[a-zA-Z]/g,
							function (ch) {
								var cc = ch.charCodeAt(0);
								return '[' + String.fromCharCode(cc & ~32, cc | 32) + ']';
							});
					}
				}
			}

			return parts.join('');
		}

		var rewritten = [];
		for (var i = 0, n = regexs.length; i < n; ++i) {
			var regex = regexs[i];
			if (regex.global || regex.multiline) { throw new Error('' + regex); }
			rewritten.push(
				'(?:' + allowAnywhereFoldCaseAndRenumberGroups(regex) + ')');
		}

		return new RegExp(rewritten.join('|'), ignoreCase ? 'gi' : 'g');
	}

	var PR_innerHtmlWorks = null;
	function getInnerHtml(node) {
		// inner html is hopelessly broken in Safari 2.0.4 when the content is
		// an html description of well formed XML and the containing tag is a PRE
		// tag, so we detect that case and emulate innerHTML.
		if (null === PR_innerHtmlWorks) {
			var testNode = document.createElement('PRE');
			testNode.appendChild(
				document.createTextNode('<!DOCTYPE foo PUBLIC "foo bar">\n<foo />'));
			PR_innerHtmlWorks = !/</.test(testNode.innerHTML);
		}

		if (PR_innerHtmlWorks) {
			var content = node.innerHTML;
			// XMP tags contain unescaped entities so require special handling.
			if (isRawContent(node)) {
				content = textToHtml(content);
			} else if (!isPreformatted(node, content)) {
				content = content.replace(/(<br\s*\/?>)[\r\n]+/g, '$1')
					.replace(/(?:[\r\n]+[ \t]*)+/g, ' ');
			}
			return content;
		}

		var out = [];
		for (var child = node.firstChild; child; child = child.nextSibling) {
			normalizedHtml(child, out);
		}
		return out.join('');
	}

	/** returns a function that expand tabs to spaces.  This function can be fed
	 * successive chunks of text, and will maintain its own internal state to
	 * keep track of how tabs are expanded.
	 * @return {function (string) : string} a function that takes
	 *   plain text and return the text with tabs expanded.
	 * @private
	 */
	function makeTabExpander(tabWidth) {
		var SPACES = '                ';
		var charInLine = 0;

		return function (plainText) {
			// walk over each character looking for tabs and newlines.
			// On tabs, expand them.  On newlines, reset charInLine.
			// Otherwise increment charInLine
			var out = null;
			var pos = 0;
			for (var i = 0, n = plainText.length; i < n; ++i) {
				var ch = plainText.charAt(i);

				switch (ch) {
					case '\t':
						if (!out) { out = []; }
						out.push(plainText.substring(pos, i));
						// calculate how much space we need in front of this part
						// nSpaces is the amount of padding -- the number of spaces needed
						// to move us to the next column, where columns occur at factors of
						// tabWidth.
						var nSpaces = tabWidth - (charInLine % tabWidth);
						charInLine += nSpaces;
						for (; nSpaces >= 0; nSpaces -= SPACES.length) {
							out.push(SPACES.substring(0, nSpaces));
						}
						pos = i + 1;
						break;
					case '\n':
						charInLine = 0;
						break;
					default:
						++charInLine;
				}
			}
			if (!out) { return plainText; }
			out.push(plainText.substring(pos));
			return out.join('');
		};
	}

	var pr_chunkPattern = new RegExp(
		'[^<]+'  // A run of characters other than '<'
			+ '|<\!--[\\s\\S]*?--\>'  // an HTML comment
			+ '|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>'  // a CDATA section
			// a probable tag that should not be highlighted
			+ '|<\/?[a-zA-Z](?:[^>\"\']|\'[^\']*\'|\"[^\"]*\")*>'
			+ '|<',  // A '<' that does not begin a larger chunk
		'g');
	var pr_commentPrefix = /^<\!--/;
	var pr_cdataPrefix = /^<!\[CDATA\[/;
	var pr_brPrefix = /^<br\b/i;
	var pr_tagNameRe = /^<(\/?)([a-zA-Z][a-zA-Z0-9]*)/;

	/** split markup into chunks of html tags (style null) and
	 * plain text (style {@link #PR_PLAIN}), converting tags which are
	 * significant for tokenization (<br>) into their textual equivalent.
	 *
	 * @param {string} s html where whitespace is considered significant.
	 * @return {Object} source code and extracted tags.
	 * @private
	 */
	function extractTags(s) {
		// since the pattern has the 'g' modifier and defines no capturing groups,
		// this will return a list of all chunks which we then classify and wrap as
		// PR_Tokens
		var matches = s.match(pr_chunkPattern);
		var sourceBuf = [];
		var sourceBufLen = 0;
		var extractedTags = [];
		if (matches) {
			for (var i = 0, n = matches.length; i < n; ++i) {
				var match = matches[i];
				if (match.length > 1 && match.charAt(0) === '<') {
					if (pr_commentPrefix.test(match)) { continue; }
					if (pr_cdataPrefix.test(match)) {
						// strip CDATA prefix and suffix.  Don't unescape since it's CDATA
						sourceBuf.push(match.substring(9, match.length - 3));
						sourceBufLen += match.length - 12;
					} else if (pr_brPrefix.test(match)) {
						// <br> tags are lexically significant so convert them to text.
						// This is undone later.
						sourceBuf.push('\n');
						++sourceBufLen;
					} else {
						if (match.indexOf(PR_NOCODE) >= 0 && isNoCodeTag(match)) {
							// A <span class="nocode"> will start a section that should be
							// ignored.  Continue walking the list until we see a matching end
							// tag.
							var name = match.match(pr_tagNameRe)[2];
							var depth = 1;
							var j;
							end_tag_loop:
								for (j = i + 1; j < n; ++j) {
									var name2 = matches[j].match(pr_tagNameRe);
									if (name2 && name2[2] === name) {
										if (name2[1] === '/') {
											if (--depth === 0) { break end_tag_loop; }
										} else {
											++depth;
										}
									}
								}
							if (j < n) {
								extractedTags.push(
									sourceBufLen, matches.slice(i, j + 1).join(''));
								i = j;
							} else {  // Ignore unclosed sections.
								extractedTags.push(sourceBufLen, match);
							}
						} else {
							extractedTags.push(sourceBufLen, match);
						}
					}
				} else {
					var literalText = htmlToText(match);
					sourceBuf.push(literalText);
					sourceBufLen += literalText.length;
				}
			}
		}
		return { source: sourceBuf.join(''), tags: extractedTags };
	}

	/** True if the given tag contains a class attribute with the nocode class. */
	function isNoCodeTag(tag) {
		return !!tag
			// First canonicalize the representation of attributes
			.replace(/\s(\w+)\s*=\s*(?:\"([^\"]*)\"|'([^\']*)'|(\S+))/g,
				' $1="$2$3$4"')
			// Then look for the attribute we want.
			.match(/[cC][lL][aA][sS][sS]=\"[^\"]*\bnocode\b/);
	}

	/**
	 * Apply the given language handler to sourceCode and add the resulting
	 * decorations to out.
	 * @param {number} basePos the index of sourceCode within the chunk of source
	 *    whose decorations are already present on out.
	 */
	function appendDecorations(basePos, sourceCode, langHandler, out) {
		if (!sourceCode) { return; }
		var job = {
			source: sourceCode,
			basePos: basePos
		};
		langHandler(job);
		out.push.apply(out, job.decorations);
	}

	/** Given triples of [style, pattern, context] returns a lexing function,
	 * The lexing function interprets the patterns to find token boundaries and
	 * returns a decoration list of the form
	 * [index_0, style_0, index_1, style_1, ..., index_n, style_n]
	 * where index_n is an index into the sourceCode, and style_n is a style
	 * constant like PR_PLAIN.  index_n-1 <= index_n, and style_n-1 applies to
	 * all characters in sourceCode[index_n-1:index_n].
	 *
	 * The stylePatterns is a list whose elements have the form
	 * [style : string, pattern : RegExp, DEPRECATED, shortcut : string].
	 *
	 * Style is a style constant like PR_PLAIN, or can be a string of the
	 * form 'lang-FOO', where FOO is a language extension describing the
	 * language of the portion of the token in $1 after pattern executes.
	 * E.g., if style is 'lang-lisp', and group 1 contains the text
	 * '(hello (world))', then that portion of the token will be passed to the
	 * registered lisp handler for formatting.
	 * The text before and after group 1 will be restyled using this decorator
	 * so decorators should take care that this doesn't result in infinite
	 * recursion.  For example, the HTML lexer rule for SCRIPT elements looks
	 * something like ['lang-js', /<[s]cript>(.+?)<\/script>/].  This may match
	 * '<script>foo()<\/script>', which would cause the current decorator to
	 * be called with '<script>' which would not match the same rule since
	 * group 1 must not be empty, so it would be instead styled as PR_TAG by
	 * the generic tag rule.  The handler registered for the 'js' extension would
	 * then be called with 'foo()', and finally, the current decorator would
	 * be called with '<\/script>' which would not match the original rule and
	 * so the generic tag rule would identify it as a tag.
	 *
	 * Pattern must only match prefixes, and if it matches a prefix, then that
	 * match is considered a token with the same style.
	 *
	 * Context is applied to the last non-whitespace, non-comment token
	 * recognized.
	 *
	 * Shortcut is an optional string of characters, any of which, if the first
	 * character, gurantee that this pattern and only this pattern matches.
	 *
	 * @param {Array} shortcutStylePatterns patterns that always start with
	 *   a known character.  Must have a shortcut string.
	 * @param {Array} fallthroughStylePatterns patterns that will be tried in
	 *   order if the shortcut ones fail.  May have shortcuts.
	 *
	 * @return {function (Object)} a
	 *   function that takes source code and returns a list of decorations.
	 */
	function createSimpleLexer(shortcutStylePatterns, fallthroughStylePatterns) {
		var shortcuts = {};
		var tokenizer;
		(function () {
			var allPatterns = shortcutStylePatterns.concat(fallthroughStylePatterns);
			var allRegexs = [];
			var regexKeys = {};
			for (var i = 0, n = allPatterns.length; i < n; ++i) {
				var patternParts = allPatterns[i];
				var shortcutChars = patternParts[3];
				if (shortcutChars) {
					for (var c = shortcutChars.length; --c >= 0;) {
						shortcuts[shortcutChars.charAt(c)] = patternParts;
					}
				}
				var regex = patternParts[1];
				var k = '' + regex;
				if (!regexKeys.hasOwnProperty(k)) {
					allRegexs.push(regex);
					regexKeys[k] = null;
				}
			}
			allRegexs.push(/[\0-\uffff]/);
			tokenizer = combinePrefixPatterns(allRegexs);
		})();

		var nPatterns = fallthroughStylePatterns.length;
		var notWs = /\S/;

		/**
		 * Lexes job.source and produces an output array job.decorations of style
		 * classes preceded by the position at which they start in job.source in
		 * order.
		 *
		 * @param {Object} job an object like {@code
		 *    source: {string} sourceText plain text,
		 *    basePos: {int} position of job.source in the larger chunk of
		 *        sourceCode.
		 * }
		 */
		var decorate = function (job) {
			var sourceCode = job.source, basePos = job.basePos;
			/** Even entries are positions in source in ascending order.  Odd enties
			 * are style markers (e.g., PR_COMMENT) that run from that position until
			 * the end.
			 * @type {Array.<number|string>}
			 */
			var decorations = [basePos, PR_PLAIN];
			var pos = 0;  // index into sourceCode
			var tokens = sourceCode.match(tokenizer) || [];
			var styleCache = {};

			for (var ti = 0, nTokens = tokens.length; ti < nTokens; ++ti) {
				var token = tokens[ti];
				var style = styleCache[token];
				var match = void 0;

				var isEmbedded;
				if (typeof style === 'string') {
					isEmbedded = false;
				} else {
					var patternParts = shortcuts[token.charAt(0)];
					if (patternParts) {
						match = token.match(patternParts[1]);
						style = patternParts[0];
					} else {
						for (var i = 0; i < nPatterns; ++i) {
							patternParts = fallthroughStylePatterns[i];
							match = token.match(patternParts[1]);
							if (match) {
								style = patternParts[0];
								break;
							}
						}

						if (!match) {  // make sure that we make progress
							style = PR_PLAIN;
						}
					}

					isEmbedded = style.length >= 5 && 'lang-' === style.substring(0, 5);
					if (isEmbedded && !(match && typeof match[1] === 'string')) {
						isEmbedded = false;
						style = PR_SOURCE;
					}

					if (!isEmbedded) { styleCache[token] = style; }
				}

				var tokenStart = pos;
				pos += token.length;

				if (!isEmbedded) {
					decorations.push(basePos + tokenStart, style);
				} else {  // Treat group 1 as an embedded block of source code.
					var embeddedSource = match[1];
					var embeddedSourceStart = token.indexOf(embeddedSource);
					var embeddedSourceEnd = embeddedSourceStart + embeddedSource.length;
					if (match[2]) {
						// If embeddedSource can be blank, then it would match at the
						// beginning which would cause us to infinitely recurse on the
						// entire token, so we catch the right context in match[2].
						embeddedSourceEnd = token.length - match[2].length;
						embeddedSourceStart = embeddedSourceEnd - embeddedSource.length;
					}
					var lang = style.substring(5);
					// Decorate the left of the embedded source
					appendDecorations(
						basePos + tokenStart,
						token.substring(0, embeddedSourceStart),
						decorate, decorations);
					// Decorate the embedded source
					appendDecorations(
						basePos + tokenStart + embeddedSourceStart,
						embeddedSource,
						langHandlerForExtension(lang, embeddedSource),
						decorations);
					// Decorate the right of the embedded section
					appendDecorations(
						basePos + tokenStart + embeddedSourceEnd,
						token.substring(embeddedSourceEnd),
						decorate, decorations);
				}
			}
			job.decorations = decorations;
		};
		return decorate;
	}

	/** returns a function that produces a list of decorations from source text.
	 *
	 * This code treats ", ', and ` as string delimiters, and \ as a string
	 * escape.  It does not recognize perl's qq() style strings.
	 * It has no special handling for double delimiter escapes as in basic, or
	 * the tripled delimiters used in python, but should work on those regardless
	 * although in those cases a single string literal may be broken up into
	 * multiple adjacent string literals.
	 *
	 * It recognizes C, C++, and shell style comments.
	 *
	 * @param {Object} options a set of optional parameters.
	 * @return {function (Object)} a function that examines the source code
	 *     in the input job and builds the decoration list.
	 */
	function sourceDecorator(options) {
		var shortcutStylePatterns = [], fallthroughStylePatterns = [];
		if (options['tripleQuotedStrings']) {
			// '''multi-line-string''', 'single-line-string', and double-quoted
			shortcutStylePatterns.push(
				[PR_STRING,  /^(?:\'\'\'(?:[^\'\\]|\\[\s\S]|\'{1,2}(?=[^\']))*(?:\'\'\'|$)|\"\"\"(?:[^\"\\]|\\[\s\S]|\"{1,2}(?=[^\"]))*(?:\"\"\"|$)|\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$))/,
					null, '\'"']);
		} else if (options['multiLineStrings']) {
			// 'multi-line-string', "multi-line-string"
			shortcutStylePatterns.push(
				[PR_STRING,  /^(?:\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$)|\`(?:[^\\\`]|\\[\s\S])*(?:\`|$))/,
					null, '\'"`']);
		} else {
			// 'single-line-string', "single-line-string"
			shortcutStylePatterns.push(
				[PR_STRING,
					/^(?:\'(?:[^\\\'\r\n]|\\.)*(?:\'|$)|\"(?:[^\\\"\r\n]|\\.)*(?:\"|$))/,
					null, '"\'']);
		}
		if (options['verbatimStrings']) {
			// verbatim-string-literal production from the C# grammar.  See issue 93.
			fallthroughStylePatterns.push(
				[PR_STRING, /^@\"(?:[^\"]|\"\")*(?:\"|$)/, null]);
		}
		if (options['hashComments']) {
			if (options['cStyleComments']) {
				// Stop C preprocessor declarations at an unclosed open comment
				shortcutStylePatterns.push(
					[PR_COMMENT, /^#(?:(?:define|elif|else|endif|error|ifdef|include|ifndef|line|pragma|undef|warning)\b|[^\r\n]*)/,
						null, '#']);
				fallthroughStylePatterns.push(
					[PR_STRING,
						/^<(?:(?:(?:\.\.\/)*|\/?)(?:[\w-]+(?:\/[\w-]+)+)?[\w-]+\.h|[a-z]\w*)>/,
						null]);
			} else {
				shortcutStylePatterns.push([PR_COMMENT, /^#[^\r\n]*/, null, '#']);
			}
		}
		if (options['cStyleComments']) {
			fallthroughStylePatterns.push([PR_COMMENT, /^\/\/[^\r\n]*/, null]);
			fallthroughStylePatterns.push(
				[PR_COMMENT, /^\/\*[\s\S]*?(?:\*\/|$)/, null]);
		}
		if (options['regexLiterals']) {
			var REGEX_LITERAL = (
				// A regular expression literal starts with a slash that is
				// not followed by * or / so that it is not confused with
				// comments.
				'/(?=[^/*])'
					// and then contains any number of raw characters,
					+ '(?:[^/\\x5B\\x5C]'
					// escape sequences (\x5C),
					+    '|\\x5C[\\s\\S]'
					// or non-nesting character sets (\x5B\x5D);
					+    '|\\x5B(?:[^\\x5C\\x5D]|\\x5C[\\s\\S])*(?:\\x5D|$))+'
					// finally closed by a /.
					+ '/');
			fallthroughStylePatterns.push(
				['lang-regex',
					new RegExp('^' + REGEXP_PRECEDER_PATTERN + '(' + REGEX_LITERAL + ')')
				]);
		}

		var keywords = options['keywords'].replace(/^\s+|\s+$/g, '');
		if (keywords.length) {
			fallthroughStylePatterns.push(
				[PR_KEYWORD,
					new RegExp('^(?:' + keywords.replace(/\s+/g, '|') + ')\\b'), null]);
		}

		shortcutStylePatterns.push([PR_PLAIN,       /^\s+/, null, ' \r\n\t\xA0']);
		fallthroughStylePatterns.push(
			// TODO(mikesamuel): recognize non-latin letters and numerals in idents
			[PR_LITERAL,     /^@[a-z_$][a-z_$@0-9]*/i, null],
			[PR_TYPE,        /^@?[A-Z]+[a-z][A-Za-z_$@0-9]*/, null],
			[PR_PLAIN,       /^[a-z_$][a-z_$@0-9]*/i, null],
			[PR_LITERAL,
				new RegExp(
					'^(?:'
						// A hex number
						+ '0x[a-f0-9]+'
						// or an octal or decimal number,
						+ '|(?:\\d(?:_\\d+)*\\d*(?:\\.\\d*)?|\\.\\d\\+)'
						// possibly in scientific notation
						+ '(?:e[+\\-]?\\d+)?'
						+ ')'
						// with an optional modifier like UL for unsigned long
						+ '[a-z]*', 'i'),
				null, '0123456789'],
			[PR_PUNCTUATION, /^.[^\s\w\.$@\'\"\`\/\#]*/, null]);

		return createSimpleLexer(shortcutStylePatterns, fallthroughStylePatterns);
	}

	var decorateSource = sourceDecorator({
		'keywords': ALL_KEYWORDS,
		'hashComments': true,
		'cStyleComments': true,
		'multiLineStrings': true,
		'regexLiterals': true
	});

	/** Breaks {@code job.source} around style boundaries in
	 * {@code job.decorations} while re-interleaving {@code job.extractedTags},
	 * and leaves the result in {@code job.prettyPrintedHtml}.
	 * @param {Object} job like {
    *    source: {string} source as plain text,
    *    extractedTags: {Array.<number|string>} extractedTags chunks of raw
    *                   html preceded by their position in {@code job.source}
	 *                   in order
	 *    decorations: {Array.<number|string} an array of style classes preceded
	 *                 by the position at which they start in job.source in order
	 * }
	 * @private
	 */
	function recombineTagsAndDecorations(job) {
		var sourceText = job.source;
		var extractedTags = job.extractedTags;
		var decorations = job.decorations;

		var html = [];
		// index past the last char in sourceText written to html
		var outputIdx = 0;

		var openDecoration = null;
		var currentDecoration = null;
		var tagPos = 0;  // index into extractedTags
		var decPos = 0;  // index into decorations
		var tabExpander = makeTabExpander(window['PR_TAB_WIDTH']);

		var adjacentSpaceRe = /([\r\n ]) /g;
		var startOrSpaceRe = /(^| ) /gm;
		var newlineRe = /\r\n?|\n/g;
		var trailingSpaceRe = /[ \r\n]$/;
		var lastWasSpace = true;  // the last text chunk emitted ended with a space.

		// See bug 71 and http://stackoverflow.com/questions/136443/why-doesnt-ie7-
		var isIE678 = window['_pr_isIE6']();
		var lineBreakHtml = (
			isIE678
				? (job.sourceNode.tagName === 'PRE'
				// Use line feeds instead of <br>s so that copying and pasting works
				// on IE.
				// Doing this on other browsers breaks lots of stuff since \r\n is
				// treated as two newlines on Firefox.
				? (isIE678 === 6 ? '&#160;\r\n' :
				isIE678 === 7 ? '&#160;<br>\r' : '&#160;\r')
				// IE collapses multiple adjacent <br>s into 1 line break.
				// Prefix every newline with '&#160;' to prevent such behavior.
				// &nbsp; is the same as &#160; but works in XML as well as HTML.
				: '&#160;<br />')
				: '<br />');

		// Look for a class like linenums or linenums:<n> where <n> is the 1-indexed
		// number of the first line.
		var numberLines = job.sourceNode.className.match(/\blinenums\b(?::(\d+))?/);
		var lineBreaker;
		if (numberLines) {
			var lineBreaks = [];
			for (var i = 0; i < 10; ++i) {
				lineBreaks[i] = lineBreakHtml + '</li><li class="L' + i + '">';
			}
			var lineNum = numberLines[1] && numberLines[1].length
				? numberLines[1] - 1 : 0;  // Lines are 1-indexed
			html.push('<ol class="linenums"><li class="L', (lineNum) % 10, '"');
			if (lineNum) {
				html.push(' value="', lineNum + 1, '"');
			}
			html.push('>');
			lineBreaker = function () {
				var lb = lineBreaks[++lineNum % 10];
				// If a decoration is open, we need to close it before closing a list-item
				// and reopen it on the other side of the list item.
				return openDecoration
					? ('</span>' + lb + '<span class="' + openDecoration + '">') : lb;
			};
		} else {
			lineBreaker = lineBreakHtml;
		}

		// A helper function that is responsible for opening sections of decoration
		// and outputing properly escaped chunks of source
		function emitTextUpTo(sourceIdx) {
			if (sourceIdx > outputIdx) {
				if (openDecoration && openDecoration !== currentDecoration) {
					// Close the current decoration
					html.push('</span>');
					openDecoration = null;
				}
				if (!openDecoration && currentDecoration) {
					openDecoration = currentDecoration;
					html.push('<span class="', openDecoration, '">');
				}
				// This interacts badly with some wikis which introduces paragraph tags
				// into pre blocks for some strange reason.
				// It's necessary for IE though which seems to lose the preformattedness
				// of <pre> tags when their innerHTML is assigned.
				// http://stud3.tuwien.ac.at/~e0226430/innerHtmlQuirk.html
				// and it serves to undo the conversion of <br>s to newlines done in
				// chunkify.
				var htmlChunk = textToHtml(
					tabExpander(sourceText.substring(outputIdx, sourceIdx)))
					.replace(lastWasSpace
						? startOrSpaceRe
						: adjacentSpaceRe, '$1&#160;');
				// Keep track of whether we need to escape space at the beginning of the
				// next chunk.
				lastWasSpace = trailingSpaceRe.test(htmlChunk);
				html.push(htmlChunk.replace(newlineRe, lineBreaker));
				outputIdx = sourceIdx;
			}
		}

		while (true) {
			// Determine if we're going to consume a tag this time around.  Otherwise
			// we consume a decoration or exit.
			var outputTag;
			if (tagPos < extractedTags.length) {
				if (decPos < decorations.length) {
					// Pick one giving preference to extractedTags since we shouldn't open
					// a new style that we're going to have to immediately close in order
					// to output a tag.
					outputTag = extractedTags[tagPos] <= decorations[decPos];
				} else {
					outputTag = true;
				}
			} else {
				outputTag = false;
			}
			// Consume either a decoration or a tag or exit.
			if (outputTag) {
				emitTextUpTo(extractedTags[tagPos]);
				if (openDecoration) {
					// Close the current decoration
					html.push('</span>');
					openDecoration = null;
				}
				html.push(extractedTags[tagPos + 1]);
				tagPos += 2;
			} else if (decPos < decorations.length) {
				emitTextUpTo(decorations[decPos]);
				currentDecoration = decorations[decPos + 1];
				decPos += 2;
			} else {
				break;
			}
		}
		emitTextUpTo(sourceText.length);
		if (openDecoration) {
			html.push('</span>');
		}
		if (numberLines) { html.push('</li></ol>'); }
		job.prettyPrintedHtml = html.join('');
	}

	/** Maps language-specific file extensions to handlers. */
	var langHandlerRegistry = {};
	/** Register a language handler for the given file extensions.
	 * @param {function (Object)} handler a function from source code to a list
	 *      of decorations.  Takes a single argument job which describes the
	 *      state of the computation.   The single parameter has the form
	 *      {@code {
    *        source: {string} as plain text.
	 *        decorations: {Array.<number|string>} an array of style classes
	 *                     preceded by the position at which they start in
	 *                     job.source in order.
	 *                     The language handler should assigned this field.
	 *        basePos: {int} the position of source in the larger source chunk.
	 *                 All positions in the output decorations array are relative
	 *                 to the larger source chunk.
	 *      } }
	 * @param {Array.<string>} fileExtensions
	 */
	function registerLangHandler(handler, fileExtensions) {
		for (var i = fileExtensions.length; --i >= 0;) {
			var ext = fileExtensions[i];
			if (!langHandlerRegistry.hasOwnProperty(ext)) {
				langHandlerRegistry[ext] = handler;
			} else if ('console' in window) {
				console['warn']('cannot override language handler %s', ext);
			}
		}
	}
	function langHandlerForExtension(extension, source) {
		if (!(extension && langHandlerRegistry.hasOwnProperty(extension))) {
			// Treat it as markup if the first non whitespace character is a < and
			// the last non-whitespace character is a >.
			extension = /^\s*</.test(source)
				? 'default-markup'
				: 'default-code';
		}
		return langHandlerRegistry[extension];
	}
	registerLangHandler(decorateSource, ['default-code']);
	registerLangHandler(
		createSimpleLexer(
			[],
			[
				[PR_PLAIN,       /^[^<?]+/],
				[PR_DECLARATION, /^<!\w[^>]*(?:>|$)/],
				[PR_COMMENT,     /^<\!--[\s\S]*?(?:-\->|$)/],
				// Unescaped content in an unknown language
				['lang-',        /^<\?([\s\S]+?)(?:\?>|$)/],
				['lang-',        /^<%([\s\S]+?)(?:%>|$)/],
				[PR_PUNCTUATION, /^(?:<[%?]|[%?]>)/],
				['lang-',        /^<xmp\b[^>]*>([\s\S]+?)<\/xmp\b[^>]*>/i],
				// Unescaped content in javascript.  (Or possibly vbscript).
				['lang-js',      /^<script\b[^>]*>([\s\S]*?)(<\/script\b[^>]*>)/i],
				// Contains unescaped stylesheet content
				['lang-css',     /^<style\b[^>]*>([\s\S]*?)(<\/style\b[^>]*>)/i],
				['lang-in.tag',  /^(<\/?[a-z][^<>]*>)/i]
			]),
		['default-markup', 'htm', 'html', 'mxml', 'xhtml', 'xml', 'xsl']);
	registerLangHandler(
		createSimpleLexer(
			[
				[PR_PLAIN,        /^[\s]+/, null, ' \t\r\n'],
				[PR_ATTRIB_VALUE, /^(?:\"[^\"]*\"?|\'[^\']*\'?)/, null, '\"\'']
			],
			[
				[PR_TAG,          /^^<\/?[a-z](?:[\w.:-]*\w)?|\/?>$/i],
				[PR_ATTRIB_NAME,  /^(?!style[\s=]|on)[a-z](?:[\w:-]*\w)?/i],
				['lang-uq.val',   /^=\s*([^>\'\"\s]*(?:[^>\'\"\s\/]|\/(?=\s)))/],
				[PR_PUNCTUATION,  /^[=<>\/]+/],
				['lang-js',       /^on\w+\s*=\s*\"([^\"]+)\"/i],
				['lang-js',       /^on\w+\s*=\s*\'([^\']+)\'/i],
				['lang-js',       /^on\w+\s*=\s*([^\"\'>\s]+)/i],
				['lang-css',      /^style\s*=\s*\"([^\"]+)\"/i],
				['lang-css',      /^style\s*=\s*\'([^\']+)\'/i],
				['lang-css',      /^style\s*=\s*([^\"\'>\s]+)/i]
			]),
		['in.tag']);
	registerLangHandler(
		createSimpleLexer([], [[PR_ATTRIB_VALUE, /^[\s\S]+/]]), ['uq.val']);
	registerLangHandler(sourceDecorator({
		'keywords': CPP_KEYWORDS,
		'hashComments': true,
		'cStyleComments': true
	}), ['c', 'cc', 'cpp', 'cxx', 'cyc', 'm']);
	registerLangHandler(sourceDecorator({
		'keywords': 'null true false'
	}), ['json']);
	registerLangHandler(sourceDecorator({
		'keywords': CSHARP_KEYWORDS,
		'hashComments': true,
		'cStyleComments': true,
		'verbatimStrings': true
	}), ['cs']);
	registerLangHandler(sourceDecorator({
		'keywords': JAVA_KEYWORDS,
		'cStyleComments': true
	}), ['java']);
	registerLangHandler(sourceDecorator({
		'keywords': SH_KEYWORDS,
		'hashComments': true,
		'multiLineStrings': true
	}), ['bsh', 'csh', 'sh']);
	registerLangHandler(sourceDecorator({
		'keywords': PYTHON_KEYWORDS,
		'hashComments': true,
		'multiLineStrings': true,
		'tripleQuotedStrings': true
	}), ['cv', 'py']);
	registerLangHandler(sourceDecorator({
		'keywords': PERL_KEYWORDS,
		'hashComments': true,
		'multiLineStrings': true,
		'regexLiterals': true
	}), ['perl', 'pl', 'pm']);
	registerLangHandler(sourceDecorator({
		'keywords': RUBY_KEYWORDS,
		'hashComments': true,
		'multiLineStrings': true,
		'regexLiterals': true
	}), ['rb']);
	registerLangHandler(sourceDecorator({
		'keywords': JSCRIPT_KEYWORDS,
		'cStyleComments': true,
		'regexLiterals': true
	}), ['js']);
	registerLangHandler(
		createSimpleLexer([], [[PR_STRING, /^[\s\S]+/]]), ['regex']);

	function applyDecorator(job) {
		var sourceCodeHtml = job.sourceCodeHtml;
		var opt_langExtension = job.langExtension;

		// Prepopulate output in case processing fails with an exception.
		job.prettyPrintedHtml = sourceCodeHtml;

		try {
			// Extract tags, and convert the source code to plain text.
			var sourceAndExtractedTags = extractTags(sourceCodeHtml);
			/** Plain text. @type {string} */
			var source = sourceAndExtractedTags.source;
			job.source = source;
			job.basePos = 0;

			/** Even entries are positions in source in ascending order.  Odd entries
			 * are tags that were extracted at that position.
			 * @type {Array.<number|string>}
			 */
			job.extractedTags = sourceAndExtractedTags.tags;

			// Apply the appropriate language handler
			langHandlerForExtension(opt_langExtension, source)(job);
			// Integrate the decorations and tags back into the source code to produce
			// a decorated html string which is left in job.prettyPrintedHtml.
			recombineTagsAndDecorations(job);
		} catch (e) {
			if ('console' in window) {
				console['log'](e && e['stack'] ? e['stack'] : e);
			}
		}
	}

	function prettyPrintOne(sourceCodeHtml, opt_langExtension) {
		var job = {
			sourceCodeHtml: sourceCodeHtml,
			langExtension: opt_langExtension
		};
		applyDecorator(job);
		return job.prettyPrintedHtml;
	}

	function prettyPrint(opt_whenDone) {
		function byTagName(tn) { return document.getElementsByTagName(tn); }
		// fetch a list of nodes to rewrite
		var codeSegments = [byTagName('pre'), byTagName('code'), byTagName('xmp')];
		var elements = [];
		for (var i = 0; i < codeSegments.length; ++i) {
			for (var j = 0, n = codeSegments[i].length; j < n; ++j) {
				elements.push(codeSegments[i][j]);
			}
		}
		codeSegments = null;

		var clock = Date;
		if (!clock['now']) {
			clock = { 'now': function () { return (new Date).getTime(); } };
		}

		// The loop is broken into a series of continuations to make sure that we
		// don't make the browser unresponsive when rewriting a large page.
		var k = 0;
		var prettyPrintingJob;

		function doWork() {
			var endTime = (window['PR_SHOULD_USE_CONTINUATION'] ?
				clock.now() + 250 /* ms */ :
				Infinity);
			for (; k < elements.length && clock.now() < endTime; k++) {
				var cs = elements[k];
				if (cs.className && cs.className.indexOf('prettyprint') >= 0) {
					// If the classes includes a language extensions, use it.
					// Language extensions can be specified like
					//     <pre class="prettyprint lang-cpp">
					// the language extension "cpp" is used to find a language handler as
					// passed to PR_registerLangHandler.
					var langExtension = cs.className.match(/\blang-(\w+)\b/);
					if (langExtension) { langExtension = langExtension[1]; }

					// make sure this is not nested in an already prettified element
					var nested = false;
					for (var p = cs.parentNode; p; p = p.parentNode) {
						if ((p.tagName === 'pre' || p.tagName === 'code' ||
							p.tagName === 'xmp') &&
							p.className && p.className.indexOf('prettyprint') >= 0) {
							nested = true;
							break;
						}
					}
					if (!nested) {
						// fetch the content as a snippet of properly escaped HTML.
						// Firefox adds newlines at the end.
						var content = getInnerHtml(cs);
						content = content.replace(/(?:\r\n?|\n)$/, '');

						// do the pretty printing
						prettyPrintingJob = {
							sourceCodeHtml: content,
							langExtension: langExtension,
							sourceNode: cs
						};
						applyDecorator(prettyPrintingJob);
						replaceWithPrettyPrintedHtml();
					}
				}
			}
			if (k < elements.length) {
				// finish up in a continuation
				setTimeout(doWork, 250);
			} else if (opt_whenDone) {
				opt_whenDone();
			}
		}

		function replaceWithPrettyPrintedHtml() {
			var newContent = prettyPrintingJob.prettyPrintedHtml;
			if (!newContent) { return; }
			var cs = prettyPrintingJob.sourceNode;

			// push the prettified html back into the tag.
			if (!isRawContent(cs)) {
				// just replace the old html with the new
				cs.innerHTML = newContent;
			} else {
				// we need to change the tag to a <pre> since <xmp>s do not allow
				// embedded tags such as the span tags used to attach styles to
				// sections of source code.
				var pre = document.createElement('PRE');
				for (var i = 0; i < cs.attributes.length; ++i) {
					var a = cs.attributes[i];
					if (a.specified) {
						var aname = a.name.toLowerCase();
						if (aname === 'class') {
							pre.className = a.value;  // For IE 6
						} else {
							pre.setAttribute(a.name, a.value);
						}
					}
				}
				pre.innerHTML = newContent;

				// remove the old
				cs.parentNode.replaceChild(pre, cs);
				cs = pre;
			}
		}

		doWork();
	}

	window['PR_normalizedHtml'] = normalizedHtml;
	window['prettyPrintOne'] = prettyPrintOne;
	window['prettyPrint'] = prettyPrint;
	window['PR'] = {
		'combinePrefixPatterns': combinePrefixPatterns,
		'createSimpleLexer': createSimpleLexer,
		'registerLangHandler': registerLangHandler,
		'sourceDecorator': sourceDecorator,
		'PR_ATTRIB_NAME': PR_ATTRIB_NAME,
		'PR_ATTRIB_VALUE': PR_ATTRIB_VALUE,
		'PR_COMMENT': PR_COMMENT,
		'PR_DECLARATION': PR_DECLARATION,
		'PR_KEYWORD': PR_KEYWORD,
		'PR_LITERAL': PR_LITERAL,
		'PR_NOCODE': PR_NOCODE,
		'PR_PLAIN': PR_PLAIN,
		'PR_PUNCTUATION': PR_PUNCTUATION,
		'PR_SOURCE': PR_SOURCE,
		'PR_STRING': PR_STRING,
		'PR_TAG': PR_TAG,
		'PR_TYPE': PR_TYPE
	};
})();

