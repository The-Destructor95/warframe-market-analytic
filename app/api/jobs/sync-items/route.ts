import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAllItems } from '@/lib/warframe-api';

export async function GET() {
  try {
    console.log('[Sync Items] Starting item synchronization...');

    // Fetch all items from Warframe Market
    const allItems = await getAllItems();

    // Filter for Primed mods only
    const primedMods = allItems.filter(item =>
      item.tags?.includes('mod') &&
      item.i18n?.en?.name?.toLowerCase().startsWith('primed')
    );

    console.log(`[Sync Items] Found ${primedMods.length} Primed mods`);

    // Upsert items to database
    let syncedCount = 0;
    for (const item of primedMods) {
      await prisma.item.upsert({
        where: { urlName: item.slug },
        update: {
          name: item.i18n.en.name,
          tags: item.tags || [],
        },
        create: {
          urlName: item.slug,
          name: item.i18n.en.name,
          category: 'mod',
          tags: item.tags || [],
          tier: 1, // All Primed mods are tier 1 for MVP
          pollInterval: 5, // Poll every 5 minutes
        },
      });
      syncedCount++;
    }

    console.log(`[Sync Items] Synchronized ${syncedCount} items`);

    return NextResponse.json({
      success: true,
      synced: syncedCount,
      items: primedMods.map(i => i.i18n.en.name),
    });
  } catch (error) {
    console.error('[Sync Items] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync items',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
