import { ItemsList } from '@/components/items-list';

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Warframe Market Analytics</h1>
        <p className="text-muted-foreground">
          Advanced price analysis for Primed mods
        </p>
      </header>

      <main>
        <ItemsList />
      </main>
    </div>
  );
}
