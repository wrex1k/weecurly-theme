<?php
// PHP Sample
// This file demonstrates PHP features including:
// - PHP syntax and variables
// - Functions and classes
// - Arrays and associative arrays
// - Object-oriented programming
// - PHP built-in functions
// - Web development features
class Rectangle {
    private $width;
    private $height;

    function __construct($w, $h) {
        $this->width = $w;
        $this->height = $h;
    }

    function area() {
        return $this->width * $this->height;
    }
}

$rect = new Rectangle(3,4);
echo "Area: " . $rect->area() . "\n";

$items = ["apple", "banana"];
foreach ($items as $item) {
    echo $item . "\n";
}

$pi = 3.1415;
$hex = 0xFF;
?>