/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at https://raw.github.com/mozilla/butter/master/LICENSE */

(function( Butter ) {
	Butter.Editor.register( "lowerThird", "load!{{baseDir}}templates/assets/editors/lowerThird/lowerThird-editor.html", function( rootElement, butter ) {
		var _this = this;
		var _rootElement = rootElement,
			_trackEvent,
			_butter,
			_popcornOptions,
			_falseClick = function() {
				return false;
			},
			_trueClick = function() {
				return true;
			};
		
		/**
		 * Member: setup
		 * Sets up the content of this editor
		 * @param {TrackEvent} trackEvent: The TrackEvent being edited
		 */
		function setup( trackEvent ) {
			_trackEvent = trackEvent;
			_popcornOptions = _trackEvent.popcornOptions;
			var basicContainer = _rootElement.querySelector( ".editor-options" );
			var advancedContainer = _rootElement.querySelector( ".advanced-options" );
			var pluginOptions = {};
			var pickers = {};
			
			/* when a user drops a lower third onto the track, we detect their organization and adjust the logo and linkUrl
			 * accordingly.  To make this change reflected in the editor we have this segment of code.  Also, if you save the project
			 * and you don't have this line of code, the logo/linkUrl don't make it through */
			if (_trackEvent.manifest.about.codeKey=="lowerThird") {
				_trackEvent.popcornOptions.linkUrl=_trackEvent.popcornTrackEvent.linkUrl;
				_trackEvent.popcornOptions.logo=_trackEvent.popcornTrackEvent.logo;
			}
			
			function callback( elementType, element, trackEvent, name ) {
				pluginOptions[ name ] = { element: element, trackEvent: trackEvent, elementType: elementType };
			}	//end function callback
			
			function attachHandlers() {
				var key,
					option;
				    
				function checkboxCallback( trackEvent, updateOptions, prop ) {
					trackEvent.update( updateOptions );
				}	//checkboxCallback
				
				for ( key in pluginOptions ) {
					if ( pluginOptions.hasOwnProperty( key ) ) {
						option = pluginOptions[ key ];
						if ( option.elementType === "select" ) {
							_this.attachSelectChangeHandler( option.element, option.trackEvent, key, _this.updateTrackEventSafe );
						}
						else if ( option.elementType === "input" ) {
							if ( option.element.type === "checkbox" ) {
								_this.attachCheckboxChangeHandler( option.element, option.trackEvent, key, checkboxCallback );
							} 
							else {
								_this.attachInputChangeHandler( option.element, option.trackEvent, key, _this.updateTrackEventSafe );
							}
						}
						else if ( option.elementType === "textarea" ) {
							_this.attachInputChangeHandler( option.element, option.trackEvent, key, _this.updateTrackEventSafe );
						}
					}
				}	//for ( key in pluginOptions ) {
				basicContainer.insertBefore( _this.createStartEndInputs( trackEvent, _this.updateTrackEventSafe ), basicContainer.firstChild );
			}	//end function attachHandlers()
			
			//now let's create the actual form fields inside of the basic and advanced tabs
			_this.createPropertiesFromManifest({
				trackEvent: trackEvent,
				callback: callback,
				basicContainer: basicContainer,
				advancedContainer: advancedContainer,
				ignoreManifestKeys: ["start","end"]
			});	//_this.createPropertiesFromManifest
		
			attachHandlers();
			_this.updatePropertiesFromManifest( trackEvent );
			_this.setTrackEventUpdateErrorCallback( _this.setErrorState );
		}	//end setup
		
		function anchorClickPrevention( anchorContainer ) {
			if ( anchorContainer ) {
				anchorContainer.onclick = _falseClick;
			}
		}	//anchorClickPrevention
		
		function onTrackEventUpdated( e ) {
			console.log("lowerThird-TrackEventUpdated");
			_trackEvent = e.target;
			
			var anchorContainer = _trackEvent.popcornTrackEvent._container.querySelector( "a" );
			anchorClickPrevention( anchorContainer );
			_this.updatePropertiesFromManifest( _trackEvent );
			_this.setErrorState( false );
		}	//onTrackEventUpdated
		
		// Extend this object to become a TrackEventEditor
		Butter.Editor.TrackEventEditor.extend( _this, butter, rootElement, {
			open: function( parentElement, trackEvent ) {
				var anchorContainer = trackEvent.popcornTrackEvent._container.querySelector( "a" );
				anchorClickPrevention( anchorContainer );
				_butter = butter;
				
				// Update properties when TrackEvent is updated
				trackEvent.listen( "trackeventupdated", onTrackEventUpdated );
				setup( trackEvent );
			},	//open
			close: function() {
				_trackEvent.unlisten( "trackeventupdated", onTrackEventUpdated );
			}	//close
		});	//Butter.Editor.TrackEventEditor.extend
	});	//Butter.Editor.register .... function( rootElement, butter ) {
}( window.Butter ));	//(function( Butter ) {