import { phonesMatch } from "@/lib/phone";

export function canAutoLinkStudent(input: {
  leadEmail: string | null;
  leadPhone: string;
  verifiedEmail?: string | null;
  verifiedPhone?: string | null;
}) {
  const emailMatches = Boolean(
    input.leadEmail &&
    input.verifiedEmail &&
    input.leadEmail.trim().toLowerCase() ===
      input.verifiedEmail.trim().toLowerCase(),
  );
  return (
    emailMatches ||
    Boolean(
      input.verifiedPhone && phonesMatch(input.leadPhone, input.verifiedPhone),
    )
  );
}

export function verifiedClerkContacts(
  user: {
    emailAddresses: {
      emailAddress: string;
      verification?: { status: string } | null;
    }[];
    phoneNumbers: {
      phoneNumber: string;
      verification?: { status: string } | null;
    }[];
    primaryEmailAddressId?: string | null;
    primaryPhoneNumberId?: string | null;
  } | null,
) {
  return {
    verifiedEmail:
      user?.emailAddresses.find(
        (entry) => entry.verification?.status === "verified",
      )?.emailAddress ?? null,
    verifiedPhone:
      user?.phoneNumbers.find(
        (entry) => entry.verification?.status === "verified",
      )?.phoneNumber ?? null,
  };
}
