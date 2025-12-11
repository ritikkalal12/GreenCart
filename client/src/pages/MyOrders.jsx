import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const { currency, axios, user } = useAppContext();

  // confirmation modal state
  const [confirm, setConfirm] = useState({ open: false, orderId: null });
  const [isCanceling, setIsCanceling] = useState(false);

  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get('/api/order/user');
      if (data.success) {
        setMyOrders(data.orders);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to load orders');
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  const openCancel = (orderId) => {
    setConfirm({ open: true, orderId });
  };

  const closeConfirm = () => {
    setConfirm({ open: false, orderId: null });
  };

  const confirmCancel = async () => {
    if (!confirm.orderId) return;
    try {
      setIsCanceling(true);
      const token = (user && user.token) || localStorage.getItem('token');
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      const { data } = await axios.post(
        '/api/order/status/cancel',
        { id: confirm.orderId },
        config
      );
      if (data?.success) {
        setMyOrders((prev) =>
          prev.map((o) =>
            o._id === confirm.orderId
              ? { ...o, status: 'Cancelled', orderStatus: 'Cancelled' }
              : o
          )
        );
        toast.success('Order cancelled');
      } else {
        toast.error(data?.message || 'Failed to cancel order');
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || 'Failed to cancel order';
      toast.error(msg);
    } finally {
      setIsCanceling(false);
      closeConfirm();
      fetchMyOrders().catch(() => {});
    }
  };

  // when should invoice be available?
  const canDownloadInvoice = (order) => {
    if (order.paymentType === 'COD') return true; // always for COD
    if (order.paymentType === 'Online') return !!order.isPaid; // only after successful payment
    return false;
  };

  // Download invoice as PDF
  const downloadInvoice = async (orderId) => {
    try {
      const token = (user && user.token) || localStorage.getItem('token');
      const config = {
        responseType: 'blob',
        ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
      };

      const { data } = await axios.get(`/api/order/invoice/${orderId}`, config);

      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error('Failed to download invoice');
    }
  };

  return (
    <div className='mt-16 pb-16'>
      <div className='flex flex-col items-end w-max mb-8'>
        <p className='text-2xl font-medium uppercase'>My orders</p>
        <div className='w-16 h-0.5 bg-primary rounded-full'></div>
      </div>
      {myOrders.map((order, index) => (
        <div
          key={index}
          className='border border-gray-300 rounded-lg mb-10 p-4 py-5 max-w-4xl'
        >
          <p className='flex justify-between md:items-center text-gray-400 md:font-medium max-md:flex-col gap-2'>
            <span>OrderId : {order._id}</span>
            <span>Payment : {order.paymentType}</span>
            <span>
              Total Amount : {currency}
              {order.amount}
            </span>
          </p>
          {order.items.map((item, index) => (
            <div
              key={index}
              className={`relative bg-white text-gray-500/70 ${
                order.items.length !== index + 1 && 'border-b'
              } border-gray-300 flex flex-col md:flex-row md:items-center justify-between p-4 py-5 md:gap-16 w-full max-w-4xl`}
            >
              <div className='flex items-center mb-4 md:mb-0'>
                <div className='bg-primary/10 p-4 rounded-lg'>
                  <img
                    src={
                      (item.product &&
                        item.product.image &&
                        item.product.image[0]) ||
                      ''
                    }
                    alt=''
                    className='w-16 h-16 object-cover'
                  />
                </div>
                <div className='ml-4'>
                  <h2 className='text-xl font-medium text-gray-800'>
                    {item.product?.name || 'Product'}
                  </h2>
                  <p>Category: {item.product?.category}</p>
                </div>
              </div>

              <div className='flex flex-col justify-center md:ml-8 mb-4 md:mb-0'>
                <p>Quantity: {item.quantity || '1'}</p>
                <p>Status: {order.status || order.orderStatus}</p>
                <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <p className='text-primary text-lg font-medium'>
                Amount: {currency}
                {(item.product?.offerPrice || item.product?.price || 0) *
                  (item.quantity || 1)}
              </p>
            </div>
          ))}

          {/* Actions area: invoice + cancel */}
          <div className='flex justify-between mt-4 gap-3'>
            {canDownloadInvoice(order) && (
              <button
                onClick={() => downloadInvoice(order._id)}
                className='px-4 py-2 border border-primary text-primary rounded hover:bg-primary/5'
              >
                Download Invoice
              </button>
            )}

            {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
              <button
                onClick={() => openCancel(order._id)}
                className='px-4 py-2 bg-red-600 text-white rounded hover:opacity-90'
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Confirmation modal */}
      {confirm.open && (
        <div
          onClick={closeConfirm}
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className='bg-white rounded-lg w-full max-w-md p-6 shadow-lg'
          >
            <h3 className='text-lg font-medium mb-4'>Cancel Order</h3>
            <p className='mb-6'>Are you sure you want to cancel the order?</p>
            <div className='flex justify-end gap-3'>
              <button
                onClick={closeConfirm}
                className='px-4 py-2 border rounded'
              >
                No
              </button>
              <button
                onClick={confirmCancel}
                disabled={isCanceling}
                className='px-4 py-2 bg-red-600 text-white rounded disabled:opacity-60'
              >
                {isCanceling ? 'Cancelling...' : 'Yes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
