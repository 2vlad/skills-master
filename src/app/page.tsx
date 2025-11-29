import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Skills-Master</h1>
        <p className="text-gray-500 mb-8">
          Генерация структурированного JSON со скиллами из CSV
        </p>
        <Link
          href="/admin"
          className="bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Открыть админку
        </Link>
      </div>
    </main>
  );
}
