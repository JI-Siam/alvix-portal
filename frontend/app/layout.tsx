import './globals.css';
export const metadata = {
  title: 'Alvix Education Consultancy Portal',
  icons: { icon: '/logo.jpg', apple: '/logo.jpg' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
