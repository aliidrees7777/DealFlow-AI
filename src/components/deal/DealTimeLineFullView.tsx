"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, User, Calendar, MapPin, CheckCircle2, Clock } from 'lucide-react';
import clsx from 'clsx';

const transactions = [
  { id: 1, estate: "123 Main St, Los Angeles", buyer: "Sarah Jenkins", date: "Apr 28, 2026", time: "10:30 AM", status: "Signed" },
  { id: 2, estate: "456 Oak Ave, Beverly Hills", buyer: "Michael Ross", date: "May 05, 2026", time: "02:15 PM", status: "Pending" },
  { id: 3, estate: "789 Pine Rd, Santa Monica", buyer: "Harvey Specter", date: "Apr 30, 2026", time: "09:00 AM", status: "Signed" },
  { id: 4, estate: "101 Ocean Dr, Malibu", buyer: "Rachel Zane", date: "May 12, 2026", time: "11:45 AM", status: "Expired" },
  { id: 5, estate: "202 Maple St, Pasadena", buyer: "Louis Litt", date: "May 15, 2026", time: "04:30 PM", status: "Signed" },
  { id: 6, estate: "303 Birch Ln, Glendale", buyer: "Donna Paulsen", date: "May 20, 2026", time: "01:00 PM", status: "Pending" },
  { id: 7, estate: "404 Cedar Wy, Burbank", buyer: "Jessica Pearson", date: "Jun 02, 2026", time: "10:00 AM", status: "Signed" },
  { id: 8, estate: "505 Elm Ct, Hollywood", buyer: "Robert Zane", date: "May 28, 2026", time: "03:30 PM", status: "Pending" },
  { id: 9, estate: "606 Walnut Dr, Irvine", buyer: "Alex Williams", date: "Jun 10, 2026", time: "11:00 AM", status: "Signed" },
  { id: 10, estate: "707 Ash St, Long Beach", buyer: "Katrina Bennett", date: "Jun 15, 2026", time: "12:00 PM", status: "Signed" },
];

export const DealTimeLineFullView = () => {
  return (
    <div className="mt-12 space-y-6">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-2xl font-light text-neutral tracking-tight">
          Active <span className="text-secondary font-medium">Portfolio</span>
        </h2>
        <span className="text-[10px] text-secondary-light/40 uppercase tracking-widest font-bold">10 Records Found</span>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/5 bg-primary-dark/40 backdrop-blur-2xl shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-secondary-light/60">Estate Name</th>
              <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-secondary-light/60">Buyer Name</th>
              <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-secondary-light/60">Date & Time</th>
              <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-secondary-light/60 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {transactions.map((item, index) => (
              <motion.tr 
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary/10 border border-secondary/20 group-hover:bg-secondary group-hover:text-primary-dark transition-all">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-neutral group-hover:text-white transition-colors">{item.estate}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-secondary-light/80">
                    <User className="w-3.5 h-3.5 opacity-40" />
                    {item.buyer}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 text-[13px] text-neutral">
                      <Calendar className="w-3 h-3 text-secondary" />
                      {item.date}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-secondary-light/40 ml-5 italic">
                      {item.time}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className={clsx(
                      "text-[10px] px-3 py-1 rounded-full border font-bold uppercase tracking-tighter",
                      item.status === 'Signed' ? "bg-secondary/10 text-secondary border-secondary/20" : 
                      item.status === 'Pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                      "bg-red-500/10 text-red-500 border-red-500/20"
                    )}>
                      {item.status}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-white/5 group-hover:text-white/40 transition-colors" />
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};