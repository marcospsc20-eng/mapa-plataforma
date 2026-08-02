import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Codinome MAPA',
  description: 'Plataforma Interativa da Família',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}