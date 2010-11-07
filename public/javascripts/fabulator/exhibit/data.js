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

  var sources = { };

  var data_view_counter = 1;

  Exhibit.DataView = function(options) {
    var that = { },
        progress,
        set = Exhibit.Set();
    that.options = options;

    that.events = { };
    that.events.onModelChange = fluid.event.getEventFirer();

    that.events.onFilterItem  = fluid.event.getEventFirer(false, true);

    that.registerFilter = function(ob) {
      that.events.onFilterItem.addListener(function(s,i) { return ob.eventFilterItem(s,i); });
      that.events.onModelChange.addListener(function(m) { ob.eventModelChange(m) });
      ob.events.onFilterChange.addListener(that.eventFilterChange);
    };

    $("<div id='data-source-progress-" + data_view_counter + "'>" +
      "<div class='flc-progress progress-pop-up exhibit-progress-pop-up ui-corner-all'><h3>Filtering...</h3>" +
      "<div class='flc-progress-indicator progress-indicator'></div>" +
      "<p class='flc-progress-label progress-label'>0% Complete</p>" +
      "</div></div>").appendTo($("html > body"));

    progress = fluid.progress("#data-source-progress-" + data_view_counter);

    progress.hide();

    data_view_counter += 1;


    that.items = set.items;

    that.size = set.size;

    that.filterItems = function(endFn) {
      var id, fres, ids, percent, old_percent, n, chunk_size, f;

      set = Exhibit.Set();

      that.items = set.items;

      that.size = set.size;

      ids = that.dataSource.items();

      old_percent = 0;
      n = ids.length;

      if(n > 100) {
        progress.show();
      }

      chunk_size = parseInt(n / 100);

      if(chunk_size > 200) {
        chunk_size = 200;
      }

      f = function(start) {
        var i, end;
        end = start + chunk_size;
        if( end > n ) {
          end = n;
        }
        for(i = start; i < end; i += 1) {
          id = ids[i];
          fres = that.events.onFilterItem.fire(that.dataSource, id);
          if(fres !== false) {
            set.add(id);
          }
        }
        if(n > 100 ) {
          percent = parseInt(end * 100 / n);
          if( percent > old_percent ) {
            progress.update(percent, percent + "% Complete");
          }
        }
        if(end < n) {
          setTimeout(function() {
            f(end);
          }, 0);
        }    
        else {
          if(n > 100 ) {
            progress.update(100, "100% Complete");
            progress.hide();
          }
          if(endFn) { setTimeout(endFn, 0); }
        }
      };     
      f(0);
    };

    that.eventModelChange = function(model) {
      var id;

      that.filterItems(function() {
        that.events.onModelChange.fire(that);
      });
    };

    that.eventFilterChange = function() {
      var id;

      that.filterItems(function() {
        that.events.onModelChange.fire(that);
      });
    };

    that.getItem = function(id) {
      return that.dataSource.getItem(id);
    };

    var createInputElement = function(inputType) {
      var div = document.createElement("div");
      div.innerHTML = "<input type='" + inputType + "' />";
      return div.firstChild;
    };

    var itemList = function(view, parentElmt, templateNode, list) {
      var separator = ", ",
          last_separator = ", and ",
          pair_separator = " and ",
          values, value, lens, popupFn,
          valueType, lensElmt, lensRender,
          i, n;

      popupFn = function(container, trigger, lens, itemID) {
        var lensRender;
   
        trigger.bind("click", function() {
          var t, id;

          if( !lensRender ) {
            lensRender = lens.render(view, view.options.viewPanel.dataView, itemID);
            /* TODO: make id more universally unique */
            id = itemID;
            id = id.replace('.', '-');
            $(lensRender).attr('id', 'facet-item-lens-' + id);
            $(lensRender).addClass('facets-overlay');
            $("<a class='close ui-icon ui-icon-circle-close'></a>").prependTo($(lensRender));
            $(lensRender).addClass('ui-corner-all');
            $(lensRender).appendTo($(container));
            $(trigger).attr('rel', '#facet-item-lens-' + id);
            $(trigger).overlay({ load: true });
          }
        });  
      };

      if( "separator" in templateNode ) {
        separator = templateNode.separator;
      }
      if( "last_separator" in templateNode ) {
        last_separator = templateNode.last_separator;
      }
      if( "pair_separator" in templateNode ) {
        pair_separator = templateNode.pair_separator;
      }

      if(separator && separator.substr(0,1) != "<") {
        separator = "<span>" + separator + "</span>";
      }
      if(last_separator && last_separator.substr(0,1) != "<") {
        last_separator = "<span>" + last_separator + "</span>";
      }
      if(pair_separator && pair_separator.substr(0,1) != "<") {
        pair_separator = "<span>" + pair_separator + "</span>";
      }

      valueType = list.valueType || "text";
      values = list.values.items();

      $(parentElmt).empty();

        /* we want a popup that will show the lens for this item type */
      for( i = 0, n = values.length; i < n; i += 1 ) {
        if( valueType == 'item' ) { 
          value = that.getItem(values[i]);
          lens = view.getLens(value);
          if( lens == null ) {
            value = value.label[0];
            /* we should escape this value so it's just text */
            $(value).appendTo($(parentElmt));
          }
          else {
            /* construct a clickable link that will pop up the lens content */
            lensElmt = $("<div></div>");
            lensElmt.appendTo($(parentElmt));
            trigger = $("<span rel='#facet-item-lens-" + values[i] + "'>" + value.label[0] + "</span>")
            trigger.appendTo(lensElmt);
            popupFn(lensElmt, trigger, lens, values[i]);
          }
        }
        else {
          $("<span>" + values[i] + "</span>").appendTo($(parentElmt));
        }

        if( n > 1 ) {
          if( i == n-2 ) {
            if( n > 2 ) {
              $(last_separator).appendTo($(parentElmt));
            }
            else {
              $(pair_separator).appendTo($(parentElmt));
            }
          }
          else if( i < n-1 ){
            $(separator).appendTo($(parentElmt));
          }
        }
      }
    };

    var createDOMFromTemplate = function(view, rootID, templateNode, result, parentElmt) {
      var node, elmt, tag, attribute, value, v, n, i, items;

      if(templateNode == null) {
        return null;
      }
      else if( typeof templateNode != "object" ) {
        node = document.createTextNode(templateNode);
        if( parentElmt != null ) {
          parentElmt.appendChild(node);
        }
        return node;
      }
      else {
        elmt = null;

        if( templateNode.condition != null ) {
          if( templateNode.condition.test == "if-exists" ) {
            if( !templateNode.condition.expression.testExists(
                   { "value": rootID },
                   { "value": "item" },
                   "value",
                   that.dataSource
                )) {
              return;
            }
          }
        }

        if( "tag" in templateNode ) {
          tag = templateNode.tag;
          if( parentElmt != null ) {
            if( tag == "tr" ) {
              elmt = parentElmt.insertRow(parentElmt.rows.length);
            }
            else if( tag == "td" ) {
               elmt == parentElmt.insertCell(parentElmt.cells.length);
            }
          }
          if( elmt == null ) {
            elmt = tag == "input" ?
              createInputElement(templateNode.type) :
              document.createElement(tag);
            if( parentElmt != null ) {
              parentElmt.appendChild(elmt);
            }
          }
        }
        else {
          elmt = templateNode.elmt;
          if( parentElmt != null ) {
            parentElmt.appendChild(elmt);
          }
        }
 
        for(attribute in templateNode) {
          value = templateNode[attribute];
 
          if( attribute == "field" ) {
            result[value] = elmt;
          }
          else if( attribute == "class" ) {
            $(value.split(/\s+/)).each(function(idx, n) {
              $(elmt).addClass(n);
            });
          }
          else if( attribute == "id" ) {
            elmt.id = id;
          }
          else if( attribute == "title" ) {
            elmt.title = value;
          }
          else if( attribute == "type" && elm.tagName == "input") {
            // do nothing
          }
          else if( attribute == "styles" ) {
            for( n in value ) {
              v = value[n];
              elmt.style[n] = v;
            }
          }
          else if( attribute == "attributes" ) {
            $(value).each(function(idx, a) {
              if( a.name == "class" ) {
                $(a.value.split(/\s+/)).each(function(idx, v) {
                  $(elmt).addClass(v);
                });
              }
              else {
                $(elmt).attr(a.name, a.value);
              }
            });
          }
          else if( attribute == "content" ) {
            if( value != null ) {
              items = value.evaluateOnItem(rootID, that.dataSource);
              if( items.values.size() > 0 ) {
                // we have a list of items
                itemList(view, elmt, templateNode, items);
              }
            }
          }
          else if( attribute == "subcontentAttributes" ) {
            if( value != null ) {
              $(value).each(function(idx, info) {
                var setting = "";

                $(info.expression).each(function(idx, e) {
                  var r;
                  if(typeof(e) == "string") {
                    setting += e;
                  }
                  else {
                    r = e.evaluateOnItem(rootID, that.dataSource);
                    setting += (r.values.items()).join("");
                  }
                });
                $(elmt).attr(info.name, setting);
              });
            }
          }
          else if( attribute == "children" ) {
            if( value != null ) {
              for(i = 0, n = value.length; i < n; i++) {
                createDOMFromTemplate(view, rootID, value[i], result, elmt);
              }
            }
          }
          else if( attribute != "tag" && attribute != "elmt" && attribute != "condition" && typeof(value) == "string" ) {
            $(elmt).attr(attribute, value);
          }
        }
        return elmt;
      }
    };

    that.renderTemplate = function(view, rootID, template) {
      var result = {};
      result.elmt = createDOMFromTemplate(view, rootID, template, result, null);

      return result;
    };

    that.dataSource = Exhibit.DataSource({ source: options.source });
    that.dataSource.events.onModelChange.addListener(that.eventModelChange);

    return that;
  };

  Exhibit.Set = function(values) {
    var that = { }, 
        items = { },
        count = 0,
        recalc_items = true,
        items_list = new Array();

    that.isSet = true;

    that.items = function() {
      if(recalc_items) {
        items_list = new Array();
        for(i in items) {
          if(typeof(i) == "string" && items[i] == true) {
            items_list.push(i);
          }
        }
      }
      return items_list;
    }

    that.add = function(item) {
      if( !(item in items) ) {
        items[item] = true;
        recalc_items = true;
        count += 1;
      }
    };

    that.remove = function(item) {
      if( item in items ) {
        delete items[item];
        recalc_items = true;
        count -= 1;
      }
    };

    that.visit = function(fn) {
      var o;
      for(o in items) {
        if(fn(o) === true) {
          break;
        }
      }
    };

    that.contains = function(o) {
      return( o in items );
    };

    that.size = function() {
      if( recalc_items ) {
        return that.items().length;
      }
      else {
        return items_list.length;
      }
    };

    if(values instanceof Array) {
      $(values).each(function(idx, i) {
        that.add(i);
      });
    }

    return that;
  };

  Exhibit.Type = function(t) {
    var that = { };

    that.name = t;
    that.custom = { };

    return that;
  };

  Exhibit.Property = function(p) {
    var that = { };

    that.name = p;

    that.getValueType = function() {
      return that.valueType;
    };

    return that;
  }

  Exhibit.DataSource = function(options) {
    var that = { },
        set = Exhibit.Set(),
        labelProperty, typeProperty, uriProperty;
    that.options = options;

    if(typeof(sources[options.source]) != "undefined") {
      return sources[options.source];
    }

    sources[options.source] = that;

    that.source = options.source;
    that.events = { };
    that.events.onModelChange = fluid.event.getEventFirer();
    that.events.onBeforeLoadingTypes = fluid.event.getEventFirer();
    that.events.onBeforeLoadingProperties = fluid.event.getEventFirer();
    that.events.onBeforeLoadingItems = fluid.event.getEventFirer();
    that.events.onAfterLoadingTypes = fluid.event.getEventFirer();
    that.events.onAfterLoadingProperties = fluid.event.getEventFirer();
    that.events.onAfterLoadingItems = fluid.event.getEventFirer();

    that.types = { };
    that.properties = { };

    that.spo = { };
    that.ops = { };
    that.items = set.items;

    that.types["Item"] = Exhibit.Type("Item");

    labelProperty = Exhibit.Property("label");
    labelProperty.uri = "http://www.w3.org/2000/01/rdf-schema#label";
    labelProperty.valueType = "text";
    labelProperty.label = "Label";
    labelProperty.pluralLabel = "Labels";
    labelProperty.reverseLabel = "";
    labelProperty.reversePluralLabel = "";
    labelProperty.groupingLabel = "";
    labelProperty.reverseGroupingLabel = "";
    that.properties["label"] = labelProperty;

    typeProperty = Exhibit.Property("type");
    typeProperty.uri = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
    typeProperty.valueType = "text";
    typeProperty.label = "type";
    typeProperty.pluralLabel = "types";
    typeProperty.reverseLabel = "";
    typeProperty.reversePluralLabel = "";
    typeProperty.groupingLabel = "";
    typeProperty.reverseGroupingLabel = "";
    that.properties["type"] = typeProperty;

    uriProperty = Exhibit.Property("uri");
    uriProperty.uri = "http://dh.tamu.edu/ns/fabulator/exhibit/1.0#uri";
    uriProperty.valueType = "uri";
    uriProperty.label = "URI";
    uriProperty.pluralLabel = "URIs";
    uriProperty.reverseLabel = "URI of";
    uriProperty.reversePluralLabel = "URIs of";
    uriProperty.groupingLabel = "URIs";
    uriProperty.reverseGroupingLabel = "things named by these URIs";
    that.properties["uri"] = uriProperty;

    that.getItem = function(id) {
      if(id in that.spo) {
        return that.spo[id];
      }
      return { };
    };

    that.fetchData = function() {
/* TODO: make the URI building configurable */
      $.ajax({
        url: "/api/exhibits/" + options.source + ".json",
        dataType: 'json',
        success: function(data, textStatus) {
          that.loadData(data);
        }
      });
    };

    that.loadData = function(data, baseURI) {
      if(typeof baseURI == "undefined") {
        baseURI = location.href;
      }

      data.types = data.types || { };
      data.properties = data.properties || { };
      data.items = data.items || [ ];

      that.loadTypes(data.types, baseURI, function() {
        that.loadProperties(data.properties, baseURI, function() {
          that.loadItems(data.items, baseURI, function() {
            that.events.onModelChange.fire(that);
          });
        });
      });
    };

    var canonicalBaseURI = function(baseURI) {
      var lastChar = baseURI.substr(baseURI.length - 1);
      if( lastChar == "#" ) {
        baseURI = baseURI.substr(0, baseURI.length-1) + "/";
      }
      else if( lastChar != "/" && lastChar != ":" ) {
        baseURI += "/";
      }
      return baseURI;
    };

    that.loadTypes = function(types, baseURI, fn) {
      var typeID, typeEntry, type, p;

      that.events.onBeforeLoadingTypes.fire(that);
      try {
        baseURI = canonicalBaseURI(baseURI);
        for(typeID in types) {
          if( typeof(typeID) != "string") { continue; }
          typeEntry = types[typeID];
          if( typeof(typeEntry) != "object") { continue; }

          if( typeID in that.types ) {
            type = that.types[typeID];
          }
          else {
            type = Exhibit.Type(typeID);
            that.types[typeID] = type;
          }

          for(p in typeEntry) {
            type.custom[p] = typeEntry[p];
          }

          if(!("uri" in type.custom)) {
            type.custom.uri = baseURI + "type#" + encodeURIComponent(typeID);
          }
          if(!("label" in type.custom)) {
            type.custom.label = typeID;
          }
        }
        that.events.onAfterLoadingTypes.fire(that);
      }
      catch(e) {
        Exhibit.debug("loadTypes failed:", e);
      }

      setTimeout(fn, 0);
    };

    that.loadProperties = function(properties, baseURI, fn) {
      var propertyID, propertyEntry, property;

      that.events.onBeforeLoadingProperties.fire(that);
      try {
        baseURI = canonicalBaseURI(baseURI);

        for(propertyID in properties) {
          if( typeof(propertyID) != "string") { continue; }
          propertyEntry = properties[propertyID];
          if( typeof(propertyEntry) != "object" ) { continue; }

          if(propertyID in that.properties) {
            property = that.properties[propertyID];
          }
          else {
            property = Exhibit.Property(propertyID, that);
            that.properties[propertyID] = property;
          }

          property.uri = ("uri" in propertyEntry) ? propertyEntry.uri : (baseURI + "property#" + encodeURIComponent(propertyID));
          property.valueType = ("valueType" in propertyEntry) ? propertyEntry.valueType : "text";

          property.label = ("label" in propertyEntry) ? propertyEntry.label : propertyID;
          property.pluralLabel = ("pluralLabel" in propertyEntry) ? propertyEntry.pluralLabel : property.label;
          property.reverseLabel = ("reverseLabel" in propertyEntry) ? propertyEntry.reverseLabel : "!" + property.label;
          property.reversePluralLabel = ("reversePluralLabel" in propertyEntry) ? propertyEntry.reversePluralLabel : "!" + property.pluralLabel;
          property.groupingLabel = ("groupingLabel" in propertyEntry) ? propertyEntry.groupingLabel : property.label;
          property.reverseGroupingLabel = ("reverseGroupingLabel" in propertyEntry) ? propertyEntry.reverseGroupingLabel : "!" + property.reverseLabel;

          if( "origin" in propertyEntry) {
            property.origin = propertyEntry.origin;
          }
        }

        that.events.onAfterLoadingProperties.fire(that);
      }
      catch(e) {
        Exhibit.debug("loadProperties failed: ", e);
      }
      setTimeout(fn, 0);
    };

    that.loadItems = function(items, baseURI, fn) {
      var spo, ops, indexTriple, entry, n, progress, percent, old_percent, f;

      var indexPut = function(index, x, y, z) {
        var hash = index[x],
            array, i, n;

        if(!hash) {
          hash = { };
          index[x] = hash;
        }

        array = hash[y];

        if(!array) {
          array = new Array();
          hash[y] = array;
        }
        else {
          for(i = 0, n = array.length; i < n; i++) {
            if(z == array[i]) { return ; }
          }
        }
        array.push(z);
      };


      that.events.onBeforeLoadingItems.fire(that);
       $("<div id='progress-items-" + options.source + "'>" +
         "<div class='flc-progress progress-pop-up exhibit-progress-pop-up ui-corner-all'><h3>Loading " + items.length + " Item" + (items.length == 1 ? "" : "s") + "</h3>" +
          "<div class='flc-progress-bar progress-bar'>" +
            "<div class='flc-progress-indicator progress-indicator'></div>" +
          "</div>" +
          "<p class='flc-progress-label progress-label'>0% Complete</p>" +
         "</div></div>").appendTo($("html > body"));

      progress = fluid.progress("#progress-items-" + options.source);
      progress.show();
      old_percent = 0;

      try {
        baseURI = canonicalBaseURI(baseURI);

        indexTriple = function(s,p,o) {
          indexPut(that.spo, s, p, o);
          indexPut(that.ops, o, p, s);
        };

        n = items.length;
        chunk_size = parseInt( n / 100 );
        if(chunk_size > 200) {
          chunk_size = 200;
        }

        f = function(start) {
          var end, i;

          end = start + chunk_size;
          if( end > n ) { end = n; }

          try {
            for(i = start; i < end; i += 1 ) {
              entry = items[i];
              if( typeof(entry) == "object" ) {
                that.loadItem(entry, indexTriple, baseURI);
              }
            }
          }
          catch(e) {
            Exhibit.debug("loadItems failed: ", e);
          }

          percent = parseInt(i * 100 / n);
          if( percent > old_percent ) {
            old_percent = percent;
            progress.update(percent, percent + "% Complete");
          }
          if( end < n ) {
            setTimeout(function() {
              f(end);
            }, 0);
          }
          else {
            progress.update(100, "100% Complete");
            progress.hide();
            setTimeout(function() {
              that.events.onAfterLoadingItems.fire(that);
              setTimeout(fn, 0);
            }, 0);
          }
        }
        f(0);
      }
      catch(e) {
        Exhibit.debug("loadItems failed: ", e);
      }
    };

    that.loadItem = function(item, indexFn, baseURI) {
      var id, label, uri, type, isArray, p, i, n;

      if(!("label" in item) && !("id" in item)) {
        Exhibit.debug("Item entry has no label and no id: ", item);
        return;
      }

      if(!("label" in item)) {
        id = item.id;
        if( !that.items.contains(id) ) {
          Exhibit.debug("Cannot add new item containing no label: ", item);
        }
      }
      else {
        label = item.label;
        id = ("id" in item) ? item.id : label;
        uri = ("uri" in item) ? item.uri : (baseURI + "item#" + encodeURIComponent(id));
        type = ("type" in item) ? item.type : "Item";

        isArray = function(obj) {
          if(obj.constructor.toString().indexOf("Array") == -1)
            return false;
          else
            return true;
        };

        if(isArray(label)) label = label[0];
        if(isArray(id))    id    = id[0];
        if(isArray(uri))   uri   = uri[0];
        if(isArray(type))  type  = type[0];

        set.add(id);

        indexFn(id, "uri", uri);
        indexFn(id, "label", label);
        indexFn(id, "type", type);
        indexFn(id, "id", id);

        that.ensureTypeExists(type, baseURI);
      }

      for(p in item) {
        if( typeof(p) != "string" ) { continue; }

        if(p != "uri" && p != "label" && p != "id" && p != "type") {
          that.ensurePropertyExists(p, baseURI);

          v = item[p];
          if(v instanceof Array) {
            for(i = 0, n = v.length; i < n; i++) {
              indexFn(id, p, v[i]);
            }
          }
          else if( v != undefined && v != null ) {
            indexFn(id, p, v);
          }
        }
      }
    };

    that.ensureTypeExists = function(typeID, baseURI) {
      var type;

      if(!(typeID in that.types)) {
        type = Exhibit.Type(typeID);
        type.custom.uri = baseURI + "type#" + encodeURIComponent(typeID);
        type.custom.label = typeID;
        that.types[typeID] = type;
      }
    };

    that.ensurePropertyExists = function(propertyID, baseURI) {
      var property;

      if(!(propertyID in that.properties)) {
        property = Exhibit.Property(propertyID);
        property.uri = baseURI + "property#" + encodeURIComponent(propertyID);
        property.valueType = "text";

        property.label = propertyID;
        property.pluralLabel = property.label;

        property.reverseLabel = "reverse of " + property.label;
        property.reversePluralLabel = "reverse of " + property.pluralLabel;

        property.groupingLabel = property.label;
        property.reverseGroupingLabel = property.reverseLabel;

        that.properties[propertyID] = property;
      }
    };

    that.getProperty = function(property) {
      return property in that.properties ? that.properties[property] : null;
    };

    var indexFillSet = function(index, x, y, set, filter) {
      var hash = index[x],
          array, i, n, z;

      if(hash) {
        array = hash[y];
        if(array) {
          if(filter) {
            for(i = 0, n = array.length; i < n; i += 1) {
              z = array[i];
              if( filter.contains(z) ) {
                set.add(z);
              }
            }
          }
          else {
            for(i = 0, n = array.length; i < n; i += 1) {
              set.add(array[i]);
            }
          }
        }
      }
    };

    var getUnion = function(index, xSet, y, set, filter) {
      if(!set) {
        set = Exhibit.Set();
      }

      xSet.visit(function(x) {
        indexFillSet(index, x, y, set, filter);
      });
      return set;
    };

    that.getObjectsUnion = function(subjects, p, set, filter) {
      return getUnion(that.spo, subjects, p, set, filter);
    };

    that.getSubjectsUnion = function(objects, p, set, filter) {
      return getUnion(that.ops, objects, p, set, filter);
    };

/*
    var indexCount = function(index, x, y, filter) {
      var hash = index[x],
          count = 0, i, n, z;

      if(hash) {
        array = hash[y];
        if(array) {
          if(filter) {
            for(i = 0, n = array.length; i < n; i += 1) {
              z = array[i];
              if( filter.contains(z) ) {
                count += 1;
              }
            }
          }
          else {
            count += array.length;
          }
        }
      }

      return count;
    };

    var getCount = function(index, xSet, y, filter) {
      var count = 0;

      xSet.visit(function(x) {
        count += indexCount(index, x, y, filter);
      });
      return count;
    };

    that.countSubjects = function(objects, p, filter) {
      return getCount(that.ops, objects, p, filter);
    };

    that.countObjects = function(objects, p, filter) {
      return getCount(that.spo, objects, p, filter);
    };
*/

    return that;
  };
})(jQuery, Fabulator.Exhibit);
