define(["text!./languages.json","text!./organizations.json"],
		function(LanguagesData,OrganizationsData) {

	function Account(kettleCornField) {
		var _this = this,
        _email, _language_id, _organization_id,
        _isDirty = false,
        _languages = JSON.parse(LanguagesData).languages,
        _organizations = JSON.parse(OrganizationsData).organizations;
		
		function invalidate() {
			// Account is dirty, needs save
			_isDirty = true;
		}
		
		Object.defineProperties( _this, {
	      "email": {
	        get: function() {
	          return _email;
	        },
	        set: function(value) {
	        	var org;
	        	if (value != _email) {
	        		_email = value;
	        		org = _this.getOrganizationForEmail(_email);
	        		if (org != null) {
	        			_organization_id = org.id;
	        		} else {
	        			_organization_id = null;
	        		}
	        	}
	        },
	        enumerable: true
	      },
	      "language_id": {
	    	  get: function() {
	    		  return _language_id;
	    	  },
	    	  set: function(value) {
	    		  if (value != _language_id) {
	    			  var i, num=_languages.length;
	    			  for (i=0; i<num; i++) {
	    				  var language = _languages[i];
		    				if (language.id === value) {
		    					_language_id = value;
		    					invalidate();
		    					return;
		    				}
	    			  }
	    		  }
	    	  },
	    	  enumerable: true
	      },
	      "organization_id": {
	    	  get: function() {
	    		  return _organization_id;
	    	  },
	    	  enumerable: true
	      }
		});
		
	    // Save account data.  Saving only happens if account data needs
	    // to be saved (i.e., it has been changed since last save, or was never
	    // saved before).
	    _this.save = function( callback ) {
	      if ( !callback ) {
	        callback = function() {};
	      }

	      // Don't save if there is nothing new to save.
	      if (!_isDirty ) {
	        callback({ error: "okay" });
	        return;
	      }

	      var accountData = {
	    	email: _email,
	    	language_id: _language_id,
	    	organization_id: _organization_id
	      };

	      // Save to db, then publish
	      kettleCornField.saveAccount( accountData, function( e ) {
	        if ( e.error === "okay" ) {
	          _isDirty = false;

	          callback( e );
	        } else {
	          callback( e );
	        }
	      });
	    };
		_this.getOrganizationForEmail = function(email) {
			var split = email.split('@');
			var domain;
			var i;
			var num = _organizations.length;
			if (split.length == 2) {
				domain = split[1];
				for (i=0; i<num; i++) {
					var org = _organizations[i];
					if (org.domain == domain) {
						return org;
					}
				}
			}
		};
		_this.getLanguages = function() {
			return _languages;
		}
		_this.getProfile = function(callback) {
			kettleCornField.getProfile(function() {
				_this.email = kettleCornField.email();
				_this.language_id = kettleCornField.language_id();
				if ( callback && typeof callback === "function" ) {
	              callback();
	            }
			});
		};

	}
	return Account;
});