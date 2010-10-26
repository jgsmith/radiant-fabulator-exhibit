/*
 *  (c) Copyright Texas A&M University 2010.  All rights reserved.
 *
 * Portions of this code are copied from The SIMILE Project:
 *  (c) Copyright The SIMILE Project 2006. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * 3. The name of the author may not be used to endorse or promote products
 *    derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 * NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

// We can assume the Infusion is loaded

/*
 * An Exhibit consists of the presentation and an overlay or slide-out
 * with facets
 */

/* We look for <div class="fabulator-exhibit" /> sections */

/*
 * A view offers a filtered set of data from a data store
 * A data store manages the actual data from the server
 * An Exhibit interacts with the view to manage the data shown
 */

Fabulator.namespace('Exhibit');

(function($, Exhibit) {

  var initDataView = function(that) {
    that.dataView = Exhibit.DataView({ source: that.options.source });
    that.dataView.events.onModelChange.addListener(that.eventModelChange);
    that.registerFilter = function(filter) {
      that.dataView.registerFilter(filter);
    };
  };

  var initPresentationViews = function(that) {
    $(that.container).find('.views').each(function(idx, el) {
      $(el).addClass("ui-corner-all");
      that.presentation = Exhibit.Presentations(el, { viewPanel: that });
    });
  };

  var initFacetView = function(that, myid) {
    $(that.container).find('.facets').each(function(idx, el) {
      $(el).attr('id', myid+'-facets-' + idx);
      that.facets = Exhibit.Facets(el, { viewPanel: that, trigger: '#' + myid + '-open-facets' });
    });
  };

  Exhibit.ViewPanel = function(container, options) {
    var that = fluid.initView("Fabulator.Exhibit.ViewPanel", container, options),
        lenses = new Array(),
        header, counters,
        myid = $(container).attr('id');

    options = that.options;

    options.source = options.source || $(container).attr("source");

    that.eventModelChange = function(model) {

      that.setCount(model.size());

      if(that.presentation) {
        that.presentation.eventModelChange(model);
      }

    };

    lenses.push(Exhibit.DefaultLens());

    that.getLens = function(item) {
      for(i = 0, n = lenses.length; i < n; i++) {
        if(lenses[i].isForItem(item)) {
          return lenses[i];
        }
      }
    }


    header = "<span class='title'>" + $(container).attr("ex:exhibitLabel") + "</span>";

    counters = $(container).attr("ex:counters");

    if( counters != null) {
      counters = counters.split(':');
      header += "<span class='counter' id='" + myid + "-counter'>0 " + counters[1] + "</span>";
    }

    if( $(that.container).find('.facets').size() > 0 ) {
      header += "<span class='ui-icon ui-icon-gear' id='"+myid+"-open-facets'>facets</span>";
    }
    $("<div class='header ui-corner-all'>" + header + "</div>").prependTo($(container));
    //$("<div class='header ui-corner-all'><span class='title'>" + $(container).attr("ex:exhibitLabel") + "</span><span class='counter' id='" + myid + "-counter'>0 Items</span><span class='ui-icon ui-icon-gear' id='"+myid+"-open-facets'>facets</span></div>").prependTo($(container));

    that.setCount = function(count) {
      if( counters != null ) {
        $('#' + myid + '-counter').text(count + " " + (count == 1 ? counters[0] : counters[1]));
      }
    }

    initDataView(that);

    initPresentationViews(that);

    initFacetView(that, myid);

    that.dataView.dataSource.fetchData();


    return that;
  };
})(jQuery, Fabulator.Exhibit);

fluid.defaults("Fabulator.Exhibit.ViewPanel", {
  Presentations: {
    type: "Fabulator.Exhibit.Presentations",
  },
  Facets: {
    type: "Fabulator.Exhibit.Facets",
  },
  events: {
    onDataChange: null
  }
});

/* The following is what goes into the HTML through the xslt */
jQuery(document).ready(function($){
  $(".fabulator-exhibit").each(function(idx, el) {
    var options = {
    };

    Fabulator.Exhibit.ViewPanel('#' + $(el).attr('id'), options);
  });
});
