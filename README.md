# Leaflet.NACCoordinates
NAC Coordinate control for [LeafletJS](http://leafletjs.com)

A [Leaflet](https://github.com/Leaflet/Leaflet) plugin to view [NAC address](http://www.nacgeo.com/) of the mouse pointer on mouse move.

In next release, the user can enter a NAC address and get a marker on that position.

[Live Demo](http://mahmoodvcs.github.io/Leaflet.NACCoordinates/example/demo.html)

### Usage

```javascript
L.control.coordinates({
	position:"bottomleft", //optional default "bootomright"
	labelTemplate:"NAC Address: {0}", //optional default "NAC: {0}"
	enableUserInput:true, //optional default false (not implemented in this release)
}).addTo(map);
```

### License 
Distributed under [GNU General Public License v2](http://www.gnu.org/licenses/gpl-2.0.html)
