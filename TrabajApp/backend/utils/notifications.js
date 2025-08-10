const nodemailer = require("nodemailer");
const twilio = require("twilio");

// Configurar transporter de email
const emailTransporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Configurar cliente de Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Enviar email de verificación
 */
const sendVerificationEmail = async (email, token, firstName) => {
  try {
    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3001"
    }/verify-email?token=${token}`;

    const mailOptions = {
      from: `"TrabajApp" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "🔧 Verifica tu cuenta en TrabajApp",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verificación de Email - TrabajApp</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔧 ¡Bienvenido a TrabajApp!</h1>
              <p>Conectando oficios con clientes</p>
            </div>
            <div class="content">
              <p>Hola <strong>${firstName}</strong>,</p>
              
              <p>¡Gracias por registrarte en TrabajApp! Para comenzar a usar la plataforma, necesitas verificar tu dirección de email.</p>
              
              <p>Haz clic en el botón de abajo para verificar tu cuenta:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verificar mi cuenta</a>
              </div>
              
              <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
              
              <p><strong>Este enlace expira en 24 horas.</strong></p>
              
              <p>Si no creaste esta cuenta, puedes ignorar este email de forma segura.</p>
              
              <p>¡Esperamos que disfrutes de TrabajApp!</p>
              
              <p>Saludos,<br>
              El equipo de TrabajApp</p>
            </div>
            <div class="footer">
              <p>TrabajApp - Rosario, Santa Fe, Argentina</p>
              <p>¿Necesitas ayuda? Contáctanos en <a href="mailto:soporte@trabajapp.com">soporte@trabajapp.com</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log("Email de verificación enviado:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error enviando email de verificación:", error);
    throw error;
  }
};

/**
 * Enviar SMS de verificación
 */
const sendVerificationSMS = async (phone, code, firstName) => {
  try {
    const message = `Hola ${firstName}! Tu código de verificación para TrabajApp es: ${code}. Este código expira en 10 minutos.`;

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    console.log("SMS de verificación enviado:", result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error("Error enviando SMS de verificación:", error);
    throw error;
  }
};

/**
 * Enviar notificación de nueva cotización
 */
const sendNewQuotationEmail = async (
  clientEmail,
  clientName,
  professionalName,
  jobTitle,
  quotationAmount
) => {
  try {
    const mailOptions = {
      from: `"TrabajApp" <${process.env.SMTP_USER}>`,
      to: clientEmail,
      subject: `💰 Nueva cotización recibida para "${jobTitle}"`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .button { display: inline-block; background: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 ¡Nueva Cotización!</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${clientName}</strong>,</p>
              
              <p>Tienes una nueva cotización para tu trabajo:</p>
              
              <div class="highlight">
                <strong>Trabajo:</strong> ${jobTitle}<br>
                <strong>Profesional:</strong> ${professionalName}<br>
                <strong>Monto:</strong> $${quotationAmount}
              </div>
              
              <p>Revisa los detalles y decide si aceptar esta cotización.</p>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="${process.env.FRONTEND_URL}/jobs" class="button">Ver Cotización</a>
              </div>
              
              <p>Saludos,<br>El equipo de TrabajApp</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log("Email de nueva cotización enviado:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error enviando email de nueva cotización:", error);
    throw error;
  }
};

/**
 * Enviar notificación de trabajo asignado
 */
const sendJobAssignedEmail = async (
  professionalEmail,
  professionalName,
  jobTitle,
  clientName
) => {
  try {
    const mailOptions = {
      from: `"TrabajApp" <${process.env.SMTP_USER}>`,
      to: professionalEmail,
      subject: `🎉 ¡Trabajo asignado! "${jobTitle}"`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 ¡Felicitaciones!</h1>
              <p>Has sido seleccionado para un trabajo</p>
            </div>
            <div class="content">
              <p>Hola <strong>${professionalName}</strong>,</p>
              
              <p>¡Excelentes noticias! Tu cotización ha sido aceptada:</p>
              
              <div class="highlight">
                <strong>Trabajo:</strong> ${jobTitle}<br>
                <strong>Cliente:</strong> ${clientName}<br>
                <strong>Estado:</strong> Asignado - Listo para comenzar
              </div>
              
              <p>Ya puedes coordinar con el cliente para comenzar el trabajo. Recuerda mantener una comunicación fluida y profesional.</p>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="${process.env.FRONTEND_URL}/jobs" class="button">Ver Trabajo</a>
              </div>
              
              <p><strong>Próximos pasos:</strong></p>
              <ul>
                <li>Contacta al cliente para coordinar fecha y hora</li>
                <li>Confirma la dirección y detalles del trabajo</li>
                <li>Actualiza el estado cuando comiences</li>
              </ul>
              
              <p>¡Éxito en tu trabajo!</p>
              
              <p>Saludos,<br>El equipo de TrabajApp</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log("Email de trabajo asignado enviado:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error enviando email de trabajo asignado:", error);
    throw error;
  }
};

/**
 * Enviar notificación push
 */
const sendPushNotification = async (userToken, title, body, data = {}) => {
  try {
    // Implementar con Firebase Cloud Messaging
    const admin = require("firebase-admin");

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });
    }

    const message = {
      notification: {
        title,
        body,
      },
      data,
      token: userToken,
    };

    const response = await admin.messaging().send(message);
    console.log("Push notification enviada:", response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error("Error enviando push notification:", error);
    // No fallar si no se puede enviar push
    return { success: false, error: error.message };
  }
};

/**
 * Enviar notificación de pago recibido
 */
const sendPaymentReceivedEmail = async (
  professionalEmail,
  professionalName,
  amount,
  jobTitle
) => {
  try {
    const mailOptions = {
      from: `"TrabajApp" <${process.env.SMTP_USER}>`,
      to: professionalEmail,
      subject: `💰 Pago recibido - ${amount}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .amount { background: #d4edda; border: 2px solid #28a745; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 ¡Pago Recibido!</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${professionalName}</strong>,</p>
              
              <p>¡Excelentes noticias! Has recibido un pago por tu trabajo completado:</p>
              
              <div class="amount">
                <h2 style="margin: 0; color: #28a745;">${amount}</h2>
                <p style="margin: 5px 0 0 0;"><strong>Trabajo:</strong> ${jobTitle}</p>
              </div>
              
              <p>El dinero estará disponible en tu cuenta dentro de 24-48 horas hábiles.</p>
              
              <p><strong>Detalles del pago:</strong></p>
              <ul>
                <li>Monto bruto: ${amount}</li>
                <li>Comisión TrabajApp (8%): ${(amount * 0.08).toFixed(2)}</li>
                <li>Monto neto: ${(amount * 0.92).toFixed(2)}</li>
              </ul>
              
              <p>¡Gracias por usar TrabajApp para hacer crecer tu negocio!</p>
              
              <p>Saludos,<br>El equipo de TrabajApp</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log("Email de pago recibido enviado:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error enviando email de pago recibido:", error);
    throw error;
  }
};

/**
 * Enviar recordatorio de calificación
 */
const sendReviewReminderEmail = async (
  userEmail,
  userName,
  jobTitle,
  userType
) => {
  try {
    const isClient = userType === "client";
    const subject = isClient
      ? `⭐ Califica tu experiencia con "${jobTitle}"`
      : `⭐ El cliente puede calificarte - "${jobTitle}"`;

    const mailOptions = {
      from: `"TrabajApp" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ffc107; color: #333; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .stars { font-size: 24px; color: #ffc107; text-align: center; margin: 15px 0; }
            .button { display: inline-block; background: #ffc107; color: #333; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⭐ Tu opinión es importante</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${userName}</strong>,</p>
              
              ${
                isClient
                  ? `
                <p>Tu trabajo "<strong>${jobTitle}</strong>" ha sido completado. ¡Nos encantaría conocer tu experiencia!</p>
                
                <div class="stars">⭐⭐⭐⭐⭐</div>
                
                <p>Calificar al profesional nos ayuda a:</p>
                <ul>
                  <li>Mantener la calidad de los servicios</li>
                  <li>Ayudar a otros clientes a elegir</li>
                  <li>Reconocer a los mejores profesionales</li>
                </ul>
                
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${process.env.FRONTEND_URL}/jobs/${jobTitle}/review" class="button">Calificar Ahora</a>
                </div>
              `
                  : `
                <p>El trabajo "<strong>${jobTitle}</strong>" ha sido completado. El cliente puede calificarte durante los próximos 7 días.</p>
                
                <p>Una buena calificación te ayudará a:</p>
                <ul>
                  <li>Atraer más clientes</li>
                  <li>Aparecer mejor posicionado en búsquedas</li>
                  <li>Construir tu reputación profesional</li>
                </ul>
                
                <p>Recuerda que puedes responder a las reseñas para agradecer o aclarar cualquier punto.</p>
              `
              }
              
              <p>¡Gracias por ser parte de la comunidad TrabajApp!</p>
              
              <p>Saludos,<br>El equipo de TrabajApp</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log(
      "Email de recordatorio de calificación enviado:",
      info.messageId
    );
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(
      "Error enviando email de recordatorio de calificación:",
      error
    );
    throw error;
  }
};

/**
 * Crear notificación en base de datos
 */
const createNotification = async (
  userId,
  type,
  title,
  message,
  jobId = null,
  quotationId = null,
  reviewId = null
) => {
  try {
    const db = require("../database/connection");

    const [notification] = await db("notifications")
      .insert({
        user_id: userId,
        type,
        title,
        message,
        job_id: jobId,
        quotation_id: quotationId,
        review_id: reviewId,
        action_url: generateActionUrl(type, jobId, quotationId, reviewId),
      })
      .returning(["id", "created_at"]);

    console.log("Notificación creada en BD:", notification.id);
    return { success: true, notificationId: notification.id };
  } catch (error) {
    console.error("Error creando notificación en BD:", error);
    throw error;
  }
};

/**
 * Generar URL de acción para notificaciones
 */
const generateActionUrl = (type, jobId, quotationId, reviewId) => {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3001";

  switch (type) {
    case "new_quotation":
    case "quotation_accepted":
    case "quotation_rejected":
      return `${baseUrl}/jobs/${jobId}`;
    case "job_assigned":
    case "job_started":
    case "job_completed":
    case "message_received":
      return `${baseUrl}/jobs/${jobId}`;
    case "payment_received":
      return `${baseUrl}/payments`;
    case "review_received":
      return `${baseUrl}/reviews`;
    default:
      return `${baseUrl}/dashboard`;
  }
};

/**
 * Enviar notificación completa (email + push + BD)
 */
const sendCompleteNotification = async (
  userId,
  type,
  emailData,
  pushData,
  dbData
) => {
  try {
    const results = {
      email: null,
      push: null,
      database: null,
    };

    // Obtener configuraciones del usuario
    const db = require("../database/connection");
    const userSettings = await db("user_settings")
      .select("email_notifications", "push_notifications")
      .where("user_id", userId)
      .first();

    const user = await db("users")
      .select("email", "first_name")
      .where("id", userId)
      .first();

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Enviar email si está habilitado
    if (userSettings?.email_notifications && emailData) {
      try {
        results.email = await sendNotificationEmail(
          user.email,
          user.first_name,
          emailData
        );
      } catch (emailError) {
        console.error("Error enviando email:", emailError);
      }
    }

    // Enviar push si está habilitado
    if (userSettings?.push_notifications && pushData) {
      // Aquí obtendrías el token de push del usuario
      try {
        results.push = await sendPushNotification(
          null,
          pushData.title,
          pushData.body,
          pushData.data
        );
      } catch (pushError) {
        console.error("Error enviando push:", pushError);
      }
    }

    // Crear notificación en BD
    if (dbData) {
      try {
        results.database = await createNotification(
          userId,
          dbData.type,
          dbData.title,
          dbData.message,
          dbData.jobId,
          dbData.quotationId,
          dbData.reviewId
        );
      } catch (dbError) {
        console.error("Error creando notificación en BD:", dbError);
      }
    }

    return results;
  } catch (error) {
    console.error("Error en notificación completa:", error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendVerificationSMS,
  sendNewQuotationEmail,
  sendJobAssignedEmail,
  sendPaymentReceivedEmail,
  sendReviewReminderEmail,
  sendPushNotification,
  createNotification,
  sendCompleteNotification,
};
