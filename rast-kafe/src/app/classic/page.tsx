'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
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

const categories = ['Tümü', 'Sıcak Kahveler', 'Soğuk İçecekler', 'Tatlılar', 'Sandviçler'];

export default function ClassicPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      if (supabase.client) {
        const { data } = await supabase.client
          .from('products')
          .select('*')
          .order('category', { ascending: true });
        
        if (data) setProducts(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

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
              <h2 className="text-3xl font-serif text-[#3d2914] tracking-widest uppercase">Menümüz</h2>
              <p className="text-[#8b7355] font-serif italic mt-2">Rastgeldiniz...</p>
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
                Afiyet olsun...
              </p>
              <p className="font-serif text-[#8b7355] text-xs mt-2">
                RAST Kafe • Rastgeldiniz...
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
