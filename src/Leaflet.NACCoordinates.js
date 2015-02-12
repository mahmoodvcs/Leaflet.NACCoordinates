/*
 * L.Control.NACCoordinates is used for displaying current mouse coordinates on the map.
 */

L.Control.NACCoordinates = L.Control.extend({
	options: {
		position: 'bottomright',
		//label templates for usage if no labelFormatter function is defined
		labelTemplate: "NAC: {0}",
		//label formatter function
		labelFormatter: undefined,
		//switch on/off input fields on click
		enableUserInput: false,
		//if true user given NAC coordinates are centered directly
		centerUserCoordinates:true
	},

	onAdd: function(map) {
		this._map = map;

		var className = 'leaflet-control-NACCoordinates',
			container = this._container = L.DomUtil.create('div', className),
			options = this.options;

		//label containers
		this._labelcontainer = L.DomUtil.create("div", "uiElement label", container);
		this._label = L.DomUtil.create("span", "labelFirst", this._labelcontainer);


		//input containers
		this._inputcontainer = L.DomUtil.create("div", "uiElement input uiHidden", container);
		var lSpan;
			lSpan = L.DomUtil.create("span", "", this._inputcontainer);
			this._input = this._createInput("inputNAC", this._inputcontainer);
		lSpan.innerHTML = options.labelTemplate.replace("{0}", "");

		L.DomEvent.on(this._input, 'keyup', this._handleKeypress, this);

		//connect to mouseevents
		map.on("mousemove", this._update, this);
		map.on('dragstart', this.collapse, this);

		map.whenReady(this._update, this);

		this._showsCoordinates = true;
		//wether or not to show inputs on click
		if (options.enableUserInput) {
			L.DomEvent.addListener(this._container, "click", this._switchUI, this);
		}

		return container;
	},

	/**
	 *	Creates an input HTML element in given container with given classname
	 */
	_createInput: function(classname, container) {
		var input = L.DomUtil.create("input", classname, container);
		input.type = "text";
		L.DomEvent.disableClickPropagation(input);
		return input;
	},

	_clearMarker: function() {
		this._map.removeLayer(this._marker);
	},

	/**
	 *	Called onkeyup of input fields
	 */
	_handleKeypress: function(e) {
		switch (e.keyCode) {
			case 27: //Esc
				this.collapse();
				break;
			case 13: //Enter
				this._handleSubmit();
				this.collapse();
				break;
			default: //All keys
				this._handleSubmit();
				break;
		}
	},
	_LatLngToNAC: function(point) {
	    var dlng = 1.0 * point.lng;
	    var dlat = 1.0 * point.lat;
	    var zlng = (dlng + 180) / 360;
	    var zlat = (dlat + 90) / 180;
	    var nac = this._tostr(zlng, 5) + ' ' + this._tostr(zlat, 5);
	    return nac;
	},
	map_ChSet: "0123456789BCDFGHJKLMNPQRSTVWXZ- ",
	_tostr: function(latorlon, naclev) {
	    //alert(latorlon);
	    var x = new Array(naclev);
	    var i = 0;
	    var tem = (latorlon * 30);
	    var j = 0;
	    for (i = 0; i < naclev; i++) {
	        x[i] = Math.floor(tem);
	        //alert(x[i]);
	        tem = (tem - x[i]) * 30;
	    }
	    var s = "";
	    for (i = 0; i < naclev; i++) {
	        s += this.map_ChSet.charAt(x[i]);
	        //alert(s);
	    }
	    return s;
	},


	/**
	 *	Called on each keyup except ESC
	 */
	_handleSubmit: function() {
		var NAC = this._input.value;
		if (NAC) {
			var marker = this._marker;
			if (!marker) {
				marker = this._marker = L.marker();
				marker.on("click", this._clearMarker, this);
			}
			var ll=new L.LatLng(y, x);
			marker.setLatLng(ll);
			marker.addTo(this._map);
			if (this.options.centerUserCoordinates){
				this._map.setView(ll,this._map.getZoom());
			}
		}
	},

	/**
	 *	Shows inputs fields
	 */
	expand: function() {
		this._showsCoordinates = false;

		this._map.off("mousemove", this._update, this);

		L.DomEvent.addListener(this._container, "mousemove", L.DomEvent.stop);
		L.DomEvent.removeListener(this._container, "click", this._switchUI, this);

		L.DomUtil.addClass(this._labelcontainer, "uiHidden");
		L.DomUtil.removeClass(this._inputcontainer, "uiHidden");
	},

	/**
	 *	Creates the label according to given options and formatters
	 */
	_createCoordinateLabel: function(nac) {
		var opts = this.options, l;
		if (opts.labelFormatter) {
			l = opts.labelFormatter(nac);
		} else {
			l = L.Util.template(opts.labelTemplate, {0: nac});
		}
		return l;
	},


	/**
	 *	Shows coordinate labels after user input has ended. Also
	 *	displays a marker with popup at the last input position.
	 */
	collapse: function() {
		if (!this._showsCoordinates) {
			this._map.on("mousemove", this._update, this);
			this._showsCoordinates = true;
			var opts = this.options;
			L.DomEvent.addListener(this._container, "click", this._switchUI, this);
			L.DomEvent.removeListener(this._container, "mousemove", L.DomEvent.stop);

			L.DomUtil.addClass(this._inputcontainer, "uiHidden");
			L.DomUtil.removeClass(this._labelcontainer, "uiHidden");

			if (this._marker) {
				var m = L.marker(),
					ll = this._marker.getLatLng();
				m.setLatLng(ll);

				var container = L.DomUtil.create("div", "");
				var label = L.DomUtil.create("div", "", container);
				label.innerHTML = this._createCoordinateLabel(ll);

				var close = L.DomUtil.create("a", "", container);
				close.innerHTML = "Remove";
				close.href = "#";
				var stop = L.DomEvent.stopPropagation;

				L.DomEvent
					.on(close, 'click', stop)
					.on(close, 'mousedown', stop)
					.on(close, 'dblclick', stop)
					.on(close, 'click', L.DomEvent.preventDefault)
					.on(close, 'click', function() {
					this._map.removeLayer(m);
				}, this);

				m.bindPopup(container);
				m.addTo(this._map);
				this._map.removeLayer(this._marker);
				this._marker = null;
			}
		}
	},

	/**
	 *	Click callback for UI
	 */
	_switchUI: function(evt) {
		L.DomEvent.stop(evt);
		L.DomEvent.stopPropagation(evt);
		L.DomEvent.preventDefault(evt);
		if (this._showsCoordinates) {
			//show textfields
			this.expand();
		} else {
			//show coordinates
			this.collapse();
		}
	},

	onRemove: function(map) {
		map.off("mousemove", this._update, this);
	},

	/**
	 *	Mousemove callback function updating labels and input elements
	 */
	_update: function(evt) {
		var pos = evt.latlng,
			opts = this.options;
		if (pos) {
			pos = pos.wrap();
			this._currentPos = pos;
			var nac = this._LatLngToNAC(pos);
			this._input.value = nac;
			this._label.innerHTML = this._createCoordinateLabel(nac);
		}
	}

});

//construcotr registration
L.control.NACCoordinates = function(options) {
	return new L.Control.NACCoordinates(options);
};

//map init hook
L.Map.mergeOptions({
	NACCoordinateControl: false
});

L.Map.addInitHook(function() {
	if (this.options.NACCoordinateControl) {
		this.NACCoordinateControl= new L.Control.NACCoordinates();
		this.addControl(this.NACCoordinateControl);
	}
});