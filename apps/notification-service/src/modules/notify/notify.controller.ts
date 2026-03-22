import { Request, Response } from 'express';
import { emailService } from '../email/email.service';
import { whatsappService } from '../whatsapp/wa.service';
import { sendResponse } from '@/shared/utils/response';
import { logger } from '@/shared/utils/logger';

const getBaseTemplate = (content: string, customer_name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6; }
    .wrapper { width: 100%; padding: 20px 0; background-color: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 0; overflow: hidden; }
    .header { background-color: #0052ff; padding: 25px; text-align: center; }
    .logo { color: #ffffff; font-size: 22px; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; }
    .body { padding: 40px 30px; }
    .greeting { font-size: 16px; color: #374151; margin-bottom: 24px; }
    .main-info { font-size: 15px; color: #111827; margin-bottom: 30px; }
    .highlight { font-size: 28px; font-weight: 800; color: #0052ff; margin: 20px 0; }
    .details { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; }
    .detail-row { display: table; width: 100%; margin-bottom: 10px; }
    .detail-label { display: table-cell; width: 40%; color: #6b7280; font-size: 13px; text-transform: uppercase; font-weight: 600; }
    .detail-value { display: table-cell; width: 60%; text-align: right; color: #111827; font-size: 14px; font-weight: 700; }
    .note-box { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; font-style: italic; font-size: 14px; color: #92400e; }
    .image-gallery { margin-top: 25px; }
    .image-item { width: 100%; max-width: 100%; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e5e7eb; }
    .footer { padding: 30px; text-align: center; background-color: #ffffff; border-top: 1px solid #f3f4f6; }
    .footer-links { margin-bottom: 20px; font-size: 13px; color: #0052ff; font-weight: 600; }
    .footer-links a { color: #0052ff; text-decoration: none; margin: 0 10px; }
    .copyright { font-size: 12px; color: #9ca3af; margin-top: 15px; }
    .btn-container { text-align: center; margin-top: 35px; }
    .btn { display: inline-block; background-color: #0052ff; color: #ffffff !important; padding: 14px 34px; border-radius: 4px; text-decoration: none; font-weight: 700; font-size: 15px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">SETYA ABADI</div>
      </div>
      <div class="body">
        <div class="greeting">Pelanggan yang terhormat,</div>
        <div class="main-info">
          ${content}
        </div>
        <div class="btn-container">
          <a href="http://localhost:5173/dashboard" class="btn">Buka Dashboard</a>
        </div>
      </div>
      <div class="footer">
        <div class="footer-links">
          <a href="http://localhost:5173/dashboard">Dashboard</a> • <a href="#">Bantuan</a> • <a href="#">Kebijakan Privasi</a>
        </div>
        <div class="copyright">
          &copy; ${new Date().getFullYear()} Setya Abadi Elektronik. Seluruh hak cipta dilindungi.<br>
          Jl. Gatot Subroto No. 45, Semarang, Jawa Tengah
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

const formatIDR = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price).replace('Rp', 'Rp ');

export const handleOrderUpdate = async (req: Request, res: Response) => {
  const { order_id, status, note, images, customer_name, customer_email, customer_phone } = req.body;

  if (!order_id || !status || !customer_email) {
    return sendResponse(res, 400, false, 'Missing required order update information');
  }

  const statusColors: any = {
    pending: '#f59e0b', reviewed: '#3b82f6', in_production: '#a855f7', ready_to_ship: '#6366f1', shipped: '#f97316', completed: '#10b981', cancelled: '#f43f5e'
  };

  const statusHTML = `<span style="color: ${statusColors[status] || '#64748b'};">${status.replace(/_/g, ' ').toUpperCase()}</span>`;

  let content = `
    <p>Halo, ini adalah pemberitahuan dari sistem Setya Abadi.</p>
    <p>Pesanan Anda <b>#${order_id}</b> telah diperbarui.</p>
    <div class="highlight">${statusHTML}</div>
    <p style="color: #6b7280; font-size: 13px;">Status telah diperbarui pada ${new Date().toLocaleString('id-ID')}</p>
  `;

  if (note) {
    content += `<div class="note-box"><b>Catatan Tim Produksi:</b><br>"${note}"</div>`;
  }

  if (images && images.length > 0) {
    content += `<div class="image-gallery">
                  <p style="font-weight: 700; color: #374151; font-size: 14px; margin-bottom: 12px;">Foto Dokumentasi Progres:</p>`;
    images.forEach((img: string) => {
        content += `<img src="${img}" class="image-item">`;
    });
    content += `</div>`;
  }

  const html = getBaseTemplate(content, customer_name);
  const waMessage = `Halo ${customer_name}, pesanan #${order_id} sekarang berstatus: ${status.replace(/_/g, ' ')}.${note ? '\nCatatan: ' + note : ''} Cek detailnya di: http://localhost:5173/order/${order_id}`;

  // Send Email & WhatsApp in background (don't await)
  const sendNotifications = async () => {
    try {
      await emailService.sendMail(customer_email, `Update Status Pesanan #${order_id}`, html);
      logger.info(`Professional Update Email sent for #${order_id}`);
    } catch (error) {
      logger.error(`Failed to send background email for #${order_id}`);
    }

    if (customer_phone) {
      try {
        await whatsappService.sendMessage(customer_phone, waMessage);
        logger.info(`WhatsApp sent as background task for #${order_id}`);
      } catch (error) {
        logger.error(`Failed to send background WhatsApp for #${order_id}`);
      }
    }
  };

  // Fire and forget
  sendNotifications();

  return res.json({
    success: true,
    message: 'Order update notifications accepted for processing',
  });
};

export const handlePaymentSuccess = async (req: Request, res: Response) => {
    const { order_id, product_type, total_price, customer_name, customer_email, customer_phone } = req.body;
  
    if (!order_id || !customer_email) {
      return sendResponse(res, 400, false, 'Missing required payment information');
    }

    const content = `
      <p>Kabar gembira! Pembayaran untuk pesanan <b>#${order_id}</b> telah kami terima.</p>
      <div class="highlight" style="color: #10b981;">PEMBAYARAN BERHASIL</div>
      <div class="details">
        <div class="detail-row"><span class="detail-label">ID Pesanan</span><span class="detail-value">#${order_id}</span></div>
        <div class="detail-row"><span class="detail-label">Jenis Produk</span><span class="detail-value">${product_type}</span></div>
        <div class="detail-row"><span class="detail-label">Total Bayar</span><span class="detail-value" style="color: #10b981;">${formatIDR(total_price)}</span></div>
      </div>
      <p>Tim produksi kami akan segera memproses pesanan Anda. Pantau terus dashboard untuk update selanjutnya.</p>
    `;
  
    const html = getBaseTemplate(content, customer_name);
    const waMessage = `Halo ${customer_name}, pembayaran pesanan #${order_id} (${product_type}) sebesar ${formatIDR(total_price)} telah berhasil diverifikasi. Pesanan Anda akan segera diproses.`;
  
    // Send Email & WhatsApp in background (don't await)
    const sendNotifications = async () => {
      try {
        await emailService.sendMail(customer_email, `Pembayaran Berhasil - Pesanan #${order_id}`, html);
        logger.info(`Professional Payment Email sent for #${order_id}`);
      } catch (error) {
        logger.error(`Failed to send background payment email for #${order_id}`);
      }
  
      if (customer_phone) {
        try {
          await whatsappService.sendMessage(customer_phone, waMessage);
          logger.info(`Payment success WhatsApp sent in background for #${order_id}`);
        } catch (error) {
          logger.error(`Failed to send background payment WhatsApp for #${order_id}`);
        }
      }
    };

    // Fire and forget
    sendNotifications();
  
    return res.json({
      success: true,
      message: 'Payment success notifications accepted for processing',
    });
};

export const handleOrderCreated = async (req: Request, res: Response) => {
    const { order_id, product_type, total_price, customer_name, customer_email, customer_phone } = req.body;
  
    if (!order_id || !customer_email) {
      return sendResponse(res, 400, false, 'Missing required order creation information');
    }

    const content = `
      <p>Terima kasih telah melakukan pemesanan di Setya Abadi Elektronik.</p>
      <p>Pesanan Anda <b>#${order_id}</b> telah berhasil dibuat dan saat ini sedang menunggu verifikasi pembayaran.</p>
      <div class="highlight">PESANAN DITERIMA</div>
      <div class="details">
        <div class="detail-row"><span class="detail-label">ID Pesanan</span><span class="detail-value">#${order_id}</span></div>
        <div class="detail-row"><span class="detail-label">Jenis Produk</span><span class="detail-value">${product_type}</span></div>
        <div class="detail-row"><span class="detail-label">Total Biaya</span><span class="detail-value">${formatIDR(total_price)}</span></div>
      </div>
      <p>Silakan lakukan pembayaran sesuai dengan instruksi di dashboard untuk mempercepat proses produksi.</p>
    `;
  
    const html = getBaseTemplate(content, customer_name);
    const waMessage = `Halo ${customer_name}, pesanan #${order_id} (${product_type}) telah kami terima. Total biaya: ${formatIDR(total_price)}. Silakan cek detail pembayaran di: http://localhost:5173/order/${order_id}`;
  
    const sendNotifications = async () => {
      try {
        await emailService.sendMail(customer_email, `Konfirmasi Pesanan Baru #${order_id}`, html);
        logger.info(`Professional Order Creation Email sent for #${order_id}`);
      } catch (error) {
        logger.error(`Failed to send background order creation email for #${order_id}`);
      }
  
      if (customer_phone) {
        try {
          await whatsappService.sendMessage(customer_phone, waMessage);
          logger.info(`Order creation WhatsApp sent in background for #${order_id}`);
        } catch (error) {
          logger.error(`Failed to send background order creation WhatsApp for #${order_id}`);
        }
      }
    };

    sendNotifications();
  
    return res.json({
      success: true,
      message: 'Order creation notifications accepted for processing',
    });
};
