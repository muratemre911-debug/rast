'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Info } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const themeParam = searchParams.get('theme');
  const isClassic = pathname === '/classic' || themeParam === 'classic';
  const isInfo = pathname.includes('/info');

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
      router.push('/');
    }
  };

  // Classic menu header
  if (isClassic && !isInfo) {
    return (
      <header className="sticky top-0 z-50 bg-[#f4ecd8]/95 border-b border-[#8b7355]">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-3xl font-serif text-[#3d2914] tracking-[0.3em]">RAST</h1>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleInfoClick}
              className="p-2 rounded-full bg-[#3d2914] text-[#f4ecd8]"
            >
              <Info className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 rounded-full text-sm font-medium bg-[#3d2914] text-[#f4ecd8] font-serif hover:bg-[#2d1a0a] border border-[#8b7355]"
            >
              Modern Menü ▸
            </button>
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
            <button
              onClick={handleInfoClick}
              className="p-2 rounded-full bg-[#333] text-white hover:bg-[#444] border border-[#444]"
            >
              <Info className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/classic')}
              className="px-4 py-2 rounded-full text-sm font-medium bg-[#333] text-white hover:bg-[#444] border border-[#444]"
            >
              Klasik Menü ▸
            </button>
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
