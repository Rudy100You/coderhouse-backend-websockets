const socket = io();

socket.on('dataUpdated', (data) => {
    productsHTML = ""
    data.products.forEach(product=>{
        productsHTML += `<div class="product">
        <h2>${product.title}</h2>
        <p>Price: ${product.price}</p>
        <p>Description:
          ${product.description}</p>
        <p>ID: ${product.id}</p>
      </div>`
    })
    document.getElementById("products").innerHTML = productsHTML;
} )

const addProdForm = document.getElementById("addProductForm");
addProdForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = {};
  for (const field of addProdForm.elements) {
    if (field.name) {
      formData[field.name] = field.value;

      if (field.name == "thumbnails")
      formData[field.name] = [...field.value.split(",")];

      if (field.name == "price" || field.name == "stock")
        formData[field.name] = parseFloat(field.value);
    }
  }

  fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  })
    .then(response => 
        response.json().then(json=>{
            if(response.status !== 200 && response.status !== 201)
                throw new Error(json.message)
            return json
        })
    )
    .then(data => {
      console.log('API response:', data);
      socket.emit('updateProductList','product submitted')
    })
    .catch(error => {
      console.log('Error:', error.message);
      swal("Error", error.message, "error");
    });

    addProdForm.reset();
});

const delProdForm = document.getElementById("deleteProductForm");
delProdForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const pid = delProdForm.elements.productID.value ?? 0

  fetch(`/api/products/${pid}`, {
    method: 'DELETE'
  })
    .then(response => 
        response.json().then(json=>{
            if(response.status !== 200 && response.status !== 201)
                throw new Error(json.message)
            return json
        })
    )
    .then(data => {
      console.log('API response:', data);
      socket.emit('updateProductList','product deleted')
    })
    .catch(error => {
      console.log('Error:', error.message);
      swal("Error", error.message, "error");
    });

    delProdForm.reset();
});

