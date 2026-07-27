import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "CUSTOMER" | "ADMIN";
      discordId: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
