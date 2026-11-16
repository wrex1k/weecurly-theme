// Go Sample
// This file demonstrates Go features including:
// - Go packages and modules
// - Structs and interfaces
// - Goroutines and channels
// - Error handling
// - Go concurrency patterns
// - Go standard library

package main

import (
    "fmt"
    "math"
)

type Rectangle struct {
    width, height int
}

func (r *Rectangle) Area() int {
    return r.width * r.height
}

func main() {
    rect := Rectangle{3, 4}
    fmt.Println("Area:", rect.Area())

    nums := []int{1,2,3,4}
    for i, n := range nums {
        fmt.Println(i, n)
    }

    const Pi = 3.1415
    hex := 0x1A
    result := math.Pow(2,3)
    fmt.Println(Pi, hex, result)
}
