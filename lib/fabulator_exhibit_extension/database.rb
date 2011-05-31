class FabulatorExhibitExtension
  class Database
    def initialize(db)
      @db = db
      @info = {
        :items => ItemCollection.new(@db),
        :properties => PropertyCollection.new(@db),
        :types => TypeCollection.new(@db)
      }
    end

    def to_json
      '{ "items":' + @info[:items].to_json + ', ' +
      '  "types":' + @info[:types].to_json + ', ' +
      '  "properties":' + @info[:properties].to_json +
      '}'
    end

    def [](t)
      @info[t.to_sym]
    end
  end

  class ItemCollection
    def initialize(db)
      @db = db
      @items = { }
    end

    def delete_if(&block)
      self.each do |i|
        r = yield i['id'], i
        if r
          @items.delete(i['id'])
          i.delete
        end
      end
    end

    def each(&block)
      @db.fabulator_exhibit_items.find(:all).each do |i|
        @items[i.id.to_s] ||= Item.new(i)
        yield @items[i.id.to_s]
      end
    end
    
    def collect(&block)
      ret = [ ]
      self.each do |i|
        ret << yield i
      end
    end

    def [](nom)
      return @items[nom] if @items.include?(nom)
      ob = nil
      begin
        ob = @db.fabulator_exhibit_items.find(:first, [ 'uuid = ?', nom ])
      rescue
        ob = nil
      end
      if ob.nil? 
        ob = FabulatorExhibitItem.new({
          :uuid => nom,
          :fabulator_exhibit_id => @db.id
        })
      end
      @items[nom] = Item.new(ob)
    end

    def include?(nom)
      ob = nil
      begin
        ob = @db.fabulator_exhibit_items.find(:first, :conditions => [ 'uuid = ?', nom ])
      rescue
        ob = nil
      end
      return !ob.nil?
    end

    def []=(nom, hash)
      ob = self[nom]
      hash.each_pair do |k,v|
        ob[k] = v
      end
      ob.save
    end

    def to_json
      props = { }
      p = Fabulator::Expr::Parser.new
      ctx = Fabulator::Expr::Context.new
      PropertyCollection.new(@db).each_pair do |prop, info|
        next unless info['select']
        props[prop] = p.parse(ctx, info['select'])
      end
      if props.empty?
        '[' +
        self.collect{ |i| 
          i.data
        }.join(", ") +
        ']'
      else
        '[' +
        self.collect{ |i|
          n = i.to_node
          props.each_pair do |prop, select|
            ctx.with_root(n).evaluate(select).each do |v|
              n.create_child(prop, v)
            end
          end
          h = { }
          n.children.each do |c|
            if h.has_key?(c.name)
              h[c.name] = [ h[c.name] ] unless h[c.name].is_a?(Array)
              h[c.name] << c.value
            else
              h[c.name] = c.value
            end
          end
          h['id'] = n.name
          h.to_json
        }.join(", ") +
        ']'
      end
    end
  end

  class PropertyCollection
    def initialize(db)
      @db = db
      @properties = { }
    end

    def [](nom)
      return @properties[nom] if @properties.include?(nom)
      ob = nil
      begin
        ob = @db.fabulator_exhibit_properties.find(:first, :conditions => [ 'name = ?', nom ])
      rescue
        ob = nil
      end
      if ob.nil?
        ob = FabulatorExhibitProperty.new({
          :name => nom,
          :fabulator_exhibit_id => @db.id
        })
      end
      @properties[nom] ||= Property.new(ob)
    end

    def []=(nom, hash)
      ob = self[nom]
      hash.each_pair do |k,v|
        ob[k] = v
      end
      ob.save
    end

    def to_json
      '{' +
      @db.fabulator_exhibit_properties.find(:all).collect{ |p|
        p.name.to_json + ":" + p.data
      }.join(", ") +
      '}'
    end
  end

  class TypeCollection
    def initialize(db)
      @db = db
      @types = { }
    end

    def [](nom)
      return @types[nom] if @types.include?(nom)
      ob = nil
      begin
        ob = @db.fabulator_exhibit_types.find(:first, :conditions => [ 'name = ?', nom ])
      rescue
        ob = nil
      end
      if ob.nil?
        ob = FabulatorExhibitType.new({
          :name => nom,
          :fabulator_exhibit_id => @db.id
        })
      end
      @types[nom] ||= Type.new(ob)
    end

    def []=(nom, hash)
      ob = self[nom]
      hash.each_pair do |k,v|
        ob[k] = v
      end
      ob.save
    end

    def to_json
      '{' +
      @db.fabulator_exhibit_types.find(:all).collect{ |t|
        t.name.to_json + ":" + t.data
      }.join(", ") +
      '}'
    end
  end

  class Item
    def initialize(i)
      @item = i
      @raw_data = ( JSON.parse(i.data) rescue {} )
    end

    def delete
      @item.delete
    end

    def [](k)
      @raw_data[k]
    end

    def []=(k,v)
      @raw_data[k] = v
      self.save
    end

    def delete(k)
      @raw_data.delete(k)
      self.save
    end

    def each_pair(&block)
      @raw_data.each_pair do |k,v|
        yield k,v
      end
    end
    
    def to_node(ctx)
      n = ctx.root.anon_node
      n.name = @raw_data['id']
      @raw_data.each_pair do |k,v|
        v = [ v ] unless v.is_a?(Array)
        v.each do |vv|
          n.create_child(k, vv)
        end
      end
      n
    end

    def merge!(hash)
      @raw_data.merge!(hash)
      self.save
    end

    def save
      @item.data = @raw_data.to_json
      @item.save
    end

    def save!
      @item.data = @raw_data.to_json
      @item.save!
    end
  end

  class Type
    def initialize(t)
      @type = t
      @raw_data = ( JSON.parse(t.data) rescue {} )
    end

    def [](k)
      @raw_data[k]
    end

    def []=(k,v)
      @raw_data[k] = v
      self.save
    end

    def delete(k)
      @raw_data.delete(k)
      self.save
    end

    def each_pair(&block)
      @raw_data.each_pair do |k,v|
        yield k,v
      end
    end

    def merge!(hash)
      @raw_data.merge!(hash)
      self.save
    end

    def save
      @type.data = @raw_data.to_json
      @type.save
    end

    def save!
      @type.data = @raw_data.to_json
      @type.save!
    end
  end

  class Property
    def initialize(p)
      @property = p
      @raw_data = ( JSON.parse(p.data) rescue {} )
    end

    def [](k)
      @raw_data[k]
    end

    def []=(k,v)
      @raw_data[k] = v
      self.save
    end

    def delete(k)
      @raw_data.delete(k)
      self.save
    end

    def each_pair(&block)
      @raw_data.each_pair do |k,v|
        yield k,v
      end
    end

    def merge!(hash)
      @raw_data.merge!(hash)
      self.save
    end

    def save
      @property.data = @raw_data.to_json
      @property.save
    end

    def save!
      @property.data = @raw_data.to_json
      @property.save!
    end
  end

end
