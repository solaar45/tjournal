"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/i18n/LanguageContext';
import { formatCurrency, formatSignedCurrency, getAmountColorClass, EquityPoint } from '@/lib/tradeUtils';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SparklineCardsProps {
  equityPoints: EquityPoint[];
  locale: string;
}

export function SparklineCards({ equityPoints, locale }: SparklineCardsProps) {
  const { t } = useTranslation();

  const lastPoint = equityPoints[equityPoints.length - 1] || { cumulativePnl: 0, drawdown: 0 };
  const currentPnl = lastPoint.cumulativePnl;
  const currentDrawdown = lastPoint.drawdown;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* 1. Daily Cumulative PnL Card */}
      <Card className="p-3.5 bg-card border-border/70 hover:border-border hover:shadow-eggplore-card transition-all">
        <div className="flex items-center justify-between mb-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t.kpi.dailyCumulativePnL}
          </div>
          <TrendingUp className="h-3.5 w-3.5 text-[#00C48C]" />
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-xl font-bold font-mono tracking-tight ${getAmountColorClass(currentPnl)}`}>
            {formatSignedCurrency(currentPnl, locale)}
          </span>
        </div>

        {/* Mini Chart */}
        <div className="h-24 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityPoints} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00C48C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00C48C" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="dateLabel"
                hide={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
                interval="preserveStartEnd"
              />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as EquityPoint;
                    return (
                      <div className="bg-card/95 backdrop-blur-md border border-border/80 text-foreground text-xs p-2 rounded-xl shadow-eggplore font-mono">
                        <div className="text-[10px] text-muted-foreground">{data.dateLabel}</div>
                        <div className={`font-bold ${getAmountColorClass(data.cumulativePnl)}`}>
                          {formatSignedCurrency(data.cumulativePnl, locale)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulativePnl"
                stroke="#00C48C"
                strokeWidth={2.5}
                fill="url(#pnlGradient)"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 2. Drawdown Card */}
      <Card className="p-3.5 bg-card border-border/70 hover:border-border hover:shadow-eggplore-card transition-all">
        <div className="flex items-center justify-between mb-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t.kpi.drawdown}
          </div>
          <TrendingDown className="h-3.5 w-3.5 text-[#FF647C]" />
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-xl font-bold font-mono tracking-tight ${getAmountColorClass(currentDrawdown)}`}>
            {formatSignedCurrency(currentDrawdown, locale)}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {t.kpi.currentDrawdown}
          </span>
        </div>

        {/* Mini Chart */}
        <div className="h-24 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityPoints} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="ddGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF647C" stopOpacity={0.0} />
                  <stop offset="95%" stopColor="#FF647C" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="dateLabel"
                hide={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
                interval="preserveStartEnd"
              />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as EquityPoint;
                    return (
                      <div className="bg-card/95 backdrop-blur-md border border-border/80 text-foreground text-xs p-2 rounded-xl shadow-eggplore font-mono">
                        <div className="text-[10px] text-muted-foreground">{data.dateLabel}</div>
                        <div className={`font-bold ${getAmountColorClass(data.drawdown)}`}>
                          {formatSignedCurrency(data.drawdown, locale)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="drawdown"
                stroke="#FF647C"
                strokeWidth={2.5}
                fill="url(#ddGradient)"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
