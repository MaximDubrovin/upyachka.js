var cssExpand = [ "Top", "Right", "Bottom", "Left" ];
var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source;
var rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i");

function getStyles (elem) {
  return elem.ownerDocument.defaultView.getComputedStyle(elem, null);
}

function camelCase ( string ) {
  return string.replace(  /-([\da-z])/gi, function( all, letter ) {
		return letter.toUpperCase();
	} );
}

function isNumeric ( obj ) {
  // parseFloat NaNs numeric-cast false positives (null|true|false|"")
  // ...but misinterprets leading-number strings, particularly hex literals ("0x...")
  // subtraction forces infinities to NaN
  return obj - parseFloat( obj ) >= 0;
}

function css ( elem, name, extra, styles ) {
  var val, num;

  // Otherwise, if a way to get the computed value exists, use that
  if ( val === undefined ) {
    val = curCSS( elem, name, styles );
  }

  // Return, converting to number if forced or a qualifier was provided and val looks numeric
  if ( extra === "" || extra ) {
    num = parseFloat( val );
    return extra === true || isNumeric( num ) ? num || 0 : val;
  }
  return val;
}

function curCSS (elem, name, computed) {
  var width, ret,
      style = elem.style;

  computed = computed || getStyles(elem);

  if (computed) {
    ret = computed[ name ];

    // Support: iOS < 6
    // A tribute to the "awesome hack by Dean Edwards"
    // iOS < 6 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
    // this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
    if (rnumnonpx.test(ret)) {

      // Remember the original values
      width = style.width;

      // Put in the new values to get a computed value out
      style.width = ret;
      ret = computed.width;

      // Revert the changed values
      style.width = width;
    }
  }

  return ret !== undefined ?
    // Support: IE
    // IE returns zIndex value as an integer.
      ret + "" :
      ret;
}

function augmentWidthOrHeight (elem, name, extra, isBorderBox, styles) {
  var i = extra === ( isBorderBox ? "border" : "content" ) ?
        // If we already have the right measurement, avoid augmentation
          4 :
        // Otherwise initialize for horizontal or vertical properties
              name === "width" ? 1 : 0,

      val = 0;

  for (; i < 4; i += 2) {
    // both box models exclude margin, so add it if we want it
    if (extra === "margin") {
      val += css(elem, extra + cssExpand[ i ], true, styles);
    }

    if (isBorderBox) {
      // border-box includes padding, so remove it if we want content
      if (extra === "content") {
        val -= css(elem, "padding" + cssExpand[ i ], true, styles);
      }

      // at this point, extra isn't border nor margin, so remove border
      if (extra !== "margin") {
        val -= css(elem, "border" + cssExpand[ i ] + "Width", true, styles);
      }
    } else {
      // at this point, extra isn't content, so add padding
      val += css(elem, "padding" + cssExpand[ i ], true, styles);

      // at this point, extra isn't content nor padding, so add border
      if (extra !== "padding") {
        val += css(elem, "border" + cssExpand[ i ] + "Width", true, styles);
      }
    }
  }

  return val;
}

module.exports = function (elem, name) {
    // Start with offset property, which is equivalent to the border-box value
    var val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
        styles = getStyles(elem);

    // Use the active box-sizing model to add/subtract irrelevant styles
    return val +
      augmentWidthOrHeight(
          elem,
          name,
          "content",
          true,
          styles
      );
};

