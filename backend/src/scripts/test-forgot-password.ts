import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

async function testForgotPassword() {
    console.log('🧪 Testing Forgot Password Endpoint...\n');

    const API_URL = process.env.FRONTEND_URL?.replace('3000', '3001') || 'http://localhost:3001';
    const endpoint = `${API_URL}/api/auth/forgot-password`;

    // Test with a known email (you should replace this with a real email from your database)
    const testEmail = 'teste@example.com'; // REPLACE WITH REAL EMAIL

    console.log(`📧 Sending forgot-password request for: ${testEmail}`);
    console.log(`🌐 Endpoint: ${endpoint}\n`);

    try {
        const response = await axios.post(endpoint, {
            email: testEmail
        });

        console.log('✅ Response Status:', response.status);
        console.log('✅ Response Data:', response.data);
        console.log('\n📬 Check the email inbox for the password reset link!');
    } catch (error: any) {
        if (error.response) {
            console.error('❌ Error Response:', error.response.status);
            console.error('❌ Error Data:', error.response.data);
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

testForgotPassword();
