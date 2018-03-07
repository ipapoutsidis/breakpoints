/*
 * jQuery Breakpoints
 * Author: Jerry Low
 * Url: https://www.github.com/jerrylow/breakpoints
 */

(function($) {
  var Breakpoints = function(el, options) {
    var _ = this;

    /**
     * Public
     **/
    _.settings,
    _.currentBp;

    _.getBreakpoint = function() {
      var windowWidth = $(window).width();
      var bps = _.settings.breakpoints;
      var bpName;

      bps.forEach(function(bp) {
        if (windowWidth >= bp.width) {
          bpName = bp.name;
        }
      });

      // Fallback to largest breakpoint.
      if (!bpName) {
        bpName = bps[bps.length - 1].name;
      }

      return bpName;
    };

    _.getBreakpointWidth = function(bpName) {
      var bps = _.settings.breakpoints;
      var bpWidth;

      bps.forEach(function(bp) {
        if (bpName == bp.name) {
          bpWidth = bp.width;
        }
      });

      return bpWidth;
    }

    _.compareCheck = function(check, checkBpName, callback) {
      var windowWidth = $(window).width();
      var bps = _.settings.breakpoints;
      var bpWidth = _.getBreakpointWidth(checkBpName);
      var isBp = false;

      switch (check) {
        case "lessThan":
          isBp = windowWidth < bpWidth;
          break;
        case "lessEqualTo":
          isBp = windowWidth <= bpWidth;
          break;
        case "greaterThan":
          isBp = windowWidth > bpWidth;
          break;
        case "greaterEqualTo":
          isBp = windowWidth > bpWidth;
          break;
        case "inside":
          bpIndex = bps.findIndex(function(bp) {
            return bp.name === checkBpName;
          });

          if (bpIndex === bps.lenth - 1) {
            isBp = windowWidth > bpWidth;
          } else {
            nextBpWidth = _.getBreakpointWidth(bps[bpIndex + 1].name);
            isBp = windowWidth >= bpWidth && windowWidth < nextBpWidth;
          }
          break;
      }

      if (isBp) {
        callback();
      }
    }

    _.destroy = function() {
      $(window).unbind("breakpoints");
    }

    /**
     * Private
     **/
    var _resizeCallback = function() {
      var newBp = _.getBreakpoint();

      if (newBp !== _.currentBp) {
        $(window).trigger({
          "type" : "breakpoint-change",
          "from" : _.currentBp,
          "to" : newBp
        });

        _.currentBp = newBp;
      }
    };

    /**
     * Initiate
     **/
    var settings = $.extend({}, $.fn.breakpoints.defaults, options);

    _.settings = {
      breakpoints: settings.breakpoints,
      buffer: settings.buffer
    };

    // Store info
    el.data("breakpoints", this);
    _.currentBp = _.getBreakpoint();

    // Resizing
    var resizeThresholdTimerId;

    if ($.isFunction($(window).on)) {
      $(window).on("resize.breakpoints", function(e) {
        resizeThresholdTimerId && clearTimeout(resizeThresholdTimerId);

        resizeThresholdTimerId = setTimeout(function(e) {
          _resizeCallback();
        }, _.settings.buffer);
      });
    }
  }

  $.fn.breakpoints = function(method, arg1, arg2) {
    if (this.data("breakpoints")) {
      var thisBp = this.data("breakpoints");
      var compareMethods = [
        "lessThan",
        "lessEqualTo",
        "greaterThan",
        "greaterEqualTo",
        "inside"
      ];

      if (method === "getBreakpoint") {
        return thisBp.getBreakpoint();
      } else if (method === "getBreakpointWidth") {
        return thisBp.getBreakpointWidth(arg1);
      } else if (compareMethods.includes(method)) {
        return thisBp.compareCheck(method, arg1, arg2);
      } else if (method === "destroy") {
        thisBp.destroy();
      }

      return;
    }

    new Breakpoints(this, method);
  };

  $.fn.breakpoints.defaults = {
    breakpoints: [
      {"name": "xs", "width": 0},
      {"name": "sm", "width": 768},
      {"name" : "md", "width": 992},
      {"name" : "lg", "width": 1200}
    ],
    buffer: 300
  };

})(jQuery);
