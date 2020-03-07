( function($){

	//These are instantiated in global.js
  prev = "D05";
  next = "F05";
  curr = $('body').attr('id');
	
	//Set our timeline variable
	if (typeof (Storage) !== 'undefined' ) {
    try{
      sessionStorage.setItem('currentSlide', curr);
      sessionStorage.setItem('previousSlide', prev);
      sessionStorage.setItem('nextSlide', next);
    }catch(e) {
      // private browsing mode could throw an QuotaExceededError: DOM Exception 22
      if(is_dev) console.log('sessionStorage exception handled - ' + e.message);
    }
  }

	swipeRight = function() {
		navigateToSlide(prev);
	}

	swipeLeft = function() {
		navigateToSlide(next);
	}

	$("body").swipe( {
		swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
			if (direction == "right") {
				swipeRight();
			}
			else if (direction =="left") {
				swipeLeft();
			}
		},
		fingerCount: 1,
		threshold: 100
	});

	$('#consider_tab ul[data-step-animated]').children().each(stepAnimate);

})(jQuery);