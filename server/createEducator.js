
const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

const User = require('./models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

// Read the password without displaying it in the terminal
function askPassword() {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    stdout.write('Enter educator password (minimum 8 characters): ');

    let password = '';
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    const onData = (key) => {
      if (key === '\u0003') {
        cleanup();
        process.exit(1);
      }

      if (key === '\r' || key === '\n') {
        cleanup();
        stdout.write('\n');
        resolve(password);
      } else if (key === '\u007f' || key === '\b') {
        password = password.slice(0, -1);
      } else if (key >= ' ') {
        password += key;
      }
    };

    function cleanup() {
      stdin.removeListener('data', onData);
      stdin.setRawMode(false);
      stdin.pause();
    }

    stdin.on('data', onData);
  });
}

async function createEducator() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing from server/.env');
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing from server/.env');
    }

    const name = await ask('Educator name: ');
    const email = (await ask('Educator email: ')).toLowerCase();
    const password = await askPassword();

    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required.');
    }

    if (password.length < 8) {
      throw new Error('Password must contain at least 8 characters.');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    let user = await User.findOne({ email });

    if (user) {
      user.name = name;
      user.role = 'educator';

      // Preserve the existing password when promoting an existing account.
      await user.save();

      console.log('Existing account successfully promoted to educator.');
    } else {
      user = await User.create({
        name,
        email,
        password,
        role: 'educator',
      });

      console.log('Educator account created successfully.');
    }

    console.log('Educator email:', user.email);
    console.log('Role:', user.role);
    console.log('You can now log in through the Nexora LMS website.');
  } catch (error) {
    console.error('Educator setup failed:', error.message);
    process.exitCode = 1;
  } finally {
    rl.close();
    await mongoose.disconnect().catch(() => {});
  }
}

createEducator();
