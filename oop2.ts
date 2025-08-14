class Passenger {
    static nextId: number = 1;

    passengerId: number;
    name: string
    passportNumber: string

    constructor(name: string, passportNumber: string) {
        this.passengerId = Passenger.nextId++;
        this.name = name;
        this.passportNumber = passportNumber;
    }

    getDetails(): String {
        return `${this.passengerId}-${this.name}-${this.passportNumber}`
    }
}

abstract class Flight {
    flightNumber: string;   // Số hiệu chuyến bay, duy nhất
    origin: string;         // Nơi đi
    destination: string;    // Nơi đến
    departureTime: Date;    // Thời gian khởi hành
    capacity: number;       // Sức chứa
    bookedSeats: number;    // Số ghế đã đặt

    constructor(flightNumber: string, origin: string, destination: string, departureTime: Date, capacity: number) {
        this.flightNumber = flightNumber;
        this.origin = origin;
        this.destination = destination;
        this.departureTime = departureTime;
        this.capacity = capacity;
        this.bookedSeats = 0;
    }

    isFull(): boolean {
        return this.bookedSeats >= this.capacity;
    }

    bookSeat(): boolean {
        if (!this.isFull()) {
            this.bookedSeats += 1;
            return true; // Đặt ghế thành công
        } else {
            return false; // Chuyến bay đã đầy
        }
    }

    getAvailableSeats(): number {
        return this.capacity - this.bookedSeats;
    }

    getFlightDetails(): string {
        return `Flight ${this.flightNumber}: ${this.origin} -> ${this.destination}, Departure: ${this.departureTime.toLocaleString()}, Seats booked: ${this.bookedSeats}/${this.capacity}`;
    }

    abstract calculateBaggageFee(weight: number): number;
}

class DomesticFlight extends Flight {
    constructor(flightNumber: string, origin: string, destination: string, departureTime: Date, capacity: number) {
        super(flightNumber, origin, destination, departureTime, capacity);
    }

    // Tính phí hành lý nội địa: 50,000 VND/kg
    calculateBaggageFee(weight: number): number {
        const feePerKg = 50000; // VND
        return weight * feePerKg;
    }
}

// Lớp con cho chuyến bay quốc tế
class InternationalFlight extends Flight {
    constructor(flightNumber: string, origin: string, destination: string, departureTime: Date, capacity: number) {
        super(flightNumber, origin, destination, departureTime, capacity);
    }

    // Tính phí hành lý quốc tế: 10 USD/kg
    calculateBaggageFee(weight: number): number {
        const feePerKg = 10; // USD
        return weight * feePerKg;
    }
}

class Booking {
    static nextId: number = 1;

    bookingId: number // Mã đặt vé(số, tự tăng).
    passenger: Passenger // Hành khách đặt vé(Passenger).
    flight: Flight // Chuyến bay được đặt(Flight).
    numberOfTickets: number // Số lượng vé(số).
    totalCost: Number // Tổng chi phí(số).

    constructor(passenger: Passenger, flight: Flight, numberOfTickets: number, totalCost: number) {
        this.bookingId = Booking.nextId++;
        this.passenger = passenger;
        this.flight = flight;
        this.numberOfTickets = numberOfTickets;
        this.totalCost = totalCost;
    }

    getBookingDetails(): string {
        return `${this.bookingId}-${this.passenger}-${this.flight}-${this.numberOfTickets}-${this.totalCost}`
    }
}

class GenericRepository<T> {
    private items: T[] = [];

    add(item: T): void {
        this.items.push(item);
    }

    getAll(): T[] {
        return this.items;
    }

    find(predicate: (item: T) => boolean): T | undefined {
        return this.items.find(predicate);
    }

    findIndex(predicate: (item: T) => boolean): number {
        return this.items.findIndex(predicate);
    }

    remove(predicate: (item: T) => boolean): void {
        this.items = this.items.filter(item => !predicate(item));
    }
}

class AirlineManager {
    private flightRepo = new GenericRepository<Flight>();
    private passengerRepo = new GenericRepository<Passenger>();
    private bookingRepo = new GenericRepository<Booking>();

    addFlight(flight: Flight): void {
        this.flightRepo.add(flight);
        alert("✅ Đã thêm chuyến bay!");
    }

    addPassenger(name: string, passportNumber: string): void {
        const passenger = new Passenger(name, passportNumber);
        this.passengerRepo.add(passenger);
        alert("✅ Đã thêm hành khách!");
    }

    createBooking(passengerId: number, flightNumber: string, numberOfTickets: number): Booking | null {
        const passenger = this.passengerRepo.find(p => p.passengerId === passengerId);
        const flight = this.flightRepo.find(f => f.flightNumber === flightNumber);

        if (!passenger || !flight || flight.bookedSeats + numberOfTickets > flight.capacity) {
            alert("Không thể đặt vé!");
            return null;
        }

        for (let i = 0; i < numberOfTickets; i++) {
            flight.bookSeat();
        }

        const totalCost = numberOfTickets * 100; 
        const booking = new Booking(passenger, flight, numberOfTickets, totalCost);
        this.bookingRepo.add(booking);
        alert("Đặt vé thành công!");
        return booking;
    }

    cancelBooking(bookingId: number): void {
        const booking = this.bookingRepo.find(b => b.bookingId === bookingId);
        if (booking) {
            booking.flight.bookedSeats -= booking.numberOfTickets;
            this.bookingRepo.remove(b => b.bookingId === bookingId);
            alert("Đã hủy đặt vé!");
        } else {
            alert("Không tìm thấy booking!");
        }
    }

    listAvailableFlights(origin: string, destination: string): void {
        const flights = this.flightRepo.getAll().filter(f => f.origin === origin && f.destination === destination && !f.isFull());
        if (flights.length === 0) {
            alert("Không có chuyến bay phù hợp!");
        } else {
            alert("Danh sách chuyến bay còn trống:\n" + flights.map(f => f.getFlightDetails()).join("\n"));
        }
    }

    listBookingsByPassenger(passengerId: number): void {
        const bookings = this.bookingRepo.getAll().filter(b => b.passenger.passengerId === passengerId);
        if (bookings.length === 0) {
            alert(" Hành khách chưa đặt vé!");
        } else {
            alert("Danh sách vé:\n" + bookings.map(b => b.getBookingDetails()).join("\n"));
        }
    }

    calculateTotalRevenue(): void {
        const total = this.bookingRepo.getAll().reduce((sum, b) => sum + Number(b.totalCost), 0);
        alert(`Tổng doanh thu: ${total}`);
    }

    countFlightsByType(): void {
        const flights = this.flightRepo.getAll();
        const domesticCount = flights.filter(f => f instanceof DomesticFlight).length;
        const internationalCount = flights.filter(f => f instanceof InternationalFlight).length;
        alert(`Nội địa: ${domesticCount}, Quốc tế: ${internationalCount}`);
    }

    updateFlightTime(flightNumber: string, newDepartureTime: Date): void {
        const flight = this.flightRepo.find(f => f.flightNumber === flightNumber);
        if (flight) {
            flight.departureTime = newDepartureTime;
            alert(" Đã cập nhật giờ bay!");
        } else {
            alert("Không tìm thấy chuyến bay!");
        }
    }

    getFlightPassengerList(flightNumber: string): void {
        const bookings = this.bookingRepo.getAll().filter(b => b.flight.flightNumber === flightNumber);
        const passengers = bookings.map(b => b.passenger.getDetails());
        if (passengers.length === 0) {
            alert("Chưa có hành khách!");
        } else {
            alert("Danh sách hành khách:\n" + passengers.join("\n"));
        }
    }
}

const manager = new AirlineManager();

(async function mainMenu() {
    let running = true;
    while (running) {
        const choice = Number(prompt(`
===== QUẢN LÝ HÃNG HÀNG KHÔNG =====
1. Thêm hành khách mới
2. Thêm chuyến bay mới
3. Tạo giao dịch đặt vé
4. Hủy giao dịch đặt vé
5. Hiển thị chuyến bay còn trống
6. Hiển thị vé đã đặt của một hành khách
7. Tính tổng doanh thu
8. Đếm số lượng chuyến bay nội địa/quốc tế
9. Cập nhật giờ bay
10. Xem danh sách hành khách của một chuyến bay
0. Thoát chương trình
==================================
Nhập lựa chọn của bạn:`));

        switch (choice) {
            case 1: {
                const name = prompt("Nhập tên hành khách:");
                const passport = prompt("Nhập số hộ chiếu:");
                if (name && passport) {
                    manager.addPassenger(name, passport);
                }
                break;
            }

            case 2: {
                const type = prompt("Loại chuyến bay (domestic/international):")?.toLowerCase();
                const flightNumber = prompt("Số hiệu chuyến bay:");
                const origin = prompt("Nơi đi:");
                const destination = prompt("Nơi đến:");
                const timeStr = prompt("Thời gian khởi hành (YYYY-MM-DD HH:mm):");
                const capacity = Number(prompt("Sức chứa:"));
                if (flightNumber && origin && destination && timeStr && capacity > 0) {
                    const departureTime = new Date(timeStr);
                    let flight: Flight;
                    if (type === "domestic") {
                        flight = new DomesticFlight(flightNumber, origin, destination, departureTime, capacity);
                    } else {
                        flight = new InternationalFlight(flightNumber, origin, destination, departureTime, capacity);
                    }
                    manager.addFlight(flight);
                }
                break;
            }

            case 3: {
                const passengerId = Number(prompt("Nhập ID hành khách:"));
                const flightNumber = prompt("Nhập số hiệu chuyến bay:");
                const tickets = Number(prompt("Nhập số lượng vé:"));
                manager.createBooking(passengerId, flightNumber!, tickets);
                break;
            }

            case 4: {
                const bookingId = Number(prompt("Nhập ID booking cần hủy:"));
                manager.cancelBooking(bookingId);
                break;
            }

            case 5: {
                const origin = prompt("Nhập nơi đi:");
                const destination = prompt("Nhập nơi đến:");
                if (origin && destination) {
                    manager.listAvailableFlights(origin, destination);
                }
                break;
            }

            case 6: {
                const passengerId = Number(prompt("Nhập ID hành khách:"));
                manager.listBookingsByPassenger(passengerId);
                break;
            }

            case 7: {
                manager.calculateTotalRevenue();
                break;
            }

            case 8: {
                manager.countFlightsByType();
                break;
            }

            case 9: {
                const flightNumber = prompt("Nhập số hiệu chuyến bay:");
                const newTimeStr = prompt("Nhập giờ bay mới (YYYY-MM-DD HH:mm):");
                if (flightNumber && newTimeStr) {
                    manager.updateFlightTime(flightNumber, new Date(newTimeStr));
                }
                break;
            }

            case 10: {
                const flightNumber = prompt("Nhập số hiệu chuyến bay:");
                if (flightNumber) {
                    manager.getFlightPassengerList(flightNumber);
                }
                break;
            }

            case 0: {
                alert("👋 Thoát chương trình!");
                running = false;
                break;
            }

            default:
                alert("❌ Lựa chọn không hợp lệ!");
        }
    }
})();
