'use client';

import { Clock, User } from 'lucide-react';

type Order = {
  id: string;
  orderType: string;
  platinum: number;
  quantity: number;
  user: string;
  online: boolean;
  createdAt: Date;
};

type OrderBookProps = {
  title: string;
  orders: Order[];
  type: 'buy' | 'sell';
};

export function OrderBook({ title, orders, type }: OrderBookProps) {
  const isBuy = type === 'buy';

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>

      {orders.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Aucun ordre disponible
        </p>
      ) : (
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground border-b border-border pb-2">
            <div>Prix</div>
            <div>Quantité</div>
            <div>Joueur</div>
            <div className="text-right">Status</div>
          </div>

          {/* Orders */}
          {orders.map((order) => (
            <div
              key={order.id}
              className="grid grid-cols-4 gap-4 text-sm py-2 border-b border-border/50 hover:bg-muted/50 transition-colors"
            >
              <div
                className={`font-semibold ${
                  isBuy ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {order.platinum}p
              </div>

              <div className="text-foreground">{order.quantity}</div>

              <div className="text-muted-foreground truncate flex items-center gap-1">
                <User className="h-3 w-3" />
                {order.user}
              </div>

              <div className="text-right">
                {order.online ? (
                  <span className="inline-flex items-center gap-1 text-xs text-green-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    En ligne
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Hors ligne
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
