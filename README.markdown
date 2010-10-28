Fabulator Exhibit Extension
===========================

This extension acts as the glue tieing together the Fabualtor Radiant extension
and the Fabulator engine Exhibit extension.

Installation
------------

Installation is done in the usual manner for Radiant extensions.

This extension requires Radiant 0.9 or higher as well as the following
libraries:

* ruby-fabulator-exhibit gem

After installation, you will need to add the following to your site's 
environment.rb:

  config.gem 'radiant-fabulator_exhibit-extension'

and the following to your site's Rakefile:

  require 'tasks/fabulator_exhibit_extension'


== LICENSE:

N.B.: The JavaScript libraries in this distribution are under a separate
license.  See the JavaScript files for more information.

Copyright (c) 2009-2010 Texas A&M University

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
