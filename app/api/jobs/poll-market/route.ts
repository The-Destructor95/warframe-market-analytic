import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getItemOrders, sleep } from '@/lib/warframe-api';

export async function GET() {
  try {
    console.log('[Poll Market] Starting market data polling...');

    // Get all items that need to be polled (tier 1 only for MVP)
    const items = await prisma.item.findMany({
      where: { tier: 1 },
    });

    console.log(`[Poll Market] Polling ${items.length} items`);

    let polledCount = 0;

    for (const item of items) {
      try {
        // Fetch orders
        const orders = await getItemOrders(item.urlName);
        await sleep(350); // Rate limit: 3 req/s

        // Delete old orders for this item
        await prisma.order.deleteMany({
          where: { itemId: item.id },
        });

        // Insert new orders
        const ordersToCreate = orders
          .filter(order => order.user.platform === 'pc') // PC only
          .map(order => ({
            itemId: item.id,
            orderId: order.id,
            orderType: order.type,
            platinum: order.platinum,
            quantity: order.quantity,
            user: order.user.ingameName,
            platform: order.user.platform,
            region: order.user.locale || 'en',
            online: order.user.status === 'ingame' || order.user.status === 'online',
          }));

        if (ordersToCreate.length > 0) {
          await prisma.order.createMany({
            data: ordersToCreate,
            skipDuplicates: true,
          });
        }

        // Calculate price history from current orders
        if (orders.length > 0) {
          const sellOrders = orders.filter(o => o.type === 'sell' && o.user.platform === 'pc');
          const buyOrders = orders.filter(o => o.type === 'buy' && o.user.platform === 'pc');

          if (sellOrders.length > 0 || buyOrders.length > 0) {
            const allPrices = [...sellOrders, ...buyOrders].map(o => o.platinum);
            const minPrice = Math.min(...allPrices);
            const maxPrice = Math.max(...allPrices);
            const avgPrice = allPrices.reduce((a, b) => a + b, 0) / allPrices.length;
            const sortedPrices = allPrices.sort((a, b) => a - b);
            const median = sortedPrices[Math.floor(sortedPrices.length / 2)];

            await prisma.priceHistory.create({
              data: {
                itemId: item.id,
                minPrice: Math.round(minPrice),
                maxPrice: Math.round(maxPrice),
                avgPrice: Math.round(avgPrice * 100) / 100,
                median: Math.round(median),
                volume: orders.length,
                timestamp: new Date(),
              },
            });
          }
        }

        // Update last polled timestamp
        await prisma.item.update({
          where: { id: item.id },
          data: { lastPolled: new Date() },
        });

        polledCount++;
        console.log(`[Poll Market] Polled ${item.name} (${polledCount}/${items.length})`);
      } catch (error) {
        console.error(`[Poll Market] Error polling ${item.name}:`, error);
        // Continue with next item
      }
    }

    console.log(`[Poll Market] Completed. Polled ${polledCount} items`);

    return NextResponse.json({
      success: true,
      polled: polledCount,
      total: items.length,
    });
  } catch (error) {
    console.error('[Poll Market] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to poll market data' },
      { status: 500 }
    );
  }
}
