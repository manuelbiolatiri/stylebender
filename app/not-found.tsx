import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center p-6 text-center">
      <p className="text-bronze uppercase tracking-[.25em] text-xs">
        404 · Page Not Found
      </p>
      <h1 className="serif text-5xl mt-4">The edit ends here.</h1>
      <p className="text-muted text-sm mt-3 max-w-md leading-6">
        The piece or page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-8">
        <Link
          href="/"
          className="bg-forest text-ivory px-6 py-3 text-xs tracking-wide inline-block"
        >
          Return to Discover
        </Link>
      </div>
    </div>
  );
}
