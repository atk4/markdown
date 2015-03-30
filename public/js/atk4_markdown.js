/**
 * Created by vadym on 06/03/15.
 */
/**
 * Created by vadym on 03/11/14.
 */

(function($){

    $.atk4_markdown=function(){
        return $.atk4_markdown;
    }

    $.fn.extend({atk4_markdown:function(){
        var u=new $.atk4_markdown;
        u.jquery=this;
        return u;
    }});


    $.atk4_markdown._import=function(name,fn){
        $.atk4_markdown[name]=function(){
            var ret=fn.apply($.atk4_markdown,arguments);
            return ret?ret:$.atk4_markdown;
        }
    }

    $.each({

        whois: function() {
            alert('atk4_markdown');
        },
		markdownJMN: function(field) {


		},
//		markdownWP: function(field) {
//			console.log(field);
//			jQuery(document).ready(function($) {
//				$('#'+field).after("<div id='wmd-previewcontent' class='wmd-panel wmd-preview prettyprint'></div>");
//				$('#ed_toolbar').html("<div id='wmd-button-barcontent'></div>");
//				var converter = new Markdown.getSanitizingConverter();
//				var editor = new Markdown.Editor(converter, 'content');
//				editor.run();
//				$('.wmd-preview pre').addClass('prettyprint');
//				prettyPrint();
//				if (typeof prettyPrint == 'function') {
//					prettyPrint();
//					editor.hooks.chain("onPreviewRefresh", function () {
//						$('.wmd-preview pre').addClass('prettyprint');
//						prettyPrint();
//					});
//				}
//			});
//		},
        markdown: function(field,image_upload_url) {

            var Showdown={extensions:{}},forEach=Showdown.forEach=function(a,b){if(typeof a.forEach=="function")a.forEach(b);else{var c,d=a.length;for(c=0;c<d;c++)b(a[c],c,a)}},stdExtName=function(a){return a.replace(/[_-]||\s/g,"").toLowerCase()};Showdown.converter=function(a){var b,c,d,e=0,f=[],g=[];if(typeof module!="undefind"&&typeof exports!="undefined"&&typeof require!="undefind"){var h=require("fs");if(h){var i=h.readdirSync((__dirname||".")+"/extensions").filter(function(a){return~a.indexOf(".js")}).map(function(a){return a.replace(/\.js$/,"")});Showdown.forEach(i,function(a){var b=stdExtName(a);Showdown.extensions[b]=require("./extensions/"+a)})}}this.makeHtml=function(a){return b={},c={},d=[],a=a.replace(/~/g,"~T"),a=a.replace(/\$/g,"~D"),a=a.replace(/\r\n/g,"\n"),a=a.replace(/\r/g,"\n"),a="\n\n"+a+"\n\n",a=M(a),a=a.replace(/^[ \t]+$/mg,""),Showdown.forEach(f,function(b){a=k(b,a)}),a=z(a),a=m(a),a=l(a),a=o(a),a=K(a),a=a.replace(/~D/g,"$$"),a=a.replace(/~T/g,"~"),Showdown.forEach(g,function(b){a=k(b,a)}),a};if(a&&a.extensions){var j=this;Showdown.forEach(a.extensions,function(a){typeof a=="string"&&(a=Showdown.extensions[stdExtName(a)]);if(typeof a!="function")throw"Extension '"+a+"' could not be loaded.  It was either not found or is not a valid extension.";Showdown.forEach(a(j),function(a){a.type?a.type==="language"||a.type==="lang"?f.push(a):(a.type==="output"||a.type==="html")&&g.push(a):g.push(a)})})}var k=function(a,b){if(a.regex){var c=new RegExp(a.regex,"g");return b.replace(c,a.replace)}if(a.filter)return a.filter(b)},l=function(a){return a+="~0",a=a.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|(?=~0))/gm,function(a,d,e,f,g){return d=d.toLowerCase(),b[d]=G(e),f?f+g:(g&&(c[d]=g.replace(/"/g,"&quot;")),"")}),a=a.replace(/~0/,""),a},m=function(a){a=a.replace(/\n/g,"\n\n");var b="p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del|style|section|header|footer|nav|article|aside",c="p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|style|section|header|footer|nav|article|aside";return a=a.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm,n),a=a.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|style|section|header|footer|nav|article|aside)\b[^\r]*?<\/\2>[ \t]*(?=\n+)\n)/gm,n),a=a.replace(/(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,n),a=a.replace(/(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g,n),a=a.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,n),a=a.replace(/\n\n/g,"\n"),a},n=function(a,b){var c=b;return c=c.replace(/\n\n/g,"\n"),c=c.replace(/^\n/,""),c=c.replace(/\n+$/g,""),c="\n\n~K"+(d.push(c)-1)+"K\n\n",c},o=function(a){a=v(a);var b=A("<hr />");return a=a.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm,b),a=a.replace(/^[ ]{0,2}([ ]?\-[ ]?){3,}[ \t]*$/gm,b),a=a.replace(/^[ ]{0,2}([ ]?\_[ ]?){3,}[ \t]*$/gm,b),a=x(a),a=y(a),a=E(a),a=m(a),a=F(a),a},p=function(a){return a=B(a),a=q(a),a=H(a),a=t(a),a=r(a),a=I(a),a=G(a),a=D(a),a=a.replace(/  +\n/g," <br />\n"),a},q=function(a){var b=/(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--.*?--\s*)+>)/gi;return a=a.replace(b,function(a){var b=a.replace(/(.)<\/?code>(?=.)/g,"$1`");return b=N(b,"\\`*_"),b}),a},r=function(a){return a=a.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,s),a=a.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?(.*?(?:\(.*?\).*?)?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,s),a=a.replace(/(\[([^\[\]]+)\])()()()()()/g,s),a},s=function(a,d,e,f,g,h,i,j){j==undefined&&(j="");var k=d,l=e,m=f.toLowerCase(),n=g,o=j;if(n==""){m==""&&(m=l.toLowerCase().replace(/ ?\n/g," ")),n="#"+m;if(b[m]!=undefined)n=b[m],c[m]!=undefined&&(o=c[m]);else{if(!(k.search(/\(\s*\)$/m)>-1))return k;n=""}}n=N(n,"*_");var p='<a href="'+n+'"';return o!=""&&(o=o.replace(/"/g,"&quot;"),o=N(o,"*_"),p+=' title="'+o+'"'),p+=">"+l+"</a>",p},t=function(a){return a=a.replace(/(!\[(.*?)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,u),a=a.replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,u),a},u=function(a,d,e,f,g,h,i,j){var k=d,l=e,m=f.toLowerCase(),n=g,o=j;o||(o="");if(n==""){m==""&&(m=l.toLowerCase().replace(/ ?\n/g," ")),n="#"+m;if(b[m]==undefined)return k;n=b[m],c[m]!=undefined&&(o=c[m])}l=l.replace(/"/g,"&quot;"),n=N(n,"*_");var p='<img src="'+n+'" alt="'+l+'"';return o=o.replace(/"/g,"&quot;"),o=N(o,"*_"),p+=' title="'+o+'"',p+=" />",p},v=function(a){function b(a){return a.replace(/[^\w]/g,"").toLowerCase()}return a=a.replace(/^(.+)[ \t]*\n=+[ \t]*\n+/gm,function(a,c){return A('<h1 id="'+b(c)+'">'+p(c)+"</h1>")}),a=a.replace(/^(.+)[ \t]*\n-+[ \t]*\n+/gm,function(a,c){return A('<h2 id="'+b(c)+'">'+p(c)+"</h2>")}),a=a.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm,function(a,c,d){var e=c.length;return A("<h"+e+' id="'+b(d)+'">'+p(d)+"</h"+e+">")}),a},w,x=function(a){a+="~0";var b=/^(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;return e?a=a.replace(b,function(a,b,c){var d=b,e=c.search(/[*+-]/g)>-1?"ul":"ol";d=d.replace(/\n{2,}/g,"\n\n\n");var f=w(d);return f=f.replace(/\s+$/,""),f="<"+e+">"+f+"</"+e+">\n",f}):(b=/(\n\n|^\n?)(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/g,a=a.replace(b,function(a,b,c,d){var e=b,f=c,g=d.search(/[*+-]/g)>-1?"ul":"ol",f=f.replace(/\n{2,}/g,"\n\n\n"),h=w(f);return h=e+"<"+g+">\n"+h+"</"+g+">\n",h})),a=a.replace(/~0/,""),a};w=function(a){return e++,a=a.replace(/\n{2,}$/,"\n"),a+="~0",a=a.replace(/(\n)?(^[ \t]*)([*+-]|\d+[.])[ \t]+([^\r]+?(\n{1,2}))(?=\n*(~0|\2([*+-]|\d+[.])[ \t]+))/gm,function(a,b,c,d,e){var f=e,g=b,h=c;return g||f.search(/\n{2,}/)>-1?f=o(L(f)):(f=x(L(f)),f=f.replace(/\n$/,""),f=p(f)),"<li>"+f+"</li>\n"}),a=a.replace(/~0/g,""),e--,a};var y=function(a){return a+="~0",a=a.replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g,function(a,b,c){var d=b,e=c;return d=C(L(d)),d=M(d),d=d.replace(/^\n+/g,""),d=d.replace(/\n+$/g,""),d="<pre><code>"+d+"\n</code></pre>",A(d)+e}),a=a.replace(/~0/,""),a},z=function(a){return a+="~0",a=a.replace(/(?:^|\n)```(.*)\n([\s\S]*?)\n```/g,function(a,b,c){var d=b,e=c;return e=C(e),e=M(e),e=e.replace(/^\n+/g,""),e=e.replace(/\n+$/g,""),e="<pre><code"+(d?' class="'+d+'"':"")+">"+e+"\n</code></pre>",A(e)}),a=a.replace(/~0/,""),a},A=function(a){return a=a.replace(/(^\n+|\n+$)/g,""),"\n\n~K"+(d.push(a)-1)+"K\n\n"},B=function(a){return a=a.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,function(a,b,c,d,e){var f=d;return f=f.replace(/^([ \t]*)/g,""),f=f.replace(/[ \t]*$/g,""),f=C(f),b+"<code>"+f+"</code>"}),a},C=function(a){return a=a.replace(/&/g,"&amp;"),a=a.replace(/</g,"&lt;"),a=a.replace(/>/g,"&gt;"),a=N(a,"*_{}[]\\",!1),a},D=function(a){return a=a.replace(/(\*\*|__)(?=\S)([^\r]*?\S[*_]*)\1/g,"<strong>$2</strong>"),a=a.replace(/(\*|_)(?=\S)([^\r]*?\S)\1/g,"<em>$2</em>"),a},E=function(a){return a=a.replace(/((^[ \t]*>[ \t]?.+\n(.+\n)*\n*)+)/gm,function(a,b){var c=b;return c=c.replace(/^[ \t]*>[ \t]?/gm,"~0"),c=c.replace(/~0/g,""),c=c.replace(/^[ \t]+$/gm,""),c=o(c),c=c.replace(/(^|\n)/g,"$1  "),c=c.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm,function(a,b){var c=b;return c=c.replace(/^  /mg,"~0"),c=c.replace(/~0/g,""),c}),A("<blockquote>\n"+c+"\n</blockquote>")}),a},F=function(a){a=a.replace(/^\n+/g,""),a=a.replace(/\n+$/g,"");var b=a.split(/\n{2,}/g),c=[],e=b.length;for(var f=0;f<e;f++){var g=b[f];g.search(/~K(\d+)K/g)>=0?c.push(g):g.search(/\S/)>=0&&(g=p(g),g=g.replace(/^([ \t]*)/g,"<p>"),g+="</p>",c.push(g))}e=c.length;for(var f=0;f<e;f++)while(c[f].search(/~K(\d+)K/)>=0){var h=d[RegExp.$1];h=h.replace(/\$/g,"$$$$"),c[f]=c[f].replace(/~K\d+K/,h)}return c.join("\n\n")},G=function(a){return a=a.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g,"&amp;"),a=a.replace(/<(?![a-z\/?\$!])/gi,"&lt;"),a},H=function(a){return a=a.replace(/\\(\\)/g,O),a=a.replace(/\\([`*_{}\[\]()>#+-.!])/g,O),a},I=function(a){return a=a.replace(/<((https?|ftp|dict):[^'">\s]+)>/gi,'<a href="$1">$1</a>'),a=a.replace(/<(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi,function(a,b){return J(K(b))}),a},J=function(a){var b=[function(a){return"&#"+a.charCodeAt(0)+";"},function(a){return"&#x"+a.charCodeAt(0).toString(16)+";"},function(a){return a}];return a="mailto:"+a,a=a.replace(/./g,function(a){if(a=="@")a=b[Math.floor(Math.random()*2)](a);else if(a!=":"){var c=Math.random();a=c>.9?b[2](a):c>.45?b[1](a):b[0](a)}return a}),a='<a href="'+a+'">'+a+"</a>",a=a.replace(/">.+:/g,'">'),a},K=function(a){return a=a.replace(/~E(\d+)E/g,function(a,b){var c=parseInt(b);return String.fromCharCode(c)}),a},L=function(a){return a=a.replace(/^(\t|[ ]{1,4})/gm,"~0"),a=a.replace(/~0/g,""),a},M=function(a){return a=a.replace(/\t(?=\t)/g,"    "),a=a.replace(/\t/g,"~A~B"),a=a.replace(/~B(.+?)~A/g,function(a,b,c){var d=b,e=4-d.length%4;for(var f=0;f<e;f++)d+=" ";return d}),a=a.replace(/~A/g,"    "),a=a.replace(/~B/g,""),a},N=function(a,b,c){var d="(["+b.replace(/([\[\]\\])/g,"\\$1")+"])";c&&(d="\\\\"+d);var e=new RegExp(d,"g");return a=a.replace(e,O),a},O=function(a,b){var c=b.charCodeAt(0);return"~E"+c+"E"}},typeof module!="undefined"&&(module.exports=Showdown),typeof define=="function"&&define.amd&&define("showdown",function(){return Showdown});
            (function ($, ShowDown, CodeMirror) {
                "use strict";

                $(function() {

                    if (!document.getElementById(field))
                        return;

                    //var delay;
                    var converter = new ShowDown.converter(),
                        editor = CodeMirror.fromTextArea(document.getElementById(field), {
                            mode: 'markdown',
                            tabMode: 'indent',
                            lineWrapping: true
                        });

                    // Really not the best way to do things as it includes Markdown formatting along with words
                    function updateWordCount() {
                        var wordCount = document.getElementsByClassName('entry-word-count')[0],
                            editorValue = editor.getValue();

                        if (editorValue.length) {
                            wordCount.innerHTML = editorValue.match(/\S+/g).length + ' words';
                        }
                    }

					function addButtonBar() {
						$('#markdown-editor-wrapper').before(
							'<div id="markdown-buttons" class="atk-buttonset">' +
								'<button title="Bold" class="atk-button icon-bold" type="button" code="1"></button>' +
								'<button title="Itlic" class="atk-button icon-italic" type="button" code="2"></button>' +
								//'<button title="Underline" class="atk-button icon-underline" type="button" code=""></button>' +
								'<button title="Image URL" class="atk-button icon-picture" type="button" code="6"></button>' +
								'<button title="Upload Image" class="atk-button icon-publish" type="button" code="17"></button>' +
								'<button title="Link" class="atk-button icon-link-1" type="button" code="5"></button>' +
								'<button title="Unordered List" class="atk-button icon-list" type="button" code="9"></button>' +
								'<button title="Ordered List" class="atk-button icon-list-numbered" type="button" code="10"></button>' +
								'<button title="Horizontal line" class="atk-button" type="button" code="16">—</button>' +
								'<button title="Blockquote" class="atk-button icon-quote" type="button" code="13"></button>' +
								'<button title="Add Indent" class="atk-button icon-indent-right" type="button" code="7"></button>' +
								'<button title="Remove Indent" class="atk-button icon-indent-left" type="button" code="8"></button>' +
								'<button title="Header H1" class="atk-button icon" type="button" code="101">H1</button>' +
								'<button title="Header H2" class="atk-button icon" type="button" code="102">H2</button>' +
								'<button title="Header H3" class="atk-button icon" type="button" code="103">H3</button>' +
								'<button title="Header H4" class="atk-button icon" type="button" code="103">H4</button>' +
								'<button title="Header H5" class="atk-button icon" type="button" code="103">H5</button>' +
								'<button title="Paragraph" class="atk-button icon" type="button" code="3">P</button>' +
							'</div>'
						);

						// http://codemirror.net/doc/manual.html#events
						$('#markdown-buttons').find('button').each(function(i,el){
							$(el).on('click',function() {
								var str = markUp($(this).attr('code'),editor.getSelection());
								console.log(str);
								editor.replaceSelection(str);
								updateImagePlaceholders();
							});
							$( el ).tooltip();
						});
					}

                    function updateImagePlaceholders(content) {

                        var imgPlaceholders = $(document.getElementsByClassName('rendered-markdown')[0]).find('p').filter(function() {
                            return (/^(?:\{<(.*?)>\})?!(?:\[([^\n\]]*)\])(?:\(([^\n\]]*)\))?$/gim).test($(this).text());
                        });

                        $(imgPlaceholders).each(function( index ) {

                            var elemindex = index,
                                self = $(this),
                                altText = self.text();

                            (function(){

                                self.dropzone({
                                    url: image_upload_url,
                                    success: function( file, response ){

                                        response = jQuery.parseJSON ( response );

                                        var holderP = $(file.previewElement).closest("p"),

                                        // Update the image path in markdown
                                        imgHolderMardown = $(".CodeMirror-code").find('pre').filter(function() {
                                            return (/^(?:\{<(.*?)>\})?!(?:\[([^\n\]]*)\])(?:\(([^\n\]]*)\))?$/gim).test(self.text()) && (self.find("span").length === 0);
                                        }),

                                        // Get markdown
                                        editorOrigVal = editor.getValue(),
                                        nth = 0,
                                        newMarkdown = editorOrigVal.replace(/^(?:\{<(.*?)>\})?!(?:\[([^\n\]]*)\])(:\(([^\n\]]*)\))?$/gim, function (match, i, original){
                                            nth++;
                                            return (nth === (elemindex+1)) ? (match + "(" + response.path +")") : match;
                                        });
                                        editor.setValue( newMarkdown );

                                        // Set image instead of placeholder
                                        holderP.removeClass("dropzone").html('<img src="'+ response.path +'"/>');
                                    }
                                }).addClass("dropzone");
                            }());
                        })
                    }

					function dd() {
						//console.log(editor.getCursor(true));
						//console.log(editor.getCursor(false));
						//console.log(editor.getRange(editor.getCursor(true),editor.getCursor(false)));
						// doc.replaceRange(replacement: string, from: {line, ch}, to: {line, ch}, ?origin: string)
						//console.log(editor.getSelection()); // → string
						// doc.replaceSelection(replacement: string, ?select: string)
					}

                    function updatePreview() {
                        var preview = document.getElementsByClassName('rendered-markdown')[0];
                        preview.innerHTML = converter.makeHtml(editor.getValue());

                        updateImagePlaceholders(preview.innerHTML);
                        updateWordCount();
                        updateOriginal();
                    }

                    function updateOriginal() {
                        var textarea = document.getElementById(field);
                        var old_value = textarea.value;
                        var new_value = editor.getValue();
                        textarea.value = new_value;
                    }

                    $(document).ready(function () {
                        $('.entry-markdown header, .entry-preview header').click(function (e) {
                            $('.entry-markdown, .entry-preview').removeClass('active');
                            $(e.target).closest('section').addClass('active');
                        });

                        editor.on("change", function () {
                            updatePreview();
                        });
                        editor.on("cursorActivity", function () {
                            dd();
                        });

                        updatePreview();
						addButtonBar();

                        // Sync scrolling
                        function syncScroll(e) {
                            // vars
                            var $codeViewport = $(e.target),
                                $previewViewport = $('.entry-preview-content'),
                                $codeContent = $('.CodeMirror-sizer'),
                                $previewContent = $('.rendered-markdown'),

                            // calc position
                                codeHeight = $codeContent.height() - $codeViewport.height(),
                                previewHeight = $previewContent.height() - $previewViewport.height(),
                                ratio = previewHeight / codeHeight,
                                previewPostition = $codeViewport.scrollTop() * ratio;

                            // apply new scroll
                            $previewViewport.scrollTop(previewPostition);
                        }

                        // TODO: Debounce
                        $('.CodeMirror-scroll').on('scroll', syncScroll);

                        // Shadow on Markdown if scrolled
                        $('.CodeMirror-scroll').scroll(function() {
                            if ($('.CodeMirror-scroll').scrollTop() > 10) {
                                $('.entry-markdown').addClass('scrolling');
                            } else {
                                $('.entry-markdown').removeClass('scrolling');
                            }
                        });
                        // Shadow on Preview if scrolled
                        $('.entry-preview-content').scroll(function() {
                            if ($('.entry-preview-content').scrollTop() > 10) {
                                $('.entry-preview').addClass('scrolling');
                            } else {
                                $('.entry-preview').removeClass('scrolling');
                            }
                        });

                    });
                });
            }(jQuery, Showdown, CodeMirror));

		}



    },$.atk4_markdown._import);

})(jQuery);