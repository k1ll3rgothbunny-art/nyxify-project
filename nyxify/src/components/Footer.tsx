export default function Footer() {
  return (
    <footer className="border-t border-nyx-line/60 py-10 text-center text-sm text-nyx-muted">
      <p>© {new Date().getFullYear()} Nyxify. All custom work, all rights reserved.</p>
      <p className="mt-1">
        <a href="https://discord.gg/F7wXr4tMdR" className="hover:text-nyx-pink2">Join the Discord community</a>
      </p>
    </footer>
  );
}
