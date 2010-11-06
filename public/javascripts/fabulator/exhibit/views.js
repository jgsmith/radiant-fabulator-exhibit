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

(function($, Exhibit) {

  Exhibit.Presentations = function(container, options) {
    var that = fluid.initView("Fabulator.Exhibit.Presentations", container, options),
        items = new Array(),
        item_id_to_pos = { },
        presentationStyle,
        viewClass, viewClassObj, tab_html, 
        container_id = $(container).attr('id');

    var calculatePositions = function() {
      /* we have glue between panels */
      /* vertically, all glues need to equalize.  same horizontally */
      /* we want to minimize the tension in the system */
      /* it's a system of equations that we're solving :-/ */

      /* n scales d, so x := d / n
         T = a / x - b * x
       */
      var T = function(a, b, d, n) { return n*a/d - b*d/n; };

      /* the square of the best fit for a particular piece of glue */
      var sweetSpot = function(a, b, n) { return n * n * a / b; };

      /* the direction a spot should move for a glue */
      var velocity = function(a, b, d, n) {
        sweetSpot(a, b, n) - d*d;
      }

      var horizontal_distance = function(a, b) { return b.x - a.x; };
      var vertical_distance = function(a, b) { return b.y - a.y; };

      /* we want to figure out an ordering of items */
      /* things glued to the left frame are first horizontally 
         things glued to the top frame are first vertically */
      var horiz_graph = new Array();
      var vert_graph = new Array();

      horiz_graph[0] = new Array();
      vert_graph[0] = new Array();

      for(i = 0, n = items.length; i < n; i++) {
        var dir, item_vert, item_horiz;

        horiz_graph[i+1] = new Array();
        vert_graph[i+1] = new Array();
        
        dir = items[i].left;
        if( typeof(dir) != "undefined" ) {
          var j;
          if( dir.id == "frame" ) {
            j = 0;
          }
          else {
            j = item_id_to_pos[dir.id];
          }
          horiz_graph[j][i] = { a: dir.a, b: dir.b };
        }

        dir = items[i].right;
        if( typeof(dir) != "undefined" ) {
          var j;
          if( dir.id == "frame" ) {
            j = n;
          }
          else {
            j = item_id_to_pos[dir.id];
          }
          horiz_graph[i+1][j] = { a: dir.a, b: dir.b };
        }

        dir = items[i].top;
        if( typeof(dir) != "undefined" ) {
          var j;
          if( dir.id == "frame" ) {
            j = 0;
          }
          else {
            j = item_id_to_pos[dir.id];
          }
          vert_graph[j][i] = { a: dir.a, b: dir.b };
        }

        dir = items[i].bottom;
        if( typeof(dir) != "undefined" ) {
          var j;
          if( dir.id == "frame" ) {
            j = n;
          }
          else {
            j = item_id_to_pos[dir.id];
          }
          vert_graph[i+1][j] = { a: dir.a, b: dir.b };
        }

      }
    };

    options = that.options;

    that.views = new Array();

    if( $(container).attr('ex:arrangement') == 'flat' ) {
      presentationStyle = 'flat';
    }
    else {
      presentationStyle = 'tabbed';
    }

    that.eventModelChange = function(model) {
      $(that.views).each(function(idx, view) {
        view.eventModelChange(model);
      });
    };

    $(container).children().each(function(idx, el) {
      if($(el).attr('ex:role') == 'view') {
        viewClass = $(el).attr('ex:viewClass') || 'Tile';
        viewClassObj = Fabulator.Exhibit.Presentations[viewClass];

        if(typeof(viewClassObj) != "undefined") {
          items.push(el);
          item_id_to_pos[$(el).attr('id')] = items.length - 1;
          that.views.push(viewClassObj(el, { viewPanel: options.viewPanel }));
        }
      }
    });

/* if multiple presentations, use tabs */

    if(presentationStyle == 'tabbed' && items.length > 1) {
      tab_html = "<ul>";

      $(items).each(function(idx, t) {
        tab_html = tab_html + 
          "<li><a href='#" + $(t).attr('id') + "'>" + 
                   $(t).attr('ex:viewLabel') + "</a></li>"
      });
      tab_html = tab_html + "</ul>";
      $(tab_html).prependTo($(container));

      //$(container).tabs();
    }
    else if(presentationStyle == 'flat') {
    }
    else {
      $(container).addClass("ui-dialog-content ui-widget-content");
      /* $(container).attr("style", "min-height: 400px; width: *;"); */
    }

    return that;
  };

  Exhibit.Presentations.Container = function(container, options) {
    var that = fluid.initView("Fabulator.Exhibit.Presentations", container, options),
        items = new Array(),
        presentationStyle,
        viewClass, viewClassObj, tab_html;
  };

  Exhibit.Presentations.initView = function(type, container, options) {
    var that = fluid.initView("Fabulator.Exhibit.Presentations." + type, container, options),
        lenses = new Array();

    options = that.options;

    $(container).children().each(function(idx, el) {
      if($(el).attr('ex:role') == 'lens') {
        lenses.push(Exhibit.Lens(el, options));
      }
    });
        
    that.getLens = function(item) {
      for(i = 0, n = lenses.length; i < n; i++) {
        if(lenses[i].isForItem(item)) {
          return lenses[i];
        }
      }
      return that.options.viewPanel.getLens(item);
    } 

    if( "settingSpec" in options ) {
      that.options.settings = Exhibit.Util.collectSettingsFromDOM(container, options.settingSpec);
    }

    if( "accessorSpec" in options ) {
      that.options.accessors = that.options.accessors || {};
      Exhibit.Util.createAccessorsFromDOM(container, options.accessorSpec, that.options.accessors);
    }

    return that;
  };

  Exhibit.Presentations.Tile = function(container, options) {
    var that = Exhibit.Presentations.initView("Tile", container, options),
        body_container,
        my_id = $(container).attr('id');

    options = that.options;



    $(container).empty();

/*
    $("<ul class='flt-pager-top' id='" + my_id + "-pages-top'>" +
      "<li class='flc-pager-previous'><a href='#'>&lt; previous</a></li>" +
      "<li class='flc-pager-next'><a href='#'>next &gt;</a></li>" +
      "</ul>").appendTo($(container));
*/
    $("<div id='" + my_id + "-body'></div>").appendTo($(container));
    body_container = $('#' + my_id + '-body');
/*
    $("<ul class='flt-pager-bottom' id='" + my_id + "-pages-bottom'>" +
      "<li class='flc-pager-previous'><a href='#'>&lt; previous</a></li>" +
      "<li class='flc-pager-next'><a href='#'>next &gt;</a></li>" +
      "</ul>").appendTo($(container));
*/

    that.eventModelChange = function(model) {
      var template, cutpoints, tree, lens, i, n, item;

      $(body_container).empty();
      $(model.items()).each(function(idx, id) {
        item = model.getItem(id);
        lens = that.getLens(item);

        $(lens.render(that, model, id)).appendTo($(body_container));
      });

      $("<div class='clear'></div>").appendTo($(body_container));
    };

/*
    var pagerModelChange = function(newModel, oldModel) {
console.log("pagerModelChange", newModel, oldModel);
    };

    fluid.pager(container, {
      listeners: {
        onModelChange: pagerModelChange
      },
      bodyRenderer: {
        type: "Fabulator.Exhibit.Presentations.Tile.selfRender",
        options: {
        }
      }
    });
*/

    return that;
  };

  Exhibit.Presentations.Tile.selfRender = function() {
    /* console.log(arguments); */
  };

  Exhibit.Presentations.Map = function(container, options) {
    var that = Exhibit.Presentations.initView("Map", container, options),

    options = that.options;

    that.eventModelChange = function(model) {
    };

    return that;
  };

  var parseSubcontentAttribute = function(value) {
    var fragments = [ ],
        current = 0,
        open, close, n;

    n = value.length;
    while( current < n && (open = value.indexOf("{{", current)) >= 0) {
      close = value.indexOf("}}", open);
      if(close < 0) { break; }

      fragments.push(value.substring(current, open));
      fragments.push(Exhibit.ExpressionParser().parse(value.substring(open+2, close)));

      current = close + 2;
    }
    if(current < n) {
      fragments.push(value.substr(current));
    }
    return fragments;
  };

  var processStyle = function(that, value) {
  };

  var processors = { };

  processors.TemplateNode = function(node) {
    if(node.nodeType == 1) {
      return processors.TemplateElement(node);
    }
    else {
      return node.nodeValue;
    }
  };

  processors.TemplateElement = function(elmt) {
    var that = {
      tag:    elmt.tagName.toLowerCase(),
      control: null,
      condition: null,
      content:  null,
      contentAttributes: null,
      subcontentAttributes: null,
      attributes: [],
      styles: [],
      handlers: [],
      children: null
    },
        expressionParser = Exhibit.ExpressionParser(),
        parseChildNodes = true,
        attributes = elmt.attributes,
        i, n, attribute, name, value, childNode;

    for(i = 0, n = attributes.length; i < n; i++) {
      attribute = attributes[i];
      name = attribute.nodeName;
      value = attribute.nodeValue;

      if(value == null || typeof(value) != "string" || value.length ==0 || name == "contentEditable") {
        continue;
      }

      if( name == "ex:onshow" ) {
        templateNode.attributes.push({
          name: name,
          value: value
        });
      }
      else if( name.length > 3 && name.substr(0,3) == "ex:" ) {
        name = name.substr(3);
        if( name == "formats" ) {
        }
        else if( name == "control" ) {
          that.control = value;
        }
        else if( name == "content" ) {
          that.content = expressionParser.parse(value);
          parseChildNodes = false;
        }
        else if( name == "separator" ) {
          that.separator = value;
        }
        else if( name == "last-separator" ) {
          that.last_separator = value;
        }
        else if( name == "pair-separator" ) {
          that.pair_separator = value;
        }
        else if( name == "if-exists" ) {
          that.condition = {
            test: "if-exists",
            expression: expressionParser.parse(value)
          };
        }
        else if( name == "if") {
          that.condition = {
            test: "if",
            expression: expressionParser.parse(value)
          };
        }
        else if( name == "select") {
          that.condition = {
            test: "select",
            expression: expressionParser.parse(value)
          };
        }
        else if( name == "case") {
          that.condition = {
            test: "case",
            expression: expressionParser.parse(value)
          };
        }
        else if( name.substr(name.length - 8, 8) == "-content" ) {
          if( that.contentAttributes == null ) {
            that.contentAttributes = [ ];
          }
          that.contentAttributes.push({
            name: name.substr(0, name.length-8),
            expression: Exhibit.ExpressionParser().parse(value),
            isStyle: false
          });
        }
        else if( name.substr(name.length - 11, 11) == "-subcontent" ) {
          if( that.subcontentAttributes == null ) {
            that.subcontentAttributes = [ ];
          }
          that.subcontentAttributes.push({
            name: name.substr(0, name.length-11),
            expression: parseSubcontentAttribute(value),
            isStyle: false
          });
        }
        else {
        }
      }
      else {
        if( name == "style") {
          processStyle(that, value);
        } else if( name != "id" ) {
          if( name == "cellspacing" ) {
            name = "cellSpacing";
          }
          else if( name == "cellpadding" ) {
            name = "cellPadding";
          }
          else if( name == "bgcolor" ) {
            name = "bgColor";
          }

          that.attributes.push({
            name: name,
            value: value
          });
        }
      }
    }

    // handle handlers

    childNode = elmt.firstChild;
    if( childNode != null && parseChildNodes ) {
      that.children = [ ];
      while( childNode != null ) {
        if( childNode.nodeType == 3 || childNode.nodeType == 1 ) {
          that.children.push(processors.TemplateNode(childNode));
        }
        childNode = childNode.nextSibling;
      }
    }

    return that;
  };

  Exhibit.DefaultLens = function(options) {
    var that = { },
        template = { };

    that.render = function(view, model, itemID) {
      var text, item = model.getItem(itemID);

      text = "<table><tr><td colspan='2'>" +
             item.label + "</td></tr>";

      $.each(item, function(idx, prop) {
        text += "<tr><td>" + idx + ":</td><td>" + prop + "</td></tr>";
      });

      text += "</table>";
      return text;
    };

    that.isForItem = function(item) { return true; };

    return that;
  };

  Exhibit.Lens = function(container, options) {
    var that = fluid.initView("Fabulator.Exhibit.Lens", container, options),
        types,
        template = new Array();
    options = that.options;

    types = $(container).attr("ex:itemTypes").split(/,\s*/);

    template = processors.TemplateNode(container);

    that.render = function(view, model, itemID) {
      var div = document.createElement("div"),
          old_div = template.elmt,
          result;
      template.elmt = div;
      result = model.renderTemplate(view, itemID, template);
      template.elmt = old_div;
      return result.elmt;
    };

    that.isForItem = function(item) { 
      var i, j, n, m;

      n = types.length;

      if(n == 0) {
        return true;
      }

      if(typeof(item.type) == "undefined") {
        return false;
      }

      if(typeof(item.type) == "string") {
        for(i = 0; i < n; i+=1) {
          if(item.type == types[i]) {
            return true;
          }
        }
      }
      else {
        m = item.type.length;
        for(i = 0; i < n; i += 1 ) {
          for(j = 0; j < m; j += 1 ) {
            if(item.type[j] == types[i]) {
              return true;
            }
          }
        }
      }

      return false;
    };

    return that;
  };
})(jQuery, Fabulator.Exhibit);

fluid.defaults("Fabulator.Exhibit.Presentations", {
});

fluid.defaults("Fabulator.Exhibit.Presentations.Map", {
  settingSpec: {
    "center":           { type: "float",    defaultValue: [20,0], dimensions: 2 },
    "zoom":             { type: "float",    defaultValue: 2 },
    "size":             { type: "text",     defaultValue: "small" },
    "scaleControl":     { type: "boolean",  defaultValue: true },
    "overviewControl":  { type: "boolean",  defaultValue: true },
    "type":             { type: "enum",     defaultValue: "normal", choices: [ "normal", "hybrid", "satellite" ] },
    "bubbleTip":        { type: "enum",     defaultValue: "top",    choices: [ "top", "bottom" ] },
    "mapHeight":        { type: "int",      defaultValue: 400       },
    "mapConstructor":   { type: "function", defaultValue: null      },
    "color":            { type: "text",     defaultValue: "#FF9000" },
    "colorCoder":       { type: "text",     defaultValue: null      },
    "sizeCoder":        { type: "text",     defaultValue: null      },
    "iconCoder":        { type: "text",     defaultValue: null      },
    "selectCoordinator":  { type: "text",   defaultValue: null      },
    "iconSize":         { type: "int",      defaultValue: 0         },
    "iconFit":          { type: "text",     defaultValue: "smaller" },
    "iconScale":        { type: "float",    defaultValue: 1         },
    "iconOffsetX":      { type: "float",    defaultValue: 0         },
    "iconOffsetY":      { type: "float",    defaultValue: 0         },
    "shape":            { type: "text",     defaultValue: "circle"  },
    "shapeWidth":       { type: "int",      defaultValue: 24        },
    "shapeHeight":      { type: "int",      defaultValue: 24        },
    "shapeAlpha":       { type: "float",    defaultValue: 0.7       },
    "pin":              { type: "boolean",  defaultValue: true      },
    "pinHeight":        { type: "int",      defaultValue: 6         },
    "pinWidth":         { type: "int",      defaultValue: 6         },
    "sizeLegendLabel":  { type: "text",     defaultValue: null      },
    "colorLegendLabel": { type: "text",     defaultValue: null      },
    "iconLegendLabel":  { type: "text",     defaultValue: null      },
    "markerScale":      { type: "text",     defaultValue: null      },
    "showHeader":       { type: "boolean",  defaultValue: true      },
    "showSummary":      { type: "boolean",  defaultValue: true      },
    "showFooter":       { type: "boolean",  defaultValue: true      }
  },
  accessorSpec: [
    { accessorName:   "getProxy",
      attributeName:  "proxy"
    },
    { accessorName: "getLatlng",
      alternatives: [
        { bindings: [
            { attributeName:  "latlng",
              types:          [ "float", "float" ],
              bindingNames:   [ "lat", "lng" ]
            },
            { attributeName:  "maxAutoZoom",
              type:           "float",
              bindingName:    "maxAutoZoom",
              optional:       true
            }
          ]
        },
        { bindings: [
            { attributeName:  "lat",
              type:           "float",
              bindingName:    "lat"
            },
            { attributeName:  "lng",
              type:           "float",
              bindingName:    "lng"
            },
            { attributeName:  "maxAutoZoom",
              type:           "float",
              bindingName:    "maxAutoZoom",
              optional:       true
            }
          ]
        }
      ]
    },
    { accessorName:   "getColorKey",
      attributeName:  "colorKey",
      type:           "text"
    },
    { accessorName:   "getSizeKey",
      attributeName:  "sizeKey",
      type:           "text"
    },
    { accessorName:   "getIconKey",
      attributeName:  "iconKey",
      type:           "text"
    },
    { accessorName:   "getIcon",
      attributeName:  "icon",
      type:           "url"
    }
  ]
});
