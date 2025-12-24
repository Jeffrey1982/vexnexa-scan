import { permanentRedirect } from 'next/navigation';

export default function RootPage() {
  // Permanent 308 redirect to English version
  // This tells Google "/" is permanently at "/en"
  permanentRedirect('/en');
}
