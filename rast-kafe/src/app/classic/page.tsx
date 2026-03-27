'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const Header = dynamic(() => import('@/components/Header'), { ssr: false });

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

type Settings = {
  menu_title: string;
  welcome_text: string;
  footer_text: string;
  store_name: string;
  categories: string[];
};

const defaultCategories = ['Tümü', 'Sıcak Kahve', 'Demleme Kahve', 'Soğuk Kahve', 'Sütlü Sıcak', 'Sütlü Soğuk', 'Demleme Siyah Çay', 'Bitki Çayı', 'Taze Meyve Suyu', 'Maden Suyu', 'Meşrubat', 'El Yapımı Tatlılar', 'Tost', 'Sandviç'];

export default function ClassicPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>({
    menu_title: 'Menümüz',
    welcome_text: 'Rastgeldiniz…',
    footer_text: 'Afiyet olsun…',
    store_name: 'RAST Kafe',
    categories: defaultCategories,
  });
  const [loading, setLoading] = useState(true);

  const trackView = async () => {
    if (supabase.client) {
      const now = new Date();
      const dayKey = now.toISOString().split('T')[0];
      const viewData = {
        date: dayKey,
        timestamp: now.toISOString(),
        path: '/classic',
      };
      try {
        await supabase.client.from('view_logs').insert(viewData);
      } catch (e) {}
    }
  };

  const fetchProducts = async () => {
    try {
      if (supabase.client) {
        const { data } = await supabase.client
          .from('products')
          .select('*');
        
        if (data) setProducts(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const fetchSettings = async () => {
    try {
      if (supabase.client) {
        const { data } = await supabase.client
          .from('settings')
          .select('menu_title, welcome_text, footer_text, store_name, categories')
          .eq('id', 'store_info')
          .single();
        
        if (data) {
          setSettings({
            menu_title: data.menu_title || 'Menümüz',
            welcome_text: data.welcome_text || 'Rastgeldiniz…',
            footer_text: data.footer_text || 'Afiyet olsun…',
            store_name: data.store_name || 'RAST Kafe',
            categories: data.categories?.length ? ['Tümü', ...data.categories] : defaultCategories,
          });
          if (data.categories?.length) {
            setSelectedCategory('Tümü');
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSettings();
    trackView();
  }, []);

  const categories = settings.categories;
  const filteredProducts = products.filter(product => {
    return selectedCategory === 'Tümü' || product.category === selectedCategory;
  });

  const groupedProducts = filteredProducts.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4ecd8]">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="w-8 h-8 border-4 border-amber-800 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4ecd8] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      <Header />

      <main className="p-4 pb-8">
        <div className="max-w-2xl mx-auto border-[12px] border-[#5c4a32] rounded-lg shadow-2xl bg-[#f4ecd8]">
          <div className="p-6">
            <div className="text-center mb-8 pb-4 border-b-2 border-[#8b7355]">
              <h2 className="text-3xl font-serif text-[#3d2914] tracking-widest uppercase">{settings.menu_title}</h2>
              <p className="text-[#8b7355] font-serif italic mt-2">{settings.welcome_text}</p>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-serif whitespace-nowrap transition-all
                    ${selectedCategory === category 
                      ? 'bg-[#3d2914] text-[#f4ecd8]' 
                      : 'bg-[#d4c4a8] text-[#5c4a32] hover:bg-[#c4b498]'}
                  `}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="space-y-8">
              {Object.entries(groupedProducts).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-xl font-serif text-[#3d2914] border-b border-[#8b7355] pb-2 mb-4">
                    {category}
                  </h3>
                  
                  <div className="space-y-4">
                    {items.map((product) => (
                      <div 
                        key={product.id} 
                        className={`${!product.is_available ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-baseline">
                          <span className="font-serif text-[#3d2914] text-lg">
                            {product.name}
                          </span>
                          {!product.is_available && (
                            <span className="ml-2 text-xs text-red-600 font-serif">(Tükendi)</span>
                          )}
                          <span className="flex-1 border-b border-dotted border-[#8b7355] mx-2 -mt-1"></span>
                          <span className="font-serif text-[#3d2914] font-bold text-lg">
                            ₺{product.price}
                          </span>
                        </div>
                        {product.description && (
                          <p className="font-serif text-[#8b7355] text-sm mt-1 italic">
                            {product.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="font-serif text-[#8b7355]">Bu kategoride ürün bulunmamaktadır.</p>
              </div>
            )}

            <div className="mt-12 pt-4 border-t border-[#8b7355] text-center">
              <p className="font-serif text-[#8b7355] text-sm italic">
                {settings.footer_text}
              </p>
              <p className="font-serif text-[#8b7355] text-xs mt-2">
                {settings.store_name}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
