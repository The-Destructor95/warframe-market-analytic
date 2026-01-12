import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Fetch item with orders and price history
    const item = await prisma.item.findUnique({
      where: { urlName: slug },
      include: {
        orders: {
          orderBy: { platinum: 'asc' },
        },
        priceHistory: {
          orderBy: { timestamp: 'desc' },
          take: 100, // Last 100 data points
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Separate buy and sell orders
    const buyOrders = item.orders
      .filter(order => order.orderType === 'buy')
      .sort((a, b) => b.platinum - a.platinum); // Highest buy price first

    const sellOrders = item.orders
      .filter(order => order.orderType === 'sell')
      .sort((a, b) => a.platinum - b.platinum); // Lowest sell price first

    // Calculate current statistics
    const stats = {
      lowestSellPrice: sellOrders[0]?.platinum || null,
      highestBuyPrice: buyOrders[0]?.platinum || null,
      totalOrders: item.orders.length,
      sellOrdersCount: sellOrders.length,
      buyOrdersCount: buyOrders.length,
    };

    return NextResponse.json({
      item: {
        id: item.id,
        urlName: item.urlName,
        name: item.name,
        category: item.category,
        tags: item.tags,
        lastPolled: item.lastPolled,
      },
      stats,
      buyOrders: buyOrders.slice(0, 20), // Top 20 buy orders
      sellOrders: sellOrders.slice(0, 20), // Top 20 sell orders
      priceHistory: item.priceHistory.reverse(), // Oldest to newest for chart
    });
  } catch (error) {
    console.error('Error fetching item details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item details' },
      { status: 500 }
    );
  }
}
