import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { OrderBook } from '@/components/order-book';
import { PriceChart } from '@/components/price-chart';

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getItemDetails(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';
  const res = await fetch(`${baseUrl}/api/items/${slug}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getItemDetails(slug);

  if (!data) {
    return {
      title: 'Item Not Found',
    };
  }

  return {
    title: `${data.item.name} - Warframe Market Analytics`,
    description: `View real-time prices and trading data for ${data.item.name}`,
  };
}

export default async function ItemPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getItemDetails(slug);

  if (!data) {
    notFound();
  }

  const { item, stats, buyOrders, sellOrders, priceHistory } = data;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </div>

        {/* Title & Stats */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">{item.name}</h1>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Meilleur achat</p>
              <p className="text-2xl font-bold text-green-500">
                {stats.highestBuyPrice ? `${stats.highestBuyPrice}p` : '-'}
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Meilleure vente</p>
              <p className="text-2xl font-bold text-red-500">
                {stats.lowestSellPrice ? `${stats.lowestSellPrice}p` : '-'}
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Spread</p>
              <p className="text-2xl font-bold text-yellow-500">
                {stats.lowestSellPrice && stats.highestBuyPrice
                  ? `${stats.lowestSellPrice - stats.highestBuyPrice}p`
                  : '-'}
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Ordres d'achat</p>
              <p className="text-2xl font-bold text-foreground">{stats.buyOrdersCount}</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Ordres de vente</p>
              <p className="text-2xl font-bold text-foreground">{stats.sellOrdersCount}</p>
            </div>
          </div>
        </div>

        {/* Price Chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Historique des prix</h2>
          <PriceChart data={priceHistory} />
        </div>

        {/* Order Book */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OrderBook title="Ordres d'achat" orders={buyOrders} type="buy" />
          <OrderBook title="Ordres de vente" orders={sellOrders} type="sell" />
        </div>
      </div>
    </div>
  );
}
