'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Edit2, X, DollarSign, 
  Percent, ArrowLeft, LogOut, Package, Settings, Store, Languages,
  BarChart3, TrendingUp, TrendingDown, Clock, AlertCircle
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
  created_at?: string;
};

type ViewLog = {
  id: number;
  date: string;
  timestamp: string;
  path: string;
};

type Settings = {
  store_name: string;
  store_description: string;
  store_image: string;
  wifi_password: string;
  accent_color: string;
  menu_title: string;
  welcome_text: string;
  footer_text: string;
};

type Language = 'tr' | 'en';

const translations = {
  tr: {
    title: 'YÖNETİM',
    products: 'Ürünler',
    categories: 'Kategoriler',
    settings: 'Ayarlar',
    analytics: 'Analitik',
    addProduct: 'Ürün Ekle',
    updatePrice: 'Fiyat Güncelle',
    noProducts: 'Henüz ürün yok',
    inStock: 'Stokta',
    outOfStock: 'Tükendi',
    edit: 'Düzenle',
    delete: 'Sil',
    save: 'Kaydet',
    cancel: 'İptal',
    add: 'Ekle',
    update: 'Güncelle',
    back: 'Geri',
    logout: 'Çıkış',
    storeInfo: 'Dükkan Bilgileri',
    storeName: 'Dükkan İsmi',
    description: 'Açıklama',
    storeImage: 'Dükkan Fotoğrafı URL',
    wifiPassword: 'WiFi Şifresi',
    instagram: 'Instagram Linki',
    menuToggle: 'Menü Geçiş Butonu',
    newCategory: 'Yeni Kategori',
    categoryName: 'Kategori adı',
    allCategories: 'Tüm Kategoriler',
    bulkPrice: 'Toplu Fiyat Güncelle',
    percent: '%',
    fixed: 'TL',
    apply: 'Uygula',
    productName: 'Ürün Adı',
    price: 'Fiyat (TL)',
    category: 'Kategori',
    imageUrl: 'Resim URL',
    inStock2: 'Stokta var',
    all: 'Tümü',
    settingsSaved: 'Ayarlar kaydedildi!',
    deleteConfirm: 'silinsin mi?',
    addCategory: 'Ekle',
    english: 'EN',
    menuTitle: 'Menü Başlığı',
    welcomeText: 'Hoşgeldiniz Yazısı',
    footerText: 'Alt Bilgi Yazısı',
    totalProducts: 'Toplam Ürün',
    outOfStockProducts: 'Tükenen Ürün',
    totalCategories: 'Toplam Kategori',
    mostExpensive: 'En Pahalı',
    cheapest: 'En Ucuz',
    recentProducts: 'Son Eklenen Ürünler',
    categoryDistribution: 'Kategori Dağılımı',
    usageStats: 'Kullanım İstatistikleri',
    today: 'Bugün',
    thisWeek: 'Bu Hafta',
    thisMonth: 'Bu Ay',
    views: 'görüntülenme',
    noViewsYet: 'Henüz veri yok',
  },
  en: {
    title: 'MANAGEMENT',
    products: 'Products',
    categories: 'Categories',
    settings: 'Settings',
    analytics: 'Analytics',
    addProduct: 'Add Product',
    updatePrice: 'Update Price',
    noProducts: 'No products yet',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    add: 'Add',
    update: 'Update',
    back: 'Back',
    logout: 'Logout',
    storeInfo: 'Store Info',
    storeName: 'Store Name',
    description: 'Description',
    storeImage: 'Store Image URL',
    wifiPassword: 'WiFi Password',
    instagram: 'Instagram Link',
    menuToggle: 'Menu Toggle Button',
    newCategory: 'New Category',
    categoryName: 'Category name',
    allCategories: 'All Categories',
    bulkPrice: 'Bulk Price Update',
    percent: '%',
    fixed: 'TL',
    apply: 'Apply',
    productName: 'Product Name',
    price: 'Price (TL)',
    category: 'Category',
    imageUrl: 'Image URL',
    inStock2: 'In Stock',
    all: 'All',
    settingsSaved: 'Settings saved!',
    deleteConfirm: 'delete?',
    addCategory: 'Add',
    english: 'TR',
    menuTitle: 'Menu Title',
    welcomeText: 'Welcome Text',
    footerText: 'Footer Text',
    totalProducts: 'Total Products',
    outOfStockProducts: 'Out of Stock',
    totalCategories: 'Total Categories',
    mostExpensive: 'Most Expensive',
    cheapest: 'Cheapest',
    recentProducts: 'Recent Products',
    categoryDistribution: 'Category Distribution',
    usageStats: 'Usage Statistics',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    views: 'views',
    noViewsYet: 'No data yet',
  }
};

const defaultCategoriesTR = ['Sıcak Kahve', 'Demleme Kahve', 'Soğuk Kahve', 'Sütlü Sıcak', 'Sütlü Soğuk', 'Demleme Siyah Çay', 'Bitki Çayı', 'Taze Meyve Suyu', 'Maden Suyu', 'Meşrubat', 'El Yapımı Tatlılar', 'Tost', 'Sandviç'];
const defaultCategoriesEN = ['Hot Coffee', 'French Press', 'Iced Coffee', 'Iced Latte', 'Hot Latte', 'Black Tea', 'Herbal Tea', 'Fresh Juice', 'Sparkling Water', 'Beverages', 'Handmade Desserts', 'Toast', 'Sandwich'];

export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [categories, setCategories] = useState<string[]>(defaultCategoriesTR);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'settings' | 'categories' | 'analytics'>('products');
  const [viewLogs, setViewLogs] = useState<ViewLog[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [lang, setLang] = useState<Language>('tr');
  
  const t = translations[lang];

  const defaultCategories = lang === 'tr' ? defaultCategoriesTR : defaultCategoriesEN;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: categories[0] || '',
    image_url: '',
    is_available: true,
  });

  const [settingsData, setSettingsData] = useState({
    store_name: '',
    store_description: '',
    store_image: '',
    wifi_password: '',
    instagram: '',
    show_menu_toggle: true,
    language: 'tr',
    menu_title: 'Menümüz',
    welcome_text: 'Rastgeldiniz…',
    footer_text: 'Afiyet olsun…',
  });

  const [bulkData, setBulkData] = useState({
    type: 'percent',
    value: '',
    category: t.all,
  });

  const fetchProducts = async () => {
    if (!supabase.client) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await supabase.client.from('products').select('*').order('created_at', { ascending: false });
      if (data) setProducts(data);
    } catch (error) {
      console.error('Fetch error:', error);
    }
    setLoading(false);
  };

  const fetchViewLogs = async () => {
    if (!supabase.client) return;
    try {
      const { data } = await supabase.client.from('view_logs').select('*').order('timestamp', { ascending: false });
      if (data) setViewLogs(data);
    } catch (error) {
      console.error('View logs error:', error);
    }
  };

  const fetchSettings = async () => {
    if (!supabase.client) return;
    try {
      const { data } = await supabase.client.from('settings').select('*').eq('id', 'store_info').single();
      if (data) {
        setSettings(data);
        setSettingsData({
          store_name: data.store_name || '',
          store_description: data.store_description || '',
          store_image: data.store_image || '',
          wifi_password: data.wifi_password || '',
          instagram: data.instagram || '',
          show_menu_toggle: data.show_menu_toggle ?? true,
          language: data.language || 'tr',
          menu_title: data.menu_title || 'Menümüz',
          welcome_text: data.welcome_text || 'Rastgeldiniz…',
          footer_text: data.footer_text || 'Afiyet olsun…',
        });
        setLang(data.language || 'tr');
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      }
    } catch (error) {
      console.error('Settings error:', error);
    }
  };

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
        fetchSettings();
        fetchViewLogs();
      }
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/admin');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = async () => {
    if (supabase.client) {
      await supabase.client.auth.signOut();
    }
    router.push('/admin');
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    const updatedCategories = [...categories, newCategory.trim()];
    setCategories(updatedCategories);
    if (supabase.client) {
      await supabase.client.from('settings').update({
        categories: updatedCategories,
        updated_at: new Date().toISOString(),
      }).eq('id', 'store_info');
    }
    setNewCategory('');
    setShowCategoryModal(false);
  };

  const handleDeleteCategory = async (categoryToDelete: string) => {
    if (!confirm(`${categoryToDelete} ${t.deleteConfirm}`)) return;
    const updatedCategories = categories.filter(c => c !== categoryToDelete);
    setCategories(updatedCategories);
    if (supabase.client) {
      await supabase.client.from('settings').update({
        categories: updatedCategories,
        updated_at: new Date().toISOString(),
      }).eq('id', 'store_info');
    }
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
    setFormData({ name: '', description: '', price: '', category: categories[0] || '', image_url: '', is_available: true });
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
    if (confirm(t.deleteConfirm)) {
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
    }
    const updatedProducts = products.map(product => {
      if (bulkData.category === t.all || product.category === bulkData.category) {
        const newPrice = bulkData.type === 'percent'
          ? Math.round(product.price * multiplier * 100) / 100
          : product.price + parseFloat(bulkData.value);
        return { ...product, price: newPrice };
      }
      return product;
    });
    if (supabase.client) {
      for (const product of products) {
        if (bulkData.category === t.all || product.category === bulkData.category) {
          const newPrice = bulkData.type === 'percent'
            ? Math.round(product.price * multiplier * 100) / 100
            : product.price + parseFloat(bulkData.value);
          await supabase.client.from('products').update({ price: newPrice }).eq('id', product.id);
        }
      }
    }
    setProducts(updatedProducts);
    setShowBulkModal(false);
  };

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (supabase.client) {
      const { error } = await supabase.client.from('settings').upsert({
        id: 'store_info',
        store_name: settingsData.store_name,
        store_description: settingsData.store_description,
        store_image: settingsData.store_image,
        wifi_password: settingsData.wifi_password,
        instagram: settingsData.instagram,
        show_menu_toggle: settingsData.show_menu_toggle,
        language: lang,
        categories: categories,
        menu_title: settingsData.menu_title,
        welcome_text: settingsData.welcome_text,
        footer_text: settingsData.footer_text,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.error('Save error:', error);
        alert('Kaydetme hatası: ' + error.message);
        return;
      }
    }
    await fetchSettings();
    alert(t.settingsSaved);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#B33F2E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <header className="sticky top-0 z-50 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/classic')} className="p-2 hover:bg-zinc-800 rounded-full">
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </button>
            <h1 className="text-xl font-medium text-white">{t.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
              className="px-3 py-1.5 rounded-lg bg-[#B33F2E] text-white text-sm font-medium"
            >
              {t.english}
            </button>
            <button onClick={handleLogout} className="p-2 hover:bg-zinc-800 rounded-full">
              <LogOut className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>
        
        <div className="flex px-4 pb-3 gap-1.5 justify-center">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 ${activeTab === 'products' ? 'bg-[#B33F2E] text-white' : 'bg-zinc-800 text-zinc-400'}`}
          >
            <Package className="w-3.5 h-3.5" /> {t.products}
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 ${activeTab === 'categories' ? 'bg-[#B33F2E] text-white' : 'bg-zinc-800 text-zinc-400'}`}
          >
            <Store className="w-3.5 h-3.5" /> {t.categories}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 ${activeTab === 'settings' ? 'bg-[#B33F2E] text-white' : 'bg-zinc-800 text-zinc-400'}`}
          >
            <Settings className="w-3.5 h-3.5" /> {t.settings}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 ${activeTab === 'analytics' ? 'bg-[#B33F2E] text-white' : 'bg-zinc-800 text-zinc-400'}`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> {t.analytics}
          </button>
        </div>
      </header>

      <main className="p-4">
        {activeTab === 'products' ? (
          <>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setEditingProduct(null); setFormData({ name: '', description: '', price: '', category: categories[0] || '', image_url: '', is_available: true }); setShowModal(true); }}
                className="flex-1 py-3 rounded-xl bg-[#B33F2E] text-white font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> {t.addProduct}
              </button>
              <button
                onClick={() => setShowBulkModal(true)}
                className="flex-1 py-3 rounded-xl bg-zinc-800 text-white font-medium flex items-center justify-center gap-2"
              >
                <DollarSign className="w-5 h-5" /> {t.updatePrice}
              </button>
            </div>

            <div className="grid gap-3">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  className={`bg-zinc-900 rounded-xl p-3 flex gap-3 ${!product.is_available ? 'opacity-50' : ''}`}
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-white">{product.name}</h3>
                        <p className="text-xs text-zinc-500">{product.category}</p>
                      </div>
                      <span className="text-lg font-medium text-[#B33F2E]">₺{product.price}</span>
                    </div>
                    
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => toggleAvailability(product)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 ${product.is_available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                      >
                        <Package className="w-3 h-3" />
                        {product.is_available ? t.inStock : t.outOfStock}
                      </button>
                      <button onClick={() => handleEdit(product)} className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
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
                <p className="text-zinc-500">{t.noProducts}</p>
              </div>
            )}
          </>
        ) : activeTab === 'categories' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-white">{t.categories} ({categories.length})</h3>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="px-4 py-2 rounded-lg bg-[#B33F2E] text-white text-sm font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> {t.addCategory}
              </button>
            </div>

            <div className="grid gap-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center justify-between bg-zinc-900 rounded-lg p-3">
                  <span className="text-white">{category}</span>
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'analytics' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-[#B33F2E]" />
                  <span className="text-xs text-zinc-500">{t.totalProducts}</span>
                </div>
                <p className="text-2xl font-medium text-white">{products.length}</p>
              </div>
              <div className="bg-zinc-900 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-zinc-500">{t.outOfStockProducts}</span>
                </div>
                <p className="text-2xl font-medium text-white">{products.filter(p => !p.is_available).length}</p>
              </div>
              <div className="bg-zinc-900 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Store className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-zinc-500">{t.totalCategories}</span>
                </div>
                <p className="text-2xl font-medium text-white">{categories.length}</p>
              </div>
              {products.length > 0 && (() => {
                const sorted = [...products].sort((a, b) => b.price - a.price);
                return (
                  <div className="bg-zinc-900 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-orange-400" />
                      <span className="text-xs text-zinc-500">{t.mostExpensive}</span>
                    </div>
                    <p className="text-sm font-medium text-white truncate">{sorted[0].name}</p>
                    <p className="text-lg font-medium text-[#B33F2E]">₺{sorted[0].price}</p>
                  </div>
                );
              })()}
              {products.length > 0 && (() => {
                const sorted = [...products].sort((a, b) => a.price - b.price);
                return (
                  <div className="bg-zinc-900 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-zinc-500">{t.cheapest}</span>
                    </div>
                    <p className="text-sm font-medium text-white truncate">{sorted[0].name}</p>
                    <p className="text-lg font-medium text-[#B33F2E]">₺{sorted[0].price}</p>
                  </div>
                );
              })()}
            </div>

            <div className="bg-zinc-900 rounded-xl p-4">
              <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" /> {t.categoryDistribution}
              </h3>
              <div className="space-y-2">
                {categories.map(cat => {
                  const count = products.filter(p => p.category === cat).length;
                  const maxCount = Math.max(...categories.map(c => products.filter(p => p.category === c).length), 1);
                  const width = (count / maxCount) * 100;
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="text-xs text-zinc-400 w-24 truncate">{cat}</span>
                      <div className="flex-1 bg-zinc-800 rounded-full h-2">
                        <div className="bg-[#B33F2E] h-2 rounded-full transition-all" style={{ width: `${width}%` }} />
                      </div>
                      <span className="text-xs text-zinc-500 w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-zinc-900 rounded-xl p-4">
              <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" /> {t.usageStats}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-zinc-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-zinc-500 mb-1">{t.today}</p>
                  <p className="text-xl font-medium text-[#B33F2E]">{viewLogs.filter(v => v.date === new Date().toISOString().split('T')[0]).length}</p>
                  <p className="text-xs text-zinc-600">{t.views}</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-zinc-500 mb-1">{t.thisWeek}</p>
                  <p className="text-xl font-medium text-[#B33F2E]">{(() => {
                    const weekStart = new Date();
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                    return viewLogs.filter(v => new Date(v.date) >= weekStart).length;
                  })()}</p>
                  <p className="text-xs text-zinc-600">{t.views}</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-zinc-500 mb-1">{t.thisMonth}</p>
                  <p className="text-xl font-medium text-[#B33F2E]">{(() => {
                    const monthStart = new Date();
                    monthStart.setDate(1);
                    return viewLogs.filter(v => new Date(v.date) >= monthStart).length;
                  })()}</p>
                  <p className="text-xs text-zinc-600">{t.views}</p>
                </div>
              </div>
              {viewLogs.length === 0 && (
                <p className="text-center text-zinc-500 text-sm mt-3">{t.noViewsYet}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-zinc-900 rounded-xl p-4">
              <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                <Store className="w-5 h-5" /> {t.storeInfo}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-500">{t.storeName}</label>
                  <input
                    type="text"
                    value={settingsData.store_name}
                    onChange={(e) => setSettingsData({ ...settingsData, store_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-zinc-500">{t.description}</label>
                  <textarea
                    value={settingsData.store_description}
                    onChange={(e) => setSettingsData({ ...settingsData, store_description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white resize-none"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-zinc-500">{t.storeImage}</label>
                  <input
                    type="url"
                    value={settingsData.store_image}
                    onChange={(e) => setSettingsData({ ...settingsData, store_image: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-zinc-500">{t.wifiPassword}</label>
                  <input
                    type="text"
                    value={settingsData.wifi_password}
                    onChange={(e) => setSettingsData({ ...settingsData, wifi_password: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-500">{t.instagram}</label>
                  <input
                    type="url"
                    value={settingsData.instagram}
                    onChange={(e) => setSettingsData({ ...settingsData, instagram: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
                  />
                </div>

                <div className="border-t border-zinc-700 pt-3 mt-3">
                  <h4 className="text-sm font-medium text-zinc-400 mb-3">{t.menuTitle}</h4>
                  
                  <div className="mb-3">
                    <label className="text-xs text-zinc-500">{t.menuTitle}</label>
                    <input
                      type="text"
                      value={settingsData.menu_title}
                      onChange={(e) => setSettingsData({ ...settingsData, menu_title: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="text-xs text-zinc-500">{t.welcomeText}</label>
                    <input
                      type="text"
                      value={settingsData.welcome_text}
                      onChange={(e) => setSettingsData({ ...settingsData, welcome_text: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-zinc-500">{t.footerText}</label>
                    <input
                      type="text"
                      value={settingsData.footer_text}
                      onChange={(e) => setSettingsData({ ...settingsData, footer_text: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSettingsSave}
                  className="w-full py-3 rounded-xl bg-[#B33F2E] text-white font-medium"
                >
                  {t.save}
                </button>
              </div>
            </div>
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
                <h2 className="text-xl font-medium text-white">
                  {editingProduct ? t.update : t.addProduct}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-zinc-800 rounded-full">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="text" placeholder={t.productName} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white" required />
                <textarea placeholder={t.description} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white resize-none" rows={2} />
                <input type="number" placeholder={t.price} value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white" required />
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white">
                  {categories.map((cat) => (<option key={cat} value={cat} className="bg-zinc-900">{cat}</option>))}
                </select>
                <input type="url" placeholder={t.imageUrl} value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white" />
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setFormData({ ...formData, is_available: !formData.is_available })} className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.is_available ? 'bg-green-500' : 'bg-zinc-600'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${formData.is_available ? 'translate-x-6' : ''}`} />
                  </div>
                  <span className="text-sm text-zinc-400">{t.inStock2}</span>
                </label>
                <button type="submit" className="w-full py-3 rounded-xl bg-[#B33F2E] text-white font-medium">
                  {editingProduct ? t.update : t.add}
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
                <h2 className="text-xl font-medium text-white">{t.bulkPrice}</h2>
                <button onClick={() => setShowBulkModal(false)} className="p-2 hover:bg-zinc-800 rounded-full">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <form onSubmit={handleBulkUpdate} className="space-y-3">
                <div className="flex gap-2">
                  <button type="button" onClick={() => setBulkData({ ...bulkData, type: 'percent' })} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${bulkData.type === 'percent' ? 'bg-[#B33F2E] text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                    <Percent className="w-4 h-4" /> %
                  </button>
                  <button type="button" onClick={() => setBulkData({ ...bulkData, type: 'fixed' })} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${bulkData.type === 'fixed' ? 'bg-[#B33F2E] text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                    <DollarSign className="w-4 h-4" /> TL
                  </button>
                </div>
                <input type="number" placeholder={bulkData.type === 'percent' ? `${t.percent}` : 'TL'} value={bulkData.value} onChange={(e) => setBulkData({ ...bulkData, value: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white" required />
                <select value={bulkData.category} onChange={(e) => setBulkData({ ...bulkData, category: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white">
                  <option value={t.all} className="bg-zinc-900">{t.allCategories}</option>
                  {categories.map((cat) => (<option key={cat} value={cat} className="bg-zinc-900">{cat}</option>))}
                </select>
                <button type="submit" className="w-full py-3 rounded-xl bg-[#B33F2E] text-white font-medium">
                  {t.apply}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCategoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-zinc-900 rounded-2xl w-full max-w-sm p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium text-white">{t.newCategory}</h2>
                <button onClick={() => setShowCategoryModal(false)} className="p-2 hover:bg-zinc-800 rounded-full">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleAddCategory(); }} className="space-y-3">
                <input type="text" placeholder={t.categoryName} value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white" required />
                <button type="submit" className="w-full py-3 rounded-xl bg-[#B33F2E] text-white font-medium">
                  {t.add}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
