import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import './AllProducts.css';
import AllProductsPagination from './AllProductsPagination';

const AllProducts = ({ loggedIn, userType }) => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(15);
  // Get current products for pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const history = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  if (loggedIn) {
    if (userType === 'practitioner') {
      history('/practitioners/me');
    } else if (userType === 'patient') {
      history('/patients/me');
    }
  } else {
    history('/login');
  }

  console.log('usertype: ', userType);

  // Change Pagination Pages
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    const result = await axios.get('/products');
    setProducts(result.data);
    setSearchQuery(result.data);
  };

  // Handle search feature
  const handleSearch = (e) => {
    setProducts(
      searchQuery.filter((product) => {
        return product.name
          .toLowerCase()
          .includes(e.target.value.toLowerCase());
      })
    );
    return products;
  };

  // Get user token
  const token = localStorage.getItem('token');

  // Get user data
  const userData = localStorage.getItem('person');
  const adminId = JSON.parse(userData).id;

  // Handle Delete Product
  const handleDeleteProduct = (deletedProduct) => {
    fetch(`https://new-back.fly.dev/admins/${adminId}/products/${deletedProduct.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
        Accept: '*/*',
      },
    }).then((result) => {
      if (result.ok) {
        setProducts((products) => {
          return products.filter((product) => product.id != deletedProduct.id);
        });
      }
    });
  };

  return (
    <div className='all-products-main-container'>
      <AdminSidebar />
      <div className='all-products-container'>
        <h1>All Products</h1>
        <br />
        <section>
          <input placeholder='Search' type='search' onChange={handleSearch} />
          <Link to='/admin/add-product'>
            <button>+ Add Product</button>
          </Link>
        </section>
        <br />
        <table>
          <thead>
            <tr>
              {/* <th scope="col">SNo</th> */}
              <th scope='col'>ID</th>
              <th scope='col'>Name</th>
              <th scope='col'>Category</th>
              <th scope='col'>Picture</th>
              <th scope='col'>In stock</th>
              <th scope='col'>Price</th>
              <th scope='col'>Edit</th>
              <th scope='col'>Delete</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts?.map((product) => (
              <tr key={product.id}>
                {/* <td scope="row"><strong>{index + 1}</strong></td> */}
                <td>
                  <strong>{product.id}</strong>
                </td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td id='centered-cell'>
                  <img src={product.image} alt='product' />
                </td>
                <td id='centered-cell'>{product.stock}</td>
                <td id='centered-cell'>{product.price_in_2dp}</td>
                <td id='centered-cell'>
                  <Link
                    id='td-edit-icon'
                    className='btn btn-primary m-2'
                    to={`/admin/product/edit/${product.id}`}
                  >
                    <i className='fa fa-pencil' aria-hidden='true'></i>
                  </Link>
                </td>
                <td id='centered-cell'>
                  <i
                    className='fa fa-trash'
                    aria-hidden='true'
                    id='td-delete-icon'
                    onClick={() => handleDeleteProduct(product)}
                  ></i>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <AllProductsPagination
          productsPerPage={productsPerPage}
          products={products}
          paginate={paginate}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
};

export default AllProducts;
