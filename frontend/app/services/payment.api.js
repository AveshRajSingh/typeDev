import axios from "axios";

const BASE_URL = "http://localhost:5000";

// Create axios instance with credentials
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Payment API Functions
 */

// Create new payment order
export async function createOrder(planType) {
  try {
    const response = await api.post('/payment/create-order', { planType });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to create order";
    console.error("Create order error:", errorMessage);
    throw new Error(errorMessage);
  }
}

// Submit payment transaction
export async function submitTransaction(orderId, upiTransactionId, screenshot = null) {
  try {
    const formData = new FormData();
    formData.append('orderId', orderId);
    formData.append('upiTransactionId', upiTransactionId);
    
    if (screenshot) {
      formData.append('screenshot', screenshot);
    }
    
    const response = await api.post('/payment/submit-transaction', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to submit transaction";
    console.error("Submit transaction error:", errorMessage);
    throw new Error(errorMessage);
  }
}

// Get order status
export async function getOrderStatus(orderId) {
  try {
    const response = await api.get(`/payment/order-status/${orderId}`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to get order status";
    console.error("Get order status error:", errorMessage);
    throw new Error(errorMessage);
  }
}

// Get user's payment history
export async function getMyOrders(page = 1, limit = 10, includePendingDetails = false) {
  try {
    const response = await api.get('/payment/my-orders', {
      params: { page, limit, includePendingDetails }
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to get orders";
    console.error("Get my orders error:", errorMessage);
    throw new Error(errorMessage);
  }
}

// Admin: Get pending orders
export async function getPendingOrders(status = 'submitted', page = 1, limit = 20) {
  try {
    const response = await api.get('/payment/pending-orders', {
      params: { status, page, limit }
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to get pending orders";
    console.error("Get pending orders error:", errorMessage);
    throw new Error(errorMessage);
  }
}

// Admin: Verify order
export async function verifyOrder(orderId, action, notes = '') {
  try {
    const response = await api.patch(`/payment/verify/${orderId}`, {
      action,
      notes
    });
    
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to verify order";
    console.error("Verify order error:", errorMessage);
    throw new Error(errorMessage);
  }
}

// Admin: Reconcile bank statement
export async function reconcilePayments(csvFile) {
  try {
    const formData = new FormData();
    formData.append('csvFile', csvFile);
    
    const response = await api.post('/payment/reconcile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to reconcile payments";
    console.error("Reconcile payments error:", errorMessage);
    throw new Error(errorMessage);
  }
}

// Admin: Get notifications
export async function getNotifications(isRead = null, limit = 20) {
  try {
    const params = { limit };
    if (isRead !== null) {
      params.isRead = isRead;
    }
    
    const response = await api.get('/payment/notifications', { params });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to get notifications";
    console.error("Get notifications error:", errorMessage);
    throw new Error(errorMessage);
  }
}

// Admin: Mark notification as read
export async function markNotificationRead(notificationId) {
  try {
    const response = await api.patch(`/payment/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to mark notification as read";
    console.error("Mark notification read error:", errorMessage);
    throw new Error(errorMessage);
  }
}
