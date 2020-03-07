( function($){

	//These are instantiated in global.js
  prev = "C05";
  next = "E05";
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

	var animated = false;
	
	$('.tabs').on('toggled', function (event, tab) {
		var target = $('[data-tabbed="mono_landing"]').find('svg[id*="svg-rule_"]');
    if( $(tab).children('a').attr('href').substr(1) == 'mono_tab'){
    	if (animated == false) {
				$(target).resetClip();
    		animateRules();
			}
    }
  });

  $('[data-tap-to-enlarge=""]').find('a.th').on(touchClick, setFocused);
  $('[data-tap-to-enlarge="multiple"]').find('a.th').on(touchClick, setFocusedMultiple);
	$('[data-chart-key]').setChartKey();
  $('a[data-replay-id]').on(touchClick, reanimateRules);
  $('a[data-highlight]').on(touchClick, highlight);
	
	var stepper = false;
	var index  = 0;
	
	$.fn.resetClip = function(){
		$(this).css('clip','rect(0 0 50px 0)');
	}

  function animateRules(){
		var target = $('[data-tabbed="mono_landing"]').find('svg[id*="svg-rule_"]');

		clearInterval(stepper);
		index = 0;
		stepper = setInterval(stepClip, 1);

		function stepClip(){
			$(target).css('clip','rect(0 '+index+'px 50px 0)');
			if(index >= 520){
				clearInterval(stepper);
				index = 0;
				animated = true;
				$('a[data-replay-id]').removeClass('disabled');
			}else{
				if(index > 50) $('.chart [role="labels"] li[rel="2wk"]').addClass('fadeIn');
				if(index > 300) $('.chart [role="labels"] li[rel="10wk"]').addClass('fadeIn');
				index+=3;
			}
		}
	}

	function reanimateRules(event){
		$(this).addClass('disabled');
		$('[data-tabbed="mono_landing"]').find('svg[id*="svg-rule_"]').resetClip();
		$('.chart [role="labels"] li').removeClass('fadeIn');
		animateRules();
	}

	function highlight(event){
		var anchor 		= $(this),
				parent 		= $(this).parent(),
				siblings 	= $(parent).siblings('div'), 
				chart 		= $(parent).parent(),
				labels 		= $(chart).find('[role="labels"]').children();

		if( $(chart).hasClass('highlighted') ){
			if( $(parent).hasClass('dimmed') ){
				$(parent).removeClass('dimmed');
				$(siblings).addClass('dimmed');
				$('[data-replay-id]').addClass('disabled');
				$(labels).each(function(){
					if( $(this).attr('rel') == $(anchor).attr('data-highlight') ){
						$(this).removeClass('dimmed');
					}else{
						$(this).addClass('dimmed');
					}
				});
			}else{
				$(chart).removeClass('highlighted');
				$(parent).removeClass('highlighted');
				$(siblings).removeClass('dimmed');
				$('[data-replay-id]').removeClass('disabled');
				$(labels).removeClass('dimmed');
			}
		}else{
			$(chart).addClass('highlighted');
			$(siblings).addClass('dimmed');
			$('[data-replay-id]').addClass('disabled');
		}
	}


})(jQuery);