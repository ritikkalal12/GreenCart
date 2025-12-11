import React from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ProductList = () => {
  const { products, currency, axios, fetchProducts } = useAppContext();

  const toggleStock = async (id, inStock) => {
    try {
      const { data } = await axios.post('/api/product/stock', { id, inStock });
      if (data.success) {
        fetchProducts();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // new state for edit modal (files + previews)
  const [editingProduct, setEditingProduct] = React.useState(null);
  const [editFields, setEditFields] = React.useState({
    name: '',
    description: '',
    category: '',
    price: '',
    offerPrice: '',
    inStock: true,
  });
  const [imageFiles, setImageFiles] = React.useState([]); // File[]
  const [imagePreviews, setImagePreviews] = React.useState([]); // string[]
  const [isSaving, setIsSaving] = React.useState(false);

  // delete confirm modal state
  const [deleteProductId, setDeleteProductId] = React.useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const openEdit = (product) => {
    setEditingProduct(product._id);
    setEditFields({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      price: product.price ?? product.productPrice ?? '',
      offerPrice: product.offerPrice ?? '',
      inStock: !!product.inStock,
    });
    // use existing image URLs as previews
    setImagePreviews((product.image && product.image.slice(0, 4)) || []);
    setImageFiles([]); // clear local file selection
  };

  const closeEdit = () => {
    setEditingProduct(null);
    setImageFiles([]);
    setImagePreviews([]);
    setIsSaving(false);
  };

  const handleEditChange = (field, value) => {
    setEditFields((prev) => ({ ...prev, [field]: value }));
  };

  const openDeleteConfirm = (id) => {
    setDeleteProductId(id);
    setShowDeleteConfirm(true);
  };
  const closeDeleteConfirm = () => {
    setDeleteProductId(null);
    setShowDeleteConfirm(false);
  };
  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      const { data } = await axios.post('/api/product/delete', {
        id: deleteProductId,
      });
      if (data.success) {
        toast.success(data.message || 'Product deleted');
        fetchProducts();
        closeDeleteConfirm();
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error.message || 'Delete failed'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // file select handler (allow up to 4)
  const onSelectFiles = (filesList) => {
    const files = Array.from(filesList).slice(0, 4);
    const combined = [...imageFiles, ...files].slice(0, 4);
    setImageFiles(combined);

    // build previews for files + keep existing previews up to 4 slots
    const filePreviews = combined.map((f) => URL.createObjectURL(f));
    // merge existing remote previews if fewer than 4 and no local file for that slot
    const merged = [...filePreviews];
    for (let i = merged.length; i < 4; i++) {
      if (imagePreviews[i]) merged.push(imagePreviews[i]);
    }
    setImagePreviews(merged.slice(0, 4));
  };

  const removePreviewAt = (index) => {
    // remove from local files if present at index (local files shown first)
    if (index < imageFiles.length) {
      const newFiles = [...imageFiles];
      URL.revokeObjectURL(newFiles[index]);
      newFiles.splice(index, 1);
      setImageFiles(newFiles);
      setImagePreviews(newFiles.map((f) => URL.createObjectURL(f)));
    } else {
      // remove remote preview
      const newPreviews = [...imagePreviews];
      newPreviews.splice(index, 1);
      setImagePreviews(newPreviews);
    }
  };

  const saveEdit = async () => {
    try {
      setIsSaving(true);

      // If any file selected, send multipart/form-data (reuse add product style)
      if (imageFiles.length > 0) {
        const formData = new FormData();
        // productData as JSON string (server's addProduct uses this shape)
        formData.append(
          'productData',
          JSON.stringify({
            id: editingProduct,
            name: editFields.name,
            description: editFields.description,
            category: editFields.category,
            price: Number(editFields.price) || 0,
            offerPrice: Number(editFields.offerPrice) || 0,
            inStock: editFields.inStock,
          })
        );
        // append files (key 'images' expected by multer)
        imageFiles.forEach((file) => formData.append('images', file));

        const { data } = await axios.post('/api/product/update', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (data.success) {
          toast.success(data.message || 'Product updated');
          fetchProducts();
          closeEdit();
        } else {
          toast.error(data.message || 'Update failed');
        }
      } else {
        // no files, send JSON payload (update image remains unchanged or empty array if previews cleared)
        const payload = {
          id: editingProduct,
          name: editFields.name,
          description: editFields.description,
          category: editFields.category,
          price: Number(editFields.price) || 0,
          offerPrice: Number(editFields.offerPrice) || 0,
          inStock: editFields.inStock,
          image: imagePreviews.slice(0, 4), // keep current remote previews if any
        };
        const { data } = await axios.post('/api/product/update', payload);
        if (data.success) {
          toast.success(data.message || 'Product updated');
          fetchProducts();
          closeEdit();
        } else {
          toast.error(data.message || 'Update failed');
        }
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error.message || 'Save failed'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // keep deleteProduct name for any external refs -> opens confirm modal
  const deleteProduct = (id) => openDeleteConfirm(id);

  // build categories from products for select options
  const categories = React.useMemo(() => {
    const s = new Set();
    products.forEach((p) => {
      if (p.category) s.add(p.category);
    });
    return Array.from(s);
  }, [products]);

  return (
    <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between'>
      <div className='w-full md:p-10 p-4'>
        <h2 className='pb-4 text-lg font-medium'>All Products</h2>
        <div className='flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20'>
          <table className='md:table-auto table-fixed w-full overflow-hidden'>
            <thead className='text-gray-900 text-sm text-left'>
              <tr>
                <th className='px-4 py-3 font-semibold truncate'>Product</th>
                <th className='px-4 py-3 font-semibold truncate'>Category</th>
                <th className='px-4 py-3 font-semibold truncate hidden md:block'>
                  Selling Price
                </th>
                <th className='px-4 py-3 font-semibold truncate'>In Stock</th>
                <th className='px-4 py-3 font-semibold truncate'>Actions</th>
              </tr>
            </thead>
            <tbody className='text-sm text-gray-500'>
              {products.map((product) => (
                <tr key={product._id} className='border-t border-gray-500/20'>
                  <td className='md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate'>
                    <div className='border border-gray-300 rounded p-2'>
                      <img
                        src={product.image?.[0]}
                        alt='Product'
                        className='w-16'
                      />
                    </div>
                    <span className='truncate max-sm:hidden w-full'>
                      {product.name}
                    </span>
                  </td>
                  <td className='px-4 py-3'>{product.category}</td>
                  <td className='px-4 py-3 max-sm:hidden'>
                    {currency}
                    {product.offerPrice}
                  </td>
                  <td className='px-4 py-3'>
                    <label className='relative inline-flex items-center cursor-pointer text-gray-900 gap-3'>
                      <input
                        onClick={() =>
                          toggleStock(product._id, !product.inStock)
                        }
                        checked={product.inStock}
                        type='checkbox'
                        className='sr-only peer'
                      />
                      <div className='w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200'></div>
                      <span className='dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5'></span>
                    </label>
                  </td>
                  <td className='px-4 py-3 align-middle'>
                    <div className='h-full flex flex-col'>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => openEdit(product)}
                          className='text-sm bg-yellow-500 text-white px-3 py-1 rounded'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProduct(product._id)}
                          className='text-sm bg-red-600 text-white px-3 py-1 rounded'
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal (scrollable, improved UI) */}
      {editingProduct && (
        <div
          onClick={closeEdit}
          className='fixed inset-0 z-40 flex items-start justify-center pt-12 bg-black/50'
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className='bg-white rounded p-6 w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-lg'
            role='dialog'
            aria-modal='true'
          >
            <h3 className='text-lg font-medium mb-4 flex justify-between items-center'>
              <span>Edit Product</span>
              <span className='text-sm text-gray-500'>
                Product ID: {editingProduct}
              </span>
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium block mb-2'>
                  Product Images (up to 4)
                </label>
                <div className='flex flex-wrap gap-2 mb-2'>
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className='w-24 h-24 border rounded relative flex items-center justify-center bg-gray-50'
                    >
                      {imagePreviews[idx] ? (
                        <>
                          <img
                            src={imagePreviews[idx]}
                            alt={`preview-${idx}`}
                            className='w-full h-full object-cover rounded'
                          />
                          <button
                            type='button'
                            onClick={() => removePreviewAt(idx)}
                            className='absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center'
                            aria-label='Remove image'
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <div className='text-xs text-gray-400'>Empty</div>
                      )}
                    </div>
                  ))}
                </div>

                <input
                  type='file'
                  accept='image/*'
                  multiple
                  onChange={(e) => onSelectFiles(e.target.files)}
                  className='block mb-1'
                />
                <p className='text-xs text-gray-500'>
                  Drag & drop not implemented — select up to 4 images. Files
                  will replace or add to previews.
                </p>
              </div>

              <div className='space-y-3'>
                <div>
                  <label className='text-sm'>Product Name</label>
                  <input
                    value={editFields.name}
                    onChange={(e) => handleEditChange('name', e.target.value)}
                    className='border p-2 rounded w-full'
                  />
                </div>

                <div>
                  <label className='text-sm'>Product Description</label>
                  <textarea
                    value={editFields.description}
                    onChange={(e) =>
                      handleEditChange('description', e.target.value)
                    }
                    className='border p-2 rounded w-full h-28'
                  />
                </div>

                <div>
                  <label className='text-sm'>Category</label>
                  <select
                    value={editFields.category}
                    onChange={(e) =>
                      handleEditChange('category', e.target.value)
                    }
                    className='border p-2 rounded w-full'
                  >
                    <option value=''>Select Category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='text-sm'>Product Price</label>
                    <input
                      value={editFields.price}
                      onChange={(e) =>
                        handleEditChange('price', e.target.value)
                      }
                      className='border p-2 rounded w-full'
                      type='number'
                    />
                  </div>
                  <div>
                    <label className='text-sm'>Offer Price</label>
                    <input
                      value={editFields.offerPrice}
                      onChange={(e) =>
                        handleEditChange('offerPrice', e.target.value)
                      }
                      className='border p-2 rounded w-full'
                      type='number'
                    />
                  </div>
                </div>

                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={editFields.inStock}
                    onChange={(e) =>
                      handleEditChange('inStock', e.target.checked)
                    }
                  />
                  In Stock
                </label>
              </div>
            </div>

            <div className='flex justify-end gap-2 mt-4'>
              <button onClick={closeEdit} className='px-4 py-2 rounded border'>
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={isSaving}
                className='px-4 py-2 rounded bg-primary text-white disabled:opacity-60'
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          onClick={closeDeleteConfirm}
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className='bg-white rounded p-6 w-96 shadow-lg'
          >
            <h4 className='text-lg font-semibold mb-2'>Warning</h4>
            <p className='text-sm text-gray-700 mb-4'>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>
            <div className='flex justify-end gap-2'>
              <button
                onClick={closeDeleteConfirm}
                className='px-3 py-2 rounded border'
              >
                No
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className='px-3 py-2 rounded bg-red-600 text-white disabled:opacity-60'
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
