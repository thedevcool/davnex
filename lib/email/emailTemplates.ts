/**
 * Base email template with consistent styling
 */
export function getEmailTemplate(content: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Davnex Store</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: #f5f5f7;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 32px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
      color: #1d1d1f;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #0071e3;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #0077ed;
    }
    .footer {
      background-color: #f5f5f7;
      padding: 30px;
      text-align: center;
      color: #86868b;
      font-size: 14px;
    }
    .footer a {
      color: #0071e3;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background-color: #d2d2d7;
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Davnex Store</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Davnex Store. All rights reserved.</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}">Visit our store</a> | 
        <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/support">Contact support</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Lodge Internet specific email template
 */
export function getLodgeInternetEmailTemplate(content: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lodge Internet</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: #f5f5f7;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 32px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
      color: #1d1d1f;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      margin: 20px 0;
    }
    .button:hover {
      opacity: 0.9;
    }
    .footer {
      background-color: #f5f5f7;
      padding: 30px;
      text-align: center;
      color: #86868b;
      font-size: 14px;
    }
    .footer a {
      color: #0071e3;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background-color: #d2d2d7;
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Lodge Internet</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>Lodge Internet by Davnex</p>
      <p>© ${new Date().getFullYear()} Davnex. All rights reserved.</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/internet">Lodge Internet</a> | 
        <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/support">Contact support</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Welcome email template
 */
export function getWelcomeEmail(userName: string, userEmail: string) {
  const content = `
    <h2>Welcome to Davnex Store! 🎉</h2>
    <p>Hi ${userName},</p>
    <p>Thank you for joining Davnex Store! We're excited to have you as part of our community.</p>
    <p>You now have access to:</p>
    <ul>
      <li>Exclusive deals and promotions</li>
      <li>Early access to new products</li>
      <li>Order tracking and history</li>
      <li>Personalized recommendations</li>
    </ul>
    <div class="divider"></div>
    <h3>Stay Connected</h3>
    <p>Would you like to receive promotional emails about new products, special offers, and exclusive deals?</p>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/settings/email-preferences?email=${encodeURIComponent(userEmail)}&promo=yes" class="button">Yes, send me promotions</a>
    <br/>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/settings/email-preferences?email=${encodeURIComponent(userEmail)}&promo=no" style="color: #86868b; font-size: 14px; text-decoration: none;">No thanks, just order updates</a>
    <div class="divider"></div>
    <p>If you have any questions, feel free to reach out to our support team.</p>
    <p>Happy shopping!<br/>The Davnex Team</p>
  `;
  return getEmailTemplate(content);
}

/**
 * Payment success email template
 */
export function getPaymentSuccessEmail(orderDetails: {
  orderId: string;
  customerName: string;
  items: Array<{ productName: string; quantity: number; price: number }>;
  total: number;
  deliveryMethod: string;
  deliveryFee: number;
  shippingAddress: string;
}) {
  const itemsHtml = orderDetails.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f5f5f7;">
          ${item.productName} × ${item.quantity}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f5f5f7; text-align: right;">
          ₦${item.price.toLocaleString()}
        </td>
      </tr>
    `,
    )
    .join("");

  const content = `
    <h2>Payment Successful! ✅</h2>
    <p>Hi ${orderDetails.customerName},</p>
    <p>Thank you for your order! Your payment has been processed successfully.</p>
    
    <div style="background-color: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #86868b;">Order Number</p>
      <p style="margin: 0; font-size: 24px; font-weight: 600;">#${orderDetails.orderId}</p>
    </div>

    <h3>Order Summary</h3>
    <table style="width: 100%; border-collapse: collapse;">
      ${itemsHtml}
      <tr>
        <td style="padding: 10px 0;">Delivery Fee</td>
        <td style="padding: 10px 0; text-align: right;">₦${orderDetails.deliveryFee.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding: 15px 0; font-weight: 600; font-size: 18px;">Total</td>
        <td style="padding: 15px 0; font-weight: 600; font-size: 18px; text-align: right;">₦${orderDetails.total.toLocaleString()}</td>
      </tr>
    </table>

    <div class="divider"></div>

    <h3>Delivery Information</h3>
    <p><strong>Method:</strong> ${orderDetails.deliveryMethod === "door-to-door" ? "Door-to-Door Delivery" : "Station Pickup"}</p>
    <p><strong>Address:</strong> ${orderDetails.shippingAddress}</p>

    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/orders" class="button">Track Your Order</a>

    <p>We'll send you another email when your order ships.</p>
    <p>Thank you for shopping with us!<br/>The Davnex Team</p>
  `;
  return getEmailTemplate(content);
}

/**
 * Order status update email template
 */
export function getOrderStatusEmail(orderDetails: {
  orderId: string;
  customerName: string;
  status: string;
  statusMessage: string;
  trackingInfo?: string;
}) {
  const statusEmoji =
    {
      packing: "📦",
      "on-the-way": "🚚",
      "delivered-station": "🏪",
      "delivered-doorstep": "✅",
    }[orderDetails.status] || "📦";

  const content = `
    <h2>Order Update ${statusEmoji}</h2>
    <p>Hi ${orderDetails.customerName},</p>
    <p>${orderDetails.statusMessage}</p>
    
    <div style="background-color: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #86868b;">Order Number</p>
      <p style="margin: 0; font-size: 24px; font-weight: 600;">#${orderDetails.orderId}</p>
    </div>

    ${
      orderDetails.trackingInfo
        ? `
      <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0; font-weight: 600;">Tracking Information</p>
        <p style="margin: 0;">${orderDetails.trackingInfo}</p>
      </div>
    `
        : ""
    }

    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/orders" class="button">View Order Details</a>

    <p>If you have any questions, please contact our support team.</p>
    <p>Best regards,<br/>The Davnex Team</p>
  `;
  return getEmailTemplate(content);
}

/**
 * Password reset email template
 */
export function getPasswordResetEmail(userName: string, resetToken: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

  const content = `
    <h2>Password Reset Request 🔐</h2>
    <p>Hi ${userName},</p>
    <p>We received a request to reset your password for your Davnex Store account.</p>
    <p>Click the button below to create a new password:</p>
    
    <a href="${resetUrl}" class="button">Reset Your Password</a>
    
    <p style="color: #86868b; font-size: 14px;">This link will expire in 1 hour for security reasons.</p>
    
    <div class="divider"></div>
    
    <p><strong>Didn't request a password reset?</strong></p>
    <p>If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
    
    <p>For security, never share this email or link with anyone.</p>
    <p>Best regards,<br/>The Davnex Team</p>
  `;
  return getEmailTemplate(content);
}

/**
 * Back in stock notification email
 */
export function getBackInStockEmail(
  customerName: string,
  product: {
    name: string;
    price: number;
    image: string;
    url: string;
  },
) {
  const content = `
    <h2>Back in Stock! 🎉</h2>
    <p>Hi ${customerName},</p>
    <p>Great news! A product you're interested in is back in stock:</p>
    
    <div style="background-color: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <img src="${product.image}" alt="${product.name}" style="max-width: 200px; border-radius: 8px;"/>
      <h3 style="margin: 15px 0 5px 0;">${product.name}</h3>
      <p style="font-size: 24px; font-weight: 600; color: #0071e3; margin: 10px 0;">₦${product.price.toLocaleString()}</p>
    </div>
    
    <p>Hurry! Products can sell out fast.</p>
    <a href="${product.url}" class="button">Shop Now</a>
    
    <p>Happy shopping!<br/>The Davnex Team</p>
  `;
  return getEmailTemplate(content);
}

/**
 * Coming soon / countdown email
 */
export function getComingSoonEmail(
  customerName: string,
  product: {
    name: string;
    price: number;
    image: string;
    availableDate: Date;
    url: string;
  },
) {
  const daysUntilAvailable = Math.ceil(
    (product.availableDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  const content = `
    <h2>Coming Soon! ⏳</h2>
    <p>Hi ${customerName},</p>
    <p>An exciting new product is coming to Davnex Store:</p>
    
    <div style="background-color: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <img src="${product.image}" alt="${product.name}" style="max-width: 200px; border-radius: 8px;"/>
      <h3 style="margin: 15px 0 5px 0;">${product.name}</h3>
      <p style="font-size: 24px; font-weight: 600; color: #0071e3; margin: 10px 0;">₦${product.price.toLocaleString()}</p>
      <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p style="margin: 0; font-size: 14px; color: #86868b;">Available in</p>
        <p style="margin: 5px 0 0 0; font-size: 32px; font-weight: 600;">${daysUntilAvailable} days</p>
      </div>
    </div>
    
    <p>Be ready! We'll notify you when it's available.</p>
    <a href="${product.url}" class="button">Learn More</a>
    
    <p>Stay tuned!<br/>The Davnex Team</p>
  `;
  return getEmailTemplate(content);
}

/**
 * Promotional email template (for admin)
 */
export function getPromotionalEmail(content: {
  title: string;
  message: string;
  ctaText?: string;
  ctaUrl?: string;
  imageUrl?: string;
}) {
  const emailContent = `
    <h2>${content.title}</h2>
    
    ${content.imageUrl ? `<img src="${content.imageUrl}" alt="${content.title}" style="max-width: 100%; border-radius: 8px; margin: 20px 0;"/>` : ""}
    
    <div style="font-size: 16px; line-height: 1.8;">
      ${content.message}
    </div>
    
    ${content.ctaText && content.ctaUrl ? `<a href="${content.ctaUrl}" class="button">${content.ctaText}</a>` : ""}
    
    <div class="divider"></div>
    
    <p style="font-size: 14px; color: #86868b;">
      You're receiving this email because you opted in to promotional emails from Davnex Store.<br/>
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/settings/email-preferences" style="color: #0071e3;">Manage email preferences</a>
    </p>
  `;
  return getEmailTemplate(emailContent);
}

/**
 * Feedback notification email template (for admin)
 */
export function getFeedbackNotificationEmail(feedback: {
  name: string;
  email: string;
  planName: string;
  type: "review" | "complaint";
  rating?: number;
  message: string;
  submittedAt: string;
}) {
  const typeEmoji = feedback.type === "review" ? "⭐" : "⚠️";
  const typeColor = feedback.type === "review" ? "#10b981" : "#ef4444";
  const typeBgColor = feedback.type === "review" ? "#d1fae5" : "#fee2e2";

  const ratingHtml =
    feedback.type === "review" && feedback.rating
      ? `
      <div style="margin: 15px 0;">
        <p style="margin: 0 0 5px 0; font-size: 14px; color: #86868b;">Rating</p>
        <p style="margin: 0; font-size: 24px;">${"⭐".repeat(feedback.rating)}${"☆".repeat(5 - feedback.rating)}</p>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #86868b;">${feedback.rating} out of 5 stars</p>
      </div>
    `
      : "";

  const emailContent = `
    <div style="background-color: ${typeBgColor}; padding: 20px; border-radius: 8px; border-left: 4px solid ${typeColor}; margin-bottom: 30px;">
      <h2 style="margin: 0; color: ${typeColor};">
        ${typeEmoji} New ${feedback.type === "review" ? "Review" : "Complaint"} Received
      </h2>
    </div>

    <div style="background-color: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #1d1d1f;">Customer Information</h3>
      <table style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; color: #86868b;">Name:</td>
          <td style="padding: 8px 0; font-weight: 600;">${feedback.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #86868b;">Email:</td>
          <td style="padding: 8px 0;"><a href="mailto:${feedback.email}" style="color: #0071e3;">${feedback.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #86868b;">Plan:</td>
          <td style="padding: 8px 0; font-weight: 600;">${feedback.planName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #86868b;">Submitted:</td>
          <td style="padding: 8px 0;">${new Date(feedback.submittedAt).toLocaleString()}</td>
        </tr>
      </table>
      ${ratingHtml}
    </div>

    <div style="background-color: #ffffff; border: 2px solid #d2d2d7; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #1d1d1f;">Message</h3>
      <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${feedback.message}</p>
    </div>

    <div class="divider"></div>

    <p style="font-size: 14px; color: #86868b;">
      ${feedback.type === "review" ? "Consider responding to this positive feedback to build customer relationships." : "Please review and address this complaint as soon as possible."}
    </p>
    
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/data-codes" class="button">View in Admin Dashboard</a>
  `;
  return getEmailTemplate(emailContent);
}

/**
 * Lodge Internet device code purchase email (for customer)
 */
export function getDeviceCodeEmail(details: {
  customerEmail: string;
  planName: string;
  usersCount: number;
  duration: string;
  price: number;
  code: string;
}) {
  const content = `
    <h2>Your Lodge Internet Access Code 🔐</h2>
    <p>Hi there,</p>
    <p>Thank you for your purchase! Here's your internet access code for <strong>${details.planName}</strong>.</p>
    
    <div style="background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%); padding: 30px; border-radius: 16px; margin: 30px 0; text-align: center;">
      <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Your Access Code</p>
      <div style="background-color: rgba(255, 255, 255, 0.95); padding: 20px; border-radius: 12px; margin: 15px 0;">
        <p style="margin: 0; font-size: 36px; font-weight: 700; font-family: 'Courier New', monospace; color: #1d1d1f; letter-spacing: 4px;">
          ${details.code}
        </p>
      </div>
      <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Keep this code safe and secure</p>
    </div>

    <div style="background-color: #f5f5f7; padding: 25px; border-radius: 12px; margin: 25px 0;">
      <h3 style="margin: 0 0 15px 0; color: #1d1d1f;">Plan Details</h3>
      <table style="width: 100%;">
        <tr>
          <td style="padding: 10px 0; color: #86868b;">Plan:</td>
          <td style="padding: 10px 0; font-weight: 600; text-align: right;">${details.planName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #86868b;">Devices:</td>
          <td style="padding: 10px 0; font-weight: 600; text-align: right;">${details.usersCount} Device${details.usersCount > 1 ? "s" : ""}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #86868b;">Duration:</td>
          <td style="padding: 10px 0; font-weight: 600; text-align: right;">${details.duration}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #86868b;">Amount Paid:</td>
          <td style="padding: 10px 0; font-weight: 600; font-size: 18px; text-align: right; color: #0071e3;">₦${details.price.toLocaleString()}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #e8f5e9; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #10b981;">
      <h3 style="margin: 0 0 10px 0; color: #065f46;">📱 How to Use Your Code</h3>
      <ol style="margin: 10px 0; padding-left: 20px; color: #065f46;">
        <li style="margin: 8px 0;">Connect to the Lodge Internet network</li>
        <li style="margin: 8px 0;">Open your browser and enter the access code above</li>
        <li style="margin: 8px 0;">Start browsing immediately!</li>
      </ol>
    </div>

    <div class="divider"></div>

    <p><strong>Important Notes:</strong></p>
    <ul style="color: #86868b; line-height: 1.8;">
      <li>This code is valid for ${details.usersCount} device${details.usersCount > 1 ? "s" : ""} simultaneously</li>
      <li>Do not share this code with others</li>
      <li>Save this email for your records</li>
    </ul>

    <p>Need help? Contact our support team anytime.</p>
    <p>Enjoy your internet!<br/>Lodge Internet Team</p>
  `;
  return getLodgeInternetEmailTemplate(content);
}

/**
 * TV Unlimited subscription created email (for customer)
 */
export function getTVSubscriptionCreatedEmail(details: {
  customerName: string;
  customerEmail: string;
  planName: string;
  duration: number;
  price: number;
  paymentRef: string;
}) {
  const content = `
    <h2>TV Unlimited Subscription Created! 📺</h2>
    <p>Hi ${details.customerName},</p>
    <p>Thank you for subscribing to <strong>${details.planName}</strong>! Your payment has been confirmed.</p>
    
    <div style="background: linear-gradient(135deg, #60a5fa 0%, #c084fc 100%); padding: 30px; border-radius: 16px; margin: 30px 0; text-align: center;">
      <div style="background-color: rgba(255, 255, 255, 0.95); padding: 25px; border-radius: 12px;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #86868b;">Subscription Status</p>
        <div style="display: inline-flex; align-items: center; gap: 10px; background-color: #fff3cd; padding: 12px 24px; border-radius: 20px; border: 2px solid #ffc107;">
          <span style="font-size: 24px;">⏳</span>
          <span style="font-weight: 600; color: #856404; font-size: 16px;">Pending Activation</span>
        </div>
      </div>
    </div>

    <div style="background-color: #f5f5f7; padding: 25px; border-radius: 12px; margin: 25px 0;">
      <h3 style="margin: 0 0 15px 0; color: #1d1d1f;">Subscription Details</h3>
      <table style="width: 100%;">
        <tr>
          <td style="padding: 10px 0; color: #86868b;">Plan:</td>
          <td style="padding: 10px 0; font-weight: 600; text-align: right;">${details.planName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #86868b;">Duration:</td>
          <td style="padding: 10px 0; font-weight: 600; text-align: right;">${details.duration} Days</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #86868b;">Amount Paid:</td>
          <td style="padding: 10px 0; font-weight: 600; font-size: 18px; text-align: right; color: #0071e3;">₦${details.price.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #86868b;">Payment Ref:</td>
          <td style="padding: 10px 0; font-family: 'Courier New', monospace; font-size: 12px; text-align: right;">${details.paymentRef}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #fff3cd; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #ffc107;">
      <h3 style="margin: 0 0 10px 0; color: #856404;">⏳ What happens next?</h3>
      <p style="margin: 0; color: #856404; line-height: 1.6;">
        Our administrator will activate your subscription shortly. You'll receive another email once your subscription is active and ready to use.
      </p>
    </div>

    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/internet/dashboard" class="button">View Dashboard</a>

    <div class="divider"></div>

    <p>You can track your subscription status anytime in your dashboard.</p>
    <p>Thank you for choosing TV Unlimited!<br/>Lodge Internet Team</p>
  `;
  return getLodgeInternetEmailTemplate(content);
}

/**
 * TV Unlimited subscription activated email (for customer)
 */
export function getTVSubscriptionActivatedEmail(details: {
  customerName: string;
  planName: string;
  duration: number;
  activatedAt: string;
  expiresAt: string;
}) {
  const expiryDate = new Date(details.expiresAt);
  const formattedExpiry = expiryDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const content = `
    <h2>Your TV Subscription is Now Active! ✅</h2>
    <p>Hi ${details.customerName},</p>
    <p>Great news! Your <strong>${details.planName}</strong> subscription has been activated and is ready to use.</p>
    
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 16px; margin: 30px 0; text-align: center;">
      <div style="background-color: rgba(255, 255, 255, 0.95); padding: 25px; border-radius: 12px;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #86868b;">Subscription Status</p>
        <div style="display: inline-flex; align-items: center; gap: 10px; background-color: #d1fae5; padding: 12px 24px; border-radius: 20px; border: 2px solid #10b981;">
          <span style="font-size: 24px;">✅</span>
          <span style="font-weight: 600; color: #065f46; font-size: 16px;">Active</span>
        </div>
      </div>
    </div>

    <div style="background-color: #f5f5f7; padding: 25px; border-radius: 12px; margin: 25px 0;">
      <h3 style="margin: 0 0 15px 0; color: #1d1d1f;">Subscription Details</h3>
      <table style="width: 100%;">
        <tr>
          <td style="padding: 10px 0; color: #86868b;">Plan:</td>
          <td style="padding: 10px 0; font-weight: 600; text-align: right;">${details.planName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #86868b;">Duration:</td>
          <td style="padding: 10px 0; font-weight: 600; text-align: right;">${details.duration} Days</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #86868b;">Activated:</td>
          <td style="padding: 10px 0; font-weight: 600; text-align: right;">${new Date(details.activatedAt).toLocaleDateString()}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #86868b;">Expires:</td>
          <td style="padding: 10px 0; font-weight: 600; text-align: right; color: #0071e3;">${formattedExpiry}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #e8f5e9; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #10b981;">
      <h3 style="margin: 0 0 10px 0; color: #065f46;">📺 Start Watching Now</h3>
      <p style="margin: 0; color: #065f46; line-height: 1.6;">
        Your TV service is now active and ready to stream. Enjoy unlimited access to all your favorite content!
      </p>
    </div>

    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/internet/dashboard" class="button">View Dashboard</a>

    <div class="divider"></div>

    <p>We'll send you a reminder before your subscription expires.</p>
    <p>Enjoy your viewing experience!<br/>Lodge Internet Team</p>
  `;
  return getLodgeInternetEmailTemplate(content);
}

/**
 * TV Unlimited subscription expiring soon email (for customer)
 */
export function getTVSubscriptionExpiringSoonEmail(details: {
  customerName: string;
  planName: string;
  expiresAt: string;
}) {
  const expiryDate = new Date(details.expiresAt);
  const formattedExpiry = expiryDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeUntilExpiry = Math.ceil(
    (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60),
  );

  const content = `
    <h2>Your TV Subscription Expires Soon ⏰</h2>
    <p>Hi ${details.customerName},</p>
    <p>This is a friendly reminder that your <strong>${details.planName}</strong> subscription will expire in approximately <strong>${timeUntilExpiry} hours</strong>.</p>
    
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 16px; margin: 30px 0; text-align: center;">
      <div style="background-color: rgba(255, 255, 255, 0.95); padding: 25px; border-radius: 12px;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #86868b;">Expiry Date</p>
        <p style="margin: 0; font-size: 24px; font-weight: 700; color: #92400e;">
          ${formattedExpiry}
        </p>
      </div>
    </div>

    <div style="background-color: #fff3cd; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #ffc107;">
      <h3 style="margin: 0 0 10px 0; color: #856404;">Don't miss out!</h3>
      <p style="margin: 0; color: #856404; line-height: 1.6;">
        Renew your subscription now to continue enjoying uninterrupted TV service. The renewal process is quick and easy.
      </p>
    </div>

    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/internet" class="button">Renew Subscription</a>

    <div class="divider"></div>

    <p>Have questions? Our support team is always here to help.</p>
    <p>Best regards,<br/>Lodge Internet Team</p>
  `;
  return getLodgeInternetEmailTemplate(content);
}

/**
 * TV Unlimited subscription expired email (for customer)
 */
export function getTVSubscriptionExpiredEmail(details: {
  customerName: string;
  planName: string;
  expiredAt: string;
}) {
  const content = `
    <h2>Your TV Subscription Has Expired</h2>
    <p>Hi ${details.customerName},</p>
    <p>Your <strong>${details.planName}</strong> subscription has expired as of ${new Date(details.expiredAt).toLocaleDateString()}.</p>
    
    <div style="background-color: #fee2e2; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #ef4444;">
      <h3 style="margin: 0 0 10px 0; color: #991b1b;">⚠️ Service Inactive</h3>
      <p style="margin: 0; color: #991b1b; line-height: 1.6;">
        Your TV service is currently inactive. Renew your subscription to restore access immediately.
      </p>
    </div>

    <div style="background-color: #f5f5f7; padding: 25px; border-radius: 12px; margin: 25px 0;">
      <h3 style="margin: 0 0 15px 0; color: #1d1d1f;">Why Renew?</h3>
      <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
        <li>Resume watching instantly</li>
        <li>No interruption in your viewing experience</li>
        <li>Keep your account and preferences</li>
        <li>Access to all premium content</li>
      </ul>
    </div>

    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/internet" class="button">Renew Now</a>

    <div class="divider"></div>

    <p>We'd love to have you back! If you have any questions, please reach out to our support team.</p>
    <p>Best regards,<br/>Lodge Internet Team</p>
  `;
  return getLodgeInternetEmailTemplate(content);
}

/**
 * TV Unlimited new subscription notification email (for admin)
 */
export function getTVSubscriptionAdminNotification(details: {
  customerName: string;
  customerEmail: string;
  macAddress: string;
  planName: string;
  duration: number;
  price: number;
  paymentRef: string;
  subscriptionId: string;
}) {
  const content = `
    <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 30px;">
      <h2 style="margin: 0; color: #1e40af;">📺 New TV Subscription Purchase</h2>
    </div>

    <p>A new TV Unlimited subscription has been purchased and is pending activation.</p>

    <div style="background-color: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #1d1d1f;">Customer Information</h3>
      <table style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; color: #86868b;">Name:</td>
          <td style="padding: 8px 0; font-weight: 600;">${details.customerName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #86868b;">Email:</td>
          <td style="padding: 8px 0;"><a href="mailto:${details.customerEmail}" style="color: #0071e3;">${details.customerEmail}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #86868b;">TV MAC Address:</td>
          <td style="padding: 8px 0; font-family: 'Courier New', monospace; font-size: 14px;">${details.macAddress}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #1d1d1f;">Subscription Details</h3>
      <table style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; color: #86868b;">Plan:</td>
          <td style="padding: 8px 0; font-weight: 600;">${details.planName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #86868b;">Duration:</td>
          <td style="padding: 8px 0; font-weight: 600;">${details.duration} Days</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #86868b;">Amount:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #0071e3;">₦${details.price.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #86868b;">Payment Ref:</td>
          <td style="padding: 8px 0; font-family: 'Courier New', monospace; font-size: 12px;">${details.paymentRef}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #86868b;">Subscription ID:</td>
          <td style="padding: 8px 0; font-family: 'Courier New', monospace; font-size: 12px;">${details.subscriptionId}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #fff3cd; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #ffc107;">
      <h3 style="margin: 0 0 10px 0; color: #856404;">⏳ Action Required</h3>
      <p style="margin: 0; color: #856404; line-height: 1.6;">
        Please review and activate this subscription from the TV Users admin panel. The customer is waiting for activation.
      </p>
    </div>

    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/tv-users" class="button">Go to TV Users Panel</a>

    <div class="divider"></div>

    <p style="font-size: 14px; color: #86868b;">
      This is an automated notification from the Davnex Store system.
    </p>
  `;
  return getEmailTemplate(content);
}
