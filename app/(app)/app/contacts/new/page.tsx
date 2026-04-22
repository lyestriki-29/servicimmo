import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { ContactForm } from "./ContactForm";

export default function NewContactPage() {
  return (
    <div className="max-w-3xl">
      <Link
        href="/app/contacts"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden /> Retour aux contacts
      </Link>
      <h1 className="mb-6 text-2xl font-semibold">Nouveau contact</h1>
      <ContactForm />
    </div>
  );
}
