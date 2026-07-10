import { Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="py-8 border-t border-gray-200 dark:border-gray-800/50 mt-auto">
      <div className="container mx-auto px-6 text-center">

        <div className="flex flex-col items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-600">
          <div className="flex items-center gap-1.5">
            <span>Developed with</span>
            <Heart size={10} className="text-red-500 fill-current animate-pulse" />
            <span>by the Hadaf team</span>
          </div>

          <div className="mt-2 text-[10px] uppercase tracking-widest opacity-60">
            © 2025 Hadaf (هدف). All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};