ActionController::Routing::Routes.draw do |map|
  map.namespace 'admin' do |admin|
    admin.namespace 'fabulator', :member => { :remove => :get } do |fab|
      fab.resources :exhibits
    end
  end
  map.namespace 'api' do |api|
    api.resources :exhibits
  end
end
