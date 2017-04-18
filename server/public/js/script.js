$(document).ready(
    function(){

    	// Fix for dynamic tab creation
    	$("#breakfast_menu").addClass("active");

        $(".card").click(function () {
			$('.card-info', this).toggle('fast');
			$('.pin-card', this).toggle('fast');
        });
        $(".pin-card").click(function (e) {
        	if ($(this).parent().parent().attr('class') === 'card selected'){
        		// Unpin
        		$(this).parent().parent().removeClass('selected')
				$(this).removeClass("btn-danger")
        		$(this).addClass("btn-success")
        		$(this).children('i').addClass('fa-plus')
				$(this).children('i').removeClass('fa-minus')
				// Add to Daily
        	}
        	else{
        		// Pin
        		$(this).parent().parent().addClass('selected')
        		$(this).addClass("btn-danger")
        		$(this).removeClass("btn-success")
				$(this).children('i').removeClass('fa-plus')
				$(this).children('i').addClass('fa-minus')
        	}
        	// Prevent $(".card").click from happening
        	e.stopPropagation();

        });


    });

function addToCart() {
	
}
