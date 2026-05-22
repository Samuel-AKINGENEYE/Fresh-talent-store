'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, Package, Tag, DollarSign } from 'lucide-react';

interface Bundle {
  id: number;
  name: string;
  description: string;
  discount_type: string;
  discount_value: number;
  total_price: number;
  is_active: boolean;
}

interface BundleProduct {
  bundle_id: number;
  product_id: number;
  quantity: number;
  product?: {
    id: number;
    name: string;
    price: number;
  };
}

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [bundleProducts, setBundleProducts] = useState<BundleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<{ product_id: number; quantity: number }[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
  });

  useEffect(() => {
    loadBundles();
    loadProducts();
  }, []);

  const loadBundles = async () => {
    const { data } = await supabase
      .from('bundles')
      .select('*')
      .order('created_at', { ascending: false });
    
    setBundles(data || []);
    setLoading(false);
  };

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name, price, images')
      .eq('is_active', true);
    
    setProducts(data || []);
  };

  const calculateTotalPrice = () => {
    let originalTotal = 0;
    for (const item of selectedProducts) {
      const product = products.find(p => p.id === item.product_id);
      if (product) {
        originalTotal += product.price * item.quantity;
      }
    }
    
    if (formData.discount_type === 'percentage') {
      return originalTotal * (1 - parseInt(formData.discount_value) / 100);
    } else {
      return originalTotal - parseInt(formData.discount_value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalPrice = calculateTotalPrice();
    const originalTotal = products
      .filter(p => selectedProducts.some(sp => sp.product_id === p.id))
      .reduce((sum, p) => {
        const item = selectedProducts.find(sp => sp.product_id === p.id);
        return sum + (p.price * (item?.quantity || 1));
      }, 0);
    
    const bundleData = {
      name: formData.name,
      description: formData.description,
      discount_type: formData.discount_type,
      discount_value: parseInt(formData.discount_value),
      total_price: totalPrice,
    };

    let bundleId = editingId;
    let error;

    if (editingId) {
      const { error: updateError } = await supabase
        .from('bundles')
        .update(bundleData)
        .eq('id', editingId);
      error = updateError;
      
      // Delete existing bundle products
      if (!error) {
        await supabase
          .from('bundle_products')
          .delete()
          .eq('bundle_id', editingId);
      }
    } else {
      const { data, error: insertError } = await supabase
        .from('bundles')
        .insert(bundleData)
        .select();
      error = insertError;
      if (data && data[0]) bundleId = data[0].id;
    }

    if (error) {
      alert('Error saving bundle: ' + error.message);
    } else if (bundleId && selectedProducts.length > 0) {
      // Add bundle products
      const bundleProductsData = selectedProducts.map(sp => ({
        bundle_id: bundleId,
        product_id: sp.product_id,
        quantity: sp.quantity,
      }));
      
      const { error: productError } = await supabase
        .from('bundle_products')
        .insert(bundleProductsData);
      
      if (productError) {
        alert('Error adding products: ' + productError.message);
      } else {
        alert(editingId ? 'Bundle updated!' : 'Bundle created!');
        setShowForm(false);
        setEditingId(null);
        setSelectedProducts([]);
        setFormData({
          name: '',
          description: '',
          discount_type: 'percentage',
          discount_value: '',
        });
        loadBundles();
      }
    } else {
      alert('Bundle created!');
      setShowForm(false);
      setEditingId(null);
      setSelectedProducts([]);
      setFormData({
        name: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
      });
      loadBundles();
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Delete bundle "${name}"?`)) {
      const { error } = await supabase
        .from('bundles')
        .delete()
        .eq('id', id);
      
      if (error) {
        alert('Error deleting bundle: ' + error.message);
      } else {
        loadBundles();
      }
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('bundles')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    
    if (error) {
      alert('Error updating status: ' + error.message);
    } else {
      loadBundles();
    }
  };

  const addProductToBundle = () => {
    setSelectedProducts([...selectedProducts, { product_id: 0, quantity: 1 }]);
  };

  const updateSelectedProduct = (index: number, field: string, value: any) => {
    const updated = [...selectedProducts];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedProducts(updated);
  };

  const removeSelectedProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
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
        <h1 className="text-2xl font-bold">Bundle Deals</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setSelectedProducts([]);
            setFormData({
              name: '',
              description: '',
              discount_type: 'percentage',
              discount_value: '',
            });
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Bundle
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Bundle' : 'Create New Bundle'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bundle Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Gaming Bundle"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Discount Type</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (RWF)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {formData.discount_type === 'percentage' ? 'Discount (%)' : 'Discount Amount (RWF)'}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your bundle..."
                />
              </div>
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Products in Bundle</label>
                  <button
                    type="button"
                    onClick={addProductToBundle}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Product
                  </button>
                </div>
                <div className="border rounded-lg p-4 space-y-3">
                  {selectedProducts.length === 0 ? (
                    <p className="text-gray-500 text-center">No products added yet. Click "Add Product"</p>
                  ) : (
                    selectedProducts.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <select
                          className="flex-1 px-3 py-2 border rounded-lg"
                          value={item.product_id}
                          onChange={(e) => updateSelectedProduct(idx, 'product_id', parseInt(e.target.value))}
                          required
                        >
                          <option value={0}>Select Product</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} - RWF {p.price.toLocaleString()}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateSelectedProduct(idx, 'quantity', parseInt(e.target.value))}
                          className="w-24 px-3 py-2 border rounded-lg"
                          placeholder="Qty"
                        />
                        <button
                          type="button"
                          onClick={() => removeSelectedProduct(idx)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
                {selectedProducts.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Original Price:</span>
                      <span>
                        RWF {products
                          .filter(p => selectedProducts.some(sp => sp.product_id === p.id))
                          .reduce((sum, p) => {
                            const item = selectedProducts.find(sp => sp.product_id === p.id);
                            return sum + (p.price * (item?.quantity || 1));
                          }, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-green-600">
                      <span>Bundle Price:</span>
                      <span>RWF {Math.floor(calculateTotalPrice()).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-blue-600">
                      <span>You Save:</span>
                      <span>
                        RWF {(products
                          .filter(p => selectedProducts.some(sp => sp.product_id === p.id))
                          .reduce((sum, p) => {
                            const item = selectedProducts.find(sp => sp.product_id === p.id);
                            return sum + (p.price * (item?.quantity || 1));
                          }, 0) - calculateTotalPrice()).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {editingId ? 'Update' : 'Create'} Bundle
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

      {/* Bundles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bundles.map((bundle) => (
          <div key={bundle.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{bundle.name}</h3>
                  <p className="text-sm opacity-90">
                    {bundle.discount_type === 'percentage' 
                      ? `${bundle.discount_value}% OFF` 
                      : `RWF ${bundle.discount_value.toLocaleString()} OFF`}
                  </p>
                </div>
                <button
                  onClick={() => toggleStatus(bundle.id, bundle.is_active)}
                  className={`px-2 py-1 rounded-full text-xs ${
                    bundle.is_active ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                >
                  {bundle.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-600">{bundle.description || 'No description'}</p>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Bundle Price:</span>
                <span className="font-semibold text-green-600">RWF {bundle.total_price?.toLocaleString()}</span>
              </div>
              
              <div className="flex gap-2 pt-3 border-t">
                <button
                  onClick={() => {
                    // Load bundle products for editing
                    setEditingId(bundle.id);
                    setFormData({
                      name: bundle.name,
                      description: bundle.description || '',
                      discount_type: bundle.discount_type,
                      discount_value: bundle.discount_value.toString(),
                    });
                    setShowForm(true);
                  }}
                  className="flex-1 px-3 py-1 text-sm border rounded hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(bundle.id, bundle.name)}
                  className="flex-1 px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {bundles.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No bundles created. Click "Create Bundle" to start saving!
          </div>
        )}
      </div>
    </div>
  );
}
