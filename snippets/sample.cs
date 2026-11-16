/*
    C# Sample
    This file demonstrates modern C# features including:
    - Classes and objects
    - Properties and methods
    - Collections (List)
    - String interpolation
    - Namespaces
    - Access modifiers
    - Constants and enums
*/

using System;
using System.Collections.Generic;

namespace DemoNamespace { // Namespace declaration
    public class Rectangle {
        private int width, height;

        public Rectangle(int w, int h) {
            width = w;
            height = h;
        }

        public int Area() => width * height;

        public void Resize(int w, int h) {
            width = w;
            height = h;
        }
    }

    class Program {
        static void Main(string[] args) {
            Rectangle rect = new Rectangle(3,4);
            Console.WriteLine($"Area: {rect.Area()}");

            List<string> items = new List<string> { "apple", "banana" };
            foreach(var item in items) {
                Console.WriteLine(item);
            }

            int hex = 0xFF;
            const double pi = 3.1415;
        }
    }
}
