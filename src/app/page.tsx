import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center max-w-xl">
        <h1 className="text-5xl font-semibold tracking-tight text-[#1d1d1f] mb-4">
          Skills-Master
        </h1>
        <p className="text-xl text-[#86868b] mb-10 leading-relaxed">
          Генерация структурированного JSON со скиллами из CSV
        </p>
        <Link
          href="/admin"
          className="apple-button-primary text-base px-8 py-3"
        >
          Открыть админку
        </Link>
      </div>
    </main>
  );
}
