import { Link } from "react-router-dom";
import { Hero } from "../widgets/Hero/ui/Hero";
import { CategoryGrid } from "../widgets/CategoryGrid/ui/CategoryGrid";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <CategoryGrid />

      {import.meta.env.DEV && (
        <section className="max-w-7xl mx-auto px-4 mb-20 w-full">
          <Link
            to="/admin"
            className="block p-12 bg-slate-900 dark:bg-white rounded-[3rem] text-center group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <h4 className="text-white dark:text-slate-900 text-2xl font-black mb-2 relative z-10">
              Access Content Editor
            </h4>
            <p className="text-slate-400 dark:text-slate-500 font-medium relative z-10">
              Contribute to the wiki and manage data directly from your browser.
            </p>
          </Link>
        </section>
      )}
    </div>
  );
}
