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

  Exhibit.Util = { };

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

  Exhibit.Util.collectSettingsFromDOM = function(container, specs) {
    var field, spec, name, settings, type, value, dimensions,
        separator, a, i, n;

    settings = { };

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
        value = $.trim(value);
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
              a[i] = parseSetting($.trim(a[i]), type, spec);
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

    return settings;
  };

  Exhibit.Util.TypeParsers = {
    text:  function(v, f) {
             return f(v);
           },
    float: function(v, f) {
             var n = parseFloat(v);
             if(!isNaN(n)) {
               return f(n);
             }
             return false;
           },

    int:   function(v, f) {
             var n = parseInt(v);
             if(!isNaN(n)) {
               return f(n);
             }
             return false;
           },

    date:  function(v, f) {
             var d;

             if( v instanceof Date ) {
               return f(v);
             }
             else if( typeof(v) == "number" ) {
               d = new Date(0);
               d.setUTCFullYear(v);
               return f(d);
             }
             else {
               d = Exhibit.DateTime.parseIso8601DateTime(v.toString());
               if( d != null ) {
                 return f(d);
               }
             }
             return false;
           },
    url:   function(v, f) {
             return f(Exhibit.Persistence.resolveURL(v.toString()));
           },
    boolean: function(v, f) {
             v = v.toString().toLowerCase();
             if( v == "true" ) {
               return f(true);
             }
             else if( v == "false" ) {
               return f(false);
             }
             return false;
           }
  };

  var typeToParser = function(type) {
    if( type in Exhibit.Util.TypeParsers ) {
      return Exhibit.Util.TypeParsers[type];
    }
    throw new Error("Unknown setting type " + type);
  };

  var createTupleAccessor = function(f, spec) {
    var value = f(spec.attributeName), 
        expression, parsers, i, n, bindingNames, separator;

    if( value == null ) {
      return null;
    }

    if( typeof(value) == "string" ) {
      value = $.trim(value);
      if( value.length == 0 ) {
        return null;
      }
    }

    try {
      expression = Exhibit.ExpressionParser().parse(value);
      parsers = [ ];
      bindingTypes = spec.types;

      for( i = 0, n = bindingTypes.length; i < n; i += 1 ) {
        parsers.push(typeToParser(bindingTypes[i]));
      }

      bindingNames = spec.bindingNames;
      separator = ",";

      if( "separator" in spec ) {
        separator = spec.separator;
      }

      return function(itemID, database, visitor, tuple) {
        expression.evaluateOnItem(itemID, database).values.visit(
          function(v) {
            var a = v.split(separator),
                tuple2 = { },
                i, n;

            if( a.length == parsers.length ) {
              if( tuple ) {
                for(n in tuple) {
                  tuple2[n] = tuple[n];
                }
              }

              for(i = 0, n = bindingNames.length; i < n; i += 1) {
                tuple2[bindingNames[i]] = null;
                parsers[i](a[i], function(v) { tuple2[bindingNames[i]] = v; });
              }
              visitor(tuple2);
            }
          }
        );
      };
    }
    catch(e) {
      Exhibit.debug(e);
      return null;
    }
  };

  var createElementalAccessor = function(f, spec) {
    var value = f(spec.attributeName),
        bindingType = "text",
        expression, parser;

    if( value == null ) {
      return null;
    }

    if( typeof(value) == "string" ) {
      value = $.trim(value);
      if( value.length == 0 ) {
        return null;
      }
    }

    if( "type" in spec ) {
      bindingType = spec.type;
    }

    try {
      expression = Exhibit.ExpressionParser().parse(value);
      parser = typeToParser(bindingType);

      return function(itemID, database, visitor) {
        expression.evaluateOnItem(itemID, database).values.visit(
          function(v) { return parser(v, visitor); }
        );
      };
    }
    catch(e) {
      Exhibit.debug(e);
      return null;
    }
  };

  var evaluateBindings = function(value, database, visitor, bindings) {
    var maxIndex = bindings.length - 1,
        f = function(tuple, index) {
              var binding = bindings[index],
                  visited = false,
                  recurse = index == maxIndex ? function() { visitor(tuple); } : function() { f(tuple, index + 1); },
                  bindingName;

      /*
       The tuple accessor will copy existing fields out of "tuple" into a new
       object and then injects new fields into it before calling the visitor.
       This is so that the same tuple object is not reused for different
       tuple values, which would cause old tuples to be overwritten by new ones.
      */
              if( binding.isTuple ) {
                binding.accessor(
                  value,
                  database,
                  function(tuple2) { visited = true; tuple = tuple2; recurse(); },
                  tuple
                );
              }
              else {
                bindingName = binding.bindingName;
                binding.accessor(
                  value,
                  database,
                  function(v) { visited = true; tuple[bindingName] = v; recurse(); }
                );
              }

              if( !visited ) { recurse(); }
            };

    f({}, 0);
  };

  var createBindingsAccessor = function(f, bineingSpecs) {
    var bindings = [ ],
        i, n, accessor, bindingSpec, accessor, isTuple;

    for( i = 0, n = bindingSpecs.length; i < n; i += 1 ) {
      bindingSpec = bindingSpecs[i];
      accessor = null;
      isTuple = false;

      if( "bindingNames" in bindingSpec ) {
        isTuple = true;
        accessor = createTupleAccessor(f, bindingSpec);
      }
      else {
        accessor = createElementalAccessor(f, bindingSpec);
      }

      if( accessor = null ) {
        if( !("optional" in bindingSpec) || !bindingSpec.optional ) {
          return null;
        }
      }
      else {
        bindings.push({
          bindingName: bindingSpec.bindingName,
          accessor:    accessor,
          isTuple:     isTuple
        });
      }
    }

    return function(value, database, visitor) {
      evaluateBindings(value, database, visitor, bindings);
    };
  };

  var createAccessors = function(f, specs, accessors) {
    var field, spec, accessorName, accessor, isTuple,
        createOneAccessor, alternatives, i, n;

    for(field in specs) {
      spec = specs[field];
      accessorName = spec.accessorName;
      accessor = null;
      isTuple = false;

      createOneAccessor = function(spec2) {
        isTuple = false;
        if( "bindings" in specs ) {
          return createBindingsAccessor(f, spec2.bindings);
        }
        else if( "bindingNames" in spec2 ) {
          isTuple = true;
          return createTupleAccessor(f, spec2);
        }
        else {
          return createElementalAccessor(f, spec2);
        }
      };

      if( "alternatives" in spec ) {
        alternatives = spec.alternatives;
        for( i = 0, n = alternatives.length; i < n; i += 1 ) {
          accessor = createOneAccessor(alternatives[i]);
          if( accessor != null ) {
            break;
          }
        }
      }
      else {
        accessor = createOneAccessor(spec);
      }

      if( accessor != null ) {
        accessors[accessorName] = accessor;
      }
      else if( !(accessorName in accessors) ) {
        accessors[accessorName] = function(value, database, visitor) {};
      }
    }
  };

  Exhibit.Util.createAccessorsFromDOM = function(container, specs, accessors) {
    createAccessors(
      function(field) { return $(container).attr("ex:" + field); },
      specs,
      accessors
    );
  };

})(jQuery, Fabulator.Exhibit);
