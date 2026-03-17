'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Wifi, Instagram } from 'lucide-react';

const Header = dynamic(() => import('@/components/Header'), { ssr: false });

type Settings = {
  store_name: string;
  store_description: string;
  store_image: string;
  wifi_password: string;
  instagram: string;
  accent_color: string;
};

function InfoContent() {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const isClassic = theme === 'classic';
  
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      if (supabase.client) {
        const { data } = await supabase.client
          .from('settings')
          .select('*')
          .eq('id', 'store_info')
          .single();
        
        if (data) setSettings(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isClassic ? 'bg-[#f4ecd8]' : 'bg-[#1a1a1a]'}`}>
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className={`w-8 h-8 border-2 ${isClassic ? 'border-[#3d2914]' : 'border-[#B33F2E]'} border-t-transparent rounded-full animate-spin`} />
        </div>
      </div>
    );
  }

  if (isClassic) {
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
              {settings?.store_image && (
                <div className="w-full h-40 rounded-lg overflow-hidden mb-4">
                  <img 
                    src={settings.store_image} 
                    alt={settings.store_name || 'Dükkan'}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="text-center mb-6 pb-4 border-b-2 border-[#8b7355]">
                <h1 className="text-3xl font-serif text-[#3d2914] tracking-widest uppercase">
                  {settings?.store_name || 'RAST'}
                </h1>
                {settings?.store_description && (
                  <p className="text-[#8b7355] font-serif italic mt-2">{settings.store_description}</p>
                )}
              </div>

              {settings?.wifi_password && (
                <div className="bg-[#e8dcc8] rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#3d2914] flex items-center justify-center">
                      <Wifi className="w-5 h-5 text-[#f4ecd8]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-[#8b7355] font-serif">WiFi Şifresi</p>
                      <p className="text-lg font-bold font-serif text-[#3d2914]">{settings.wifi_password}</p>
                    </div>
                  </div>
                </div>
              )}

              {settings?.instagram && (
                <a 
                  href={settings.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#e8dcc8] rounded-lg p-4 mb-4 flex items-center gap-3 hover:opacity-80"
                >
                  <div className="w-10 h-10 rounded-full bg-[#3d2914] flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-[#f4ecd8]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#8b7355] font-serif">Instagram</p>
                    <p className="text-lg font-bold font-serif text-[#3d2914]">Takip Et</p>
                  </div>
                </a>
              )}

              <div className="mt-8 pt-4 border-t border-[#8b7355] text-center">
                <p className="font-serif text-[#8b7355] text-sm italic">
                  Afiyet olsun...
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Modern theme
  return (
    <div className="min-h-screen bg-[#1a1a1a] pb-20">
      <Header />

      <main className="px-4 pt-4">
        {settings?.store_image && (
          <div className="w-full h-48 rounded-xl overflow-hidden mb-4">
            <img 
              src={settings.store_image} 
              alt={settings.store_name || 'Dükkan'}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="card p-4">
          <h1 className="text-2xl font-bold text-white mb-2">
            {settings?.store_name || 'RAST'}
          </h1>
          {settings?.store_description && (
            <p className="text-zinc-400 mb-4">{settings.store_description}</p>
          )}
        </div>

        {settings?.wifi_password && (
          <div className="card p-4 mt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#B33F2E]/20 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-[#B33F2E]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-zinc-500">WiFi Şifresi</p>
                <p className="text-lg font-bold text-white">{settings.wifi_password}</p>
              </div>
            </div>
          </div>
        )}

        {settings?.instagram && (
          <a 
            href={settings.instagram} 
            target="_blank" 
            rel="noopener noreferrer"
            className="card p-4 mt-4 flex items-center gap-3 hover:bg-zinc-800"
          >
            <div className="w-10 h-10 rounded-full bg-[#B33F2E]/20 flex items-center justify-center">
              <Instagram className="w-5 h-5 text-[#B33F2E]" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-zinc-500">Instagram</p>
              <p className="text-lg font-bold text-white">Takip Et</p>
            </div>
          </a>
        )}
      </main>
    </div>
  );
}

export default function InfoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#B33F2E] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <InfoContent />
    </Suspense>
  );
}
