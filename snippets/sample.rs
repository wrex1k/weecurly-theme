struct Rectangle {
    width: i32,
    height: i32,
}

impl Rectangle {
    fn area(&self) -> i32 {
        self.width * self.height
    }

    fn resize(&mut self, w: i32, h: i32) {
        self.width = w;
        self.height = h;
    }
}

// Rust Sample
// This file demonstrates Rust features including:
// - Rust ownership and borrowing
// - Structs and enums
// - Pattern matching
// - Error handling with Result and Option
// - Traits and generics
// - Memory safety without garbage collection

fn main() {
    let mut rect = Rectangle { width: 3, height: 4 };
    println!("Area: {}", rect.area());

    let numbers = vec![1,2,3];
    for (i, n) in numbers.iter().enumerate() {
        println!("{}: {}", i, n);
    }

    let pi: f64 = 3.1415;
    let hex: i32 = 0xFF;
}
