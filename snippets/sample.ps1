# PowerShell Sample
<#
This file demonstrates PowerShell features including:
- PowerShell cmdlets and functions
- Variables and data types
- PowerShell operators and pipelines
- Error handling and debugging
- PowerShell modules and scripts
#>

# Variables
$Name = "PowerShell"
$Age = 35

# Function
function Greet($name) {
    Write-Host "Hello $name"
}

# Loops
$numbers = 1..5
foreach ($n in $numbers) {
    Write-Host "Number: $n"
}

Greet $Name
