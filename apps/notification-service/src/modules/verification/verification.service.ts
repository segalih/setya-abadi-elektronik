import { emailService } from '@/modules/email/email.service';
import { config } from '@/config/env';

class VerificationService {
  async sendVerificationEmail(to: string, token: string) {
    const verifyUrl = `${config.appUrl}/verify-email?token=${token}`;
    const subject = 'Verifikasi Email Anda - Setya Abadi Elektronik';
    const html = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f4f8; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
                <!-- Header Gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #38BDF8 0%, #34D399 100%); padding: 40px 40px 30px; text-align: center;">
                    <div style="width: 56px; height: 56px; background-color: rgba(255,255,255,0.2); border-radius: 14px; margin: 0 auto 16px; line-height: 56px; font-size: 28px;">
                      ⚡
                    </div>
                    <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
                      Verifikasi Email
                    </h1>
                    <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 8px 0 0; font-weight: 500;">
                      Setya Abadi Elektronik
                    </p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 36px 40px;">
                    <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin: 0 0 8px;">
                      Halo! 👋
                    </p>
                    <p style="color: #64748b; font-size: 14px; line-height: 1.7; margin: 0 0 28px;">
                      Terima kasih telah mendaftar di <strong style="color: #1e293b;">Setya Abadi Elektronik</strong>. 
                      Silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda dan mengaktifkan akun.
                    </p>
                    
                    <!-- CTA Button -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 0 0 28px;">
                          <a href="${verifyUrl}" 
                             style="display: inline-block; background: linear-gradient(135deg, #38BDF8 0%, #34D399 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-size: 15px; font-weight: 700; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(56, 189, 248, 0.35);">
                            Verifikasi Sekarang →
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Fallback Link -->
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px; margin-bottom: 8px;">
                      <p style="color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">
                        Atau copy link berikut:
                      </p>
                      <p style="color: #38BDF8; font-size: 12px; word-break: break-all; margin: 0; line-height: 1.5;">
                        ${verifyUrl}
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #f1f5f9;">
                    <p style="color: #94a3b8; font-size: 11px; line-height: 1.6; margin: 0; text-align: center;">
                      Link verifikasi ini akan kedaluwarsa dalam 24 jam.<br>
                      Jika Anda tidak merasa mendaftar, abaikan email ini.
                    </p>
                    <p style="color: #cbd5e1; font-size: 10px; margin: 12px 0 0; text-align: center; font-weight: 600; letter-spacing: 0.5px;">
                      © ${new Date().getFullYear()} Setya Abadi Elektronik
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return emailService.sendMail(to, subject, html);
  }
}

export const verificationService = new VerificationService();
