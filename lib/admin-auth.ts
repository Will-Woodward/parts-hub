import { NextRequest } from 'next/server';
export function isAdmin(request: NextRequest) {
  const expected = process.env.ADMIN_API_KEY;
  const supplied = request.headers.get('x-admin-key');
  return Boolean(expected && supplied && supplied.length === expected.length && supplied === expected);
}
