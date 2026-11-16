// Kotlin sample file demonstrating various language features
// This sample includes common syntax elements for syntax highlighting testing

// Package declaration
package com.example.demo

// Imports
import kotlin.math.PI
import kotlin.random.Random

// Class declaration with constructor and properties
data class Person(
    val id: Int,
    var name: String,
    private val age: Int
)

// Interface declaration
interface Vehicle {
    fun start()
    fun stop()
}

// Class implementing interface with inheritance
class Car(private val model: String) : Vehicle {
    private var running = false

    override fun start() {
        running = true
        println("$model is starting...")
    }

    override fun stop() {
        running = false
        println("$model stopped.")
    }
}

// Object declaration (Singleton)
object DatabaseConnection {
    const val URL = "jdbc:mysql://localhost:3306/db"
    fun connect() = println("Connected to database")
}

// Main function with various Kotlin features
fun main() {
    // Variable declarations
    val immutable = "Can't change this"
    var mutable = "Can change this"

       
    // String template
    println("Hello, $immutable!")
    
    // Lambda expression
    val numbers = (1..10).toList()
    numbers.filter { it % 2 == 0 }
           .map { it * 2 }
           .forEach { println(it) }
    
    // When expression
    val x = Random.nextInt(5)
    when (x) {
        0 -> println("Zero")
        1, 2 -> println("One or Two")
        else -> println("Other")
    }
    
    // Null safety demonstration
    val nullableString: String? = null
    println(nullableString?.length ?: "String was null")
    
    // Smart cast
    val something: Any = "Hello"
    if (something is String) {
        println(something.length)  // Compiler knows it's a String
    }
    
    // Function with named arguments
    fun createPerson(name: String, age: Int) = Person(Random.nextInt(), name, age)
    val person = createPerson(age = 25, name = "John")
    
    // Extension function usage
    fun String.addExclamation() = "$this!"
    println("Hello".addExclamation())
}