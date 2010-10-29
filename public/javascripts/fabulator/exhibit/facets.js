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

Fabulator.namespace('Exhibit');

(function($, Exhibit) {

  Exhibit.FacetUtilities = { };

  Exhibit.FacetUtilities.constructFacetFrame = function(
    container, view, options
  ) {
    var that = { }, myid = $(container).attr("id");

      $(container).addClass("exhibit-facet");
    
      $("<div class='header'>" +
        (options.onClearAllSelections ? (
        "<div class='filterControl' id='" + myid + "-clearSelectionsDiv' title='Clear Selection'>" +
          "<span id='" + myid + "-filterCountSpan'></span>" +
        "</div>" ) : ("") ) +
        "<span class='title'>" + options.facetLabel + "</span>" +
        "</div>" +
        "<div class='body-frame' id='" + myid + "-frame'>" +
          "<div class='body' id='" + myid + "-values'></div>" +
        "</div>").appendTo(container);

    /* if(options.resizable) {
      $('#' + myid + '-frame').resizable("enable");
    } */
    that.valuesContainer = $('#' + myid + '-values');

    that.setSelectionCount = function(count) {
      $('#' + myid + '-filterCountSpan').innerHTML = count;
      if( count > 0 ) {
        $('#' + myid + '-filterSelectionsDiv').show();
      } 
      else {
        $('#' + myid + '-filterSelectionsDiv').hide();
      }
    };

    if(options.onClearAllSelections) {
      $('#' + myid + '-clearSelectionsDiv').bind("click", onClearAllSelections);
    }

    return that;
  };

  Exhibit.FacetUtilities.constructFacetItem = function(
    label,
    count,
    color,
    selected,
    facetHasSelection,
    onSelect,
    onSelectOnly,
    view
  ) {
    var dom = $("<div></div>");

    $(dom).addClass("exhibit-facet-value");
    $(dom).addClass("ui-corner-all");

    if(typeof(label) == "string") {
      $(dom).attr("title", label);
      $(dom).text(label + " (" + count + ")");
    }
    else {
      $(label).appendTo($(dom));
    }

    if( facetHasSelection ) {
      if( selected ) {
        $(dom).addClass("exhibit-facet-selected");
        $("<span class='selection'>&#x2713;</span>").prependTo($(dom));
      }
      else {
        $(dom).addClass("exhibit-facet-not-selected");
      }
    }

    if(color != null) {
      $(dom).style.color = color;
    }

    if(facetHasSelection) {
      $(dom).bind("click", onSelect);
    }
    else {
      $(dom).bind("click", onSelectOnly);
    }

    return dom;
  };

  Exhibit.FacetUtilities.constructFlowingFacetItem = function(
  ) {
  };

  Exhibit.Facets = function(container, options) {
    var that = fluid.initView("Fabulator.Exhibit.Facets", container, options),
        facetClass, facetClassObj;
    options = that.options;

    that.facets = new Array();

    $(container).children().each(function(idx, el) {
      if($(el).attr('ex:role') == 'facet') {
        facetClass = $(el).attr('ex:facetClass');
        facetClassObj = Fabulator.Exhibit.Facets[facetClass];

        if(typeof(facetClassObj) != "undefined") {
          that.facets.push(facetClassObj(el, { viewPanel: options.viewPanel }));
        }
      }
    });

    $(options.trigger).attr('rel', '#' + $(container).attr('id'));
    $(container).addClass('facets-overlay');
    $(options.trigger).overlay();
    $(container).addClass('ui-corner-all');
    $("#" + $(container).attr("id") + " a.close").addClass("ui-icon");
    $("#" + $(container).attr("id") + " a.close").addClass("ui-icon-circle-close");

    return that;
  };

  Exhibit.Facets.Base = function(type, container, options) {
    var that = fluid.initView("Fabulator.Exhibit.Facets." + type, container, options);

    var parseSetting = function(s, type, spec) {
      var sType = typeof s, f, i, n, choices;

      if(type == "text") {
        return s;
      }
      else if( type == "float" ) {
        if( sType == "number" ) {
          return s;
        }
        else if( sType == "string" ) {
          f = parseFloat(s);
          if( !isNaN(f) ) {
            return f;
          }
        }
        throw new Error("Expected a floating point number but got " + s);
      }
      else if( type == "int" ) {
        if( sType == "number" ) {
          return Math.round(s);
        }
        else if( sType == "string" ) {
          n = parseInt(s);
          if( !isNaN(n) ) {
            return n;
          }
        }
        throw new Error("Expected an integer but got " + s);
      }
      else if(type == "boolean" ) {
        if( sType == "boolean" ) {
          return s;
        }
        else  if( sType == "string" ) {
          s = s.toLowerCase();
          if( s == "true" || s == "on" || s == "yes" ) {
            return true;
          }
          else if( s == "false" || s == "off" || s == "no" ) {
            return false;
          }
        }
        throw new Error("Expected either 'true' or 'false' but got " + s);
      }
      else if( type == "function" ) {
        if( sType == "function" ) {
          return s;
        }
        else if( sType == "string" ) {
          try {
            f = eval(s);
            if( typeof f == "function") {
              return f;
            }
          }
          catch(e) {
            // silent
          }
        }
        throw new Error("Expected a function or the name of a function but got " + s);
      }
      else if( type == "enum" ) {
        choices = spec.choices;
        for(i = 0, n = choices.length; i < n; i += 1 ) {
          if(choices[i] == s) {
            return s;
          }
        }
        throw new Error("Expected one of " + choices.join(", ") + " but got " + s);
      }
      else if( type == "expression" ) {
        return Exhibit.ExpressionParser().parse(s);
      }
      else {
        throw new Error("Unknown setting type " + type);
      }
    };

    that.collectSettingsFromDOM = function(specs) {
      var field, spec, name, settings, type, value, dimensions,
          separator, a, i, n;

      that.options.facet = that.options.facet || { };

      settings = that.options.facet;

      for(field in specs) {
        spec = specs[field];
        name = field;
        if( "name" in spec ) {
          name = spec.name;
        }
        if( !(name in settings) && "defaultValue" in spec) {
          settings[name] = spec.defaultValue;
        }

        value = $(container).attr("ex:" + field);
        if( value == null ) {
          continue;
        }

        if( typeof value == "string") {
          value = value.trim();
          if( value.length == 0 ) {
            continue;
          }
        }

        type = "text";
        if( "type" in spec ) {
          type = spec.type;
        }

        dimensions = 1;
        if( "dimensions" in spec ) {
          dimensions = spec.dimensions;
        }

        try {
          if( dimensions > 1 || dimensions == '*') {
            separator = ",";
            if( "separator" in spec ) {
              separator = spec.separator;
            }

            a = value.split(separator);
            if( dimensions != '*' && a.length != dimensions ) {
              throw new Error("Expected a tuple of " + dimensions + " dimensions separated with " + separator + " but got " + value);
            }
            else {
              for(i = 0, n = a.length; i < n; i += 1 ) {
                a[i] = parseSetting(a[i].trim(), type, spec);
              }

              settings[name] = a;
            }
          }
          else {
            settings[name] = parseSetting(value, type, spec);
          }
        }
        catch(e) {
          Exhibit.debug(e);
        }
      }

      that.options.facet = settings;
    };

    options = that.options;

    that.events = { };
    that.events.onFilterChange = fluid.event.getEventFirer();

    options.viewPanel.registerFilter(that);

    if( "settingSpec" in options ) {
      that.collectSettingsFromDOM(options.settingSpec);
    }
    
    return that;
  };

  Exhibit.Facets.TextSearch = function(container, options) {
    var that = Exhibit.Facets.Base("TextSearch", container, options),
        dom, input_id;
    options = that.options;

    if( !( that.options.facet.expressions instanceof Array ) ) {
      that.options.facet.expressions = [
        that.options.facet.expressions
      ];
    }

    that.eventFilterItem = function(dataSource, id) {
      /* check if the expressions yield something that matches the
         text in the input field */
      var values, i, n;

      if( that.text && that.options.facet.expression ) {
        values = [ ];
        $(that.options.facet.expression).each(function(idx, ex) {
          var items = ex.evaluateOneItem(id, dataSource);
          values = values.concat(items.values.items());
        });
        n = values.length;
        for(i = 0; i < n; i += 1) {
          if(values[i].toLowerCase().indexOf(that.text) >= 0) {
            return; // at least one value matches at least one expression
          }
        }
        return false;
      }
    };

    that.eventModelChange = function(dataView) {
      // we don't do anything
    };

    dom = Exhibit.FacetUtilities.constructFacetFrame(container, null, { facetLabel: that.options.facet.facetLabel });

    input_id = $(container).attr("id") + "-input";

    $("<input type='text' id='" + input_id + "'>").appendTo($(dom.valuesContainer));

    $("#" + input_id).keyup(function() {
      that.text = $("#" + input_id).val().toLowerCase().trim();
      that.events.onFilterChange.fire();
    });

    return that;
  };

  Exhibit.Facets.List = function(container, options) {
    var that = Exhibit.Facets.Base("List", container, options),
        valueSet = Exhibit.Set(),
        counts = { }, 
        entries = [ ], 
        dom, filter, populateEntriesFunction, constructFacetItemFunction;

    options = that.options;

    dom = Exhibit.FacetUtilities.constructFacetFrame(container, null, { facetLabel: that.options.facet.facetLabel, resizable: true });

    constructFacetItemFunction = Exhibit.FacetUtilities[
      options.facet.scroll ? "constructFacetItem" : "constructFlowingFacetItem"
    ];

    if( "selection" in options.facet ) {
      filter = Exhibit.Set(options.facet.selection);

      populateEntriesFunction = function(dataView) {
        var items = dataView.itemSet(),
            i, n, facetValueResult, path,
            valueType = "text";

        entries = [ ];

        path = options.facet.expression;
        facetValueResult = path.walkForward(items, "item", dataView.dataSource);
        valueType = facetValueResult.valueType;

        if( facetValueResult.size() > 0 ) {
          facetValueResult.forEachValue(function(facetValue) {
            var itemSubcollection;
            if( filter.contains(facetValue) ) {
              itemSubcollection = path.evaluateBackward(facetValue, valueType, Exhibit.Set(items), dataView.dataSource);
              entries.push({ value: facetValue, count: itemSubcollection.size, selectionLabel: facetValue });
            }
          });
        }

        return valueType;
      };
    }
    else {
      populateEntriesFunction = function(dataView) {
        var items = dataView.items(),
            i, n, facetValueResult, path,
            valueType = "text";

        entries = [ ];

        path = options.facet.expression;
        facetValueResult = path.walkForward(dataView.dataSource.items(), "item", dataView.dataSource);
        valueType = facetValueResult.valueType || "text";


        if( facetValueResult.size() > 0 ) {
          facetValueResult.forEachValue(function(facetValue) {
            var itemSubcollection = path.evaluateBackward(facetValue, valueType, items, dataView.dataSource),
                count = 0;

            $(items).each(function(idx, id) {
              count += (itemSubcollection.contains(id) ? 1 : 0);
            });
 
            entries.push({ value: facetValue, count: count, selectionLabel: facetValue, selected: valueSet.contains(facetValue) });
          });
        }

        return valueType;
      };
    }

    var computeFacet = function(dataView) {
      var selection, labeler, entry, count, valueType, sortValueFunction,
          orderMap, sortFunction, sortDirectionFunction;

      valueType = populateEntriesFunction(dataView);

      if( entries.length > 0 ) {
        sortValueFunction = function(a, b) { return (a.selectionLabel < b.selectionLabel ? -1 : (a.selectionLabel > b.selectionLabel ? 1 : 0)); };
        if(valueType == "number") {
          sortValueFunction = function(a, b) {
            a = parseFloat(a.value);
            b = parseFloat(b.value);
            return a < b ? -1 : a > b ? 1 : 0;
          };
        }

        sortFunction = sortValueFunction;
        if(options.facet.sortMode == "count") {
          sortFunction = function(a,b) {
            var c = b.count - a.count;
            return c != 0 ? c : sortValueFunction(a,b);
          };
        }

        sortDirectionFunction = sortFunction;
        if(options.facet.sortDirection == "reverse") {
          sortDirectionFunction = function(a,b) {
            return sortFunction(b,a);
          }
        }

        entries.sort(sortDirectionFunction);
      }
    };

    that.eventModelChange = function(dataView) {
      var facetHasSelection = valueSet.size() > 0 || options.facet.selectMissing,
          constructValue,
          j, n;

      computeFacet(dataView);

      constructValue = function(entry) {
        var onSelect = function(elmt, evt, target) {
              // we need to manage class settings
              if( valueSet.contains(entry.value) ) {
                valueSet.remove(entry.value);
              }
              else {
                valueSet.add(entry.value);
              }
              that.events.onFilterChange.fire();
              return false;
            },
            onSelectOnly = function(elmt, evt, target) {
              // we need to manage class settings
              if( valueSet.contains(entry.value) ) {
                valueSet = Exhibit.Set();
              }
              else {
                valueSet = Exhibit.Set();
                valueSet.add(entry.value);
              }
              that.events.onFilterChange.fire();
              return false;
            },
            elmt = constructFacetItemFunction(
              entry.selectionLabel,
              entry.count,
              null,
              entry.selected,
              facetHasSelection,
              onSelect,
              onSelectOnly,
              dataView
            );

        $(elmt).appendTo($(dom.valuesContainer));
      };

      $(dom.valuesContainer).hide();

      $(dom.valuesContainer).empty();

      for(j = 0, n = entries.length; j < n; j += 1) {
        constructValue(entries[j]);
      }
      $(dom.valuesContainer).show();
      dom.setSelectionCount(valueSet.size());
    };  

//    that.eventModelChange(that.viewPanel.dataView);

    that.eventFilterItem = function(dataSource, id) {
      var values = options.facet.expression.evaluateOneItem(id, dataSource),
          i, n;


      if(valueSet.size() == 0) { return; }

      values = values.values.items();

      for(i = 0, n = values.length; i < n; i += 1) {
        if(valueSet.contains(values[i])) {
          return;
        }
      }

      return false;
    };


  };
})(jQuery, Fabulator.Exhibit);

fluid.defaults("Fabulator.Exhibit.Facets", {
});

fluid.defaults("Fabulator.Exhibit.Facets.TextSearch", {
  settingSpec: {
      "facetLabel": { type: "text", defaultValue: "Search" },
      "expression": { type: "expression", defaultValue: [ Fabulator.Exhibit.ExpressionParser().parse(".label") ], dimensions: '*' },
      "queryParamName": { type: "text" },
      "requiresEnter": { type: "boolean", defaultValue: false }
  }
});

fluid.defaults("Fabulator.Exhibit.Facets.List", {
  settingSpec: {
      "facetLabel": { type: "text", defaultValue: "Search" },
      "expression": { type: "expression", defaultValue: Fabulator.Exhibit.ExpressionParser().parse(".label") },
      "sortMode": { type: "text", defaultValue: "value" },
      "sortDirection": { type: "text", defaultValue: "forward" },
      "showMissing": { type: "boolean", defaultValue: false },
      "scroll": { type: "boolean", defaultValue: true },
      "height": { type: "numeric" },
      "collapsed": { type: "boolean", defaultValue: false }
  }
});
