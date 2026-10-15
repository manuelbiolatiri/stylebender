import { auth, signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
export default async function SignInPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/");
  const params = await searchParams;
  const error = params?.error;
  const callbackUrl = params?.callbackUrl?.startsWith("/") ? params.callbackUrl : "/";
  const configured = Boolean(
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
          <>
            <form
              action={async (formData) => {
                "use server";
                try {
                  await signIn("credentials", {
                    email: formData.get("email"),
                    password: formData.get("password"),
                    redirectTo: callbackUrl,
                  });
                } catch (caught) {
                  if (caught instanceof AuthError) {
                    redirect("/sign-in?error=invalid-credentials");
                  }
                  throw caught;
                }
              }}
              className="mt-8 space-y-3"
            >
              {error === "invalid-credentials" ? (
                <p className="border border-red-800/30 bg-red-50 px-4 py-3 text-sm text-red-900">
                  Email or password is incorrect.
                </p>
              ) : null}
              <input name="email" type="email" required placeholder="Email" className="w-full border border-line bg-transparent px-4 py-3 text-sm" />
              {process.env.AUTH_ADMIN_PASSWORD_HASH?.trim() ? (
                <input name="password" type="password" required placeholder="Password" className="w-full border border-line bg-transparent px-4 py-3 text-sm" />
              ) : (
                <p className="border border-amber-800/30 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Email sign-in is unavailable until AUTH_ADMIN_PASSWORD_HASH is configured.
                </p>
              )}
              <button className="w-full bg-forest text-ivory py-4 text-sm">
                Sign in with email
              </button>
            </form>
          </>
        ) : (
          <div className="mt-8 border border-line p-4 text-sm text-muted leading-6">
            Add <code>AUTH_SECRET</code> to your server environment.
          </div>
        )}
        <a href="/" className="block text-center text-xs text-muted mt-7">
          Continue as guest
        </a>
      </div>
    </main>
  );
}
