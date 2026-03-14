'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Zap, Cake, Sandwich, Grid, Snowflake } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

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

const categoryIcons: Record<string, React.ReactNode> = {
  'Tümü': <Grid className="w-4 h-4" />,
  'Sıcak Kahveler': <Coffee className="w-4 h-4" />,
  'Soğuk İçecekler': <Snowflake className="w-4 h-4" />,
  'Tatlılar': <Cake className="w-4 h-4" />,
  'Sandviçler': <Sandwich className="w-4 h-4" />,
};

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      if (supabase.client) {
        const { data, error } = await supabase.client
          .from('products')
          .select('*')
          .order('category', { ascending: true });
        
        if (data) setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setLoading(false);
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'Tümü' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#B33F2E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] pb-20">
      <Header />

      <main className="px-4 pt-4">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                ${selectedCategory === category 
                  ? 'bg-[#B33F2E] text-white' 
                  : 'bg-[#333] text-zinc-400 hover:bg-[#444]'}
              `}
            >
              {categoryIcons[category]}
              {category}
            </button>
          ))}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500">Henüz ürün eklenmemiş</p>
          </div>
        ) : (
          <div className="grid gap-3">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    card p-3 flex gap-4
                    ${!product.is_available ? 'opacity-50' : ''}
                  `}
                >
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={product.image_url || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop'} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {!product.is_available && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-xs font-bold text-red-500 uppercase">Tükendi</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-semibold text-lg text-white truncate">{product.name}</h3>
                      <p className="text-sm text-zinc-400 line-clamp-2">{product.description}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">{product.category}</span>
                      <span className="text-xl font-bold text-[#B33F2E]">
                        ₺{product.price}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {filteredProducts.length === 0 && products.length > 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-500">Bu kategoride ürün bulunamadı</p>
          </div>
        )}
      </main>
    </div>
  );
}
