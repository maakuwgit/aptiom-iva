( function($){

	//These are instantiated in global.js
  prev = "G05";
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

	$('.landscape [data-isi-link]').load('../shared/html/isi-link.html');
	
	$('[data-video]').each(function(){
	    $(this).find('> a').css('background-image','url('+$(this).find('img').attr('src')+')');
	    $(this).on(touchClick, function(){
	      var target = $(this),
	      		video  = $(this).find('video'),
	      		controls = $('[data-controls]'),
	      		done = $(controls).find('[data-control="done"]');

	      $(done).on(touchClick, hideVideo);

	      function hideVideo(event){
	        $(target).unbind().on(touchClick, playVideo);
	        $(controls).addClass('hide');
	        video[0].pause();
	        $(video).attr('data-playing', 'false').hide();
	        video[0].currentTime = 0;
	      }

	      function pauseVideo(event){
	      	$(target).unbind()
	        video[0].pause();
	        $(video).attr('data-playing', 'false');
	        $(target).on(touchClick, playVideo);
	      }

	      function playVideo(event){
        	$(controls).removeClass('hide');
	      	$(target).unbind();
	        video[0].play();
	        $(video).attr('data-playing', 'true').show();
	        $(target).on(touchClick, pauseVideo);
	      }

	      function toggleVideo(event){
	        var playing = $(video).attr('data-playing');
	        if( playing == 'false') {
	          playVideo(event);
	        }else{
	        	pauseVideo(event);
	        }
	      }

	      if ( $(video)[0] ) {
	        if ( $(video).find('source').length > 0 ) {
	          toggleVideo(false);
	          video.off('ended').on('ended', hideVideo);
	        }
	      }
	    });
	  });

})(jQuery);