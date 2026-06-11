import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Header } from '../../Header/ui/Header';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col">
      {!isAdmin && <Header />}
      
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={isAdmin ? "h-screen" : "flex-1"}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {!isAdmin && (
        <footer className="py-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-[10px] font-black">R</div>
                <span className="font-black tracking-tight">You Have Been Reborn</span>
              </div>
              <p className="text-xs text-slate-400 font-medium max-w-xs">
                The ultimate community wiki for the Reborn universe. All data is static and community-driven.
              </p>
            </div>
            
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
               <a href="#" className="hover:text-blue-500 transition-colors">GitHub</a>
               <a href="#" className="hover:text-blue-500 transition-colors">Discord</a>
               <a href="#" className="hover:text-blue-500 transition-colors">Terms</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
