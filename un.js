const productsContainer = document.getElementById("products");

fetch("https://dummyjson.com/products")
    .then(response => response.json())
    .then(data => {

        data.products.forEach(product => {

            const card = document.createElement("div");

            card.classList.add("product-card");

            card.innerHTML = `
                <img src="${product.thumbnail}" alt="${product.title}">

                <h2>${product.title}</h2>

                <p class="rating">
                    ⭐ ${product.rating}
                </p>

                <p class="price">
                    $${product.price}
                </p>

                <p class="availability">
                    Availability: ${product.availabilityStatus}
                </p>

                <p class="stock">
                    Stock Left: ${product.stock}
                </p>

                <p class="reviews">
                    Reviews: ${product.reviews.length}
                </p>
            `;

            productsContainer.appendChild(card);
        });

    })
    .catch(error => {
        console.log("Error:", error);

        productsContainer.innerHTML = `
            <p>Unable to load products.</p>
        `;
    });