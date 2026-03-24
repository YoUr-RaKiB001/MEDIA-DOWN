import React from "react";
import { Settings, Shield, Bell, Smartphone, HelpCircle, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

export default function SettingsPage() {
  const sections = [
    {
      title: "App Settings",
      items: [
        { icon: Bell, label: "Notifications", value: "Enabled" },
        { icon: Smartphone, label: "Download Path", value: "/Downloads/Vortex" },
        { icon: Shield, label: "Security & Privacy", value: "" },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help & FAQ", value: "" },
        { icon: HelpCircle, label: "Terms of Service", value: "" },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold gradient-text">Settings</h1>
        <p className="text-slate-400 text-sm">Configure your app preferences.</p>
      </div>

      <div className="flex flex-col gap-8">
        {sections.map((section, idx) => (
          <div key={idx} className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{section.title}</h3>
            <div className="flex flex-col gap-2">
              {section.items.map((item, i) => (
                <button
                  key={i}
                  className="glass-card flex items-center justify-between p-4 hover:bg-glass-border transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                      <item.icon size={20} />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-sm">{item.label}</span>
                      {item.value && <span className="text-xs font-medium text-slate-500">{item.value}</span>}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
