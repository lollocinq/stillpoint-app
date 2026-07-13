"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

const links = [
  { href: "/", label: "Home" },
  { href: "/presence-guide", label: "Presence Guide" },
  { href: "/krishnamurti-guide", label: "Krishnamurti Guide" },
];

export default function Nav() {
  const pathname = usePathname();
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <nav>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={pathname === link.href ? "active" : ""}
        >
          {link.label}
        </Link>
      ))}
      {session && (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            supabase.auth.signOut();
          }}
        >
          Sign out ({session.user.email})
        </a>
      )}
    </nav>
  );
}
