import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to default locale (English)
  // This ensures "/" always has a valid route handler
  // Middleware will handle locale detection, but this is a fallback
  redirect('/en');
}
