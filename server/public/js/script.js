var totals = {
	"calories" : 0,
	"protein" : 0,
	"fat" : 0,
	"carbs" : 0
}

var dailyValues = {
	"calories" : 2000,
	"protein" : 99999,
	"fat" : 65,
	"carbs" : 300
}

jQuery.fn.scrollTo = function(elem, speed) { 
    $(this).animate({
        scrollTop:  $(this).scrollTop() - $(this).offset().top + $(elem).offset().top 
    }, speed == undefined ? 1000 : speed); 
    return this; 
};

$(document).ready(
    function(){
    	// Fix for dynamic tab creation
    	$("#breakfast_menu").addClass("active in");
    	$(".jumbotron li.nav-item:first-child").addClass("active")

        $(".card").click(function () {
			$('.card-info', this).toggle('fast');
        });

        
        if ($( window ).width() < 768){
        	$(".nutrition-cart").insertAfter($(".nutrition-cart").parent())
        }
        		

        $(window).resize(function(){
        	if ($( window ).width() < 768){
        		if($(".nutrition-cart").parent().attr("class") == "container")
        		{}
        		else{
        			$(".nutrition-cart").insertAfter($(".nutrition-cart").parent())
        		}
        	}
        	else{
        		$(".nutrition-cart").insertAfter(".jumbotron")
        	}
        })
		
        $(".card").hover(function () {
        	var isMobile = $( window ).width() < 767;
        	if (!isMobile)
				$('.pin-card', this).toggle('fast');
			else
				$('.pin-card', this).show('slow');

        });

        $(".pin-card").click(function (e) {
        	if ($(this).parent().parent().attr('class') === 'card selected'){
        		// Unpin
        		// Remove cart item
        		var itemText = $(this).parent().find(".card-info").parent().find('.card-title').text()
        		var removee = $(".cart-item").find("*:contains("+itemText+")").parent();
        		// update totals
        		$.each(totals, function(index, value){
        			var t = $(removee).find("#" + index).text().replace(/[^0-9\.]/g, '')
        			totals[index] = Math.round(totals[index] - parseFloat(t))
        		})
        		$(removee).remove()
        		updateTotals()
        		// hide info
        		$(this).parent().children('.card-info').hide('fast');
        		$(this).parent().parent().removeClass('selected')
				$(this).removeClass("btn-danger")
        		$(this).addClass("btn-success")
        		$(this).children('i').addClass('fa-plus')
				$(this).children('i').removeClass('fa-minus')
				// Add to Cart
        	}
        	else{
        		// Pin
        		addToCart($(this).parent().find(".card-info"))
        		$(this).parent().parent().addClass('selected')
        		$(this).addClass("btn-danger")
        		$(this).removeClass("btn-success")
				$(this).children('i').removeClass('fa-plus')
				$(this).children('i').addClass('fa-minus')
        		$(this).parent().children('.card-info').hide('fast');
        	}
        	// Prevent $(".card").click from happening
        	e.stopPropagation();

        });
        var flag = false

        $(".ball").click(function (){
        	var c = $('.nutrition-cart')
  			console.log(Math.floor(parseFloat($(c).css("top"))))
        	console.log($(c).height())
        	if(Math.floor(parseFloat($(c).css("top"))) <= ($(c).height() + 200) && Math.floor(parseFloat($(c).css("top"))) >= ($(c).height() - 200)){

        	    if (!flag){
        	    	$('.list').animate({scrollTop:0},500)
        	    	flag = true
        	    }

	    	   $('.nutrition-cart').animate({
	    			top : "0"
	    		})
        	    $('body').css('overflow', 'hidden')
        	}
        	else {
        		$('.nutrition-cart').animate({
        			top : "100%"
        		})
        	    $('body').css('overflow', 'scroll')
        	}

        })


    });

function addToCart(item) {
	var info = { 
		"nutr" : {}
	}
	info.name = $(item).parent().find(".card-title").text()
	var ss = $(item).parent().find("p.card-info b")
	var sslabel = $(ss).parent().clone().children().remove().end().text()
	info.nutr[sslabel] = ss.text()
	$(item).find("li.list-group-item span").each(function(){
		var label = $(this).parent().clone().children().remove().end().text()
		info.nutr[label] = $(this).text()
	})


	var html = "<div class='cart-item'><h6>" + info.name + "</h6><div class='cart-item-info'></div></div>"
	var menuid = $(item).parent().parent().parent().parent().parent().attr('id')
	var a = $(html).hide().appendTo(".nutrition-cart #" + menuid).fadeIn(500);
	$.each(info.nutr, function(index, value){
		var label = index
		label = label.substring(0, label.length - 2).toLowerCase()
		$(a).children(".cart-item-info").append("<p id='"+ label +"' class='detail'>" + index + value + "</p>")
		var val = parseFloat(value)
		totals[label] = Math.round(totals[label] + val)
	})
	html = `
			
		   `
	$(a).append(html)
	if (a!=undefined)
		$('.list').scrollTo($(a))
	updateTotals()
}

function updateTotals(){
	var i = 0
	$(".total").find("p").each(function(index, value){
		var role = $(this).attr('id')
		$(this).find("span").text(totals[role])
		if (totals[role] > dailyValues[role])
			$(this).find("span").css("color", "red")
		else if ((totals[role] / dailyValues[role]) > .8){
			$(this).find("span").css("color", "green")
		}
		else
			$(this).find("span").css("color", "black")
		i++
	})
	if ($(".cart-item").length != 0)
		$(".ball span").text($(".cart-item").length)
	else
		$(".ball span").empty()
}



