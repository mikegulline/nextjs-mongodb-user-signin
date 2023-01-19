import nodemailer from 'nodemailer';
import { google } from 'googleapis';
const { OAuth2 } = google.auth;
const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground';

const {
  MAIL_SERVICE_ID,
  MAIL_SERVICE_SECRET,
  MAIL_SERVICE_REFRESH_TOKEN,
  MAIL_SERVICE_SENDER,
} = process.env;

const oauth2Client = new OAuth2(
  MAIL_SERVICE_ID,
  MAIL_SERVICE_SECRET,
  MAIL_SERVICE_REFRESH_TOKEN,
  OAUTH_PLAYGROUND
);

export const sendEmail = (to, url, subject, template) => {
  oauth2Client.setCredentials({
    refresh_token: MAIL_SERVICE_REFRESH_TOKEN,
  });
  const accessToken = oauth2Client.getAccessToken();
  const smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: MAIL_SERVICE_SENDER,
      clientId: MAIL_SERVICE_ID,
      clientSecret: MAIL_SERVICE_SECRET,
      refreshToken: MAIL_SERVICE_REFRESH_TOKEN,
      accessToken,
    },
  });
  const mailOptions = {
    from: MAIL_SERVICE_SENDER,
    to: to,
    subject: subject,
    html: template(to, url),
  };

  smtpTransport.sendMail(mailOptions, (err, infos) => {
    if (err) return err;
    return infos;
  });
};
