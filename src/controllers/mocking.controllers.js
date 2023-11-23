const generateMockProducts = () => {
    const mockProducts = [];

    for (let i = 1; i <= 100; i++) {
        const mockProduct = {
            code: `P00${i}`,
            title: `Sample Product ${i}`,
            description: `Description for Product ${i}`,
            price: (Math.random() * 100).toFixed(2),
            thumbnail: `./img/product${i}.jpg`,
            stock: Math.floor(Math.random() * 100),
            id: i,
        };

        mockProducts.push(mockProduct);
    }
    return mockProducts;
};

module.exports = {
    generateMockProducts,
};
