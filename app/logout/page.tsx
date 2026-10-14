import { signOut } from "@/auth";

export default function LogoutPage() {
  return (
    <main className="min-h-screen bg-forest text-ivory flex items-center justify-center px-6">
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
        className="bg-paper text-ink p-8 max-w-sm w-full"
      >
        <h1 className="serif text-4xl">Sign out?</h1>
        <p className="text-muted mt-4 leading-6">
          Your local wardrobe and saved preferences remain on this device.
        </p>
        <button className="bg-forest text-ivory px-5 py-3 text-xs mt-7">
          Sign out
        </button>
      </form>
    </main>
  );
}
