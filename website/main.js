// author:LYA
// date:2022/06/25

const areaMap = {
    'Jiading': "嘉定区",
    'Fengxian': "奉贤区",
    'Chongming': "崇明区",
    'Xuhui': "徐汇区",
    'Putuo': "普陀区",
    'Yangpu': "杨浦区",
    'Songjiang': "松江区",
    'Pudong': "浦东新区",
    'Hongkou': "虹口区",
    'Jinshan': "金山区",
    'Changning': "长宁区",
    'Minhang': "闵行区",
    'Qingpu': "青浦区",
    'Jingan': "静安区",
    'total': '全部',
    'Huangpu': "黄浦区"
};

let classMap = {
    "物资": 'goods',
    "其他": 'other',
    "疾病": 'disease',
    "重病": 'serious',
    "孕妇": "pregnant",
    "未分类": "unkonw"
};
/* ['#009F4D','#70AD47',"#487A7B","#9AA987"] */
let colorMap = {
    "物资": '#009F4D',
    "其他": '#70AD47',
    "疾病": '#487A7B',
    "重病": '#9AA987',
    "孕妇": "#0E2656",
    "未分类": "orange",
    "existing":"#2BAA5D",
    'newlyIncreased':"#70AD47"
};

const selmap = {
    'total': "全部",
    'other': "其他",
    'goods': "物资",
    'disease': "疾病",
    'serious': "重病",
    "pregnant": "孕妇",
    "unkonw": "未知"
};

var scatterOpacityMap = {
    "urgent": "0.3",
    "acute": "0.6",
    "critical": "1"
};


const textmap = {
    "urgent": "较急",
    'acute': '紧急',
    'critical': '极紧急',
    "existing":"正在透析人数", 
    "newlyIncreased":"新增透析人数",
    "solveed":"已解决",
    "Following":"跟进中",
    "unfollow":"待跟进"
}

var axisTimeFormat = d3.timeFormatLocale({
    dateTime: "%a %b %e %X %Y",
    date: "%Y/%-m/%-d",
    time: "%H:%M:%S",
    periods: ["上午", "下午"],
    days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    shortDays: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    shortMonths: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
});
// js 媒体查询
const plotMargins = {
    "pc": {
        "top": 10,
        "right": 45,
        "bottom": 70,
        "left": 45
    },

    "mobile": {
        "top": 5,
        "right": 7.5*3,
        "bottom": 40,
        "left": 7.5 * 3
    }
}

circleRadius = {
    'pc': [4.5, 12.5],
    "mobile": [1.95, 6.05],
}


const plotSizes = {
    "pc": {
        'width': $('div.graph').width(),
        'height': $('div.graph').width() / 16 * 12
    },

    "mobile" : {
        'width': $('div.graph').width(),
        'height': $('div.graph').width()
    }
}


const mediaQuery = window.matchMedia("(max-width: 767px)");
let plotMargin = mediaQuery.matches ? plotMargins["mobile"] : plotMargins["pc"],
radiusRange = mediaQuery.matches ? circleRadius["mobile"] : circleRadius["pc"],
plotSize = mediaQuery.matches ? plotSizes["mobile"] : plotSizes["pc"];
/* console.log(plotSize) */

if(mediaQuery.matches){
    $("#stackBarLine div.NotMobile").empty();
};
// data file url
const scatter_df_url = 'https://fastly.jsdelivr.net/gh/LYA0728/dataJournalism/data/scatter_df_long.csv';
var selectedCOVID_tend_url = "https://fastly.jsdelivr.net/gh/LYA0728/dataJournalism/data/selectedCOVID_tend_new2.csv";
var demanData_url = "https://fastly.jsdelivr.net/gh/LYA0728/dataJournalism/data/demand_new2.json"
var infected_url = "https://fastly.jsdelivr.net/gh/LYA0728/dataJournalism/data/infected.csv"


var colorHex = ['#51868C','#7A6F6C','#F2DBD5','#A4BEE0','#59687A',"#0E2656"];



/* $("#animation img").on("click", function(){
    $(this).css("opacity","0")
}) */

/* 导航 */


$("div#nav").css("top",`${0.5*($(window).height() - $("div#nav").height())}px`)


window.onload = function(){
    $(`a[target="_top"]`).remove();
}

// 回到顶部
/* let timer = null;
index = 0.1
document.querySelector("div#backToTop > img").onclick = function () {
    index-=0.0000000001;
    scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    clearInterval(timer)
    timer = setInterval(function () {
        if (scrollTop <= 0) {
            clearInterval(timer);
            //alert(123)
        };
        scrollTop -= $(window).height()/2;
        console.log(scrollTop)
        
        document.body.scrollTop = scrollTop;
        document.documentElement.scrollTop = scrollTop
    }, 10);
} */
document.querySelector("div#backToTop > img").onclick = function(){
    index = 9;
    i = 0.99
    scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    while(i>-1){
        scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        document.documentElement.scrollTop = $(document).height()*i;
        i-=0.1
        index -=1
        console.log(index)
    }
}



