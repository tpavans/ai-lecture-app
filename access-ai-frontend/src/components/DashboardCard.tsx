"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useAccessibility } from "../context/AccessibilityContext";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  glowColor: string;
  badge?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  icon: Icon,
  href,
  glowColor,
  badge,
}) => {
  const { speak } = useAccessibility();

  return (
    <Link href={href} passHref legacyBehavior>
      <motion.a
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onFocus={() => speak(`${title}. ${description}.`)}
        className="relative block h-full p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md overflow-hidden cursor-pointer group focus:outline-none focus:ring-2 focus:ring-violet-500/80"
        aria-label={`${title} page. ${description}`}
      >
        {/* Glow effect on hover */}
        <div
          className={`absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl -z-10`}
          style={{
            background: `radial-gradient(circle 120px at var(--x, 50%) var(--y, 50%), ${glowColor}, transparent)`,
          }}
        />

        {/* Outer radial light overlay */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full filter blur-xl -z-10" />

        <div className="flex flex-col h-full justify-between gap-4">
          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-xl bg-white/5 border border-white/10 text-white transition-colors group-hover:bg-violet-600/20 group-hover:border-violet-500/40`}>
              <Icon size={24} className="transition-transform group-hover:rotate-6" />
            </div>

            {badge && (
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider text-violet-400 bg-violet-950/40 border border-violet-800/40 rounded-full uppercase">
                {badge}
              </span>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-violet-400 transition-colors">
              {title}
            </h3>
            <p className="text-xs text-white/50 leading-relaxed font-medium">
              {description}
            </p>
          </div>
        </div>
      </motion.a>
    </Link>
  );
};
