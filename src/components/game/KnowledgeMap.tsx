export default function KnowledgeMap() {
  return (
    <div className="border border-emerald-800 bg-slate-950 p-4 text-xs leading-relaxed text-slate-300 font-mono whitespace-pre">
{`DATABASE
│
├── STRUCTURE
│   ├── Attributes
│   ├── Keys
│   └── Dependencies
│
├── NORMALIZATION
│   ├── 1NF
│   ├── Partial Dependency
│   ├── 2NF
│   ├── Transitive Dependency
│   └── 3NF
│
└── INTEGRITY
    ├── Entity
    ├── Referential
    ├── Domain
    └── Unique`}
    </div>
  );
}
