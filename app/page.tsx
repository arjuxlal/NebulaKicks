import Hero from "@/components/Hero";
import ProductFeed from "@/components/ProductFeed";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <Hero />

      {/* Product Feed Section */}
      <section className="bg-deep-dark py-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
            <div>
              <h2 className="text-5xl font-orbitron font-bold">LATEST <span className="text-ultraviolet glow-text-purple">DROPS</span></h2>
              <p className="text-white/40 mt-2 font-inter">Limited edition cyber-sneakers for the digital frontier.</p>
            </div>
            <button className="neon-button-cyan py-2 text-sm">VIEW ALL COLLECTIONS</button>
          </div>

          <ProductFeed />
        </div>
      </section>

      {/* Footer / About Section */}
      <footer className="py-20 border-t border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 font-inter">
          <div className="col-span-2 space-y-6">
            <h3 className="text-2xl font-orbitron font-bold text-neon-cyan">NEBULA KICKS</h3>
            <p className="text-white/50 max-w-sm">
              Pushing the boundaries of footwear design. We blend high-performance materials
              with cyberpunk aesthetics to create sneakers that exist outside of time.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold">LINKS</h4>
            <ul className="text-white/40 space-y-2">
              <li><a href="#" className="hover:text-neon-cyan">Our Mission</a></li>
              <li><a href="#" className="hover:text-neon-cyan">Sustainability</a></li>
              <li><a href="#" className="hover:text-neon-cyan">Technology</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold">SUPPORT</h4>
            <ul className="text-white/40 space-y-2">
              <li><a href="#" className="hover:text-neon-cyan">Shipping</a></li>
              <li><a href="#" className="hover:text-neon-cyan">Returns</a></li>
              <li><a href="#" className="hover:text-neon-cyan">Contact</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </main>
  );
}
