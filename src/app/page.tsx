import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div>
        <Link href={'/rerender-component'}>Rerender-component</Link>
      </div>
      <div>
        <Link href={'/url-params'}>url-params</Link>
      </div>
      <div>
        <Link href={'/controllable-state'}>controllable-state</Link>
      </div>
    </main>
  );
}
