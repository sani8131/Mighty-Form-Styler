/*
 * jQuery Mighty Form Styler plugin
 * Replaces your form select element for a html dropdown list which you can easily style with css.
 * Examples and documentation at: http://www.binkje.nl/mfs
 * 
 * Copyright (c) 2012 Bas van den Wijngaard
 * Version: 0.1.2
 * Licensed under the MIT License:
 * http://www.binkje.nl/mfs/license
 *
 * Requires jQuery 1.7 or later
 * 
 * Usage: $('#myForm').mfs(options);   - Enables the magic for your form
 *        $('#myForm').mfs('refresh'); - Refreshes the styled selects (e.g. when you updated the select via ajax)
 *        $('#myForm').mfs('destroy'); - Removes the magic from your form
 *
 */
(function( $ ){
	var mfsSelectOpen = false;
	
	var createSelect = function (thisSelect)
	{
		thisSelect.after('<div class="mfs-container"></div>');
		var mfsContainer = thisSelect.next('div.mfs-container');
		thisSelect.appendTo(mfsContainer);
		
		var mfsLabel = '';
		var mfsHtml = '';
		var mfsOptionsHtml = '';
		var indexCount = 0;
		thisSelect.find('option').each(function(){
			var thisLabel = $(this).html();
			if (mfsLabel == '' || $(this).attr('selected') == 'selected') {
				mfsLabel = thisLabel;
			}
			mfsOptionsHtml += '<li><a href="#" index="'+indexCount+'">'+thisLabel+'</a></li>';
			indexCount++;
		});
		
		mfsHtml += '<a class="mfs-selected-option" href="#">'+mfsLabel+'</a>';
		mfsHtml += '<ul class="mfs-options">'+mfsOptionsHtml+'</ul>';
		
		mfsContainer.prepend(mfsHtml);
		enableMagic(mfsContainer);
	}
	
	// Destroy the magic for the select in this container
	var destroySelect = function (theContainer)
	{
		var selectElm = theContainer.find('select');
		theContainer.before(selectElm);
		theContainer.remove();
	}
	
	// Refresh the magic for the select in this container
	var refreshSelect = function (theContainer)
	{
		var selectElm = theContainer.find('select');
		theContainer.before(selectElm);
		theContainer.remove();
		createSelect(selectElm);
	}
	
	// Enable the javascript magic for the mfs container
	var enableMagic = function (theContainer) 
	{
		var selectElm = theContainer.find('select');
		var selectElmOptions = selectElm.find('option');
		var selectedOption = theContainer.find('a.mfs-selected-option');
		var optionList = theContainer.find('ul.mfs-options');
		var optionListLi = optionList.find('li');
		var optionListOptions = optionList.find('a');
		
		optionList.hide();
		selectedOption.click(function(){
			var optionListAll = $('ul.mfs-options');
			if (optionList.is(':visible')) {
				optionList.hide();
				mfsSelectOpen = true;
			}
			else {
				optionListLi.removeClass('active');
				optionListAll.hide();
				optionList.show();
				var optionListSelected = optionList.find('li.selected');
				if (optionListSelected.length > 0) {
					optionListSelected.addClass('active');
				}
				else {
					optionList.find('li:first-child').addClass('active');
				}
				mfsSelectOpen = optionList;
			}
			$(this).blur();
			return false;
		});
		
		optionListOptions.click(function(){
			optionListLi.removeClass('active').removeClass('selected');
			$(this).closest('li').addClass('selected');
			selectedOption.text($(this).text());
			selectElmOptions.removeAttr('selected');
			selectElmOptions.eq($(this).attr('index')).attr('selected', 'selected');
			optionList.hide();
			
			// Make a refresh function that just updates the select magic (destroy and re-enable)
			if (selectElm.selectedIndex != $(this).attr('index') && selectElm.onchange) { 
				selectElm.selectedIndex = $(this).attr('index');
				selectElm.onchange(); 
			}
			if (selectElm.selectedIndex != $(this).attr('index')) {
				selectElm.selectedIndex = $(this).attr('index');
				selectElm.trigger('change');
			}
		
			return false;
		});
		
		optionListLi.mouseover(function(){
			optionListLi.removeClass('active');
			$(this).addClass('active');
		});
	};
	
	var enableRefreshSelect = function (theContainer)
	{
		var selectElm = theContainer.find('select');
		var selectElmOptions = selectElm.find('option');
		var selectedOption = theContainer.find('a.mfs-selected-option');
		var optionList = theContainer.find('ul.mfs-options');
		var optionListLi = optionList.find('li');
		var optionListOptions = optionList.find('a');
		
		selectElm.on('change.mfsEnableRefresh',function(){
			theContainer.before(selectElm);
			theContainer.remove();
			createSelect(selectElm);
		});
	}
	
	var methods = {
		init : function( options ) 
		{
			// Unleash the magic! But actually, you shouldn't. Styling is a CSS thing.
			var settings = $.extend( {
				'refresh'         : true,
				'radio' 					: false,
				'checkbox'				: false
			}, options);
			
			this.each(function() {
				// Find all selects
				var thisForm = $(this);
				var selects = thisForm.find('select');
				if (selects.length > 0) {
					selects.each(function(){
						var thisSelect = $(this);
						createSelect(thisSelect);			
					});
				}
				// Maby later extend the plugin to style radio and checkbox inputs
			});
			
			// Make the select hide when clicking outside it
			$(window).click(function(){
				$('ul.mfs-options').hide();
			});
			
			// Make the new select behave more like a real one
			$(document).keydown(function(event) {
				var keyDown = event.keyCode
				if (mfsSelectOpen !== false && (keyDown == 13 || keyDown == 38 || keyDown == 40 || keyDown == 27)) {
					var activeOption = mfsSelectOpen.find('li.active');
					if (keyDown == 38) { // up
						event.preventDefault();
						var newActiveOption = activeOption.prev();
						if (newActiveOption.length > 0) {
							newActiveOption.addClass('active');
							activeOption.removeClass('active');
						}
					}
					else if (keyDown == 40) { // down
						event.preventDefault();
						var newActiveOption = activeOption.next();
						if (newActiveOption.length > 0) {
							newActiveOption.addClass('active');
							activeOption.removeClass('active');
						}
					}
					else if (keyDown == 13) {
						activeOption.find('a').click();
					}
					else if (keyDown == 27) {
						$('ul.mfs-options').hide();
					}
				}
			});
		},
		refresh : function() 
		{
			mfsSelectOpen = false;
			this.each(function(){
				var containers = $(this).find('div.mfs-container');
				if (containers.length > 0) {
					containers.each(function(){
						var thisContainers = $(this);
						refreshSelect(thisContainers);			
					});
				}
			});
		},
		destroy : function() 
		{
			// Kill all the magic! Styling is a CSS thingie, and not for javascript!
			mfsSelectOpen = false;
			this.each(function(){
				var containers = $(this).find('div.mfs-container');
				if (containers.length > 0) {
					containers.each(function(){
						var thisContainers = $(this);
						destroySelect(thisContainers);			
					});
				}
			});
		}
	};
	
	$.fn.mfs = function(method)
	{
		// Method calling logic
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.mfs' );
		}
	}
})( jQuery );