# Compiler and flags
CC = gcc
CFLAGS = -Wall -Wextra -O2

# Output executable
TARGET = myapp

# Source files
SRCS = main.c utils.c
OBJS = $(SRCS:.c=.o)

# Default target: build the project
all: $(TARGET) 

# Link object files into executable 
$(TARGET): $(OBJS) # Linking step depends on object files
	@echo "Linking $(TARGET)"
	$(CC) $(CFLAGS) -o $(TARGET) $(OBJS) 

# Compile source files into object files
%.o: %.c
	@echo "Compiling $<"
	$(CC) $(CFLAGS) -c $< -o $@

# Clean build files
clean:
	@echo "Cleaning project"
	rm -f $(TARGET) $(OBJS)

# Run the program
run: $(TARGET)
	@echo "Running $(TARGET)" 
	./$(TARGET)

# Run tests (if you have test cases)
test: run

.PHONY: all clean run test
