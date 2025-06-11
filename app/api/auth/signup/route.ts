import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// In-memory user store (replace with database in production)
// This would typically be in a shared database module
let users = [
  {
    id: '1',
    email: 'admin@ddroidd.com',
    password: 'password123', // Plain text for testing - will be hashed in production
    name: 'Admin User',
    role: 'admin'
  },
  {
    id: '2', 
    email: 'user@ddroidd.com',
    password: 'password123', // Plain text for testing - will be hashed in production
    name: 'Test User',
    role: 'user'
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check domain restriction
    if (!email.endsWith('@ddroidd.com')) {
      return NextResponse.json(
        { error: 'Only @ddroidd.com email addresses are allowed' },
        { status: 400 }
      );
    }

    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Store password as plain text for testing (hash in production)
    const hashedPassword = password;

    // Create new user
    const newUser = {
      id: String(users.length + 1),
      email,
      password: hashedPassword,
      name,
      role: 'user'
    };

    // Add to users array (in production, save to database)
    users.push(newUser);

    return NextResponse.json(
      { 
        message: 'Account created successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the users array so it can be used by the auth handler
export { users }; 