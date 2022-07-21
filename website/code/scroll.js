
var played = 0;
$('div#stickyNote video').bind('waiting',function(){
    ++played
})
window.addEventListener("scroll", () => {
    const docScroll = $(document).scrollTop()+10;
    let target = $('#forword >div> div.text span.bg-light').offset()["top"];
    //console.log(1231)
    if (target - docScroll - $(window).height() > -$(window).height() / 2) {
        $("div#forword > div.img > img:nth-child(2)").css('opacity', 0)
        
    } else {
        $("div#forword > div.img > img:nth-child(2)").css('opacity', 1)
    };


    let navTarget = $("div#parallaxPage1").offset()["top"];
    
    if(navTarget-docScroll-$(window).height()*1.45<0){
        $("div#nav").css({
            'transform':`translateX(5px)`,
            "opacity":"1"
        });
        $("div#nav > div").eq(0).attr("class","navActivate").siblings().attr("class","");
    }else{
        $("div#nav > div").toggleClass("doubleDiv")
        $("div#nav").css({
            'transform':`translateX(-155px)`,
            //'transform':`translate(-155px,${0.5*($(window).height() - $("div#nav").height())}px)`,
            "opacity":"0"
        })
    };
    $("div#nav > div").toggleClass("doubleDiv")

    /* 导航定位 */
    if(docScroll > $("div#parallaxPage1").offset()["top"] && docScroll < $("div#parallaxPage2").offset()["top"]){
        $("div#nav > div").eq(1).toggleClass("navActivate").siblings().removeClass("navActivate");
        
    }else if(docScroll > $("div#parallaxPage2").offset()["top"] && docScroll < $("div#parallaxPage3").offset()["top"]){
        $("div#nav > div").eq(2).toggleClass("navActivate").siblings().removeClass("navActivate");
        
    }
    else if(docScroll > $("div#parallaxPage3").offset()["top"] && docScroll < $(document).height()*0.9){
        $("div#nav > div").eq(3).toggleClass("navActivate").siblings().removeClass("navActivate");
        
    }
    else if(docScroll >= $(document).height()*0.9){
        $("div#nav > div").eq(4).toggleClass("navActivate").siblings().removeClass("navActivate");
    }
    /* else{
        $("div#nav > div").eq(0).attr("class","navActivate").siblings().attr("class","");
    } */

    
    // 便利贴动画
    
    // console.log(played)
    //console.log(docScroll-$("div#stickyNote").offset()["top"]+0.5*($(window).height()))
    if(docScroll-$("div#stickyNote").offset()["top"]+0.5*($(window).height())>0 && played == 0){
        // console.log($('div#stickyNote video')[0]["ended"])
        $('div#stickyNote video').trigger('play'); 
    }
})

$('div#endingAn video').css('cursor', 'pointer').bind("click",function(){
    $(this).trigger('play'); 
})