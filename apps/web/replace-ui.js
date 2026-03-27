const fs = require('fs');
const file = 'src/modules/dashboard/BackofficeOrderDetail.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<label className="text-\[10px\] font-black uppercase tracking-widest text-muted-foreground">Pilih Status Baru<\/label>[\s\S]*?<\/select>/m,
  `<label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status Selanjutnya</label>
                              <div className="w-full h-12 px-4 rounded-xl bg-white border-2 border-slate-200 text-sm font-bold flex items-center text-slate-800">
                                 {order ? (getNextStatusInfo(order.status)?.label || 'Seluruh Tahapan Selesai') : ''}
                              </div>`
);

content = content.replace(
  /<span className="text-\[10px\] font-bold text-slate-500 truncate">\{files \? \`\$\{files\.length\} file dipilih\` : 'Pilih foto kemajuan\.\.\.'\}<\/span>[\s\S]*?onChange=\{\(e\) => setFiles\(e\.target\.files\)\}\s*\/>/m,
  `<span className="text-[10px] font-bold text-slate-500 truncate">{files ? \`\${files.length} file dipilih\` : 'Klik atau paste foto...'}</span>
                                 <input 
                                   type="file" 
                                   multiple 
                                   className="absolute inset-0 opacity-0 cursor-pointer" 
                                   onChange={(e) => {
                                      const dataTransfer = new DataTransfer();
                                      if (e.target.files) {
                                         Array.from(e.target.files).forEach(f => dataTransfer.items.add(f));
                                      }
                                      if (files) {
                                         Array.from(files).forEach(f => dataTransfer.items.add(f));
                                      }
                                      setFiles(dataTransfer.files);
                                   }}
                                 />`
);

content = content.replace(
  /\{newStatus === 'reviewed' && \([\s\S]*?Tambahan Biaya \(Shipping\/Packing\)<\/label>\s*<Input[\s\S]*?className="h-12 rounded-xl bg-slate-50 border-2 border-slate-100 focus:bg-white transition-all font-bold"[\s\S]*?<\/p>\s*<\/div>\s*\)\}/m,
  `{order?.status === 'pending' && (
                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-primary">Tambahan Biaya (Shipping/Packing)</label>
                              <Input 
                                type="number"
                                min={0}
                                placeholder="Contoh: 25000"
                                className="h-12 rounded-xl bg-white border-2 border-slate-200 focus:border-primary focus:bg-white transition-all font-bold text-slate-900"
                                value={additionalPrice}
                                onChange={(e) => setAdditionalPrice(e.target.value)}
                              />
                              <p className="text-[9px] font-bold text-muted-foreground">Biaya ini akan ditambahkan ke total transaksi pelanggan.</p>
                           </div>
                        )}`
);

content = content.replace(
  /className="min-h-\[100px\] rounded-2xl bg-slate-50 border-2 border-slate-100 focus:bg-white transition-all"/m,
  `className="min-h-[100px] rounded-2xl bg-white focus:bg-white border-2 border-slate-200 focus:border-primary text-slate-900 transition-all font-medium"`
);

content = content.replace(
  /disabled=\{isActionLoading \|\| newStatus === order\.status\}\s*className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary\/90 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary\/20"\s*>\s*\{isActionLoading \? <Loader2 className="w-4 h-4 animate-spin mr-2" \/> : <ChevronRight className="w-4 h-4 mr-2" \/>\}\s*Perbarui Pesanan/m,
  `disabled={isActionLoading || !getNextStatusInfo(order?.status)}
                             className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                           >
                              {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                              LANGKAH SELANJUTNYA`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Done!');
