class Customer {
    static nextId: number = 1;

    id: number;
    name: string;
    email: string;
    shippingAddress: string;

    constructor(name: string, email: string, shippingAddress: string) {
        this.id = Customer.nextId++;
        this.name = name;
        this.email = email;
        this.shippingAddress = shippingAddress;
    }

    getDetails(): string {
        return `Customer ID: ${this.id}\nName: ${this.name}\nEmail: ${this.email}\nAddress: ${this.shippingAddress}`;
    }
}

abstract class Product {
    static nextId: number = 1;

    id: number;
    name: string;
    price: number;
    stock: number;

    constructor(name: string, price: number, stock: number) {
        this.id = Product.nextId++;
        this.name = name;
        this.price = price;
        this.stock = stock;
    }

    sell(quantity: number): void {
        if (quantity <= 0 || !Number.isInteger(quantity)) {
            alert(`Số lượng bán không hợp lệ!`);
            return;
        }
        if (quantity > this.stock) {
            alert(`Số lượng bán vượt quá tồn kho!`);
            return;
        }
        this.stock -= quantity;
    }

    restock(quantity: number): void {
        if (quantity <= 0 || !Number.isInteger(quantity)) {
            alert(`Số lượng nhập không hợp lệ!`);
            return;
        }
        this.stock += quantity;
    }

    abstract getProductInfo(): string;
    abstract getShippingCost(distance: number): number;
    abstract getCategory(): string;
}

class ElectronicsProduct extends Product {
    warrantyPeriod: number;

    constructor(name: string, price: number, stock: number, warrantyPeriod: number) {
        super(name, price, stock);
        this.warrantyPeriod = warrantyPeriod;
    }

    getProductInfo(): string {
        return `Sản phẩm điện tử: ${this.name} | Giá: ${this.price.toLocaleString()} VND | Tồn kho: ${this.stock} | Bảo hành: ${this.warrantyPeriod} tháng`;
    }

    getShippingCost(distance: number): number {
        return 50000;
    }

    getCategory(): string {
        return "Electronics";
    }
}

class ClothingProduct extends Product {
    size: string;
    color: string;

    constructor(name: string, price: number, stock: number, size: string, color: string) {
        super(name, price, stock);
        this.size = size;
        this.color = color;
    }

    getProductInfo(): string {
        return `Quần áo: ${this.name} | Giá: ${this.price.toLocaleString()} VND | Tồn kho: ${this.stock} | Size: ${this.size} | Màu: ${this.color}`;
    }

    getShippingCost(distance: number): number {
        return 25000;
    }

    getCategory(): string {
        return "Clothing";
    }
}

class Order {
    static nextId: number = 1;

    orderId: number;
    customer: Customer;
    products: {
        product: Product;
        quantity: number
    }[];
    totalAmount: number;

    constructor(customer: Customer, products: { product: Product, quantity: number }[]) {
        this.orderId = Order.nextId++;
        this.customer = customer;
        this.products = products;
        this.totalAmount = this.calculateTotal();

    }

    calculateTotal(): number {
        return this.products.reduce((sum, item) => {
            return sum + (item.product.price * item.quantity);
        }, 0);
    }

    getDetails(): string {
        let details = `Đơn hàng ID: ${this.orderId}\n`;
        details += `Khách hàng: ${this.customer.name} (ID: ${this.customer.id})\n`;
        details += `Email: ${this.customer.email}\n`;
        details += `Địa chỉ: ${this.customer.shippingAddress}\n`;
        details += `\nDanh sách sản phẩm:\n`;

        this.products.forEach((item, index) => {
            details += `${index + 1}. ${item.product.name} - SL: ${item.quantity} - Giá: ${item.product.price.toLocaleString()} VND\n`;
        });

        details += `\nTổng tiền: ${this.totalAmount.toLocaleString()} VND`;
        return details;
    }
}

class Store {
    products: Product[];
    customers: Customer[];
    orders: Order[];

    constructor() {
        this.products = [];
        this.customers = [];
        this.orders = [];
    }

    addProduct(product: Product): void {
        this.products.push(product);
    }

    addCustomer(name: string, email: string, address: string): void {
        const customer = new Customer(name, email, address);
        this.customers.push(customer);
    }

    createOrder(customerId: number, productQuantities: { productId: number, quantity: number }[]): Order | null {
        const customer = this.findEntityById(this.customers, customerId);
        if (!customer) {
            alert(`Khách hàng ID customerId không tồn tại.`);
            return null;
        }

        const items: { product: Product; quantity: number }[] = [];
        for (const pq of productQuantities) {
            const product = this.findEntityById(this.products, pq.productId);
            if (product && product.stock >= pq.quantity) {
                product.sell(pq.quantity);
                items.push({ product, quantity: pq.quantity });
            } else {
                alert(`Sản phẩm ID ${pq.productId} không có sẵn hoặc số lượng không đủ.`);
                return null;
            }
        }

        const order = new Order(customer, items);
        this.orders.push(order);
        alert(`Đơn hàng ID ${order.orderId} đã tạo thành công cho khách hàng ${customer.name}. Tổng tiền: ${order.totalAmount}`);
        return order;
    }

    cancelOrder(orderId: number): void {
        const index = this.orders.findIndex(o => o.orderId === orderId);
        if (index !== -1) {
            const order = this.orders[index];
            if (!order) {
                alert("lỗi không thể huỷ đơn");
                return;
            }
            order.products.forEach(item => item.product.restock(item.quantity));
            this.orders.splice(index, 1);
        } else {
            alert("không tìm thấy id")
        }
    }

    listAvailableProducts(): void {
        const available = this.products.filter(p => p.stock > 0);
        if (available.length === 0) {
            alert("Không còn sản phẩm nào trong kho.");
        } else {
            let message = "Sản phẩm còn hàng:\n";
            available.forEach(p => message += `${p.getProductInfo()}\n`);
            alert(message);
        }
    }

    listCustomerOrders(customerId: number): void {
        const orders = this.orders.filter(o => o.customer.id === customerId);
        if (orders.length === 0) {
            alert(`Khách hàng ID ${customerId} chưa có đơn hàng.`);
        } else {
            let message = `Đơn hàng của khách hàng ID ${customerId}:\n\n`;
            orders.forEach(o => message += `${o.getDetails()}\n\n`);
            alert(message);
        }
    }


    calculateTotalRevenue(): number {
        const total = this.orders.reduce((sum, o) => sum + o.totalAmount, 0);
        alert(`Tổng doanh thu: ${total.toLocaleString()} VND`);
        return total;
    }

    countProductsByCategory(): void {
        const countMap = this.products.reduce((map: Record<string, number>, p) => {
            const cat = p.getCategory();
            map[cat] = (map[cat] || 0) + 1;
            return map;
        }, {});
        let message = "Số lượng sản phẩm theo danh mục:\n";
        for (const cat in countMap) {
            message += `${cat}: ${countMap[cat]}\n`;
        }
        alert(message);
    }

    updateProductStock(productId: number, newStock: number): void {
        const index = this.products.findIndex(p => p.id === productId);
        if (index !== -1) {
            const product = this.products[index];
            if (product) {
                product.stock = newStock;
            }
            alert(`Cập nhật tồn kho sản phẩm ID ${productId} thành công. Stock mới: ${newStock}`);
        } else {
            alert(`Không tìm thấy sản phẩm ID ${productId}.`);
        }
    }

    findEntityById<T extends { id: number }>(collection: T[], id: number): T | undefined {
        return collection.find(item => item.id === id);
    }
}


// let c1 = new Customer("Nguyễn Văn A", "a@example.com", "123 Đường ABC");
// let p1 = new ElectronicsProduct("Laptop Dell", 15000000, 5, 24);
// let p2 = new ClothingProduct("Áo Thun", 200000, 10, "L", "Đen");

// let order1 = new Order(c1, [
//     { product: p1, quantity: 1 },
//     { product: p2, quantity: 3 }
// ]);

// console.log(order1.getDetails());

const store = new Store();
// case
let flag = true;
while (flag) {
    let choice = Number(prompt(`1. Thêm khách hàng mới.
2. Thêm sản phẩm mới.
3. Tạo đơn hàng mới.
4. Hủy đơn hàng (hoàn trả số lượng sản phẩm về kho).
5. Hiển thị danh sách sản phẩm còn hàng trong kho.
6. Hiển thị danh sách đơn hàng của một khách hàng.
7. Tính và hiển thị tổng doanh thu của cửa hàng.
8. Thống kê sản phẩm theo danh mục.
9. Cập nhật tồn kho cho một sản phẩm.
10. Tìm kiếm và hiển thị thông tin bằng ID .
11. Xem thông tin chi tiết (bảo hành/size, màu) của một sản phẩm.
12. Thoát chương trình.`));

    switch (choice) {
        case 1:
            let name = prompt("Tên khách hàng:");
            let email = prompt("Email:");
            let address = prompt("Địa chỉ:");
            if (name && email && address) {
                store.addCustomer(name, email, address)
                alert("Thêm khách hàng thành công!");
            }
            break;

        case 2:
            const type = Number(prompt("Chọn loại sản phẩm: 1. Đồ điện tử  2. Quần áo"));
            const pname = prompt("Tên sản phẩm:");
            const pprice = Number(prompt("Giá:"));
            const pstock = Number(prompt("Số lượng tồn:"));
            if (type === 1) {
                const warranty = Number(prompt("Bảo hành (tháng):"));
                store.addProduct(new ElectronicsProduct(pname!, pprice, pstock, warranty));
            } else if (type === 2) {
                const size = prompt("Size:");
                const color = prompt("Màu:");
                store.addProduct(new ClothingProduct(pname!, pprice, pstock, size!, color!));
            } else {
                alert("Loại sản phẩm không hợp lệ!");
            }
            alert("Thêm sản phẩm thành công!");
            break;
        case 3:
            const customerId = Number(prompt("Nhập ID khách hàng:"));
            const numProducts = Number(prompt("Số lượng sản phẩm trong đơn:"));
            const productQuantities: { productId: number; quantity: number }[] = [];

            for (let i = 0; i < numProducts; i++) {
                const pid = Number(prompt(`Nhập ID sản phẩm thứ ${i + 1}:`));
                const qty = Number(prompt("Nhập số lượng:"));
                productQuantities.push({ productId: pid, quantity: qty });
            }

            const order = store.createOrder(customerId, productQuantities);
            if (order) alert("Tạo đơn hàng thành công!");
            else alert("Tạo đơn hàng thất bại. Kiểm tra khách hàng hoặc sản phẩm.");
            break;
        case 4:
            const cancelId = Number(prompt("Nhập ID đơn hàng muốn hủy:"));
            store.cancelOrder(cancelId);
            break;
        case 5:
            store.listAvailableProducts();
            break;
        case 6:
            const cid = Number(prompt("Nhập ID khách hàng:"));
            store.listCustomerOrders(cid);
            break;
        case 7:
            store.calculateTotalRevenue();
            break;
        case 8:
            store.countProductsByCategory();
            break;
        case 9:
            const upId = Number(prompt("Nhập ID sản phẩm:"));
            const newStock = Number(prompt("Nhập số lượng tồn mới:"));
            store.updateProductStock(upId, newStock);
            break;
        case 10:
            const searchType = Number(prompt("Tìm kiếm: 1. Khách hàng 2. Sản phẩm"));
            const searchId = Number(prompt("Nhập ID cần tìm:"));
            if (searchType === 1) {
                const customer = store.findEntityById(store.customers, searchId);
                if (customer) alert(customer.getDetails());
                else alert("Không tìm thấy khách hàng.");
            } else if (searchType === 2) {
                const product = store.findEntityById(store.products, searchId);
                if (product) alert(product.getProductInfo());
                else alert("Không tìm thấy sản phẩm.");
            } else {
                alert("Lựa chọn không hợp lệ!");
            }
            break;
        case 11:
            const infoId = Number(prompt("Nhập ID sản phẩm:"));
            const prod = store.findEntityById(store.products, infoId);
            if (prod) alert(prod.getProductInfo());
            else alert("Không tìm thấy sản phẩm.");
            break;
        case 12:
            alert("thank you");
            flag = false;
            break;
        default: 
            alert("kho hop lệ");
    }
}