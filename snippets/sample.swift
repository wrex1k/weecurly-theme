// Swift Sample
// This file demonstrates Swift features including:
// - Swift syntax and optionals
// - Classes and structs
// - Protocols and extensions
// - Swift closures and functions
// - Memory management (ARC)
// - SwiftUI and Combine frameworks

class Rectangle {
    var width: Int
    var height: Int

    init(width: Int, height: Int) {
        self.width = width
        self.height = height
    }

    func area() -> Int {
        return width * height
    }
}

let rect = Rectangle(width: 3, height: 4)
print("Area: \(rect.area())")

let items = ["apple", "banana"]
for (i, item) in items.enumerated() {
    print("\(i): \(item)")
}

let pi = 3.1415
let hex = 0xFF
