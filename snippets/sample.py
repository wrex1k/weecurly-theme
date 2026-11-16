# Python Sample
# This file demonstrates Python features including:
# - Python syntax and data types
# - Functions and classes
# - Error handling and exceptions
# - List comprehensions and generators
# - Python modules and imports
# - Mathematical operations and algorithms

# Solve the quadratic equation ax**2 + bx + c = 0

"""asdasd"""

#? discriminant = b**2 - 4*a*c
#! If the discriminant is positive, there are two real solutions.
#. If the discriminant is zero, there is one real solution.
#* If the discriminant is negative, there are two complex solutions.
#] The solutions can be found using the formula:
#> sol1 = (-b - sqrt(discriminant)) / (2*a)
#} sol2 = (-b + sqrt(discriminant)) / (2*a)
#- The cmath module is used to handle complex numbers when the discriminant is negative.

"""Example of solving a quadratic equation using Python"""

# import complex math module
import cmath

a = 1
b = 5
c = 6

# calculate the discriminant
d = (b**2) - (4*a*c)

# find two solutions
sol1 = (-b-cmath.sqrt(d))/(2*a)
sol2 = (-b+cmath.sqrt(d))/(2*a)

print('The solution are {0} and {1}'.format(sol1,sol2))