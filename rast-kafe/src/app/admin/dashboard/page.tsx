'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Edit2, X, Upload, DollarSign, 
  Percent, ArrowLeft, LogOut, Check, Package
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_available: boolean;
};

const categories = ['Sıcak Kahveler', 'Soğuk İçecekler', 'Tatlılar', 'Sandviçler'];

export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Sıcak Kahveler',
    image_url: '',
    is_available: true,
  });

  const [bulkData, setBulkData] = useState({
    type: 'percent',
    value: '',
    category: 'Tümü',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (!supabase.client) {
      setLoading(false);
      return;
    }
    try {
      const { data: { user } } = await supabase.client.auth.getUser();
      if (!user) {
        router.push('/admin');
      } else {
        fetchProducts();
      }
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/admin');
    }
  };

  const fetchProducts = async () => {
    if (!supabase.client) {
      setProducts([]);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.client
        .from('products')
        .select('*')
        .order('category', { ascending: true });
      
      if (data) setProducts(data);
    } catch (error) {
      console.error('Fetch error:', error);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    if (supabase.client) {
      await supabase.client.auth.signOut();
    }
    router.push('/admin');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      image_url: formData.image_url || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop',
      is_available: formData.is_available,
    };

    if (supabase.client) {
      if (editingProduct) {
        await supabase.client.from('products').update(productData).eq('id', editingProduct.id);
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
      } else {
        const { data } = await supabase.client.from('products').insert(productData).select().single();
        if (data) setProducts([...products, data]);
      }
    }

    setShowModal(false);
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', category: 'Sıcak Kahveler', image_url: '', is_available: true });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image_url: product.image_url,
      is_available: product.is_available,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      if (supabase.client) {
        await supabase.client.from('products').delete().eq('id', id);
      }
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const toggleAvailability = async (product: Product) => {
    if (supabase.client) {
      await supabase.client.from('products').update({ is_available: !product.is_available }).eq('id', product.id);
    }
    setProducts(products.map(p => p.id === product.id ? { ...p, is_available: !p.is_available } : p));
  };

  const handleBulkUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let multiplier = 1;
    if (bulkData.type === 'percent') {
      multiplier = 1 + (parseFloat(bulkData.value) / 100);
    } else {
      multiplier = 1 + (parseFloat(bulkData.value) / 100);
    }

    const productsToUpdate = bulkData.category === 'Tümü' 
      ? products 
      : products.filter(p => p.category === bulkData.category);

    const updatedProducts = products.map(product => {
      if (bulkData.category === 'Tümü' || product.category === bulkData.category) {
        const newPrice = bulkData.type === 'percent'
          ? Math.round(product.price * multiplier * 100) / 100
          : product.price + parseFloat(bulkData.value);
        return { ...product, price: newPrice };
      }
      return product;
    });

    if (supabase.client) {
      for (const product of productsToUpdate) {
        const newPrice = bulkData.type === 'percent'
          ? Math.round(product.price * multiplier * 100) / 100
          : product.price + parseFloat(bulkData.value);
        
        await supabase.client.from('products').update({ price: newPrice }).eq('id', product.id);
      }
    }

    setProducts(updatedProducts);
    setShowBulkModal(false);
    setBulkData({ type: 'percent', value: '', category: 'Tümü' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rast-neon border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <header className="sticky top-0 z-50 glass">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="p-2 hover:bg-white/10 rounded-full">
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </button>
            <h1 className="text-2xl font-bold tracking-[0.2em] text-rast-neon">YÖNETİM</h1>
          </div>
          <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-full">
            <LogOut className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
      </header>

      <main className="p-4 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => { setEditingProduct(null); setFormData({ name: '', description: '', price: '', category: 'Sıcak Kahveler', image_url: '', is_available: true }); setShowModal(true); }}
            className="flex-1 py-3 rounded-xl bg-rast-neon text-black font-bold flex items-center justify-center gap-2 neon-glow"
          >
            <Plus className="w-5 h-5" /> Ürün Ekle
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex-1 py-3 rounded-xl bg-white/10 text-white font-bold flex items-center justify-center gap-2"
          >
            <DollarSign className="w-5 h-5" /> Fiyat Güncelle
          </button>
        </div>

        <div className="grid gap-3">
          {products.map((product) => (
            <motion.div
              key={product.id}
              layout
              className={`glass rounded-xl p-3 flex gap-3 ${!product.is_available ? 'opacity-50' : ''}`}
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white">{product.name}</h3>
                    <p className="text-xs text-zinc-500">{product.category}</p>
                  </div>
                  <span className="text-lg font-bold text-rast-neon">₺{product.price}</span>
                </div>
                
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => toggleAvailability(product)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 ${product.is_available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                  >
                    <Package className="w-3 h-3" />
                    {product.is_available ? 'Stokta' : 'Tükendi'}
                  </button>
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-1.5 rounded-lg bg-red-500/20 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500">Henüz ürün yok</p>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-zinc-900 rounded-2xl w-full max-w-md p-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Ürün Adı"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-rast-neon focus:outline-none"
                  required
                />
                
                <textarea
                  placeholder="Açıklama"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-rast-neon focus:outline-none resize-none"
                  rows={2}
                />
                
                <input
                  type="number"
                  placeholder="Fiyat (TL)"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-rast-neon focus:outline-none"
                  required
                />

                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-rast-neon focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-zinc-900">{cat}</option>
                  ))}
                </select>

                <input
                  type="url"
                  placeholder="Resim URL (opsiyonel)"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-rast-neon focus:outline-none"
                />

                <label className="flex items-center gap-3 cursor-pointer">
                  <div 
                    onClick={() => setFormData({ ...formData, is_available: !formData.is_available })}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.is_available ? 'bg-green-500' : 'bg-zinc-600'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${formData.is_available ? 'translate-x-6' : ''}`} />
                  </div>
                  <span className="text-sm text-zinc-400">Stokta var</span>
                </label>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-rast-neon text-black font-bold neon-glow"
                >
                  {editingProduct ? 'Güncelle' : 'Ekle'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showBulkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowBulkModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-zinc-900 rounded-2xl w-full max-w-sm p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Toplu Fiyat Güncelle</h2>
                <button onClick={() => setShowBulkModal(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <form onSubmit={handleBulkUpdate} className="space-y-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkData({ ...bulkData, type: 'percent' })}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${bulkData.type === 'percent' ? 'bg-rast-neon text-black' : 'bg-white/10 text-zinc-400'}`}
                  >
                    <Percent className="w-4 h-4" /> %
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkData({ ...bulkData, type: 'fixed' })}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${bulkData.type === 'fixed' ? 'bg-rast-neon text-black' : 'bg-white/10 text-zinc-400'}`}
                  >
                    <DollarSign className="w-4 h-4" /> TL
                  </button>
                </div>

                <input
                  type="number"
                  placeholder={bulkData.type === 'percent' ? 'Artış oranı (%)' : 'Eklenecek TL'}
                  value={bulkData.value}
                  onChange={(e) => setBulkData({ ...bulkData, value: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-rast-neon focus:outline-none"
                  required
                />

                <select
                  value={bulkData.category}
                  onChange={(e) => setBulkData({ ...bulkData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-rast-neon focus:outline-none"
                >
                  <option value="Tümü" className="bg-zinc-900">Tüm Kategoriler</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-zinc-900">{cat}</option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-rast-neon text-black font-bold neon-glow"
                >
                  Uygula
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
