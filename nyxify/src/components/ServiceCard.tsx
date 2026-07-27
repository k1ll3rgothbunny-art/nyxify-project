export default function ServiceCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="nyx-card group p-6 transition-colors hover:border-nyx-pink/50">
      <div className="mb-4 h-1 w-10 rounded-full bg-gradient-to-r from-nyx-pink to-nyx-violet" />
      <h3 className="nyx-heading text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-nyx-muted">{description}</p>
    </div>
  );
}
