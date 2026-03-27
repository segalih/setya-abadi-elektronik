const fs = require('fs');
const file = 'src/modules/dashboard/BackofficeOrderDetail.tsx';
const content = fs.readFileSync(file, 'utf8');

const startIdx = content.indexOf('<form onSubmit={handleUpdateStatus} className="space-y-6">');
const endIdx = content.indexOf('</form>', startIdx) + '</form>'.length;

if (startIdx === -1 || endIdx === -1) {
  console.log("Form not found!");
  process.exit(1);
}

const newForm = `
                     <form onSubmit={handleUpdateStatus} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status Selanjutnya</label>
                              <div className="w-full h-12 px-4 rounded-xl bg-white border-2 border-slate-200 text-sm font-bold flex items-center text-slate-800">
                                 {order ? (getNextStatusInfo(order.status)?.label || 'Seluruh Tahapan Selesai') : ''}
                              </div>
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Upload Bukti (Opsional)</label>
                              <div className="relative h-12 w-full overflow-hidden rounded-xl border-2 border-dashed border-slate-300 hover:border-primary/50 transition-colors flex items-center px-4 gap-3 bg-white">
                                 <Upload className="w-4 h-4 text-slate-400" />
                                 <span className="text-[10px] font-bold text-slate-500 truncate">{files ? \`\${files.length} file dipilih\` : 'Klik atau paste foto...'}</span>
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
                                 />
                              </div>
                           </div>
                        </div>
                        
                        {order?.status === 'pending' && (
                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-primary">Tambahan Biaya (Shipping/Packing)</label>
                              <Input 
                                type="number"
                                min={0}
                                placeholder="Contoh: 25000"
                                className="h-12 rounded-xl bg-white border-2 border-slate-200 focus:bg-white focus:border-primary transition-all font-bold text-slate-900"
                                value={additionalPrice}
                                onChange={(e) => setAdditionalPrice(e.target.value)}
                              />
                              <p className="text-[9px] font-bold text-muted-foreground">Biaya ini akan ditambahkan ke pesanan pelanggan.</p>
                           </div>
                        )}

                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Catatan / Keterangan</label>
                           <Textarea 
                             placeholder="Tuliskan catatan kemajuan atau kendala... (Bisa paste gambar di layar ini)" 
                             className="min-h-[100px] rounded-2xl bg-white focus:bg-white border-2 border-slate-200 focus:border-primary text-slate-900 transition-all font-medium"
                             value={note}
                             onChange={(e) => setNote(e.target.value)}
                           />
                        </div>

                        <div className="flex justify-end pt-2">
                           <Button 
                             type="submit" 
                             disabled={isActionLoading || !getNextStatusInfo(order?.status)}
                             className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                           >
                              {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                              Lanjut Proses
                           </Button>
                        </div>
                     </form>
`;

const newContent = content.substring(0, startIdx) + newForm + content.substring(endIdx);
fs.writeFileSync(file, newContent, 'utf8');
console.log('Replaced successfully.');
