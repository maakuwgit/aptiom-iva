( function($){

	//These are instantiated in global.js
  prev = false;
  next = false;
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

	$('#sidenav').load('../shared/html/sidenav.html', function(){
		var anchors = $('#sidenav a[href*="#"]:not([href="#home"]), #pi-iscroll a[href*="#"]'),
				currSection = window.location.hash;

		$(this).find('a[href="#home"]').unbind().on(touchClick, function(){
			gotoSlide($(this).attr('data-href'));
		});

		$(this).find('[data-isi-content]').load('../shared/html/isi.html', function(){
	    var sidebar_scroll = new IScroll('#sidebar-isi_wrapper', { bounce: false, scrollbars: true, resizeScrollbars: false });
	    sidebar_scroll.refresh();
			rebindAnchors();
	  });

		var pi_scroll = new IScroll('#pi-wrapper', { 
			bounce: false, 
			scrollbars: false, 
			resizeScrollbars: false, 
			click:true,
			tap:true });


		pi_scroll.on('scrollStart', resetAnchors);

		if(anchors){
			anchors.on(touchClick, function(event){
				event.preventDefault();
				//event.stopPropagation();

				var target = $(this).attr('href');

				$(anchors).removeClass('active');
				$(this).addClass('active');
				
				pi_scroll.scrollToElement(target, 750, 0, 0);

				var sub = target.search('-');

				if(sub) target = target.substr(0, sub);
				$('#sidenav a[href="'+target+'"]').addClass('active');
			});
		}

		function resetAnchors(){
			$(anchors).removeClass('active');
		}

		$(document).scroll(resetAnchors);

		$(document).foundation('reflow');
	});

})(jQuery);