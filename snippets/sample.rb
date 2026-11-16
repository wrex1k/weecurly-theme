# Ruby Sample
# This file demonstrates Ruby features including:
# - Ruby syntax and blocks
# - Classes and modules
# - Metaprogramming
# - Ruby gems and libraries
# - Functional programming features
# - Ruby idioms and conventions

class Rectangle
    attr_accessor :width, :height

    def initialize(width, height)
        @width = width
        @height = height
    end

    def area
        @width * @height
    end
end

rect = Rectangle.new(3,4)
puts "Area: #{rect.area}"

items = ["apple", "banana"]
items.each_with_index { |item, i| puts "#{i}: #{item}" }

pi = 3.1415
hex = 0xFF
