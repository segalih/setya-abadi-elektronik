import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2, User, MapPin, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import { cn } from '@/lib/utils';
import MotionPage from '@/components/shared/MotionWrapper';
import { Badge } from '@/components/ui/badge';

// --- ZOD SCHEMAS ---
const profileSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email(),
});

const addressSchema = z.object({
  full_address: z.string().min(10, 'Alamat terlalu singkat'),
  province: z.string().min(3, 'Provinsi wajib diisi'),
  city: z.string().min(3, 'Kota/Kabupaten wajib diisi'),
  district: z.string().min(3, 'Kecamatan wajib diisi'),
  village: z.string().min(3, 'Desa/Kelurahan wajib diisi'),
  postal_code: z.string().regex(/^\d{5}$/, 'Kode pos minimal 5 digit angka'),
  phone: z.string().min(10, 'Nomor HP minimal 10 digit'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type AddressFormValues = z.infer<typeof addressSchema>;

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const actualUser = (user as any)?.user || user;
  const token = localStorage.getItem('token') || '';

  // --- FORM HOOKS ---
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: actualUser?.name || '',
      email: actualUser?.email || '',
    },
  });

  const addressForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      full_address: actualUser?.address?.full_address || '',
      province: actualUser?.address?.province || '',
      city: actualUser?.address?.city || '',
      district: actualUser?.address?.district || '',
      village: actualUser?.address?.village || '',
      postal_code: actualUser?.address?.postal_code || '',
      phone: actualUser?.address?.phone || '',
    },
  });

  // Prefill forms when user data is available
  useEffect(() => {
    if (actualUser) {
      profileForm.reset({
        name: actualUser.name,
        email: actualUser.email,
      });
      addressForm.reset({
        full_address: actualUser.address?.full_address || '',
        province: actualUser.address?.province || '',
        city: actualUser.address?.city || '',
        district: actualUser.address?.district || '',
        village: actualUser.address?.village || '',
        postal_code: actualUser.address?.postal_code || '',
        phone: actualUser.address?.phone || '',
      });
    }
  }, [actualUser, profileForm, addressForm]);

  // --- MUTATIONS ---
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const resp = await api.put('/user/profile', { name: data.name });
      return resp.data;
    },
    onSuccess: (data) => {
      // Sync fresh data to Zustand (reusing current token)
      setAuth(data.user, token);
      alert('Profil berhasil diperbarui!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal memperbarui profil');
    },
  });

  const { mutate: updateAddress, isPending: isUpdatingAddress } = useMutation({
    mutationFn: async (data: AddressFormValues) => {
      const resp = await api.put('/user/address', data);
      return resp.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, token);
      alert('Alamat berhasil diperbarui!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal memperbarui alamat');
    },
  });

  return (
    <MotionPage>
      <div className="max-w-4xl mx-auto space-y-6 pt-6 pb-12">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-2 bg-white flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Button>

        <div>
          <h1 className="text-3xl font-black text-slate-800">Pengaturan Profil</h1>
          <p className="text-muted-foreground mt-2">Kelola informasi pribadi dan alamat pengiriman Anda di sini.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* USER PROFILE SECTION */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Data Diri
              </CardTitle>
              <CardDescription>Informasi akun utama Anda</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={profileForm.handleSubmit((data) => updateProfile(data))} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
                    {actualUser?.email_verified_at ? (
                      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50 gap-1 py-0.5 px-2">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Terverifikasi</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-50 gap-1 py-0.5 px-2">
                        <Loader2 className="w-3 h-3 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Belum Terverifikasi</span>
                      </Badge>
                    )}
                  </div>
                  <Input 
                    {...profileForm.register('name')} 
                    placeholder="Nama Lengkap" 
                    className={cn(profileForm.formState.errors.name && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {profileForm.formState.errors.name && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider tabular-nums">{profileForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Alamat Email <span className="text-muted-foreground font-normal">(Readonly)</span></label>
                  <Input {...profileForm.register('email')} readOnly disabled className="bg-slate-100 cursor-not-allowed" />
                </div>

                <Button type="submit" disabled={isUpdatingProfile} className="w-full mt-4 bg-slate-800 hover:bg-slate-900">
                  {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Simpan Perubahan Profil
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* USER ADDRESS SECTION */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Alamat Pengiriman
              </CardTitle>
              <CardDescription>Alamat utama untuk mempermudah pemesanan pesanan Anda nanti.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={addressForm.handleSubmit((data) => updateAddress(data))} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Alamat Lengkap</label>
                  <Input 
                    {...addressForm.register('full_address')} 
                    placeholder="Jalan, RT/RW, Patokan area" 
                    className={cn(addressForm.formState.errors.full_address && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {addressForm.formState.errors.full_address && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{addressForm.formState.errors.full_address.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Provinsi</label>
                    <Input 
                      {...addressForm.register('province')} 
                      placeholder="Contoh: Jawa Barat" 
                      className={cn(addressForm.formState.errors.province && "border-red-500 focus-visible:ring-red-500")}
                    />
                    {addressForm.formState.errors.province && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{addressForm.formState.errors.province.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Kota/Kota</label>
                    <Input 
                      {...addressForm.register('city')} 
                      placeholder="Contoh: Bandung" 
                      className={cn(addressForm.formState.errors.city && "border-red-500 focus-visible:ring-red-500")}
                    />
                    {addressForm.formState.errors.city && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{addressForm.formState.errors.city.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Kecamatan</label>
                    <Input 
                      {...addressForm.register('district')} 
                      placeholder="Kecamatan" 
                      className={cn(addressForm.formState.errors.district && "border-red-500 focus-visible:ring-red-500")}
                    />
                    {addressForm.formState.errors.district && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{addressForm.formState.errors.district.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Desa/Kelurahan</label>
                    <Input 
                      {...addressForm.register('village')} 
                      placeholder="Desa" 
                      className={cn(addressForm.formState.errors.village && "border-red-500 focus-visible:ring-red-500")}
                    />
                    {addressForm.formState.errors.village && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{addressForm.formState.errors.village.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Kode Pos</label>
                    <Input 
                      {...addressForm.register('postal_code')} 
                      placeholder="12345" 
                      className={cn(addressForm.formState.errors.postal_code && "border-red-500 focus-visible:ring-red-500")}
                    />
                    {addressForm.formState.errors.postal_code && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{addressForm.formState.errors.postal_code.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">No HP / WhatsApp</label>
                    <Input 
                      {...addressForm.register('phone')} 
                      placeholder="08xxxxxxxxxx" 
                      className={cn(addressForm.formState.errors.phone && "border-red-500 focus-visible:ring-red-500")}
                    />
                    {addressForm.formState.errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{addressForm.formState.errors.phone.message}</p>}
                  </div>
                </div>

                <Button type="submit" disabled={isUpdatingAddress} className="w-full mt-4 bg-primary hover:bg-primary/90">
                  {isUpdatingAddress ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Simpan Alamat Utama
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MotionPage>
  );
}
