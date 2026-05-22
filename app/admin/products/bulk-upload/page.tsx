'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, Download, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface UploadResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

export default function BulkUploadPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  // Sample CSV template
  const csvTemplate = `name,description,price,compare_at_price,stock,category,brand,is_featured,images
iPhone 15 Pro,Latest iPhone with A17 Pro chip,1250000,1350000,10,Smartphones,Apple,true,https://example.com/iphone.jpg
Samsung Galaxy S24,AI-powered smartphone,950000,,15,Smartphones,Samsung,true,
MacBook Air M3,Lightning fast laptop,1850000,1950000,5,Laptops,Apple,true,https://example.com/macbook.jpg`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const products = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const product: any = {};
      
      headers.forEach((header, index) => {
        let value = values[index] || '';
        
        // Convert boolean strings
        if (value === 'true') value = true;
        if (value === 'false') value = false;
        if (value === '') value = null;
        
        // Convert numbers
        if (header === 'price' || header === 'compare_at_price' || header === 'stock') {
          value = value ? parseInt(value) : null;
        }
        
        product[header] = value;
      });
      
      products.push(product);
    }
    
    return products;
  };

  const getCategoryId = async (categoryName: string) => {
    if (!categoryName) return null;
    
    // Try to find existing category
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .ilike('name', categoryName)
      .single();
    
    if (existing) return existing.id;
    
    // Create new category if not exists
    const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { data: newCategory } = await supabase
      .from('categories')
      .insert({ name: categoryName, slug })
      .select()
      .single();
    
    return newCategory?.id;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    setResult(null);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target?.result as string;
      const products = parseCSV(csvText);
      
      let success = 0;
      let failed = 0;
      const errors: Array<{ row: number; error: string }> = [];
      
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const rowNum = i + 2; // +2 because header is row 1 and array is 0-indexed
        
        try {
          // Validate required fields
          if (!product.name) {
            errors.push({ row: rowNum, error: 'Product name is required' });
            failed++;
            continue;
          }
          
          if (!product.price) {
            errors.push({ row: rowNum, error: 'Price is required' });
            failed++;
            continue;
          }
          
          // Get category ID
          let categoryId = null;
          if (product.category) {
            categoryId = await getCategoryId(product.category);
            if (!categoryId) {
              errors.push({ row: rowNum, error: `Failed to find/create category: ${product.category}` });
              failed++;
              continue;
            }
          }
          
          // Create slug from name
          const slug = product.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
          
          // Prepare images array
          const images = product.images ? product.images.split('|').map((img: string) => img.trim()) : [];
          
          // Insert product
          const { error } = await supabase
            .from('products')
            .insert({
              name: product.name,
              slug,
              description: product.description || null,
              price: product.price,
              compare_at_price: product.compare_at_price || null,
              stock: product.stock || 0,
              category_id: categoryId,
              brand: product.brand || null,
              images: images,
              is_featured: product.is_featured || false,
              is_active: true,
            });
          
          if (error) {
            errors.push({ row: rowNum, error: error.message });
            failed++;
          } else {
            success++;
          }
        } catch (error: any) {
          errors.push({ row: rowNum, error: error.message });
          failed++;
        }
      }
      
      setResult({ success, failed, errors });
      setUploading(false);
    };
    
    reader.readAsText(file);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bulk Product Upload</h1>
          <p className="text-gray-600 mt-1">Import multiple products at once using CSV</p>
        </div>
        <Link href="/admin/products">
          <button className="text-gray-600 hover:text-gray-800">← Back to Products</button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload CSV File
          </h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
              disabled={uploading}
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Click to upload CSV file</p>
              <p className="text-xs text-gray-400 mt-1">Supported format: .csv</p>
            </label>
          </div>
          
          {uploading && (
            <div className="mt-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Processing upload...</p>
            </div>
          )}
          
          <div className="mt-6 pt-6 border-t">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Download className="h-4 w-4" />
              Download CSV Template
            </button>
          </div>
        </div>

        {/* Instructions Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">CSV Format Instructions</h2>
          
          <div className="space-y-3 text-sm">
            <div>
              <h3 className="font-medium mb-1">Required Columns:</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li><code className="bg-gray-100 px-1 rounded">name</code> - Product name (required)</li>
                <li><code className="bg-gray-100 px-1 rounded">price</code> - Price in RWF (required)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-1">Optional Columns:</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li><code className="bg-gray-100 px-1 rounded">description</code> - Product description</li>
                <li><code className="bg-gray-100 px-1 rounded">compare_at_price</code> - Original price for sales</li>
                <li><code className="bg-gray-100 px-1 rounded">stock</code> - Available quantity (default: 0)</li>
                <li><code className="bg-gray-100 px-1 rounded">category</code> - Category name (auto-created if new)</li>
                <li><code className="bg-gray-100 px-1 rounded">brand</code> - Product brand</li>
                <li><code className="bg-gray-100 px-1 rounded">is_featured</code> - true/false (default: false)</li>
                <li><code className="bg-gray-100 px-1 rounded">images</code> - Pipe-separated URLs (url1|url2|url3)</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3 mt-4">
              <h3 className="font-medium text-blue-800 mb-1 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Tips:
              </h3>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li>Save your file as CSV (Comma Delimited)</li>
                <li>First row must contain column headers</li>
                <li>Categories are automatically created if they don't exist</li>
                <li>Images can be Cloudinary URLs or external image URLs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Upload Results</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{result.success}</p>
              <p className="text-sm text-green-700">Products Imported</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{result.failed}</p>
              <p className="text-sm text-red-700">Failed</p>
            </div>
          </div>
          
          {result.errors.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Errors:</h3>
              <div className="bg-red-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {result.errors.map((err, idx) => (
                    <div key={idx} className="text-sm text-red-700">
                      <span className="font-mono">Row {err.row}:</span> {err.error}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {result.success > 0 && (
            <div className="mt-6 flex gap-3">
              <Link href="/admin/products">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  View All Products
                </button>
              </Link>
              <button
                onClick={() => setResult(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Upload More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
