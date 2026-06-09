import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'PARTNER';
    companyId: string | null;
    phone?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'PARTNER';
      companyId: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'PARTNER';
    companyId: string | null;
  }
}
