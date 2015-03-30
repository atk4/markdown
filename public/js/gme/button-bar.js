/*!
 * ====================================================
 * kv-markdown.js
 * ====================================================
 * A markdown editor parser for PHP Markdown Extra and 
 * PHP SmartyPants. Designed for Yii Framework 2.0
 *
 * https://github.com/kartik-v/yii2-markdown
 * 
 * Copyright (c) 2015, Kartik Visweswaran  
 * Krajee.com  
 * Licensed under BSD-3 License. 
 * Refer attached LICENSE.md for details. 
 * Version: 1.3.1
 */
String.prototype.trimRight = function (charlist) {
    if (charlist === undefined) {
        charlist = "\s";
    }
    return this.replace(new RegExp("[" + charlist + "]+$"), "");
};

String.prototype.repeat = function (n) {
    n = n || 1;
    return Array(n + 1).join(this);
}

function isEmpty(value, trim) {
    return value === null || value === undefined || value == []
        || value === '' || trim && $.trim(value) === '';
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function getMarkUp(txt, begin, end) {
    var m = begin.length,
        n = end.length
    var str = txt
    if (m > 0) {
        str = (str.slice(0, m) == begin) ? str.slice(m) : begin + str
    }
    if (n > 0) {
        str = (str.slice(-n) == end) ? str.slice(0, -n) : str + end
    }
    return str;
}

function getBlockMarkUp(txt, begin, end) {
    var str = txt
    if (str.indexOf('\n') < 0) {
        str = getMarkUp(txt, begin, end);
    } else {
        var list = []
        list = txt.split('\n')
        $.each(list, function (k, v) {
            list[k] = getMarkUp(v.trimRight(), begin, end + '  ')
        })
        str = list.join('\n')
    }
    return str
}

function markUp(btn, txt) {
//    var el = $(source)
//    el.focus();
//    var txt = el.extractSelectedText(),
      var len = txt.length,
          str = txt

    // Bold
    if (btn == 1) {
        str = (txt.length > 0) ? getBlockMarkUp(txt, '**', '**') : '**(bold text here)**';
    }
    // Italic
    else if (btn == 2) {
        str = (txt.length > 0) ? getBlockMarkUp(txt, '*', '*') : '*(italic text here)*';
    }
    // Paragraph
    else if (btn == 3) {
        str = (txt.length > 0) ? getMarkUp(txt, '\n', '\n') : '\n(paragraph text here)\n';
    }
    // New Line
    else if (btn == 4) {
        str = getBlockMarkUp(txt, '', '  ');
    }
    // Header
    else if (btn > 100) {
        n = btn - 100
        var pad = "#".repeat(n)
        str = getMarkUp(txt, pad + " ", " " + pad);
    }
    // Hyperlink
    else if (btn == 5) {
        link = prompt('Insert Hyperlink', 'http://')
        str = (link != null && link != '' && link != 'http://') ? '[' + txt + '](' + link + ')' : txt
    }
    // Image
    else if (btn == 6) {
        link = prompt('Insert Image Hyperlink', 'http://')
        str = (link != null && link != '' && link != 'http://') ? '![' + txt + '](' + link + ' "enter image title here")\n\n' : txt
    }
    // Add Indent
    else if (btn == 7) {
        var str = txt,
            ind = '  '
        if (str.indexOf('\n') < 0) {
            str = ind + str
        } else {
            var list = []
            list = txt.split('\n')
            $.each(list, function (k, v) {
                list[k] = ind + v
            })
            str = list.join('\n')
        }
    }
    // Remove Indent
    else if (btn == 8) {
        var str = txt,
            ind = '  '
        if (str.indexOf('\n') < 0 && str.substr(0, 2) == ind) {
            str = str.slice(2)
        } else {
            var list = []
            list = txt.split('\n')
            $.each(list, function (k, v) {
                list[k] = v
                if (v.substr(0, 2) == ind) {
                    list[k] = v.slice(2)
                }
            })
            str = list.join('\n')
        }
    }
    // Unordered List
    else if (btn == 9) {
        str = getBlockMarkUp(txt, "- ", "");
    }
    // Ordered List
    else if (btn == 10) {
        //start = prompt('Enter starting number', 1)
		start = 1
        if (start != null && start != '') {
            if (!isNumber(start)) {
                start = 1
            }
            if (txt.indexOf('\n') < 0) {
                str = getMarkUp(txt, start + '. ', '');
            } else {
                var list = [],
                    i = start
                list = txt.split('\n')
                $.each(list, function (k, v) {
                    list[k] = getMarkUp(v, i + '. ', '')
                    i++
                })
                str = list.join('\n')
            }
        }
    }
    // Definition List
    else if (btn == 11) {
        if (txt.indexOf('\n') > 0) {
            var list = [],
                i = 1
            list = txt.split('\n')
            $.each(list, function (k, v) {
                tag = (i % 2 == 0) ? ':    ' : '';
                list[k] = getMarkUp(v, tag, '')
                i++
            })
            str = list.join('\n')
        } else {
            str = txt + "\n:    \n"
        }
    }
    // Footnote
    else if (btn == 12) {
        title = 'Enter footnote '
        notes = ''
        if (txt.indexOf('\n') < 0) {
            notes = '[^1]: ' + title + '1\n'
            str = getMarkUp(txt, '', title + '[^1]') + "\n" + notes;
        } else {
            var list = [],
                i = 1
            list = txt.split('\n')
            $.each(list, function (k, v) {
                id = '[^' + i + ']'
                list[k] = getMarkUp(v, '', id + '  ')
                notes = notes + id + ': ' + title + i + '\n'
                i++
            })
            str = list.join('\n') + "  \n\n" + notes
        }
    }
    // Blockquote
    else if (btn == 13) {
        str = getBlockMarkUp(txt, "> ", "  ");
    }
    // Inline Code
    else if (btn == 14) {
        str = getMarkUp(txt, "`", "`");
    }
    // Code Block
    else if (btn == 15) {
        lang = prompt('Enter code language (e.g. html)', '')
        if (isEmpty(lang, true)) {
            lang = '';
        }
        str = getMarkUp(txt, "~~~" + lang + " \n", "\n~~~  \n");
    }
    // Horizontal Line
    else if (btn == 16) {
        str = getMarkUp(txt, '', '\n- - -');
    }
	// DropZone
	else if (btn == 17) {
		if (!txt) {
			txt = prompt('Insert Image Name', 'Image name')
		}
		str = '\n![' + txt + ']\n\n';
	}
	// Iframe video
	else if (btn == 18) {
		if (!txt) {
			txt = prompt('Insert video ID', '')
		}
		str = (txt != null && txt != '') ?
			'\n<iframe title="YouTube video player" width="480" height="390" ' +
			'src="http://www.youtube.com/embed/' + txt + '" ' +
			'frameborder="0" allowfullscreen></iframe>\n\n' : txt;
	}
//    if (!isEmpty(str)) {
//        el.replaceSelectedText(str, "select")
//    }

	return str;
}
