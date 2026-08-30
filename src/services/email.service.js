import nodemailer from 'nodemailer';

export const emailService = {
  // Gửi mã OTP xác thực email kích hoạt tài khoản
  sendVerificationEmail: async (email, name, otp) => {
    const host = process.env.EMAIL_HOST;
    const port = process.env.EMAIL_PORT || 587;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const from = process.env.EMAIL_FROM || '"EcoTech Auto" <no-reply@ecotech.com>';

    // Luôn in mã OTP ra Terminal ở Backend để tiện kiểm thử nhanh
    console.log(`==================================================`);
    console.log(`✉️ GỬI EMAIL XÁC THỰC ĐẾN: ${email}`);
    console.log(`👤 KHÁCH HÀNG: ${name}`);
    console.log(`🔑 MÃ OTP KÍCH HOẠT: ${otp}`);
    console.log(`==================================================`);

    // Nếu thiếu cấu hình SMTP trong file .env, chỉ in ra console và bỏ qua gửi mail thật
    if (!host || !user || !pass) {
      console.log(`[Email Service] Chưa cấu hình đầy đủ biến SMTP trong file .env. Đã in mã OTP ra console phía trên để kiểm thử nhanh.`);
      return true;
    }

    try {
      const transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure: Number(port) === 465, // Cổng 465 là SSL/TLS, cổng 587 là STARTTLS
        auth: {
          user,
          pass,
        },
      });

      const mailOptions = {
        from,
        to: email,
        subject: `[EcoTech Auto] Xác thực tài khoản của bạn`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
            <h2 style="color: #09090b; text-transform: uppercase; font-weight: 800; border-bottom: 2px solid #e4e4e7; padding-bottom: 10px; margin-top: 0;">EcoTech Auto</h2>
            <p>Chào <strong>${name}</strong>,</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản tại Showroom xe hơi EcoTech Auto.</p>
            <p>Để hoàn tất quá trình kích hoạt tài khoản và bảo mật thông tin, vui lòng nhập mã xác minh (OTP) dưới đây trên trang web của chúng tôi:</p>
            
            <div style="background-color: #f4f4f5; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0; border: 1px solid #e4e4e7;">
              <span style="font-size: 24px; font-weight: 800; letter-spacing: 4px; color: #09090b;">${otp}</span>
            </div>
            
            <p style="color: #71717a; font-size: 12px; margin-top: 20px; border-top: 1px dashed #e4e4e7; padding-top: 10px;">
              Mã này có hiệu lực trong vòng 15 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Lỗi khi gửi email SMTP:', error);
      return false;
    }
  }
};
