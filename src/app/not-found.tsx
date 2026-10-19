import { ButtonLink } from "@/components/site/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[80svh] max-w-page flex-col items-start justify-center px-5 pt-24 sm:px-8">
      <p className="font-display text-[clamp(5rem,16vw,11rem)] font-semibold leading-none text-white/10">404</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">This page doesn&apos;t exist.</h1>
      <p className="mt-3 text-lg text-fg-2">The link may be old, or the fund isn&apos;t one we track.</p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/">Go home</ButtonLink>
        <ButtonLink href="/funds" variant="ghost">
          Browse funds
        </ButtonLink>
      </div>
    </div>
  );
}
