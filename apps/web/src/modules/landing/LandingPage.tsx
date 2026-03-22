import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Cpu, Printer, Palette, Box, CheckCircle2, Star, HelpCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import MotionPage, { revealUp, staggerContainer } from '@/components/shared/MotionWrapper';

export default function LandingPage() {
  return (
    <MotionPage>
      <div className="flex flex-col min-h-screen">
        {/* Navbar */}
        <header className="sticky top-0 z-50 glass h-16 flex items-center px-6 md:px-12 justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="p-2 rounded-lg bg-primary group-hover:rotate-12 transition-transform">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-lg tracking-tight">SETYA ABADI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-muted-foreground">
            <a href="#services" className="hover:text-primary transition-colors">Layanan</a>
            <a href="#advantages" className="hover:text-primary transition-colors">Keunggulan</a>
            <a href="#order" className="hover:text-primary transition-colors">Cara Pesan</a>
            <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Mulai Sekarang</Button>
            </Link>
          </div>
        </header>

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative py-20 md:py-32 overflow-hidden pcb-grid">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50" />
            <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="inline-block p-1 px-3 mb-6 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest animate-pulse-soft"
              >
                PROSES CEPAT • HASIL RAPI • HARGA BERSAHABAT
              </motion.div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-foreground mb-6 leading-tight">
                Jasa Cetak PCB <br />
                <span className="text-primary italic">Cepat & Rapi</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-medium">
                Wujudkan desain circuit board Anda dengan kualitas pabrikan. 
                Setya Abadi Elektronik membantu engineer, mahasiswa, dan hobiis 
                membangun perangkat elektronik berkualitas tinggi.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register">
                  <Button size="lg" className="shadow-lg shadow-primary/25 group">
                    Buat Pesanan Baru
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/login">
                    <Button variant="outline" size="lg">Lihat Status Order</Button>
                </Link>
              </div>
            </div>

            {/* Slow Floating Elements Mockup */}
            <motion.div 
              animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" 
            />
            <motion.div 
              animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-1/4 -right-10 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" 
            />
          </section>

          {/* Services Section */}
          <section id="services" className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-6">
              <div className="text-center mb-16">
                 <h2 className="text-3xl font-black mb-4">Layanan Unggulan Kami</h2>
                 <p className="text-muted-foreground">Solusi lengkap untuk kebutuhan prototyping hingga produksi elektronik.</p>
              </div>
              <motion.div 
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="grid md:grid-cols-3 gap-8"
              >
                 {[
                   { title: 'Cetak PCB', desc: 'Produksi PCB Single & Double layer dengan finishing premium.', icon: Printer, status: 'Active', color: 'bg-primary' },
                   { title: 'Design PCB', desc: 'Konsultasi dan jasa routing layout PCB profesional.', icon: Palette, status: 'Coming Soon', color: 'bg-secondary' },
                   { title: 'Assembly PCB', desc: 'Pemasangan komponen (PCBA) SMD dan Through-hole.', icon: Box, status: 'Coming Soon', color: 'bg-accent' },
                 ].map((service, i) => (
                   <Card key={i} className="group border-slate-100 overflow-hidden">
                      <div className={`h-2 w-full ${service.color}`} />
                      <CardHeader>
                        <div className={`w-12 h-12 rounded-xl ${service.color}/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                           <service.icon className={`w-6 h-6 ${service.color.replace('bg-', 'text-')}`} />
                        </div>
                        <CardTitle className="flex items-center justify-between">
                          {service.title}
                          {service.status !== 'Active' && <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-muted-foreground">{service.status}</span>}
                        </CardTitle>
                        <CardDescription>{service.desc}</CardDescription>
                      </CardHeader>
                   </Card>
                 ))}
              </motion.div>
            </div>
          </section>

          {/* Advantages Section */}
          <section id="advantages" className="py-24 bg-background">
            <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
               <motion.div {...revealUp}>
                  <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">Mengapa Memilih <br />Setya Abadi Elektronik?</h2>
                  <div className="space-y-6">
                     {[
                       { title: 'Kualitas Industri', text: 'Menggunakan standard design rules fabrikasi modern.' },
                       { title: 'Proses Cepat', text: 'Waktu pengerjaan efisien sesuai kebutuhan deadline Anda.' },
                       { title: 'Tracking Real-time', text: 'Pantau status produksi PCB Anda melalui dashboard eksklusif.' },
                     ].map((adv, i) => (
                       <div key={i} className="flex gap-4 group">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center mt-1 group-hover:bg-primary transition-colors">
                             <CheckCircle2 className="w-4 h-4 text-primary group-hover:text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">{adv.title}</h4>
                            <p className="text-sm text-muted-foreground">{adv.text}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </motion.div>
               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 className="relative"
               >
                  <div className="aspect-video bg-emerald-100/30 border-2 border-primary/20 rounded-3xl overflow-hidden shadow-2xl">
                     <img src="https://picsum.photos/800/600?random=1" className="w-full h-full object-cover mix-blend-multiply opacity-80" alt="PCB" />
                  </div>
               </motion.div>
            </div>
          </section>

          {/* Ordering Flow */}
          <section id="order" className="py-24 bg-white">
            <div className="max-w-5xl mx-auto px-6">
              <div className="text-center mb-16">
                 <h2 className="text-3xl font-black mb-4">Otomatisasi Alur Pesanan</h2>
                 <p className="text-muted-foreground">Hanya 3 langkah mudah untuk mewujudkan PCB Anda.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-12 relative">
                 <div className="hidden md:block absolute top-[22px] left-0 w-full h-0.5 bg-slate-100 -z-0" />
                 {[
                   { step: '01', title: 'Upload File', desc: 'Unggah file Gerber atau skematik di dashboard kami.' },
                   { step: '02', title: 'Verifikasi', desc: 'Tim admin meninjau spesifikasi dan memberikan quote.' },
                   { step: '03', title: 'Produksi', desc: 'Pembayaran valid, PCB langsung naik mesin produksi.' },
                 ].map((flow, i) => (
                   <motion.div key={i} {...revealUp} transition={{ delay: i * 0.2 }} className="relative z-10 text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-white border-4 border-slate-50 shadow-md flex items-center justify-center mx-auto text-primary font-black">
                        {flow.step}
                      </div>
                      <h4 className="font-bold text-lg">{flow.title}</h4>
                      <p className="text-sm text-muted-foreground">{flow.desc}</p>
                   </motion.div>
                 ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-24 bg-background overflow-hidden relative">
            <div className="max-w-4xl mx-auto px-6">
               <div className="flex justify-center mb-8 gap-1">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 fill-primary text-primary" />)}
               </div>
               <motion.div className="text-center italic text-xl md:text-2xl font-medium text-slate-700 leading-relaxed mb-8">
                  "Hasil cetaknya rapi banget, traces jelas dan mask-nya presisi. 
                  Adminnya juga responsif pas aku nanya soal clearance. Recommended untuk prototyping!"
               </motion.div>
               <div className="text-center">
                  <span className="font-black text-foreground">Andrian Putro</span>
                  <span className="text-muted-foreground text-sm ml-2">— Embedded Engineer @ IoT Solutions</span>
               </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="py-24 bg-white">
            <div className="max-w-3xl mx-auto px-6">
              <h2 className="text-3xl font-black mb-12 text-center">Tanya Jawab (FAQ)</h2>
              <div className="space-y-4">
                 {[
                   { q: 'Berapa hari waktu pengerjaan?', a: 'Standard pengerjaan prototyping adalah 3-5 hari kerja tergantung antrian.' },
                   { q: 'Bisa cetak custom shape?', a: 'Ya, kami mendukung pemotongan custom dengan routing mesin CNC.' },
                   { q: 'Apakah ada minimum order?', a: 'Untuk prototyping kami melayani mulai dari 5 keping per desain.' },
                 ].map((faq, i) => (
                   <details key={i} className="group border rounded-2xl overflow-hidden transition-all duration-300 open:shadow-md">
                      <summary className="flex items-center justify-between p-6 cursor-pointer font-bold bg-white hover:bg-slate-50 transition-colors">
                        {faq.q}
                        <HelpCircle className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="p-6 pt-0 text-sm text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-2">
                        {faq.a}
                      </div>
                   </details>
                 ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="p-4 sm:p-12 lg:p-24">
             <motion.div 
               {...revealUp}
               className="max-w-6xl mx-auto rounded-[3rem] bg-gradient-to-br from-primary to-secondary p-12 text-center text-white shadow-2xl shadow-primary/30 relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="relative z-10">
                   <h2 className="text-3xl lg:text-5xl font-black mb-6">Siap Mewujudkan <br />Inovasi Hardware Anda?</h2>
                   <p className="text-primary-foreground/90 mb-10 max-w-xl mx-auto font-medium">Buka akun sekarang dan nikmati kemudahan tracking produksi PCB Anda secara transparan.</p>
                   <Link to="/register">
                    <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-slate-50 animate-pulse-soft px-12">
                      Daftar Sekarang — Gratis
                    </Button>
                   </Link>
                </div>
             </motion.div>
          </section>
        </main>

        <footer className="py-12 border-t bg-slate-50 px-12 text-center">
           <div className="flex items-center justify-center gap-2 mb-6">
              <div className="p-1.5 rounded-lg bg-primary">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <span className="font-black tracking-tight">SETYA ABADI</span>
           </div>
           <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">© 2026 Setya Abadi Elektronik • CV. Setya Abadi Teknik</p>
        </footer>
      </div>
    </MotionPage>
  );
}
