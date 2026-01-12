'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Item {
  id: string;
  urlName: string;
  name: string;
  category: string;
  tags: string[];
  tier: number;
}

export function ItemsList() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItems() {
      try {
        const response = await fetch('/api/items');
        const data = await response.json();

        if (data.success) {
          setItems(data.items);
        } else {
          setError('Failed to load items');
        }
      } catch (err) {
        setError('Failed to fetch items');
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Primed Mods</h2>
        <p className="text-muted-foreground">Loading items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Primed Mods</h2>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Primed Mods</h2>
        <p className="text-muted-foreground">
          No items found. Run the sync job at{' '}
          <Link href="/api/jobs/sync-items" className="text-primary hover:underline">
            /api/jobs/sync-items
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Primed Mods ({items.length})</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/items/${item.urlName}`}
            className="bg-secondary hover:bg-secondary/80 border border-border rounded-lg p-4 transition-colors"
          >
            <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
            <p className="text-sm text-muted-foreground capitalize">{item.category}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
