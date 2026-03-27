'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Info, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const themeParam = searchParams.get('theme');
  const isClassic = pathname === '/classic' || themeParam === 'classic';
  const isInfo = pathname.includes('/info');

  const [showMenuToggle, setShowMenuToggle] = useState(true);
  const [language, setLanguage] = useState('tr');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      if (supabase.client) {
        const { data } = await supabase.client
          .from('settings')
          .select('show_menu_toggle, language')
          .eq('id', 'store_info')
          .single();
        
        if (data) {
          setShowMenuToggle(data.show_menu_toggle ?? true);
          setLanguage(data.language || 'tr');
        }
      }
    } catch (error) {
      // default values
    }
  };

  const toggleLanguage = async () => {
    const newLang = language === 'tr' ? 'en' : 'tr';
    setLanguage(newLang);
    
    if (supabase.client) {
      await supabase.client.from('settings').update({
        language: newLang,
        updated_at: new Date().toISOString(),
      }).eq('id', 'store_info');
    }
    
    router.refresh();
  };

  const handleInfoClick = () => {
    if (isClassic || themeParam === 'classic') {
      router.push('/info?theme=classic');
    } else {
      router.push('/info');
    }
  };

  const handleBack = () => {
    if (themeParam === 'classic') {
      router.push('/classic');
    } else {
      router.push('/classic');
    }
  };

  // Classic menu header
  if (isClassic && !isInfo) {
    return (
      <header className="sticky top-0 z-50 bg-[#f4ecd8]/95 border-b border-[#8b7355]">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-3xl font-serif text-[#3d2914] tracking-[0.3em]">RAST</h1>
          
          <div className="flex items-center gap-2">
            {showMenuToggle && (
              <button
                onClick={handleInfoClick}
                className="p-2 rounded-full bg-[#3d2914] text-[#f4ecd8]"
              >
                <Info className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Modern menu header
  if (!isClassic && !isInfo) {
    return (
      <header className="sticky top-0 z-50 bg-[#1a1a1a] border-b border-[#333]">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-4xl font-black tracking-[0.15em]">RAST</h1>
          
          <div className="flex items-center gap-2">
            {showMenuToggle && (
              <button
                onClick={handleInfoClick}
                className="p-2 rounded-full bg-[#333] text-white hover:bg-[#444] border border-[#444]"
              >
                <Info className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Info pages
  return (
    <header className={isClassic ? 'sticky top-0 z-50 bg-[#f4ecd8]/95 border-b border-[#8b7355]' : 'sticky top-0 z-50 bg-[#1a1a1a] border-b border-[#333]'}>
      <div className="flex items-center justify-between px-4 py-3">
        <button 
          onClick={handleBack} 
          className={`text-sm font-medium ${isClassic ? 'font-serif text-[#3d2914]' : 'text-white'}`}
        >
          ← Geri
        </button>
        
        {isClassic ? (
          <h1 className="text-2xl font-serif text-[#3d2914] tracking-[0.2em]">RAST</h1>
        ) : (
          <h1 className="text-2xl font-bold tracking-[0.15em]">RAST</h1>
        )}
        
        <div className="w-16" />
      </div>
    </header>
  );
}
