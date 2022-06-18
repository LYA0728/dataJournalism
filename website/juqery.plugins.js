// console.log("该输出来自jQuery插件")


;(function($){
    $.fn.tab = function(params) {
        const defaults = {
            mouseEvent : "click"
        };

        const settings = $.extend({}, defaults, params);
        $(".activiteBlock").css({"width":$(this).children().eq(1).width(),
                                 'height':$(this).children().eq(1).height(),
                                 "backgroundColor":"#fff"
                                })

        // console.log($(this).children().eq(1).width())
        $(this).children().bind(settings["mouseEvent"], function(){
            // console.log($(this).index())
            //console.log($(this).width())

            if($(this).index() != 1){
                $(".activiteBlock").css("transform", `translate(${$(this).width()}px,0)`)
                streamgraphPlt(figContainer = "#streamgraph", data = localCOVID_data)
                // $(".activiteBlock").html("")
                //console.log($(this).index() == 0)
            }else{
                // $(".activiteBlock").html("新增无症状趋势")
                $(".activiteBlock").css("transform", `translate(0,0)`)
                streamgraphPlt(figContainer = "#streamgraph", data = asymptomatic_data)
            }
            
            
        })
    }

})(jQuery);

/* ;(function($){
    $.fn.tab = function(params){
        var defaults = {
            mouseEvent : 'click',
            active : "active",
            parent:"#tab1"
        }

        var settings = $.extend({}, defaults, params)
        console.log($(this))
        
        return this;
    }
})(jQuery); */