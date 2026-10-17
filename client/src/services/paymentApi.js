
const API_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('nexora_token');

const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () =>
      reject(new Error('Unable to load Razorpay checkout. Check your internet connection.'));

    document.body.appendChild(script);
  });

const apiRequest = async (endpoint, body) => {
  const token = getToken();

  if (!token) {
    throw new Error('Please log in as a student before purchasing a course.');
  }

  const response = await fetch(`${API_URL}/payments/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Payment request failed.');
  }

  return result;
};

export const purchaseCourse = async (courseId) => {
  if (!courseId) {
    throw new Error('Course ID is missing.');
  }

  await loadRazorpayScript();

  // The backend determines the course price and creates the order.
  const orderResult = await apiRequest('create-order', { courseId });
  const { order, keyId, course } = orderResult;

  if (!order?.id || !keyId) {
    throw new Error('The server did not return a valid payment order.');
  }

  return new Promise((resolve, reject) => {
    let verificationStarted = false;

    const checkout = new window.Razorpay({
      key: keyId,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      name: 'Nexora LMS',
      description: course?.title || 'Course purchase',

      handler: async (response) => {
        if (verificationStarted) return;
        verificationStarted = true;

        try {
          const verification = await apiRequest('verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          resolve(verification);
        } catch (error) {
          reject(
            new Error(
              `${error.message} Do not retry payment immediately. Check the payment status before trying again.`
            )
          );
        }
      },

      modal: {
        ondismiss: () => {
          if (!verificationStarted) {
            reject(new Error('Payment window closed before verification.'));
          }
        },
      },

      theme: {
        color: '#7653d7',
      },
    });

    checkout.on('payment.failed', (response) => {
      if (verificationStarted) return;

      verificationStarted = true;
      reject(
        new Error(
          response.error?.description || 'Payment failed. Please try again.'
        )
      );
    });

    checkout.open();
  });
};
