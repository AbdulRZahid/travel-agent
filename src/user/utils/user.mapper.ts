import { Prisma } from "generated/prisma/browser";


export function mapClerkUserToDbUser(
  clerkId: string,
  appLanguageId: string,
  contentLanguageId: string,
  clerkUser: any,
): Prisma.UserCreateInput {
  const primaryEmail = clerkUser.emailAddresses?.find(
    (email: any) => email.id === clerkUser.primaryEmailAddressId,
  );

  return {
    id:clerkId,
    email: primaryEmail?.emailAddress || null,
    name: [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(' ') || null,
    // Add your appLanguage and contentLanguage relations here
    // appLanguage: { connect: { id: appLanguageId } },
    // contentLanguage: { connect: { id: contentLanguageId } },
  };
}

export function mapClerkWebhookUserToDbUser(
  clerkId: string,
  appLanguageId: string,
  contentLanguageId: string,
  webhookPayload: any,
): Prisma.UserCreateInput {
  const primaryEmail = webhookPayload.email_addresses?.find(
    (email: any) => email.id === webhookPayload.primary_email_address_id,
  );

  return {
    id:clerkId,
    email: primaryEmail?.email_address || null,
    name: [webhookPayload.first_name, webhookPayload.last_name]
      .filter(Boolean)
      .join(' ') || null,
    
    // Add your appLanguage and contentLanguage relations here
    // appLanguage: { connect: { id: appLanguageId } },
    // contentLanguage: { connect: { id: contentLanguageId } },
  };
}
