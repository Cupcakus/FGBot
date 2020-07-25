param (
    [string]$path = "/mnt/c/Smiteworks/Fantasy Grounds/extensions"
)

Write-Output "NOTE: One Windows you might need to run the following command in WSL (Ubuntu) first:"
Write-Output "C:\> bash"
Write-Output "$ sudo apt install zip"
Write-Output "----------------------"
Write-Output ""

bash build.sh "$path"
