import { Injectable } from '@nestjs/common';
import { Transporter, createTransport } from 'nodemailer';

@Injectable()
export class EmailService {
  transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      host: 'smtp.qq.com',
      port: 587,
      secure: false,
      auth: {
        user: '1803493121@qq.com',
        pass: 'cbshduaikcenghgg',
      },
    });
  }

  async sendEmail({ to, subject, html }) {
    await this.transporter.sendMail({
      from: {
        name: '会议室预订系统',
        address: '1803493121@qq.com',
      },
      to,
      subject,
      html,
    });
  }
}
