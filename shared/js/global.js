//Flags
var is_dev 				= false;
var touchClick 		= ("ontouchstart" in document.documentElement) ? "touchend": (window.navigator.pointerEnabled)? "pointerup" : "click";
var use_brackets 	= true;
var use_animate 	= true;
var use_trace 		= true;
var trace_dir 		= '../trace/';
var aID,
		curr,
		prev,
		next,
		slideMap,
		slides,
		mainpresentation,
		pikeymessage,
		swipeRight = function() { iva.navigatePrevious(); },
		swipeLeft = function() { iva.navigateNext(); };

//Markup Shortcuts
var links 			= $('button[data-href], .button[data-href], a[data-href]'),
		tabbed 			= $('button.tabbed, .button.tabbed, a.th[data-tabbed-id]'),
		tabs 				= $('[data-tab]'),
		footer 			= $('#footer-menu'),
		sidebar 		= $('#sidebar'),
		article 		= $('main article.portrait'),
		header 			= $('#header-nav'),
		logo 				= $('#aptiom_logo'),
		isi_link 		= $('[data-isi-link]'),
		bracketees 	= $('[data-bracket-img],[data-brackets],[data-bracket-swap]'),
		landing_btn = $('button[rel="landing"], .button[rel="landing"]'),
		title 			= header.find('h1');


( function ( $ ) {

	//Bindings
	/*--------------------[ bindButtons ]--------------------------
	@usage: this function is called once, from the init function
					and attaches bindings to all the tabs, buttons and
					anchors.
	@important! if you wish to rebind, use the rebind function.
							do not call this function multiple times as it does
							quite a lot to the stage
	@dev: the 'unbinds' are overkill, but function as a safety to
				prevent double-binding created by calling this function
				twice (somewhere in this code...).
	*/
	function bindButtons(event){
		links.each(function(){
			var href = $(this).attr('data-href'),
					pid  = $(this).attr('data-presentation');
			if(pid){
				$(this).unbind().on(touchClick, function(){
					gotoPresentation(href, pid);
				});
			}else{
				$(this).unbind().on(touchClick, function(){
					gotoSlide(href);
				});
			}
		});

		tabbed.each(function(){
			$(this).on(touchClick, function(){
				var slug 			= $(this).attr('data-tabbed-id'),
						content 	= $('[data-tabbed="'+slug+'"]'),
						siblings 	= $(content).siblings(),
						speed 		= 300;

				//reset interior content of a tab
				function resetTab(){	
					var list = $(content).find('ul[data-step-animated]');
					$(document).foundation('equalizer', 'reflow');
					$(siblings).removeClass('active');
					$(content).addClass('active');
					
			  	if (list) {
						$(list).children().each(stepAnimate);
					}
				}

				if(!$(this).hasClass('th')) {
					//Tabbed navigation
					var nav 			= $(this).parent();

					$(nav).stop().animate({'height':0}, speed, function(){
						setTimeout(function(){
							$(nav).removeAttr('style');
						}, speed);
						
						var this_nav = $(content).find('.tabbed-nav');
						this_nav.addClass('collapse');
						
						$(this_nav).stop().animate({'height': 35}, speed, function(){
							$(this).removeClass('collapse').removeAttr('style');
						});

						resetTab();
					});
				}else{
					//Thumbnail
					resetTab();
				}
			});
		});
	}

	//Parse the detailInfo JSON and setup the slidemap
	function setSlidemap(event){
		iva.config("../shared/json/detailInfo.json");

		mainPresentation = properties.detailInfo['presentation'];

		slideMap = new Map();
		slides = properties.detailInfo['slides'];
		for (i = 0; i < slides.length; i++) {
			var slide = slides[i],
				key = slide["arch"],
				value = {
					title : slide["title"],
					keymessage : slide["keymessage"],
					filetype : slide.hasOwnProperty("filetype") ? slide["filetype"] : "html",
					presentation : mainPresentation
				};
			slideMap.set(key, value);
		}
		var hiddenpresentations = properties.detailInfo['hiddenpresentations'];
		if ( hiddenpresentations ){
			for (i = 0; i < hiddenpresentations.length; i++) {
				var hiddenpresentation = hiddenpresentations[i],
					presentation = hiddenpresentation['presentation'];
				for (j = 0; j < hiddenpresentation['slides'].length; j++) {
					var slide = hiddenpresentation['slides'][j],
						key = slide["arch"],
						value = {
							title : slide["title"],
							keymessage : slide["keymessage"],
							filetype : slide.hasOwnProperty("filetype") ? slide["filetype"] : "html",
							presentation : presentation
						};
					slideMap.set(key, value);
				}
			}
		}
	}

	/*=========================[ Utils ]============================*/
	//These little gems adds/remove a trace image to the body tag for matching comps. 
	//simply add at "data-trace" attr to your tag and the set the variable 
	//"use_trace" to true to trigger the image load and some CSS styles to 
	//make it easier to align thing
	//@todo add binding to orientation change so the portrait trace can swap
	$.fn.addComps = function(event){
		var path 		= $(this).attr('data-trace'),
				v_path 	= $(this).attr('data-trace-portrait'),
				o_path 	= $(this).attr('data-trace-overlay');

		if( path ) {
			if(window.innerHeight > window.innerWidth){
				v_path = trace_dir+v_path;
				$('body').css('background-image','url("'+v_path+'")');
			}else{
				path = trace_dir+path;
				$('body').css('background-image','url("'+path+'")');
			}
		}

		if( o_path ) {
			o_path = trace_dir+o_path;
			$('body').append('<img id="o_trace" src="'+o_path+'" alt="">');
		}
	}

	$.fn.addBrackets = function(event){
		//the simplest method adds a class
		$('body').addClass('bracketted');
		$('[data-brackets]').each(function(){
				$(this).html('['+$(this).html()+']');
		});
		$('[data-bracket-swap]').each(function(){
			var src = $(this)[0].src;
			$(this)[0].src = $(this).attr('data-bracket-swap');
			console.log(src, $(this));
			$(this).attr('data-bracket-swap', src);
		});
	}

	$.fn.removeComps = function(event){
		$('body').removeAttr('style');
		$('body').find('#o_trace').remove();
	}

	$.fn.removeBrackets = function(event){
		$('body').removeClass('bracketted');
		$('[data-brackets]').each(function(){
			$(this).html($(this).html().substr(1,$(this).html().length - 2));
		});
		$('[data-bracket-swap]').each(function(){
			var src = $(this)[0].src;
			$(this)[0].src = $(this).attr('data-bracket-swap');
			$(this).attr('data-bracket-swap', src);
		});
	}

	//Initiation
	function init(event){
		//Attach global elements
		header.load('../shared/html/header-nav.html');
		footer.load('../shared/html/footer-menu.html', rebindAnchors);

		isi_link.load('../shared/html/isi-link.html', function(){
			rebindAnchors();
		});

		$(article).load('../shared/html/summary.html', function(){
			rebindAnchors();
		});

		sidebar.load('../shared/html/sidebar.html', function(){
			if(curr == 'A05') $('#sidebar a[href="#home"]').addClass('disabled');
			$(this).find('[data-isi-content]').load('../shared/html/isi.html', function(){
		    var sidebar_scroll = new IScroll('#sidebar-isi_wrapper', { bounce: false, scrollbars: true, resizeScrollbars: false });
		    sidebar_scroll.refresh();
				rebindAnchors();
		  });
			$(document).foundation('reflow');
		});

		$('#modals').load('../shared/html/modals.html', function(){
			$(this).find('[data-isi-content]').load('../shared/html/isi.html', function(){
		    var modal_scroll = new IScroll('#modal-isi_wrapper', { bounce: false, scrollbars: true, resizeScrollbars: false });
		    $(document).on('opened.fndtn.reveal', '#modal-isi', function() {
				  modal_scroll.refresh();
				});		 
				rebindAnchors();   
			});
			$(document).foundation('reflow');
		});
		
		//Startup foundation
		$(document).foundation();

		//All our click stuff
		bindButtons(event);

		//Flipable imagery
		$('[data-flipable]').on(touchClick, flipIt);

		//Now we're ready, add all the slides info in and setup that object
		setSlidemap(event);

		if( use_animate ) var animateTimer = setTimeout(animateStage, 300);

		function animateStage(i){
			$('body').addClass('animate');
		}
	}

	$(document).ready(init);

	$( window ).on( "orientationchange", function( event ) {
		$(document).foundation('reflow');
	});

	if(is_dev && use_trace && document.location.hostname == 'localhost'){
		$(document).keypress(function(){
			if( event.which == '8224' && !$('body').hasClass('trace') ){
				$('body').addClass('trace').addComps(event);
			}else if(event.which == '8224'){
				$('body').removeClass('trace').removeComps(event);
			}else if( event.which == '8747' && !$('body').hasClass('bracketted') ){
				$(bracketees).addBrackets(event);
			}else if(event.which == '8747'){
				$(bracketees).removeBrackets(event);
			}
		});
	}else{
		$('body').removeClass('trace');
	}
	
	$('.content.active > ul[data-step-animated],.tabbed-content.active > ul[data-step-animated]').children().each(stepAnimate);

})( jQuery );

/*==============[ Animation ]===============*/
function stepAnimate(index){
	var wait = index * 150;
	$(this).delay(wait).animate({'opacity':1}, 300, function(){
		$(this).removeClass('transparent').removeAttr('style');
	});
}

/*=========[ Button Interactions ]=========*/
//A wrapper for nav that... well... looks extaneous and should be merged?
function gotoSlide(href){
	if(is_dev) console.log('gotoSlide('+href+')');
	if(href){
		navigateToSlide(href);
	}else if(is_dev == true){
		alert("Uh oh! We can't gotoSlide with no href!");
	}
}

function gotoPresentation(href, pid){
	if(is_dev) console.log('gotoPresentation('+href+', '+pid+')');
	if(pid && href){
		navigateToSlide(href);
	}else if(is_dev){
		alert("Uh oh! We can't gotoPresentation with no href or pid!");
	}
}

var navigateToSlide = function(arch) {
	if (slideMap.has(arch)) {
		var slide = slideMap.get(arch);
		iva.navigateToSlide({ "presentation" : slide.presentation, "keymessage" : iva.isIOS() ? slide.keymessage + ".zip" : "../" + slide.keymessage + "/" + slide.keymessage + "." + slide.filetype});
	}
}

//Used after calling the .load method for .html files to ensure links are bound
function rebindAnchors(event){
	$('footer a[href*="#"], [data-isi-link] a, #header-nav a, #sidebar a, .scroller a').each(function(){
		var href = $(this).attr('data-href'),
				pid  = $(this).attr('data-presentation');
		if( href ){
			if( href == curr ) $(this).parent().addClass('active');
			if( ! pid ){
				if(is_dev) console.log($(this).text(), 'gotoSlide');
				$(this).unbind().on(touchClick, function(){ 
	    		gotoSlide(href);
				});
			}else{
				if(is_dev) console.log($(this).text(), 'gotoPresentation');
				$(this).unbind().on(touchClick, function(){
					gotoPresentation(href, pid);
				});
			}
		}
	});
}

//Flipable images
function flipIt(event){
	var ogWidth 	= $(this).width(),
		 	ogHeight 	= $(this).height();

	$(this).height(ogHeight).animate({'width':0, 'padding-left':ogWidth/2}, 300, function(){
		var img;
		
		if($(this).attr('data-bracket-swap-flipable') && $('body').hasClass('bracketted')){
		  img = $(this).attr('data-bracket-swap-flipable');
		  $(this).attr('data-bracket-swap-flipable',$(this).attr('src'));
		}else{
		  img = $(this).attr('data-flipable');
		  $(this).attr('data-flipable',$(this).attr('src'));
		}

		$(this).attr('src', img);
		$(this).animate({'width':ogWidth, 'padding-left':0}, 300, function(){
			$(this).removeAttr('style');
		});
	});
}

// Tap-to-enlarge Chart Keys
$.fn.setChartKey = function(set_to){
  $(this).css('background-image','url('+$(this).attr('data-chart-key')+')');
}

// Set focus basic: only the whole chart scales/fades up
function setFocused(event){
	var parent 		= $(this).parent(),
			siblings 	= $(parent).siblings();

	if( !$(parent).hasClass('unfocused') && $(siblings).hasClass('unfocused') ){
		$(siblings).removeClass('unfocused');
	}else{
		$(parent).removeClass('unfocused');
		$(siblings).addClass('unfocused');
	}
}

// Set focus complex: multiple anchors can be active. Anchors can be grouped
function setFocusedMultiple(event){
	var parent 		= $(this).parent(),
			siblings 	= $(parent).siblings(),
			anchors 	= $(parent).parent().find('a').not($(this)),
		  cols 			= $(this).siblings('a'),
			group  		= $(this).attr('data-group'),
			alike 		= $(parent).parent().find('a[data-group="'+group+'"]');

	if( !$(this).hasClass('unfocused') ){
		if( $(anchors).hasClass('unfocused') ){
			if( group && !$(alike).hasClass('unfocused') ){
				//return this
				if(is_dev)console.info('return this');
				$(this).addClass('unfocused');
			}else{
				//return all
				if(is_dev)console.info('return all');
				$(anchors).removeClass('unfocused');
				$(parent).removeClass('unfocused');
			}
		}else{
			//focus only on this anchor
			if(is_dev)console.info('focus only on ', $(this).attr('rel'));
			$(this).removeClass('unfocused');
			$(parent).removeClass('unfocused');
			$(anchors).addClass('unfocused');
		}
	}else{
		$(this).removeClass('unfocused');
		if( group && !$(alike).hasClass('unfocused') ){
			if(is_dev)console.info('show group in multiple tables: '+group);
			$(anchors).addClass('unfocused');
			$(alike).removeClass('unfocused');
		}else{
			if(is_dev)console.info('unfocus within the same table');
			$(anchors).addClass('unfocused');
			$(cols).addClass('unfocused');
		}
	}
}