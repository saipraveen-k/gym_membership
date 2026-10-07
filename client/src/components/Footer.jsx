import { Link } from 'react-router-dom';
import { Dumbbell, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500 text-white">
              <Dumbbell className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-white">
              IRON<span className="text-accent-500">PEAK</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed text-zinc-400">
            A modern gym membership application. Browse packages, apply online and manage
            your fitness journey - all in one place.
          </p>
        </div>

        <nav aria-label="Quick links">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-300">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>
              <Link to="/" className="transition hover:text-accent-400">
                Home
              </Link>
            </li>
            <li>
              <Link to="/memberships" className="transition hover:text-accent-400">
                Memberships
              </Link>
            </li>
            <li>
              <Link to="/register" className="transition hover:text-accent-400">
                Join Now
              </Link>
            </li>
            <li>
              <Link to="/login" className="transition hover:text-accent-400">
                Member Login
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Account">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-300">
            Your Account
          </h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>
              <Link to="/dashboard" className="transition hover:text-accent-400">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/my-memberships" className="transition hover:text-accent-400">
                My Applications
              </Link>
            </li>
            <li>
              <Link to="/profile" className="transition hover:text-accent-400">
                Profile
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-300">
            Contact
          </h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" aria-hidden="true" />
              <span>12 Fitness Avenue, Sports City</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-accent-500" aria-hidden="true" />
              <a href="tel:+911234567890" className="transition hover:text-accent-400">
                +91 12345 67890
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-accent-500" aria-hidden="true" />
              <a href="mailto:hello@ironpeak.example" className="transition hover:text-accent-400">
                hello@ironpeak.example
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-zinc-900 py-5">
        <p className="container-page text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} Iron Peak Gym Membership Application. Built as a
          full-stack MERN project.
        </p>
      </div>
    </footer>
  );
}
