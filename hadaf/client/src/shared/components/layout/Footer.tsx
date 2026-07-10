import { Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="py-8 border-t border-gray-200 dark:border-gray-800/50 mt-auto">
      <div className="container mx-auto px-6 text-center">
        
        <div className="flex flex-col items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-600">
          <div className="flex items-center gap-1.5">
            <span>Developed with</span>
            <Heart size={10} className="text-red-500 fill-current animate-pulse" />
            <span>by</span>
          </div>
          
          <div className="flex items-center gap-4 font-semibold text-gray-600 dark:text-gray-400">
            <a href="#" className="hover:text-brand-600 transition-colors">Mostafa Elmoalem</a>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
            <a href="#" className="hover:text-brand-600 transition-colors">Backend Developer</a>
          </div>

          <div className="mt-2 text-[10px] uppercase tracking-widest opacity-60">
            © 2025 Impulse Project. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};