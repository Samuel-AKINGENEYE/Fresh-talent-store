'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, Calendar, Clock, Tag } from 'lucide-react';

interface FlashSale {
  id: number;
  name: string;
  description: string;
  discount_percentage: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

export default function AdminFlashSalesPage() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discount_percentage: '',
    starts_at: '',
    ends_at: '',
  });

  useEffect(() => {
    loadFlashSales();
    loadProducts();
  }, []);

  const loadFlashSales = async () => {
    const { data } = await supabase
      .from('flash_sales')
      .select('*')
      .order('created_at', { ascending: false });
    
    setFlashSales(data || []);
    setLoading(false);
  };

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name, price')
      .eq('is_active', true);
    
    setProducts(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const flashSaleData = {
      name: formData.name,
      description: formData.description,
      discount_percentage: parseInt(formData.discount_percentage),
      starts_at: formData.starts_at,
      ends_at: formData.ends_at,
    };

    let flashSaleId = editingId;
    let error;

    if (editingId) {
      const { error: updateError } = await supabase
        .from('flash_sales')
        .update(flashSaleData)
        .eq('id', editingId);
      error = updateError;
    } else {
      const { data, error: insertError } = await supabase
        .from('flash_sales')
        .insert(flashSaleData)
        .select();
      error = insertError;
      if (data && data[0]) flashSaleId = data[0].id;
    }

    if (error) {
      alert('Error saving flash sale: ' + error.message);
    } else if (flashSaleId && selectedProducts.length > 0 && !editingId) {
      // Add selected products to flash sale
      const saleProducts = selectedProducts.map(productId => ({
        flash_sale_id: flashSaleId,
        product_id: productId,
        sale_price: Math.floor(products.find(p => p.id === productId)?.price * (1 - parseInt(formData.discount_percentage) / 100)),
      }));
      
      const { error: productError } = await supabase
        .from('flash_sale_products')
        .insert(saleProducts);
      
      if (productError) {
        alert('Error adding products: ' + productError.message);
      }
    }

    alert(editingId ? 'Flash sale updated!' : 'Flash sale created!');
    setShowForm(false);
    setEditingId(null);
    setSelectedProducts([]);
    setFormData({
      name: '',
      description: '',
      discount_percentage: '',
      starts_at: '',
      ends_at: '',
    });
    loadFlashSales();
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Delete flash sale "${name}"?`)) {
      const { error } = await supabase
        .from('flash_sales')
        .delete()
        .eq('id', id);
      
      if (error) {
        alert('Error deleting flash sale: ' + error.message);
      } else {
        loadFlashSales();
      }
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('flash_sales')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    
    if (error) {
      alert('Error updating status: ' + error.message);
    } else {
      loadFlashSales();
    }
  };

  const getTimeRemaining = (endsAt: string) => {
    const end = new Date(endsAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} days left`;
    return `${hours} hours left`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Flash Sales</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setSelectedProducts([]);
            setFormData({
              name: '',
              description: '',
              discount_percentage: '',
              starts_at: '',
              ends_at: '',
            });
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Schedule Flash Sale
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Flash Sale' : 'Schedule New Flash Sale'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sale Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Summer Flash Sale"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Discount Percentage *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="90"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.starts_at}
                  onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.ends_at}
                  onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your flash sale..."
                />
              </div>
              {!editingId && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Select Products for Flash Sale</label>
                  <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {products.map((product) => (
                        <label key={product.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProducts([...selectedProducts, product.id]);
                              } else {
                                setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="flex-1">{product.name}</span>
                          <span className="text-sm text-gray-500">Regular: RWF {product.price.toLocaleString()}</span>
                          <span className="text-sm text-green-600 font-semibold">
                            Sale: RWF {Math.floor(product.price * (1 - parseInt(formData.discount_percentage || '0') / 100)).toLocaleString()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {editingId ? 'Update' : 'Schedule'} Flash Sale
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Flash Sales List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flashSales.map((sale) => (
          <div key={sale.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{sale.name}</h3>
                  <p className="text-sm opacity-90">{sale.discount_percentage}% OFF</p>
                </div>
                <button
                  onClick={() => toggleStatus(sale.id, sale.is_active)}
                  className={`px-2 py-1 rounded-full text-xs ${
                    sale.is_active ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                >
                  {sale.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-600">{sale.description || 'No description'}</p>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Starts: {new Date(sale.starts_at).toLocaleString()}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>Ends: {new Date(sale.ends_at).toLocaleString()}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm font-semibold text-orange-600">
                <Tag className="h-4 w-4" />
                <span>{getTimeRemaining(sale.ends_at)}</span>
              </div>
              
              <div className="flex gap-2 pt-3 border-t">
                <button
                  onClick={() => {
                    setEditingId(sale.id);
                    setFormData({
                      name: sale.name,
                      description: sale.description || '',
                      discount_percentage: sale.discount_percentage.toString(),
                      starts_at: sale.starts_at.slice(0, 16),
                      ends_at: sale.ends_at.slice(0, 16),
                    });
                    setShowForm(true);
                  }}
                  className="flex-1 px-3 py-1 text-sm border rounded hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(sale.id, sale.name)}
                  className="flex-1 px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {flashSales.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No flash sales scheduled. Click "Schedule Flash Sale" to create one.
          </div>
        )}
      </div>
    </div>
  );
}
