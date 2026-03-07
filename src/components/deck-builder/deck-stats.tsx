"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import type { DeckValidation } from "@/lib/cards/types";
import { COLOR_HEX, DECK_MIN_CARDS, DECK_MAX_CARDS } from "@/lib/utils";
import { colors } from "@/lib/design-tokens";

interface DeckStatsProps {
  validation: DeckValidation;
}

const PIE_COLORS = [colors.magenta, colors.blue, colors.cyan, colors.yellow, colors.light];

export function DeckStats({ validation }: DeckStatsProps) {
  const { stats, errors, warnings } = validation;

  // Cost curve data
  const costCurveData = Object.entries(stats.eddieCostCurve)
    .map(([cost, count]) => ({ cost: Number(cost), count }))
    .sort((a, b) => a.cost - b.cost);

  // Type distribution data
  const typeData = Object.entries(stats.cardTypeDistribution)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({ name: type, value: count }));

  // Color distribution from RAM budget
  const colorData = Object.entries(stats.ramBudgetByColor)
    .filter(([, budget]) => budget.used > 0)
    .map(([color, budget]) => ({ name: color, value: budget.used }));

  return (
    <div className="space-y-4">
      {/* Total cards */}
      <div className="p-3 bg-cyber-dark/50 border border-cyber-grey rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-mono uppercase text-cyber-light/50">
            Total Cards
          </span>
          <span
            className={`text-lg font-mono font-bold ${
              stats.totalCards >= DECK_MIN_CARDS &&
              stats.totalCards <= DECK_MAX_CARDS
                ? "text-cyber-cyan"
                : "text-cyber-magenta"
            }`}
          >
            {stats.totalCards}
          </span>
        </div>
        <div className="w-full bg-cyber-grey rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all bg-cyber-cyan"
            style={{
              width: `${Math.min((stats.totalCards / DECK_MAX_CARDS) * 100, 100)}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-cyber-light/30 mt-0.5">
          <span>{DECK_MIN_CARDS} min</span>
          <span>{DECK_MAX_CARDS} max</span>
        </div>
      </div>

      {/* RAM Budget */}
      {Object.keys(stats.ramBudgetByColor).length > 0 && (
        <div className="p-3 bg-cyber-dark/50 border border-cyber-grey rounded-lg">
          <h3 className="text-sm font-mono uppercase text-cyber-light/50 mb-2">
            RAM Budget
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.ramBudgetByColor).map(([color, budget]) => (
              <div key={color}>
                <div className="flex items-center justify-between text-xs font-mono mb-0.5">
                  <span style={{ color: COLOR_HEX[color] ?? "#d1d5db" }}>
                    {color}
                  </span>
                  <span
                    className={
                      budget.used > budget.provided
                        ? "text-cyber-magenta"
                        : "text-cyber-light/60"
                    }
                  >
                    {budget.used}/{budget.provided}
                  </span>
                </div>
                <div className="w-full bg-cyber-grey rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: budget.provided > 0
                        ? `${Math.min((budget.used / budget.provided) * 100, 100)}%`
                        : budget.used > 0
                          ? "100%"
                          : "0%",
                      backgroundColor:
                        budget.used > budget.provided
                          ? colors.magenta
                          : COLOR_HEX[color] ?? colors.light,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Eddie Cost Curve */}
      {costCurveData.length > 0 && (
        <div className="p-3 bg-cyber-dark/50 border border-cyber-grey rounded-lg">
          <h3 className="text-sm font-mono uppercase text-cyber-light/50 mb-2">
            Eddie Cost Curve
          </h3>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={costCurveData}>
              <XAxis
                dataKey="cost"
                tick={{ fontSize: 10, fill: colors.light }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.dark,
                  border: `1px solid ${colors.grey}`,
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: colors.yellow }}
              />
              <Bar dataKey="count" fill={colors.cyan} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Type Distribution */}
      {typeData.length > 0 && (
        <div className="p-3 bg-cyber-dark/50 border border-cyber-grey rounded-lg">
          <h3 className="text-sm font-mono uppercase text-cyber-light/50 mb-2">
            Type Distribution
          </h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={80} height={80}>
              <PieChart>
                <Pie
                  data={typeData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={35}
                  paddingAngle={2}
                >
                  {typeData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1">
              {typeData.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs font-mono">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                    }}
                  />
                  <span className="text-cyber-light/60 capitalize">
                    {entry.name}
                  </span>
                  <span className="text-cyber-light/40">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Color Distribution */}
      {colorData.length > 0 && (
        <div className="p-3 bg-cyber-dark/50 border border-cyber-grey rounded-lg">
          <h3 className="text-sm font-mono uppercase text-cyber-light/50 mb-2">
            Color Distribution
          </h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={80} height={80}>
              <PieChart>
                <Pie
                  data={colorData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={35}
                  paddingAngle={2}
                >
                  {colorData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={COLOR_HEX[entry.name] ?? "#d1d5db"}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1">
              {colorData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs font-mono">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: COLOR_HEX[entry.name] ?? "#d1d5db",
                    }}
                  />
                  <span className="text-cyber-light/60 capitalize">
                    {entry.name}
                  </span>
                  <span className="text-cyber-light/40">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="p-3 bg-cyber-dark/50 border border-cyber-grey rounded-lg grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs font-mono uppercase text-cyber-light/40">
            Sell Tags
          </div>
          <div
            className={`text-sm font-mono ${
              stats.sellTagRatio < 0.3
                ? "text-cyber-yellow"
                : "text-cyber-light"
            }`}
          >
            {Math.round(stats.sellTagRatio * 100)}%
          </div>
        </div>
        <div>
          <div className="text-xs font-mono uppercase text-cyber-light/40">
            Blockers
          </div>
          <div
            className={`text-sm font-mono ${
              stats.blockerCount < 4
                ? "text-cyber-yellow"
                : "text-cyber-light"
            }`}
          >
            {stats.blockerCount}
          </div>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="p-3 bg-cyber-magenta/10 border border-cyber-magenta/30 rounded-lg">
          <h3 className="text-xs font-mono uppercase text-cyber-magenta mb-1">
            Errors
          </h3>
          <ul className="space-y-0.5">
            {errors.map((e, i) => (
              <li key={i} className="text-xs text-cyber-magenta/80">
                • {e}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="p-3 bg-cyber-yellow/5 border border-cyber-yellow/20 rounded-lg">
          <h3 className="text-xs font-mono uppercase text-cyber-yellow mb-1">
            Warnings
          </h3>
          <ul className="space-y-0.5">
            {warnings.map((w, i) => (
              <li key={i} className="text-xs text-cyber-yellow/70">
                • {w}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
