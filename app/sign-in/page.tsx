import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/");
  const configured = Boolean(
    process.env.AUTH_GOOGLE_ID &&
    process.env.AUTH_GOOGLE_SECRET &&
    process.env.AUTH_SECRET,
  );
  return (
    <main className="min-h-screen bg-forest text-ivory flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-paper text-ink p-8 lg:p-12">
        <p className="serif text-4xl text-forest">S.</p>
        <p className="uppercase tracking-[.25em] text-[10px] text-bronze mt-8">
          Stylebender / account
        </p>
        <h1 className="serif text-5xl mt-4">Welcome back.</h1>
        <p className="text-muted leading-6 mt-5">
          Save your looks, build your wardrobe and make your style yours.
        </p>
        {configured ? (
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <button className="w-full bg-forest text-ivory py-4 mt-8 text-sm">
              Continue with Google
            </button>
          </form>
        ) : (
          <div className="mt-8 border border-line p-4 text-sm text-muted leading-6">
            Google sign-in is not configured yet. Add{" "}
            <code>AUTH_GOOGLE_ID</code>, <code>AUTH_GOOGLE_SECRET</code> and{" "}
            <code>AUTH_SECRET</code> to your server environment.
          </div>
        )}
        <a href="/" className="block text-center text-xs text-muted mt-7">
          Continue as guest
        </a>
      </div>
    </main>
  );
}
