class FabulatorExhibitExtension
  class Database
    def initialize(db)
      @db = db
    end

    def to_json
      '{ "items":' + self[:items].to_json + ', ' +
      '  "types":' + self[:types].to_json + ', ' +
      '  "properties":' + self[:properties].to_json +
      '}'
    end

    def [](t)
      case t.to_sym
        when :items
          return ItemCollection.new(@db)
        when :properties
          return PropertyCollection.new(@db)
        when :types
          return TypeCollection.new(@db)
      end
    end
  end

  class ItemCollection
    def initialize(db)
      @db = db
    end

    def [](nom)
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
      Item.new(ob)
    end

    def include?(nom)
      ob = nil
      begin
        ob = @db.fabulator_exhibit_items.find(:first, [ 'uuid = ?', nom ])
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
      '[' +
      @db.fabulator_exhibit_items.find(:all).collect{ |i| i.data }.join(", ") +
      ']'
    end
  end

  class PropertyCollection
    def initialize(db)
      @db = db
    end

    def [](nom)
      ob = nil
      begin
        ob = @db.fabulator_exhibit_properties.find(:first, [ 'name = ?', nom ])
      rescue
        ob = nil
      end
      if ob.nil?
        ob = FabulatorExhibitProperty.new({
          :name => nom,
          :fabulator_exhibit_id => @db.id
        })
      end
      Property.new(ob)
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
    end

    def [](nom)
      ob = nil
      begin
        ob = @db.fabulator_exhibit_types.find(:first, [ 'name = ?', nom ])
      rescue
        ob = nil
      end
      if ob.nil?
        ob = FabulatorExhibitType.new({
          :name => nom,
          :fabulator_exhibit_id => @db.id
        })
      end
      Type.new(ob)
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
