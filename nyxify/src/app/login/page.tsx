import DiscordSignInButton from "@/components/DiscordSignInButton";

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
      <h1 className="nyx-heading text-3xl font-bold text-white">Log in to Nyxify</h1>
      <p className="mt-3 text-sm text-nyx-muted">
        No separate account needed — sign in with the Discord account you use in the server.
      </p>
      <div className="mt-8 w-full">
        <DiscordSignInButton />
      </div>
    </div>
  );
}
