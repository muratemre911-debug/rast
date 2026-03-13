'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isClassic = pathname === '/classic';

  return (
    <header className={isClassic ? 'sticky top-0 z-50 bg-[#f4ecd8]/95 border-b border-[#8b7355]' : 'sticky top-0 z-50 glass'}>
      <div className="flex items-center justify-between px-4 py-3">
        {isClassic ? (
          <h1 className="text-3xl font-serif text-[#3d2914] tracking-[0.3em]">RAST</h1>
        ) : (
          <h1 className="text-3xl font-bold tracking-[0.3em] text-rast-neon neon-text">RAST</h1>
        )}
        
        <button
          onClick={() => router.push(isClassic ? '/' : '/classic')}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
            ${isClassic 
              ? 'bg-[#3d2914] text-[#f4ecd8] font-serif hover:bg-[#2d1a0a] border border-[#8b7355]' 
              : 'bg-rast-neon text-black neon-glow'}
          `}
        >
          {isClassic ? '◂ Modern Menü' : 'Klasik Menü ▸'}
        </button>
      </div>
    </header>
  );
}
