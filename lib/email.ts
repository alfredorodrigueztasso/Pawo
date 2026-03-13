import { Resend } from "resend";

const FROM_EMAIL = "noreply@pawo.app";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error(
        "RESEND_API_KEY environment variable is not set. Email notifications will not be sent."
      );
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export async function sendInvitationEmail({
  recipientEmail,
  senderName,
  householdName,
  invitationToken,
}: {
  recipientEmail: string;
  senderName: string;
  householdName: string;
  invitationToken: string;
}) {
  const invitationLink = `${APP_URL}/invite/${invitationToken}`;

  return getResendClient().emails.send({
    from: FROM_EMAIL,
    to: recipientEmail,
    subject: `${senderName} invited you to share expenses in ${householdName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You're invited to Pawo! 🎉</h2>
        <p>${senderName} invited you to join <strong>${householdName}</strong> on Pawo to divide shared expenses fairly.</p>

        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 15px 0;">Accept the invitation and get started:</p>
          <a href="${invitationLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            Join Pawo
          </a>
        </div>

        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Or copy this link: <code style="background-color: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${invitationLink}</code>
        </p>

        <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          This is an automated message from Pawo. If you have questions, contact ${senderName}.
        </p>
      </div>
    `,
  });
}

export async function sendExpenseNotificationEmail({
  recipientEmail,
  recipientName,
  senderName,
  amount,
  description,
  householdName,
}: {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  amount: number;
  description: string;
  householdName: string;
}) {
  return getResendClient().emails.send({
    from: FROM_EMAIL,
    to: recipientEmail,
    subject: `${senderName} added an expense: ${description}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New expense in ${householdName}</h2>
        <p>Hi ${recipientName},</p>
        <p>${senderName} just added a new expense:</p>

        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 18px;"><strong>${description}</strong></p>
          <p style="margin: 8px 0 0 0; color: #666;">Amount: <strong>$${amount.toFixed(2)}</strong></p>
        </div>

        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Check your Pawo dashboard to see the updated balance.
        </p>

        <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          You're receiving this because you're part of the ${householdName} household on Pawo.
        </p>
      </div>
    `,
  });
}

export async function sendReviewRequestEmail({
  recipientEmail,
  recipientName,
  senderName,
  amount,
  description,
  question,
  suggestedAmount,
  expenseLink,
}: {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  amount: number;
  description: string;
  question: string;
  suggestedAmount?: number;
  expenseLink: string;
}) {
  return getResendClient().emails.send({
    from: FROM_EMAIL,
    to: recipientEmail,
    subject: `${senderName} is asking about: ${description}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Expense review request</h2>
        <p>Hi ${recipientName},</p>
        <p>${senderName} has a question about the following expense:</p>

        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 16px;"><strong>${description}</strong></p>
          <p style="margin: 8px 0 0 0; color: #666;">Amount: <strong>$${amount.toFixed(2)}</strong></p>
          ${suggestedAmount ? `<p style="margin: 8px 0 0 0; color: #f59e0b;">Suggested: <strong>$${suggestedAmount.toFixed(2)}</strong></p>` : ""}
        </div>

        <p style="margin: 20px 0; color: #333;"><strong>Their question:</strong></p>
        <p style="background-color: #fef3c7; padding: 12px; border-left: 3px solid #f59e0b; border-radius: 4px; margin: 0;">${question}</p>

        <div style="margin: 20px 0;">
          <a href="${expenseLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            View & Respond
          </a>
        </div>

        <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          This is an automated message from Pawo. Reply directly in the app to respond.
        </p>
      </div>
    `,
  });
}

export async function sendReviewResponseEmail({
  recipientEmail,
  recipientName,
  senderName,
  description,
  response,
  expenseLink,
}: {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  description: string;
  response: string;
  expenseLink: string;
}) {
  return getResendClient().emails.send({
    from: FROM_EMAIL,
    to: recipientEmail,
    subject: `${senderName} responded to your question about: ${description}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Review response</h2>
        <p>Hi ${recipientName},</p>
        <p>${senderName} responded to your question about <strong>${description}</strong>:</p>

        <div style="background-color: #f0fdf4; padding: 16px; border-left: 3px solid #22c55e; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0;">${response}</p>
        </div>

        <div style="margin: 20px 0;">
          <a href="${expenseLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            View Expense
          </a>
        </div>

        <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          This is an automated message from Pawo.
        </p>
      </div>
    `,
  });
}
