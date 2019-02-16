var citysFlight = [];
var labelFromcity = [];
var hotList = [];
var time1 = new Date().getTime();
$.ajax({
    url: ajaxURL.brandList,
    type: 'get',
    async: false,
    dataType: 'json'
}).error(function (err) {
    //console.log(err)
}).done(function (json) {
    var db_source = [];
    var db_tab = [];
    //  hot list
    hot_list = json.hotBrands;

    db_source = json.brands;
    //console.log(db_source);
    var dbarrs = [],
        hotArr = [];
    $.each(db_source, function (i, v) {
        dbarrs.push(v[4]);
    })
    for (var i = 0; i < hot_list.length; i++) {
        hotArr.push($.inArray(hot_list[i], dbarrs));
    }
    citysFlight = json.brands;
    // db_tab

    // db_tab 其他项的生成
    var arr1 = [],
        arr2 = [],
        arr3 = [],
        arr4 = [],
        arr5 = [];
    for (var i = 0, len = db_source.length; i < len; i++) {
        switch (db_source[i][3].trim().charAt(0).toLowerCase()) {
            case 'a':
            case 'b':
            case 'c':
            case 'd': // ABCD
                arr1.push(i);
                break;
            case 'e':
            case 'f':
            case 'g':
            case 'h':
            case 'i':
            case 'j': // EFGHIJ
                arr2.push(i);
                break;
            case 'k':
            case 'l':
            case 'm':
            case 'n': // KLMN
                arr3.push(i);
                break;
            case 'o':
            case 'p':
            case 'q':
            case 'r':
            case 's':
            case 't': // OPQRST
                arr4.push(i);
                break;
            case 'w':
            case 'x':
            case 'y':
            case 'z': // WXYZ
                arr5.push(i);
                break;
            default:
                alert('something went wrong!')
        }
        //console.log(hotArr);
        //hotList = json.hotBrands
        labelFromcity['热门品牌'] = hotArr;
        labelFromcity['ABCD'] = arr1;
        labelFromcity['EFGHIJ'] = arr2;
        labelFromcity['KLMN'] = arr3;
        labelFromcity['OPQRST'] = arr4;
        labelFromcity['WXYZ'] = arr5;
    }
})

//var hotList = new Array(14,15,16,17,18,19);
var popMain;
//JavaScript Document
(function ($) {
    $.querycity = function (input, options) {
        //console.log(options)
        $(input).blur(function () {
            $(window).unbind("keydown");
        })

        function nextPage() {
            var add_cur = suggestMain.find(".page_break a.current").next();
            add_cur != null && $(add_cur).attr("inum") != null && setAddPage($(add_cur).attr("inum"));
        }

        function prevPage() {
            var add_cur = suggestMain.find(".page_break a.current").prev();
            add_cur != null && $(add_cur).attr("inum") != null && setAddPage($(add_cur).attr("inum"));
        }

        function nextResult() {
            var t_index = suggestMain.find(".list_city_container a").index(suggestMain.find(".list_city_container a.selected")[0]);
            suggestMain.find(".list_city_container").children().removeClass("selected"), t_index += 1;
            var t_end = suggestMain.find(".list_city_container a").index(suggestMain.find(".list_city_container a:visible").filter(":last")[0]);
            t_index > t_end && (t_index = suggestMain.find(".list_city_container a").index(suggestMain.find(".list_city_container a:visible").eq(0))), suggestMain.find(".list_city_container a").eq(t_index).addClass("selected");
        }

        function prevResult() {
            var t_index = suggestMain.find(".list_city_container a").index(suggestMain.find(".list_city_container a.selected")[0]);
            suggestMain.find(".list_city_container").children().removeClass("selected"), t_index -= 1;
            var t_start = suggestMain.find(".list_city_container a").index(suggestMain.find(".list_city_container a:visible").filter(":first")[0]);
            t_index < t_start && (t_index = suggestMain.find(".list_city_container a").index(suggestMain.find(".list_city_container a:visible").filter(":last")[0])), suggestMain.find(".list_city_container a").eq(t_index).addClass("selected");
        }

        function loadCity() {
            var cityList = suggestMain.find(".list_city_container");
            cityList.empty();
            if (options.hotList) var hotList = options.hotList;
            else var hotList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
            for (var item in hotList) {
                if (item > options.suggestLength) return;
                var _data = options.data[hotList[item]];
                cityList.append("<a href='javascript:void(0)' ><span>" + _data[2] + "</span><b>" + _data[1] + "</b></a>");
            }

            suggestMain.find(".list_city_head").html(options.suggestTitleText), setAddPage(1), suggestMain.show(), setTopSelect();
        }

        function queryCity() {
            popMain.hide();
            var value = input.val().toLowerCase();
            if (value.length == 0) {
                loadCity();
                return;
            }
            var city_container = suggestMain.find(".list_city_container"),
                isHave = !1,
                _tmp = new Array;
            for (var item in options.data) {
                var _data = options.data[item];
                typeof _data != "undefined" && (_data[2].indexOf(value) >= 0 || _data[3].indexOf(value) >= 0 || _data[1].indexOf(value) >= 0 || _data[0].indexOf(value) >= 0) && (isHave = !0, _tmp.push(_data));
            }
            if (isHave) {
                city_container.empty();
                for (var item in _tmp) {
                    var _data = _tmp[item];
                    city_container.append("<a href='javascript:void(0)' style='display:none'><span>" + _data[2] + "</span><b>" + _data[1] + "</b></a>");
                }
                city_container.children().each(function(){
                    $(this).on('click',function(){
                        var optionName = $(this).children("b").html();
                        var count = $("#select-cx-pinpai option").length;
                        for (var i = 0; i < count; i++) {
                            if ($("#select-cx-pinpai")[0].options[i].text == optionName) {
                                $("#select-cx-pinpai")[0].options[i].selected = true;
                                break;
                            }
                        }
                        $("#fromcity").val($(this).children("b").html());
                        $("#select-cx-pinpai").change();
                        $("#suggest_city_fromcity").hide();
                    })
                })
                suggestMain.find(".list_city_head").html(value + ",按拼音排序"), setAddPage(1), setTopSelect();
            } else suggestMain.find(".list_city_head").html("<span class='msg'>对不起,找不到" + value + "</span>");
            suggestMain.show();
        }

        function setAddPage(pageIndex) {
            suggestMain.find(".list_city_container a").removeClass("selected"), suggestMain.find(".list_city_container").children().each(function (i) {
                var k = i + 1;
                k > options.suggestLength * (pageIndex - 1) && k <= options.suggestLength * pageIndex ? $(this).css("display", "block") : $(this).hide();
            }), setTopSelect(), setAddPageHtml(pageIndex);
        }

        function setAddPageHtml(pageIndex) {
           
        }

        function setTopSelect() {
            suggestMain.find(".list_city_container").children().length > 0 && suggestMain.find(".list_city_container").children(":visible").eq(0).addClass("selected");
        }

        function onSelect() {
            typeof options.onSelect == "function" && alert(1);
        }

        function popInit() {
            var index = 0;
            popMain.find(".pop_head").html(options.popTitleText);
            if (!options.tabs) {
                popContainer.append("<ul id='label_" + input.attr("id") + "_container' class='current'></ul>"), labelMain.remove();
                for (var item in options.data) $("#label_" + input.attr("id") + "_container").append("<li><a href='javascript:void(0)'>" + options.data[item][1] + "</a></li>");
                return;
            }
            //头字母数组
            var word = new Array(['A', 'B', 'C', 'D'], ['F', 'G', 'H', 'J'], ['K', 'L', 'M', 'N'], ['O', 'P', 'Q', 'R', 'S', 'T'], ['W', 'X', 'Y', 'Z']);
            var word_index = -1; //头字母索引
            for (var itemLabel in options.tabs) {
                index++, index == 1 ? (popContainer.append("<div><ul id='label_" + input.attr("id") + index + "_container' class='current' data-type='" + itemLabel + "'></ul><div>"), labelMain.append("<li><a id='label_" + input.attr("id") + index + "' class='current' href='javascript:void(0)'>" + itemLabel + "</a></li>")) : (popContainer.append("<ul style='display:none' class='fn-clear' id='label_" + input.attr("id") + index + "_container' data-type='" + itemLabel + "'></ul>"), labelMain.append("<li><a id='label_" + input.attr("id") + index + "' href='javascript:void(0)'>" + itemLabel + "</a></li>"));
                //循环输出所有的品牌，包括热门品品牌
                var obj = $("#label_" + input.attr("id") + index + "_container");
                //首先添加分组容器，忽略热门
                var word_index_item_index = 0;
                if (index > 1) {
                    for (var item in word[word_index]) {
                        obj.append('<li style="display:block;float:none;"><div class="label_group_div"><span>' + word[word_index][word_index_item_index] + '</span></div></li>');
                        word_index_item_index++;
                    }
                }
                //开始循环读取品牌
                for (var item in options.tabs[itemLabel]) {
                    var cityCode = options.tabs[itemLabel][item];
                    if (!options.data[cityCode]) break;

                    //忽略热门
                    if (index > 1) {
                        //分组
                        word_index_item_index = 0;
                        for (var item in word[word_index]) {
                            if (options.data[cityCode][2].substring(0, 1).toLowerCase() == word[word_index][word_index_item_index].toLowerCase()) { // for test
                                //alert(obj.find("li").eq(word_index_item_index).html());
                                obj.find("li").eq(word_index_item_index).children('div').append("<a href='javascript:void(0)'>" + options.data[cityCode][1] + "</a>")
                            }
                            word_index_item_index++;
                        }
                    } else {
                        obj.html(obj.html() + "<li><a href='javascript:void(0)'>" + options.data[cityCode][1] + "</a></li>");
                    }
                }
                word_index++;
            }
        }

        //结束
        function resetPosition() {
            popMain.css({
                "top": input.position().top + input.outerHeight(),
                "left": input.position().left
            }), suggestMain.css({
                "top": input.position().top + input.outerHeight(),
                "left": input.position().left
            });
        }

        var input = $(input);
        input.attr("autocomplete", "off"), ($.trim(input.val()) == "" || $.trim(input.val()) == options.defaultText) && input.val(options.defaultText).css("color", "#333");
        var t_pop_focus = !1,
            t_suggest_focus = !1,
            t_suggest_page_click = !1;
        $("body").append("<div id='pop_city_" + input.attr("id") + "' class='pop_city' style='display:none'><p class='pop_head'></p><ul class='list_label'></ul><div class='pop_city_container'></div></div>"), $("body").append("<div id='suggest_city_" + input.attr("id") + "' class='list_city' style='display:none;'><div class='list_city_head'></div><div class='list_city_container'></div><div class='page_break'></div></div>");
        var popMain = $("#pop_city_" + input.attr("id")),
            popContainer = popMain.find(".pop_city_container"),
            labelMain = popMain.find(".list_label"),
            suggestMain = $("#suggest_city_" + input.attr("id"));
            suggestContainer = suggestMain.find(".list_city_container");
            popMain.bgIframe(), 
            suggestMain.bgIframe(), popInit(), resetPosition(), $(window).resize(function () {
            resetPosition();
        }), 
        input.focus(function () {
            if (t_suggest_page_click) return t_suggest_page_click = !1, !0;
            //suggestMain.hide(), 
            $.trim($(this).val()) == options.defaultText && $(this).val("").css("color", "#000"), popMain.show();
        }).click(function () {
            if (t_suggest_page_click) {
                t_suggest_page_click = !1;
                return;
            }
           // suggestMain.hide(),
            popMain.show();
        }).blur(function () {
            t_pop_focus == 0 && (popMain.hide(), ($.trim(input.val()) == "" || $.trim(input.val()) == options.defaultText) && input.val(options.defaultText).css("color", "#666"));
        }), 
        
        labelMain.find("a").on("click", function () {
            input.focus(), t_pop_focus = !0;
            var labelId = $(this).attr("id");
            labelMain.find("li a").removeClass("current"), $(this).addClass("current"), popContainer.find("ul").hide(), $("#" + labelId + "_container").show();
        }), 
        popContainer.find("a").on("click", function () {
            input.val($(this).html()), popMain.hide();
        }), 
        popMain.mouseover(function () {
            t_pop_focus = !0;
        }).mouseout(function () {
            t_pop_focus = !1;
        }), input.blur(function () {
            t_suggest_focus == 0 && ($(this).val() == "" && $(this).val(suggestMain.find(".list_city_container a.selected").children("b").text())
             //suggestMain.hide()
             );
        }).keydown(function (event) {
            popMain.hide(), event = window.event || event;
            var keyCode = event.keyCode || event.which || event.charCode;
            keyCode == 37 ? prevPage() : keyCode == 39 ? nextPage() : keyCode == 38 ? prevResult() : keyCode == 40 && nextResult();
        }).keypress(function (event) {
            event = window.event || event;
            var keyCode = event.keyCode || event.which || event.charCode;
            13 == keyCode && suggestMain.find(".list_city_container a.selected").length > 0 && (input.val(suggestMain.find(".list_city_container a.selected").children("b").text())
                //suggestMain.hide()
                );
        }).keyup(function (event) {
            event = window.event || event;
            var keyCode = event.keyCode || event.which || event.charCode;
            keyCode != 13 && keyCode != 37 && keyCode != 39 && keyCode != 9 && keyCode != 38 && keyCode != 40 && queryCity();
        }),
        suggestMain.find(".list_city_container a").on("click", function () {
            input.val($(this).children("b").text())
            // suggestMain.hide()
            ;
        }).on("mouseover", function () {
            t_suggest_focus = !0;
        }).on("mouseout", function () {
            t_suggest_focus = !1;
        }), 
        suggestMain.find(".page_break a").on("mouseover", function () {
            t_suggest_focus = !0;
        }).on("mouseout", function () {
            t_suggest_focus = !1;
        }), 
        suggestMain.find(".page_break a").on("click", function (event) {
            t_suggest_page_click = !0, input.click(), $(this).attr("inum") != null && setAddPage($(this).attr("inum"));
        });
    }, $.fn.querycity = function (options) {
        var defaults = {
                "data": {},
                "tabs": "",
                "hotList": "",
                "defaultText": "全部",
                "popTitleText": "支持中文/拼音/简拼输入",
                "suggestTitleText": "输入中文/拼音/简拼",
                "suggestLength": 10,
                "pageLength": 5,
                "onSelect": ""
            },
            options = $.extend(defaults, options);
        return this.each(function () {
            new $.querycity(this, options);
        }), this;
    };
})(jQuery),
function ($) {
    $.fn.bgIframe = $.fn.bgiframe = function (s) {
        if (/*$.browser.msie &&*/ /6.0/.test(navigator.userAgent)) {
            s = $.extend({
                "top": "auto",
                "left": "auto",
                "width": "auto",
                "height": "auto",
                "opacity": !0,
                "src": "javascript:;"
            }, s || {});
            var prop = function (n) {
                    return n && n.constructor == Number ? n + "px" : n;
                },
                html = '<iframe class="bgiframe"frameborder="0"tabindex="-1"src="' + s.src + '"' + 'style="display:block;position:absolute;z-index:-1;' + (s.opacity !== !1 ? "filter:Alpha(Opacity='0');" : "") + "top:" + (s.top == "auto" ? "expression(((parseInt(this.parentNode.currentStyle.borderTopWidth)||0)*-1)+'px')" : prop(s.top)) + ";" + "left:" + (s.left == "auto" ? "expression(((parseInt(this.parentNode.currentStyle.borderLeftWidth)||0)*-1)+'px')" : prop(s.left)) + ";" + "width:" + (s.width == "auto" ? "expression(this.parentNode.offsetWidth+'px')" : prop(s.width)) + ";" + "height:" + (s.height == "auto" ? "expression(this.parentNode.offsetHeight+'px')" : prop(s.height)) + ";" + '"/>';
            //return this.each(function() {
            //    $("> iframe.bgiframe",this).length == 0 && this.insertBefore(document.createElement(html), this.firstChild);
            // })
        }
        return this;
    };
}(jQuery);


$(function () {
    $('#fromcity').querycity({
        'data': citysFlight,
        'tabs': labelFromcity,
        'hotList': hotList
    });
    $(".pop_city_container").after('<br style="clear:both;" />');

    $("#fromcity").focus(function () {
        var _obj = $(this).parent(),
            _h = $(this).height() +
                parseInt($(this).css('paddingTop')) +
                parseInt($(this).css('paddingBottom')) + 5,
            _offset = _obj.offset();

        $("#pop_city_fromcity,#suggest_city_fromcity").css({
            top: _offset.top + _h,
            left: _offset.left + 15
        });
    });

    //单击品牌触发change事件
    $(".pop_city_container li,.list_city_container a").on("click", function () {
        var count = $("#select-cx-pinpai option").length;
        for (var i = 0; i < count; i++) {
            if ($("#select-cx-pinpai")[0].options[i].text == $("#fromcity").val()) {
                $("#select-cx-pinpai")[0].options[i].selected = true;
                break;
            }
        }
        $("#select-cx-pinpai").change();
        $('#yearTail').val('');
    });
})
$(document).click(function (e) {
    if ($(e.target).closest(".pop_city").length == 0
        && $(e.target).closest("#fromcity").length == 0) {
        $(".pop_city").hide();
        $("#suggest_city_fromcity").hide();
    }
});

$(".ui-multiselect-checkboxes").html('<li>请先选择品牌</li>');

var jsonDataModel;
$.getJSON(ajaxURL.brandModelYear, function (result) {
    jsonDataModel = result;
    $("#select-cx-pinpai").append($("<option/>").text("请输入").attr("value", "0"));
    $.each(jsonDataModel.brand, function (i, field) {
        $("#select-cx-pinpai").append($("<option/>").text(field.v).attr("value", field.k));
    });
});
$("#fromcity").keyup(function () {
    if ($("#fromcity").val() == "") {
        $("#select-cx-pinpai").change().val("");
        $("#select-chexing").empty().multiselect('rebuild');
    }
    if ($("#fromcity").val() != "") {
        var val = $("#fromcity").val();
        var thisVal = $("#select-cx-pinpai option:contains('" + val + "')").val();
        $("#select-chexing").empty();
        $("#select-niankuan").empty();
        if (thisVal > 0) {
            $.each(jsonDataModel.model[thisVal], function (i, field) {
                $("#select-chexing").append($("<option/>").text(field.v).attr("value", field.k));
            });
        }
        $("#select-chexing").multiselect('refresh');
        $("#select-niankuan").multiselect('refresh');
    }
    $('#yearTail').val('');
});

$("#select-cx-pinpai").on("change", function () {
    $("#select-chexing,#select-niankuan").empty();
    $('#yearTail').val('');
    if ($("#select-cx-pinpai").val() > 0) {
        $.each(jsonDataModel.model[$("#select-cx-pinpai").val()], function (i, field) {
            $("#select-chexing").append($("<option/>").text(field.v).attr("value", field.k));
        });
    }
    $("#select-chexing").multiselect('rebuild');
    $("#select-niankuan").multiselect('rebuild');
});

$("#select-chexing").change(function () {
    var num = $("#select-chexing").val();
    $('#yearTail').val('');
    $("#select-niankuan").empty();
    if (num == null) {
        $("#select-niankuan").multiselect('rebuild');
        $('.img').hide();
        $("#niankuan").show();
    }
    else if (num.length == 1) {
        try {
            $.each(jsonDataModel.year[$("#select-chexing").val()], function (i, field) {
                $("#select-niankuan").append($("<option/>").text(field.v).attr("value", field.k));
            });
        } catch (err) {
        }
        $("#niankuan").show();
        $("#select-niankuan").multiselect('rebuild');
    }
    else if (num.length > 1) {
        $("#niankuan").hide();
    }
});

